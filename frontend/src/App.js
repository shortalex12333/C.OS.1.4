import React, { useState, useEffect } from 'react';
import './App.css';
import Components from './components';

const { 
  AuthScreen, 
  ChatInterface, 
  LoadingScreen,
  OnboardingScreen
} = Components;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check for existing session on app load
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('celeste7_token');
      const userData = localStorage.getItem('celeste7_user');
      const onboardingCompleted = localStorage.getItem('celeste7_onboarding_completed');
      
      if (token && userData) {
        try {
          // Verify token with webhook
          const response = await fetch('https://ventruk.app.n8n.cloud/webhook/c7/auth/verify-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            mode: 'cors',
            credentials: 'omit',
            body: JSON.stringify({ token })
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setUser(JSON.parse(userData));
              setIsAuthenticated(true);
              setShowOnboarding(!onboardingCompleted);
            } else {
              // Invalid token, clear storage
              localStorage.removeItem('celeste7_token');
              localStorage.removeItem('celeste7_user');
              localStorage.removeItem('celeste7_onboarding_completed');
            }
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        } catch (error) {
          console.error('Session verification failed:', error);
          // For demo purposes, auto-login with mock data if there's stored user data
          if (userData) {
            setUser(JSON.parse(userData));
            setIsAuthenticated(true);
            setShowOnboarding(!onboardingCompleted);
          }
        }
      }
      
      setIsLoading(false);
    };

    // Simulate loading time
    setTimeout(checkSession, 1500);
  }, []);

  const handleLogin = (userData, token) => {
    // Generate unique sessionId for this login session
    const sessionId = generateUniqueSessionId(userData.id);
    
    setUser(userData);
    setIsAuthenticated(true);
    setShowOnboarding(true); // Always show onboarding for new login
    localStorage.setItem('celeste7_token', token);
    localStorage.setItem('celeste7_user', JSON.stringify(userData));
    
    // Store sessionId in sessionStorage (clears when browser tab closes)
    sessionStorage.setItem('celeste7_session_id', sessionId);
    localStorage.setItem('celeste7_session_created', Date.now().toString());
    
    console.log('🔑 New session created:', sessionId);
  };

  // Generate truly unique session ID
  const generateUniqueSessionId = (userId) => {
    const timestamp = Date.now();
    const randomComponent = Math.random().toString(36).substring(2, 15);
    const userComponent = userId.substring(0, 8); // First 8 chars of userId
    
    // Create crypto-random component if available
    let cryptoComponent = '';
    if (window.crypto && window.crypto.getRandomValues) {
      const array = new Uint32Array(2);
      window.crypto.getRandomValues(array);
      cryptoComponent = Array.from(array, dec => dec.toString(16)).join('');
    } else {
      cryptoComponent = Math.random().toString(16).substring(2, 10);
    }
    
    return `session_${userComponent}_${timestamp}_${randomComponent}_${cryptoComponent}`;
  };

  const handleOnboardingComplete = (profileData) => {
    setShowOnboarding(false);
    localStorage.setItem('celeste7_onboarding_completed', 'true');
    localStorage.setItem('celeste7_profile', JSON.stringify(profileData));
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('celeste7_token');
      if (token) {
        await fetch('https://ventruk.app.n8n.cloud/webhook/c7/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
          credentials: 'omit',
          body: JSON.stringify({ token })
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    localStorage.removeItem('celeste7_token');
    localStorage.removeItem('celeste7_user');
    localStorage.removeItem('celeste7_onboarding_completed');
    localStorage.removeItem('celeste7_profile');
    setUser(null);
    setIsAuthenticated(false);
    setShowOnboarding(false);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  if (showOnboarding) {
    return <OnboardingScreen user={user} onComplete={handleOnboardingComplete} />;
  }

  return <ChatInterface user={user} onLogout={handleLogout} />;
}

export default App;