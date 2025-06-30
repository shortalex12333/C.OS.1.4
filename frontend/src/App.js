import React, { useState, useEffect, Suspense, lazy } from 'react';
import './styles/fonts.css';
import './styles/app.css';
import './styles/chat.css';
import { performanceMonitor } from './services/performanceMonitor';

// Lazy load components for better initial load
const Components = lazy(() => import('./components'));

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

  // Check for saved auth
  useEffect(() => {
    const savedAuth = localStorage.getItem('celesteos_auth');
    if (savedAuth) {
      try {
        const { user: savedUser, token } = JSON.parse(savedAuth);
        if (savedUser && token) {
          setUser(savedUser);
          setAccessToken(token);
          performanceMonitor.recordActiveUser(savedUser.id);
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
      const report = performanceMonitor.getHealthReport();
      setSystemHealth(report.health);
      
      if (report.warnings.length > 0) {
        console.warn('System warnings:', report.warnings);
      }
      
      // Log metrics in dev
      if (process.env.NODE_ENV === 'development') {
        console.log('Health Report:', report);
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
    performanceMonitor.recordActiveUser(userData.id);
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
        {/* System Health Warning */}
        {systemHealth === 'DEGRADED' && (
          <div className="fixed top-0 left-0 right-0 bg-celeste-system-warning text-black text-center py-2 z-50">
            <p className="text-sm font-medium">
              System under heavy load. Response times may be slower.
            </p>
          </div>
        )}
        
        <Suspense fallback={<LoadingScreen />}>
          {!user ? (
            <Components.AuthScreen onLogin={handleLogin} />
          ) : (
            <Components.ChatInterface 
              user={user} 
              onLogout={handleLogout}
            />
          )}
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}

export default App;
