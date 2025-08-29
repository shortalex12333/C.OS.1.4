import React, { useEffect, useRef } from 'react';
import { MainHeader } from './MainHeader';
import { ChatMessage as ChatMessageComponent } from './ChatMessage';
import { ThinkingIndicator } from './ThinkingIndicator';
import type { ChatMessage } from '../../types/webhook';

interface ChatAreaProps {
  isChatMode: boolean;
  isMobile?: boolean;
  displayName: string;
  isDarkMode?: boolean;
  selectedModel?: string;
  onModelChange?: (modelId: string) => void;
  messages?: ChatMessage[];
  onFAQpageClick?: () => void;
  isWaitingForResponse?: boolean;
  searchType?: 'yacht' | 'email' | 'email-yacht';
  onEditMessage?: (messageId: string, newContent: string) => void;
  onRegenerateResponse?: (messageId: string) => void;
  onScheduleCallClick?: () => void;
}

export function ChatArea({ 
  isChatMode, 
  isMobile = false, 
  displayName, 
  isDarkMode = false, 
  selectedModel = 'air', 
  onModelChange, 
  messages = [], 
  onFAQpageClick,
  isWaitingForResponse = false,
  searchType = 'yacht',
  onEditMessage,
  onRegenerateResponse,
  onScheduleCallClick
}: ChatAreaProps) {
  // Ref for the scrollable messages container
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current && (messages.length > 0 || isWaitingForResponse)) {
      // Use smooth scrolling for a better user experience
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [messages.length, isWaitingForResponse]); // Trigger on message count change or waiting state change
  // Time-based greeting function
  const getTimeBasedGreeting = () => {
    try {
      const now = new Date();
      const hour = now.getHours();
      
      // Morning: 5:00 AM - 11:59 AM (5-11)
      if (hour >= 5 && hour < 12) {
        return 'Morning';
      }
      // Afternoon: 12:00 PM - 4:59 PM (12-16)  
      else if (hour >= 12 && hour < 17) {
        return 'Afternoon';
      }
      // Evening: 5:00 PM - 4:59 AM (17-4)
      else {
        return 'Evening';
      }
    } catch (error) {
      // Fallback when time cannot be fetched
      console.warn('Unable to fetch current time, using default greeting:', error);
      return 'Hello';
    }
  };
  // Mock solution data - In production, this would come from webhook response
  const mockSolutions = [
    {
      id: "solution_1",
      title: "Check Engine Coolant System",
      confidence: "high" as const,
      source: {
        title: "Yacht Maintenance Manual",
        page: 47,
        revision: "2024.1"
      },
      steps: [
        {
          text: "Turn off the engine and allow it to cool completely before inspection.",
          type: "warning" as const,
          isBold: true
        },
        {
          text: "Locate the coolant reservoir tank near the engine compartment.",
          type: "normal" as const
        },
        {
          text: "Check coolant level against the MIN/MAX markers on the tank.",
          type: "tip" as const
        },
        {
          text: "If coolant is below MIN level, add marine-grade coolant mixture.",
          type: "normal" as const
        },
        {
          text: "Monitor for leaks around hoses and connections.",
          type: "tip" as const
        }
      ],
      procedureLink: "https://manual.yacht.com/engine/coolant"
    },
    {
      id: "solution_2", 
      title: "Inspect Fuel System Components",
      confidence: "medium" as const,
      source: {
        title: "Engine Diagnostic Guide",
        page: 23
      },
      steps: [
        {
          text: "Check fuel filter for contamination or clogging.",
          type: "normal" as const
        },
        {
          text: "Inspect fuel lines for cracks or wear.",
          type: "warning" as const
        },
        {
          text: "Test fuel pump pressure using marine fuel pressure gauge.",
          type: "normal" as const
        }
      ]
    }
  ];

  if (!isChatMode) {
    return (
      <div className="flex h-full flex-col" style={{ position: 'relative' }}>
        {/* Main Header with CelesteOS branding - STICKY POSITION */}
        <div style={{
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: 'transparent',
          opacity: 1,
          borderBottom: 'none',
          zIndex: 10,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}>
          <MainHeader 
            isMobile={isMobile}
            isDarkMode={isDarkMode}
            isChatMode={false}
            selectedModel={selectedModel}
            onModelChange={onModelChange}
            onFAQpageClick={onFAQpageClick}
            onScheduleCallClick={onScheduleCallClick}
          />
        </div>
        
        {/* Welcome State Content */}
        <div className="flex h-full items-center justify-center welcome_state_container">
          <div className="text-center max-w-2xl px-6">
            {/* Greeting Header */}
            <h2 
              className="mb-4 welcome_greeting_header"
              style={{
                fontSize: isMobile ? '24px' : '28px',
                lineHeight: isMobile ? '30px' : '34px',
                fontWeight: 400,
                color: isDarkMode ? 'var(--headline, #f6f7fb)' : '#1f2937',
                fontFamily: 'Eloquia Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                letterSpacing: '0.38px',
                marginBottom: isMobile ? '16px' : '20px'
              }}
            >
              {getTimeBasedGreeting()}, {displayName}
            </h2>
            
            {/* Binds to: response.system_info.welcome_message */}
            <p 
              className="mb-8 welcome_message_display"
              style={{ 
                fontSize: isMobile ? '16px' : '18px',
                lineHeight: isMobile ? '24px' : '28px',
                color: isDarkMode ? 'rgba(246, 247, 251, 0.8)' : '#6b7280',
                fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                letterSpacing: '-0.32px',
                textAlign: 'center'
              }}
            >
              CelesteOS remembers every fix, every manual, every note.<br />
              Ask your vessel's brain a question<br />
              answers arrive instantly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Main Header with CelesteOS branding and Model Selector - STICKY POSITION */}
      <div style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
        borderBottom: 'none',
        zIndex: 10,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}>
        <MainHeader 
          isMobile={isMobile}
          isDarkMode={isDarkMode}
          isChatMode={true}
          selectedModel={selectedModel}
          onModelChange={onModelChange}
          onFAQpageClick={onFAQpageClick}
          onScheduleCallClick={onScheduleCallClick}
        />
      </div>
      
      {/* Chat Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex flex-col h-full flex-1 chat_messages_container"
        style={{
          width: isMobile ? '390px' : '1200px',
          maxWidth: isMobile ? '390px' : 'calc(100vw - 320px)',
          margin: '0 auto',
          padding: isMobile ? '16px' : '24px',
          overflowY: 'auto',
          scrollBehavior: 'smooth'
        }}
      >
        <div 
          className="flex-1 space-y-6 messages_timeline"
          style={{
            paddingBottom: '24px'
          }}
        >
          {/* Dynamic Chat Messages */}
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div
                key={message.id}
                style={{
                  animation: index === messages.length - 1 && message.isUser
                    ? isDarkMode 
                      ? 'messageAppearDark 0.5s cubic-bezier(0.22, 0.61, 0.36, 1)'
                      : 'messageAppear 0.5s cubic-bezier(0.22, 0.61, 0.36, 1)'
                    : 'none'
                }}
              >
                <ChatMessageComponent
                  message={message}
                  displayName={displayName}
                  isDarkMode={isDarkMode}
                  isMobile={isMobile}
                  onEditMessage={onEditMessage}
                  onRegenerateResponse={onRegenerateResponse}
                />
              </div>
            ))}
            {/* Thinking Indicator */}
            {isWaitingForResponse && (
              <ThinkingIndicator 
                isDarkMode={isDarkMode} 
                searchType={searchType}
              />
            )}
          </div>
          
          {/* Invisible scroll anchor - always stays at bottom */}
          <div ref={messagesEndRef} style={{ height: '1px', visibility: 'hidden' }} />

          {/* Show welcome message when no chat messages */}
          {messages.length === 0 && (
            <div className="text-center py-8">
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
        </div>
      </div>
    </div>
  );
}