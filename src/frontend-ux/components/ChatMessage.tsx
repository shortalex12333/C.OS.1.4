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
  // Parse the content if it's JSON
  const parseContent = (): ParsedContent => {
    if (message.isUser) {
      return { text: String(message.content), solutions: null, showRaw: false };
    }

    // Check if content is a string that looks like JSON
    if (typeof message.content === 'string') {
      // First check if it starts with { which indicates JSON
      if (message.content.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(message.content);
          // Extract text but never show raw JSON
          let extractedText = parsed.answer || parsed.message || parsed.response || 'Processing your request...';
          
          // Ensure text is a string without JSON stringification
          if (typeof extractedText === 'object' && extractedText !== null) {
            extractedText = extractedText.text || extractedText.message || extractedText.answer || '';
            // If still an object, just use empty string instead of stringifying
            if (typeof extractedText === 'object') {
              extractedText = 'Processing response...';
            }
          }
          
          return { 
            text: String(extractedText), 
            solutions: parseSolutions(parsed),
            items: parsed.items || [],
            sources: parsed.sources || [],
            references: parsed.references || [],
            showRaw: false // Hide JSON from UI
          };
        } catch (e) {
          // If JSON parsing fails, treat as regular text
          return { text: message.content, solutions: null, showRaw: false };
        }
      }
      // Otherwise treat as regular text/markdown
      return { text: message.content, solutions: null, showRaw: false };
    }
    
    // If content is already an object
    if (typeof message.content === 'object' && message.content !== null) {
      // Processing object content
      
      // Check if it's an array response (webhook array format)
      if (Array.isArray(message.content) && message.content.length > 0) {
        const firstItem = message.content[0] as any;
        
        // Handle OpenAI-style format with message.content structure
        if (firstItem.message && firstItem.message.content) {
          const content = firstItem.message.content;
          const extractedText = content.message || content.ai_summary || 'Processing your request...';
          
          // Convert documents_used to solutions if solutions array is empty
          let solutions = content.solutions || [];
          
          // If no solutions but we have documents, create solutions from them
          if ((!solutions || solutions.length === 0) && content.documents_used && content.documents_used.length > 0) {
            solutions = content.documents_used.map((doc: any, index: number) => ({
              solution_id: doc.id || `solution_${index}`,
              title: doc.fault_code ? `Fault Code ${doc.fault_code}` : `Solution ${index + 1}`,
              confidence: content.confidence_score >= 0.85 ? 'high' : content.confidence_score >= 0.675 ? 'medium' : 'low',
              confidenceScore: Math.round((content.confidence_score || 0.75) * 100),
              source: {
                title: doc.source || 'Technical Manual',
                page: doc.page,
                revision: doc.revision
              },
              steps: [
                { text: `Review ${doc.source} manual for fault code ${doc.fault_code}`, type: 'normal', isBold: false },
                { text: 'Check the referenced documentation for detailed procedures', type: 'tip', isBold: false },
                { text: 'Follow manufacturer safety guidelines', type: 'warning', isBold: true }
              ],
              procedureLink: doc.url || '#',
              original_doc_url: doc.url || '',
              description: `${doc.source} procedure for ${doc.fault_code || 'issue resolution'}`
            }));
          }
          
          // Map solutions to ensure confidence is converted to confidenceScore
          const mappedSolutions = solutions.map((sol: any) => ({
            ...sol,
            confidenceScore: sol.confidenceScore || (sol.confidence ? Math.round(sol.confidence * 100) : 75)
          }));
          
          return {
            text: String(extractedText),
            solutions: mappedSolutions,
            items: content.documents_used || [],
            sources: content.documents_used?.map((d: any) => d.source) || [],
            references: content.documents_used || [],
            showRaw: false
          };
        }
        
        // Handle legacy format
        const responseData = firstItem.response || firstItem;
        const extractedText = responseData.answer || 'Processing your request...';
        
        return {
          text: String(extractedText),
          solutions: parseSolutions(responseData),
          items: responseData.items || [],
          sources: responseData.sources || [],
          references: responseData.references || [],
          showRaw: false
        };
      }
      
      // Handle normalized object response
      const contentObj = message.content as any;
      let extractedText = contentObj.answer || contentObj.response || contentObj.message || 'Processing your request...';
      
      // If the extracted value is still an object, get its text property without stringification
      if (typeof extractedText === 'object' && extractedText !== null) {
        extractedText = extractedText.text || extractedText.message || extractedText.answer || '';
        // If still an object, use a placeholder instead of stringifying
        if (typeof extractedText === 'object') {
          extractedText = 'Processing response...';
        }
      }
      
      return { 
        text: String(extractedText), 
        solutions: parseSolutions(contentObj),
        items: contentObj.items || [],
        sources: contentObj.sources || [],
        references: contentObj.references || [],
        showRaw: false
      };
    }

    return { text: String(message.content), solutions: null, showRaw: false };
  };

  // Parse webhook response into solution card format
  const parseSolutions = (data: any) => {
    // Ensure we have valid data to parse
    if (!data) return null;
    
    // Handle pre-formatted solutions if provided directly from webhook
    if (data.solutions && Array.isArray(data.solutions)) {
      return data.solutions;
    }
    
    // Don't create artificial solutions - only return what webhook provides
    return null;
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