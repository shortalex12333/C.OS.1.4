import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronRight, ArrowLeft, Send, Bot, User } from 'lucide-react';
import { StreamingText } from './StreamingText';
import { BrainLogo } from './BrainLogo';

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
}

export function AskAlexPage({ onBack, isDarkMode = false, isMobile = false }: AskAlexPageProps) {
  // FAQ page always uses dark theme regardless of user preference
  const useDarkTheme = true;
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [hasFirstMessage, setHasFirstMessage] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLTextAreaElement>(null);

  const faqItems: FAQItem[] = [
    {
      id: 'cloud',
      question: 'Is CelesteOS cloud based?',
      answer: "No, CelesteOS is not cloud-based. Everything runs on-premise in your network. Your documents never leave your infrastructure, never get uploaded anywhere. That's by design - I know how sensitive technical documentation can be."
    },
    {
      id: 'installs',
      question: 'How do installs work?',
      answer: "Installation typically takes 2-4 weeks. We handle document ingestion, system integration, crew training. Most clients see immediate ROI from day one due to faster troubleshooting."
    },
    {
      id: 'security',
      question: 'Can my crew use it securely?',
      answer: "Absolutely. The interface is designed for engineers, not IT specialists. If your crew can use a search engine, they can use CelesteOS. We provide hands-on training during implementation."
    },
    {
      id: 'internet',
      question: 'What happens if we lose internet?',
      answer: "CelesteOS works completely offline once installed. No internet required for searches or document access. The only time you need connectivity is for initial setup and updates."
    },
    {
      id: 'search-speed',
      question: 'How fast is document search?',
      answer: "Sub-second search across all your technical documentation. We index everything - PDFs, manuals, procedures, even handwritten notes. The AI understands technical context, not just keywords."
    },
    {
      id: 'cloud-uploads',
      question: 'No cloud uploads',
      answer: "Correct - zero cloud uploads. Everything stays on your hardware, under your control. On-premise deployment, read-only system architecture, encrypted document processing."
    },
    {
      id: 'pricing',
      question: 'What does CelesteOS cost?',
      answer: "Pricing is tailored to vessel size and complexity. Most super yachts see ROI within 6 months through reduced downtime and faster problem resolution. Contact us for a custom quote based on your specific needs."
    },
    {
      id: 'training',
      question: 'How long does training take?',
      answer: "Basic training takes 2-3 hours for crew members. Advanced training for chief engineers takes about a day. We provide on-site training during installation and remote support afterwards."
    },
    {
      id: 'updates',
      question: 'How are updates handled?',
      answer: "Updates are delivered quarterly and can be installed offline via USB or when connected to port WiFi. Updates include improved AI models, new features, and expanded technical knowledge bases."
    },
    {
      id: 'languages',
      question: 'What languages are supported?',
      answer: "CelesteOS supports English, Spanish, Italian, French, and German. The system automatically detects document language and can translate technical terms between languages."
    },
    {
      id: 'compatibility',
      question: 'What systems does it integrate with?',
      answer: "CelesteOS integrates with most yacht management systems including ISM, PMS, and bridge systems. We support standard formats like PDF, DWG, Excel, and can index scanned documents."
    },
    {
      id: 'accuracy',
      question: 'How accurate is the AI?',
      answer: "Our AI achieves 95%+ accuracy on technical queries. It's trained specifically on marine engineering documentation and continuously improves through usage patterns. Incorrect answers can be flagged for review."
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

  // Auto-resize search input
  const adjustSearchInputHeight = () => {
    const textarea = searchInputRef.current;
    if (textarea) {
      textarea.style.height = '24px'; // Reset to min height
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 120; // Max ~5 lines
      textarea.style.height = Math.min(scrollHeight, maxHeight) + 'px';
    }
  };

  useEffect(() => {
    adjustSearchInputHeight();
  }, [searchQuery]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendQuestion();
    }
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
              <BrainLogo 
                size={120} 
                isDarkMode={true} // Always use white logo for dark FAQ page
              />
            </div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '600',
              color: '#ffffff', // Always white text for dark mode
              marginBottom: '12px',
              letterSpacing: '-0.5px',
              fontFamily: 'Eloquia Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              Ask CelesteOS Assistant
            </h1>
            <p style={{
              fontSize: '16px',
              color: 'rgba(255, 255, 255, 0.7)', // Always light text for dark mode
              textAlign: 'center',
              maxWidth: '400px',
              lineHeight: '24px',
              fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              Get instant answers about yacht systems, maintenance, and operations
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
                placeholder="Ask a question or search FAQs..."
                rows={1}
                className="overflow-hidden resize-none"
                style={{
                  flex: 1,
                  padding: '14px 16px',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#ffffff',
                  fontSize: '17px',
                  lineHeight: '24px',
                  minHeight: '24px',
                  height: '24px'
                }}
              />
              <button
                onClick={handleSendQuestion}
                disabled={!searchQuery.trim() || isLoading}
                style={{
                  padding: '12px 24px',
                  background: '#0a84ff',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '17px',
                  fontWeight: '500',
                  cursor: searchQuery.trim() && !isLoading ? 'pointer' : 'not-allowed',
                  opacity: searchQuery.trim() && !isLoading ? 1 : 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <Send size={18} />
                Ask
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
              fontSize: '24px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              Frequently Asked Questions
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
                    background: '#000000',
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
                      fontSize: '17px',
                      color: '#ffffff',
                      fontWeight: '500'
                    }}>
                      {item.question}
                    </span>
                    <ChevronRight 
                      size={20} 
                      color="rgba(255, 255, 255, 0.5)"
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
                        fontSize: '15px',
                        color: 'rgba(255, 255, 255, 0.7)',
                        lineHeight: '1.6'
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
        background: '#0f1117 !important', // Always dark background - force override
        overflow: 'hidden',
        fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
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
          background: '#000000'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{
              marginBottom: '20px'
            }}>
              <BrainLogo 
                size={80} 
                isDarkMode={true} // Always use white logo for dark FAQ page
              />
            </div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '8px'
            }}>
              Ask CelesteOS Assistant
            </h1>
            <p style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.6)',
              textAlign: 'center'
            }}>
              Get instant answers about yacht systems
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
              color: 'rgba(255, 255, 255, 0.4)',
              fontSize: '15px',
              textAlign: 'center'
            }}>
              Start a conversation by typing a question below
            </div>
          ) : (
            <div>
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    marginBottom: '20px',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: message.isUser ? '#0a84ff' : 'rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {message.isUser ? <User size={18} color="#ffffff" /> : <Bot size={18} color="#ffffff" />}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.6)', // Always light text
                      marginBottom: '4px',
                      fontWeight: '500',
                      fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}>
                      {message.isUser ? 'You' : 'CelesteOS Assistant'}
                    </p>
                    <p style={{
                      fontSize: isMobile ? '14px' : '15px',
                      color: '#f3f4f6', // Always light text
                      lineHeight: isMobile ? '20px' : '22px',
                      fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      fontWeight: '400'
                    }}>
                      {message.isUser ? (
                        message.content
                      ) : (
                        <StreamingText 
                          text={message.content} 
                          isStreaming={message.isStreaming ?? false}
                          delay={20} // Per-word animation, no jitter
                        />
                      )}
                    </p>
                    
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
          background: '#000000'
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
                color: '#ffffff',
                fontSize: '15px'
              }}
            />
            <button
              onClick={handleSendQuestion}
              disabled={!searchQuery.trim() || isLoading}
              style={{
                padding: '10px 20px',
                background: '#0a84ff',
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: '500',
                cursor: searchQuery.trim() && !isLoading ? 'pointer' : 'not-allowed',
                opacity: searchQuery.trim() && !isLoading ? 1 : 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <Send size={16} />
              Ask
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
            fontSize: '20px',
            fontWeight: '600',
            color: '#ffffff'
          }}>
            Frequently Asked Questions
          </h2>
          {searchQuery && (
            <p style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.5)',
              marginTop: '8px'
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
                  fontSize: '15px',
                  color: '#ffffff',
                  fontWeight: '500',
                  paddingRight: '12px'
                }}>
                  {item.question}
                </span>
                <ChevronRight 
                  size={18} 
                  color="rgba(255, 255, 255, 0.5)"
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
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    lineHeight: '1.6'
                  }}>
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

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