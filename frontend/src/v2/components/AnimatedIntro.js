import React, { useState, useEffect, useRef } from 'react';

/**
 * AnimatedIntro Component
 * Displays a typewriter animation sequence for onboarding
 * Recreated from static site with performance optimizations
 */

const TEXT_SEQUENCE = [
  "You spend 2 hours a day searching documents.",
  "We built an OS that finds answers in seconds.",
  "Handover notes? Auto-generated in 30 seconds."
];

export function AnimatedIntro({ 
  isVisible = true, 
  onComplete,
  isDarkMode = false,
  textSequence = TEXT_SEQUENCE,
  typingSpeed = 45,
  lineDelay = 1500,
  initialDelay = 800,
  fadeOutDelay = 2000
}) {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [opacity, setOpacity] = useState(0);
  
  const containerRef = useRef(null);
  const typingIntervalRef = useRef(null);
  const cursorIntervalRef = useRef(null);
  const timeoutRefs = useRef([]);

  // Cleanup function for all timeouts and intervals
  const cleanup = () => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    if (cursorIntervalRef.current) {
      clearInterval(cursorIntervalRef.current);
      cursorIntervalRef.current = null;
    }
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current = [];
  };

  // Typewriter effect for current line
  useEffect(() => {
    if (!isVisible || currentLineIndex >= textSequence.length) return;
    
    const currentLine = textSequence[currentLineIndex];
    let charIndex = 0;
    setIsTyping(true);
    setDisplayedText('');
    
    // Fade in animation
    setOpacity(1);
    
    // Start typing after delay
    const startTimeout = setTimeout(() => {
      typingIntervalRef.current = setInterval(() => {
        if (charIndex <= currentLine.length) {
          setDisplayedText(currentLine.slice(0, charIndex));
          charIndex++;
        } else {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
          setIsTyping(false);
          
          // Wait before moving to next line
          const nextLineTimeout = setTimeout(() => {
            if (currentLineIndex < textSequence.length - 1) {
              setCurrentLineIndex(prev => prev + 1);
            } else {
              // All lines completed
              const fadeOutTimeout = setTimeout(() => {
                setIsCompleted(true);
                setOpacity(0);
                
                // Notify parent after fade
                const completeTimeout = setTimeout(() => {
                  if (onComplete) {
                    onComplete();
                  }
                }, 800);
                timeoutRefs.current.push(completeTimeout);
              }, fadeOutDelay);
              timeoutRefs.current.push(fadeOutTimeout);
            }
          }, lineDelay);
          timeoutRefs.current.push(nextLineTimeout);
        }
      }, typingSpeed);
    }, currentLineIndex === 0 ? initialDelay : 200);
    
    timeoutRefs.current.push(startTimeout);
    
    return cleanup;
  }, [currentLineIndex, isVisible, textSequence, onComplete, typingSpeed, lineDelay, initialDelay, fadeOutDelay]);

  // Cursor blinking effect
  useEffect(() => {
    cursorIntervalRef.current = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    
    return () => {
      if (cursorIntervalRef.current) {
        clearInterval(cursorIntervalRef.current);
      }
    };
  }, []);

  // Reset state when component becomes visible
  useEffect(() => {
    if (isVisible) {
      setCurrentLineIndex(0);
      setDisplayedText('');
      setIsTyping(false);
      setShowCursor(true);
      setIsCompleted(false);
      setOpacity(0);
    }
    
    return cleanup;
  }, [isVisible]);

  if (!isVisible) return null;

  const containerStyles = {
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isDarkMode ? 'var(--dark-blue-900)' : '#ffffff',
    opacity: opacity,
    transition: `opacity ${isCompleted ? '0.8s' : '0.4s'} var(--easing-smooth)`,
    pointerEvents: isCompleted ? 'none' : 'auto'
  };

  const textStyles = {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(24px, 4.5vw, 42px)',
    fontWeight: 400,
    letterSpacing: '0.38px',
    lineHeight: 1.2,
    color: isDarkMode ? 'var(--headline)' : '#000000',
    textAlign: 'center',
    maxWidth: '90%',
    margin: '0 auto'
  };

  const cursorStyles = {
    display: 'inline-block',
    width: '3px',
    height: 'clamp(28px, 4.8vw, 48px)',
    backgroundColor: isDarkMode ? '#ffffff' : '#000000',
    marginLeft: '4px',
    transform: 'translateY(2px)',
    opacity: showCursor && (isTyping || currentLineIndex === textSequence.length - 1) ? 1 : 0,
    transition: 'opacity 150ms'
  };

  const brandElementStyles = {
    position: 'absolute',
    bottom: '48px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '48px',
    height: '2px',
    borderRadius: 'var(--radius-full)',
    background: isDarkMode 
      ? 'linear-gradient(to right, var(--steel-blue), #74a9e6)'
      : 'linear-gradient(to right, var(--maritime-blue), #00a4ff)',
    opacity: currentLineIndex >= 1 ? 0.2 : 0,
    transition: 'opacity 1.2s var(--easing-smooth) 0.8s'
  };

  return (
    <div 
      ref={containerRef}
      className="animated-intro-overlay"
      style={containerStyles}
      role="presentation"
      aria-live="polite"
    >
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px',
        width: '100%',
        maxWidth: '1000px'
      }}>
        {/* Previous completed lines */}
        {textSequence.slice(0, currentLineIndex).map((line, index) => (
          <div
            key={`completed-line-${index}`}
            style={{
              ...textStyles,
              opacity: 0.3,
              marginBottom: '32px',
              animation: 'fadeIn 0.5s var(--easing-smooth)'
            }}
          >
            {line}
          </div>
        ))}
        
        {/* Current typing line */}
        {currentLineIndex < textSequence.length && (
          <div
            style={{
              ...textStyles,
              animation: 'slideInUp 0.6s var(--easing-smooth)'
            }}
          >
            <span>{displayedText}</span>
            <span style={cursorStyles} aria-hidden="true" />
          </div>
        )}
      </div>
      
      {/* Brand element */}
      <div style={brandElementStyles} aria-hidden="true" />
    </div>
  );
}

