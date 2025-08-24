import React, { useState, useEffect } from 'react';
import './styles/fonts.css';
import './styles/app.css';
import './styles/chat.css';
import './styles/design-tokens.css'; // Phase 2: Design tokens from static site
import './styles/mobile-optimization.css'; // Phase 3: Mobile optimization
import './styles/static-site-theme.css'; // Phase 3: Critical fix - Static site theme override
import Components from './components';
import AskAlexPage from './AskAlexPage';
import { performanceMonitor } from './services/performanceMonitor';
import AnimatedIntro from './pages/AnimatedIntro'; // Phase 2: Animated intro
import AskAlex from './pages/AskAlex'; // Phase 2: New Ask Alex implementation
import TutorialOverlay from './components/TutorialOverlay'; // Phase 3: Tutorial overlay

// Error Boundary for production
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error:', error, errorInfo);
    performanceMonitor.recordError(error, 'React ErrorBoundary');
    
    // Send to error tracking service
    if (window.Sentry) {
      window.Sentry.captureException(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-celeste-dark-primary flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-celeste-text-primary mb-4">
              Something went wrong
            </h1>
            <p className="text-celeste-text-muted mb-6">
              We're fixing this issue. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-celeste-brand-primary text-white rounded-lg hover:bg-celeste-brand-hover"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen bg-celeste-dark-primary flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-celeste-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-celeste-text-muted">Loading CelesteOS...</p>
    </div>
  </div>
);

function App() {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState('GOOD');
  const [currentPage, setCurrentPage] = useState('chat'); // 'chat' or 'askAlex'
  const [showIntro, setShowIntro] = useState(false); // Phase 2: Animated intro
  const [showAskAlex, setShowAskAlex] = useState(false); // Phase 2: Ask Alex modal
  const [showTutorial, setShowTutorial] = useState(false); // Phase 3: Tutorial overlay

  // Check for saved auth and intro state
  useEffect(() => {
    // Phase 2: Check if user has seen intro
    const hasSeenIntro = localStorage.getItem('hasSeenIntro');
    if (!hasSeenIntro && !user) {
      setShowIntro(true);
    }
    
    // Phase 3: Check if user has completed tutorial
    const hasCompletedTutorial = localStorage.getItem('hasCompletedTutorial');
    if (!hasCompletedTutorial && user) {
      // Show tutorial after user logs in for the first time
      setTimeout(() => setShowTutorial(true), 1000);
    }
    
    const savedAuth = localStorage.getItem('celesteos_auth');
    if (savedAuth) {
      try {
        const { user: savedUser, token } = JSON.parse(savedAuth);
        if (savedUser && token) {
          setUser(savedUser);
          setAccessToken(token);
          try {
            performanceMonitor.recordActiveUser(savedUser.id);
          } catch (e) {
            console.log('Performance monitor not available');
          }
        }
      } catch (error) {
        console.error('Failed to restore auth:', error);
        localStorage.removeItem('celesteos_auth');
      }
    }
    setIsLoading(false);
  }, []);

  // Monitor system health
  useEffect(() => {
    const checkHealth = setInterval(() => {
      try {
        const report = performanceMonitor.getHealthReport();
        setSystemHealth(report.health);
        
        if (report.warnings.length > 0) {
          console.warn('System warnings:', report.warnings);
        }
        
        // Log metrics in dev
        if (process.env.NODE_ENV === 'development') {
          console.log('Health Report:', report);
        }
      } catch (e) {
        console.log('Performance monitor not available');
        setSystemHealth('GOOD'); // Default to good if monitor unavailable
      }
    }, 30000); // Check every 30s

    return () => clearInterval(checkHealth);
  }, []);

  // Warn on high memory usage
  useEffect(() => {
    if (performance.memory && performance.memory.usedJSHeapSize > 100 * 1048576) {
      console.warn('⚠️ High memory usage detected. Consider refreshing the page.');
    }
  }, []);

  const handleLogin = (userData, token) => {
    setUser(userData);
    setAccessToken(token);
    
    // Save to localStorage
    localStorage.setItem('celesteos_auth', JSON.stringify({
      user: userData,
      token: token
    }));
    
    // Track user
    try {
      performanceMonitor.recordActiveUser(userData.id);
    } catch (e) {
      console.log('Performance monitor not available');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('celesteos_auth');
    localStorage.removeItem(`celesteos_conversations_${user?.id}`);
    sessionStorage.clear();
    
    // Clear caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('celesteos')) {
            caches.delete(name);
          }
        });
      });
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <div className="App">
        {/* Phase 2: Animated Intro */}
        {showIntro && (
          <AnimatedIntro
            isVisible={showIntro}
            onComplete={() => {
              setShowIntro(false);
              localStorage.setItem('hasSeenIntro', 'true');
            }}
            isDarkMode={false}
          />
        )}
        
        {/* Phase 2: Ask Alex Modal */}
        {showAskAlex && (
          <AskAlex
            isDarkMode={false}
            onClose={() => setShowAskAlex(false)}
          />
        )}
        
        {/* Phase 3: Tutorial Overlay */}
        {showTutorial && user && (
          <TutorialOverlay
            isVisible={showTutorial}
            onComplete={() => setShowTutorial(false)}
            isDarkMode={false}
          />
        )}
        
        {!showIntro && !user ? (
          <Components.AuthScreen onLogin={handleLogin} />
        ) : !showIntro && user ? (
          currentPage === 'askAlex' ? (
            <AskAlexPage 
              user={user}
              onBack={() => setCurrentPage('chat')}
            />
          ) : (
            <Components.ChatInterface 
              user={user} 
              onLogout={handleLogout}
              onAskAlex={() => setShowAskAlex(true)} // Phase 2: Use new Ask Alex
            />
          )
        ) : null}
      </div>
    </ErrorBoundary>
  );
}

export default App;
