import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Send, AlertCircle, RefreshCw, DollarSign, TrendingUp, Target, Users, BarChart3, Zap } from 'lucide-react';
import { WEBHOOK_URLS } from './config/webhookConfig';

// Category icons mapping
const categoryIcons = {
  sales: DollarSign,
  marketing: TrendingUp,
  strategy: Target,
  operations: BarChart3,
  hr: Users,
  general: Zap
};

// Message formatting utilities
const formatMessage = (text) => {
  if (!text) return '';
  
  // Handle bold text **text**
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Handle bullet points
  text = text.replace(/^[\s]*[-•*]\s+(.+)$/gm, '<li>$1</li>');
  text = text.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  
  // Handle code blocks
  text = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Break long paragraphs
  text = text.replace(/\n\n/g, '</p><p>');
  text = `<p>${text}</p>`;
  
  return text;
};

// Memoized Message Component
const Message = React.memo(({ message, isUser, category, confidence, responseTime, fadeIn = false }) => {
  const CategoryIcon = categoryIcons[category] || Zap;
  
  return (
    <div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 ${fadeIn ? 'animate-fadeIn' : ''}`}
      role="log"
      aria-live="polite"
    >
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        {!isUser && category && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
              <CategoryIcon size={12} />
              {category}
            </div>
            {confidence && (
              <div className="text-xs text-gray-500">
                {Math.round(confidence * 100)}% confident
              </div>
            )}
            {responseTime && (
              <div className="text-xs text-gray-500">
                {responseTime}ms
              </div>
            )}
          </div>
        )}
        <div 
          className={`px-4 py-3 rounded-2xl ${
            isUser 
              ? 'bg-blue-500 text-white ml-4' 
              : 'bg-gray-100 text-gray-900 mr-4'
          }`}
          style={{ 
            fontSize: window.innerWidth < 640 ? '18px' : '20px',
            lineHeight: '1.6'
          }}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message}</p>
          ) : (
            <div 
              dangerouslySetInnerHTML={{ __html: formatMessage(message) }}
              className="prose prose-sm max-w-none [&>p]:mb-4 [&>p:last-child]:mb-0 [&>ul]:mb-4 [&>pre]:bg-gray-800 [&>pre]:text-white [&>pre]:p-3 [&>pre]:rounded [&>code]:bg-gray-200 [&>code]:px-1 [&>code]:rounded"
            />
          )}
        </div>
      </div>
    </div>
  );
});

// Typing Indicator Component
const TypingIndicator = React.memo(() => (
  <div className="flex justify-start mb-4">
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
        <button
          onClick={onRetry}
          className="text-red-700 hover:text-red-900 transition-colors"
          aria-label="Retry message"
        >
          <RefreshCw size={14} />
        </button>
        <button
          onClick={onDismiss}
          className="text-red-700 hover:text-red-900 transition-colors text-lg leading-none"
          aria-label="Dismiss error"
        >
          ×
        </button>
      </div>
    </div>
  </div>
));

// Token Counter Component
const TokenCounter = React.memo(({ remaining, used, isLoading }) => (
  <div className="text-sm text-gray-600 flex items-center gap-2">
    {isLoading && <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
    <span>
      {remaining?.toLocaleString() || 0} tokens remaining today
    </span>
    {used > 0 && (
      <span className="text-gray-400">
        ({used.toLocaleString()} used)
      </span>
    )}
  </div>
));

// Main Chat Interface Component
const ModernChatInterface = ({ user, apiEndpoint = WEBHOOK_URLS.TEXT_CHAT_FAST }) => {
  // State management
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryMessage, setRetryMessage] = useState(null);
  const [tokenStats, setTokenStats] = useState({ remaining: 0, used: 0 });
  
  // Streaming animation state
  const [streamingIntervals, setStreamingIntervals] = useState(new Map());
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Word-by-word streaming function - FIXED IMPLEMENTATION
  const streamMessage = useCallback((fullText, messageId) => {
    console.log('🎬 ModernChat streamMessage called:', { fullText, messageId }); // DEBUG
    
    // Clear any existing interval for this message
    if (streamingIntervals.has(messageId)) {
      clearInterval(streamingIntervals.get(messageId));
      streamingIntervals.delete(messageId);
    }

    if (!fullText || !messageId) {
      console.error('❌ ModernChat streamMessage: Missing required parameters', { fullText, messageId });
      return;
    }

    const words = fullText.split(' ');
    let currentIndex = 0;
    
    console.log('📝 ModernChat starting stream with', words.length, 'words'); // DEBUG
    
    const interval = setInterval(() => {
      if (currentIndex < words.length) {
        const currentText = words.slice(0, currentIndex + 1).join(' ');
        console.log(`📝 ModernChat Word ${currentIndex + 1}/${words.length}:`, currentText); // DEBUG
        
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { 
                ...msg, 
                text: currentText,
                isStreaming: true
              }
            : msg
        ));
        currentIndex++;
      } else {
        console.log('✅ ModernChat streaming complete for message:', messageId); // DEBUG
        
        // Streaming complete
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, isStreaming: false }
            : msg
        ));
        clearInterval(interval);
        setStreamingIntervals(prev => {
          const newMap = new Map(prev);
          newMap.delete(messageId);
          return newMap;
        });
      }
    }, 40); // 40ms delay between words

    setStreamingIntervals(prev => new Map(prev).set(messageId, interval));
  }, [streamingIntervals]);

  // Clear all streaming intervals
  const clearAllStreaming = useCallback(() => {
    streamingIntervals.forEach(interval => clearInterval(interval));
    setStreamingIntervals(new Map());
  }, [streamingIntervals]);

  // Clear streaming when component unmounts
  useEffect(() => {
    return () => {
      clearAllStreaming();
    };
  }, [clearAllStreaming]);
  const debounceRef = useRef(null);
  
  // Load conversation from sessionStorage
  useEffect(() => {
    const savedMessages = sessionStorage.getItem('celesteos_chat_messages');
    const savedTokens = sessionStorage.getItem('celesteos_token_stats');
    
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
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
  }, []);
  
  // Save conversation to sessionStorage
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem('celesteos_chat_messages', JSON.stringify(messages));
    }
  }, [messages]);
  
  useEffect(() => {
    sessionStorage.setItem('celesteos_token_stats', JSON.stringify(tokenStats));
  }, [tokenStats]);
  
  // Smooth scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);
  
  // Send message function
  const sendMessage = useCallback(async (messageText = inputValue, isRetry = false) => {
    const text = messageText.trim();
    if (!text || isLoading) return;

    // Clear any existing streaming
    clearAllStreaming();

    setIsLoading(true);
    setError(null);
    setRetryMessage(null);
    
    const userMessage = {
      id: `user-${Date.now()}`,
      text,
      isUser: true,
      timestamp: new Date()
    };
    
    if (!isRetry) {
      setMessages(prev => [...prev, userMessage]);
      setInputValue('');
    }
    
    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({
          userId: user.id,
          userName: user.name || user.displayName,
          message: text,
          chatId: `chat_${user.id}_${Date.now()}`,
          sessionId: `session_${user.id}`,
          timestamp: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.response) {
        // STOP pulsing animation immediately
        setIsLoading(false);
        
        console.log('🔍 ModernChat Webhook Response:', data); // DEBUG
        
        const aiMessageId = `ai-${Date.now()}`;
        const aiMessage = {
          id: aiMessageId,
          text: '', // Start with empty text for streaming
          isUser: false,
          timestamp: new Date(data.timestamp || Date.now()),
          category: data.metadata?.category,
          confidence: data.metadata?.confidence,
          responseTime: data.metadata?.responseTime,
          stage: data.metadata?.stage,
          requestId: data.requestId,
          fadeIn: true,
          isStreaming: true
        };
        
        setMessages(prev => [...prev, aiMessage]);
        
        console.log('🔍 AI Response Text:', data.response); // DEBUG
        
        // Start word-by-word streaming AFTER UI update
        setTimeout(() => {
          console.log('🚀 Starting streaming animation'); // DEBUG
          streamMessage(data.response, aiMessageId);
        }, 100);
        
        // Update token stats with new format
        if (data.metadata?.tokensUsed !== undefined || data.metadata?.tokensRemaining !== undefined) {
          setTokenStats(prev => ({
            remaining: data.metadata?.tokensRemaining || prev.remaining,
            used: (prev.used || 0) + (data.metadata?.tokensUsed || 0)
          }));
        }
        
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Send message error:', error);
      
      // Add error message without streaming
      const errorMessage = {
        id: `error-${Date.now()}`,
        text: 'Failed to send message. Please try again.',
        isUser: false,
        isError: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setRetryMessage(text);
      setError(error.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, user, apiEndpoint, streamMessage, clearAllStreaming]);
  
  // Handle input changes with debouncing
  const handleInputChange = useCallback((e) => {
    setInputValue(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 96)}px`; // Max 4 lines
    
    // Debounce to prevent spam
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      // Could add typing indicator logic here
    }, 300);
  }, []);
  
  // Handle keyboard events
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);
  
  // Clear chat function
  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setRetryMessage(null);
    sessionStorage.removeItem('celesteos_chat_messages');
    textareaRef.current?.focus();
  }, []);
  
  // Retry failed message
  const retryFailedMessage = useCallback(() => {
    if (retryMessage) {
      sendMessage(retryMessage, true);
    }
  }, [retryMessage, sendMessage]);
  
  // Memoized messages list
  const messagesList = useMemo(() => {
    return messages.map((msg) => (
      <Message
        key={msg.id}
        message={msg.text}
        isUser={msg.isUser}
        category={msg.category}
        confidence={msg.confidence}
        responseTime={msg.responseTime}
        fadeIn={msg.fadeIn}
      />
    ));
  }, [messages]);
  
  return (
    <div className="flex flex-col h-screen bg-white" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif' }}>
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between bg-white">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">CelesteOS Chat</h1>
          <TokenCounter 
            remaining={tokenStats.remaining} 
            used={tokenStats.used} 
            isLoading={isLoading}
          />
        </div>
        <button
          onClick={clearChat}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors px-3 py-1 rounded hover:bg-gray-100"
          aria-label="Clear chat history"
        >
          Clear
        </button>
      </div>
      
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Zap size={48} className="mx-auto mb-4" />
              </div>
              <h2 className="text-xl font-medium text-gray-900 mb-2">Welcome to CelesteOS</h2>
              <p className="text-gray-600">Start a conversation by typing a message below.</p>
            </div>
          )}
          
          {messagesList}
          
          {isLoading && <TypingIndicator />}
          
          {error && (
            <ErrorMessage
              error={error}
              onRetry={retryFailedMessage}
              onDismiss={() => setError(null)}
            />
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                style={{ 
                  fontSize: window.innerWidth < 640 ? '18px' : '20px',
                  lineHeight: '1.6',
                  minHeight: '48px',
                  maxHeight: '96px'
                }}
                rows={1}
                aria-label="Type your message"
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-full p-3 transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center"
              aria-label="Send message"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernChatInterface;
