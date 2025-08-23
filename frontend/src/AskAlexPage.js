import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { WEBHOOK_CONFIG } from './config/webhookConfig';

// Ask Alex FAQ Page Component
function AskAlexPage({ user, onBack }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Initial greeting when component mounts
  useEffect(() => {
    const initialMessage = {
      id: 'initial_' + Date.now(),
      text: "Hi! I'm Alex, the founder. Ask me anything about our yacht AI system, how it works, our company vision, or any questions you have about maritime technology. What would you like to know?",
      isUser: false,
      timestamp: Date.now()
    };
    setMessages([initialMessage]);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversation history from localStorage
  useEffect(() => {
    if (user?.id) {
      const savedMessages = localStorage.getItem(`askAlex_${user.id}`);
      if (savedMessages) {
        try {
          const parsed = JSON.parse(savedMessages);
          if (parsed.length > 0) {
            setMessages(parsed);
          }
        } catch (e) {
          console.error('Failed to load Ask Alex history:', e);
        }
      }
    }
  }, [user?.id]);

  // Save conversation history to localStorage
  useEffect(() => {
    if (user?.id && messages.length > 1) { // Don't save just the initial greeting
      localStorage.setItem(`askAlex_${user.id}`, JSON.stringify(messages));
    }
  }, [messages, user?.id]);

  // Handle sending message
  const handleSend = async () => {
    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage || isLoading) return;

    // Add user message
    const userMessage = {
      id: 'user_' + Date.now(),
      text: trimmedMessage,
      isUser: true,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Call the FAQ webhook
      const response = await fetch(`${WEBHOOK_CONFIG.baseUrl}/faq-ask-alex`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({
          userId: user?.id || 'guest',
          userName: user?.name || user?.displayName || 'Guest',
          message: trimmedMessage,
          sessionId: `askAlex_${Date.now()}`,
          timestamp: new Date().toISOString()
        })
      });

      const data = await response.json();
      console.log('Ask Alex Response:', data);

      // Extract response text from various possible formats
      let responseText = '';
      
      // Handle different response formats
      if (Array.isArray(data) && data[0]?.response) {
        // New yacht AI format
        responseText = data[0].response.message || data[0].response.answer || 'I need to think about that question.';
      } else if (data.response) {
        responseText = data.response.message || data.response.answer || data.response;
      } else if (data.message) {
        responseText = data.message;
      } else if (typeof data === 'string') {
        responseText = data;
      } else {
        responseText = "I'm having trouble understanding that question. Could you rephrase it?";
      }

      // Add Alex's response
      const alexMessage = {
        id: 'alex_' + Date.now(),
        text: responseText,
        isUser: false,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, alexMessage]);

    } catch (error) {
      console.error('Ask Alex Error:', error);
      
      const errorMessage = {
        id: 'error_' + Date.now(),
        text: "Sorry, I'm having connection issues. Please try again in a moment.",
        isUser: false,
        isError: true,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Clear conversation history
  const clearHistory = () => {
    if (user?.id) {
      localStorage.removeItem(`askAlex_${user.id}`);
    }
    const initialMessage = {
      id: 'initial_' + Date.now(),
      text: "Hi! I'm Alex, the founder. Ask me anything about our yacht AI system, how it works, our company vision, or any questions you have about maritime technology. What would you like to know?",
      isUser: false,
      timestamp: Date.now()
    };
    setMessages([initialMessage]);
  };

  return (
    <div className="ask-alex-page" style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#0a0a0a'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '20px',
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#111'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: '#222',
              border: '1px solid #333',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            <ArrowLeft size={16} />
            Back to Yacht AI
          </button>
          <h1 style={{ fontSize: '24px', color: '#fff', margin: 0 }}>
            Ask Alex - FAQ
          </h1>
        </div>
        
        <button
          onClick={clearHistory}
          style={{
            padding: '8px 16px',
            backgroundColor: '#222',
            border: '1px solid #333',
            borderRadius: '8px',
            color: '#888',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          Clear History
        </button>
      </div>

      {/* Messages Area */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.isUser ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{
              maxWidth: '70%',
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: msg.isUser ? '#1a4d2e' : '#1a1a1a',
              border: msg.isError ? '1px solid #ff4444' : '1px solid #333',
              color: '#fff'
            }}>
              {msg.isUser ? (
                <div>{msg.text}</div>
              ) : (
                <ReactMarkdown
                  components={{
                    p: ({children}) => <p style={{ margin: '8px 0' }}>{children}</p>,
                    ul: ({children}) => <ul style={{ marginLeft: '20px', margin: '8px 0' }}>{children}</ul>,
                    li: ({children}) => <li style={{ marginBottom: '4px' }}>{children}</li>,
                    strong: ({children}) => <strong style={{ color: '#4a9eff' }}>{children}</strong>,
                    a: ({href, children}) => (
                      <a href={href} style={{ color: '#4a9eff' }} target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    )
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
              color: '#888'
            }}>
              Alex is typing...
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ 
        padding: '20px',
        borderTop: '1px solid #333',
        backgroundColor: '#111'
      }}>
        <div style={{ 
          display: 'flex', 
          gap: '12px',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Alex anything about our yacht AI system..."
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              resize: 'none',
              minHeight: '44px',
              maxHeight: '120px',
              fontFamily: 'inherit'
            }}
            rows={1}
          />
          
          <button
            onClick={handleSend}
            disabled={!inputMessage.trim() || isLoading}
            style={{
              padding: '12px 24px',
              backgroundColor: inputMessage.trim() && !isLoading ? '#2563eb' : '#333',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: inputMessage.trim() && !isLoading ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px'
            }}
          >
            <Send size={18} />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default AskAlexPage;