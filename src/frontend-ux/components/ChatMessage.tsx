import React, { useState, useEffect } from 'react';
import { AISolutionCard } from './AISolutionCard';
import ReactMarkdown from 'react-markdown';
import { StreamingText } from './StreamingText';
import { BrainLogo } from './BrainLogo';
import { Copy, RotateCw, ThumbsUp, ThumbsDown, Edit2 } from 'lucide-react';
import type { ChatMessage as ChatMessageType, ParsedContent, WebhookArrayResponse } from '../../types/webhook';

interface ChatMessageProps {
  message: ChatMessageType;
  displayName: string;
  isDarkMode?: boolean;
  isMobile?: boolean;
}

export function ChatMessage({ message, displayName, isDarkMode = false, isMobile = false }: ChatMessageProps) {
  const [isCurrentlyStreaming, setIsCurrentlyStreaming] = useState(message.isStreaming ?? false);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [feedbackGiven, setFeedbackGiven] = useState<'up' | 'down' | null>(null);
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    setIsCurrentlyStreaming(message.isStreaming ?? false);
  }, [message.isStreaming]);
  
  useEffect(() => {
    // Remove initial render state after animation completes
    const timer = setTimeout(() => {
      setIsInitialRender(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);
  // Parse the content - simplified since webhook service handles transformation
  const parseContent = (): ParsedContent => {
    // User messages are always plain text
    if (message.isUser) {
      return { text: String(message.content), solutions: null, showRaw: false };
    }

    // For AI responses, content should already be normalized by webhook service
    if (typeof message.content === 'object' && message.content !== null) {
      const content = message.content as any;
      
      return {
        text: content.answer || content.ai_summary || 'Processing your request...',
        solutions: content.solutions || null,
        items: content.items || content.documents_used || [],
        sources: content.sources || [],
        references: content.references || content.documents_used || [],
        showRaw: false
      };
    }
    
    // Plain text response
    if (typeof message.content === 'string') {
      return { text: message.content, solutions: null, showRaw: false };
    }

    // Fallback for unexpected types
    return { text: 'Processing response...', solutions: null, showRaw: false };
  };

  const parsedContent = parseContent();
  
  // Solutions parsed and ready
  
  // Ensure text is always a string
  const text = typeof parsedContent.text === 'string' 
    ? parsedContent.text 
    : String(parsedContent.text || 'Processing your request...');
  const solutions = parsedContent.solutions;

  // Action handlers for message buttons
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleEdit = () => {
    // Trigger edit logic - this would need to be connected to parent component
    console.log('Edit message:', message.id, 'Content:', text);
    // TODO: Implement edit functionality via parent callback
  };

  const handleRetry = () => {
    // Trigger retry logic - this would need to be connected to parent component
    console.log('Retry message:', message.id);
    // TODO: Implement retry functionality via parent callback
  };

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedbackGiven(feedbackGiven === type ? null : type);
    // TODO: Send feedback to backend
    console.log('Feedback:', type, 'for message:', message.id);
  };

  return (
    <div 
      className={`flex gap-3 ${message.isUser ? 'user_message_container flex-row-reverse ml-8' : 'ai_response_container mr-8'}`}
      style={{
        animation: isInitialRender && message.isUser 
          ? 'messageSlideUp 0.5s cubic-bezier(0.22, 0.61, 0.36, 1)' 
          : isInitialRender && !message.isUser
          ? 'messageFadeIn 0.5s cubic-bezier(0.22, 0.61, 0.36, 1)'
          : 'none',
        transformOrigin: message.isUser ? 'bottom right' : 'bottom left'
      }}
    >
      {/* Avatar */}
      <div className={`flex items-center justify-center flex-shrink-0 ${
        message.isUser 
          ? 'w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm user_avatar_display' 
          : 'w-8 h-8 ai_avatar_display'
      }`}>
        {message.isUser ? (
          <span 
            className="text-white font-medium"
            style={{
              fontSize: '10px',
              lineHeight: '10px',
              fontFamily: 'Eloquia Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          >
            {(displayName || 'User')
              .split(' ')
              .map(name => name[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </span>
        ) : (
          <BrainLogo 
            size={32}
            isDarkMode={isDarkMode}
            className="transition-all duration-300"
          />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        {/* Name label */}
        <div 
          className={`mb-1 ${message.isUser ? 'user_label_display' : 'assistant_label_display'}`}
          style={{
            fontSize: '14px',
            lineHeight: '20px',
            fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: isDarkMode ? 'rgba(246, 247, 251, 0.7)' : '#6b7280',
            textAlign: message.isUser ? 'right' : 'left'
          }}
        >
          {message.isUser ? 'You' : 'CelesteOS'}
        </div>
        
        {/* Message content */}
        <div style={{ textAlign: message.isUser ? 'right' : 'left' }}>
          {text && (
            <div 
              className={message.isUser ? 'user_query_display' : 'ai_response_message'}
              style={{
                fontSize: isMobile ? '15px' : '16px',
                lineHeight: isMobile ? '22px' : '24px',
                letterSpacing: '-0.32px',
                fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                color: isDarkMode ? 'var(--headline, #f6f7fb)' : '#1f2937',
                marginBottom: solutions ? '16px' : '0',
                textAlign: message.isUser ? 'right' : 'left'
              }}
            >
              {message.isUser ? (
                String(text)
              ) : (
                <StreamingText 
                  text={String(text)} 
                  isStreaming={isCurrentlyStreaming}
                  delay={20}
                  onComplete={() => setIsCurrentlyStreaming(false)}
                />
              )}
            </div>
          )}
          
          {/* Solution Cards */}
          {solutions && solutions.length > 0 && !message.isUser && (
            <AISolutionCard 
              solutions={solutions}
              isDarkMode={isDarkMode}
              isMobile={isMobile}
            />
          )}
          
          {/* Message Action Buttons - User messages */}
          {message.isUser && (
            <div 
              className="flex items-center gap-1 mt-3 justify-end user_message_actions"
              style={{
                opacity: 0.8,
                transition: 'opacity 200ms ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
            >
              {/* Copy Button */}
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg transition-all duration-200"
                title={copied ? "Copied!" : "Copy message"}
                style={{
                  color: copied 
                    ? '#10b981' // Green when copied
                    : isDarkMode ? 'rgba(246, 247, 251, 0.6)' : '#9ca3af',
                  backgroundColor: copied
                    ? isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)'
                    : 'transparent',
                  border: '1px solid transparent'
                }}
                onMouseEnter={(e) => {
                  if (!copied) {
                    e.currentTarget.style.backgroundColor = isDarkMode 
                      ? 'rgba(246, 247, 251, 0.08)' 
                      : 'rgba(0, 0, 0, 0.04)';
                    e.currentTarget.style.color = isDarkMode 
                      ? 'rgba(246, 247, 251, 0.9)' 
                      : '#374151';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!copied) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = isDarkMode 
                      ? 'rgba(246, 247, 251, 0.6)' 
                      : '#9ca3af';
                  }
                }}
              >
                <Copy className="w-4 h-4" />
              </button>

              {/* Edit Button */}
              <button
                onClick={handleEdit}
                className="p-1.5 rounded-lg transition-all duration-200"
                title="Edit message"
                style={{
                  color: isDarkMode ? 'rgba(246, 247, 251, 0.6)' : '#9ca3af',
                  backgroundColor: 'transparent',
                  border: '1px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDarkMode 
                    ? 'rgba(246, 247, 251, 0.08)' 
                    : 'rgba(0, 0, 0, 0.04)';
                  e.currentTarget.style.color = isDarkMode 
                    ? 'rgba(246, 247, 251, 0.9)' 
                    : '#374151';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = isDarkMode 
                    ? 'rgba(246, 247, 251, 0.6)' 
                    : '#9ca3af';
                }}
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {/* Message Action Buttons - AI responses */}
          {!message.isUser && !isCurrentlyStreaming && (
            <div 
              className="flex items-center gap-1 mt-3 message_actions_container"
              style={{
                opacity: 0.8,
                transition: 'opacity 200ms ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
            >
              {/* Copy Button */}
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg transition-all duration-200"
                title={copied ? "Copied!" : "Copy message"}
                style={{
                  color: copied 
                    ? '#10b981' // Green when copied
                    : isDarkMode ? 'rgba(246, 247, 251, 0.6)' : '#9ca3af',
                  backgroundColor: copied
                    ? isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)'
                    : 'transparent',
                  border: '1px solid transparent'
                }}
                onMouseEnter={(e) => {
                  if (!copied) {
                    e.currentTarget.style.backgroundColor = isDarkMode 
                      ? 'rgba(246, 247, 251, 0.08)' 
                      : 'rgba(0, 0, 0, 0.04)';
                    e.currentTarget.style.color = isDarkMode 
                      ? 'rgba(246, 247, 251, 0.9)' 
                      : '#374151';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!copied) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = isDarkMode 
                      ? 'rgba(246, 247, 251, 0.6)' 
                      : '#9ca3af';
                  }
                }}
              >
                <Copy className="w-4 h-4" />
              </button>

              {/* Retry Button */}
              <button
                onClick={handleRetry}
                className="p-1.5 rounded-lg transition-all duration-200"
                title="Regenerate response"
                style={{
                  color: isDarkMode ? 'rgba(246, 247, 251, 0.6)' : '#9ca3af',
                  backgroundColor: 'transparent',
                  border: '1px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDarkMode 
                    ? 'rgba(246, 247, 251, 0.08)' 
                    : 'rgba(0, 0, 0, 0.04)';
                  e.currentTarget.style.color = isDarkMode 
                    ? 'rgba(246, 247, 251, 0.9)' 
                    : '#374151';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = isDarkMode 
                    ? 'rgba(246, 247, 251, 0.6)' 
                    : '#9ca3af';
                }}
              >
                <RotateCw className="w-4 h-4" />
              </button>

              {/* Separator */}
              <div 
                className="mx-1"
                style={{
                  width: '1px',
                  height: '16px',
                  backgroundColor: isDarkMode 
                    ? 'rgba(246, 247, 251, 0.15)' 
                    : 'rgba(0, 0, 0, 0.1)'
                }}
              />

              {/* Thumbs Up */}
              <button
                onClick={() => handleFeedback('up')}
                className="p-1.5 rounded-lg transition-all duration-200"
                title="Good response"
                style={{
                  color: feedbackGiven === 'up'
                    ? '#10b981' // Green when selected
                    : isDarkMode ? 'rgba(246, 247, 251, 0.6)' : '#9ca3af',
                  backgroundColor: feedbackGiven === 'up'
                    ? isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)'
                    : 'transparent',
                  border: '1px solid transparent'
                }}
                onMouseEnter={(e) => {
                  if (feedbackGiven !== 'up') {
                    e.currentTarget.style.backgroundColor = isDarkMode 
                      ? 'rgba(246, 247, 251, 0.08)' 
                      : 'rgba(0, 0, 0, 0.04)';
                    e.currentTarget.style.color = isDarkMode 
                      ? 'rgba(246, 247, 251, 0.9)' 
                      : '#374151';
                  }
                }}
                onMouseLeave={(e) => {
                  if (feedbackGiven !== 'up') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = isDarkMode 
                      ? 'rgba(246, 247, 251, 0.6)' 
                      : '#9ca3af';
                  }
                }}
              >
                <ThumbsUp className="w-4 h-4" style={{ 
                  fill: feedbackGiven === 'up' ? 'currentColor' : 'none',
                  strokeWidth: feedbackGiven === 'up' ? 0 : 2
                }} />
              </button>

              {/* Thumbs Down */}
              <button
                onClick={() => handleFeedback('down')}
                className="p-1.5 rounded-lg transition-all duration-200"
                title="Poor response"
                style={{
                  color: feedbackGiven === 'down'
                    ? '#ef4444' // Red when selected
                    : isDarkMode ? 'rgba(246, 247, 251, 0.6)' : '#9ca3af',
                  backgroundColor: feedbackGiven === 'down'
                    ? isDarkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)'
                    : 'transparent',
                  border: '1px solid transparent'
                }}
                onMouseEnter={(e) => {
                  if (feedbackGiven !== 'down') {
                    e.currentTarget.style.backgroundColor = isDarkMode 
                      ? 'rgba(246, 247, 251, 0.08)' 
                      : 'rgba(0, 0, 0, 0.04)';
                    e.currentTarget.style.color = isDarkMode 
                      ? 'rgba(246, 247, 251, 0.9)' 
                      : '#374151';
                  }
                }}
                onMouseLeave={(e) => {
                  if (feedbackGiven !== 'down') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = isDarkMode 
                      ? 'rgba(246, 247, 251, 0.6)' 
                      : '#9ca3af';
                  }
                }}
              >
                <ThumbsDown className="w-4 h-4" style={{ 
                  fill: feedbackGiven === 'down' ? 'currentColor' : 'none',
                  strokeWidth: feedbackGiven === 'down' ? 0 : 2
                }} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;