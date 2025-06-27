import React, { useState, useEffect } from 'react';
import './App.css';
import Components from './components';

const { 
  AuthScreen, 
  ChatInterface
} = Components;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('celesteos_token');
      const userData = localStorage.getItem('celesteos_user');
      
      if (token && userData) {
        try {
          // Verify token with webhook
          const response = await fetch('https://api.celeste7.ai/webhook/auth/verify-token', {
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
            // Handle array response format
            const authData = Array.isArray(data) ? data[0] : data;
            if (authData && (authData.success || authData.user)) {
              setUser(JSON.parse(userData));
              setIsAuthenticated(true);
            } else {
              // Invalid token, clear storage
              localStorage.removeItem('celesteos_token');
              localStorage.removeItem('celesteos_user');
            }
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        } catch (error) {
          console.error('Session verification failed:', error);
          // For demo purposes, auto-login with mock data if there's stored user data
          if (userData) {
            // Check if we need to create a new session (no existing sessionId or session expired)
            const existingSessionId = sessionStorage.getItem('celesteos_session_id');
            const sessionCreated = localStorage.getItem('celesteos_session_created');
            const sessionAge = Date.now() - parseInt(sessionCreated || '0');
            const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
            
            if (!existingSessionId || sessionAge > maxSessionAge) {
              // Generate new session for returning user
              const newSessionId = generateUniqueSessionId(JSON.parse(userData).id);
              sessionStorage.setItem('celesteos_session_id', newSessionId);
              localStorage.setItem('celesteos_session_created', Date.now().toString());
              console.log('🔑 New session created for returning user:', newSessionId);
            }
            
            setUser(JSON.parse(userData));
            setIsAuthenticated(true);
          }
        }
      }
      
      setIsLoading(false);
    };

    // Quick check, no artificial delay
    checkSession();
  }, []);

  const handleLogin = (userData, token) => {
    // Generate unique sessionId for this login session
    const sessionId = generateUniqueSessionId(userData.id);
    
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('celesteos_token', token);
    localStorage.setItem('celesteos_user', JSON.stringify(userData));
    
    // Store sessionId in sessionStorage (clears when browser tab closes)
    sessionStorage.setItem('celesteos_session_id', sessionId);
    localStorage.setItem('celesteos_session_created', Date.now().toString());
    
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

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('celesteos_token');
      if (token) {
        await fetch('https://api.celeste7.ai/webhook/auth/logout', {
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
    
    // Clear all session data
    localStorage.removeItem('celesteos_token');
    localStorage.removeItem('celesteos_user');
    localStorage.removeItem('celesteos_session_created');
    
    // Clear session-specific data
    sessionStorage.removeItem('celesteos_session_id');
    
    console.log('🔑 Session cleared on logout');
    
    setUser(null);
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return null; // Simple loading state, no fancy screen
  }

  if (!isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return <ChatInterface user={user} onLogout={handleLogout} />;
}

export default App;