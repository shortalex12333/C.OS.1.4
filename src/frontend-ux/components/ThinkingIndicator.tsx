import React, { useEffect, useState } from 'react';

interface ThinkingIndicatorProps {
  isDarkMode?: boolean;
  searchType?: 'yacht' | 'email' | 'email-yacht';
}

export function ThinkingIndicator({ isDarkMode = false, searchType = 'yacht' }: ThinkingIndicatorProps) {
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Different hint sets based on search type
  const hintSets = {
    yacht: [
      'Searching yacht databases',
      'Finding part numbers',
      'Analyzing service manuals',
      'Checking inventory systems',
      'Diving into technical specs'
    ],
    email: [
      'Scanning email threads',
      'Analyzing attachments',
      'Finding relevant conversations',
      'Extracting key information',
      'Processing correspondence'
    ],
    'email-yacht': [
      'Cross-referencing emails',
      'Matching part inquiries',
      'Finding documentation',
      'Analyzing requirements',
      'Searching NAS systems'
    ]
  };

  const hints = hintSets[searchType] || hintSets.yacht;

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentHintIndex((prev) => (prev + 1) % hints.length);
        setIsTransitioning(false);
      }, 200);
    }, 2500);

    return () => clearInterval(interval);
  }, [hints.length]);

  return (
    <div 
      className="thinking-indicator-container"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '16px 0',
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%'
      }}
    >
      {/* Bot Avatar */}
      <div 
        className="bot-avatar"
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: isDarkMode 
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <span style={{ color: 'white', fontSize: '16px', fontWeight: 'bold' }}>C</span>
      </div>

      {/* Thinking Bubble */}
      <div 
        className="thinking-bubble"
        style={{
          background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
          border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: '12px',
          padding: '12px 16px',
          minWidth: '200px',
          maxWidth: '400px'
        }}
      >
        {/* Primary Message */}
        <div 
          className="thinking-primary"
          style={{
            fontSize: '15px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: isDarkMode ? '#ffffff' : '#000000',
            opacity: 1,
            display: 'flex',
            alignItems: 'center',
            marginBottom: '4px'
          }}
        >
          <span>Thinking</span>
          <span className="thinking-dots">...</span>
        </div>

        {/* Secondary Hint */}
        <div 
          className="thinking-secondary"
          style={{
            fontSize: '14px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: isDarkMode ? '#ffffff' : '#000000',
            opacity: isTransitioning ? 0 : 0.66,
            transition: 'opacity 200ms ease-in-out',
            minHeight: '20px'
          }}
        >
          {hints[currentHintIndex]}
        </div>
      </div>

      <style>{`
        @keyframes thinking-dots {
          0%, 20% {
            content: '';
          }
          40% {
            content: '.';
          }
          60% {
            content: '..';
          }
          80%, 100% {
            content: '...';
          }
        }

        .thinking-dots::after {
          content: '';
          animation: thinking-dots 1.4s infinite;
          display: inline-block;
          width: 20px;
          text-align: left;
        }

        .thinking-dots {
          display: inline-block;
          width: 20px;
          text-align: left;
        }
      `}</style>
    </div>
  );
}