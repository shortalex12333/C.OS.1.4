import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, ChevronDown, CheckCircle, MessageSquare, Search, FileText, Mail, Ship, ArrowRight, Settings, Download, Calendar, Send, ThumbsUp, MessageCircle } from 'lucide-react';

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
    id: 'solution_card_found',
    title: 'Solution Found',
    description: 'This is a solution card that contains the answer to your query.',
    target: '.solution_card',
    position: 'right',
    icon: <CheckCircle size={24} />,
    phase: 'solution'
  },
  {
    id: 'expand_solution',
    title: 'Click to Expand',
    description: 'Click on the solution card header to expand and see the full answer.',
    target: '.solution_header',
    position: 'right',
    icon: <ChevronDown size={24} />,
    requiresAction: true,
    actionText: 'Click the header to expand',
    phase: 'solution'
  },
  {
    id: 'solution_title',
    title: 'Solution Title',
    description: 'This shows the title and confidence score of the solution.',
    target: '.solution_title_display',
    position: 'right',
    icon: <FileText size={24} />,
    phase: 'solution'
  },
  {
    id: 'source_document',
    title: 'Source Document',
    description: 'This chip shows which manual or document contains this answer.',
    target: '.source_document_chip',
    position: 'left',
    icon: <FileText size={24} />,
    phase: 'solution'
  },
  {
    id: 'solution_steps',
    title: 'Detailed Steps',
    description: 'Here are the detailed steps or information from the source document.',
    target: '.solution_steps_list',
    position: 'right',
    icon: <FileText size={24} />,
    phase: 'solution'
  },
  {
    id: 'feedback_controls',
    title: 'Rate This Answer',
    description: 'Use these thumbs up/down buttons to rate how helpful this answer was.',
    target: '.feedback_controls',
    position: 'top',
    icon: <ThumbsUp size={24} />,
    phase: 'solution'
  },
  {
    id: 'leave_feedback',
    title: 'Leave Detailed Feedback',
    description: 'Click here to provide specific feedback about this answer.',
    target: '.leave_feedback_button',
    position: 'left',
    icon: <MessageCircle size={24} />,
    requiresAction: true,
    actionText: 'Click to open feedback form',
    phase: 'solution'
  },
  {
    id: 'feedback_form',
    title: 'Type Your Feedback',
    description: 'Enter your specific feedback to help us improve our responses.',
    target: '.feedback_message_input',
    position: 'top',
    icon: <MessageSquare size={24} />,
    requiresAction: true,
    actionText: 'Type some feedback and continue',
    phase: 'solution'
  },
  {
    id: 'send_feedback',
    title: 'Send Feedback',
    description: 'Click here to submit your feedback to our improvement system.',
    target: '.send_feedback_button',
    position: 'left',
    icon: <Send size={24} />,
    requiresAction: true,
    actionText: 'Click to send feedback',
    phase: 'solution'
  },
  {
    id: 'try_more_questions',
    title: 'Ask More Questions',
    description: 'Now you understand how to use solution cards! Ask any technical question.',
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
  // Initialize phase based on what's been completed
  const getInitialPhase = () => {
    const hasCompletedInitial = localStorage.getItem('hasCompletedInitialTutorial');
    const hasCompletedSolution = localStorage.getItem('hasCompletedSolutionTutorial');
    const hasSkippedInitial = localStorage.getItem('hasSkippedInitialTutorial');
    
    if (!hasCompletedInitial) {
      return 'initial';
    } else if (hasReceivedJSON && !hasCompletedSolution) {
      // Show solution tutorial whether initial was completed or skipped
      console.log('🎓 Initializing solution phase', { hasCompletedInitial, hasSkippedInitial, hasReceivedJSON });
      return 'solution';
    }
    return 'initial';
  };
  
  const [currentPhase, setCurrentPhase] = useState<'initial' | 'solution' | 'switch' | 'export'>(getInitialPhase());
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

  // Reset phase when component becomes visible and we should be in solution phase
  useEffect(() => {
    if (isVisible) {
      const hasCompletedInitial = localStorage.getItem('hasCompletedInitialTutorial');
      const hasCompletedSolution = localStorage.getItem('hasCompletedSolutionTutorial');
      
      if (hasCompletedInitial && !hasCompletedSolution && hasReceivedJSON && currentPhase !== 'solution') {
        console.log('🎓 Setting tutorial to solution phase');
        setCurrentPhase('solution');
        setCurrentStepIndex(0);
        setHasShownSolution(true);
      }
    }
  }, [isVisible, hasReceivedJSON, currentPhase]);

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
    // Check if initial tutorial was completed and solution tutorial hasn't been shown
    const hasCompletedInitial = localStorage.getItem('hasCompletedInitialTutorial');
    const hasCompletedSolution = localStorage.getItem('hasCompletedSolutionTutorial');
    
    if (hasReceivedJSON && !hasShownSolution && messageCount > 0 && hasCompletedInitial && !hasCompletedSolution) {
      setTimeout(() => {
        setHasShownSolution(true);
        setCurrentPhase('solution');
        setCurrentStepIndex(0);
        // Re-enable the tutorial overlay by calling parent to show it
        if (!isVisible) {
          // The tutorial was hidden after initial phase, we need to re-trigger it
          console.log('🎓 Re-showing tutorial for solution phase');
        }
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
      // Add delay and retry mechanism to ensure DOM elements are rendered
      let retryCount = 0;
      const maxRetries = 5;
      
      const tryUpdatePosition = () => {
        updateHighlightPosition();
        
        // If no highlight position was set and we have retries left, try again
        if (!highlightPosition && retryCount < maxRetries) {
          retryCount++;
          console.log(`Tutorial: Retrying position update (${retryCount}/${maxRetries}) for "${step.target}"`);
          setTimeout(tryUpdatePosition, 200 * retryCount); // Increasing delay
        }
      };
      
      const timer = setTimeout(tryUpdatePosition, 500);
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

  // Auto-advance tutorial when required actions are completed
  useEffect(() => {
    if (!isVisible || !step?.requiresAction) return;

    const checkActionCompleted = () => {
      if (step.id === 'expand_solution') {
        const element = document.querySelector(step.target);
        if (element) {
          const solutionCard = element.closest('.solution_card');
          const isExpanded = solutionCard?.querySelector('.solution_expanded_content');
          if (isExpanded) {
            console.log('Tutorial: Solution card expanded, auto-advancing');
            setTimeout(() => {
              setCurrentStepIndex(prev => prev + 1);
            }, 800); // Small delay to let user see the expansion
            return true;
          }
        }
      }
      
      if (step.id === 'leave_feedback') {
        const feedbackForm = document.querySelector('.feedback_form_container');
        if (feedbackForm) {
          console.log('Tutorial: Feedback form opened, auto-advancing');
          setTimeout(() => {
            setCurrentStepIndex(prev => prev + 1);
          }, 500);
          return true;
        }
      }

      return false;
    };

    // Set up a mutation observer to watch for DOM changes
    const observer = new MutationObserver(() => {
      checkActionCompleted();
    });

    // Observe the entire document for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });

    // Also check immediately and on interval as fallback
    const checkInterval = setInterval(checkActionCompleted, 500);

    return () => {
      observer.disconnect();
      clearInterval(checkInterval);
    };
  }, [currentStepIndex, isVisible, step]);

  const updateHighlightPosition = () => {
    if (!step?.target) {
      setHighlightPosition(null);
      return;
    }

    let element: Element | null = null;
    
    // Enhanced element finding logic
    if (step.target.startsWith('button:has-text')) {
      const text = step.target.match(/\("(.+)"\)/)?.[1];
      const buttons = document.querySelectorAll('button');
      element = Array.from(buttons).find(btn => btn.textContent?.includes(text || '')) || null;
    } else {
      // Try multiple selectors for better reliability
      const selectors = [
        step.target,
        step.target.replace('.', ''), // Try without dot
        `[class*="${step.target.replace('.', '')}"]`, // Try partial class match
        `${step.target}:first-child`, // Try first child
        `${step.target}:first-of-type` // Try first of type
      ];
      
      for (const selector of selectors) {
        try {
          element = document.querySelector(selector);
          if (element) {
            console.log(`Tutorial: Found element with selector "${selector}"`);
            break;
          }
        } catch (e) {
          // Invalid selector, continue
        }
      }
    }

    if (element) {
      const rect = element.getBoundingClientRect();
      setHighlightPosition({
        top: rect.top - 8,
        left: rect.left - 8,
        width: rect.width + 16,
        height: rect.height + 16
      });
      console.log(`Tutorial: Positioned tooltip for "${step.target}" at`, rect);
    } else {
      console.warn(`Tutorial: Element not found for any selector variations of "${step.target}"`);
      console.log('Available elements:', Array.from(document.querySelectorAll('[class*="solution"], [class*="feedback"]')).map(el => el.className));
      
      // Fallback: try to find any solution card element
      const fallbackElement = document.querySelector('.solution_card, .solutions_container, .chat-message');
      if (fallbackElement) {
        const rect = fallbackElement.getBoundingClientRect();
        setHighlightPosition({
          top: rect.top - 8,
          left: rect.left - 8,
          width: rect.width + 16,
          height: rect.height + 16
        });
        console.log(`Tutorial: Using fallback element for "${step.target}"`);
      } else {
        setHighlightPosition(null);
      }
    }
  };

  const handleNext = () => {
    // Check if current step requires action and warn user
    if (step?.requiresAction) {
      const element = document.querySelector(step.target);
      if (element && step.id === 'expand_solution') {
        // Check if solution card is expanded
        const solutionCard = element.closest('.solution_card');
        const isExpanded = solutionCard?.querySelector('.solution_expanded_content');
        if (!isExpanded) {
          console.log('Tutorial: Solution card needs to be expanded first');
          // Don't advance until expanded
          return;
        }
      }
      
      if (step.id === 'leave_feedback') {
        // Check if feedback form is visible
        const feedbackForm = document.querySelector('.feedback_form_container');
        if (!feedbackForm) {
          console.log('Tutorial: Feedback form needs to be opened first');
          return;
        }
      }
      
      if (step.id === 'feedback_form') {
        // Check if feedback has been typed
        const feedbackInput = document.querySelector('.feedback_message_input') as HTMLTextAreaElement;
        if (!feedbackInput?.value?.trim()) {
          console.log('Tutorial: Please type some feedback first');
          return;
        }
      }
    }
    
    if (currentStepIndex < tutorialSteps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStepIndex(currentStepIndex + 1);
        setIsAnimating(false);
      }, 200);
    } else {
      // End of current phase
      if (currentPhase === 'initial' || currentPhase === 'solution') {
        handleComplete();
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
    // Skip only the current phase, not the entire tutorial
    if (currentPhase === 'initial') {
      // Mark initial tutorial as skipped, but allow solution tutorial later
      localStorage.setItem('hasCompletedInitialTutorial', 'true');
      localStorage.setItem('hasSkippedInitialTutorial', 'true');
      console.log('🎓 Initial tutorial skipped - solution tutorial will still be available');
      onComplete(); // Hide tutorial temporarily, will reshow for solution phase
    } else if (currentPhase === 'solution') {
      // Skip solution tutorial and mark entire tutorial as complete
      localStorage.setItem('hasCompletedSolutionTutorial', 'true');
      localStorage.setItem('hasSkippedSolutionTutorial', 'true');
      localStorage.setItem('hasCompletedTutorial', 'true'); // Mark entire tutorial as complete
      localStorage.setItem('tutorialCompletedAt', new Date().toISOString());
      console.log('🎓 Solution tutorial skipped - tutorial fully completed');
      onComplete(); // Fully complete tutorial
    } else {
      // For switch and export phases, just skip them
      localStorage.setItem(`hasCompleted${currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}Tutorial`, 'true');
      localStorage.setItem(`hasSkipped${currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}Tutorial`, 'true');
      onComplete();
    }
  };

  const handleComplete = () => {
    // Mark specific phase as completed
    if (currentPhase === 'initial') {
      localStorage.setItem('hasCompletedInitialTutorial', 'true');
      onComplete(); // Hide tutorial temporarily, will reshow for solution phase
    } else if (currentPhase === 'solution') {
      localStorage.setItem('hasCompletedSolutionTutorial', 'true');
      localStorage.setItem('hasCompletedTutorial', 'true'); // Mark entire tutorial as complete
      localStorage.setItem('tutorialCompletedAt', new Date().toISOString());
      onComplete(); // Fully complete tutorial
    } else {
      // For switch and export phases, just complete them
      localStorage.setItem(`hasCompleted${currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}Tutorial`, 'true');
      onComplete();
    }
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
          border: '2px solid #BADDE9',
          borderRadius: '8px',
          boxShadow: '0 0 20px rgba(186, 221, 233, 0.4), inset 0 0 20px rgba(186, 221, 233, 0.1)',
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
          background: 'rgba(15, 11, 18, 0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
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
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'rgba(246, 247, 251, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            padding: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.color = 'rgba(246, 247, 251, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.color = 'rgba(246, 247, 251, 0.4)';
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
                height: '2px',
                borderRadius: '1px',
                background: index <= currentStepIndex ? '#BADDE9' : 'rgba(255, 255, 255, 0.1)',
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
            color: '#BADDE9',
            flexShrink: 0
          }}>
            {step.icon}
          </div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            fontFamily: 'Eloquia Display, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            color: 'var(--headline, #f6f7fb)',
            lineHeight: '24px',
            letterSpacing: '-0.32px',
            margin: 0
          }}>
            {step.title}
          </h3>
        </div>

        {/* Description */}
        <p style={{
          fontSize: '14px',
          color: 'rgba(246, 247, 251, 0.7)',
          lineHeight: '20px',
          letterSpacing: '-0.32px',
          fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
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
            background: 'rgba(186, 221, 233, 0.1)',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#BADDE9',
            fontWeight: '500',
            fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
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
                padding: '8px 16px',
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '50px',
                color: 'rgba(246, 247, 251, 0.6)',
                fontSize: '13px',
                fontWeight: '500',
                fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.color = 'rgba(246, 247, 251, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = 'rgba(246, 247, 251, 0.6)';
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
                gap: '6px',
                height: '40px',
                padding: '0 24px',
                background: '#004aff',
                border: 'none',
                borderRadius: '50px',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: '600',
                fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                cursor: 'pointer',
                transition: 'all 200ms cubic-bezier(0.23, 1, 0.32, 1)',
                marginLeft: isFirstStep ? 'auto' : '0',
                boxShadow: '0 2px 8px rgba(0, 74, 255, 0.3)',
                transform: 'translateY(0)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#0052cc';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 74, 255, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#004aff';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 74, 255, 0.3)';
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
                padding: '8px 16px',
                background: 'transparent',
                border: 'none',
                color: 'rgba(246, 247, 251, 0.4)',
                fontSize: '13px',
                fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'rgba(246, 247, 251, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(246, 247, 251, 0.4)';
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
            box-shadow: 0 0 20px rgba(186, 221, 233, 0.4), inset 0 0 20px rgba(186, 221, 233, 0.1);
          }
          50% {
            box-shadow: 0 0 30px rgba(186, 221, 233, 0.6), inset 0 0 30px rgba(186, 221, 233, 0.2);
          }
          100% {
            box-shadow: 0 0 20px rgba(186, 221, 233, 0.4), inset 0 0 20px rgba(186, 221, 233, 0.1);
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