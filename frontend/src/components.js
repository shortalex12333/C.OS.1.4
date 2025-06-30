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
  AlertCircle,
  Sun,
  Moon,
  Copy,
  RefreshCw,
  Edit3,
  StopCircle,
  Check,
  Clock,
  Settings,
  ChevronDown,
  Eye,
  EyeOff
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cacheService } from './services/cacheService';
import UserProfilePanel from './components/UserProfilePanel';
import DebugPanel from './components/DebugPanel';
import { WEBHOOK_CONFIG, WEBHOOK_URLS } from './config/webhookConfig';

// API Configuration
const API_CONFIG = {
  baseUrl: WEBHOOK_CONFIG.baseUrl,
  endpoints: {
    chat: '/text-chat-fast',
    fetchChat: '/fetch-chat',
    fetchConversations: '/fetch-conversations',
    auth: '/auth',
    login: '/auth/login',
    logout: '/auth/logout',
    verifyToken: '/auth/verify-token',
    signup: '/auth-signup',
    getData: '/get-data'
  },
  timeout: WEBHOOK_CONFIG.timeout,
  maxRetries: WEBHOOK_CONFIG.maxRetries,
  retryDelay: WEBHOOK_CONFIG.retryDelay
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
    const { maxRetries = API_CONFIG.maxRetries, timeout = API_CONFIG.timeout, signal } = options;
    const url = `${WEBHOOK_CONFIG.baseUrl}${endpoint}`;
    let lastError;
    
    const actualRetries = endpoint.includes('chat') ? 1 : maxRetries;
    
    for (let attempt = 0; attempt < actualRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const requestSignal = signal || controller.signal;
        
        const response = await fetch(url, {
          ...WEBHOOK_CONFIG.defaults,
          body: JSON.stringify(payload),
          signal: requestSignal
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
          throw error;
        }
        
        if (attempt < actualRetries - 1) {
          const retryDelay = endpoint.includes('signup') ? 10000 : API_CONFIG.retryDelay;
          console.log(`Retrying in ${retryDelay}ms... (attempt ${attempt + 1}/${actualRetries})`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        
        break;
      }
    }
    
    throw new Error(`Request failed: ${lastError?.message || 'Unknown error'}`);
  });
};

// Utility functions
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  }
};

