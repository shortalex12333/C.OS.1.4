import React from 'react';
import { AISolutionCard } from './AISolutionCard';
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
  onAskAlexClick?: () => void;
  isWaitingForResponse?: boolean;
  searchType?: 'yacht' | 'email' | 'email-yacht';
}

export function ChatArea({ 
  isChatMode, 
  isMobile = false, 
  displayName, 
  isDarkMode = false, 
  selectedModel = 'air', 
  onModelChange, 
  messages = [], 
  onAskAlexClick,
  isWaitingForResponse = false,
  searchType = 'yacht'
}: ChatAreaProps) {
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
      <div className="flex h-full flex-col">
        {/* Main Header with CelesteOS branding */}
        <MainHeader 
          isMobile={isMobile}
          isDarkMode={isDarkMode}
          isChatMode={false}
          selectedModel={selectedModel}
          onModelChange={onModelChange}
          onAskAlexClick={onAskAlexClick}
        />
        
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
                letterSpacing: '-0.32px'
              }}
            >
              Welcome, you are using our latest models (2025), select your search intent, and type below
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Main Header with CelesteOS branding and Model Selector */}
      <MainHeader 
        isMobile={isMobile}
        isDarkMode={isDarkMode}
        isChatMode={true}
        selectedModel={selectedModel}
        onModelChange={onModelChange}
        onAskAlexClick={onAskAlexClick}
      />
      
      {/* Chat Messages Container */}
      <div 
        className="flex flex-col h-full flex-1 chat_messages_container"
        style={{
          maxWidth: isMobile ? '390px' : '760px',
          margin: '0 auto',
          padding: isMobile ? '16px' : '24px'
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
            {messages.map((message) => (
              <ChatMessageComponent
                key={message.id}
                message={message}
                displayName={displayName}
                isDarkMode={isDarkMode}
                isMobile={isMobile}
              />
            ))}
            {/* Thinking Indicator */}
            {isWaitingForResponse && (
              <ThinkingIndicator 
                isDarkMode={isDarkMode} 
                searchType={searchType}
              />
            )}
          </div>

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