// Self-test component
export function AnimatedIntroTest() {
  const [testState, setTestState] = useState('idle');
  const [testResults, setTestResults] = useState([]);
  const [showIntro, setShowIntro] = useState(false);
  const startTimeRef = useRef(null);

  const startTest = () => {
    setTestState('running');
    setShowIntro(true);
    startTimeRef.current = Date.now();
    setTestResults([]);
  };

  const handleComplete = () => {
    const duration = Date.now() - startTimeRef.current;
    const expectedDuration = 800 + (45 * 30 * 3) + (1500 * 2) + 2000 + 800; // Rough calculation
    
    const tests = [
      {
        name: 'Animation completes',
        passed: true,
        details: `Completed in ${duration}ms`
      },
      {
        name: 'Duration reasonable',
        passed: duration < expectedDuration * 1.5,
        details: `Expected ~${expectedDuration}ms, got ${duration}ms`
      },
      {
        name: 'onComplete callback fired',
        passed: true,
        details: 'Callback executed successfully'
      }
    ];
    
    setTestResults(tests);
    setShowIntro(false);
    setTestState('complete');
  };

  const customSequence = [
    "Testing line 1...",
    "Testing line 2...",
    "Testing complete!"
  ];

  return (
    <div style={{ 
      padding: '20px', 
      background: '#f3f4f6', 
      borderRadius: '8px',
      minHeight: '400px'
    }}>
      <h3>AnimatedIntro Test Suite</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={startTest}
          disabled={testState === 'running'}
          style={{
            padding: '10px 20px',
            background: testState === 'running' ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: testState === 'running' ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {testState === 'running' ? 'Running...' : 'Start Test'}
        </button>
        
        <button 
          onClick={() => {
            setShowIntro(true);
            setTimeout(() => setShowIntro(false), 10000);
          }}
          style={{
            padding: '10px 20px',
            background: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Preview Full Animation
        </button>
      </div>
      
      {testState === 'running' && (
        <div style={{ 
          padding: '10px',
          background: '#fef3c7',
          borderRadius: '6px',
          marginBottom: '10px'
        }}>
          ⏱️ Animation running... Please wait for completion
        </div>
      )}
      
      {testResults.length > 0 && (
        <div>
          <h4>Test Results:</h4>
          {testResults.map((test, i) => (
            <div key={i} style={{ 
              padding: '8px',
              background: test.passed ? '#d1fae5' : '#fee2e2',
              borderRadius: '4px',
              marginBottom: '4px'
            }}>
              {test.passed ? '✅' : '❌'} {test.name}: {test.details}
            </div>
          ))}
          
          <div style={{ 
            marginTop: '10px',
            padding: '10px',
            background: testResults.every(t => t.passed) ? '#10b981' : '#ef4444',
            color: 'white',
            borderRadius: '6px'
          }}>
            {testResults.every(t => t.passed) 
              ? '✅ All tests passed!' 
              : '❌ Some tests failed'}
          </div>
        </div>
      )}
      
      {/* Test instances */}
      {showIntro && testState === 'running' && (
        <AnimatedIntro
          isVisible={true}
          onComplete={handleComplete}
          isDarkMode={false}
          textSequence={customSequence}
          typingSpeed={30}
          lineDelay={500}
          fadeOutDelay={1000}
        />
      )}
      
      {showIntro && testState !== 'running' && (
        <AnimatedIntro
          isVisible={true}
          onComplete={() => setShowIntro(false)}
          isDarkMode={true}
        />
      )}
    </div>
  );
}

export default AnimatedIntro;