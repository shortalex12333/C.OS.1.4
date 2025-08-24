import React, { useState, useEffect } from 'react';
import './styles/fonts.css';
import './styles/app.css';
import './styles/chat.css';
import Components from './components';
import AskAlexPage from './AskAlexPage';
import { performanceMonitor } from './services/performanceMonitor';

// V2 Components
import V2Interface from './v2/V2Interface';
import TestSuiteUI from './v2/tests/ComprehensiveTestSuite';

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

// Feature Flag Configuration
const FEATURE_FLAGS = {
  USE_V2_INTERFACE: localStorage.getItem('use_v2') === 'true' || 
                    new URLSearchParams(window.location.search).get('v2') === 'true',
  SHOW_TEST_SUITE: new URLSearchParams(window.location.search).get('test') === 'true',
  AUTO_DARK_MODE: new URLSearchParams(window.location.search).get('dark') === 'true',
  ENABLE_ANALYTICS: true,
  ROLLOUT_PERCENTAGE: 25 // 25% of users see V2 by default
};

// A/B Testing Logic
function shouldShowV2Interface(userId) {
  // Manual override via localStorage or URL param
  if (FEATURE_FLAGS.USE_V2_INTERFACE) return true;
  
  // Percentage-based rollout
  if (!userId) return false;
  
  // Consistent hashing to ensure same user gets same version
  const hash = userId.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  
  return (hash % 100) < FEATURE_FLAGS.ROLLOUT_PERCENTAGE;
}

