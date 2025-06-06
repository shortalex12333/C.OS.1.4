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

  // Check for existing session on app load
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('celeste7_token');
      const userData = localStorage.getItem('celeste7_user');
      
      if (token && userData) {
        try {
          // Verify token with webhook
          const response = await fetch('https://ventruk.app.n8n.cloud/webhook/c7/auth/verify-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token })
          });
          
          if (response.ok) {
            setUser(JSON.parse(userData));
            setIsAuthenticated(true);
          } else {
            // Invalid token, clear storage
            localStorage.removeItem('celeste7_token');
            localStorage.removeItem('celeste7_user');
          }
        } catch (error) {
          console.error('Session verification failed:', error);
          // For demo purposes, auto-login with mock data
          setUser({ 
            id: 'demo_user_123', 
            email: 'demo@celeste7.com', 
            name: 'Demo User' 
          });
          setIsAuthenticated(true);
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
    localStorage.setItem('celeste7_token', token);
    localStorage.setItem('celeste7_user', JSON.stringify(userData));
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('celeste7_token');
      await fetch('https://ventruk.app.n8n.cloud/webhook/c7/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    localStorage.removeItem('celeste7_token');
    localStorage.removeItem('celeste7_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="App">
      {isAuthenticated ? (
        <ChatInterface user={user} onLogout={handleLogout} />
      ) : (
        <AuthScreen onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;