import React, { useState, useEffect } from 'react';

interface AnimatedIntroProps {
  isVisible?: boolean;
  onComplete?: () => void;
  isDarkMode?: boolean;
}

interface ScreenContent {
  lines: string[];
}

const screens: ScreenContent[] = [
  {
    lines: [
      'Chiefs lose ~2 hours a day searching manuals and emails.',
      'Handovers drag, knowledge gets lost, mistakes repeat.'
    ]
  },
  {
    lines: [
      'CelesteOS finds the right document in seconds.',
      'Handover notes: 30 seconds.',
      'Save 10+ hours a week, per engineer.'
    ]
  },
  {
    lines: [
      'Runs offline, on your yacht\'s LAN.',
      'Read-only: no data ever leaves your NAS.',
      'Built by a former Superyacht ETO, for Captains and Chiefs.'
    ]
  }
];

export function AnimatedIntro({ isVisible = true, onComplete }: AnimatedIntroProps) {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!isVisible || currentScreen >= screens.length) return;

    const currentLines = screens[currentScreen].lines;
    let lineIndex = 0;

    // Reveal lines one by one
    const lineInterval = setInterval(() => {
      if (lineIndex < currentLines.length) {
        setVisibleLines(lineIndex + 1);
        lineIndex++;
      } else {
        clearInterval(lineInterval);
        
        // Wait then transition to next screen
        setTimeout(() => {
          if (currentScreen < screens.length - 1) {
            setIsTransitioning(true);
            setTimeout(() => {
              setCurrentScreen(prev => prev + 1);
              setVisibleLines(0);
              setIsTransitioning(false);
            }, 600);
          } else {
            // Final screen complete - wait then trigger onComplete
            setTimeout(() => {
              setIsTransitioning(true);
              if (onComplete) {
                setTimeout(onComplete, 600);
              }
            }, 2000);
          }
        }, currentScreen === screens.length - 1 ? 3000 : 2500);
      }
    }, 800);

    return () => clearInterval(lineInterval);
  }, [currentScreen, isVisible, onComplete]);

  if (!isVisible) return null;

  const renderText = (text: string) => {
    // Highlight specific terms in blue
    const parts = text.split(/(\d+ hours a day|seconds|30 seconds|10\+ hours a week|offline|Read-only)/g);
    
    return parts.map((part, index) => {
      const isHighlighted = /^\d+ hours a day$|^seconds$|^30 seconds$|^10\+ hours a week$|^offline$|^Read-only$/.test(part);
      
      if (isHighlighted) {
        return (
          <span key={index} style={{ color: '#007aff' }}>
            {part}
          </span>
        );
      }
      
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        opacity: isTransitioning ? 0 : 1,
        transition: 'opacity 0.6s cubic-bezier(0.22, 0.61, 0.36, 1)',
      }}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        textAlign: 'center',
        maxWidth: '900px',
        width: '100%',
      }}>
        {screens[currentScreen].lines.map((line, index) => (
          <div
            key={`${currentScreen}-${index}`}
            style={{
              marginBottom: '24px',
              opacity: index < visibleLines ? 1 : 0,
              transform: index < visibleLines ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.8s cubic-bezier(0.22, 0.61, 0.36, 1)',
            }}
          >
            <p style={{
              fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              fontSize: '42px',
              fontWeight: 400,
              letterSpacing: '-0.02em',
              lineHeight: 1.3,
              color: '#181818',
              margin: 0,
            }}>
              {renderText(line)}
            </p>
          </div>
        ))}

        {/* Progress dots */}
        <div style={{
          position: 'absolute',
          bottom: '60px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '12px',
        }}>
          {screens.map((_, index) => (
            <div
              key={index}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: index === currentScreen ? '#007aff' : '#e0e0e0',
                transition: 'all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)',
                transform: index === currentScreen ? 'scale(1.3)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default AnimatedIntro;