import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, CheckCircle, MessageSquare, Search, FileText, Mail, Ship, ArrowRight, Settings, Download, Calendar, Send, ThumbsUp, MessageCircle } from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target: string | null;
  position: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  icon: React.ReactNode;
  requiresAction?: boolean;
  actionText?: string;
  phase?: 'initial' | 'solution' | 'switch' | 'export';
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

// Initial tutorial steps - before first message
const initialSteps: TutorialStep[] = [
  {
    id: 'search_types',
    title: 'Choose Your Search Type',
    description: 'You can search through New Chat for general queries, Yacht Search for technical docs, or Email Search for communications.',
    target: '.sidebar-search-options',
    position: 'right',
    icon: <Search size={24} />,
    phase: 'initial'
  },
  {
    id: 'input_area',
    title: 'Type Your Question Here',
    description: 'Enter any technical question, fault code, or document request in this search box.',
    target: '.query_input_container',
    position: 'top',
    icon: <MessageSquare size={24} />,
    phase: 'initial'
  },
  {
    id: 'preloaded_questions',
    title: 'Try An Example Question',
    description: 'Click one of these preloaded questions to see how CelesteOS works.',
    target: '.preloaded-questions-container',
    position: 'top',
    icon: <ArrowRight size={24} />,
    requiresAction: true,
    actionText: 'Click a question to continue',
    phase: 'initial'
  }
];

// Solution card walkthrough - after first answer appears
const solutionSteps: TutorialStep[] = [
  {
    id: 'solution_card',
    title: 'Solution Found',
    description: 'This is the solution our system found for your query.',
    target: '.ai-solution-card',
    position: 'top',
    icon: <CheckCircle size={24} />,
    phase: 'solution'
  },
  {
    id: 'document_summary',
    title: 'Document Summary',
    description: 'Here\'s the name and summary of the source document.',
    target: '.solution-header',
    position: 'top',
    icon: <FileText size={24} />,
    phase: 'solution'
  },
  {
    id: 'document_found',
    title: 'Source Document',
    description: 'This shows which manual or document contains the answer.',
    target: '.source-document-chip',
    position: 'bottom',
    icon: <FileText size={24} />,
    phase: 'solution'
  },
  {
    id: 'content_summary',
    title: 'Content Summary',
    description: 'A brief summary of the relevant content from the document.',
    target: '.solution-steps',
    position: 'top',
    icon: <FileText size={24} />,
    phase: 'solution'
  },
  {
    id: 'feedback_ml',
    title: 'Help Improve Results',
    description: 'Your feedback helps our machine learning improve future responses.',
    target: '.feedback-buttons',
    position: 'top',
    icon: <ThumbsUp size={24} />,
    phase: 'solution'
  },
  {
    id: 'leave_feedback',
    title: 'Leave Detailed Feedback',
    description: 'Click here to provide specific feedback about this answer.',
    target: '.leave-feedback-button',
    position: 'top',
    icon: <MessageCircle size={24} />,
    requiresAction: true,
    actionText: 'Click to open feedback',
    phase: 'solution'
  },
  {
    id: 'feedback_input',
    title: 'Type Your Feedback',
    description: 'Enter your feedback here to help us improve.',
    target: '.feedback-textarea',
    position: 'top',
    icon: <MessageSquare size={24} />,
    requiresAction: true,
    actionText: 'Type feedback and continue',
    phase: 'solution'
  },
  {
    id: 'send_feedback',
    title: 'Send Feedback',
    description: 'Click here to submit your feedback.',
    target: '.send-feedback-button',
    position: 'left',
    icon: <Send size={24} />,
    requiresAction: true,
    actionText: 'Click to send',
    phase: 'solution'
  },
  {
    id: 'try_anything',
    title: 'Try Any Question',
    description: 'Now you can type any question and CelesteOS will help you find the answer.',
    target: '.query_input_container',
    position: 'top',
    icon: <MessageSquare size={24} />,
    phase: 'solution'
  }
];

