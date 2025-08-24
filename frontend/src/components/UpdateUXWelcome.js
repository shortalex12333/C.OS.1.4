import React from 'react';
import { UpdateUXHeader } from './UpdateUXHeader';

export function UpdateUXWelcome({ 
  isMobile = false, 
  displayName, 
  isDarkMode = false, 
  selectedModel = 'air', 
  onModelChange = () => {} 
}) {
  
  // Time-based greeting function (copied from UPDATE UX ChatArea)
  const getTimeBasedGreeting = () => {
    try {
      const now = new Date();
      const hour = now.getHours();
      
      // Morning: 5:00 AM - 11:59 AM (5-11)
      if (hour >= 5 && hour < 12) {
        return 'Morning';
      }
      // Afternoon: 12:00 PM - 4:59 PM (12-16)  
      else if (hour >= 12 && hour < 17) {
        return 'Afternoon';
      }
      // Evening: 5:00 PM - 4:59 AM (17-4)
      else {
        return 'Evening';
      }
    } catch (error) {
      // Fallback when time cannot be fetched
      console.warn('Unable to fetch current time, using default greeting:', error);
      return 'Hello';
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      height: '100%', 
      flexDirection: 'column' 
    }}>
      {/* Main Header with CelesteOS branding */}
      <UpdateUXHeader 
        isMobile={isMobile}
        isDarkMode={isDarkMode}
        isChatMode={false}
        selectedModel={selectedModel}
        onModelChange={onModelChange}
      />
      
      {/* Welcome State Content */}
      <div style={{ 
        display: 'flex', 
        height: '100%', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ 
          textAlign: 'center', 
          maxWidth: '768px', 
          padding: '0 24px' 
        }}>
          {/* Greeting Header */}
          <h2 
            style={{
              fontSize: isMobile ? '24px' : '28px',
              lineHeight: isMobile ? '30px' : '34px',
              fontWeight: 400,
              color: isDarkMode ? 'var(--headline, #f6f7fb)' : '#1f2937',
              fontFamily: 'Eloquia Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              letterSpacing: '0.38px',
              marginBottom: isMobile ? '16px' : '20px'
            }}
          >
            {getTimeBasedGreeting()}, {displayName}
          </h2>
          
          {/* Welcome message */}
          <p 
            style={{ 
              fontSize: isMobile ? '16px' : '18px',
              lineHeight: isMobile ? '24px' : '28px',
              color: isDarkMode ? 'rgba(246, 247, 251, 0.8)' : '#6b7280',
              fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              letterSpacing: '-0.32px',
              marginBottom: '32px'
            }}
          >
            Welcome, you are using our latest models (2025), select your search intent, and type below
          </p>
        </div>
      </div>
    </div>
  );
}

export default UpdateUXWelcome;