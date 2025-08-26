import React, { useState, useEffect } from 'react';
import { Sparkles, MessageSquare, User, Menu, Calculator, CheckCircle, X, ChevronRight, ChevronLeft } from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target: string | null;
  position: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  icon: React.ReactNode;
}

interface TutorialOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
  isDarkMode?: boolean;
  messageCount?: number;
  hasReceivedJSON?: boolean;
}

interface HighlightPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to CelesteOS',
    description: 'Your intelligent assistant for yacht management and operations.',
    target: null,
    position: 'center',
    icon: <Sparkles size={24} />
  },
  {
    id: 'chat',
    title: 'Chat Interface',
    description: 'Type questions about maintenance, troubleshooting, or documentation.',
    target: '.query_input_container',
    position: 'top',
    icon: <MessageSquare size={24} />
  },
  {
    id: 'prompts',
    title: 'Quick Prompts',
    description: 'Select from suggested prompts to get started quickly.',
    target: '.preloaded-questions-container',
    position: 'top',
    icon: <Sparkles size={24} />
  },
  {
    id: 'askAlex',
    title: 'Ask Alex',
    description: 'Direct questions to our founder for platform insights.',
    target: 'button:has-text("Ask Alex")',
    position: 'bottom-right',
    icon: <User size={24} />
  },
  {
    id: 'sidebar',
    title: 'Conversation History',
    description: 'Access previous chats and saved information.',
    target: '.sidebar_collapse_toggle',
    position: 'right',
    icon: <Menu size={24} />
  },
  {
    id: 'tokens',
    title: 'Token Usage',
    description: 'Monitor your daily allocation of 50,000 tokens.',
    target: '.token-display-component',
    position: 'top',
    icon: <Calculator size={24} />
  },
  {
    id: 'complete',
    title: 'Setup Complete',
    description: "You're ready to use CelesteOS.",
    target: null,
    position: 'center',
    icon: <CheckCircle size={24} />
  }
];

