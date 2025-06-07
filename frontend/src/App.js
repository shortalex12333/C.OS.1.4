import React, { useState, useEffect } from 'react';
import './App.css';
import Components from './components';

const { 
  AuthScreen, 
  ChatInterface, 
  LoadingScreen 
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
    setUser(userData);
    setIsAuthenticated(true);
    setShowOnboarding(true); // Always show onboarding for new login
    localStorage.setItem('celeste7_token', token);
    localStorage.setItem('celeste7_user', JSON.stringify(userData));
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