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
      className="flex ai_response_container mr-8"
      style={{
        animation: 'messageFadeIn 0.5s cubic-bezier(0.22, 0.61, 0.36, 1)',
        transformOrigin: 'bottom left'
      }}
    >
      <div className="flex-1 min-w-0">
        {/* Message content */}
        <div style={{ textAlign: 'left' }}>
          <div 
            className="ai_response_message"
            style={{
              fontSize: '16px',
              lineHeight: '24px',
              letterSpacing: '-0.32px',
              fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              color: isDarkMode ? 'var(--headline, #f6f7fb)' : '#1f2937',
              textAlign: 'left'
            }}
          >
            {/* Thinking with streaming dots */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
              <span>Thinking</span>
              <span className="streaming-dots"></span>
            </div>
            
            {/* Static placeholder text */}
            <div style={{
              fontSize: '14px',
              color: isDarkMode ? 'rgba(246, 247, 251, 0.7)' : 'rgba(26, 26, 26, 0.6)',
              opacity: isTransitioning ? 0.3 : 1,
              transition: 'opacity 300ms ease-in-out'
            }}>
              {hints[currentHintIndex]}
            </div>
          </div>
        </div>
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