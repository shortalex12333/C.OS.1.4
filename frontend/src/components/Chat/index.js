import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AlertCircle, RefreshCw, Zap } from 'lucide-react';

import ErrorBoundary from './ErrorBoundary';
import Header from './Header';
import MessageBubble from './MessageBubble';
import InputArea from './InputArea';

// Typing Indicator Component
const TypingIndicator = React.memo(() => (
  <div className="flex justify-start mb-4" data-testid="typing-indicator">
    <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-2xl mr-4">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  </div>
));

// Error Message Component
const ErrorMessage = React.memo(({ error, onRetry, onDismiss }) => (
  <div className="flex justify-center mb-4">
    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-3 max-w-md">
      <AlertCircle size={16} />
      <span className="flex-1 text-sm">
        {error.includes('rate limit') || error.includes('slow down') 
          ? 'Please slow down - you\'re sending messages too quickly'
          : error.includes('network') || error.includes('fetch')
          ? 'Network error - please check your connection'
          : error
        }
      </span>
      <div className="flex gap-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-red-700 hover:text-red-900 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
            aria-label="Retry message"
          >
            <RefreshCw size={14} />
          </button>
        )}
        <button
          onClick={onDismiss}
          className="text-red-700 hover:text-red-900 transition-colors text-lg leading-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
          aria-label="Dismiss error"
        >
          ×
        </button>
      </div>
    </div>
  </div>
));

// Empty State Component
const EmptyState = React.memo(() => (
  <div className="text-center py-12">
    <div className="text-gray-400 mb-4">
      <Zap size={48} className="mx-auto mb-4" />
    </div>
    <h2 className="text-xl font-medium text-gray-900 mb-2">Welcome to CelesteOS</h2>
    <p className="text-gray-600 max-w-md mx-auto">
      Start a conversation by typing a message below. I'm here to help with sales, marketing, strategy, and more.
    </p>
  </div>
));

