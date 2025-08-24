import React from 'react';
import ReactMarkdown from 'react-markdown';
import { UpdateUXHeader } from './UpdateUXHeader';
import { SolutionCard } from './SolutionCard';
import ConversationCard from './ConversationCard';

export function UpdateUXChatArea({ 
  messages = [],
  user = null,
  isMobile = false, 
  isDarkMode = false, 
  selectedModel = 'air', 
  onModelChange = () => {},
  messagesEndRef = null
}) {
  
  const displayName = user?.displayName || user?.name || 'User';

  return (
    <div style={{ 
      display: 'flex', 
      height: '100%', 
      flexDirection: 'column' 
    }}>
      {/* Main Header with CelesteOS branding and Model Selector */}
      <UpdateUXHeader 
        isMobile={isMobile}
        isDarkMode={isDarkMode}
        isChatMode={true}
        selectedModel={selectedModel}
        onModelChange={onModelChange}
      />
      
      {/* Chat Messages Container */}
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          flex: 1,
          maxWidth: isMobile ? '390px' : '760px',
          margin: '0 auto',
          padding: isMobile ? '16px' : '24px'
        }}
      >
        <div 
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            paddingBottom: '24px'
          }}
        >
          {/* Dynamic Chat Messages */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {messages.map((message) => (
              <div 
                key={message.id} 
                style={{
                  display: 'flex', 
                  gap: '12px'
                }}
              >
                {/* Avatar */}
                <div 
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    flexShrink: 0,
                    background: message.isUser 
                      ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' 
                      : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
                  }}
                >
                  {message.isUser ? (
                    <span 
                      style={{
                        color: 'white',
                        fontSize: '10px',
                        lineHeight: '10px',
                        fontFamily: 'Eloquia Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        fontWeight: 500
                      }}
                    >
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
                      backgroundColor: 'white',
                      borderRadius: '50%'
                    }} />
                  )}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Name label */}
                  <div 
                    style={{
                      marginBottom: '4px',
                      fontSize: '14px',
                      lineHeight: '20px',
                      fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      color: isDarkMode ? 'rgba(246, 247, 251, 0.7)' : '#6b7280'
                    }}
                  >
                    {message.isUser ? 'You' : 'CelesteOS'}
                  </div>
                  
                  {/* Message content */}
                  <div>
                    <div 
                      style={{
                        fontSize: isMobile ? '15px' : '16px',
                        lineHeight: isMobile ? '22px' : '24px',
                        letterSpacing: '-0.32px',
                        fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        color: isDarkMode ? 'var(--headline, #f6f7fb)' : '#1f2937'
                      }}
                    >
                      {message.isUser ? (
                        message.text || message.content
                      ) : (
                        <ReactMarkdown
                          components={{
                            p: ({children}) => <p style={{ marginBottom: '16px', lineHeight: 1.6 }}>{children}</p>,
                            h1: ({children}) => <h1 style={{ 
                              fontSize: '20px', 
                              fontWeight: 600, 
                              marginBottom: '16px',
                              color: isDarkMode ? 'var(--headline, #f6f7fb)' : '#1f2937'
                            }}>{children}</h1>,
                            h2: ({children}) => <h2 style={{ 
                              fontSize: '18px', 
                              fontWeight: 600, 
                              marginBottom: '12px',
                              color: isDarkMode ? 'var(--headline, #f6f7fb)' : '#1f2937'
                            }}>{children}</h2>,
                            ul: ({children}) => <ul style={{ 
                              paddingLeft: '24px', 
                              marginBottom: '16px',
                              listStyle: 'disc'
                            }}>{children}</ul>,
                            ol: ({children}) => <ol style={{ 
                              paddingLeft: '24px', 
                              marginBottom: '16px',
                              listStyle: 'decimal'
                            }}>{children}</ol>,
                            code: ({inline, children}) => 
                              inline ? (
                                <code style={{
                                  padding: '2px 6px',
                                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                                  borderRadius: '4px',
                                  fontSize: '13px',
                                  fontFamily: 'monospace'
                                }}>{children}</code>
                              ) : (
                                <code>{children}</code>
                              ),
                            pre: ({children}) => (
                              <pre style={{
                                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                                border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
                                borderRadius: '8px',
                                padding: '16px',
                                marginBottom: '16px',
                                overflowX: 'auto',
                                fontSize: '13px',
                                fontFamily: 'monospace'
                              }}>
                                {children}
                              </pre>
                            ),
                            blockquote: ({children}) => (
                              <blockquote style={{
                                borderLeft: `3px solid ${isDarkMode ? 'var(--opulent-gold, #c8a951)' : '#2563eb'}`,
                                paddingLeft: '16px',
                                margin: '16px 0',
                                fontStyle: 'italic',
                                color: isDarkMode ? 'rgba(246, 247, 251, 0.8)' : '#6b7280'
                              }}>
                                {children}
                              </blockquote>
                            ),
                            a: ({href, children}) => (
                              <a href={href} style={{
                                color: isDarkMode ? 'var(--opulent-gold, #c8a951)' : '#2563eb',
                                textDecoration: 'underline'
                              }} target="_blank" rel="noopener noreferrer">
                                {children}
                              </a>
                            )
                          }}
                        >
                          {message.text || message.content}
                        </ReactMarkdown>
                      )}
                    </div>

                    {/* Solution Cards */}
                    {!message.isUser && message.solutions && message.solutions.length > 0 && (
                      <div style={{ marginTop: '16px' }}>
                        <div style={{ 
                          fontSize: '16px',
                          fontWeight: 600,
                          marginBottom: '16px',
                          color: isDarkMode ? 'var(--headline, #f6f7fb)' : '#1f2937',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            color: 'white',
                            fontSize: '14px'
                          }}>
                            {message.solutions.length}
                          </span>
                          Solutions Found
                        </div>
                        {message.solutions.map((solution, idx) => (
                          <SolutionCard 
                            key={solution.id || idx} 
                            solution={solution}
                            index={idx}
                          />
                        ))}
                      </div>
                    )}

                    {/* Conversation Card */}
                    {!message.isUser && (message.items || message.sources || message.confidence) && (
                      <div style={{ marginTop: '24px' }}>
                        <ConversationCard 
                          response={{
                            answer: message.text || message.content,
                            items: message.items || [],
                            sources: message.sources || [],
                            metadata: {
                              confidence: message.confidence
                            },
                            metrics: {
                              processing_time_ms: message.processingTime
                            }
                          }}
                          index={0}
                          isDarkMode={isDarkMode}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Show welcome message when no chat messages */}
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div 
                style={{
                  fontSize: isMobile ? '15px' : '16px',
                  lineHeight: isMobile ? '22px' : '24px',
                  fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  color: isDarkMode ? 'rgba(246, 247, 251, 0.6)' : '#6b7280'
                }}
              >
                Ask me anything about your yacht systems, email management, or general questions.
              </div>
            </div>
          )}
          
          {/* Messages end ref for auto-scroll */}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}

export default UpdateUXChatArea;