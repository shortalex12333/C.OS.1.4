import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, ExternalLink, Copy, AlertTriangle, Info, CheckCircle, ThumbsUp, ThumbsDown, MessageSquare, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SolutionSource {
  title: string;
  page?: number;
  revision?: string;
}

interface Solution {
  id?: string;
  solution_id?: string; // New webhook format uses solution_id
  title: string;
  confidence?: 'low' | 'medium' | 'high' | number; // Can be string or numeric
  confidenceScore?: number; // Percentage score for circle button color
  description?: string; // New field from webhook
  source?: SolutionSource;
  source_document?: any; // New field from webhook
  steps?: Array<{
    text: string;
    type?: 'warning' | 'tip' | 'normal';
    isBold?: boolean;
  }> | string[]; // Can be array of strings
  procedureLink?: string;
  original_doc_url?: string; // New field from webhook
  parts_needed?: string[]; // New field
  estimated_time?: string; // New field
  safety_warnings?: string[]; // New field
  specifications?: any; // New field
}

interface AISolutionCardProps {
  solutions: Solution[];
  isMobile?: boolean;
  isDarkMode?: boolean;
}

export function AISolutionCard({ solutions, isMobile = false, isDarkMode = false }: AISolutionCardProps) {
  // Default: All solutions collapsed on first receival
  const [expandedSolutions, setExpandedSolutions] = useState<Set<string>>(
    new Set() // Empty set - no solutions expanded initially
  );

  // Feedback form state for each solution
  const [feedbackExpanded, setFeedbackExpanded] = useState<Set<string>>(new Set());
  const [feedbackMessages, setFeedbackMessages] = useState<{ [key: string]: string }>({});
  // Button selection state for persistent highlighting
  const [helpfulSelections, setHelpfulSelections] = useState<{ [key: string]: boolean }>({});
  const [notHelpfulSelections, setNotHelpfulSelections] = useState<{ [key: string]: boolean }>({});

  // Detect reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleSolution = (solutionId: string) => {
    const newExpanded = new Set(expandedSolutions);
    if (newExpanded.has(solutionId)) {
      newExpanded.delete(solutionId);
    } else {
      newExpanded.add(solutionId);
    }
    setExpandedSolutions(newExpanded);
  };

  const copyToClipboard = (solutionId: string) => {
    const solution = solutions.find(s => (s.solution_id || s.id) === solutionId);
    if (solution && solution.steps) {
      const stepsText = solution.steps.map((step: any) => {
        const stepText = typeof step === 'string' ? step : step.text;
        return `• ${stepText}`;
      }).join('\n');
      const text = `${solution.title}\n\n${stepsText}`;
      navigator.clipboard.writeText(text);
    }
  };

  const toggleFeedback = (solutionId: string) => {
    const newExpanded = new Set(feedbackExpanded);
    if (newExpanded.has(solutionId)) {
      newExpanded.delete(solutionId);
    } else {
      newExpanded.add(solutionId);
    }
    setFeedbackExpanded(newExpanded);
  };

  const handleFeedbackSubmit = (solutionId: string) => {
    const message = feedbackMessages[solutionId]?.trim();
    if (!message) return;

    // Here you would send the feedback to your ML system
    // Feedback submitted for solution
    
    // Clear the feedback form
    setFeedbackMessages(prev => ({
      ...prev,
      [solutionId]: ''
    }));
    
    // Close the feedback form
    const newExpanded = new Set(feedbackExpanded);
    newExpanded.delete(solutionId);
    setFeedbackExpanded(newExpanded);
  };

  const updateFeedbackMessage = (solutionId: string, message: string) => {
    setFeedbackMessages(prev => ({
      ...prev,
      [solutionId]: message
    }));
  };

  // Truncate source title for mobile if >20 characters
  const truncateSourceTitle = (title: string, maxLength: number = 20) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength - 3) + '...';
  };

  const getConfidenceBadgeStyle = (confidence: string) => {
    switch (confidence) {
      case 'low':
        return {
          background: 'var(--confidence-low-bg)',
          color: 'var(--confidence-low-text)',
          border: `1px solid var(--confidence-low-border)`,
          backdropFilter: 'var(--confidence-low-backdrop)',
          WebkitBackdropFilter: 'var(--confidence-low-backdrop)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
        };
      case 'medium':
        return {
          background: 'var(--confidence-medium-bg)',
          color: 'var(--confidence-medium-text)',
          border: `1px solid var(--confidence-medium-border)`,
          backdropFilter: 'var(--confidence-medium-backdrop)',
          WebkitBackdropFilter: 'var(--confidence-medium-backdrop)',
          boxShadow: '0 2px 8px rgba(59, 130, 246, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
        };
      case 'high':
        return {
          background: 'var(--confidence-high-bg)',
          color: 'var(--confidence-high-text)',
          border: `1px solid var(--confidence-high-border)`,
          backdropFilter: 'var(--confidence-high-backdrop)',
          WebkitBackdropFilter: 'var(--confidence-high-backdrop)',
          boxShadow: '0 3px 12px rgba(0, 112, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
        };
      default:
        return {
          background: 'var(--confidence-low-bg)',
          color: 'var(--confidence-low-text)',
          border: `1px solid var(--confidence-low-border)`,
          backdropFilter: 'var(--confidence-low-backdrop)',
          WebkitBackdropFilter: 'var(--confidence-low-backdrop)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
        };
    }
  };

  // Helper function to get confidence circle styles based on confidence percentage - Premium unified colors
  const getConfidenceCircleStyle = (confidenceScore: number, isDarkMode: boolean = false) => {
    const baseStyle = {
      border: 'none',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s cubic-bezier(0.22, 0.61, 0.36, 1)',
      boxShadow: isDarkMode 
        ? '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
        : '0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
    };

    // Premium unified confidence colors - matching CleanSolutionCard
    if (confidenceScore >= 75) {
      // High confidence - Premium Green
      const color = isDarkMode ? '#10b981' : '#059669';
      return {
        ...baseStyle,
        background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
        boxShadow: isDarkMode 
          ? `0 3px 12px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)`
          : `0 3px 12px rgba(5, 150, 105, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)`,
      };
    } else if (confidenceScore >= 50) {
      // Medium confidence - Premium Amber
      const color = isDarkMode ? '#f59e0b' : '#d97706';
      return {
        ...baseStyle,
        background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
        boxShadow: isDarkMode 
          ? `0 3px 12px rgba(245, 158, 11, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)`
          : `0 3px 12px rgba(217, 119, 6, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)`,
      };
    } else {
      // Low confidence - Premium Red
      const color = isDarkMode ? '#ef4444' : '#dc2626';
      return {
        ...baseStyle,
        background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
        boxShadow: isDarkMode 
          ? `0 3px 12px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)`
          : `0 3px 12px rgba(220, 38, 38, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)`,
      };
    }
  };

  const getStepIcon = (type?: string) => {
    const iconSize = isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'; // 14px for mobile, 16px for desktop
    
    switch (type) {
      case 'warning':
        return <AlertTriangle className={`${iconSize} text-amber-500`} />;
      case 'tip':
        return <Info className={`${iconSize} text-blue-500`} />;
      default:
        return <CheckCircle className={`${iconSize} text-green-500`} />;
    }
  };

  // Motion variants for reduced motion vs full motion
  const getMotionVariants = () => {
    if (prefersReducedMotion) {
      return {
        collapsed: { height: 'auto', opacity: 1 },
        expanded: { height: 'auto', opacity: 1 }
      };
    }

    return {
      collapsed: {
        height: 'auto',
        opacity: 1
      },
      expanded: {
        height: 'auto',
        opacity: 1
      }
    };
  };

  // Content animation variants with precise timing - IDENTICAL to desktop
  const getContentVariants = () => {
    if (prefersReducedMotion) {
      return {
        collapsed: { 
          opacity: 1,
          height: 0,
          y: 0,
          transition: { duration: 0 }
        },
        expanded: { 
          opacity: 1,
          height: 'auto',
          y: 0,
          transition: { duration: 0 }
        }
      };
    }

    return {
      collapsed: {
        opacity: 0,
        height: 0,
        y: -4,
        transition: {
          duration: 0.2, // 200ms (180-220ms range) - IDENTICAL
          ease: [0.22, 0.61, 0.36, 1], // cubic-bezier(0.22,0.61,0.36,1) - IDENTICAL
          height: { duration: 0.18 },
          opacity: { duration: 0.15 }
        }
      },
      expanded: {
        opacity: 1,
        height: 'auto',
        y: 0,
        transition: {
          duration: 0.28, // 280ms (240-320ms range) - IDENTICAL
          ease: [0.22, 0.61, 0.36, 1], // cubic-bezier(0.22,0.61,0.36,1) - IDENTICAL
          height: { duration: 0.25 },
          opacity: { duration: 0.2, delay: 0.05 }
        }
      }
    };
  };

  // Chevron rotation variants - IDENTICAL timing
  const getChevronVariants = () => {
    if (prefersReducedMotion) {
      return {
        collapsed: { rotate: 0 },
        expanded: { rotate: 90 }
      };
    }

    return {
      collapsed: {
        rotate: 0,
        transition: { duration: 0.18, ease: [0.22, 0.61, 0.36, 1] } // IDENTICAL
      },
      expanded: {
        rotate: 90,
        transition: { duration: 0.18, ease: [0.22, 0.61, 0.36, 1] } // IDENTICAL
      }
    };
  };

  // Staggered bullet list variants - IDENTICAL timing
  const getStepContainerVariants = () => {
    if (prefersReducedMotion) {
      return {
        expanded: {
          transition: { staggerChildren: 0 }
        }
      };
    }

    return {
      expanded: {
        transition: {
          staggerChildren: 0.06, // 60ms delay between each - IDENTICAL
          delayChildren: 0.1 // Start after main content animation - IDENTICAL
        }
      }
    };
  };

  const getStepItemVariants = () => {
    if (prefersReducedMotion) {
      return {
        collapsed: { opacity: 1, y: 0 },
        expanded: { opacity: 1, y: 0 }
      };
    }

    return {
      collapsed: {
        opacity: 0,
        y: 8
      },
      expanded: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.25, // IDENTICAL
          ease: [0.22, 0.61, 0.36, 1] // IDENTICAL
        }
      }
    };
  };

  // Safety check for empty solutions
  if (!solutions || solutions.length === 0) {
    return null;
  }

  return (
    // Binds to: response.solutions[]
    <div 
      className="w-full flex flex-col solutions_container solution-cards-dark-theme"
      style={{ 
        padding: isMobile ? '8px' : '12px', // Mobile: 8px for more width, Desktop: 12px
        gap: isMobile ? '16px' : '20px' // Mobile: 16px, Desktop: 20px spacing
      }}
    >
      {solutions.map((solution, index) => {
        const solutionId = solution.solution_id || solution.id || `solution_${index}`;
        const isExpanded = expandedSolutions.has(solutionId);
        
        return (
          // Binds to: response.solutions[].id
          <motion.div
            key={solutionId}
            className="overflow-hidden solution_card"
            style={{
              borderRadius: '8px',
              backgroundColor: isExpanded ? 'var(--solution-card-bg-expanded)' : 'var(--solution-card-bg)',
              backdropFilter: 'blur(20px) saturate(1.4)',
              WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
              boxShadow: isExpanded ? 'var(--solution-card-shadow-expanded)' : 'var(--solution-card-shadow)',
              border: `1px solid ${isExpanded ? 'var(--solution-card-border-expanded)' : 'var(--solution-card-border)'}`
            }}
            variants={getMotionVariants()}
            initial="collapsed"
            animate={isExpanded ? "expanded" : "collapsed"}
          >
            {/* Header Row - Always Visible with Mobile Responsive Styling */}
            <div 
              className="cursor-pointer transition-colors duration-200 solution_header"
              onClick={() => toggleSolution(solutionId)}
              style={{
                padding: isMobile ? (isExpanded ? '20px' : '16px') : '24px' // Mobile: Increased padding for wider cards
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-3">
                    {/* Solution Title - Enhanced Hierarchy with Strong Contrast */}
                    <h3 
                      className="flex-1 min-w-0 solution_title_display"
                      style={{
                        fontSize: isMobile ? '18px' : '20px', // Increased size for better hierarchy
                        lineHeight: isMobile ? '25px' : '28px', // Better line height
                        fontWeight: '700', // Bolder weight for prominence  
                        color: 'var(--solution-title-color)',
                        fontFamily: 'Eloquia Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        whiteSpace: isMobile ? 'nowrap' : 'normal',
                        overflow: isMobile ? 'hidden' : 'visible',
                        textOverflow: isMobile ? 'ellipsis' : 'clip',
                        letterSpacing: '-0.025em', // Tighter letter spacing for premium feel
                        textShadow: isDarkMode ? '0 1px 2px rgba(0, 0, 0, 0.8)' : 'none' // Subtle shadow for depth
                      }}
                    >
                      {solution.title}
                    </h3>
                    
                    {/* Enhanced Glassmorphism Confidence Badge - Binds to: response.solutions[].confidence_score */}
                    <button 
                      className="rounded-full flex-shrink-0 confidence_circle_button transition-all duration-200 hover:scale-110 active:scale-95"
                      style={{
                        width: isMobile ? '24px' : '28px',
                        height: isMobile ? '24px' : '28px',
                        minWidth: isMobile ? '24px' : '28px',
                        minHeight: isMobile ? '24px' : '28px',
                        border: 'none',
                        cursor: 'pointer',
                        ...getConfidenceCircleStyle(solution.confidenceScore || 75, isDarkMode) // Pass isDarkMode for premium colors
                      }}
                      title={`${solution.confidenceScore || 75}% confidence`}
                      aria-label={`Confidence level: ${solution.confidenceScore || 75}%`}
                    >
                      {/* Circle button with dynamic color based on confidence percentage */}
                    </button>
                  </div>
                  
                  {/* Source Chip - Mobile Truncation - Binds to: response.solutions[].source_document */}
                  <div 
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md source_document_chip"
                    style={{
                      fontSize: '13px',
                      lineHeight: '18px',
                      color: 'var(--solution-secondary-color)',
                      fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segue UI", Roboto, sans-serif',
                      backgroundColor: 'var(--solution-card-bg)',  
                      border: `1px solid var(--solution-card-border)`
                    }}
                  >
                    <ExternalLink className="w-3 h-3" />
                    {/* Binds to: response.solutions[].source_document.title */}
                    <span className="source_title_display">
                      {isMobile 
                        ? truncateSourceTitle(solution.source.title, 20) // Mobile: truncate at 20 chars
                        : solution.source.title // Desktop: full title
                      }
                      {/* Binds to: response.solutions[].source_document.page */}
                      {solution.source.page && <span className="source_page"> p.{solution.source.page}</span>}
                      {/* Binds to: response.solutions[].source_document.revision */}
                      {solution.source.revision && <span className="source_revision">, Rev {solution.source.revision}</span>}
                    </span>
                  </div>
                </div>

                {/* Animated Chevron Icon */}
                <div className="flex-shrink-0 expand_toggle">
                  <motion.div
                    variants={getChevronVariants()}
                    initial="collapsed"
                    animate={isExpanded ? "expanded" : "collapsed"}
                  >
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Animated Expanded Content */}
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  key={`content-${solutionId}`}
                  variants={getContentVariants()}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  style={{ overflow: 'hidden' }}
                  className="solution_expanded_content"
                >
                  {/* Body - Rich Text with Steps and Mobile Responsive Bullet Indent - Binds to: response.solutions[].steps[] */}
                  <div 
                    className="solution_steps_container"
                    style={{
                      borderTop: `1px solid var(--solution-card-border)`,  
                      padding: isMobile ? '20px' : '28px', // Increased padding for better breathing room
                      paddingTop: isMobile ? '20px' : '28px'
                    }}
                  >
                    {/* Steps Container with Clear Visual Separation */}
                    <div 
                      className="steps_visual_container"
                      style={{
                        backgroundColor: 'var(--solution-card-bg)',
                        border: `1px solid var(--solution-card-border)`,  
                        borderRadius: '4px', // Base tier for inner containers
                        padding: isMobile ? '16px' : '20px',
                        margin: isMobile ? '4px 0' : '6px 0'
                      }}
                    >
                      <motion.div 
                        className="space-y-3 solution_steps_list" // Reduced spacing for tighter grouping
                        variants={getStepContainerVariants()}
                        initial="collapsed"
                        animate="expanded"
                      >
                      {/* Binds to: response.solutions[].steps[] */}
                      {(Array.isArray(solution.steps) ? solution.steps : []).map((step, stepIndex) => {
                        const stepText = typeof step === 'string' ? step : step.text;
                        const stepType = typeof step === 'string' ? 'normal' : (step.type || 'normal');
                        const isBold = typeof step === 'string' ? false : step.isBold;
                        
                        return (
                        <motion.div 
                          key={stepIndex} 
                          className="flex items-start solution_step_item"
                          style={{
                            gap: isMobile ? '16px' : '12px' // Mobile: 16px indent, Desktop: 12px
                          }}
                          variants={getStepItemVariants()}
                        >
                          {/* Step Icon - Binds to: response.solutions[].steps[].type */}
                          <div className="flex-shrink-0 mt-0.5 step_icon">
                            {getStepIcon(stepType)}
                          </div>
                          
                          {/* Step Text - Enhanced Readability and Hierarchy */}
                          <div 
                            className={`${step.isBold ? 'font-semibold' : ''} step_text_content`}
                            style={{
                              fontSize: isMobile ? '15px' : '16px',
                              lineHeight: isMobile ? '23px' : '25px', // Better line height for readability
                              color: 'var(--solution-text-color)',
                              fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                              fontWeight: step.isBold ? '600' : '500', // Better weight for regular text
                              letterSpacing: '-0.01em' // Slightly tighter for premium feel
                            }}
                          >
                            {stepText}
                          </div>
                        </motion.div>
                      )})}
                      </motion.div>
                    </div>
                  </div>

                  {/* Additional Details from New Webhook Format */}
                  {(solution.parts_needed || solution.estimated_time || solution.safety_warnings) && (
                    <div className="px-6 pb-4 space-y-3">
                      {solution.estimated_time && (
                        <div className="text-sm">
                          <span 
                            className="font-semibold"
                            style={{ color: 'var(--solution-title-color)' }}
                          >
                            Estimated Time:
                          </span>{' '}
                          <span 
                            style={{ color: 'var(--solution-secondary-color)' }}
                          >
                            {solution.estimated_time}
                          </span>
                        </div>
                      )}
                      
                      {solution.parts_needed && solution.parts_needed.length > 0 && (
                        <div className="text-sm">
                          <span 
                            className="font-semibold"
                            style={{ color: 'var(--solution-title-color)' }}
                          >
                            Parts Needed:
                          </span>
                          <ul className="mt-1 space-y-1">
                            {solution.parts_needed.map((part: string, idx: number) => (
                              <li 
                                key={idx} 
                                className="ml-4"
                                style={{ color: 'var(--solution-secondary-color)' }}
                              >
                                {part}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {solution.safety_warnings && solution.safety_warnings.length > 0 && (
                        <div className="text-sm">
                          <span 
                            className="font-semibold"
                            style={{ color: 'var(--confidence-medium-text)' }}
                          >
                            Safety Warnings:
                          </span>
                          <ul className="mt-1 space-y-1">
                            {solution.safety_warnings.map((warning: string, idx: number) => (
                              <li 
                                key={idx} 
                                className="ml-4 flex items-start gap-2"
                                style={{ color: 'var(--confidence-medium-text)' }}
                              >
                                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>{warning}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer Row - Mobile Responsive Layout */}
                  <motion.div 
                    className={`
                      solution_footer_actions
                      ${isMobile ? 'flex flex-col gap-3' : 'flex items-center justify-between'}
                    `}
                    style={{
                      borderTop: `1px solid var(--solution-card-border)`,
                      padding: isMobile ? '16px' : '20px 24px'
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ 
                      delay: prefersReducedMotion ? 0 : 0.15,
                      duration: prefersReducedMotion ? 0 : 0.2 
                    }}
                  >
                    {/* View Full Procedure Link - Binds to: response.solutions[].procedure_link */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (solution.procedureLink || solution.original_doc_url) {
                          window.open(solution.procedureLink || solution.original_doc_url, '_blank', 'noopener,noreferrer');
                        }
                      }}
                      className="group flex items-center gap-2 transition-colors duration-200 procedure_link_button"
                      style={{
                        fontSize: isMobile ? '14px' : '15px',
                        lineHeight: isMobile ? '20px' : '22px',
                        fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        color: 'var(--solution-link-color)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--solution-link-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--solution-link-color)';
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="group-hover:underline underline-offset-2">
                        View full procedure
                      </span>
                    </button>

                    {/* Copy Button */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(solutionId);
                      }}
                      className={`
                        p-2 rounded-lg transition-all duration-200 hover:shadow-sm copy_solution_button
                        ${isMobile ? 'self-end' : ''}
                      `}
                      style={{
                        color: 'var(--solution-secondary-color)',
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--solution-title-color)';
                        e.currentTarget.style.backgroundColor = 'var(--solution-card-bg-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--solution-secondary-color)';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      title="Copy solution"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </motion.div>

                  {/* Feedback Buttons Section - Enhanced with Persistent States - Binds to: metadata.user_feedback */}
                  <motion.div 
                    className="feedback_section"
                    style={{
                      borderTop: `1px solid var(--solution-card-border)`,
                      padding: isMobile ? '16px' : '20px 24px'
                    }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      delay: prefersReducedMotion ? 0 : 0.2,
                      duration: prefersReducedMotion ? 0 : 0.25,
                      ease: [0.22, 0.61, 0.36, 1]
                    }}
                  >
                    <div 
                      className={`
                        flex gap-3 feedback_buttons_container
                        ${isMobile ? 'flex-col' : 'flex-row'}
                      `}
                    >
                      {/* Enhanced Helpful Button with Persistent State and Press Animation - Binds to: metadata.user_feedback.helpful */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setHelpfulSelections(prev => ({
                            ...prev,
                            [solutionId]: !prev[solutionId]
                          }));
                          // Clear not helpful if helpful is selected
                          if (!helpfulSelections[solutionId]) {
                            setNotHelpfulSelections(prev => ({
                              ...prev,
                              [solutionId]: false
                            }));
                          }
                        }}
                        className={`group flex items-center justify-center gap-2 px-4 py-2 transition-all duration-150 helpful_button ${isMobile ? 'flex-1' : ''}`}
                        style={{
                          borderRadius: '8px',
                          background: helpfulSelections[solutionId] ? 'var(--button-helpful-bg)' : 'transparent',
                          backdropFilter: 'blur(16px) saturate(1.2)',
                          WebkitBackdropFilter: 'blur(16px) saturate(1.2)',
                          border: helpfulSelections[solutionId] 
                            ? '1px solid var(--button-helpful-border)' 
                            : '1px solid rgba(34, 197, 94, 0.25)',
                          boxShadow: helpfulSelections[solutionId]
                            ? '0 4px 16px rgba(34, 197, 94, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                            : '0 2px 8px rgba(34, 197, 94, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                          fontSize: isMobile ? '13px' : '14px',
                          lineHeight: isMobile ? '18px' : '20px',
                          fontWeight: '500',
                          color: helpfulSelections[solutionId] ? 'var(--button-helpful-text)' : '#6b7280',
                          fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                          transform: 'translateY(0px)',
                          cursor: 'pointer'
                        }}
                        onMouseDown={(e) => {
                          e.currentTarget.style.transform = 'translateY(1px) scale(0.98)';
                        }}
                        onMouseUp={(e) => {
                          e.currentTarget.style.transform = 'translateY(0px) scale(1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0px) scale(1)';
                        }}
                      >
                        <ThumbsUp 
                          className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} group-hover:scale-110 transition-transform duration-200`}
                          style={{ 
                            color: helpfulSelections[solutionId] ? 'var(--button-helpful-text)' : '#6b7280'
                          }}
                        />
                        <span>Helpful</span>
                      </button>

                      {/* Enhanced Not Helpful Button with Persistent State and Press Animation - Binds to: metadata.user_feedback.not_helpful */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setNotHelpfulSelections(prev => ({
                            ...prev,
                            [solutionId]: !prev[solutionId]
                          }));
                          // Clear helpful if not helpful is selected
                          if (!notHelpfulSelections[solutionId]) {
                            setHelpfulSelections(prev => ({
                              ...prev,
                              [solutionId]: false
                            }));
                          }
                        }}
                        className={`group flex items-center justify-center gap-2 px-4 py-2 transition-all duration-150 not_helpful_button ${isMobile ? 'flex-1' : ''}`}
                        style={{
                          borderRadius: '8px',
                          background: notHelpfulSelections[solutionId] ? 'var(--button-not-helpful-bg)' : 'transparent',
                          backdropFilter: 'blur(16px) saturate(1.2)',
                          WebkitBackdropFilter: 'blur(16px) saturate(1.2)',
                          border: notHelpfulSelections[solutionId] 
                            ? '1px solid var(--button-not-helpful-border)' 
                            : '1px solid rgba(239, 68, 68, 0.25)',
                          boxShadow: notHelpfulSelections[solutionId]
                            ? '0 4px 16px rgba(239, 68, 68, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                            : '0 2px 8px rgba(239, 68, 68, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                          fontSize: isMobile ? '13px' : '14px',
                          lineHeight: isMobile ? '18px' : '20px',
                          fontWeight: '500',
                          color: notHelpfulSelections[solutionId] ? 'var(--button-not-helpful-text)' : '#6b7280',
                          fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                          transform: 'translateY(0px)',
                          cursor: 'pointer'
                        }}
                        onMouseDown={(e) => {
                          e.currentTarget.style.transform = 'translateY(1px) scale(0.98)';
                        }}
                        onMouseUp={(e) => {
                          e.currentTarget.style.transform = 'translateY(0px) scale(1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0px) scale(1)';
                        }}
                      >
                        <ThumbsDown 
                          className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} group-hover:scale-110 transition-transform duration-200`}
                          style={{ 
                            color: notHelpfulSelections[solutionId] ? 'var(--button-not-helpful-text)' : '#6b7280'
                          }}
                        />
                        <span>Not Helpful</span>
                      </button>

                      {/* Leave Feedback Button - Neutral with Glassmorphism */}
                      <div className="flex items-center gap-2 feedback_controls">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFeedback(solutionId);
                          }}
                          className={`group flex items-center justify-center gap-2 px-4 py-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] leave_feedback_button ${isMobile ? 'flex-1' : ''}`}
                          style={{
                            borderRadius: '8px',
                            backgroundColor: 'transparent',
                            backdropFilter: 'blur(16px) saturate(1.2)',
                            WebkitBackdropFilter: 'blur(16px) saturate(1.2)',
                            border: '1px solid rgba(107, 114, 128, 0.25)',
                            boxShadow: '0 4px 16px rgba(107, 114, 128, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                            fontSize: isMobile ? '13px' : '14px',
                            lineHeight: isMobile ? '18px' : '20px',
                            fontWeight: '500',
                            color: '#6b7280',
                            fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                          }}
                        >
                          <MessageSquare 
                            className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} group-hover:scale-110 transition-transform duration-200`}
                            style={{ color: '#6b7280' }}
                          />
                          <span>Leave Feedback</span>
                        </button>

                        {/* Send Button - Appears when feedback is expanded - Binds to: metadata.user_feedback.message */}
                        {feedbackExpanded.has(solutionId) && (
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFeedbackSubmit(solutionId);
                            }}
                            disabled={!feedbackMessages[solutionId]?.trim()}
                            className="group flex items-center justify-center p-2 transition-all duration-200 hover:scale-[1.05] active:scale-[0.95] disabled:opacity-50 disabled:cursor-not-allowed send_feedback_button"
                            style={{
                              borderRadius: '6px',
                              backgroundColor: '#0070ff',
                              border: 'none',
                              boxShadow: '0 2px 8px rgba(0, 112, 255, 0.3)',
                              transition: 'all 200ms cubic-bezier(0.23, 1, 0.32, 1)',
                              transform: 'translateY(0)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#0070ff';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 112, 255, 0.4)';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#0070ff';
                              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 112, 255, 0.3)';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
                          >
                            <Send 
                              className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} group-hover:scale-110 transition-transform duration-200`}
                              style={{ color: '#ffffff' }}
                            />
                          </motion.button>
                        )}
                      </div>
                    </div>

                    {/* Feedback Form - Expands when Leave Feedback is clicked - Binds to: metadata.user_feedback.message */}
                    <AnimatePresence>
                      {feedbackExpanded.has(solutionId) && (
                        <motion.div
                          className="mt-4 pt-4 feedback_form_container"
                          style={{
                            borderTop: `1px solid var(--solution-card-border)`,
                            overflow: 'hidden'
                          }}
                          initial={{ opacity: 0, height: 0, y: -10 }}
                          animate={{ opacity: 1, height: 'auto', y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -10 }}
                          transition={{ 
                            duration: prefersReducedMotion ? 0 : 0.25,
                            ease: [0.22, 0.61, 0.36, 1]
                          }}
                        >
                          <div className="flex flex-col gap-3 px-1">
                            {/* Binds to: metadata.user_feedback.message */}
                            <textarea
                              id={`feedback-${solutionId}`}
                              value={feedbackMessages[solutionId] || ''}
                              onChange={(e) => updateFeedbackMessage(solutionId, e.target.value)}
                              placeholder="Tell us what could be improved or share your thoughts..."
                              className="w-full p-3 rounded-md resize-none focus:outline-none transition-all duration-200 feedback_message_input"
                              style={{
                                fontSize: isMobile ? '15px' : '16px',
                                lineHeight: isMobile ? '22px' : '24px',
                                fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                minHeight: isMobile ? '80px' : '100px',
                                backgroundColor: isDarkMode ? 'rgba(12, 14, 18, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                                color: 'var(--solution-title-color)',
                                border: `1px solid var(--solution-card-border)`,
                                backdropFilter: 'blur(8px)',
                                borderRadius: '8px'
                              }}
                              onFocus={(e) => {
                                e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(15, 17, 22, 0.9)' : 'rgba(255, 255, 255, 0.9)';
                                e.currentTarget.style.borderColor = 'var(--solution-link-color)';
                                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(99, 110, 255, 0.3)';
                              }}
                              onBlur={(e) => {
                                e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(12, 14, 18, 0.8)' : 'rgba(255, 255, 255, 0.8)';
                                e.currentTarget.style.borderColor = 'var(--solution-card-border)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                              rows={isMobile ? 3 : 4}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="text-xs feedback_disclaimer" style={{
                              fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                              color: 'var(--solution-secondary-color)'
                            }}>
                              This feedback is used to improve our machine learning models and solution accuracy.
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}