export function TutorialOverlay({ isVisible, onComplete, isDarkMode = false }: TutorialOverlayProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [highlightPosition, setHighlightPosition] = useState<HighlightPosition | null>(null);

  const currentStep = tutorialSteps[currentStepIndex];

  useEffect(() => {
    if (isVisible && currentStep?.target) {
      const timer = setTimeout(() => {
        updateHighlightPosition();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentStepIndex, isVisible]);

  useEffect(() => {
    const handleResize = () => {
      if (isVisible && currentStep?.target) {
        updateHighlightPosition();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentStepIndex, isVisible]);

  const updateHighlightPosition = () => {
    if (!currentStep?.target) {
      setHighlightPosition(null);
      return;
    }

    let element: Element | null = null;
    
    if (currentStep.target.startsWith('button:has-text')) {
      const text = currentStep.target.match(/\("(.+)"\)/)?.[1];
      const buttons = document.querySelectorAll('button');
      element = Array.from(buttons).find(btn => btn.textContent?.includes(text || '')) || null;
    } else {
      element = document.querySelector(currentStep.target);
    }

    if (element) {
      const rect = element.getBoundingClientRect();
      setHighlightPosition({
        top: rect.top - 8,
        left: rect.left - 8,
        width: rect.width + 16,
        height: rect.height + 16
      });
    } else {
      console.warn(`Tutorial: Element not found for selector "${currentStep.target}"`);
      setHighlightPosition(null);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < tutorialSteps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStepIndex(currentStepIndex + 1);
        setIsAnimating(false);
      }, 200);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStepIndex(currentStepIndex - 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('hasCompletedTutorial', 'true');
    localStorage.setItem('tutorialCompletedAt', new Date().toISOString());
    onComplete();
  };

  if (!isVisible || !currentStep) return null;

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === tutorialSteps.length - 1;

  const getTooltipPosition = (): React.CSSProperties => {
    if (!highlightPosition || currentStep.position === 'center') {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }

    const styles: React.CSSProperties = {};
    const cardWidth = 320;
    const spacing = 16;

    switch (currentStep.position) {
      case 'top':
        styles.bottom = `${window.innerHeight - highlightPosition.top + spacing}px`;
        styles.left = `${highlightPosition.left + highlightPosition.width / 2}px`;
        styles.transform = 'translateX(-50%)';
        break;
      case 'bottom':
        styles.top = `${highlightPosition.top + highlightPosition.height + spacing}px`;
        styles.left = `${highlightPosition.left + highlightPosition.width / 2}px`;
        styles.transform = 'translateX(-50%)';
        break;
      case 'left':
        styles.top = `${highlightPosition.top + highlightPosition.height / 2}px`;
        styles.right = `${window.innerWidth - highlightPosition.left + spacing}px`;
        styles.transform = 'translateY(-50%)';
        break;
      case 'right':
        styles.top = `${highlightPosition.top + highlightPosition.height / 2}px`;
        styles.left = `${highlightPosition.left + highlightPosition.width + spacing}px`;
        styles.transform = 'translateY(-50%)';
        break;
      case 'bottom-right':
        styles.top = `${highlightPosition.top + highlightPosition.height + spacing}px`;
        styles.left = `${highlightPosition.left + highlightPosition.width + spacing}px`;
        break;
      default:
        styles.top = '50%';
        styles.left = '50%';
        styles.transform = 'translate(-50%, -50%)';
    }

    // Ensure card stays within viewport
    if (styles.left && typeof styles.left === 'string') {
      const leftValue = parseInt(styles.left);
      if (leftValue + cardWidth > window.innerWidth - 20) {
        styles.left = `${window.innerWidth - cardWidth - 20}px`;
        styles.transform = styles.transform?.replace('translateX(-50%)', '') || 'none';
      }
      if (leftValue < 20) {
        styles.left = '20px';
        styles.transform = styles.transform?.replace('translateX(-50%)', '') || 'none';
      }
    }

    return styles;
  };

  return (
    <div className="tutorial-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 10000,
      pointerEvents: 'none',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      {/* Dark backdrop with cutout */}
      {highlightPosition ? (
        <svg
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'auto',
            zIndex: 9998
          }}
          onClick={handleSkip}
        >
          <defs>
            <mask id="cutout">
              <rect width="100%" height="100%" fill="white" />
              <rect
                x={highlightPosition.left}
                y={highlightPosition.top}
                width={highlightPosition.width}
                height={highlightPosition.height}
                rx="6"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.4)"
            mask="url(#cutout)"
          />
        </svg>
      ) : (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          pointerEvents: 'auto',
          zIndex: 9998
        }} onClick={handleSkip} />
      )}
      
      {/* Highlight border around target element */}
      {highlightPosition && (
        <div style={{
          position: 'fixed',
          top: highlightPosition.top,
          left: highlightPosition.left,
          width: highlightPosition.width,
          height: highlightPosition.height,
          border: '2px solid rgba(59, 130, 246, 0.8)',
          borderRadius: '6px',
          pointerEvents: 'none',
          transition: 'all 0.3s ease-out',
          zIndex: 10001,
          animation: 'pulse 2s infinite'
        }} />
      )}

      {/* Tutorial card */}
      <div 
        style={{
          position: 'fixed',
          ...getTooltipPosition(),
          width: '320px',
          maxWidth: 'calc(100vw - 32px)',
          background: isDarkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.08)',
          pointerEvents: 'auto',
          opacity: isAnimating ? 0 : 1,
          transition: 'all 0.2s ease-out',
          zIndex: 10002
        }}
      >
        {/* Close button */}
        <button
          onClick={handleSkip}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(0, 0, 0, 0.05)',
            color: 'rgba(0, 0, 0, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            padding: 0
          }}
        >
          <X size={16} />
        </button>
        
        {/* Progress indicator */}
        <div style={{
          display: 'flex',
          gap: '2px',
          marginBottom: '16px',
          height: '2px'
        }}>
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              style={{
                flex: 1,
                height: '100%',
                background: index <= currentStepIndex ? 'rgba(59, 130, 246, 0.8)' : '#e5e7eb',
                transition: 'all 0.3s'
              }}
            />
          ))}
        </div>

        {/* Header with icon */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          marginBottom: '12px'
        }}>
          <div style={{
            color: '#3b82f6',
            flexShrink: 0
          }}>
            {currentStep.icon}
          </div>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            color: isDarkMode ? '#f6f7fb' : '#111827',
            lineHeight: 1.3,
            margin: 0
          }}>
            {currentStep.title}
          </h3>
        </div>

        {/* Description */}
        <p style={{
          fontSize: '14px',
          color: isDarkMode ? 'rgba(246, 247, 251, 0.7)' : 'rgba(0, 0, 0, 0.7)',
          lineHeight: 1.6,
          marginBottom: '20px',
          marginLeft: '36px'
        }}>
          {currentStep.description}
        </p>

        {/* Navigation */}
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'space-between',
          marginLeft: '36px'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {!isFirstStep && (
              <button
                onClick={handlePrevious}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px 12px',
                  background: 'transparent',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '6px',
                  color: isDarkMode ? 'rgba(246, 247, 251, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <ChevronLeft size={14} />
                Back
              </button>
            )}

            <button
              onClick={handleNext}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 16px',
                background: 'rgba(59, 130, 246, 0.9)',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {isLastStep ? 'Complete' : 'Next'}
              {isLastStep ? <CheckCircle size={14} /> : <ChevronRight size={14} />}
            </button>
          </div>

          {!isLastStep && (
            <button
              onClick={handleSkip}
              style={{
                padding: '8px 12px',
                background: 'transparent',
                border: 'none',
                color: 'rgba(0, 0, 0, 0.4)',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
            >
              Skip
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
        }
      `}</style>
    </div>
  );
}

export default TutorialOverlay;