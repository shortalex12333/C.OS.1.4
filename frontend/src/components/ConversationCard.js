import React, { useState } from 'react';
import { ChevronRight, ExternalLink, Copy, CheckCircle, ThumbsUp, ThumbsDown } from 'lucide-react';

/**
 * ConversationCard Component - Phase 2
 * Adapts the solution card design for conversation/response data from webhook
 */

export function ConversationCard({ response, index = 0, isDarkMode = false }) {
  const [isExpanded, setIsExpanded] = useState(index === 0); // First card expanded by default
  const [copySuccess, setCopySuccess] = useState(false);
  const [helpfulSelected, setHelpfulSelected] = useState(false);
  const [notHelpfulSelected, setNotHelpfulSelected] = useState(false);

  // Handle different response structures
  const parseResponse = () => {
    if (!response) return null;

    // Extract data from webhook response structure
    const answer = response.answer || response.response?.answer || '';
    const items = response.items || response.response?.items || [];
    const sources = response.sources || response.response?.sources || [];
    const confidence = response.metadata?.confidence || response.confidence || 0.8;
    const processingTime = response.metrics?.processing_time_ms || 0;

    return {
      answer,
      items,
      sources,
      confidence,
      processingTime
    };
  };

  const data = parseResponse();
  if (!data || !data.answer) return null;

  const copyToClipboard = () => {
    const text = `${data.answer}\n\n${data.items.map(item => `• ${item}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return '#22c55e'; // Green
    if (confidence >= 0.6) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  return (
    <div 
      className="conversation-card card glass"
      style={{
        marginBottom: 'var(--spacing-4)',
        cursor: 'pointer',
        animation: `slideUp var(--transition-base) ${index * 0.1}s`,
        animationFillMode: 'both'
      }}
    >
      {/* Header - Always visible */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: 'var(--spacing-5)',
          borderBottom: isExpanded ? '1px solid var(--color-border)' : 'none',
          transition: 'all var(--transition-base)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            {/* Answer preview */}
            <p style={{
              fontSize: '16px',
              lineHeight: '1.5',
              color: 'var(--color-text-primary)',
              marginBottom: '12px',
              display: '-webkit-box',
              WebkitLineClamp: isExpanded ? 'none' : 2,
              WebkitBoxOrient: 'vertical',
              overflow: isExpanded ? 'visible' : 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {data.answer}
            </p>

            {/* Metadata chips */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {/* Confidence chip */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: `${getConfidenceColor(data.confidence)}20`,
                border: `1px solid ${getConfidenceColor(data.confidence)}40`,
                fontSize: '13px',
                fontWeight: '500',
                color: getConfidenceColor(data.confidence)
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: getConfidenceColor(data.confidence)
                }} />
                {Math.round(data.confidence * 100)}% confidence
              </div>

              {/* Source chip */}
              {data.sources.length > 0 && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--color-border)',
                  fontSize: '13px',
                  color: 'var(--color-text-muted)'
                }}>
                  <ExternalLink size={12} />
                  {data.sources[0]}
                </div>
              )}

              {/* Response time */}
              {data.processingTime > 0 && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--color-border)',
                  fontSize: '13px',
                  color: 'var(--color-text-muted)'
                }}>
                  {data.processingTime}ms
                </div>
              )}
            </div>
          </div>

          {/* Chevron indicator */}
          <div style={{
            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)',
            transition: 'transform var(--transition-base)',
            color: 'var(--color-text-muted)'
          }}>
            <ChevronRight size={20} />
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div style={{
          animation: 'slideDown var(--transition-base)',
          overflow: 'hidden'
        }}>
          {/* Items/suggestions */}
          {data.items.length > 0 && (
            <div style={{
              padding: 'var(--spacing-5)',
              borderBottom: '1px solid var(--color-border)'
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--color-text-secondary)',
                marginBottom: '12px'
              }}>
                Suggestions:
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {data.items.map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'start',
                    gap: '12px'
                  }}>
                    <CheckCircle size={16} color="#22c55e" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span style={{
                      fontSize: '15px',
                      lineHeight: '1.5',
                      color: 'var(--color-text-primary)'
                    }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{
            padding: 'var(--spacing-4) var(--spacing-5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            {/* Feedback buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setHelpfulSelected(!helpfulSelected);
                  setNotHelpfulSelected(false);
                }}
                className="transition-base"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: helpfulSelected 
                    ? '1px solid #22c55e40'
                    : '1px solid var(--color-border)',
                  backgroundColor: helpfulSelected 
                    ? '#22c55e20'
                    : 'transparent',
                  color: helpfulSelected 
                    ? '#22c55e'
                    : 'var(--color-text-muted)',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                <ThumbsUp size={14} />
                Helpful
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setNotHelpfulSelected(!notHelpfulSelected);
                  setHelpfulSelected(false);
                }}
                className="transition-base"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: notHelpfulSelected 
                    ? '1px solid #ef444440'
                    : '1px solid var(--color-border)',
                  backgroundColor: notHelpfulSelected 
                    ? '#ef444420'
                    : 'transparent',
                  color: notHelpfulSelected 
                    ? '#ef4444'
                    : 'var(--color-text-muted)',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                <ThumbsDown size={14} />
                Not Helpful
              </button>
            </div>

            {/* Copy button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard();
              }}
              className="transition-base"
              style={{
                padding: '6px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: copySuccess ? '#22c55e20' : 'transparent',
                color: copySuccess ? '#22c55e' : 'var(--color-text-muted)',
                cursor: 'pointer'
              }}
              title="Copy response"
            >
              {copySuccess ? <CheckCircle size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConversationCard;