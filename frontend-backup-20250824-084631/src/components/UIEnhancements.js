import React, { useState, useEffect } from 'react';
import { EnhancedGuidedPrompts } from './EnhancedGuidedPrompts';
import { EnhancedSolutionCard } from './EnhancedSolutionCard';

/**
 * UI Enhancements Module - Production Ready
 * Provides visual improvements to existing components
 */

// Enhanced message rendering with solution cards
export function renderEnhancedMessage(message, isDarkMode = false) {
  // Check if message contains solutions from webhook
  if (message.solutions && Array.isArray(message.solutions)) {
    return (
      <div className="enhanced-message-container">
        {message.text && (
          <div style={{
            marginBottom: '16px',
            fontSize: '16px',
            lineHeight: '24px',
            color: isDarkMode ? '#f6f7fb' : '#374151'
          }}>
            {message.text}
          </div>
        )}
        {message.solutions.map((solution, index) => (
          <EnhancedSolutionCard 
            key={index}
            solution={solution}
            isDarkMode={isDarkMode}
            isMobile={window.innerWidth < 768}
          />
        ))}
      </div>
    );
  }
  
  // Check for maritime parts format
  if (message.items && Array.isArray(message.items)) {
    return (
      <div className="enhanced-items-container">
        <div style={{
          marginBottom: '16px',
          fontSize: '16px',
          lineHeight: '24px',
          color: isDarkMode ? '#f6f7fb' : '#374151'
        }}>
          {message.answer || message.text || 'Found the following items:'}
        </div>
        {message.items.map((item, index) => (
          <div key={index} style={{
            padding: '16px',
            marginBottom: '12px',
            borderRadius: '8px',
            backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(16px)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#e5e7eb'}`,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
          }}>
            <div style={{
              fontWeight: '600',
              fontSize: '15px',
              marginBottom: '8px',
              color: isDarkMode ? '#ffffff' : '#1a1a1a'
            }}>
              {item.name || item.title || `Item ${index + 1}`}
            </div>
            {item.description && (
              <div style={{
                fontSize: '14px',
                color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#6b7280',
                marginBottom: '8px'
              }}>
                {item.description}
              </div>
            )}
            {item.price && (
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#3b82f6'
              }}>
                ${item.price}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }
  
  // Default message rendering
  return message.text || message;
}

// Enhanced empty state with guided prompts
export function EnhancedEmptyState({ onPromptSelect, isDarkMode = false }) {
  const [showAnimation, setShowAnimation] = useState(false);
  
  useEffect(() => {
    // Show animation on first load
    const hasSeenIntro = localStorage.getItem('hasSeenIntro');
    if (!hasSeenIntro) {
      setShowAnimation(true);
      localStorage.setItem('hasSeenIntro', 'true');
    }
  }, []);
  
  return (
    <div className="enhanced-empty-state" style={{
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '800px',
        margin: '0 auto',
        animation: showAnimation ? 'fadeInUp 0.8s cubic-bezier(0.22, 0.61, 0.36, 1)' : 'none'
      }}>
        {/* Enhanced Logo */}
        <h1 style={{
          fontSize: '48px',
          fontWeight: '600',
          marginBottom: '16px',
          color: isDarkMode ? '#ffffff' : '#1a1a1a',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          Celeste
          <span style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>OS</span>
        </h1>
        
        {/* Enhanced Tagline */}
        <p style={{
          fontSize: '20px',
          color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#6b7280',
          marginBottom: '32px',
          fontWeight: '400'
        }}>
          Your intelligent yacht operations assistant
        </p>
        
        {/* Stats Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '48px',
          marginBottom: '32px'
        }}>
          {[
            { value: '2 sec', label: 'Avg response time' },
            { value: '10k+', label: 'Marine manuals' },
            { value: '99.9%', label: 'Uptime' }
          ].map((stat, index) => (
            <div key={index} style={{
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#3b82f6',
                marginBottom: '4px'
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: '13px',
                color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : '#9ca3af'
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
        
        {/* Enhanced Guided Prompts */}
        <EnhancedGuidedPrompts 
          onPromptSelect={onPromptSelect}
          isDarkMode={isDarkMode}
        />
        
        {/* Additional hint */}
        <p style={{
          fontSize: '14px',
          color: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : '#9ca3af',
          marginTop: '24px'
        }}>
          Type your question below or select a suggested query
        </p>
      </div>
      
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

// Enhanced input area with visual improvements
export function EnhancedInputArea({ 
  message, 
  setMessage, 
  handleSendMessage, 
  isLoading = false,
  isDarkMode = false 
}) {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div style={{
      padding: '20px',
      borderTop: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'}`,
      backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      position: 'relative'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px',
          borderRadius: '12px',
          border: `1px solid ${
            isFocused 
              ? '#3b82f6' 
              : isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#e5e7eb'
          }`,
          backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : '#ffffff',
          boxShadow: isFocused 
            ? '0 0 0 3px rgba(59, 130, 246, 0.1)' 
            : 'none',
          transition: 'all 0.2s cubic-bezier(0.22, 0.61, 0.36, 1)'
        }}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
                handleSendMessage();
              }
            }}
            placeholder="Ask about yacht operations, maintenance, or technical issues..."
            disabled={isLoading}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '16px',
              color: isDarkMode ? '#ffffff' : '#1a1a1a',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          />
          
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !message.trim()}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              backgroundColor: isLoading || !message.trim() 
                ? '#e5e7eb' 
                : '#3b82f6',
              color: isLoading || !message.trim() 
                ? '#9ca3af' 
                : '#ffffff',
              border: 'none',
              fontSize: '15px',
              fontWeight: '500',
              cursor: isLoading || !message.trim() 
                ? 'not-allowed' 
                : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s cubic-bezier(0.22, 0.61, 0.36, 1)',
              transform: 'scale(1)'
            }}
            onMouseDown={(e) => {
              if (!isLoading && message.trim()) {
                e.currentTarget.style.transform = 'scale(0.95)';
              }
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #9ca3af',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite'
                }} />
                Processing
              </>
            ) : (
              'Send'
            )}
          </button>
        </div>
        
        {/* Character count */}
        {message.length > 0 && (
          <div style={{
            position: 'absolute',
            bottom: '-20px',
            right: '12px',
            fontSize: '12px',
            color: message.length > 1000 
              ? '#ef4444' 
              : isDarkMode ? 'rgba(255, 255, 255, 0.5)' : '#9ca3af'
          }}>
            {message.length}/1500
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

export default {
  renderEnhancedMessage,
  EnhancedEmptyState,
  EnhancedInputArea,
  EnhancedGuidedPrompts,
  EnhancedSolutionCard
};