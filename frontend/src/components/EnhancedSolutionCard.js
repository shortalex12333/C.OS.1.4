import React, { useState } from 'react';
import { ChevronRight, ExternalLink, Copy, AlertTriangle, Info, CheckCircle, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';

/**
 * Enhanced Solution Card Component - Production Ready
 * Displays yacht AI solutions with glassmorphism and animations
 */

export function EnhancedSolutionCard({ solution, isMobile = false, isDarkMode = false }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [feedbackExpanded, setFeedbackExpanded] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [helpfulSelected, setHelpfulSelected] = useState(false);
  const [notHelpfulSelected, setNotHelpfulSelected] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Parse solution data from webhook response
  const parseSolution = () => {
    if (!solution) return null;
    
    // Handle different solution formats from webhook
    if (typeof solution === 'string') {
      return {
        id: Math.random().toString(36).substr(2, 9),
        title: solution.substring(0, 50) + '...',
        confidence: 'medium',
        confidenceScore: 75,
        source: { title: 'Yacht Manual', page: 1 },
        steps: [{ text: solution, type: 'normal' }],
        procedureLink: '#'
      };
    }
    
    return {
      id: solution.id || Math.random().toString(36).substr(2, 9),
      title: solution.title || solution.name || 'Solution',
      confidence: solution.confidence || 'medium',
      confidenceScore: solution.confidence_score || solution.score || 75,
      source: solution.source || solution.source_document || { title: 'Unknown Source' },
      steps: solution.steps || solution.procedure || [{ text: solution.description || 'No details available' }],
      procedureLink: solution.link || solution.procedure_link || '#'
    };
  };

  const solutionData = parseSolution();
  if (!solutionData) return null;

  const getConfidenceCircleStyle = (score) => {
    const baseStyle = {
      width: isMobile ? '24px' : '28px',
      height: isMobile ? '24px' : '28px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s cubic-bezier(0.22, 0.61, 0.36, 1)',
      cursor: 'pointer'
    };

    if (score >= 85) {
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        boxShadow: '0 3px 12px rgba(34, 197, 94, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
      };
    } else if (score >= 67.5) {
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        boxShadow: '0 3px 12px rgba(245, 158, 11, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
      };
    } else {
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        boxShadow: '0 3px 12px rgba(239, 68, 68, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
      };
    }
  };

  const getStepIcon = (type) => {
    const iconSize = isMobile ? 14 : 16;
    
    switch (type) {
      case 'warning':
        return <AlertTriangle size={iconSize} color="#f59e0b" />;
      case 'tip':
        return <Info size={iconSize} color="#3b82f6" />;
      default:
        return <CheckCircle size={iconSize} color="#22c55e" />;
    }
  };

  const copyToClipboard = () => {
    const text = `${solutionData.title}\n\n${solutionData.steps.map(step => `• ${step.text || step}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleFeedbackSubmit = () => {
    if (!feedbackMessage.trim()) return;
    
    // Send feedback to webhook
    console.log('Feedback submitted:', feedbackMessage);
    
    // Reset form
    setFeedbackMessage('');
    setFeedbackExpanded(false);
  };

  const truncateSourceTitle = (title, maxLength = 20) => {
    if (!title) return 'Unknown';
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength - 3) + '...';
  };

  return (
    <div
      className="solution-card"
      style={{
        borderRadius: '8px',
        backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.10)' : 'rgba(255, 255, 255, 0.10)',
        backdropFilter: 'blur(32px) saturate(1.3)',
        WebkitBackdropFilter: 'blur(32px) saturate(1.3)',
        boxShadow: isExpanded 
          ? '0 8px 32px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(0, 0, 0, 0.08), inset 0 2px 0 rgba(255, 255, 255, 0.25)'
          : '0 4px 16px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.20)',
        border: isDarkMode 
          ? '1px solid rgba(255, 255, 255, 0.20)' 
          : '1px solid rgba(255, 255, 255, 0.20)',
        transition: 'all 0.3s cubic-bezier(0.22, 0.61, 0.36, 1)',
        marginBottom: '16px',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: isMobile ? (isExpanded ? '20px' : '16px') : '24px',
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '12px', marginBottom: '12px' }}>
              {/* Title */}
              <h3 style={{
                flex: 1,
                fontSize: isMobile ? '17px' : '18px',
                lineHeight: isMobile ? '24px' : '26px',
                fontWeight: '600',
                color: isDarkMode ? '#ffffff' : '#1a1a1a',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                whiteSpace: isMobile ? 'nowrap' : 'normal',
                overflow: isMobile ? 'hidden' : 'visible',
                textOverflow: isMobile ? 'ellipsis' : 'clip'
              }}>
                {solutionData.title}
              </h3>
              
              {/* Confidence Circle */}
              <button 
                style={getConfidenceCircleStyle(solutionData.confidenceScore)}
                title={`${solutionData.confidenceScore}% confidence`}
              />
            </div>
            
            {/* Source Chip */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              lineHeight: '18px',
              color: isDarkMode ? '#ffffff' : '#6b7280',
              backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : '#f9fafb',
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#e5e7eb'}`
            }}>
              <ExternalLink size={12} />
              <span>
                {isMobile 
                  ? truncateSourceTitle(solutionData.source.title, 20)
                  : solutionData.source.title}
                {solutionData.source.page && ` p.${solutionData.source.page}`}
              </span>
            </div>
          </div>

          {/* Chevron */}
          <div style={{
            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)',
            transition: 'transform 0.2s cubic-bezier(0.22, 0.61, 0.36, 1)'
          }}>
            <ChevronRight size={20} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div style={{
          animation: 'slideDown 0.3s cubic-bezier(0.22, 0.61, 0.36, 1)'
        }}>
          {/* Steps */}
          <div style={{
            borderTop: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'}`,
            padding: isMobile ? '16px' : '24px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {solutionData.steps.map((step, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'start',
                  gap: isMobile ? '16px' : '12px'
                }}>
                  <div style={{ flexShrink: 0, marginTop: '2px' }}>
                    {getStepIcon(step.type)}
                  </div>
                  <div style={{
                    fontSize: isMobile ? '15px' : '16px',
                    lineHeight: isMobile ? '22px' : '24px',
                    color: isDarkMode ? '#f6f7fb' : '#374151',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fontWeight: step.isBold ? '600' : '400'
                  }}>
                    {step.text || step}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{
            borderTop: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'}`,
            padding: isMobile ? '16px' : '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '12px' : '0'
          }}>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#3b82f6',
              fontSize: isMobile ? '14px' : '15px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              textDecoration: 'none'
            }}>
              <ExternalLink size={16} />
              <span>View full procedure</span>
            </button>

            <button 
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard();
              }}
              style={{
                padding: '8px',
                borderRadius: '8px',
                background: copySuccess ? '#22c55e' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                color: copySuccess ? '#ffffff' : (isDarkMode ? '#9ca3af' : '#6b7280')
              }}
            >
              {copySuccess ? <CheckCircle size={16} /> : <Copy size={16} />}
            </button>
          </div>

          {/* Feedback Section */}
          <div style={{
            borderTop: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'}`,
            padding: isMobile ? '16px' : '20px 24px'
          }}>
            <div style={{
              display: 'flex',
              gap: '12px',
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              {/* Helpful Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setHelpfulSelected(!helpfulSelected);
                  setNotHelpfulSelected(false);
                }}
                style={{
                  flex: isMobile ? 1 : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: helpfulSelected 
                    ? 'rgba(34, 197, 94, 0.1)' 
                    : isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'transparent',
                  backdropFilter: 'blur(16px) saturate(1.2)',
                  border: helpfulSelected 
                    ? '1px solid rgba(34, 197, 94, 0.3)' 
                    : '1px solid rgba(34, 197, 94, 0.25)',
                  boxShadow: helpfulSelected
                    ? '0 4px 16px rgba(34, 197, 94, 0.2)'
                    : '0 2px 8px rgba(34, 197, 94, 0.1)',
                  fontSize: isMobile ? '13px' : '14px',
                  fontWeight: '500',
                  color: helpfulSelected ? '#16a34a' : (isDarkMode ? '#ffffff' : '#6b7280'),
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <ThumbsUp size={isMobile ? 14 : 16} />
                <span>Helpful</span>
              </button>

              {/* Not Helpful Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setNotHelpfulSelected(!notHelpfulSelected);
                  setHelpfulSelected(false);
                }}
                style={{
                  flex: isMobile ? 1 : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: notHelpfulSelected 
                    ? 'rgba(239, 68, 68, 0.1)' 
                    : isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'transparent',
                  backdropFilter: 'blur(16px) saturate(1.2)',
                  border: notHelpfulSelected 
                    ? '1px solid rgba(239, 68, 68, 0.3)' 
                    : '1px solid rgba(239, 68, 68, 0.25)',
                  boxShadow: notHelpfulSelected
                    ? '0 4px 16px rgba(239, 68, 68, 0.2)'
                    : '0 2px 8px rgba(239, 68, 68, 0.1)',
                  fontSize: isMobile ? '13px' : '14px',
                  fontWeight: '500',
                  color: notHelpfulSelected ? '#dc2626' : (isDarkMode ? '#ffffff' : '#6b7280'),
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <ThumbsDown size={isMobile ? 14 : 16} />
                <span>Not Helpful</span>
              </button>

              {/* Leave Feedback Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFeedbackExpanded(!feedbackExpanded);
                }}
                style={{
                  flex: isMobile ? 1 : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'transparent',
                  backdropFilter: 'blur(16px) saturate(1.2)',
                  border: '1px solid rgba(107, 114, 128, 0.25)',
                  boxShadow: '0 4px 16px rgba(107, 114, 128, 0.15)',
                  fontSize: isMobile ? '13px' : '14px',
                  fontWeight: '500',
                  color: isDarkMode ? '#ffffff' : '#6b7280',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <MessageSquare size={isMobile ? 14 : 16} />
                <span>Leave Feedback</span>
              </button>
            </div>

            {/* Feedback Form */}
            {feedbackExpanded && (
              <div style={{
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'}`,
                animation: 'slideDown 0.25s cubic-bezier(0.22, 0.61, 0.36, 1)'
              }}>
                <textarea
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  placeholder="Tell us what could be improved..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#e5e7eb'}`,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(8px)',
                    fontSize: isMobile ? '15px' : '16px',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    minHeight: isMobile ? '80px' : '100px',
                    resize: 'none',
                    outline: 'none'
                  }}
                  rows={isMobile ? 3 : 4}
                />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '12px'
                }}>
                  <span style={{
                    fontSize: '12px',
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : '#9ca3af'
                  }}>
                    This helps improve our AI models
                  </span>
                  <button
                    onClick={handleFeedbackSubmit}
                    disabled={!feedbackMessage.trim()}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      backgroundColor: feedbackMessage.trim() ? '#3b82f6' : '#e5e7eb',
                      color: feedbackMessage.trim() ? '#ffffff' : '#9ca3af',
                      border: 'none',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: feedbackMessage.trim() ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s'
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default EnhancedSolutionCard;