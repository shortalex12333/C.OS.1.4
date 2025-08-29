import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, ExternalLink, Copy, AlertTriangle, Info, CheckCircle, ThumbsUp, ThumbsDown, MessageSquare, Send, Mail, Paperclip, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EmailSolution {
  id?: string;
  solution_id?: string;
  company: string;
  sender: string;
  receiver: string;
  date_sent: string;
  profile_picture?: string;
  subject_line: string;
  body_text: string;
  ai_summary: string;
  attachment_name?: string;
  attachment_icon_type?: string;
  thread_count: number;
  confidence?: 'low' | 'medium' | 'high' | number;
  confidenceScore?: number;
  email_url?: string;
}

interface EmailSolutionCardProps {
  solutions: EmailSolution[];
  isMobile?: boolean;
  isDarkMode?: boolean;
}

export function EmailSolutionCard({ solutions, isMobile = false, isDarkMode = false }: EmailSolutionCardProps) {
  // EXACT same state management as AISolutionCard
  const [expandedSolutions, setExpandedSolutions] = useState<Set<string>>(new Set());
  const [feedbackExpanded, setFeedbackExpanded] = useState<Set<string>>(new Set());
  const [feedbackMessages, setFeedbackMessages] = useState<{ [key: string]: string }>({});
  const [helpfulSelections, setHelpfulSelections] = useState<{ [key: string]: boolean }>({});
  const [notHelpfulSelections, setNotHelpfulSelections] = useState<{ [key: string]: boolean }>({});
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // EXACT same functions as AISolutionCard
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
    const solution = (solutions || []).find(s => (s.solution_id || s.id) === solutionId);
    if (solution) {
      const text = `${solution.subject_line}\n\nFrom: ${solution.sender} (${solution.company})\nTo: ${solution.receiver}\nDate: ${solution.date_sent}\n\n${solution.body_text}\n\nAI Summary: ${solution.ai_summary}`;
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

  // EXACT same confidence circle function from AISolutionCard
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

    if (confidenceScore >= 75) {
      const color = isDarkMode ? '#10b981' : '#059669';
      return {
        ...baseStyle,
        background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
        boxShadow: isDarkMode 
          ? `0 3px 12px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)`
          : `0 3px 12px rgba(5, 150, 105, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)`,
      };
    } else if (confidenceScore >= 50) {
      const color = isDarkMode ? '#f59e0b' : '#d97706';
      return {
        ...baseStyle,
        background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
        boxShadow: isDarkMode 
          ? `0 3px 12px rgba(245, 158, 11, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)`
          : `0 3px 12px rgba(217, 119, 6, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)`,
      };
    } else {
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

  // EXACT same motion variants as AISolutionCard
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
          duration: 0.2,
          ease: [0.22, 0.61, 0.36, 1],
          height: { duration: 0.18 },
          opacity: { duration: 0.15 }
        }
      },
      expanded: {
        opacity: 1,
        height: 'auto',
        y: 0,
        transition: {
          duration: 0.28,
          ease: [0.22, 0.61, 0.36, 1],
          height: { duration: 0.25 },
          opacity: { duration: 0.2, delay: 0.05 }
        }
      }
    };
  };

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
        transition: { duration: 0.18, ease: [0.22, 0.61, 0.36, 1] }
      },
      expanded: {
        rotate: 90,
        transition: { duration: 0.18, ease: [0.22, 0.61, 0.36, 1] }
      }
    };
  };

  // Get attachment icon based on type
  const getAttachmentIcon = (attachmentType?: string) => {
    switch (attachmentType?.toLowerCase()) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'zip':
        return '📦';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return '📸';
      default:
        return '📎';
    }
  };

  // Get initials for profile circle
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  // Safety check
  if (!solutions || solutions.length === 0) {
    return null;
  }

  return (
    // EXACT same container structure as AISolutionCard
    <div 
      className="w-full flex flex-col solutions_container email-solution-cards"
      style={{ 
        padding: isMobile ? '8px' : '12px', // EXACT same padding
        gap: isMobile ? '16px' : '20px' // EXACT same gap
      }}
    >
      {(solutions || []).filter((solution, index) => {
        const isValid = solution && typeof solution === 'object' && solution.subject_line && typeof solution.subject_line === 'string';
        if (!isValid) {
          console.warn(`❌ EmailSolutionCard: Invalid email solution at index ${index}:`, solution);
        }
        return isValid;
      }).map((solution, index) => {
        const solutionId = solution.solution_id || solution.id || `email_${index}`;
        const isExpanded = expandedSolutions.has(solutionId);
        
        return (
          // EXACT same motion.div structure as AISolutionCard
          <motion.div
            key={solutionId}
            className="overflow-hidden email_solution_card"
            style={{
              // EXACT same styling as AISolutionCard lines 391-397
              borderRadius: '8px',
              backgroundColor: isExpanded ? 'var(--solution-card-bg-expanded)' : 'var(--solution-card-bg)',
              backdropFilter: 'blur(20px) saturate(1.4)',
              WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
              boxShadow: isExpanded ? 'var(--solution-card-shadow-expanded)' : 'var(--solution-card-shadow)',
              border: `1px solid ${isExpanded ? 'var(--solution-card-border-expanded)' : 'var(--solution-card-border)'}`,
              // Portrait orientation constraints
              maxWidth: '380px',
              minHeight: isExpanded ? 'auto' : '200px',
              width: '100%'
            }}
            variants={getMotionVariants()}
            initial="collapsed"
            animate={isExpanded ? "expanded" : "collapsed"}
          >
            {/* EXACT same header structure as AISolutionCard */}
            <div 
              className="cursor-pointer transition-colors duration-200 email_solution_header"
              onClick={() => toggleSolution(solutionId)}
              style={{
                padding: isMobile ? (isExpanded ? '20px' : '16px') : '24px' // EXACT same padding logic
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-3">
                    {/* Email Subject as Title - EXACT same styling as solution title */}
                    <h3 
                      className="flex-1 min-w-0 email_subject_display"
                      style={{
                        fontSize: isMobile ? '18px' : '20px', // EXACT same as line 417
                        lineHeight: isMobile ? '25px' : '28px', // EXACT same as line 418
                        fontWeight: '700', // EXACT same as line 419
                        color: 'var(--solution-title-color)', // EXACT same as line 420
                        fontFamily: 'Eloquia Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', // EXACT same as line 421
                        whiteSpace: isMobile ? 'nowrap' : 'normal', // EXACT same as line 422
                        overflow: isMobile ? 'hidden' : 'visible', // EXACT same as line 423
                        textOverflow: isMobile ? 'ellipsis' : 'clip', // EXACT same as line 424
                        letterSpacing: '-0.025em', // EXACT same as line 425
                        textShadow: isDarkMode ? '0 1px 2px rgba(0, 0, 0, 0.8)' : 'none' // EXACT same as line 426
                      }}
                    >
                      {solution.subject_line}
                    </h3>
                    
                    {/* EXACT same confidence circle as AISolutionCard */}
                    <button 
                      className="rounded-full flex-shrink-0 confidence_circle_button transition-all duration-200 hover:scale-110 active:scale-95"
                      style={{
                        width: isMobile ? '24px' : '28px', // EXACT same as lines 436-437
                        height: isMobile ? '24px' : '28px', // EXACT same as lines 437-438
                        minWidth: isMobile ? '24px' : '28px', // EXACT same as lines 438-439
                        minHeight: isMobile ? '24px' : '28px', // EXACT same as lines 439-440
                        border: 'none', // EXACT same as line 440
                        cursor: 'pointer', // EXACT same as line 441
                        ...getConfidenceCircleStyle(solution.confidenceScore || 75, isDarkMode) // EXACT same as line 442
                      }}
                      title={`${solution.confidenceScore || 75}% confidence`}
                      aria-label={`Confidence level: ${solution.confidenceScore || 75}%`}
                    >
                    </button>
                  </div>
                  
                  {/* Email Source Chip - EXACT same styling as solution source chip */}
                  <div 
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md email_source_chip"
                    style={{
                      fontSize: '13px', // EXACT same as line 455
                      lineHeight: '18px', // EXACT same as line 456
                      color: 'var(--solution-secondary-color)', // EXACT same as line 457
                      fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', // EXACT same as line 458
                      backgroundColor: 'var(--solution-card-bg)', // EXACT same as line 459
                      border: `1px solid var(--solution-card-border)` // EXACT same as line 460
                    }}
                  >
                    <Mail className="w-3 h-3" />
                    <span className="email_source_display">
                      {solution.company} • {solution.date_sent}
                    </span>
                  </div>
                </div>

                {/* EXACT same chevron as AISolutionCard */}
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

            {/* EXACT same AnimatePresence structure as AISolutionCard */}
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  key={`email-content-${solutionId}`}
                  variants={getContentVariants()}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  style={{ overflow: 'hidden' }}
                  className="email_solution_expanded_content"
                >
                  {/* Email Details Section - Using EXACT same structure as solution steps */}
                  <div 
                    className="email_details_container"
                    style={{
                      borderTop: `1px solid var(--solution-card-border)`, // EXACT same as line 507
                      padding: isMobile ? '20px' : '28px', // EXACT same as line 508
                      paddingTop: isMobile ? '20px' : '28px' // EXACT same as line 509
                    }}
                  >
                    {/* Sender Info Section */}
                    <div 
                      className="email_sender_section"
                      style={{
                        backgroundColor: 'var(--solution-card-bg)', // EXACT same as line 516
                        border: `1px solid var(--solution-card-border)`, // EXACT same as line 517
                        borderRadius: '4px', // EXACT same as line 518
                        padding: isMobile ? '16px' : '20px', // EXACT same as line 519
                        margin: isMobile ? '4px 0' : '6px 0', // EXACT same as line 520
                        marginBottom: '16px'
                      }}
                    >
                      {/* Profile and Sender Details */}
                      <div className="flex items-start gap-12px mb-12px">
                        <div 
                          className="email_profile_circle"
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '24px',
                            background: 'linear-gradient(135deg, #0070f3, #00a8ff)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '600',
                            color: 'white',
                            fontSize: '18px',
                            flexShrink: 0
                          }}
                        >
                          {getInitials(solution.sender)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div 
                            className="email_company_tag"
                            style={{
                              fontSize: '11px',
                              fontWeight: '600',
                              color: '#0070f3',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              marginBottom: '4px'
                            }}
                          >
                            {solution.company}
                          </div>
                          
                          <div 
                            className="email_sender_name"
                            style={{
                              fontSize: isMobile ? '16px' : '18px',
                              lineHeight: isMobile ? '22px' : '25px',
                              fontWeight: '700',
                              color: 'var(--solution-title-color)',
                              fontFamily: 'Eloquia Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                              marginBottom: '4px'
                            }}
                          >
                            {solution.sender}
                          </div>
                          
                          <div 
                            className="email_receiver_info"
                            style={{
                              fontSize: '13px',
                              color: 'var(--solution-secondary-color)',
                              lineHeight: '18px',
                              marginBottom: '2px'
                            }}
                          >
                            → {solution.receiver}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Email Body Preview */}
                    <div 
                      className="email_body_container"
                      style={{
                        backgroundColor: 'var(--solution-card-bg)',
                        border: `1px solid var(--solution-card-border)`,
                        borderRadius: '4px',
                        padding: isMobile ? '16px' : '20px',
                        margin: isMobile ? '4px 0' : '6px 0',
                        marginBottom: '16px'
                      }}
                    >
                      <div 
                        className="email_body_preview"
                        style={{
                          fontSize: isMobile ? '15px' : '16px', // EXACT same as solution step text
                          lineHeight: isMobile ? '23px' : '25px', // EXACT same as solution step text
                          color: 'var(--solution-text-color)', // EXACT same as solution step text
                          fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', // EXACT same
                          fontWeight: '500', // EXACT same as solution step text
                          letterSpacing: '-0.01em', // EXACT same as solution step text
                          display: '-webkit-box',
                          WebkitLineClamp: '4',
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {solution.body_text}
                      </div>
                    </div>

                    {/* AI Summary */}
                    <div 
                      className="email_ai_summary"
                      style={{
                        backgroundColor: 'rgba(0, 112, 255, 0.05)',
                        border: '1px solid rgba(0, 112, 255, 0.15)',
                        borderRadius: '4px',
                        padding: isMobile ? '16px' : '20px',
                        margin: isMobile ? '4px 0' : '6px 0'
                      }}
                    >
                      <div 
                        className="ai_summary_label"
                        style={{
                          fontSize: '11px',
                          fontWeight: '600',
                          color: '#0070f3',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <div 
                          className="ai_icon"
                          style={{
                            width: '14px',
                            height: '14px',
                            background: '#0070f3',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '8px',
                            fontWeight: '600'
                          }}
                        >
                          AI
                        </div>
                        Email Summary
                      </div>
                      <div 
                        className="ai_summary_text"
                        style={{
                          fontSize: isMobile ? '13px' : '14px',
                          lineHeight: isMobile ? '19px' : '21px',
                          color: 'var(--solution-text-color)',
                          fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }}
                      >
                        {solution.ai_summary}
                      </div>
                    </div>
                  </div>

                  {/* Email Footer with attachments and thread info */}
                  <div 
                    className="email_footer_section"
                    style={{
                      borderTop: `1px solid var(--solution-card-border)`,
                      padding: isMobile ? '16px' : '20px 24px'
                    }}
                  >
                    {/* Attachment Info */}
                    {solution.attachment_name && (
                      <div 
                        className="attachment_info"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '12px',
                          padding: '8px 12px',
                          backgroundColor: 'rgba(34, 197, 94, 0.08)',
                          borderRadius: '6px',
                          fontSize: '13px',
                          color: 'var(--solution-text-color)',
                          fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }}
                      >
                        <span>{getAttachmentIcon(solution.attachment_icon_type)}</span>
                        {solution.attachment_name}
                      </div>
                    )}
                    
                    {/* Thread Info */}
                    {solution.thread_count > 0 && (
                      <div 
                        className="thread_info"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '16px',
                          padding: '8px 12px',
                          backgroundColor: 'rgba(251, 191, 36, 0.08)',
                          borderRadius: '6px',
                          fontSize: '13px',
                          color: 'var(--solution-text-color)',
                          fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }}
                      >
                        <Users className="w-4 h-4" />
                        {solution.thread_count} {solution.thread_count === 1 ? 'reply' : 'replies'} in thread
                      </div>
                    )}
                  </div>

                  {/* EXACT same feedback section as AISolutionCard */}
                  <motion.div 
                    className="feedback_section"
                    style={{
                      borderTop: `1px solid var(--solution-card-border)`, // EXACT same as line 712
                      padding: isMobile ? '16px' : '20px 24px' // EXACT same as line 713
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
                      {/* EXACT same helpful button as AISolutionCard lines 730-782 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setHelpfulSelections(prev => ({
                            ...prev,
                            [solutionId]: !prev[solutionId]
                          }));
                          if (!helpfulSelections[solutionId]) {
                            setNotHelpfulSelections(prev => ({
                              ...prev,
                              [solutionId]: false
                            }));
                          }
                        }}
                        className={`group flex items-center justify-center gap-2 px-4 py-2 transition-all duration-150 helpful_button ${isMobile ? 'flex-1' : ''}`}
                        style={{
                          borderRadius: '8px', // EXACT same as line 747
                          background: helpfulSelections[solutionId] ? 'var(--button-helpful-bg)' : 'transparent', // EXACT same as line 748
                          backdropFilter: 'blur(16px) saturate(1.2)', // EXACT same as line 749
                          WebkitBackdropFilter: 'blur(16px) saturate(1.2)', // EXACT same as line 750
                          border: helpfulSelections[solutionId] 
                            ? '1px solid var(--button-helpful-border)' 
                            : '1px solid rgba(34, 197, 94, 0.25)', // EXACT same as lines 751-753
                          boxShadow: helpfulSelections[solutionId]
                            ? '0 4px 16px rgba(34, 197, 94, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                            : '0 2px 8px rgba(34, 197, 94, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)', // EXACT same as lines 754-756
                          fontSize: isMobile ? '13px' : '14px', // EXACT same as line 757
                          lineHeight: isMobile ? '18px' : '20px', // EXACT same as line 758
                          fontWeight: '500', // EXACT same as line 759
                          color: helpfulSelections[solutionId] ? 'var(--button-helpful-text)' : '#6b7280', // EXACT same as line 760
                          fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', // EXACT same as line 761
                          transform: 'translateY(0px)', // EXACT same as line 762
                          cursor: 'pointer' // EXACT same as line 763
                        }}
                        onMouseDown={(e) => {
                          e.currentTarget.style.transform = 'translateY(1px) scale(0.98)'; // EXACT same as line 766
                        }}
                        onMouseUp={(e) => {
                          e.currentTarget.style.transform = 'translateY(0px) scale(1)'; // EXACT same as line 769
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0px) scale(1)'; // EXACT same as line 772
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

                      {/* EXACT same not helpful button as AISolutionCard lines 784-837 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setNotHelpfulSelections(prev => ({
                            ...prev,
                            [solutionId]: !prev[solutionId]
                          }));
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

                      {/* View Email Button - styled like procedure link button */}
                      <div className="flex items-center gap-2 email_view_controls">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (solution.email_url) {
                              window.open(solution.email_url, '_blank', 'noopener,noreferrer');
                            }
                          }}
                          className="group flex items-center gap-2 transition-colors duration-200 view_email_button"
                          style={{
                            fontSize: isMobile ? '14px' : '15px', // EXACT same as procedure link
                            lineHeight: isMobile ? '20px' : '22px', // EXACT same as procedure link
                            fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            color: 'var(--solution-link-color)',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer'
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
                            View full email
                          </span>
                        </button>

                        {/* Copy Button - EXACT same as AISolutionCard */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(solutionId);
                          }}
                          className={`
                            p-2 rounded-lg transition-all duration-200 hover:shadow-sm copy_email_button
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
                          title="Copy email"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}