// Main Chat Component
const ChatComponent = ({ 
  user, 
  apiEndpoint = 'https://api.celeste7.ai/webhook/text-chat-fast',
  maxMessages = 200
}) => {
  // State management
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryMessage, setRetryMessage] = useState(null);
  const [tokenStats, setTokenStats] = useState({ remaining: 0, used: 0 });
  const [connectionStatus, setConnectionStatus] = useState({
    isOnline: navigator.onLine,
    isConnected: true
  });
  
  // Refs
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);
  const debounceRef = useRef(null);
  const messagesContainerRef = useRef(null);
  
  // Connection status monitoring
  useEffect(() => {
    const handleOnline = () => setConnectionStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setConnectionStatus(prev => ({ ...prev, isOnline: false }));
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Load conversation from sessionStorage
  useEffect(() => {
    const savedMessages = sessionStorage.getItem('celesteos_chat_messages');
    const savedTokens = sessionStorage.getItem('celesteos_token_stats');
    
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        // Limit loaded messages to prevent performance issues
        setMessages(parsed.slice(-maxMessages));
      } catch (e) {
        console.warn('Failed to load saved messages:', e);
      }
    }
    
    if (savedTokens) {
      try {
        setTokenStats(JSON.parse(savedTokens));
      } catch (e) {
        console.warn('Failed to load token stats:', e);
      }
    }
  }, [maxMessages]);
  
  // Save conversation to sessionStorage
  useEffect(() => {
    if (messages.length > 0) {
      // Only save recent messages to prevent storage bloat
      const messagesToSave = messages.slice(-maxMessages);
      sessionStorage.setItem('celesteos_chat_messages', JSON.stringify(messagesToSave));
    }
  }, [messages, maxMessages]);
  
  useEffect(() => {
    sessionStorage.setItem('celesteos_token_stats', JSON.stringify(tokenStats));
  }, [tokenStats]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);
  
  // Smooth scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);
  
  useEffect(() => {
    // Use RAF to ensure DOM is updated
    requestAnimationFrame(() => {
      scrollToBottom();
    });
  }, [messages, isLoading, scrollToBottom]);
  
  // Send message function
  const sendMessage = useCallback(async (messageText = inputValue.trim(), isRetry = false) => {
    if (!messageText || isLoading || !connectionStatus.isOnline) return;
    
    // Abort previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    setError(null);
    setIsLoading(true);
    setConnectionStatus(prev => ({ ...prev, isConnected: false }));
    
    // Add user message immediately (optimistic update)
    const userMessage = {
      id: `user-${Date.now()}`,
      text: messageText,
      isUser: true,
      timestamp: new Date()
    };
    
    if (!isRetry) {
      setMessages(prev => {
        const newMessages = [...prev, userMessage];
        // Limit messages to prevent performance issues
        return newMessages.slice(-maxMessages);
      });
      setInputValue('');
    }
    
    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id || 'guest_user_' + Date.now(),
          message: messageText,
          chatId: sessionStorage.getItem('celesteos_chat_id') || `chat_${Date.now()}`,
          sessionId: sessionStorage.getItem('celesteos_session_id') || `session_${Date.now()}`,
          userName: user?.displayName || user?.name || user?.email?.split('@')[0] || 'User'
        }),
        signal: abortControllerRef.current.signal
      });
      
      setConnectionStatus(prev => ({ ...prev, isConnected: true }));
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.response) {
        const aiMessage = {
          id: `ai-${Date.now()}`,
          text: data.response,
          isUser: false,
          timestamp: new Date(data.timestamp || Date.now()),
          category: data.metadata?.category,
          confidence: data.metadata?.confidence,
          responseTime: data.metadata?.responseTime,
          stage: data.metadata?.stage,
          requestId: data.requestId,
          fadeIn: true
        };
        
        setMessages(prev => {
          const newMessages = [...prev, aiMessage];
          return newMessages.slice(-maxMessages);
        });
        
        // Update token stats with new format
        if (data.metadata?.tokensUsed !== undefined || data.metadata?.tokensRemaining !== undefined) {
          setTokenStats(prev => ({
            remaining: data.metadata?.tokensRemaining ?? prev.remaining,
            used: prev.used + (data.metadata?.tokensUsed || 0),
            hourly: data.error?.limits?.hourly,
            daily: data.error?.limits?.daily,
            monthly: data.error?.limits?.monthly
          }));
        }
        
        setRetryMessage(null);
        
        // Announce to screen readers
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance('New message received');
          utterance.volume = 0; // Silent but triggers screen reader
          speechSynthesis.speak(utterance);
        }
        
      } else {
        // Handle new API error response format
        if (!data.success && data.response) {
          // Token limit errors
          if (data.error?.type?.includes('limit_exceeded')) {
            const errorDetails = data.error.details;
            const limitType = errorDetails?.limitType || 'token';
            const resetTime = errorDetails?.resetFormatted || 'soon';
            const minutesUntilReset = errorDetails?.minutesUntilReset;
            
            let errorMessage = data.response; // Use the formatted response message
            if (minutesUntilReset) {
              errorMessage += ` (${minutesUntilReset} minutes remaining)`;
            }
            
            setError(errorMessage);
            setRetryMessage(messageText);
            
            // Update token stats with limit info
            if (data.error.limits) {
              setTokenStats(prev => ({
                ...prev,
                hourly: data.error.limits.hourly,
                daily: data.error.limits.daily,
                monthly: data.error.limits.monthly
              }));
            }
            return;
          }
          
          // System errors (high demand, rate limited, etc.)
          if (data.error?.type) {
            setError(data.response); // Use the formatted response message
            setRetryMessage(messageText);
            
            // Handle retryAfter for system errors
            if (data.error.retryAfter) {
              setTimeout(() => {
                setError(null);
              }, data.error.retryAfter * 1000);
            }
            return;
          }
        }
        
        throw new Error(data.error?.details?.message || data.response || 'Failed to get response');
      }
      
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Request aborted');
        return;
      }
      
      console.error('Chat error:', err);
      setError(err.message);
      setRetryMessage(messageText);
      setConnectionStatus(prev => ({ ...prev, isConnected: false }));
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [inputValue, isLoading, messages, user?.id, apiEndpoint, maxMessages, connectionStatus.isOnline]);
  
  // Handle input changes with debouncing
  const handleInputChange = useCallback((e) => {
    setInputValue(e.target.value);
    
    // Debounce to prevent spam (could be used for typing indicators)
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      // Could add typing indicator logic here
    }, 300);
  }, []);
  
  // Clear chat function
  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setRetryMessage(null);
    setInputValue('');
    sessionStorage.removeItem('celesteos_chat_messages');
    
    // Announce to screen readers
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Chat cleared');
      utterance.volume = 0;
      speechSynthesis.speak(utterance);
    }
  }, []);
  
  // Retry failed message
  const retryFailedMessage = useCallback(() => {
    if (retryMessage) {
      sendMessage(retryMessage, true);
    }
  }, [retryMessage, sendMessage]);
  
  // Memoized messages list for performance
  const messagesList = useMemo(() => {
    return messages.map((msg) => (
      <MessageBubble
        key={msg.id}
        message={msg.text}
        isUser={msg.isUser}
        category={msg.category}
        confidence={msg.confidence}
        responseTime={msg.responseTime}
        fadeIn={msg.fadeIn}
        timestamp={msg.timestamp}
      />
    ));
  }, [messages]);
  
  return (
    <ErrorBoundary>
      <div 
        className="flex flex-col h-screen bg-white"
        style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif' }}
        data-testid="chat-component"
      >
        <Header
          tokenStats={tokenStats}
          isLoading={isLoading}
          onClearChat={clearChat}
          connectionStatus={connectionStatus}
        />
        
        {/* Messages Container */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-4 py-4"
          role="log"
          aria-live="polite"
          aria-label="Chat messages"
        >
          <div className="max-w-3xl mx-auto">
            {messages.length === 0 && <EmptyState />}
            
            {messagesList}
            
            {isLoading && <TypingIndicator />}
            
            {error && (
              <ErrorMessage
                error={error}
                onRetry={retryMessage ? retryFailedMessage : null}
                onDismiss={() => setError(null)}
              />
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        <InputArea
          value={inputValue}
          onChange={handleInputChange}
          onSend={sendMessage}
          isLoading={isLoading}
          disabled={!connectionStatus.isOnline}
        />
      </div>
    </ErrorBoundary>
  );
};

export default ChatComponent;