import React, { useEffect, useState } from 'react';

interface ThinkingIndicatorProps {
  isDarkMode?: boolean;
  searchType?: 'yacht' | 'email' | 'email-yacht';
}

export function ThinkingIndicator({ isDarkMode = false, searchType = 'yacht' }: ThinkingIndicatorProps) {
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Clean hint sets based on search type
  const hintSets = {
    yacht: [
      'Searching yacht databases',
      'Finding part numbers',
      'Analyzing service manuals',
      'Checking inventory systems',
      'Reviewing technical specs'
    ],
    email: [
      'Scanning email threads',
      'Analyzing attachments',
      'Finding conversations',
      'Extracting information',
      'Processing correspondence'
    ],
    'email-yacht': [
      'Cross-referencing emails',
      'Matching part inquiries',
      'Finding documentation',
      'Analyzing requirements',
      'Searching systems'
    ]
  };

  const hints = hintSets[searchType] || hintSets.yacht;

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentHintIndex((prev) => (prev + 1) % hints.length);
        setIsTransitioning(false);
      }, 300);
    }, 3000);

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

      {/* Clean Thinking Bubble - No border, no background */}
      <div 
        className="thinking-bubble"
        style={{
          padding: '12px 16px',
          minWidth: '200px',
          maxWidth: '400px'
        }}
      >
        {/* Thinking with streaming dots */}
        <div 
          className="thinking-primary"
          style={{
            fontSize: '15px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: isDarkMode ? '#ffffff' : '#000000',
            marginBottom: '6px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <span>Thinking</span>
          <span className="streaming-dots"></span>
        </div>

        {/* Static placeholder text */}
        <div 
          className="thinking-secondary"
          style={{
            fontSize: '14px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
            opacity: isTransitioning ? 0.3 : 1,
            transition: 'opacity 300ms ease-in-out'
          }}
        >
          {hints[currentHintIndex]}
        </div>
      </div>

      <style>{`
        @keyframes streamingDots {
          0% {
            content: '';
          }
          25% {
            content: '.';
          }
          50% {
            content: '..';
          }
          75%, 100% {
            content: '...';
          }
        }

        .streaming-dots::after {
          content: '';
          animation: streamingDots 1.2s infinite ease-in-out;
          display: inline-block;
          width: 24px;
          text-align: left;
        }
      `}</style>
    </div>
  );
}