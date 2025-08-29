import React, { useState, useEffect } from 'react';

interface AnimatedIntroProps {
  isVisible?: boolean;
  onComplete?: () => void;
  isDarkMode?: boolean;
}

interface ScreenContent {
  lines: string[];
}

const segments = [
  '40,000+ emails.',
  'Buried attachments.',
  'Misspelt file names.',
  'The notes you need?',
  'Hidden on the NAS,',
  'no one remembers.',
  'CelesteOS brings it back',
  'in seconds.'
];

export function AnimatedIntro({ isVisible = true, onComplete }: AnimatedIntroProps) {
  const [currentSegment, setCurrentSegment] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timers = React.useRef<number[]>([]);

  // Segment timing configuration
  const segmentDelays = [
    800,  // 40,000+ emails.
    700,  // Buried attachments.
    1200, // Misspelt file names. [longer pause before break]
    900,  // The notes you need?
    700,  // Hidden on the NAS,
    1200, // no one remembers. [longer pause before break]
    800,  // CelesteOS brings it back
    1000  // in seconds. [final pause]
  ];

  useEffect(() => {
    if (!isVisible) return;

    setDisplayedText('');
    setCurrentSegment(0);
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      setDisplayedText(segments.join(' '));
      setTimeout(() => {
        setIsTransitioning(true);
        if (onComplete) {
          setTimeout(onComplete, 600);
        }
      }, 2000);
      return;
    }

    // Stream segments sequentially
    let segmentIndex = 0;
    const streamNextSegment = () => {
      if (segmentIndex < segments.length) {
        const currentText = segments.slice(0, segmentIndex + 1).join(' ');
        setDisplayedText(currentText);
        setCurrentSegment(segmentIndex);
        segmentIndex++;
        
        if (segmentIndex < segments.length) {
          const delay = segmentDelays[segmentIndex - 1] || 800;
          timers.current.push(window.setTimeout(streamNextSegment, delay));
        } else {
          // All segments complete
          setTimeout(() => {
            setIsTransitioning(true);
            if (onComplete) {
              setTimeout(onComplete, 600);
            }
          }, 2000);
        }
      }
    };

    streamNextSegment();

    return () => { 
      timers.current.forEach(t => window.clearTimeout(t)); 
      timers.current = []; 
    };
  }, [isVisible, onComplete]);

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
            {segments.map((segment, index) => {
              const isVisible = currentSegment >= index;
              const containsCelesteOS = segment.includes('CelesteOS');
              
              if (containsCelesteOS) {
                return (
                  <span key={index} style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(6px)',
                    transition: 'opacity 400ms cubic-bezier(0.22, 0.61, 0.36, 1), transform 400ms cubic-bezier(0.22, 0.61, 0.36, 1)',
                    display: 'inline-block',
                    marginRight: index === segments.length - 1 ? 0 : '8px'
                  }}>
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
                    <span style={{ color: '#ffffff' }}> brings it back</span>
                  </span>
                );
              }
              
              return (
                <span
                  key={index}
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(6px)',
                    transition: 'opacity 400ms cubic-bezier(0.22, 0.61, 0.36, 1), transform 400ms cubic-bezier(0.22, 0.61, 0.36, 1)',
                    display: 'inline-block',
                    marginRight: index === segments.length - 1 ? 0 : '8px',
                    color: '#ffffff',
                    fontWeight: 500
                  }}
                >
                  {segment}
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
          gap: '8px',
        }}>
          {[0, 1, 2].map((groupIndex) => (
            <div
              key={groupIndex}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: (
                  (groupIndex === 0 && currentSegment >= 2) ||
                  (groupIndex === 1 && currentSegment >= 5) ||
                  (groupIndex === 2 && currentSegment >= 7)
                ) ? '#004aff' : '#ffffff',
                transition: 'all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)',
                transform: (
                  (groupIndex === 0 && currentSegment >= 2) ||
                  (groupIndex === 1 && currentSegment >= 5) ||
                  (groupIndex === 2 && currentSegment >= 7)
                ) ? 'scale(1.3)' : 'scale(1)',
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