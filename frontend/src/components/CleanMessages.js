import React from 'react';
import { User, Copy, RefreshCw, Edit3 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { DESIGN_TOKENS } from '../styles/design-system.js';
import { SolutionCard } from './SolutionCard';
import ConversationCard from './ConversationCard';

/**
 * Clean Messages - Based on UPDATE UX ChatArea template
 * Simple white design for message display
 */
export function CleanMessages({ 
  messages = [],
  user = null,
  isGenerating = false,
  onCopyMessage = () => {},
  onEditMessage = () => {},
  onRegenerateMessage = () => {},
  messagesEndRef = null
}) {
  
  const displayName = user?.displayName || user?.name || 'User';
  
  const TypingIndicator = () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: DESIGN_TOKENS.spacing.xs,
      color: DESIGN_TOKENS.colors.text.muted,
      fontSize: DESIGN_TOKENS.typography.sizes.body,
      fontStyle: 'italic'
    }}>
      <div style={{
        display: 'flex',
        gap: '4px'
      }}>
        <div style={{
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          backgroundColor: DESIGN_TOKENS.colors.accent,
          animation: 'pulse 1.4s ease-in-out infinite'
        }} />
        <div style={{
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          backgroundColor: DESIGN_TOKENS.colors.accent,
          animation: 'pulse 1.4s ease-in-out infinite 0.2s'
        }} />
        <div style={{
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          backgroundColor: DESIGN_TOKENS.colors.accent,
          animation: 'pulse 1.4s ease-in-out infinite 0.4s'
        }} />
      </div>
      <span>CelesteOS is thinking...</span>
    </div>
  );

  const MessageActions = ({ message, isLastAiMessage }) => (
    <div style={{
      display: 'flex',
      gap: DESIGN_TOKENS.spacing.xs,
      marginTop: DESIGN_TOKENS.spacing.xs,
      opacity: 0.7
    }}>
      <button
        onClick={() => onCopyMessage(message)}
        style={{
          padding: DESIGN_TOKENS.spacing.xs,
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          color: DESIGN_TOKENS.colors.text.muted,
          borderRadius: DESIGN_TOKENS.radius.sm,
          display: 'flex',
          alignItems: 'center',
          gap: DESIGN_TOKENS.spacing.xs,
          fontSize: DESIGN_TOKENS.typography.sizes.caption
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = DESIGN_TOKENS.colors.backgroundSecondary}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
      >
        <Copy size={12} />
        Copy
      </button>
      
      {message.isUser && (
        <button
          onClick={() => onEditMessage(message)}
          style={{
            padding: DESIGN_TOKENS.spacing.xs,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: DESIGN_TOKENS.colors.text.muted,
            borderRadius: DESIGN_TOKENS.radius.sm,
            display: 'flex',
            alignItems: 'center',
            gap: DESIGN_TOKENS.spacing.xs,
            fontSize: DESIGN_TOKENS.typography.sizes.caption
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = DESIGN_TOKENS.colors.backgroundSecondary}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <Edit3 size={12} />
          Edit
        </button>
      )}
      
      {!message.isUser && isLastAiMessage && (
        <button
          onClick={() => onRegenerateMessage(message)}
          style={{
            padding: DESIGN_TOKENS.spacing.xs,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: DESIGN_TOKENS.colors.text.muted,
            borderRadius: DESIGN_TOKENS.radius.sm,
            display: 'flex',
            alignItems: 'center',
            gap: DESIGN_TOKENS.spacing.xs,
            fontSize: DESIGN_TOKENS.typography.sizes.caption
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = DESIGN_TOKENS.colors.backgroundSecondary}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <RefreshCw size={12} />
          Regenerate
        </button>
      )}
    </div>
  );

  if (!messages || messages.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        textAlign: 'center',
        padding: DESIGN_TOKENS.spacing.xl,
        color: DESIGN_TOKENS.colors.text.muted,
        fontSize: DESIGN_TOKENS.typography.sizes.body,
        fontFamily: DESIGN_TOKENS.typography.family
      }}>
        <div>
          <div style={{ marginBottom: DESIGN_TOKENS.spacing.md }}>
            Ask me anything about your yacht systems, email management, or general questions.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: DESIGN_TOKENS.spacing.lg,
      maxWidth: '760px',
      margin: '0 auto',
      width: '100%'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.lg }}>
        {messages.map((msg, index) => {
          const isLastAiMessage = !msg.isUser && index === messages.length - 1;
          
          return (
            <div key={msg.id} style={{
              display: 'flex',
              gap: DESIGN_TOKENS.spacing.sm,
              width: '100%'
            }}>
              {/* Avatar */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: msg.isUser ? DESIGN_TOKENS.colors.accent : DESIGN_TOKENS.colors.backgroundSecondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: `1px solid ${DESIGN_TOKENS.colors.border}`
              }}>
                {msg.isUser ? (
                  <span style={{
                    color: '#ffffff',
                    fontSize: DESIGN_TOKENS.typography.sizes.caption,
                    fontWeight: DESIGN_TOKENS.typography.weights.medium,
                    fontFamily: DESIGN_TOKENS.typography.family
                  }}>
                    {displayName
                      .split(' ')
                      .map(name => name[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                ) : (
                  <div style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: DESIGN_TOKENS.colors.accent,
                    borderRadius: '50%'
                  }} />
                )}
              </div>
              
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Name label */}
                <div style={{
                  fontSize: DESIGN_TOKENS.typography.sizes.body,
                  fontFamily: DESIGN_TOKENS.typography.family,
                  color: DESIGN_TOKENS.colors.text.secondary,
                  marginBottom: DESIGN_TOKENS.spacing.xs
                }}>
                  {msg.isUser ? 'You' : 'CelesteOS'}
                </div>
                
                {/* Message content */}
                <div>
                  {msg.isThinking ? (
                    <TypingIndicator />
                  ) : (
                    <>
                      <div style={{
                        fontSize: DESIGN_TOKENS.typography.sizes.body,
                        lineHeight: '1.6',
                        fontFamily: DESIGN_TOKENS.typography.family,
                        color: DESIGN_TOKENS.colors.text.primary
                      }}>
                        {msg.isUser ? (
                          <div style={{
                            padding: `${DESIGN_TOKENS.spacing.sm} ${DESIGN_TOKENS.spacing.md}`,
                            backgroundColor: DESIGN_TOKENS.colors.backgroundSecondary,
                            borderRadius: DESIGN_TOKENS.radius.md,
                            border: `1px solid ${DESIGN_TOKENS.colors.border}`
                          }}>
                            {msg.text}
                          </div>
                        ) : (
                          <div>
                            <ReactMarkdown
                              components={{
                                p: ({children}) => <p style={{ marginBottom: DESIGN_TOKENS.spacing.md }}>{children}</p>,
                                h1: ({children}) => <h1 style={{ 
                                  fontSize: DESIGN_TOKENS.typography.sizes.header, 
                                  fontWeight: DESIGN_TOKENS.typography.weights.semibold, 
                                  marginBottom: DESIGN_TOKENS.spacing.md,
                                  borderBottom: `1px solid ${DESIGN_TOKENS.colors.border}`,
                                  paddingBottom: DESIGN_TOKENS.spacing.sm
                                }}>{children}</h1>,
                                h2: ({children}) => <h2 style={{ 
                                  fontSize: DESIGN_TOKENS.typography.sizes.subheader, 
                                  fontWeight: DESIGN_TOKENS.typography.weights.semibold, 
                                  marginBottom: DESIGN_TOKENS.spacing.sm 
                                }}>{children}</h2>,
                                ul: ({children}) => <ul style={{ 
                                  paddingLeft: DESIGN_TOKENS.spacing.lg, 
                                  marginBottom: DESIGN_TOKENS.spacing.md 
                                }}>{children}</ul>,
                                ol: ({children}) => <ol style={{ 
                                  paddingLeft: DESIGN_TOKENS.spacing.lg, 
                                  marginBottom: DESIGN_TOKENS.spacing.md 
                                }}>{children}</ol>,
                                code: ({inline, children}) => 
                                  inline ? (
                                    <code style={{
                                      padding: `${DESIGN_TOKENS.spacing.xs} 6px`,
                                      backgroundColor: DESIGN_TOKENS.colors.backgroundSecondary,
                                      border: `1px solid ${DESIGN_TOKENS.colors.border}`,
                                      borderRadius: DESIGN_TOKENS.radius.sm,
                                      fontSize: DESIGN_TOKENS.typography.sizes.caption,
                                      fontFamily: 'monospace'
                                    }}>{children}</code>
                                  ) : (
                                    <code>{children}</code>
                                  ),
                                pre: ({children}) => (
                                  <pre style={{
                                    backgroundColor: DESIGN_TOKENS.colors.backgroundSecondary,
                                    border: `1px solid ${DESIGN_TOKENS.colors.border}`,
                                    borderRadius: DESIGN_TOKENS.radius.md,
                                    padding: DESIGN_TOKENS.spacing.md,
                                    marginBottom: DESIGN_TOKENS.spacing.md,
                                    overflowX: 'auto',
                                    fontSize: DESIGN_TOKENS.typography.sizes.caption,
                                    fontFamily: 'monospace'
                                  }}>
                                    {children}
                                  </pre>
                                ),
                                blockquote: ({children}) => (
                                  <blockquote style={{
                                    borderLeft: `3px solid ${DESIGN_TOKENS.colors.accent}`,
                                    paddingLeft: DESIGN_TOKENS.spacing.md,
                                    margin: `${DESIGN_TOKENS.spacing.md} 0`,
                                    fontStyle: 'italic',
                                    color: DESIGN_TOKENS.colors.text.secondary
                                  }}>
                                    {children}
                                  </blockquote>
                                ),
                                a: ({href, children}) => (
                                  <a href={href} style={{
                                    color: DESIGN_TOKENS.colors.accent,
                                    textDecoration: 'underline'
                                  }} target="_blank" rel="noopener noreferrer">
                                    {children}
                                  </a>
                                )
                              }}
                            >
                              {msg.text}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                      
                      {/* Solution Cards */}
                      {!msg.isUser && !msg.isThinking && msg.solutions && msg.solutions.length > 0 && (
                        <div style={{ marginTop: DESIGN_TOKENS.spacing.md }}>
                          <div style={{ 
                            fontSize: DESIGN_TOKENS.typography.sizes.subheader,
                            fontWeight: DESIGN_TOKENS.typography.weights.semibold,
                            marginBottom: DESIGN_TOKENS.spacing.md,
                            color: DESIGN_TOKENS.colors.text.primary,
                            display: 'flex',
                            alignItems: 'center',
                            gap: DESIGN_TOKENS.spacing.sm
                          }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: DESIGN_TOKENS.colors.accent,
                              color: '#ffffff',
                              fontSize: DESIGN_TOKENS.typography.sizes.body
                            }}>
                              {msg.solutions.length}
                            </span>
                            Solutions Found
                          </div>
                          {msg.solutions.map((solution, idx) => (
                            <SolutionCard 
                              key={solution.id || idx} 
                              solution={solution}
                              index={idx}
                            />
                          ))}
                        </div>
                      )}
                      
                      {/* Conversation Card */}
                      {!msg.isUser && !msg.isThinking && 
                       (msg.items || msg.sources || msg.confidence) && (
                        <div style={{ marginTop: DESIGN_TOKENS.spacing.lg }}>
                          <ConversationCard 
                            response={{
                              answer: msg.text,
                              items: msg.items || [],
                              sources: msg.sources || [],
                              metadata: {
                                confidence: msg.confidence
                              },
                              metrics: {
                                processing_time_ms: msg.processingTime
                              }
                            }}
                            index={0}
                            isDarkMode={false}
                          />
                        </div>
                      )}
                      
                      {/* Message Actions */}
                      {!msg.isThinking && !msg.isStreaming && (
                        <MessageActions
                          message={msg}
                          isLastAiMessage={isLastAiMessage}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Messages end ref for auto-scroll */}
      <div ref={messagesEndRef} />
      
      {/* Loading state */}
      {isGenerating && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: DESIGN_TOKENS.spacing.lg,
          color: DESIGN_TOKENS.colors.text.muted,
          fontSize: DESIGN_TOKENS.typography.sizes.body
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: DESIGN_TOKENS.spacing.sm
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              border: `2px solid ${DESIGN_TOKENS.colors.border}`,
              borderTop: `2px solid ${DESIGN_TOKENS.colors.accent}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            Generating response...
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; }
          40% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default CleanMessages;