import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';

/**
 * TutorialOverlay Component - Phase 3
 * Interactive onboarding that highlights key features
 */

const tutorialSteps = [
  {
    id: 'welcome',
    title: 'Welcome to CelesteOS',
    description: 'Your AI-powered yacht management assistant. Let me show you around.',
    target: null,
    position: 'center',
    icon: '👋'
  },
  {
    id: 'chat',
    title: 'Ask Anything About Your Yacht',
    description: 'Type your questions here. I can help with maintenance, troubleshooting, documentation, and more.',
    target: '.chat-input-container',
    position: 'top',
    icon: '💬'
  },
  {
    id: 'prompts',
    title: 'Quick Start Prompts',
    description: 'Not sure where to start? Try one of these suggested prompts to get going.',
    target: '.guided-prompts-container',
    position: 'bottom',
    icon: '🚀'
  },
  {
    id: 'askAlex',
    title: 'Meet Alex, Our Founder',
    description: 'Have questions about CelesteOS? Click here to chat with our founder Alex.',
    target: 'button:has-text("Ask Alex")',
    position: 'bottom',
    icon: '👨‍💼'
  },
  {
    id: 'sidebar',
    title: 'Your Conversation History',
    description: 'Access all your previous chats here. We save everything so you never lose important information.',
    target: '.sidebar-toggle',
    position: 'right',
    icon: '📚'
  },
  {
    id: 'tokens',
    title: 'Token Usage',
    description: 'Keep track of your daily token usage here. You get 50,000 tokens per day.',
    target: '.token-display',
    position: 'bottom',
    icon: '🎯'
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'You\'re ready to start using CelesteOS. Remember, I\'m here to help with any yacht-related questions.',
    target: null,
    position: 'center',
    icon: '🎉'
  }
];

export function TutorialOverlay({ isVisible, onComplete, isDarkMode = false }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [highlightPosition, setHighlightPosition] = useState(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (isVisible && tutorialSteps[currentStep].target) {
      updateHighlightPosition();
    }
  }, [currentStep, isVisible]);

  useEffect(() => {
    // Update position on resize
    const handleResize = () => {
      if (isVisible && tutorialSteps[currentStep].target) {
        updateHighlightPosition();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentStep, isVisible]);

  const updateHighlightPosition = () => {
    const step = tutorialSteps[currentStep];
    if (!step.target) {
      setHighlightPosition(null);
      return;
    }

    // Find target element
    let element = null;
    if (step.target.startsWith('button:has-text')) {
      const text = step.target.match(/\("(.+)"\)/)?.[1];
      const buttons = document.querySelectorAll('button');
      element = Array.from(buttons).find(btn => btn.textContent.includes(text));
    } else {
      element = document.querySelector(step.target);
    }

    if (element) {
      const rect = element.getBoundingClientRect();
      setHighlightPosition({
        top: rect.top - 10,
        left: rect.left - 10,
        width: rect.width + 20,
        height: rect.height + 20
      });
    }
  };

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setIsAnimating(true);
      setHasInteracted(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 200);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const handleSkip = () => {
    if (window.confirm('Are you sure you want to skip the tutorial? You can always restart it from settings.')) {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('hasCompletedTutorial', 'true');
    localStorage.setItem('tutorialCompletedAt', new Date().toISOString());
    onComplete();
  };

  if (!isVisible) return null;

  const step = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tutorialSteps.length - 1;

  // Position styles for tooltip
  const getTooltipPosition = () => {
    if (!highlightPosition || step.position === 'center') {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10002
      };
    }

    const styles = {
      position: 'fixed',
      zIndex: 10002
    };

    switch (step.position) {
      case 'top':
        styles.bottom = `${window.innerHeight - highlightPosition.top + 20}px`;
        styles.left = `${highlightPosition.left + highlightPosition.width / 2}px`;
        styles.transform = 'translateX(-50%)';
        break;
      case 'bottom':
        styles.top = `${highlightPosition.top + highlightPosition.height + 20}px`;
        styles.left = `${highlightPosition.left + highlightPosition.width / 2}px`;
        styles.transform = 'translateX(-50%)';
        break;
      case 'left':
        styles.top = `${highlightPosition.top + highlightPosition.height / 2}px`;
        styles.right = `${window.innerWidth - highlightPosition.left + 20}px`;
        styles.transform = 'translateY(-50%)';
        break;
      case 'right':
        styles.top = `${highlightPosition.top + highlightPosition.height / 2}px`;
        styles.left = `${highlightPosition.left + highlightPosition.width + 20}px`;
        styles.transform = 'translateY(-50%)';
        break;
      default:
        styles.top = '50%';
        styles.left = '50%';
        styles.transform = 'translate(-50%, -50%)';
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
      {/* Dark backdrop */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        pointerEvents: 'auto'
      }} onClick={handleSkip} />

      {/* Highlight box */}
      {highlightPosition && (
        <div style={{
          position: 'fixed',
          ...highlightPosition,
          border: '2px solid var(--color-primary)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.2), 0 0 40px rgba(59, 130, 246, 0.4)',
          pointerEvents: 'none',
          transition: 'all 0.3s ease-out',
          zIndex: 10001
        }} />
      )}

      {/* Tutorial card */}
      <div 
        className={`tutorial-card ${isAnimating ? 'animating' : ''}`}
        style={{
          ...getTooltipPosition(),
          width: '400px',
          maxWidth: '90vw',
          background: isDarkMode 
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 250, 251, 0.98) 100%)',
          backdropFilter: 'blur(20px) saturate(1.5)',
          border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--spacing-6)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 80px rgba(59, 130, 246, 0.2)',
          pointerEvents: 'auto',
          opacity: isAnimating ? 0 : 1,
          transform: isAnimating 
            ? `${getTooltipPosition().transform} scale(0.95)` 
            : getTooltipPosition().transform,
          transition: 'all 0.2s ease-out'
        }}
      >
        {/* Progress bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-accent) 100%)',
            transition: 'width 0.3s ease-out',
            boxShadow: '0 0 10px var(--color-primary-accent)'
          }} />
        </div>

        {/* Close button */}
        <button
          onClick={handleSkip}
          style={{
            position: 'absolute',
            top: 'var(--spacing-3)',
            right: 'var(--spacing-3)',
            padding: 'var(--spacing-2)',
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            borderRadius: 'var(--radius-md)',
            transition: 'all var(--transition-base)'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
            e.target.style.color = 'var(--color-text-primary)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = 'var(--color-text-muted)';
          }}
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div style={{
          fontSize: '48px',
          marginBottom: 'var(--spacing-4)',
          lineHeight: 1,
          animation: hasInteracted ? 'none' : 'pulse 2s infinite'
        }}>
          {step.icon}
        </div>

        {/* Content */}
        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--spacing-3)',
          lineHeight: 1.3
        }}>
          {step.title}
        </h3>

        <p style={{
          fontSize: '15px',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.6,
          marginBottom: 'var(--spacing-5)'
        }}>
          {step.description}
        </p>

        {/* Step indicators */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 'var(--spacing-2)',
          marginBottom: 'var(--spacing-4)'
        }}>
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: index <= currentStep 
                  ? 'var(--color-primary)'
                  : isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                transition: 'all var(--transition-base)',
                transform: index === currentStep ? 'scale(1.25)' : 'scale(1)'
              }}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div style={{
          display: 'flex',
          gap: 'var(--spacing-3)',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={handlePrevious}
            disabled={isFirstStep}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-2)',
              padding: 'var(--spacing-2) var(--spacing-3)',
              background: 'transparent',
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
              borderRadius: 'var(--radius-md)',
              color: isFirstStep ? 'var(--color-text-disabled)' : 'var(--color-text-secondary)',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isFirstStep ? 'not-allowed' : 'pointer',
              transition: 'all var(--transition-base)',
              opacity: isFirstStep ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (!isFirstStep) {
                e.target.style.background = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)';
                e.target.style.borderColor = 'var(--color-primary)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
            }}
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <button
            onClick={handleNext}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-2)',
              padding: 'var(--spacing-2) var(--spacing-4)',
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all var(--transition-base)',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
              flex: 1
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
            }}
          >
            {isLastStep ? (
              <>
                Complete Tutorial
                <CheckCircle size={16} />
              </>
            ) : (
              <>
                Next
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>

        {/* Skip option */}
        {!isLastStep && (
          <button
            onClick={handleSkip}
            style={{
              display: 'block',
              margin: 'var(--spacing-3) auto 0',
              padding: 0,
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-muted)',
              fontSize: '13px',
              cursor: 'pointer',
              textDecoration: 'underline',
              transition: 'color var(--transition-base)'
            }}
            onMouseEnter={(e) => e.target.style.color = 'var(--color-text-secondary)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--color-text-muted)'}
          >
            Skip tutorial
          </button>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .tutorial-card.animating {
          pointer-events: none;
        }

        @media (max-width: 640px) {
          .tutorial-card {
            width: calc(100vw - 32px) !important;
            max-width: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default TutorialOverlay;