// Email/NAS switch tutorial - after 3rd message
const switchSteps: TutorialStep[] = [
  {
    id: 'switch_source',
    title: 'Switch Search Source',
    description: 'Try switching between NAS and Email search using these buttons.',
    target: '.search_type_selector',
    position: 'top',
    icon: <Mail size={24} />,
    phase: 'switch'
  }
];

// Export tutorial - after 5th message
const exportSteps: TutorialStep[] = [
  {
    id: 'open_settings',
    title: 'Open Settings',
    description: 'Click here to access settings and export options.',
    target: '.settings_button',
    position: 'left',
    icon: <Settings size={24} />,
    requiresAction: true,
    actionText: 'Click Settings',
    phase: 'export'
  },
  {
    id: 'handover_section',
    title: 'Export Handover',
    description: 'Navigate to the Handover section to export your findings.',
    target: '.handover-section',
    position: 'right',
    icon: <Download size={24} />,
    phase: 'export'
  },
  {
    id: 'date_range',
    title: 'Select Date Range',
    description: 'Choose 7, 30, 60, or 90 days, or set a custom date range.',
    target: '.date-range-selector',
    position: 'right',
    icon: <Calendar size={24} />,
    phase: 'export'
  },
  {
    id: 'send_email',
    title: 'Send to Email',
    description: 'Click here to send the handover PDF to your email.',
    target: '.send-to-email-button',
    position: 'left',
    icon: <Send size={24} />,
    phase: 'export'
  }
];