// Auth Screen Component - Full featured
const AuthScreen = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password strength indicator
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: '', color: '' };
    
    let score = 0;
    let feedback = [];
    
    if (password.length >= 8) score += 1;
    else feedback.push('at least 8 characters');
    
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('uppercase letter');
    
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('lowercase letter');
    
    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('number');
    
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    else feedback.push('special character');
    
    const weakPasswords = ['password', '12345678', 'qwerty', 'abc123', 'password123'];
    const isWeak = weakPasswords.some(weak => password.toLowerCase().includes(weak));
    
    if (isWeak) {
      return { strength: 0, text: 'Too weak (common password)', color: 'text-celeste-system-error' };
    }
    
    if (score <= 2) {
      return { strength: score, text: `Weak (needs: ${feedback.slice(0, 2).join(', ')})`, color: 'text-celeste-system-error' };
    } else if (score <= 3) {
      return { strength: score, text: 'Fair', color: 'text-celeste-system-warning' };
    } else if (score <= 4) {
      return { strength: score, text: 'Good', color: 'text-celeste-system-success' };
    } else {
      return { strength: score, text: 'Strong', color: 'text-celeste-system-success' };
    }
  };

  const handleSubmit = useCallback(async () => {
    if (isLoading) return;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (isSignup) {
      if (!email || !password || !confirmPassword) {
        setError('Please fill in all fields');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
      const weakPasswords = ['password', '12345678', 'qwerty', 'abc123', 'password123'];
      if (weakPasswords.some(weak => password.toLowerCase().includes(weak))) {
        setError('Password too weak. Try something like: YourName2024!@#');
        return;
      }
    } else {
      if (!email || !password) {
        setError('Please enter your email and password');
        return;
      }
    }
    
    setIsLoading(true);
    setError('');

    try {
      const endpoint = isSignup ? API_CONFIG.endpoints.signup : API_CONFIG.endpoints.login;
      const payload = isSignup 
        ? { displayName: displayName.trim() || email.split('@')[0], email: email.toLowerCase().trim(), password }
        : { email: email.toLowerCase().trim(), password };

      const result = await sendRequestWithRetry(endpoint, payload, { 
        maxRetries: 2, 
        timeout: isSignup ? 10000 : 5000
      });

      if (result.success) {
        if (isSignup) {
          const responseData = result.data;
          if (responseData.statusCode === 201 && responseData.response?.success) {
            setSignupSuccess(true);
            setDisplayName('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setError('');
            
            setTimeout(() => {
              setSignupSuccess(false);
              setIsSignup(false);
            }, 3000);
          } else {
            setError('Signup failed. Please try again.');
          }
        } else {
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
        }
      } else {
        const errorData = result.data;
        
        if (isSignup) {
          if (errorData.statusCode === 400) {
            setError(errorData.response?.error || 'Invalid input. Please check your details.');
          } else if (errorData.statusCode === 422) {
            const errorMsg = errorData.response?.error || 'Password too weak';
            const suggestion = errorData.response?.suggestion;
            setError(suggestion ? `${errorMsg}\n\nSuggestion: ${suggestion}` : errorMsg);
          } else if (errorData.statusCode === 409) {
            setError('Email already registered. Try logging in instead.');
          } else if (errorData.statusCode === 500) {
            setError('Signup failed. Please try again.');
          } else {
            setError(errorData.response?.error || 'Signup failed. Please try again.');
          }
        } else {
          if (errorData?.error?.includes('already registered')) {
            setError('This email is already registered. Try logging in.');
          } else {
            setError('Invalid email or password');
          }
        }
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
    setSignupSuccess(false);
    setDisplayName('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  if (signupSuccess) {
    return (
      <div className="min-h-screen bg-celeste-dark-primary flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-celeste-text-primary">
              Celeste<span className="bg-gradient-to-r from-celeste-brand-primary to-celeste-brand-accent bg-clip-text text-transparent">OS</span>
            </h1>
          </div>
          
          <div className="bg-celeste-system-success/10 border border-celeste-system-success/30 rounded-md p-6 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-celeste-system-success/20 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-celeste-system-success" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-celeste-system-success mb-2">Account created successfully!</h3>
            <p className="text-celeste-system-success/80 mb-4">Welcome to CelesteOS! Your account is ready to use.</p>
            <p className="text-sm text-celeste-system-success/60 mb-6">Redirecting you to login in a few seconds...</p>
            
            <button
              onClick={() => {
                setSignupSuccess(false);
                setIsSignup(false);
                setEmail('');
                setPassword('');
              }}
              className="bg-celeste-brand-primary hover:bg-celeste-brand-hover text-white px-6 py-2 rounded-lg transition-colors"
            >
              Continue to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-celeste-dark-primary flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-celeste-text-primary">
            Celeste<span className="bg-gradient-to-r from-celeste-brand-primary to-celeste-brand-accent bg-clip-text text-transparent">OS</span>
          </h1>
          <p className="text-celeste-text-muted mt-2">Your success inevitability engine</p>
        </div>

        <div className="space-y-4">
          {isSignup && (
            <input
              type="text"
              placeholder="Display name (optional)"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') document.getElementById('email-input')?.focus();
              }}
              className="w-full px-3 py-3 bg-celeste-dark-tertiary border border-celeste-dark-hover rounded-md text-celeste-text-primary placeholder-celeste-text-muted focus:outline-none focus:ring-2 focus:ring-celeste-brand-primary focus:border-transparent transition-all"
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
            className="w-full px-3 py-3 bg-celeste-dark-tertiary border border-celeste-dark-hover rounded-md text-celeste-text-primary placeholder-celeste-text-muted focus:outline-none focus:ring-2 focus:ring-celeste-brand-primary focus:border-transparent transition-all"
            autoComplete="email"
            disabled={isLoading}
          />
          
          <div className="relative">
            <input
              id="password-input"
              type={showPassword ? "text" : "password"}
              placeholder={isSignup ? "Password (8+ characters)" : "Password"}
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
              className="w-full px-3 py-3 pr-10 bg-celeste-dark-tertiary border border-celeste-dark-hover rounded-md text-celeste-text-primary placeholder-celeste-text-muted focus:outline-none focus:ring-2 focus:ring-celeste-brand-primary focus:border-transparent transition-all"
              autoComplete={isSignup ? "new-password" : "current-password"}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-celeste-text-muted hover:text-celeste-text-secondary transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {isSignup && password && (
            <div className="text-xs">
              <span className={getPasswordStrength(password).color}>
                {getPasswordStrength(password).text}
              </span>
            </div>
          )}

          {isSignup && (
            <div className="relative">
              <input
                id="confirm-password-input"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmit();
                }}
                className="w-full px-3 py-3 pr-10 bg-celeste-dark-tertiary border border-celeste-dark-hover rounded-md text-celeste-text-primary placeholder-celeste-text-muted focus:outline-none focus:ring-2 focus:ring-celeste-brand-primary focus:border-transparent transition-all"
                autoComplete="new-password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-celeste-text-muted hover:text-celeste-text-secondary transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 text-celeste-system-error text-sm bg-celeste-system-error/10 border border-celeste-system-error/30 rounded-md p-3">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span className="whitespace-pre-wrap">{error}</span>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isLoading || !email || !password || (isSignup && !confirmPassword)}
            className="w-full bg-gradient-to-r from-celeste-brand-primary to-celeste-brand-accent text-white py-3 rounded-md font-semibold hover:opacity-90 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              isSignup ? 'Create Account' : 'Begin Your Journey'
            )}
          </button>

          <div className="text-center">
            <button
              onClick={toggleMode}
              className="text-sm text-celeste-text-muted hover:text-celeste-text-secondary transition-colors"
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

// Typing Indicator Component
const TypingIndicator = () => (
  <div className="message-wrapper assistant">
    <div className="message-content">
      <div className="message-avatar assistant">C</div>
      <div className="message-text">
        <div className="typing-indicator">
          <span className="typing-dot"></span>
          <span className="typing-dot"></span>
          <span className="typing-dot"></span>
        </div>
      </div>
    </div>
  </div>
);

// Error Message Component with Countdown
const ErrorMessage = ({ error, onRetry, onDismiss }) => {
  const [countdown, setCountdown] = useState(error?.retryAfter || 0);
  
  useEffect(() => {
    if (!error?.retryAfter) return;
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [error?.retryAfter]);

  const getErrorStyles = () => {
    if (error?.type === 'token_limit') return 'bg-celeste-system-warning/10 border-celeste-system-warning/30 text-celeste-system-warning';
    if (error?.type === 'rate_limit') return 'bg-celeste-system-error/10 border-celeste-system-error/30 text-celeste-system-error';
    if (error?.type === 'success') return 'bg-celeste-system-success/10 border-celeste-system-success/30 text-celeste-system-success';
    return 'bg-celeste-dark-tertiary border-celeste-dark-hover text-celeste-text-secondary';
  };

  return (
    <div className={`mx-auto max-w-md p-4 border rounded-lg ${getErrorStyles()}`}>
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle size={16} />
        <span className="font-medium">{error?.title || 'Error'}</span>
      </div>
      <p className="text-sm">{error?.message}</p>
      {countdown > 0 && (
        <div className="mt-2 flex items-center gap-2">
          <Clock size={14} />
          <span className="text-sm">Retry in {countdown} seconds</span>
        </div>
      )}
      {error?.resetTime && (
        <p className="text-xs mt-1 opacity-75">
          Resets at {new Date(error.resetTime).toLocaleTimeString()}
        </p>
      )}
      <div className="flex gap-2 mt-3">
        {countdown === 0 && onRetry && (
          <button 
            onClick={onRetry}
            className="px-3 py-1 text-xs bg-celeste-brand-primary text-white rounded hover:bg-celeste-brand-hover transition-colors"
          >
            Retry Now
          </button>
        )}
        <button 
          onClick={onDismiss}
          className="px-3 py-1 text-xs bg-celeste-dark-hover text-celeste-text-secondary rounded hover:bg-celeste-dark-active transition-colors"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};

// Message Actions Component
const MessageActions = ({ message, onCopy, onEdit, onRegenerate, isLastAiMessage }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(message.text);
    if (success) {
      setCopied(true);
      onCopy && onCopy();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="message-actions">
      <button onClick={handleCopy} className="action-button">
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? 'Copied!' : 'Copy'}
      </button>
      
      {message.isUser && (
        <button onClick={() => onEdit(message)} className="action-button">
          <Edit3 size={14} />
          Edit
        </button>
      )}
      
      {!message.isUser && isLastAiMessage && (
        <button onClick={() => onRegenerate(message)} className="action-button">
          <RefreshCw size={14} />
          Regenerate
        </button>
      )}
    </div>
  );
};

// Main Chat Interface Component - COMPLETE VERSION
const ChatInterface = ({ user, onLogout }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [tokensRemaining, setTokensRemaining] = useState(50000);
  const [userStage, setUserStage] = useState('exploring');
  const [isGenerating, setIsGenerating] = useState(false);
  const [abortController, setAbortController] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  
  // User data from cache
  const [userProfile, setUserProfile] = useState(null);
  const [userPatterns, setUserPatterns] = useState(null);
  const [businessMetrics, setBusinessMetrics] = useState(null);
  const [cacheLoading, setCacheLoading] = useState(true);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const resizeTimeoutRef = useRef(null);

  // Get session ID
  const sessionId = sessionStorage.getItem('celesteos_session_id') || `session_${user.id}_${Date.now()}`;
  
  // Set session ID if not exists
  useEffect(() => {
    if (!sessionStorage.getItem('celesteos_session_id')) {
      sessionStorage.setItem('celesteos_session_id', sessionId);
    }
  }, [sessionId]);

  // Dark mode management
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [isDarkMode]);

  // Word-by-word streaming function - ENHANCED
  const streamMessage = useCallback((fullText, messageId, conversationId) => {
    // Clear any existing interval for this message
    if (streamingIntervals.has(messageId)) {
      clearInterval(streamingIntervals.get(messageId));
    }

    const words = fullText.split(' ');
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      if (currentIndex < words.length) {
        const currentText = words.slice(0, currentIndex + 1).join(' ');
        
        // Update both conversations and activeConversation
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: conv.messages.map(msg => 
                    msg.id === messageId 
                      ? { 
                          ...msg, 
                          text: currentText,
                          isThinking: false,
                          isStreaming: true
                        }
                      : msg
                  )
                }
              : conv
          )
        );
        
        setActiveConversation(prev => 
          prev && prev.id === conversationId
            ? {
                ...prev,
                messages: prev.messages.map(msg => 
                  msg.id === messageId 
                    ? { 
                        ...msg, 
                        text: currentText,
                        isThinking: false,
                        isStreaming: true
                      }
                    : msg
                )
              }
            : prev
        );
        
        currentIndex++;
      } else {
        // Mark streaming as complete
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: conv.messages.map(msg => 
                    msg.id === messageId 
                      ? { ...msg, isStreaming: false }
                      : msg
                  )
                }
              : conv
          )
        );
        
        setActiveConversation(prev => 
          prev && prev.id === conversationId
            ? {
                ...prev,
                messages: prev.messages.map(msg => 
                  msg.id === messageId 
                    ? { ...msg, isStreaming: false }
                    : msg
                )
              }
            : prev
        );
        
        clearInterval(interval);
        setStreamingIntervals(prev => {
          const newMap = new Map(prev);
          newMap.delete(messageId);
          return newMap;
        });
      }
    }, 50); // 50ms between words

    setStreamingIntervals(prev => new Map(prev).set(messageId, interval));
  }, [streamingIntervals]);

  // Clear streaming when component unmounts
  useEffect(() => {
    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  // Load user data from cache
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return;
      
      setCacheLoading(true);
      console.log('🔄 Loading user data from cache...');
      
      try {
        // Preload session data in background
        cacheService.preloadUserSession(user.id);
        
        // Load critical user data
        const [profileData, patternsData, businessData] = await Promise.all([
          cacheService.getUserProfile(user.id),
          cacheService.getUserPatterns(user.id),
          cacheService.getBusinessMetrics(user.id, 'finance')
        ]);
        
        if (profileData?.data) {
          setUserProfile(profileData.data[0] || null);
          console.log('✅ User profile loaded from cache');
        }
        
        if (patternsData?.data) {
          setUserPatterns(patternsData.data);
          console.log('✅ User patterns loaded from cache');
        }
        
        if (businessData?.data) {
          setBusinessMetrics(businessData.data);
          console.log('✅ Business metrics loaded from cache');
        }
        
        // Update user stage and tokens from profile if available
        if (profileData?.data?.[0]) {
          const profile = profileData.data[0];
          setUserStage(profile.stage || 'exploring');
          setTokensRemaining(profile.tokens_remaining || 50000);
        }
        
      } catch (error) {
        console.error('❌ Error loading user data from cache:', error);
      } finally {
        setCacheLoading(false);
      }
    };
    
    loadUserData();
  }, [user?.id]);

  // Load saved conversations with cache integration
  useEffect(() => {
    const loadSavedConversations = async () => {
      if (!user?.id) return;
      
      try {
        // Try to load conversation history from cache
        const conversationData = await cacheService.getCachedData(user.id, 'user_conversations');
        
        if (conversationData?.data) {
          setConversations(conversationData.data);
          console.log('✅ Conversations loaded from cache');
        } else {
          // Fallback to localStorage if cache fails
          const saved = localStorage.getItem(`celesteos_conversations_${user.id}`);
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              setConversations(parsed);
            } catch (e) {
              console.error('Failed to parse saved conversations:', e);
            }
          }
        }
      } catch (error) {
        console.error('❌ Error loading conversations:', error);
      }
    };
    
    loadSavedConversations();
  }, [user?.id]);

  // Save conversations to cache and localStorage
  const saveConversations = useCallback(async (newConversations) => {
    if (!user?.id) return;
    
    // Save to localStorage immediately (fast, reliable)
    localStorage.setItem(`celesteos_conversations_${user.id}`, JSON.stringify(newConversations));
    
    // Update cache in background (don't block UI)
    try {
      await cacheService.updateCacheAfterModification(user.id, 'user_conversations', {
        data: newConversations,
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.log('⚠️ Failed to update conversation cache:', error);
    }
  }, [user?.id]);

  // Sorted conversations
  const sortedConversations = useMemo(() => 
    [...conversations].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)),
    [conversations]
  );

  // Mobile sidebar handling
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

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }, [activeConversation?.messages?.length]);

  // Textarea auto-resize
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

  // Create new conversation
  const createNewConversation = useCallback(() => {
    const newConv = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: 'New chat',
      messages: [],
      timestamp: Date.now()
    };
    
    const updatedConversations = [newConv, ...conversations];
    setConversations(updatedConversations);
    setActiveConversation(newConv);
    setSidebarOpen(false);
    
    // Save to cache/storage
    saveConversations(updatedConversations);
  }, [conversations, saveConversations]);

  // Send message
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
    setIsGenerating(true);
    setError(null);
    setConnectionError(false);

    const userMessage = {
      id: `msg_${Date.now()}_user`,
      text: trimmedMessage,
      isUser: true,
      timestamp: Date.now()
    };

    const aiMessage = {
      id: `msg_${Date.now()}_ai_${Math.random().toString(36).substr(2, 9)}`,
      text: '',
      isUser: false,
      isThinking: true,
      isStreaming: false,
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
    setEditingMessage(null);

    // Create abort controller for this request
    const controller = new AbortController();
    setAbortController(controller);

    try {
      const result = await sendRequestWithRetry(API_CONFIG.endpoints.chat, {
        userId: user.id,
        userName: user.name || user.displayName,
        message: trimmedMessage,
        chatId: currentConversation.id,
        sessionId: sessionId,
        timestamp: new Date().toISOString()
      }, { maxRetries: 1, timeout: 30000, signal: controller.signal });
      
      if (result.success) {
        // Handle array response format
        const responseData = Array.isArray(result.data) ? result.data[0] : result.data;
        
        if (!responseData) {
          throw new Error('Empty response from server');
        }
        
        // Extract data from response
        const aiResponseText = responseData.response || 
          responseData.message || 
          responseData.text ||
          "I'm processing your request. Let me help you transform your patterns into profits.";
        
        // Update token information from metadata
        if (responseData.metadata) {
          setTokensRemaining(responseData.metadata.tokensRemaining || tokensRemaining);
          setUserStage(responseData.metadata.stage || userStage);
          
          // Update user profile cache with new token count
          if (responseData.metadata.tokensRemaining !== tokensRemaining) {
            try {
              await cacheService.updateCacheAfterModification(user.id, 'user_personalization', {
                ...userProfile,
                tokens_remaining: responseData.metadata.tokensRemaining,
                stage: responseData.metadata.stage,
                updated_at: new Date().toISOString()
              });
            } catch (error) {
              console.log('⚠️ Failed to update profile cache:', error);
            }
          }
        }
        
        const isRecovered = responseData.metadata?.recovered || 
                          responseData.metadata?.fallback ||
                          responseData.metadata?.tokensUsed === 0;
        
        // Update conversation to remove thinking state
        const finalConv = {
          ...updatedConv,
          messages: updatedConv.messages.map(msg => 
            msg.id === aiMessage.id 
              ? { 
                  ...msg, 
                  text: '',
                  isThinking: false,
                  isRecovered,
                  isStreaming: true,
                  category: responseData.metadata?.category,
                  metadata: responseData.metadata
                }
              : msg
          )
        };

        setActiveConversation(finalConv);
        
        // Start streaming the response
        streamMessage(aiResponseText, aiMessage.id, currentConversation.id);
        
        // Save conversations
        const updatedConversations = conversations.map(c => 
          c.id === currentConversation.id ? finalConv : c
        );
        saveConversations(updatedConversations);
        
        // Save to sessionStorage for this specific chat
        sessionStorage.setItem(`chat_${currentConversation.id}`, JSON.stringify({
          messages: finalConv.messages,
          lastUpdated: Date.now(),
          metadata: {
            tokensRemaining,
            stage: userStage,
            userName: user.name || user.displayName
          }
        }));
        
        if (isRecovered) {
          console.warn('Recovered from AI error, used fallback response');
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request was aborted by user');
        return;
      }
      
      console.error('Message send failed:', error);
      setConnectionError(true);
      setError({
        type: 'network_error',
        title: 'Connection Issue',
        message: 'Check your internet and try again.',
        retryAfter: 0
      });
      
      const errorConv = {
        ...updatedConv,
        messages: updatedConv.messages.filter(m => m.id !== aiMessage.id)
      };
      setActiveConversation(errorConv);
      const updatedConversations = conversations.map(c => c.id === currentConversation.id ? errorConv : c);
      setConversations(updatedConversations);
      
      // Save to cache/storage
      saveConversations(updatedConversations);
    } finally {
      setIsSending(false);
      setIsGenerating(false);
      setAbortController(null);
    }
  }, [message, activeConversation, isSending, user, sessionId, tokensRemaining, userStage, streamMessage, clearAllStreaming, conversations, userProfile, saveConversations, editingMessage]);

  // Stop generation function
  const stopGeneration = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setIsGenerating(false);
      setIsSending(false);
      setAbortController(null);
    }
  }, [abortController]);

  // Message action handlers
  const handleCopyMessage = useCallback((message) => {
    // Could add toast notification here
    console.log('Message copied:', message.text.substring(0, 50) + '...');
  }, []);

  const handleEditMessage = useCallback((message) => {
    setEditingMessage(message);
    setMessage(message.text);
    textareaRef.current?.focus();
  }, []);

  const handleRegenerateMessage = useCallback(async (message) => {
    if (!activeConversation || isSending) return;
    
    // Find the user message that preceded this AI message
    const messageIndex = activeConversation.messages.findIndex(m => m.id === message.id);
    if (messageIndex <= 0) return;
    
    const userMessage = activeConversation.messages[messageIndex - 1];
    if (!userMessage.isUser) return;
    
    // Remove the AI message and regenerate
    const updatedMessages = activeConversation.messages.slice(0, messageIndex);
    const updatedConv = {
      ...activeConversation,
      messages: updatedMessages
    };
    
    setActiveConversation(updatedConv);
    setConversations(prev => 
      prev.map(c => c.id === activeConversation.id ? updatedConv : c)
    );
    
    // Trigger regeneration by "sending" the user message again
    setMessage(userMessage.text);
    // Use a small delay to ensure state updates
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  }, [activeConversation, isSending, handleSendMessage]);

  // Load chat from sessionStorage
  const loadChat = useCallback((chatId) => {
    const saved = sessionStorage.getItem(`chat_${chatId}`);
    if (saved) {
      try {
        const { messages, metadata } = JSON.parse(saved);
        if (metadata) {
          setTokensRemaining(metadata.tokensRemaining || 50000);
          setUserStage(metadata.stage || 'exploring');
        }
        return messages;
      } catch (e) {
        console.error('Failed to load chat:', e);
      }
    }
    return [];
  }, []);

  // Get category styles for messages
  const getCategoryStyles = (category) => {
    const categoryStyles = {
      sales: { borderLeft: '3px solid #10b981' },
      marketing: { borderLeft: '3px solid #8b5cf6' },
      operations: { borderLeft: '3px solid #3b82f6' },
      finance: { borderLeft: '3px solid #f59e0b' },
      mindset: { borderLeft: '3px solid #ec4899' },
      strategy: { borderLeft: '3px solid #f97316' }
    };
    return categoryStyles[category] || {};
  };

  // Delete conversation
  const deleteConversation = useCallback((convId, e) => {
    e?.stopPropagation();
    const updatedConversations = conversations.filter(c => c.id !== convId);
    setConversations(updatedConversations);
    
    if (activeConversation?.id === convId) {
      setActiveConversation(null);
    }
    
    // Save to cache/storage
    saveConversations(updatedConversations);
  }, [conversations, activeConversation, saveConversations]);

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div id="sidebar" className={`sidebar ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Logo */}
        <div className="p-4 border-b border-celeste-dark-hover">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-celeste-brand-primary to-celeste-brand-accent rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <h2 className="text-lg font-semibold text-celeste-text-primary">
              Celeste<span className="bg-gradient-to-r from-celeste-brand-primary to-celeste-brand-accent bg-clip-text text-transparent">OS</span>
            </h2>
          </div>
          <div className="text-sm text-celeste-text-muted mt-1">
            Transform your patterns into profits
          </div>
        </div>

        {/* New chat button */}
        <button onClick={createNewConversation} className="new-chat-btn">
          <Plus size={16} />
          New chat
        </button>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto">
          <div className="pb-2">
            {sortedConversations.length === 0 ? (
              <div className="text-center text-sm mt-8 px-4 text-celeste-text-muted">
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
                  className={`conversation-item group ${activeConversation?.id === conv.id ? 'active' : ''}`}
                >
                  <MessageSquare size={16} className="flex-shrink-0" />
                  <span className="flex-1 truncate">{conv.title}</span>
                  <button
                    onClick={(e) => deleteConversation(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-celeste-dark-active transition-all"
                    aria-label="Delete conversation"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-celeste-dark-hover">
          {/* Theme toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-celeste-text-secondary hover:bg-celeste-dark-hover transition-colors"
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            <span className="flex-1 text-left">{isDarkMode ? 'Light mode' : 'Dark mode'}</span>
          </button>
          
          {/* User section */}
          <button
            onClick={() => setShowProfilePanel(true)}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-celeste-text-secondary hover:bg-celeste-dark-hover transition-colors"
          >
            <Settings size={16} />
            <span className="flex-1 text-left">Profile & Data</span>
          </button>
          
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-celeste-text-secondary hover:bg-celeste-dark-hover transition-colors"
          >
            <User size={16} />
            <span className="flex-1 text-left truncate">{user.email}</span>
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile menu toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-celeste-dark-secondary hover:bg-celeste-dark-hover md:hidden"
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <X size={24} className="text-celeste-text-primary" /> : <Menu size={24} className="text-celeste-text-primary" />}
      </button>

      {/* Main chat area */}
      <div className="chat-main">
        {/* Header with token counter and user info */}
        <div className="border-b border-celeste-dark-hover p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            {/* Token display */}
            <div className="flex items-center gap-4">
              <div className="md:hidden">
                <h1 className="text-xl font-semibold text-celeste-text-primary">
                  Celeste<span className="bg-gradient-to-r from-celeste-brand-primary to-celeste-brand-accent bg-clip-text text-transparent">OS</span>
                </h1>
              </div>
              <div className="hidden md:flex items-center gap-3">
                <span className="text-sm font-medium text-celeste-text-secondary">
                  {tokensRemaining.toLocaleString()} tokens today
                </span>
                <div className="w-24 h-2 rounded-full overflow-hidden bg-celeste-dark-hover">
                  <div 
                    className="h-full bg-gradient-to-r from-celeste-brand-primary to-celeste-brand-accent transition-all duration-300"
                    style={{ width: `${Math.max(0, (tokensRemaining / 50000) * 100)}%` }}
                  />
                </div>
                {cacheLoading && (
                  <div className="text-xs flex items-center gap-1 text-celeste-text-muted">
                    <div className="w-3 h-3 border border-celeste-brand-primary border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </div>
                )}
              </div>
            </div>
            
            {/* User info */}
            <div className="flex items-center gap-2">
              <span className="text-sm capitalize text-celeste-text-muted">{userStage}</span>
              <span className="hidden md:inline text-sm font-medium text-celeste-text-secondary">
                {userProfile?.display_name || user.name || user.displayName}
              </span>
              {/* Cache refresh button */}
              <button
                onClick={async () => {
                  setCacheLoading(true);
                  try {
                    await cacheService.refreshUserData(user.id);
                    // Reload user data
                    const profileData = await cacheService.getUserProfile(user.id, false);
                    if (profileData?.data?.[0]) {
                      setUserProfile(profileData.data[0]);
                      setUserStage(profileData.data[0].stage || 'exploring');
                      setTokensRemaining(profileData.data[0].tokens_remaining || 50000);
                    }
                  } catch (error) {
                    console.error('Failed to refresh cache:', error);
                  } finally {
                    setCacheLoading(false);
                  }
                }}
                className="p-1 transition-colors text-celeste-text-muted hover:text-celeste-text-secondary"
                title="Refresh user data"
              >
                <RefreshCw size={14} className={cacheLoading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </div>

        {/* Messages container */}
        <div className="messages-container">
          {!activeConversation || activeConversation.messages?.length === 0 ? (
            <div className="h-full flex items-center justify-center p-4">
              <div className="text-center max-w-2xl mx-auto">
                <h1 className="text-4xl font-semibold mb-4 text-celeste-text-primary">
                  Celeste<span className="bg-gradient-to-r from-celeste-brand-primary to-celeste-brand-accent bg-clip-text text-transparent">OS</span>
                </h1>
                <p className="mb-8 text-celeste-text-muted">Your success inevitability engine</p>
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
                      className="p-4 rounded-md border border-celeste-dark-hover text-sm transition-all text-left text-celeste-text-secondary hover:bg-celeste-dark-hover hover:text-celeste-text-primary hover:border-celeste-dark-active"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="pb-32">
              {activeConversation.messages.map((msg, index) => {
                const isLastAiMessage = !msg.isUser && 
                  index === activeConversation.messages.length - 1;
                
                return (
                  <div key={msg.id}>
                    <div className={`message-wrapper ${msg.isUser ? 'user' : 'assistant'}`}>
                      <div className="message-content">
                        {/* Avatar */}
                        <div className={`message-avatar ${msg.isUser ? 'user' : 'assistant'}`}>
                          {msg.isUser ? (user.name?.[0]?.toUpperCase() || user.displayName?.[0]?.toUpperCase() || 'U') : 'C'}
                        </div>
                        
                        {/* Message text */}
                        <div className="message-text">
                          {msg.isThinking ? (
                            <TypingIndicator />
                          ) : (
                            <>
                              <div className={`${msg.category ? `category-${msg.category}` : ''} ${msg.isStreaming ? 'message-streaming' : ''}`}>
                                {msg.isUser ? (
                                  <div className="message-bubble user">
                                    {msg.text}
                                  </div>
                                ) : (
                                  <div className="markdown-content">
                                    <ReactMarkdown
                                      components={{
                                        p: ({children}) => <p className="mb-4 last:mb-0">{children}</p>,
                                        h1: ({children}) => <h1 className="text-chat-2xl font-semibold mb-4 mt-6 first:mt-0 pb-2 border-b border-celeste-dark-hover">{children}</h1>,
                                        h2: ({children}) => <h2 className="text-chat-xl font-semibold mb-3 mt-5 first:mt-0">{children}</h2>,
                                        h3: ({children}) => <h3 className="text-chat-lg font-semibold mb-2 mt-4 first:mt-0">{children}</h3>,
                                        ul: ({children}) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
                                        ol: ({children}) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
                                        li: ({children}) => <li className="leading-relaxed">{children}</li>,
                                        strong: ({children}) => <strong className="font-semibold text-celeste-text-primary">{children}</strong>,
                                        em: ({children}) => <em className="italic">{children}</em>,
                                        code: ({inline, children}) => 
                                          inline ? (
                                            <code className="px-1.5 py-0.5 bg-celeste-dark-tertiary text-celeste-text-primary rounded text-sm font-mono">{children}</code>
                                          ) : (
                                            <code className="block">{children}</code>
                                          ),
                                        pre: ({children}) => (
                                          <pre className="bg-celeste-dark-secondary border border-celeste-dark-hover rounded-lg p-4 mb-4 overflow-x-auto">
                                            {children}
                                          </pre>
                                        ),
                                        blockquote: ({children}) => (
                                          <blockquote className="border-l-3 border-celeste-brand-primary pl-4 my-4 italic text-celeste-text-muted">
                                            {children}
                                          </blockquote>
                                        ),
                                        hr: () => <hr className="my-6 border-celeste-dark-hover" />,
                                        a: ({href, children}) => (
                                          <a href={href} className="text-celeste-brand-primary hover:text-celeste-brand-hover underline" target="_blank" rel="noopener noreferrer">
                                            {children}
                                          </a>
                                        ),
                                      }}
                                    >
                                      {msg.text}
                                    </ReactMarkdown>
                                  </div>
                                )}
                              </div>
                              
                              {/* Message actions */}
                              {!msg.isThinking && !msg.isStreaming && (
                                <MessageActions
                                  message={msg}
                                  onCopy={handleCopyMessage}
                                  onEdit={handleEditMessage}
                                  onRegenerate={handleRegenerateMessage}
                                  isLastAiMessage={isLastAiMessage}
                                />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Add separator after each message group */}
                    {index < activeConversation.messages.length - 1 && 
                     activeConversation.messages[index + 1].isUser !== msg.isUser && (
                      <hr className="message-separator" />
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Error messages */}
        {error && (
          <div className="mx-4 mb-2">
            <div className="max-w-4xl mx-auto">
              <ErrorMessage 
                error={error}
                onRetry={() => {
                  setError(null);
                  if (activeConversation?.messages?.length > 0) {
                    const lastUserMessage = [...activeConversation.messages].reverse().find(m => m.isUser);
                    if (lastUserMessage) {
                      setMessage(lastUserMessage.text);
                      setTimeout(handleSendMessage, 100);
                    }
                  }
                }}
                onDismiss={() => setError(null)}
              />
            </div>
          </div>
        )}

        {/* Stop generation button */}
        {isGenerating && (
          <div className="mx-4 mb-2">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={stopGeneration}
                className="flex items-center gap-2 px-4 py-2 bg-celeste-system-error text-white rounded-lg hover:bg-celeste-system-error/90 transition-colors"
              >
                <StopCircle size={16} />
                Stop generating
              </button>
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="input-container">
          <div className="input-wrapper">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="input-form"
            >
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (editingMessage) {
                      // Handle edit submission
                      setEditingMessage(null);
                      handleSendMessage();
                    } else {
                      handleSendMessage();
                    }
                  }
                }}
                placeholder={
                  editingMessage 
                    ? "Edit your message..." 
                    : activeConversation 
                    ? "Send a message..." 
                    : "Start your transformation..."
                }
                className="chat-input"
                rows={1}
                disabled={isSending}
                onInput={handleTextareaResize}
              />
              <button
                type="submit"
                disabled={!message.trim() || isSending}
                className="send-button"
              >
                {isSending ? (
                  <div className="loading-spinner" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </form>
            
            {editingMessage && (
              <div className="mt-2 flex items-center gap-2 text-sm text-celeste-text-muted">
                <Edit3 size={14} />
                <span>Editing message</span>
                <button
                  onClick={() => {
                    setEditingMessage(null);
                    setMessage('');
                  }}
                  className="text-celeste-brand-primary hover:text-celeste-brand-hover"
                >
                  Cancel
                </button>
              </div>
            )}
            
            <div className="token-counter">
              CelesteOS transforms patterns into profits • {tokensRemaining.toLocaleString()} tokens remaining
            </div>
          </div>
        </div>
      </div>
      
      {/* User Profile Panel */}
      <UserProfilePanel 
        user={user}
        isOpen={showProfilePanel}
        onClose={() => setShowProfilePanel(false)}
      />
      
      {/* Debug Panel for Webhook Debugging */}
      <DebugPanel isDarkMode={isDarkMode} />
    </div>
  );
};

// Export components
const Components = {
  AuthScreen,
  ChatInterface
};

export default Components;
