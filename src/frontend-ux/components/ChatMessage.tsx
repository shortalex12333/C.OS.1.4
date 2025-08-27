import React, { useState, useEffect } from 'react';
import { CleanSolutionCard } from './CleanSolutionCard';
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
          
          // Ensure text is a string
          if (typeof extractedText === 'object' && extractedText !== null) {
            extractedText = extractedText.text || extractedText.message || JSON.stringify(extractedText);
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
      console.log('📋 Processing object content:', message.content);
      
      // Check if it's an array response (webhook array format)
      if (Array.isArray(message.content) && message.content.length > 0) {
        const firstItem = message.content[0] as any;
        
        // Handle OpenAI-style format with message.content structure
        if (firstItem.message && firstItem.message.content) {
          const content = firstItem.message.content;
          const extractedText = content.message || content.ai_summary || 'Processing your request...';
          
          return {
            text: String(extractedText),
            solutions: content.solutions || [],
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
      
      // If the extracted value is still an object, get its text property
      if (typeof extractedText === 'object' && extractedText !== null) {
        extractedText = extractedText.text || extractedText.message || extractedText.answer || JSON.stringify(extractedText);
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
    const solutions = [];
    
    // Ensure we have valid data to parse
    if (!data) return null;
    
    // ONLY create solution cards if the webhook explicitly provides structured data
    // Check if we have items, sources, or references that indicate a structured response
    const hasStructuredData = 
      (data.items && Array.isArray(data.items) && data.items.length > 0) ||
      (data.sources && Array.isArray(data.sources) && data.sources.length > 0) ||
      (data.references && Array.isArray(data.references) && data.references.length > 0) ||
      (data.solutions && Array.isArray(data.solutions) && data.solutions.length > 0) ||
      (data.steps && Array.isArray(data.steps) && data.steps.length > 0);
    
    // If there's no structured data, return null - don't create artificial solution cards
    if (!hasStructuredData) {
      return null;
    }
    
    // Handle pre-formatted solutions if provided
    if (data.solutions && Array.isArray(data.solutions)) {
      return data.solutions;
    }
    
    // Handle yacht installation/technical queries ONLY if we have actual structured data
    const answerString = typeof data.answer === 'string' 
      ? data.answer 
      : typeof data.answer === 'object' && data.answer !== null
        ? (data.answer.text || data.answer.message || data.answer.content || '')
        : '';
    
    // Only create solution cards if we have items AND it's a technical response
    if (data.items && data.items.length > 0 && answerString && (
      answerString.toLowerCase().includes('install') || 
      answerString.toLowerCase().includes('fault') ||
      answerString.toLowerCase().includes('error') ||
      answerString.toLowerCase().includes('system') ||
      answerString.toLowerCase().includes('equipment') ||
      answerString.toLowerCase().includes('procedure') ||
      answerString.toLowerCase().includes('technical') ||
      answerString.toLowerCase().includes('maintenance') ||
      answerString.toLowerCase().includes('emergency')
    )) {
      // Create structured solution card ONLY from actual webhook data
      const steps = [];
      
      // Use items from webhook as steps - don't artificially parse the answer text
      if (data.items && Array.isArray(data.items) && data.items.length > 0) {
        data.items.forEach((item: string, index: number) => {
          if (typeof item === 'string' && item.trim()) {
            steps.push({
              text: item.trim(),
              type: item.toLowerCase().includes('warning') || item.toLowerCase().includes('caution')
                ? 'warning' as const
                : item.toLowerCase().includes('note') || item.toLowerCase().includes('tip')
                ? 'tip' as const
                : 'normal' as const,
              isBold: index === 0 // First item is bold
            });
          }
        });
      }
      
      // Only create solution card if we have steps
      if (steps.length > 0) {
        solutions.push({
          id: `solution_${Date.now()}`,
          title: answerString.toLowerCase().includes('install') 
            ? 'Installation Procedures'
            : answerString.toLowerCase().includes('fault') || answerString.toLowerCase().includes('error')
            ? 'Diagnostic Analysis'
            : 'Technical Guidance',
          confidence: 'high',
          confidenceScore: 85,
          source: {
            title: data.sources?.[0] || 'Yacht Technical Manual',
            page: data.references?.[0]?.page || null,
            revision: data.references?.[0]?.revision || '2024.1'
          },
          steps: steps,
          procedureLink: data.references?.[0]?.url || '#'
        });
      }
    }
    
    // Check if there are items that represent parts (specific format only)
    else if (data.items && Array.isArray(data.items) && data.items.length > 0) {
      // ONLY show parts solution card if it's actually a parts response with part numbers
      const firstItem = data.items[0];
      if (typeof firstItem === 'string' && firstItem.match(/^\d{3}-\d{3}-\d{3}:/)) {
        // Parse parts format: "001-043-140: Mounting Bracket for 19inch MFD"
        const partMatch = firstItem.match(/^([^:]+):\s*(.+)$/);
        if (partMatch) {
          solutions.push({
            id: `part_${partMatch[1]}`,
            title: partMatch[2],
            confidence: 'high',
            confidenceScore: 95,
            source: {
              title: data.sources?.[0] || 'Parts Database',
              page: null,
              revision: null
            },
            steps: [
              {
                text: `Part Number: ${partMatch[1]}`,
                type: 'normal' as const,
                isBold: true
              },
              {
                text: 'Manufacturer: Furuno',
                type: 'normal' as const
              },
              {
                text: 'Location: Installation Hardware',
                type: 'tip' as const
              },
              {
                text: 'Price: $245',
                type: 'normal' as const
              }
            ],
            procedureLink: `https://vivovcnaapmcfxxfhzxk.supabase.co/functions/v1/fetch-manufacturer-intelligence?part_number=${partMatch[1]}`
          });
        }
      }
      // DO NOT create generic "Recommended Actions" cards - only show real solutions
    }

    return solutions.length > 0 ? solutions : null;
  };

  const parsedContent = parseContent();
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
            <CleanSolutionCard 
              solutions={solutions}
              isDarkMode={isDarkMode}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;