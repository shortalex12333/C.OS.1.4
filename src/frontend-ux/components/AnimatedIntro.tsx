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
      '40,000+ emails. Buried attachments. Misspelt file names.'
    ]
  },
  {
    lines: [
      'The notes you need? Hidden on the NAS, no one remembers.'
    ]
  },
  {
    lines: [
      'CelesteOS brings it back in seconds'
    ]
  }
];

export function AnimatedIntro({ isVisible = true, onComplete }: AnimatedIntroProps) {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [activeTokens, setActiveTokens] = useState<number>(-1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timers = React.useRef<number[]>([]);

  // Convert screens to token-based format with timing
  const screenTokens = React.useMemo(() => {
    return screens.map(screen => {
      const allText = screen.lines.join(' ');
      const words = allText.split(' ');
      return words.map((word, index) => {
        // Special handling for CelesteOS wordmark
        if (word === 'CelesteOS') {
          return {
            text: word,
            delay: index === 0 ? 0 : 120,
            cls: 'celesteos_wordmark',
            isWordmark: true
          };
        }
        return {
          text: word,
          delay: index === 0 ? 0 : (/^\d+/.test(word) || ['40,000+', 'seconds', 'Buried', 'Misspelt', 'Hidden', 'NAS'].includes(word)) ? 300 : 120,
          cls: (/^\d+/.test(word) || ['40,000+', 'seconds', 'Buried', 'Misspelt', 'Hidden', 'NAS'].includes(word)) ? 'stream__num' : ''
        };
      });
    });
  }, []);

  useEffect(() => {
    if (!isVisible || currentScreen >= screens.length) return;

    setActiveTokens(-1);
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      setActiveTokens(screenTokens[currentScreen].length - 1);
      // Still handle screen transitions
      setTimeout(() => {
        if (currentScreen < screens.length - 1) {
          setCurrentScreen(prev => prev + 1);
        } else {
          setTimeout(() => {
            setIsTransitioning(true);
            if (onComplete) {
              setTimeout(onComplete, 600);
            }
          }, 1000);
        }
      }, 2000);
      return;
    }

    // Stream tokens with individual delays
    let tokenIndex = 0;
    const streamNextToken = () => {
      setActiveTokens(tokenIndex);
      tokenIndex++;
      
      if (tokenIndex < screenTokens[currentScreen].length) {
        const delay = screenTokens[currentScreen][tokenIndex]?.delay ?? 120;
        timers.current.push(window.setTimeout(streamNextToken, delay));
      } else {
        // Screen complete - transition to next
        setTimeout(() => {
          if (currentScreen < screens.length - 1) {
            setIsTransitioning(true);
            setTimeout(() => {
              setCurrentScreen(prev => prev + 1);
              setIsTransitioning(false);
            }, 600);
          } else {
            // Final screen complete
            setTimeout(() => {
              setIsTransitioning(true);
              if (onComplete) {
                setTimeout(onComplete, 600);
              }
            }, 2000);
          }
        }, 1500);
      }
    };

    streamNextToken();

    return () => { 
      timers.current.forEach(t => window.clearTimeout(t)); 
      timers.current = []; 
    };
  }, [currentScreen, isVisible, onComplete, screenTokens]);

  if (!isVisible) return null;

  const renderText = (text: string) => {
    // Highlight specific terms in blue
    const parts = text.split(/(40,000\+|seconds|Buried|Misspelt|Hidden|NAS)/g);
    
    return parts.map((part, index) => {
      const isHighlighted = /^40,000\+$|^seconds$|^Buried$|^Misspelt$|^Hidden$|^NAS$/.test(part);
      
      if (isHighlighted) {
        return (
          <span key={index} style={{ color: '#ffffff' }}>
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
        background: '#0a0a0a',
        overflow: 'hidden',
      }}
    >
      {/* Luxury Dark Background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
        }}
      >
        <div
          style={{
            content: '""',
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(80vmax 80vmax at 15% 25%, #282828 0%, transparent 60%),
              radial-gradient(90vmax 90vmax at 85% 20%, #1a1a1a 0%, transparent 65%),
              radial-gradient(70vmax 70vmax at 25% 75%, rgba(186, 221, 233, 0.015) 0%, transparent 50%),
              radial-gradient(60vmax 60vmax at 75% 80%, rgba(200, 169, 81, 0.04) 0%, transparent 45%),
              linear-gradient(135deg, #0a0a0a 0%, #121212 50%, #0a0a0a 100%)
            `,
            filter: 'saturate(120%) contrast(108%)',
            willChange: 'transform',
            animation: 'luxuryDrift 30s ease-in-out infinite',
          }}
        />
        {/* Deep luxury vignette */}
        <div
          style={{
            content: '""',
            position: 'absolute',
            inset: '-15vmax',
            background: 'radial-gradient(130vmax 100vmax at 50% 50%, transparent 0 70%, rgba(0,0,0,0.25) 100%)',
            pointerEvents: 'none',
            mixBlendMode: 'multiply',
          }}
        />
      </div>
      
      {/* Premium material grain */}
      <div
        style={{
          position: 'fixed',
          inset: '-1px',
          pointerEvents: 'none',
          opacity: 0.12,
          mixBlendMode: 'overlay',
          backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#n)" opacity="0.6"/></svg>')`,
          backgroundSize: '180px 180px',
          animation: 'luxuryDrift 30s ease-in-out infinite reverse',
        }}
      />
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
        <div style={{
          opacity: 1,
          transform: 'translateY(0)',
          transition: 'all 0.8s cubic-bezier(0.22, 0.61, 0.36, 1)',
        }}>
          <p style={{
            fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontSize: '42px',
            fontWeight: 500,
            letterSpacing: '-0.02em',
            lineHeight: 1.3,
            color: '#ffffff',
            margin: 0,
          }}>
            {screenTokens[currentScreen].map((token, index) => {
              const isVisible = activeTokens >= index;
              const isHighlighted = token.cls === 'stream__num';
              const isWordmark = token.isWordmark;
              
              if (isWordmark && token.text === 'CelesteOS') {
                return (
                  <span
                    key={index}
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? 'translateY(0)' : 'translateY(6px)',
                      transition: 'opacity 260ms cubic-bezier(0.22, 0.61, 0.36, 1), transform 260ms cubic-bezier(0.22, 0.61, 0.36, 1)',
                      display: 'inline-block',
                      marginRight: index === screenTokens[currentScreen].length - 1 ? 0 : '6px',
                      fontWeight: 500
                    }}
                  >
                    <span style={{ color: '#ffffff' }}>Celeste</span>
                    <span 
                      style={{
                        background: 'linear-gradient(-40deg, #4184A7 0%, #80C5DF 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      OS
                    </span>
                  </span>
                );
              }
              
              return (
                <span
                  key={index}
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(6px)',
                    transition: 'opacity 260ms cubic-bezier(0.22, 0.61, 0.36, 1), transform 260ms cubic-bezier(0.22, 0.61, 0.36, 1)',
                    display: 'inline-block',
                    marginRight: index === screenTokens[currentScreen].length - 1 ? 0 : '6px',
                    color: '#ffffff',
                    fontWeight: isHighlighted ? 600 : 500
                  }}
                >
                  {token.text}
                </span>
              );
            })}
          </p>
        </div>

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
                backgroundColor: index === currentScreen ? '#004aff' : '#ffffff',
                transition: 'all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)',
                transform: index === currentScreen ? 'scale(1.3)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Animation Styles */}
      <style>{`
        @keyframes luxuryDrift {
          0%, 100% { 
            transform: translate3d(0,0,0) scale(1); 
          }
          50% { 
            transform: translate3d(0,-0.5%,0) scale(1.005); 
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </div>
  );
}

export default AnimatedIntro;