import React, { useState, useEffect } from 'react';

/**
 * AnimatedIntro Component - Matches static site
 * Typewriter effect with text sequence
 */

const textSequence = [
  "You spend 2 hours a day searching documents.",
  "We built an OS that finds answers in seconds.",
  "Handover notes? Auto-generated in 30 seconds."
];

export function AnimatedIntro({ isVisible = true, onComplete, isDarkMode = false }) {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  // Typewriter effect for current line
  useEffect(() => {
    if (!isVisible || currentLineIndex >= textSequence.length) return;
    
    const currentLine = textSequence[currentLineIndex];
    let charIndex = 0;
    setIsTyping(true);
    setDisplayedText('');

    // Start typing after a brief delay
    const startDelay = setTimeout(() => {
      const typeInterval = setInterval(() => {
        if (charIndex <= currentLine.length) {
          setDisplayedText(currentLine.slice(0, charIndex));
          charIndex++;
        } else {
          clearInterval(typeInterval);
          setIsTyping(false);
          
          // Wait 1.5 seconds before moving to next line
          setTimeout(() => {
            if (currentLineIndex < textSequence.length - 1) {
              setCurrentLineIndex(prev => prev + 1);
            } else {
              // All lines completed - wait 2 seconds then fade out
              setTimeout(() => {
                setIsCompleted(true);
                // Wait for fade animation to complete before calling onComplete
                if (onComplete) {
                  setTimeout(onComplete, 800);
                }
              }, 2000);
            }
          }, 1500);
        }
      }, 45); // 45ms per character for smooth typewriter speed
    }, currentLineIndex === 0 ? 800 : 200); // Longer delay for first line

    return () => {
      clearTimeout(startDelay);
    };
  }, [currentLineIndex, isVisible, onComplete]);

  // Cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530); // Cursor blinks every 530ms

    return () => clearInterval(cursorInterval);
  }, []);

  // Reset state when component becomes visible
  useEffect(() => {
    if (isVisible) {
      setCurrentLineIndex(0);
      setDisplayedText('');
      setIsTyping(false);
      setShowCursor(true);
      setIsCompleted(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

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
        backgroundColor: isDarkMode ? '#0a0e1a' : '#ffffff',
        opacity: isCompleted ? 0 : 1,
        transition: 'opacity 0.8s cubic-bezier(0.22, 0.61, 0.36, 1)',
      }}
    >
      {/* Main content container */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
        maxWidth: '1024px',
      }}>
        {/* Previous completed lines */}
        {textSequence.slice(0, currentLineIndex).map((line, index) => (
          <div
            key={`completed-${index}`}
            style={{
              marginBottom: '48px',
              opacity: 0.3,
              transition: 'opacity 0.5s cubic-bezier(0.22, 0.61, 0.36, 1)',
            }}
          >
            <p style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: 'clamp(24px, 4.5vw, 42px)',
              fontWeight: 400,
              letterSpacing: '0.38px',
              lineHeight: 1.2,
              color: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
            }}>
              {line}
            </p>
          </div>
        ))}

        {/* Current typing line */}
        {currentLineIndex < textSequence.length && (
          <div style={{
            position: 'relative',
            opacity: 1,
            animation: 'fadeInUp 0.6s cubic-bezier(0.22, 0.61, 0.36, 1)',
          }}>
            <p style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: 'clamp(24px, 4.5vw, 42px)',
              fontWeight: 400,
              letterSpacing: '0.38px',
              lineHeight: 1.2,
              color: isDarkMode ? '#ffffff' : '#000000',
            }}>
              {displayedText}
              <span style={{
                display: 'inline-block',
                width: '3px',
                marginLeft: '4px',
                height: 'clamp(28px, 4.8vw, 48px)',
                backgroundColor: isDarkMode ? '#ffffff' : '#000000',
                opacity: showCursor && (isTyping || currentLineIndex === textSequence.length - 1) ? 1 : 0,
                transition: 'opacity 0.15s',
                transform: 'translateY(2px)',
              }} />
            </p>
          </div>
        )}

        {/* Subtle brand element at bottom */}
        {currentLineIndex >= 1 && (
          <div style={{
            position: 'absolute',
            bottom: '48px',
            left: '50%',
            transform: 'translateX(-50%)',
            opacity: 0.2,
            animation: 'fadeIn 1.2s cubic-bezier(0.22, 0.61, 0.36, 1)',
          }}>
            <div style={{
              width: '48px',
              height: '2px',
              borderRadius: '9999px',
              background: isDarkMode 
                ? 'linear-gradient(90deg, #4a90e2, #74a9e6)' 
                : 'linear-gradient(90deg, #0070ff, #00a4ff)',
            }} />
          </div>
        )}
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
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default AnimatedIntro;