function App() {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState('GOOD');
  const [currentPage, setCurrentPage] = useState('chat'); // 'chat' or 'askAlex'
  const [interfaceVersion, setInterfaceVersion] = useState('v1'); // 'v1' or 'v2'
  const [isDarkMode, setIsDarkMode] = useState(FEATURE_FLAGS.AUTO_DARK_MODE);
  const [isMobile, setIsMobile] = useState(false);

  // Check for saved auth and determine interface version
  useEffect(() => {
    const savedAuth = localStorage.getItem('celesteos_auth');
    let savedUser = null;
    
    if (savedAuth) {
      try {
        const { user: savedUserData, token } = JSON.parse(savedAuth);
        if (savedUserData && token) {
          savedUser = savedUserData;
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
    
    // Determine interface version
    const useV2 = shouldShowV2Interface(savedUser?.id);
    setInterfaceVersion(useV2 ? 'v2' : 'v1');
    
    if (useV2) {
      console.log('🚀 Loading V2 Interface for user:', savedUser?.id || 'guest');
    }
    
    setIsLoading(false);
  }, []);

  // Monitor system health
  useEffect(() => {
    const checkHealth = setInterval(() => {
      try {
        const report = performanceMonitor.getHealthReport();
        setSystemHealth(report.status);
      } catch (error) {
        setSystemHealth('DEGRADED');
      }
    }, 30000);

    return () => clearInterval(checkHealth);
  }, []);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Setup global version switcher
  useEffect(() => {
    window.switchToV2 = () => {
      localStorage.setItem('use_v2', 'true');
      setInterfaceVersion('v2');
      console.log('🔄 Switched to V2 Interface');
    };
    
    window.switchToV1 = () => {
      localStorage.setItem('use_v2', 'false');
      setInterfaceVersion('v1');
      console.log('🔄 Switched to V1 Interface');
    };
    
    window.toggleVersion = () => {
      const newVersion = interfaceVersion === 'v1' ? 'v2' : 'v1';
      localStorage.setItem('use_v2', newVersion === 'v2');
      setInterfaceVersion(newVersion);
      console.log(`🔄 Toggled to ${newVersion.toUpperCase()} Interface`);
    };

    // Analytics tracking
    if (FEATURE_FLAGS.ENABLE_ANALYTICS) {
      window.analytics = window.analytics || {};
      window.analytics.track = (event, properties) => {
        console.log(`[Analytics] ${event}:`, properties);
        // Send to actual analytics service here
      };
    }

    return () => {
      delete window.switchToV2;
      delete window.switchToV1;
      delete window.toggleVersion;
    };
  }, [interfaceVersion]);

  // Handle login
  const handleLogin = (username, password) => {
    const newUser = { id: username, name: username };
    setUser(newUser);
    
    // Save auth
    const authData = { user: newUser, token: 'demo_token' };
    localStorage.setItem('celesteos_auth', JSON.stringify(authData));
    
    // Check if new user should get V2
    const useV2 = shouldShowV2Interface(newUser.id);
    setInterfaceVersion(useV2 ? 'v2' : 'v1');
    
    console.log(`✅ User ${username} logged in with ${useV2 ? 'V2' : 'V1'} interface`);
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('celesteos_auth');
    localStorage.removeItem('use_v2');
    setInterfaceVersion('v1');
    console.log('👋 User logged out');
  };

  // Handle version switch
  const handleVersionSwitch = () => {
    const newVersion = interfaceVersion === 'v1' ? 'v2' : 'v1';
    localStorage.setItem('use_v2', newVersion === 'v2');
    setInterfaceVersion(newVersion);
    
    // Analytics
    if (window.analytics) {
      window.analytics.track('Version Switched', {
        from: interfaceVersion,
        to: newVersion,
        userId: user?.id
      });
    }
  };

  // Handle page navigation
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Test Suite Mode
  if (FEATURE_FLAGS.SHOW_TEST_SUITE) {
    return (
      <ErrorBoundary>
        <TestSuiteUI />
      </ErrorBoundary>
    );
  }

  // No user - show login (V1 only for now)
  if (!user) {
    return (
      <ErrorBoundary>
        <div style={{ 
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isDarkMode ? '#0a0e1a' : '#f3f4f6'
        }}>
          <div style={{
            padding: '40px',
            background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 16px 64px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxWidth: '400px',
            margin: '20px'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 600,
              textAlign: 'center',
              marginBottom: '30px',
              color: isDarkMode ? '#ffffff' : '#1f2937'
            }}>
              Welcome to CelesteOS
            </h2>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleLogin(formData.get('username'), formData.get('password'));
            }}>
              <input
                name="username"
                type="text"
                placeholder="Username"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '15px',
                  border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#d1d5db'}`,
                  borderRadius: '8px',
                  background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                  color: isDarkMode ? '#ffffff' : '#1f2937',
                  fontSize: '16px'
                }}
              />
              
              <input
                name="password"
                type="password"
                placeholder="Password"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '20px',
                  border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#d1d5db'}`,
                  borderRadius: '8px',
                  background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                  color: isDarkMode ? '#ffffff' : '#1f2937',
                  fontSize: '16px'
                }}
              />
              
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Sign In
              </button>
            </form>
            
            <div style={{
              textAlign: 'center',
              marginTop: '20px',
              fontSize: '14px',
              color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#6b7280'
            }}>
              Use any username/password to demo
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  // Ask Alex Page
  if (currentPage === 'askAlex') {
    return (
      <ErrorBoundary>
        <AskAlexPage 
          user={user} 
          onBack={() => handlePageChange('chat')}
        />
      </ErrorBoundary>
    );
  }

  // Main Interface - Version Selection
  return (
    <ErrorBoundary>
      {/* Debug Panel (Dev Mode Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          zIndex: 10000,
          padding: '10px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          borderRadius: '8px',
          fontSize: '12px',
          display: 'flex',
          gap: '10px',
          alignItems: 'center'
        }}>
          <span>V{interfaceVersion.slice(1)} Active</span>
          <button
            onClick={handleVersionSwitch}
            style={{
              padding: '4px 8px',
              background: '#3b82f6',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            Switch
          </button>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            style={{
              padding: '4px 8px',
              background: '#8b5cf6',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      )}

      {/* System Health Indicator */}
      {systemHealth !== 'GOOD' && (
        <div style={{
          position: 'fixed',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          padding: '8px 16px',
          background: systemHealth === 'DEGRADED' ? '#f59e0b' : '#ef4444',
          color: 'white',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 500
        }}>
          System Status: {systemHealth}
        </div>
      )}

      {/* Interface Selection */}
      {interfaceVersion === 'v2' ? (
        <V2Interface
          user={user}
          isDarkMode={isDarkMode}
          isMobile={isMobile}
          onVersionSwitch={handleVersionSwitch}
          onPageChange={handlePageChange}
          onLogout={handleLogout}
        />
      ) : (
        <div style={{ position: 'relative' }}>
          {/* V1 Interface with version switch button */}
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000
          }}>
            <button
              onClick={handleVersionSwitch}
              style={{
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
              }}
            >
              🚀 Try V2 Beta
            </button>
          </div>
          
          <Components 
            user={user}
            onPageChange={handlePageChange}
            onLogout={handleLogout}
          />
        </div>
      )}
    </ErrorBoundary>
  );
}

export default App;