import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Send, 
  Plus, 
  Menu,
  X,
  MessageSquare,
  Trash2,
  User,
  LogOut,
  AlertCircle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// API Configuration
const API_CONFIG = {
  baseUrl: 'https://api.celeste7.ai/webhook',
  endpoints: {
    chat: '/text-chat-fast',
    fetchChat: '/fetch-chat',
    fetchConversations: '/fetch-conversations',
    auth: '/auth',
    login: '/auth/login',
    logout: '/auth/logout',
    verifyToken: '/auth/verify-token',
    signup: '/auth/signup'
  },
  timeout: 30000,
  maxRetries: 2,
  retryDelay: 1000
};

// Request Queue to prevent API hammering
class RequestQueue {
  constructor(maxConcurrent = 3) {
    this.queue = [];
    this.running = 0;
    this.maxConcurrent = maxConcurrent;
  }

  async add(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) return;
    
    this.running++;
    const { fn, resolve, reject } = this.queue.shift();
    
    try {
      const result = await fn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process();
    }
  }
}

const apiQueue = new RequestQueue(3);

// Optimized retry logic with queue
const sendRequestWithRetry = async (endpoint, payload, options = {}) => {
  return apiQueue.add(async () => {
    const { maxRetries = API_CONFIG.maxRetries, timeout = API_CONFIG.timeout } = options;
    const url = `${API_CONFIG.baseUrl}${endpoint}`;
    let lastError;
    
    const actualRetries = endpoint.includes('chat') ? 1 : maxRetries;
    
    for (let attempt = 0; attempt < actualRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
          credentials: 'omit',
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        const data = await response.json();
        
        if (response.ok) {
          return { success: true, data, attempt: attempt + 1 };
        }
        
        return { success: false, data, error: `HTTP ${response.status}`, attempt: attempt + 1 };
        
      } catch (error) {
        lastError = error;
        
        if (error.name === 'AbortError') {
          console.error(`Timeout on attempt ${attempt + 1}`);
        }
        
        if (attempt < actualRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay));
          continue;
        }
        
        break;
      }
    }
    
    throw new Error(`Request failed: ${lastError?.message || 'Unknown error'}`);
  });
};

