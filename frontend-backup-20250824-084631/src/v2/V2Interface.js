import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WEBHOOK_CONFIG } from '../config/webhookConfig';

// Import V2 Components
import GuidedPromptChips from './components/GuidedPromptChips';
import AnimatedIntro from './components/AnimatedIntro';
import EnhancedSolutionCard from './components/EnhancedSolutionCard';

// Import styles
import './styles/design-tokens.css';

/**
 * V2Interface - Main integration component for new interface
 * This component orchestrates all V2 features and provides webhook integration
 */

export function V2Interface({ 
  user,
  isDarkMode = false,
  isMobile = false,
  onVersionSwitch 
}) {
  // State management
  const [showIntro, setShowIntro] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [solutions, setSolutions] = useState([]);
  const [showGuidedPrompts, setShowGuidedPrompts] = useState(true);
  
  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Check if intro was shown before
  useEffect(() => {
    const introShown = localStorage.getItem('v2_intro_shown');
    if (introShown === 'true') {
      setShowIntro(false);
    }
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, solutions]);

  // Handle intro completion
  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
    localStorage.setItem('v2_intro_shown', 'true');
    
    // Focus input after intro
    setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
  }, []);

  // Handle guided prompt selection
  const handlePromptSelect = useCallback(async (prompt) => {
    setInputValue(prompt);
    setShowGuidedPrompts(false);
    await sendMessage(prompt);
  }, []);

  // Send message to webhook
  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return;
    
    // Add user message
    const userMessage = {
      id: `msg_${Date.now()}`,
      type: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Call webhook
      const response = await fetch(`${WEBHOOK_CONFIG.baseUrl}/text-chat-fast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({
          query: text.trim(),
          userId: user?.id || 'guest',
          userName: user?.name || 'Guest',
          sessionId: `v2_${Date.now()}`,
          timestamp: new Date().toISOString()
        })
      });
      
      const data = await response.json();
      console.log('[V2Interface] Webhook response:', data);
      
      // Parse response
      let aiText = '';
      let newSolutions = [];
      
      // Handle different response formats
      if (data.response && typeof data.response === 'object') {
        // Yacht AI format with solutions
        aiText = data.response.message || data.response.answer || 'Processing your request...';
        
        if (data.response.solutions && Array.isArray(data.response.solutions)) {
          newSolutions = data.response.solutions.map((sol, idx) => ({
            ...sol,
            id: `sol_${Date.now()}_${idx}`,
            confidence: sol.confidence || Math.floor(Math.random() * 30) + 70
          }));
        }
      } else if (data.message) {
        aiText = data.message;
      } else if (typeof data === 'string') {
        aiText = data;
      } else {
        aiText = 'I understand your query. Let me analyze that for you.';
      }
      
      // Add AI message
      const aiMessage = {
        id: `msg_${Date.now()}_ai`,
        type: 'ai',
        text: aiText,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Add solutions if any
      if (newSolutions.length > 0) {
        setSolutions(prev => [...prev, ...newSolutions]);
      }
      
    } catch (error) {
      console.error('[V2Interface] Error:', error);
      
      const errorMessage = {
        id: `msg_${Date.now()}_error`,
        type: 'ai',
        text: 'I apologize, but I encountered a connection issue. Please try again.',
        isError: true,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input submission
  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  // Handle solution feedback
  const handleSolutionFeedback = async (feedbackData) => {
    console.log('[V2Interface] Solution feedback:', feedbackData);
    
    // Send feedback to webhook
    try {
      await fetch(`${WEBHOOK_CONFIG.baseUrl}/solution-feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData)
      });
    } catch (error) {
      console.error('[V2Interface] Feedback error:', error);
    }
  };

  // Handle solution action
  const handleSolutionAction = async (action, solution) => {
    console.log('[V2Interface] Solution action:', action, solution);
    
    // Handle different actions
    switch (action) {
      case 'implement':
        // Start implementation workflow
        const implementMessage = `Starting implementation of: ${solution.title}`;
        setMessages(prev => [...prev, {
          id: `msg_${Date.now()}_system`,
          type: 'system',
          text: implementMessage,
          timestamp: new Date().toISOString()
        }]);
        break;
        
      case 'schedule':
        // Schedule for later
        alert(`Solution "${solution.title}" has been scheduled for later implementation.`);
        break;
        
      default:
        break;
    }
  };

  // Apply dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Container styles
  const containerStyles = {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: isDarkMode ? 'var(--dark-blue-900)' : '#ffffff',
    color: isDarkMode ? 'var(--text-primary-dark)' : 'var(--text-primary)',
    fontFamily: 'var(--font-text)',
    position: 'relative',
    overflow: 'hidden'
  };

  return (
    <>
      {/* Animated Intro */}
      {showIntro && (
        <AnimatedIntro
          isVisible={showIntro}
          onComplete={handleIntroComplete}
          isDarkMode={isDarkMode}
        />
      )}
      
      <div className="v2-interface" style={containerStyles}>
        {/* Header */}
        <header style={{
          padding: 'var(--spacing-4)',
          borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          background: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
            <h1 style={{
              fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)',
              fontWeight: 600,
              fontFamily: 'var(--font-display)',
              background: isDarkMode 
                ? 'linear-gradient(135deg, var(--opulent-gold) 0%, #e6c574 100%)'
                : 'linear-gradient(135deg, var(--maritime-blue) 0%, #4da6ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              CelesteOS V2
            </h1>
            <span style={{
              padding: '2px 8px',
              background: 'var(--success-green)',
              color: 'white',
              borderRadius: 'var(--radius-full)',
              fontSize: '11px',
              fontWeight: 600
            }}>
              BETA
            </span>
          </div>
          
          <button
            onClick={onVersionSwitch}
            style={{
              padding: 'var(--spacing-2) var(--spacing-4)',
              background: 'transparent',
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
              borderRadius: 'var(--radius-md)',
              color: isDarkMode ? 'var(--text-primary-dark)' : 'var(--text-primary)',
              fontSize: 'var(--text-sm)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            Switch to V1
          </button>
        </header>
        
        {/* Main Content Area */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--spacing-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-4)'
        }}>
          {/* Guided Prompts */}
          {showGuidedPrompts && messages.length === 0 && (
            <div style={{ marginTop: 'var(--spacing-8)' }}>
              <h2 style={{
                textAlign: 'center',
                fontSize: isMobile ? 'var(--text-lg)' : 'var(--text-xl)',
                fontWeight: 500,
                marginBottom: 'var(--spacing-4)',
                opacity: 0.8
              }}>
                Try one of these to get started:
              </h2>
              <GuidedPromptChips
                onPromptSelect={handlePromptSelect}
                isDarkMode={isDarkMode}
                isMobile={isMobile}
              />
            </div>
          )}
          
          {/* Messages */}
          {messages.map(message => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                animation: 'slideInUp 0.3s var(--easing-smooth)'
              }}
            >
              <div style={{
                maxWidth: isMobile ? '85%' : '70%',
                padding: 'var(--spacing-3) var(--spacing-4)',
                borderRadius: 'var(--radius-lg)',
                background: message.type === 'user'
                  ? isDarkMode 
                    ? 'linear-gradient(135deg, var(--steel-blue) 0%, #74a9e6 100%)'
                    : 'linear-gradient(135deg, var(--maritime-blue) 0%, #4da6ff 100%)'
                  : message.isError
                    ? 'rgba(239, 68, 68, 0.1)'
                    : isDarkMode
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.03)',
                border: message.isError
                  ? '1px solid var(--error-red)'
                  : `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
                color: message.type === 'user'
                  ? '#ffffff'
                  : isDarkMode ? 'var(--text-primary-dark)' : 'var(--text-primary)',
                fontSize: 'var(--text-base)',
                lineHeight: 'var(--leading-relaxed)',
                boxShadow: message.type === 'user'
                  ? '0 4px 12px rgba(0, 0, 0, 0.15)'
                  : 'none'
              }}>
                {message.text}
              </div>
            </div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div style={{
              display: 'flex',
              justifyContent: 'flex-start',
              animation: 'pulse 1.5s infinite'
            }}>
              <div style={{
                padding: 'var(--spacing-3) var(--spacing-4)',
                borderRadius: 'var(--radius-lg)',
                background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`
              }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <span style={{ animation: 'bounce 1.4s infinite 0s' }}>●</span>
                  <span style={{ animation: 'bounce 1.4s infinite 0.2s' }}>●</span>
                  <span style={{ animation: 'bounce 1.4s infinite 0.4s' }}>●</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Solution Cards */}
          {solutions.map((solution, index) => (
            <EnhancedSolutionCard
              key={solution.id}
              solution={solution}
              index={index}
              isDarkMode={isDarkMode}
              isMobile={isMobile}
              onFeedback={handleSolutionFeedback}
              onActionClick={handleSolutionAction}
            />
          ))}
          
          <div ref={messagesEndRef} />
        </main>
        
        {/* Input Area */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: 'var(--spacing-4)',
            borderTop: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            background: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
          }}
        >
          <div style={{
            display: 'flex',
            gap: 'var(--spacing-3)',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about your yacht systems..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: 'var(--spacing-3) var(--spacing-4)',
                background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)'}`,
                borderRadius: 'var(--radius-lg)',
                color: isDarkMode ? 'var(--text-primary-dark)' : 'var(--text-primary)',
                fontSize: 'var(--text-base)',
                outline: 'none',
                transition: 'all var(--transition-fast)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = isDarkMode ? 'var(--opulent-gold)' : 'var(--maritime-blue)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)';
              }}
            />
            
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              style={{
                padding: 'var(--spacing-3) var(--spacing-5)',
                background: !inputValue.trim() || isLoading
                  ? '#6b7280'
                  : isDarkMode
                    ? 'linear-gradient(135deg, var(--opulent-gold) 0%, #e6c574 100%)'
                    : 'linear-gradient(135deg, var(--maritime-blue) 0%, #4da6ff 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--text-base)',
                fontWeight: 600,
                cursor: !inputValue.trim() || isLoading ? 'not-allowed' : 'pointer',
                transition: 'all var(--transition-fast)',
                boxShadow: !inputValue.trim() || isLoading
                  ? 'none'
                  : '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
      
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-10px); }
        }
      `}</style>
    </>
  );
}

export default V2Interface;