export function TutorialOverlay({ isVisible, onComplete, isDarkMode = false, messageCount = 0, hasReceivedJSON = false }: TutorialOverlayProps) {
  const [currentPhase, setCurrentPhase] = useState<'initial' | 'solution' | 'switch' | 'export'>('initial');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [highlightPosition, setHighlightPosition] = useState<HighlightPosition | null>(null);
  const [hasShownSolution, setHasShownSolution] = useState(false);
  const [hasShownSwitch, setHasShownSwitch] = useState(false);
  const [hasShownExport, setHasShownExport] = useState(false);

  // Determine which steps to show based on phase
  const getCurrentSteps = () => {
    switch (currentPhase) {
      case 'initial':
        return initialSteps;
      case 'solution':
        return solutionSteps;
      case 'switch':
        return switchSteps;
      case 'export':
        return exportSteps;
      default:
        return initialSteps;
    }
  };

  const tutorialSteps = getCurrentSteps();
  const step = tutorialSteps[currentStepIndex];

  // Monitor message count to trigger different tutorial phases
  useEffect(() => {
    if (!isVisible) return;

    // When user sends first message in initial phase, complete the tutorial
    if (messageCount > 0 && currentPhase === 'initial') {
      // If we're on the last step of initial phase (preloaded questions)
      if (currentStepIndex === initialSteps.length - 1 || step?.id === 'preloaded_questions') {
        handleComplete();
        return;
      }
    }

    // Only show solution walkthrough when JSON is received (with 1s delay)
    if (hasReceivedJSON && !hasShownSolution && messageCount > 0) {
      setTimeout(() => {
        setHasShownSolution(true);
        setCurrentPhase('solution');
        setCurrentStepIndex(0);
      }, 1000);
    }

    // After 3rd message, show switch tutorial
    if (messageCount === 3 && !hasShownSwitch) {
      setHasShownSwitch(true);
      setCurrentPhase('switch');
      setCurrentStepIndex(0);
    }

    // After 5th message, show export tutorial
    if (messageCount === 5 && !hasShownExport) {
      setHasShownExport(true);
      setCurrentPhase('export');
      setCurrentStepIndex(0);
    }
  }, [messageCount, isVisible, hasShownSolution, hasShownSwitch, hasShownExport, currentPhase, hasReceivedJSON, currentStepIndex, step]);

  useEffect(() => {
    if (isVisible && step?.target) {
      // Add delay to ensure DOM elements are rendered
      const timer = setTimeout(() => {
        updateHighlightPosition();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentStepIndex, isVisible, currentPhase]);

  useEffect(() => {
    const handleResize = () => {
      if (isVisible && step?.target) {
        updateHighlightPosition();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentStepIndex, isVisible]);

  const updateHighlightPosition = () => {
    if (!step?.target) {
      setHighlightPosition(null);
      return;
    }

    let element: Element | null = null;
    if (step.target.startsWith('button:has-text')) {
      const text = step.target.match(/\("(.+)"\)/)?.[1];
      const buttons = document.querySelectorAll('button');
      element = Array.from(buttons).find(btn => btn.textContent?.includes(text || '')) || null;
    } else {
      element = document.querySelector(step.target);
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
      console.warn(`Tutorial: Element not found for selector "${step.target}"`);
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
      // End of current phase
      if (currentPhase === 'initial' || currentPhase === 'solution') {
        // Wait for next trigger
        setCurrentPhase('initial');
        setCurrentStepIndex(0);
      } else {
        handleComplete();
      }
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

  if (!isVisible || !step) return null;

  const progress = ((currentStepIndex + 1) / tutorialSteps.length) * 100;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === tutorialSteps.length - 1;

  // Calculate tooltip position to be next to highlighted element
  const getTooltipPosition = (): React.CSSProperties => {
    if (!highlightPosition || step.position === 'center') {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }

    const styles: React.CSSProperties = {};

    const cardWidth = 320;
    const cardHeight = 200;
    const spacing = 16;

    switch (step.position) {
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
      }
      if (leftValue < 20) {
        styles.left = '20px';
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
      {/* Dark overlay sections that can be clicked to skip - with cutout */}
      {highlightPosition ? (
        <>
          {/* Top dark section */}
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: `${highlightPosition.top}px`,
            background: 'rgba(0, 0, 0, 0.4)',
            pointerEvents: 'auto',
            zIndex: 9997
          }} onClick={handleSkip} />
          
          {/* Bottom dark section */}
          <div style={{
            position: 'fixed',
            top: `${highlightPosition.top + highlightPosition.height}px`,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            pointerEvents: 'auto',
            zIndex: 9997
          }} onClick={handleSkip} />
          
          {/* Left dark section */}
          <div style={{
            position: 'fixed',
            top: `${highlightPosition.top}px`,
            left: 0,
            width: `${highlightPosition.left}px`,
            height: `${highlightPosition.height}px`,
            background: 'rgba(0, 0, 0, 0.4)',
            pointerEvents: 'auto',
            zIndex: 9997
          }} onClick={handleSkip} />
          
          {/* Right dark section */}
          <div style={{
            position: 'fixed',
            top: `${highlightPosition.top}px`,
            left: `${highlightPosition.left + highlightPosition.width}px`,
            right: 0,
            height: `${highlightPosition.height}px`,
            background: 'rgba(0, 0, 0, 0.4)',
            pointerEvents: 'auto',
            zIndex: 9997
          }} onClick={handleSkip} />
        </>
      ) : (
        /* Full dark overlay when no element is highlighted */
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          pointerEvents: 'auto',
          zIndex: 9997
        }} onClick={handleSkip} />
      )}
      
      {/* Blur backdrop with cutout for highlighted element - no pointer events */}
      {highlightPosition ? (
        <>
          {/* Top blur section */}
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: `${highlightPosition.top}px`,
            backdropFilter: 'blur(8px)',
            pointerEvents: 'none',
            zIndex: 9998
          }} />
          
          {/* Bottom blur section */}
          <div style={{
            position: 'fixed',
            top: `${highlightPosition.top + highlightPosition.height}px`,
            left: 0,
            right: 0,
            bottom: 0,
            backdropFilter: 'blur(8px)',
            pointerEvents: 'none',
            zIndex: 9998
          }} />
          
          {/* Left blur section */}
          <div style={{
            position: 'fixed',
            top: `${highlightPosition.top}px`,
            left: 0,
            width: `${highlightPosition.left}px`,
            height: `${highlightPosition.height}px`,
            backdropFilter: 'blur(8px)',
            pointerEvents: 'none',
            zIndex: 9998
          }} />
          
          {/* Right blur section */}
          <div style={{
            position: 'fixed',
            top: `${highlightPosition.top}px`,
            left: `${highlightPosition.left + highlightPosition.width}px`,
            right: 0,
            height: `${highlightPosition.height}px`,
            backdropFilter: 'blur(8px)',
            pointerEvents: 'none',
            zIndex: 9998
          }} />
          
        </>
      ) : (
        /* Full blur when no element is highlighted */
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backdropFilter: 'blur(8px)',
          pointerEvents: 'none',
          zIndex: 9998
        }} />
      )}
      
      {/* Highlight box around target element */}
      {highlightPosition && (
        <div style={{
          position: 'fixed',
          ...highlightPosition,
          border: '3px solid #0D47A1',
          borderRadius: '0px',
          boxShadow: '0 0 20px rgba(13,71,161,0.6), inset 0 0 20px rgba(13,71,161,0.2)',
          pointerEvents: 'none',
          transition: 'all 0.3s ease-out',
          zIndex: 10001,
          animation: 'pulse 2s infinite'
        }} />
      )}

      {/* Tutorial card */}
      <div 
        className={`tutorial-card ${isAnimating ? 'animating' : ''}`}
        style={{
          position: 'fixed',
          ...getTooltipPosition(),
          width: '360px',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(10px)',
          border: '2px solid #0D47A1',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          pointerEvents: 'auto',
          opacity: isAnimating ? 0 : 1,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.color = 'rgba(0, 0, 0, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
            e.currentTarget.style.color = 'rgba(0, 0, 0, 0.4)';
          }}
        >
          <X size={16} />
        </button>
        
        {/* Progress indicator */}
        <div style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '16px'
        }}>
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              style={{
                flex: 1,
                height: '3px',
                borderRadius: '1.5px',
                background: index <= currentStepIndex ? '#0D47A1' : '#e0e0e0',
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
            color: '#0D47A1',
            flexShrink: 0
          }}>
            {step.icon}
          </div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            color: '#111827',
            lineHeight: 1.3,
            margin: 0
          }}>
            {step.title}
          </h3>
        </div>

        {/* Description */}
        <p style={{
          fontSize: '14px',
          color: 'rgba(0, 0, 0, 0.7)',
          lineHeight: 1.6,
          marginBottom: '16px',
          marginLeft: '36px'
        }}>
          {step.description}
        </p>

        {/* Action text if requires action */}
        {step.requiresAction && step.actionText && (
          <div style={{
            marginLeft: '36px',
            marginBottom: '12px',
            padding: '8px 12px',
            background: 'rgba(13, 71, 161, 0.1)',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#0D47A1',
            fontWeight: '500'
          }}>
            👆 {step.actionText}
          </div>
        )}

        {/* Navigation */}
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'space-between',
          marginLeft: '36px'
        }}>
          {!isFirstStep && (
            <button
              onClick={handlePrevious}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                background: 'transparent',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '6px',
                color: 'rgba(0, 0, 0, 0.6)',
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

          {!step.requiresAction && (
            <button
              onClick={handleNext}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 16px',
                background: '#0D47A1',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginLeft: isFirstStep ? 'auto' : '0'
              }}
            >
              {isLastStep ? 'Complete' : 'Next'}
              {isLastStep ? <CheckCircle size={14} /> : <ChevronRight size={14} />}
            </button>
          )}

          {!isLastStep && (
            <button
              onClick={handleSkip}
              style={{
                padding: '6px 12px',
                background: 'transparent',
                border: 'none',
                color: 'rgba(0, 0, 0, 0.4)',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
            >
              {currentPhase === 'initial' ? 'Close' : 'Skip Tutorial'}
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
            box-shadow: 0 0 20px rgba(13,71,161,0.6), inset 0 0 20px rgba(13,71,161,0.2);
          }
          50% {
            box-shadow: 0 0 30px rgba(13,71,161,0.8), inset 0 0 30px rgba(13,71,161,0.3);
          }
          100% {
            box-shadow: 0 0 20px rgba(13,71,161,0.6), inset 0 0 20px rgba(13,71,161,0.2);
          }
        }

        .tutorial-card.animating {
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

export default TutorialOverlay;