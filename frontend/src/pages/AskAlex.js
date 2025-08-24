import React, { useState, useRef, useEffect } from 'react';
import { Send, User, MessageCircle, Calendar, ExternalLink } from 'lucide-react';

/**
 * Ask Alex Component - FAQ with founder persona
 * Matches static site implementation
 */

export function AskAlex({ isMobile = false, isDarkMode = false, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: "Hi! I'm Alex, founder of CelesteOS. I built this platform after years as a Superyacht ETO dealing with scattered manuals and time-consuming troubleshooting. Ask me anything about the platform, implementation, or how it can help your engineering team!",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showBookingCTA, setShowBookingCTA] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // FAQ responses - matches static site
  const faqResponses = {
    // Platform questions
    'celeste': "CelesteOS is our RAG-powered platform designed specifically for maritime engineers. It ingests your technical documentation and provides instant, accurate answers with confidence scores and source references.",
    'rag': "RAG stands for Retrieval-Augmented Generation. It means our AI doesn't just guess - it searches through your actual manuals and documents to find the exact information you need, then provides it with source citations.",
    'price': "Our platform is enterprise-grade at $15k/month. This includes full implementation, training, document ingestion, and ongoing support. For that investment, teams typically save 60-80% of their troubleshooting time.",
    'implementation': "Implementation typically takes 2-4 weeks. We handle document ingestion, system integration, and team training. Most clients see immediate ROI from day one due to faster problem resolution.",
    
    // Technical questions
    'documents': "We can ingest any technical documentation - PDFs, manuals, procedures, fault logs, maintenance records, even handwritten notes. Our system creates searchable, AI-accessible knowledge from all your technical content.",
    'accuracy': "Our confidence scoring system typically shows 90%+ accuracy on technical queries. Each answer includes source references so engineers can verify the information and dig deeper if needed.",
    'security': "Enterprise-grade security with SOC2 compliance. Your documents never leave your secure environment - we can deploy on-premise or in your private cloud. Zero data sharing between clients.",
    
    // Benefits questions
    'time': "Our clients report 60-80% reduction in troubleshooting time. Instead of searching through hundreds of PDFs, engineers get instant answers with exact page references. One client saved $2M annually in reduced downtime.",
    'team': "Perfect for any engineering team dealing with complex technical documentation. We work with superyacht crews, offshore platforms, manufacturing facilities, and marine engineering firms.",
    'onboarding': "New team members become productive immediately instead of spending months learning where information is located. The AI becomes their experienced mentor from day one.",
    
    // Personal questions about Alex
    'background': "I spent 8 years as an ETO on 80-100m yachts. The frustration of hunting through scattered PDFs while systems were down drove me to build CelesteOS. Every feature comes from real experience in engine rooms at 3am.",
    'why': "After countless nights troubleshooting with paper manuals and scattered digital files, I knew there had to be a better way. CelesteOS is what I wish I'd had during those years - instant access to the exact information I needed.",
    'experience': "8 years as an ETO on high-end superyachts, plus 15 years in maritime engineering. I've been exactly where our users are - that's why every feature is designed to solve real engineering problems.",
    
    // Default responses
    'default': "That's a great question! While I try to cover the most common topics, I'd love to give you a more detailed answer. Would you like to book a quick call so we can discuss your specific situation?",
    'booking': "I'd be happy to chat more about your specific needs! You can book a 30-minute call with me using the link below. I personally handle all initial conversations because I want to understand exactly how CelesteOS can help your team."
  };

  const getResponse = (input) => {
    const lowerInput = input.toLowerCase();
    
    // Check for key terms and return appropriate response
    for (const [key, response] of Object.entries(faqResponses)) {
      if (key !== 'default' && key !== 'booking' && lowerInput.includes(key)) {
        return response;
      }
    }
    
    // If no specific match, show booking CTA after a few exchanges
    if (messages.length > 4) {
      setShowBookingCTA(true);
      return faqResponses.booking;
    }
    
    return faqResponses.default;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Show booking CTA after 5+ messages
  useEffect(() => {
    if (messages.length >= 6) {
      setShowBookingCTA(true);
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    
    // Simulate typing delay
    setTimeout(() => {
      const response = getResponse(userMessage.text);
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // 1-2 second delay
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: isDarkMode ? '#0a0e1a' : '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50,
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'}`,
        backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '20px',
              fontWeight: '600',
            }}>
              A
            </div>
            <div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: isDarkMode ? '#ffffff' : '#1a1a1a',
                marginBottom: '4px',
              }}>
                Ask Alex
              </h2>
              <p style={{
                fontSize: '14px',
                color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#6b7280',
              }}>
                Founder & Former Superyacht ETO
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f3f4f6',
                color: isDarkMode ? '#ffffff' : '#1a1a1a',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
        }}>
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '24px',
                flexDirection: message.isUser ? 'row-reverse' : 'row',
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: message.isUser 
                  ? '#3b82f6' 
                  : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                background: message.isUser 
                  ? '#3b82f6' 
                  : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
              }}>
                {message.isUser ? 'U' : 'A'}
              </div>
              <div style={{
                flex: 1,
                maxWidth: '70%',
              }}>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  backgroundColor: message.isUser
                    ? '#3b82f6'
                    : isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f3f4f6',
                  color: message.isUser
                    ? '#ffffff'
                    : isDarkMode ? '#ffffff' : '#1a1a1a',
                  fontSize: '15px',
                  lineHeight: '1.5',
                }}>
                  {message.text}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : '#9ca3af',
                  marginTop: '4px',
                  textAlign: message.isUser ? 'right' : 'left',
                }}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '24px',
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
              }}>
                A
              </div>
              <div style={{
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f3f4f6',
              }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <span style={{ animation: 'bounce 1.4s infinite', animationDelay: '0s' }}>•</span>
                  <span style={{ animation: 'bounce 1.4s infinite', animationDelay: '0.2s' }}>•</span>
                  <span style={{ animation: 'bounce 1.4s infinite', animationDelay: '0.4s' }}>•</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Booking CTA */}
      {showBookingCTA && (
        <div style={{
          padding: '16px',
          backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff',
          borderTop: `1px solid ${isDarkMode ? 'rgba(59, 130, 246, 0.2)' : '#3b82f6'}`,
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: '14px',
                fontWeight: '500',
                color: isDarkMode ? '#ffffff' : '#1e40af',
                marginBottom: '4px',
              }}>
                Want to discuss your specific needs?
              </p>
              <p style={{
                fontSize: '13px',
                color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#6b7280',
              }}>
                Book a 30-minute call with Alex to explore how CelesteOS can help your team
              </p>
            </div>
            <button
              onClick={() => window.open('https://calendly.com/celesteos/demo', '_blank')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Calendar size={16} />
              Book a Call
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{
        padding: '20px',
        borderTop: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'}`,
        backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          display: 'flex',
          gap: '12px',
        }}>
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about CelesteOS, pricing, implementation..."
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '8px',
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#e5e7eb'}`,
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
              color: isDarkMode ? '#ffffff' : '#1a1a1a',
              fontSize: '15px',
              outline: 'none',
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            style={{
              padding: '12px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: inputText.trim() ? '#3b82f6' : '#e5e7eb',
              color: inputText.trim() ? '#ffffff' : '#9ca3af',
              fontSize: '15px',
              fontWeight: '500',
              cursor: inputText.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
          >
            <Send size={18} />
            Send
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.5;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default AskAlex;