// Auth Screen Component
const AuthScreen = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(async () => {
    if (isLoading) return;
    
    // Validation
    if (isSignup) {
      if (!displayName || !email || !password || !confirmPassword) {
        setError('Please fill in all fields');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    } else {
      if (!email || !password) return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const endpoint = isSignup ? API_CONFIG.endpoints.signup : API_CONFIG.endpoints.login;
      const payload = isSignup 
        ? { displayName: displayName.trim(), email: email.toLowerCase().trim(), password }
        : { email: email.toLowerCase().trim(), password };

      const result = await sendRequestWithRetry(endpoint, payload, { maxRetries: 2 });

      if (result.success) {
        const authData = Array.isArray(result.data) ? result.data[0] : result.data;
        
        if (authData?.user?.id && authData?.access_token) {
          const userData = {
            id: authData.user.id,
            email: authData.user.email,
            name: authData.user.display_name || authData.user.email.split('@')[0],
            displayName: authData.user.display_name || authData.user.email.split('@')[0]
          };
          
          onLogin(userData, authData.access_token);
        } else {
          setError('Invalid response format');
        }
      } else {
        setError(isSignup ? 'Email already exists' : 'Invalid email or password');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError('Connection failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [displayName, email, password, confirmPassword, isLoading, isSignup, onLogin]);

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError('');
    setDisplayName('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-[#202123]">
            Celeste<span className="bg-gradient-to-r from-[#60A5FA] to-[#2563EB] bg-clip-text text-transparent">OS</span>
          </h1>
          <p className="text-[#6e6e80] mt-2">Your success inevitability engine</p>
        </div>

        <div className="space-y-4">
          {isSignup && (
            <input
              type="text"
              placeholder="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') document.getElementById('email-input')?.focus();
              }}
              className="w-full px-3 py-3 bg-white border border-[#e5e5e5] rounded-md text-[#202123] placeholder-[#6e6e80] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
              disabled={isLoading}
            />
          )}
          
          <input
            id="email-input"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') document.getElementById('password-input')?.focus();
            }}
            className="w-full px-3 py-3 bg-white border border-[#e5e5e5] rounded-md text-[#202123] placeholder-[#6e6e80] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            autoComplete="email"
            disabled={isLoading}
          />
          
          <input
            id="password-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (isSignup) {
                  document.getElementById('confirm-password-input')?.focus();
                } else {
                  handleSubmit();
                }
              }
            }}
            className="w-full px-3 py-3 bg-white border border-[#e5e5e5] rounded-md text-[#202123] placeholder-[#6e6e80] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            autoComplete={isSignup ? "new-password" : "current-password"}
            disabled={isLoading}
          />

          {isSignup && (
            <input
              id="confirm-password-input"
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit();
              }}
              className="w-full px-3 py-3 bg-white border border-[#e5e5e5] rounded-md text-[#202123] placeholder-[#6e6e80] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
              autoComplete="new-password"
              disabled={isLoading}
            />
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isLoading || !email || !password || (isSignup && (!displayName || !confirmPassword))}
            className="w-full bg-gradient-to-r from-[#60A5FA] to-[#2563EB] text-white py-3 rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : (isSignup ? 'Create Account' : 'Begin Your Journey')}
          </button>

          <div className="text-center">
            <button
              onClick={toggleMode}
              className="text-sm text-[#6e6e80] hover:text-[#202123] transition-colors"
              disabled={isLoading}
            >
              {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Chat Interface Component
const ChatInterface = ({ user, onLogout }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const resizeTimeoutRef = useRef(null);

  // Get session ID from sessionStorage
  const sessionId = sessionStorage.getItem('celesteos_session_id');

  const sortedConversations = useMemo(() => 
    [...conversations].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)),
    [conversations]
  );

  useEffect(() => {
    if (!sidebarOpen) return;

    const handleClickOutside = (e) => {
      if (window.innerWidth >= 768) return;
      const sidebar = document.getElementById('sidebar');
      if (sidebar && !sidebar.contains(e.target)) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  useEffect(() => {
    if (messagesEndRef.current) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }, [activeConversation?.messages?.length]);

  const handleTextareaResize = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }

    resizeTimeoutRef.current = setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = '24px';
        const scrollHeight = textareaRef.current.scrollHeight;
        textareaRef.current.style.height = Math.min(scrollHeight, 200) + 'px';
      }
    }, 50);
  }, []);

  useEffect(() => {
    handleTextareaResize();
  }, [message, handleTextareaResize]);

  useEffect(() => {
    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  const createNewConversation = useCallback(() => {
    const newConv = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: 'New chat',
      messages: [],
      timestamp: Date.now()
    };
    
    setConversations(prev => [newConv, ...prev]);
    setActiveConversation(newConv);
    setSidebarOpen(false);
  }, []);

  const handleSendMessage = useCallback(async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isSending) return;

    let currentConversation = activeConversation;
    if (!currentConversation) {
      const newConv = {
        id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: trimmedMessage.substring(0, 30) + (trimmedMessage.length > 30 ? '...' : ''),
        messages: [],
        timestamp: Date.now()
      };
      setConversations(prev => [newConv, ...prev]);
      setActiveConversation(newConv);
      currentConversation = newConv;
    }
    
    setIsSending(true);
    setError(null);
    setConnectionError(false);

    const userMessage = {
      id: `msg_${Date.now()}_user`,
      text: trimmedMessage,
      isUser: true,
      timestamp: Date.now()
    };

    const aiMessage = {
      id: `msg_${Date.now()}_ai`,
      text: '',
      isUser: false,
      isThinking: true,
      timestamp: Date.now()
    };

    const updatedConv = {
      ...currentConversation,
      messages: [...(currentConversation.messages || []), userMessage, aiMessage],
      title: currentConversation.title === 'New chat' 
        ? trimmedMessage.substring(0, 30) + (trimmedMessage.length > 30 ? '...' : '')
        : currentConversation.title,
      timestamp: Date.now()
    };

    setActiveConversation(updatedConv);
    setConversations(prev => 
      prev.map(c => c.id === currentConversation.id ? updatedConv : c)
    );

    setMessage('');

    try {
      const result = await sendRequestWithRetry(API_CONFIG.endpoints.chat, {
        userId: user.id,
        userName: user.name || user.displayName,
        message: trimmedMessage,
        chatId: currentConversation.id,
        sessionId: sessionId || `session_${user.id}_${Date.now()}`,
        timestamp: new Date().toISOString()
      }, { maxRetries: 1, timeout: 30000 });
      
      if (result.success) {
        // Handle both array and object responses
        const responseData = Array.isArray(result.data) ? result.data[0] : result.data;
        
        if (!responseData) {
          throw new Error('Empty response from server');
        }
        
        const aiResponseText = responseData.response || 
          responseData.message || 
          responseData.text ||
          "I'm processing your request. Let me help you transform your patterns into profits.";
        
        const isRecovered = responseData.metadata?.recovered || 
                          responseData.metadata?.fallback ||
                          responseData.metadata?.tokensUsed === 0;
        
        const finalConv = {
          ...updatedConv,
          messages: updatedConv.messages.map(msg => 
            msg.id === aiMessage.id 
              ? { 
                  ...msg, 
                  text: aiResponseText, 
                  isThinking: false,
                  isRecovered
                }
              : msg
          )
        };

        setActiveConversation(finalConv);
        setConversations(prev => 
          prev.map(c => c.id === currentConversation.id ? finalConv : c)
        );
        
        if (isRecovered) {
          console.warn('Recovered from AI error, used fallback response');
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Message send failed:', error);
      setConnectionError(true);
      setError('Connection issue. Check your internet and try again.');
      
      const errorConv = {
        ...updatedConv,
        messages: updatedConv.messages.filter(m => m.id !== aiMessage.id)
      };
      setActiveConversation(errorConv);
      setConversations(prev => 
        prev.map(c => c.id === currentConversation.id ? errorConv : c)
      );
    } finally {
      setIsSending(false);
    }
  }, [message, activeConversation, isSending, user, sessionId]);

  const deleteConversation = useCallback((convId, e) => {
    e?.stopPropagation();
    setConversations(prev => prev.filter(c => c.id !== convId));
    if (activeConversation?.id === convId) {
      setActiveConversation(null);
    }
  }, [activeConversation]);

  return (
    <div className="flex h-screen bg-white">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-md hover:bg-[#f7f7f8] md:hidden"
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div
        id="sidebar"
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed md:relative md:translate-x-0 z-40 w-[260px] h-full bg-[#f7f7f8] transition-transform duration-200 ease-in-out flex flex-col`}
      >
        <div className="p-2 mt-14 md:mt-0">
          <button
            onClick={createNewConversation}
            className="flex items-center gap-3 w-full rounded-md border border-[#e5e5e5] px-3 py-3 text-sm text-[#202123] hover:bg-[#e5e5e5] transition-colors"
          >
            <Plus size={16} />
            New chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-2 pb-2">
            {sortedConversations.length === 0 ? (
              <div className="text-center text-[#6e6e80] text-sm mt-8 px-4">
                Your transformation journey begins with your first conversation
              </div>
            ) : (
              sortedConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => {
                    setActiveConversation(conv);
                    setSidebarOpen(false);
                  }}
                  className={`group relative flex items-center gap-3 w-full rounded-md px-3 py-3 text-sm transition-colors cursor-pointer ${
                    activeConversation?.id === conv.id
                      ? 'bg-[#e5e5e5]'
                      : 'hover:bg-[#e5e5e5]'
                  }`}
                >
                  <MessageSquare size={16} className="flex-shrink-0" />
                  <span className="flex-1 text-left truncate">{conv.title}</span>
                  <button
                    onClick={(e) => deleteConversation(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#d5d5d5] rounded transition-opacity"
                    aria-label="Delete conversation"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border-t border-[#e5e5e5] p-2">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full rounded-md px-3 py-3 text-sm text-[#202123] hover:bg-[#e5e5e5] transition-colors"
          >
            <User size={16} />
            <span className="flex-1 text-left truncate">{user.email}</span>
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="flex-1 flex flex-col">
        <div className="md:hidden border-b border-[#e5e5e5] px-4 py-3 text-center">
          <h1 className="text-xl font-semibold text-[#202123]">
            Celeste<span className="bg-gradient-to-r from-[#60A5FA] to-[#2563EB] bg-clip-text text-transparent">OS</span>
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!activeConversation || activeConversation.messages?.length === 0 ? (
            <div className="h-full flex items-center justify-center p-4">
              <div className="text-center max-w-2xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-semibold text-[#202123] mb-4">
                  Celeste<span className="bg-gradient-to-r from-[#60A5FA] to-[#2563EB] bg-clip-text text-transparent">OS</span>
                </h1>
                <p className="text-[#6e6e80] mb-8">Your success inevitability engine</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  {[
                    'Show me my success patterns',
                    'What\'s blocking my $10k month?',
                    'Make my next move obvious'
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => {
                        setMessage(prompt);
                        textareaRef.current?.focus();
                      }}
                      className="p-4 rounded-md border border-[#e5e5e5] text-sm text-[#202123] hover:bg-[#f7f7f8] transition-colors text-left"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="pb-32">
              {activeConversation.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={msg.isUser ? 'bg-white' : 'bg-[#f7f7f8]'}
                >
                  <div className="max-w-3xl mx-auto px-4 py-6">
                    <div className={`flex gap-4 ${msg.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-sm flex items-center justify-center font-medium ${
                          msg.isUser 
                            ? 'bg-white border border-[#e5e5e5] text-[#202123]' 
                            : 'bg-[#2563EB] text-white'
                        }`}>
                          {msg.isUser ? user.name?.[0]?.toUpperCase() || 'U' : 'C'}
                        </div>
                      </div>
                      <div className={`flex-1 overflow-hidden ${msg.isUser ? 'text-right' : 'text-left'}`}>
                        {msg.isThinking ? (
                          <div className="flex items-center gap-1 justify-start">
                            <div className="w-2 h-2 bg-[#2563EB] rounded-full animate-pulse" />
                            <div className="w-2 h-2 bg-[#2563EB] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                            <div className="w-2 h-2 bg-[#2563EB] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                          </div>
                        ) : (
                          <div className={`prose prose-sm max-w-none ${msg.isUser ? '[&>*]:text-right' : '[&>*]:text-left'}`}>
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {connectionError && (
          <div className="mx-4 mb-2">
            <div className="max-w-3xl mx-auto bg-red-50 border border-red-200 rounded-md p-3 flex items-center gap-2 text-sm text-red-700">
              <AlertCircle size={16} />
              <span>Connection issue. Your message wasn't sent.</span>
              <button
                onClick={() => setConnectionError(false)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        <div className="border-t border-[#e5e5e5] bg-white p-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-2 rounded-md border border-[#e5e5e5] bg-white shadow-sm">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={activeConversation ? "Message CelesteOS..." : "Start your transformation..."}
                className="flex-1 resize-none bg-transparent px-4 py-3 text-[#202123] placeholder-[#6e6e80] focus:outline-none min-h-[24px] max-h-[200px]"
                rows={1}
                disabled={isSending}
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || isSending}
                className="mb-3 mr-3 p-1.5 rounded-md text-white bg-gradient-to-r from-[#60A5FA] to-[#2563EB] disabled:opacity-40 disabled:cursor-not-allowed transition-opacity hover:opacity-90"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
          <p className="text-xs text-center text-[#6e6e80] mt-2">
            CelesteOS transforms patterns into profits
          </p>
        </div>
      </div>
    </div>
  );
};

// Export components in the format App.js expects
const Components = {
  AuthScreen,
  ChatInterface
};

export default Components;