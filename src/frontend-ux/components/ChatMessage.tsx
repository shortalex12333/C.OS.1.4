import React, { useState, useEffect } from 'react';
import { AISolutionCard } from './AISolutionCard';
import ReactMarkdown from 'react-markdown';
import { StreamingText } from './StreamingText';
import type { ChatMessage as ChatMessageType, ParsedContent, WebhookArrayResponse } from '../../types/webhook';

interface ChatMessageProps {
  message: ChatMessageType;
  displayName: string;
  isDarkMode?: boolean;
  isMobile?: boolean;
}

export function ChatMessage({ message, displayName, isDarkMode = false, isMobile = false }: ChatMessageProps) {
  const [isCurrentlyStreaming, setIsCurrentlyStreaming] = useState(message.isStreaming ?? false);
  
  useEffect(() => {
    setIsCurrentlyStreaming(message.isStreaming ?? false);
  }, [message.isStreaming]);
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
        text: content.answer || content.message || content.ai_summary || 'Processing your request...',
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

  return (
    <div className={`flex gap-3 ${message.isUser ? 'user_message_container' : 'ai_response_container'}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm flex-shrink-0 ${
        message.isUser 
          ? 'bg-gradient-to-br from-blue-500 to-blue-600 user_avatar_display' 
          : 'bg-gradient-to-br from-blue-500 to-blue-600 ai_avatar_display'
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
          <div className="w-3 h-3 bg-white rounded-full"></div>
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
            color: isDarkMode ? 'rgba(246, 247, 251, 0.7)' : '#6b7280'
          }}
        >
          {message.isUser ? 'You' : 'CelesteOS'}
        </div>
        
        {/* Message content */}
        <div>
          {text && (
            <div 
              className={message.isUser ? 'user_query_display' : 'ai_response_message'}
              style={{
                fontSize: isMobile ? '15px' : '16px',
                lineHeight: isMobile ? '22px' : '24px',
                letterSpacing: '-0.32px',
                fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                color: isDarkMode ? 'var(--headline, #f6f7fb)' : '#1f2937',
                marginBottom: solutions ? '16px' : '0'
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
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;