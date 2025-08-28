import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronRight, ArrowLeft, Send, Bot, User } from 'lucide-react';
import { StreamingText } from './StreamingText';
import { BrainLogo } from './BrainLogo';
import { ScheduleCallModal } from './ScheduleCallModal';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  isStreaming?: boolean;
  suggestions?: string[];
  confidence?: number;
  department?: string;
}

interface AskAlexPageProps {
  onBack: () => void;
  isDarkMode?: boolean;
  isMobile?: boolean;
  onFaqQuery?: (query: string) => void;
  onTopicTracked?: (topic: string) => void;
}

export function AskAlexPage({ onBack, isDarkMode = false, isMobile = false, onFaqQuery, onTopicTracked }: AskAlexPageProps) {
  // FAQ page always uses dark theme regardless of user preference
  const useDarkTheme = true;
  const displayName = 'User'; // Default display name for FAQ page
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [hasFirstMessage, setHasFirstMessage] = useState(false);
  const [showScheduleCallPopup, setShowScheduleCallPopup] = useState(false);
  const [hasShownSchedulePopup, setHasShownSchedulePopup] = useState(false); // Track if popup was already shown
  const [faqQueriesCount, setFaqQueriesCount] = useState(0);
  const [topicsAsked, setTopicsAsked] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLTextAreaElement>(null);

  const faqItems: FAQItem[] = [
    {
      id: 'quick-setup',
      question: 'How long does it take to get running?',
      answer: "Most yachts are live the 2 days. Plug in the Mac Studio, give us NAS access, and we configure remotely."
    },
    {
      id: 'folder-structure',
      question: 'Do I need to restructure my folders?',
      answer: "No — we respect your existing NAS structure. Engineering sees Engineering, Bridge sees Bridge, etc."
    },
    {
      id: 'required-info',
      question: 'What information do you need from us?',
      answer: "Just read-only NAS credentials and Wi-Fi details. Nothing more."
    },
    {
      id: 'file-safety',
      question: 'Will CelesteOS ever change or delete files?',
      answer: "No. It mounts in read-only mode, so your originals remain untouched."
    },
    {
      id: 'data-privacy',
      question: 'Does my data leave the yacht?',
      answer: "No, unless you request optional cloud backup. All processing happens onboard."
    },
    {
      id: 'email-privacy',
      question: 'Can the Captain see my emails?',
      answer: "No — email search is strictly per-user. Each crew member only sees their own inbox."
    },
    {
      id: 'offline-capability',
      question: 'What happens if we lose internet?',
      answer: "CelesteOS works fully offline. Searches, documents, and email history remain available at sea."
    },
    {
      id: 'power-loss',
      question: 'What if the yacht loses power?',
      answer: "It auto-restarts when power returns. We recommend a UPS for seamless uptime."
    },
    {
      id: 'software-updates',
      question: 'How do you handle software updates?',
      answer: "Updates run overnight, off-hours. You'll always be notified in advance, and you can defer if needed."
    },
    {
      id: 'concurrent-users',
      question: 'How many people can use it at once?',
      answer: "Up to 16 crew at the same time."
    },
    {
      id: 'search-speed',
      question: 'How fast are searches?',
      answer: "Most answers appear in seconds, including results from scanned PDFs."
    },
    {
      id: 'system-integration',
      question: 'What systems does it integrate with?',
      answer: "Your NAS and each crew member's Outlook inbox. It doesn't interfere with bridge or engine controls."
    },
    {
      id: 'fix-reliability',
      question: 'How do we know shared fixes are reliable?',
      answer: "Each fix is tracked for success rate and cross-referenced with manuals and OEM bulletins."
    },
    {
      id: 'wrong-rating',
      question: 'What if someone clicks the wrong rating?',
      answer: "There's an undo. One mis-click doesn't affect the fleet database."
    },
    {
      id: 'pricing',
      question: 'What is the typical pricing?',
      answer: "Only €15,000 for install + Mac Studio, plus ~€1200/month subscription."
    },
    {
      id: 'roi-timeline',
      question: 'How fast does it pay for itself?',
      answer: "Crews save 10–15 hours per week. Preventing one major fault or survey failure pays for the system many times over."
    }
  ];

  const filteredItems = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleItem = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleSendQuestion = async () => {
    if (!searchQuery.trim() || isLoading) return;
    
    // Mark that first message has been sent
    if (!hasFirstMessage) {
      setHasFirstMessage(true);
    }
    
    setShowChat(true);
    setIsLoading(true);
    
    // Track FAQ query and topic for analytics
    onFaqQuery?.(searchQuery);
    onTopicTracked?.(searchQuery);
    
    // Add user message
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      content: searchQuery,
      isUser: true,
      timestamp: new Date().toISOString()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setSearchQuery('');
    
    try {
      // Send to webhook
      console.log('Sending FAQ question to webhook:', searchQuery);
      
      const response = await fetch('https://api.celeste7.ai/webhook/faq-bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: searchQuery,
          timestamp: new Date().toISOString(),
          source: 'faq-page'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('FAQ webhook response:', data);
        
        // Extract answer from response - ensure it's a string
        let answerContent = 'Thank you for your question. Our team will get back to you shortly.';
        let suggestions: string[] = [];
        let confidence: number | undefined;
        let department: string | undefined;
        
        if (typeof data === 'string') {
          answerContent = data;
        } else if (data && typeof data === 'object') {
          // Handle new array format: [{ response: { answer: "..." } }]
          if (Array.isArray(data) && data.length > 0) {
            const firstItem = data[0];
            if (firstItem.response && firstItem.response.answer && typeof firstItem.response.answer === 'string') {
              answerContent = firstItem.response.answer;
              confidence = firstItem.response.confidence;
              department = firstItem.response.department;
            } else if (firstItem.answer && typeof firstItem.answer === 'string') {
              answerContent = firstItem.answer;
            }
            
            // Extract suggestions if available
            if (firstItem.suggestions && Array.isArray(firstItem.suggestions)) {
              suggestions = firstItem.suggestions;
            }
          }
          // Handle direct object responses (legacy support)
          else if (data.answer && typeof data.answer === 'string') {
            answerContent = data.answer;
          } else if (data.message && typeof data.message === 'string') {
            answerContent = data.message;
          } else if (data.response && typeof data.response === 'string') {
            answerContent = data.response;
          } else if (data.response && data.response.answer && typeof data.response.answer === 'string') {
            answerContent = data.response.answer;
          } else if (data.text && typeof data.text === 'string') {
            answerContent = data.text;
          } else {
            // If we still have an object, try to stringify relevant parts
            console.warn('Unexpected response format:', data);
            answerContent = 'I received your question and am processing it. Please wait a moment.';
          }
        }
        
        // Add bot response with streaming
        const botMessage: ChatMessage = {
          id: `bot_${Date.now()}`,
          content: answerContent,
          isUser: false,
          timestamp: new Date().toISOString(),
          isStreaming: true,
          suggestions: suggestions.length > 0 ? suggestions : undefined,
          confidence,
          department
        };
        
        setChatMessages(prev => [...prev, botMessage]);
        
        // Mark as complete after streaming finishes
        const streamDuration = Math.min((answerContent?.length || 50) * 30, 5000);
        setTimeout(() => {
          setChatMessages(prev => 
            prev.map(msg => 
              msg.id === botMessage.id 
                ? { ...msg, isStreaming: false }
                : msg
            )
          );
        }, streamDuration); // Approximate streaming duration
      } else {
        console.error('FAQ webhook error:', {
          status: response.status,
          statusText: response.statusText
        });
        
        // Try to get error message from response
        let errorDetail = 'Failed to get response';
        try {
          const errorData = await response.text();
          console.error('Error response body:', errorData);
          errorDetail = `Server error: ${response.status}`;
        } catch (e) {
          console.error('Could not parse error response');
        }
        
        throw new Error(errorDetail);
      }
    } catch (error) {
      console.error('Error sending FAQ question:', error);
      
      // Add error message with streaming
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        content: "I'm having trouble connecting to the server. Please try again later.",
        isUser: false,
        timestamp: new Date().toISOString(),
        isStreaming: true
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (chatEndRef.current && chatMessages.length > 0) {
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [chatMessages]);

  // Trigger schedule call popup on 5th user message in FAQ
  useEffect(() => {
    // Count only user messages (not bot responses)
    const userMessages = chatMessages.filter(message => message.isUser);
    const userMessageCount = userMessages.length;
    
    // Update FAQ queries count
    setFaqQueriesCount(userMessageCount);
    
    // Collect topics from user messages
    const topics = userMessages.map(msg => msg.content);
    setTopicsAsked(topics);
    
    // Trigger popup when user sends their 5th message in FAQ (only once per session)
    if (userMessageCount === 5 && !showScheduleCallPopup && !hasShownSchedulePopup) {
      console.log('🎯 FAQ: Triggering schedule call popup - user has sent 5 messages');
      setShowScheduleCallPopup(true);
      setHasShownSchedulePopup(true); // Mark that we've shown the popup
    }
  }, [chatMessages, showScheduleCallPopup, hasShownSchedulePopup]);

  // Auto-resize search input
  const adjustSearchInputHeight = () => {
    const textarea = searchInputRef.current;
    if (textarea) {
      // Reset to auto first to get natural height
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const minHeight = 48; // Minimum height for better interaction
      const maxHeight = 120; // Max ~5 lines
      const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));
      textarea.style.height = newHeight + 'px';
    }
  };

  useEffect(() => {
    adjustSearchInputHeight();
  }, [searchQuery]);

  // Auto-focus the input when component mounts
  useEffect(() => {
    if (searchInputRef.current) {
      // Small delay to ensure proper focus
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendQuestion();
    }
  };

  const handleCloseScheduleCallPopup = () => {
    setShowScheduleCallPopup(false);
  };

  // Centered layout before first message, two-column after
  if (!hasFirstMessage) {
    return (
      <div 
        className="dark faq-always-dark"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10005,
          background: '#0f1117',
          overflowY: 'auto',
          fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
      >
        {/* Back Button */}
        <button
          onClick={onBack}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: 'transparent',
            border: 'none',
            color: '#0a84ff',
            fontSize: '17px',
            cursor: 'pointer',
            transition: 'opacity 0.2s',
            zIndex: 10005
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {/* Schedule Call Button - Always visible */}
        <button
          onClick={() => setShowScheduleCallPopup(true)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: '#3b82f6',
            color: '#ffffff',
            border: 'none',
            borderRadius: '50px', // Completely rounded (pill shape)
            fontSize: isMobile ? '13px' : '14px',
            fontWeight: 600,
            fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            zIndex: 10005
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#2563eb';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#3b82f6';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Schedule a call
        </button>

        {/* Centered Container */}
        <div style={{
          maxWidth: '760px',
          margin: '0 auto',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px'
        }}>
          {/* Logo Section */}
          <div style={{
            marginBottom: '40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            animation: 'fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <div style={{
              marginBottom: '32px'
            }}>
              <img 
                src="/faq-image.png"
                alt="FAQ Logo" 
                style={{
                  width: '256px',
                  height: '256px',
                  objectFit: 'contain'
                }}
              />
            </div>
            <h1 style={{
              fontSize: isMobile ? '48px' : '64px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '12px',
              lineHeight: isMobile ? '52px' : '68px',
              letterSpacing: '-0.32px',
              fontFamily: 'Eloquia Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              FAQ
            </h1>
            <p style={{
              fontSize: isMobile ? '15px' : '16px',
              color: 'rgba(246, 247, 251, 0.7)',
              textAlign: 'center',
              maxWidth: '400px',
              lineHeight: isMobile ? '22px' : '24px',
              letterSpacing: '-0.32px',
              fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              Search topics, or just ask
            </p>
          </div>

          {/* Search Input */}
          <div style={{
            width: '100%',
            maxWidth: '600px',
            marginBottom: '40px',
            animation: 'slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both'
          }}>
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '4px',
              border: '1px solid rgba(255, 255, 255, 0.12)'
            }}>
              <textarea
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Simply ask a question or search FAQs"
                rows={1}
                className="overflow-hidden resize-none"
                style={{
                  flex: 1,
                  padding: '14px 16px',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--headline, #f6f7fb)',
                  fontSize: isMobile ? '15px' : '16px',
                  lineHeight: isMobile ? '22px' : '24px',
                  letterSpacing: '-0.32px',
                  fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  minHeight: '48px',
                  height: '48px'
                }}
              />
              <button
                onClick={handleSendQuestion}
                disabled={!searchQuery.trim() || isLoading}
                style={{
                  width: '44px',
                  height: '44px',
                  background: searchQuery.trim() && !isLoading 
                    ? '#0070ff'
                    : 'rgba(156, 163, 175, 0.3)',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#ffffff',
                  cursor: searchQuery.trim() && !isLoading ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 200ms cubic-bezier(0.23, 1, 0.32, 1)',
                  transform: 'translateY(0)',
                  boxShadow: searchQuery.trim() && !isLoading 
                    ? '0 2px 8px rgba(0, 112, 255, 0.3)'
                    : 'none'
                }}
                onMouseEnter={(e) => {
                  if (searchQuery.trim() && !isLoading) {
                    e.currentTarget.style.backgroundColor = '#0070ff';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 112, 255, 0.4)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (searchQuery.trim() && !isLoading) {
                    e.currentTarget.style.backgroundColor = '#0070ff';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 112, 255, 0.3)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                <Send 
                  size={20} 
                  style={{ 
                    color: searchQuery.trim() && !isLoading ? '#ffffff' : '#9ca3af' 
                  }} 
                />
              </button>
            </div>
          </div>

          {/* FAQ Items */}
          <div style={{
            width: '100%',
            maxWidth: '700px',
            animation: 'slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.4s both'
          }}>
            <h2 style={{
              fontSize: isMobile ? '20px' : '24px',
              fontWeight: '600',
              color: 'var(--headline, #f6f7fb)',
              marginBottom: '24px',
              textAlign: 'center',
              lineHeight: isMobile ? '24px' : '28px',
              letterSpacing: '-0.32px',
              fontFamily: 'Eloquia Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              Explore Frequently Asked Questions
            </h2>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1px',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              overflow: 'hidden'
            }}>
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    background: '#181818',
                    borderBottom: index < filteredItems.length - 1 ? '1px solid rgba(255, 255, 255, 0.08)' : 'none'
                  }}
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    style={{
                      width: '100%',
                      padding: '20px 24px',
                      background: 'transparent',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{
                      fontSize: isMobile ? '15px' : '16px',
                      color: 'var(--headline, #f6f7fb)',
                      fontWeight: '500',
                      lineHeight: isMobile ? '22px' : '24px',
                      letterSpacing: '-0.32px',
                      fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}>
                      {item.question}
                    </span>
                    <ChevronRight 
                      size={20} 
                      color="#0070ff"
                      style={{
                        transform: expandedItems.has(item.id) ? 'rotate(90deg)' : 'rotate(0)',
                        transition: 'transform 0.2s'
                      }}
                    />
                  </button>
                  
                  {expandedItems.has(item.id) && (
                    <div style={{
                      padding: '0 24px 20px 24px',
                      animation: 'fadeIn 0.3s ease'
                    }}>
                      <p style={{
                        fontSize: isMobile ? '14px' : '15px',
                        color: 'rgba(246, 247, 251, 0.7)',
                        lineHeight: isMobile ? '20px' : '22px',
                        letterSpacing: '-0.32px',
                        fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                      }}>
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Schedule Call Modal - Triggered on 5th FAQ message */}
        {showScheduleCallPopup && (
          <ScheduleCallModal 
            isOpen={showScheduleCallPopup}
            onClose={handleCloseScheduleCallPopup}
            isDarkMode={useDarkTheme}
            isMobile={isMobile}
            chatQueriesCount={0} // No chat queries on FAQ page
            faqQueriesCount={faqQueriesCount}
            topicsAsked={topicsAsked}
          />
        )}

        {/* Animation Styles */}
        <style>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes blink {
            0%, 49% {
              opacity: 1;
            }
            50%, 100% {
              opacity: 0;
            }
          }
        `}</style>
      </div>
    );
  }

  // Two-column layout after first message
  return (
    <div 
      className="dark faq-always-dark"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10005,
        background: '#0f1117', // Solid dark background
        overflow: 'hidden',
        fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        height: '100vh'
      }}
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          background: 'transparent',
          border: 'none',
          color: '#0a84ff',
          fontSize: '17px',
          cursor: 'pointer',
          transition: 'opacity 0.2s',
          zIndex: 100
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
      >
        <ArrowLeft size={20} />
        Back
      </button>

      {/* Schedule Call Button - Always visible */}
      <button
        onClick={() => setShowScheduleCallPopup(true)}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          background: '#3b82f6',
          color: '#ffffff',
          border: 'none',
          borderRadius: '50px', // Completely rounded (pill shape)
          fontSize: isMobile ? '13px' : '14px',
          fontWeight: 600,
          fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          zIndex: 100
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#2563eb';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#3b82f6';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        Schedule a call
      </button>

      {/* Left Column - Chat Area */}
      <div style={{
        flex: '1 1 60%',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        minWidth: 0,
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        animation: 'slideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        {/* Fixed Header with Logo */}
        <div style={{
          padding: '60px 40px 30px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: '#2e2e2e'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{
              marginBottom: '20px'
            }}>
              <img 
                src="/light-faq-circle.png"
                alt="CelesteOS Logo" 
                style={{
                  width: '128px',
                  height: '128px',
                  objectFit: 'contain'
                }}
              />
            </div>
            <h1 style={{
              fontSize: isMobile ? '36px' : '48px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '8px',
              lineHeight: isMobile ? '40px' : '52px',
              letterSpacing: '-0.32px',
              fontFamily: 'Eloquia Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              FAQ
            </h1>
            <p style={{
              fontSize: '14px',
              color: 'rgba(246, 247, 251, 0.7)',
              textAlign: 'center',
              lineHeight: '20px',
              letterSpacing: '-0.32px',
              fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              Search topics, or just ask
            </p>
          </div>
        </div>

        {/* Scrollable Chat Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 40px',
          minHeight: 0
        }}>
          {chatMessages.length === 0 ? (
            <div style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(246, 247, 251, 0.7)',
              fontSize: isMobile ? '15px' : '16px',
              lineHeight: isMobile ? '22px' : '24px',
              letterSpacing: '-0.32px',
              fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              textAlign: 'center'
            }}>
              Start a conversation by typing a question below
            </div>
          ) : (
            <div>
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.isUser ? 'user_message_container flex-row-reverse ml-8' : 'ai_response_container mr-8'}`}
                  style={{
                    marginBottom: '20px'
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
                        isDarkMode={true}
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
                        fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        color: 'rgba(246, 247, 251, 0.7)',
                        textAlign: message.isUser ? 'right' : 'left'
                      }}
                    >
                      {message.isUser ? 'You' : 'CelesteOS'}
                    </div>
                    
                    {/* Message content */}
                    <div style={{ textAlign: message.isUser ? 'right' : 'left' }}>
                      <div 
                        className={message.isUser ? 'user_query_display' : 'ai_response_message'}
                        style={{
                          fontSize: isMobile ? '15px' : '16px',
                          lineHeight: isMobile ? '22px' : '24px',
                          letterSpacing: '-0.32px',
                          fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                          color: 'var(--headline, #f6f7fb)',
                          textAlign: message.isUser ? 'right' : 'left'
                        }}
                      >
                        {message.isUser ? (
                          String(message.content)
                        ) : (
                          <StreamingText 
                            text={message.content} 
                            isStreaming={message.isStreaming ?? false}
                            delay={20}
                          />
                        )}
                      </div>
                    </div>
                    
                    {/* Display suggestions for bot messages */}
                    {!message.isUser && message.suggestions && message.suggestions.length > 0 && !message.isStreaming && (
                      <div style={{
                        marginTop: '16px',
                        padding: '12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>
                        <p style={{
                          fontSize: '12px',
                          color: 'rgba(255, 255, 255, 0.7)',
                          marginBottom: '8px',
                          fontWeight: '500'
                        }}>
                          Related topics:
                        </p>
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '6px'
                        }}>
                          {message.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setSearchQuery(suggestion);
                                handleSendQuestion();
                              }}
                              style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '16px',
                                padding: '4px 12px',
                                fontSize: '12px',
                                color: '#ffffff',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                fontFamily: 'inherit'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                              }}
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Display confidence and department info */}
                    {!message.isUser && (message.confidence !== undefined || message.department) && !message.isStreaming && (
                      <div style={{
                        marginTop: '8px',
                        fontSize: '11px',
                        color: 'rgba(255, 255, 255, 0.4)',
                        display: 'flex',
                        gap: '12px'
                      }}>
                        {message.confidence !== undefined && (
                          <span>Confidence: {Math.round(message.confidence * 100)}%</span>
                        )}
                        {message.department && (
                          <span>Department: {message.department}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Bot size={18} color="#ffffff" />
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '4px'
                  }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.5)',
                      animation: 'pulse 1.4s infinite'
                    }} />
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.5)',
                      animation: 'pulse 1.4s infinite',
                      animationDelay: '0.2s'
                    }} />
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.5)',
                      animation: 'pulse 1.4s infinite',
                      animationDelay: '0.4s'
                    }} />
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Fixed Input Area */}
        <div style={{
          padding: '20px 40px 30px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: '#2e2e2e'
        }}>
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '4px',
            border: '1px solid rgba(255, 255, 255, 0.12)'
          }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question..."
              style={{
                flex: 1,
                padding: '12px 16px',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--headline, #f6f7fb)',
                fontSize: isMobile ? '15px' : '16px',
                lineHeight: isMobile ? '22px' : '24px',
                letterSpacing: '-0.32px',
                fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            />
            <button
              onClick={handleSendQuestion}
              disabled={!searchQuery.trim() || isLoading}
              style={{
                width: '44px',
                height: '44px',
                background: searchQuery.trim() && !isLoading 
                  ? '#0070ff'
                  : 'rgba(156, 163, 175, 0.3)',
                border: 'none',
                borderRadius: '6px',
                color: '#ffffff',
                cursor: searchQuery.trim() && !isLoading ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 200ms cubic-bezier(0.23, 1, 0.32, 1)',
                transform: 'translateY(0)',
                boxShadow: searchQuery.trim() && !isLoading 
                  ? '0 2px 8px rgba(0, 112, 255, 0.3)'
                  : 'none'
              }}
              onMouseEnter={(e) => {
                if (searchQuery.trim() && !isLoading) {
                  e.currentTarget.style.backgroundColor = '#0070ff';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 112, 255, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (searchQuery.trim() && !isLoading) {
                  e.currentTarget.style.backgroundColor = '#0070ff';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 112, 255, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <Send 
                size={20} 
                style={{ 
                  color: searchQuery.trim() && !isLoading ? '#ffffff' : '#9ca3af' 
                }} 
              />
            </button>
          </div>
        </div>
      </div>

      {/* Right Column - FAQ */}
      <div style={{
        flex: '1 1 40%',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        minWidth: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        animation: 'slideInRight 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both'
      }}>
        {/* FAQ Header */}
        <div style={{
          padding: '30px 30px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <h2 style={{
            fontSize: isMobile ? '18px' : '20px',
            fontWeight: '600',
            color: 'var(--headline, #f6f7fb)',
            lineHeight: isMobile ? '22px' : '24px',
            letterSpacing: '-0.32px',
            fontFamily: 'Eloquia Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}>
            Explore Frequently Asked Questions
          </h2>
          {searchQuery && (
            <p style={{
              fontSize: '13px',
              color: 'rgba(246, 247, 251, 0.7)',
              marginTop: '8px',
              lineHeight: '18px',
              letterSpacing: '-0.32px',
              fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              {filteredItems.length} results for "{searchQuery}"
            </p>
          )}
        </div>

        {/* Scrollable FAQ Items */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px'
        }}>
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              style={{
                marginBottom: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                animation: `fadeInItem 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${0.05 * index}s both`
              }}
            >
              <button
                onClick={() => toggleItem(item.id)}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  background: 'transparent',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{
                  fontSize: isMobile ? '14px' : '15px',
                  color: 'var(--headline, #f6f7fb)',
                  fontWeight: '500',
                  paddingRight: '12px',
                  lineHeight: isMobile ? '20px' : '22px',
                  letterSpacing: '-0.32px',
                  fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}>
                  {item.question}
                </span>
                <ChevronRight 
                  size={18} 
                  color="#0070ff"
                  style={{
                    transform: expandedItems.has(item.id) ? 'rotate(90deg)' : 'rotate(0)',
                    transition: 'transform 0.2s',
                    flexShrink: 0
                  }}
                />
              </button>
              
              {expandedItems.has(item.id) && (
                <div style={{
                  padding: '0 20px 16px 20px',
                  animation: 'fadeIn 0.3s ease'
                }}>
                  <p style={{
                    fontSize: isMobile ? '13px' : '14px',
                    color: 'rgba(246, 247, 251, 0.7)',
                    lineHeight: isMobile ? '18px' : '20px',
                    letterSpacing: '-0.32px',
                    fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}>
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Call Modal - Triggered on 5th FAQ message */}
      {showScheduleCallPopup && (
        <ScheduleCallModal 
          isOpen={showScheduleCallPopup}
          onClose={handleCloseScheduleCallPopup}
          isDarkMode={useDarkTheme}
          isMobile={isMobile}
          chatQueriesCount={0} // No chat queries on FAQ page
          faqQueriesCount={faqQueriesCount}
          topicsAsked={topicsAsked}
        />
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 60%, 100% {
            opacity: 0.3;
          }
          30% {
            opacity: 1;
          }
        }
        
        @keyframes blink {
          0%, 49% {
            opacity: 1;
          }
          50%, 100% {
            opacity: 0;
          }
        }
        
        @keyframes slideIn {
          from {
            transform: translateX(-20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideInRight {
          from {
            transform: translateX(20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes fadeInItem {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}