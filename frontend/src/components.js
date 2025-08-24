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
import { SolutionCard } from './components/SolutionCard';
import { GuidedPrompts } from './components/GuidedPrompts';
import { EnhancedEmptyState } from './components/UIEnhancements';
import ConversationCard from './components/ConversationCard';
// Phase 1: Removed EnhancedSolutionCard - webhook doesn't return solutions
import './styles/enhancements.css';
import { CleanChatInput } from './components/CleanChatInput';
import { CleanHeader } from './components/CleanHeader';
import { CleanSidebar } from './components/CleanSidebar';
import { CleanMessages } from './components/CleanMessages';
import { UpdateUXHeader } from './components/UpdateUXHeader';
import { UpdateUXWelcome } from './components/UpdateUXWelcome';
import { UpdateUXChatArea } from './components/UpdateUXChatArea';
import { UpdateUXInput } from './components/UpdateUXInput';
import { DESIGN_TOKENS } from './styles/design-system';
import { logWebhookResponse } from './utils/webhookLogger'; // Phase 1: Logging
import AnimatedIntro from './pages/AnimatedIntro'; // Phase 2: Animated intro
import AskAlex from './pages/AskAlex'; // Phase 2: Ask Alex FAQ

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
      return { strength: 0, text: 'Too weak (common password)', color: 'text-red-500' };
    }
    
    if (score <= 2) {
      return { strength: score, text: `Weak (needs: ${feedback.slice(0, 2).join(', ')})`, color: 'text-red-500' };
    } else if (score <= 3) {
      return { strength: score, text: 'Fair', color: 'text-yellow-500' };
    } else if (score <= 4) {
      return { strength: score, text: 'Good', color: 'text-green-500' };
    } else {
      return { strength: score, text: 'Strong', color: 'text-green-500' };
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-text-primary">
              Celeste<span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">OS</span>
            </h1>
          </div>
          
          <div className="bg-green-500/10 border border-green-500/30 rounded-md p-6 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-green-500 mb-2">Account created successfully!</h3>
            <p className="text-green-500/80 mb-4">Welcome to CelesteOS! Your account is ready to use.</p>
            <p className="text-sm text-green-500/60 mb-6">Redirecting you to login in a few seconds...</p>
            
            <button
              onClick={() => {
                setSignupSuccess(false);
                setIsSignup(false);
                setEmail('');
                setPassword('');
              }}
              className="bg-accent hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Continue to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-text-primary">
            Celeste<span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">OS</span>
          </h1>
          <p className="text-text-muted mt-2">Your success inevitability engine</p>
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
              className="w-full px-3 py-3 bg-input-bg border border-input-border rounded-sm border border-border rounded-md text-text-primary placeholder-celeste-text-muted focus:outline-none focus:ring-2 focus:ring-celeste-brand-primary focus:border-transparent transition-all"
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
            className="w-full px-3 py-3 bg-input-bg border border-input-border rounded-sm border border-border rounded-md text-text-primary placeholder-celeste-text-muted focus:outline-none focus:ring-2 focus:ring-celeste-brand-primary focus:border-transparent transition-all"
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
              className="w-full px-3 py-3 pr-10 bg-input-bg border border-input-border rounded-sm border border-border rounded-md text-text-primary placeholder-celeste-text-muted focus:outline-none focus:ring-2 focus:ring-celeste-brand-primary focus:border-transparent transition-all"
              autoComplete={isSignup ? "new-password" : "current-password"}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
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
                className="w-full px-3 py-3 pr-10 bg-input-bg border border-input-border rounded-sm border border-border rounded-md text-text-primary placeholder-celeste-text-muted focus:outline-none focus:ring-2 focus:ring-celeste-brand-primary focus:border-transparent transition-all"
                autoComplete="new-password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 text-red-500 text-sm bg-celeste-system-error/10 border border-celeste-system-error/30 rounded-md p-3">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span className="whitespace-pre-wrap">{error}</span>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isLoading || !email || !password || (isSignup && !confirmPassword)}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-md font-semibold hover:opacity-90 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
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
              className="text-sm text-text-muted hover:text-text-secondary transition-colors"
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
    if (error?.type === 'token_limit') return 'bg-celeste-system-warning/10 border-celeste-system-warning/30 text-yellow-500';
    if (error?.type === 'rate_limit') return 'bg-celeste-system-error/10 border-celeste-system-error/30 text-red-500';
    if (error?.type === 'success') return 'bg-green-500/10 border-green-500/30 text-green-500';
    return 'bg-input-bg border border-input-border rounded-sm border-border text-text-secondary';
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
            className="px-3 py-1 text-xs bg-accent text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry Now
          </button>
        )}
        <button 
          onClick={onDismiss}
          className="px-3 py-1 text-xs bg-background border border-border rounded-md shadow-sm hover:bg-glass-hover text-text-secondary rounded hover:bg-celeste-dark-active transition-colors"
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
const ChatInterface = ({ user, onLogout, onAskAlex }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); // Default to light mode to match static site
  const [tokensRemaining, setTokensRemaining] = useState(50000);
  const [userStage, setUserStage] = useState('exploring');
  const [isGenerating, setIsGenerating] = useState(false);
  const [abortController, setAbortController] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [streamingIntervals, setStreamingIntervals] = useState(new Map()); // FIX: Added missing state
  const [selectedSearchType, setSelectedSearchType] = useState('yacht'); // Search type state integration
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // Responsive mobile detection
  
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

  // Clear streaming when component unmounts - FIX: Properly clean up intervals
  useEffect(() => {
    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      // Clear all streaming intervals on unmount
      streamingIntervals.forEach(interval => clearInterval(interval));
    };
  }, [streamingIntervals]);

  // Load user data from cache - DISABLED for yacht AI
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return;
      
      // YACHT AI: Skip cache loading - not needed
      console.log('🚢 Yacht AI Mode: Cache disabled, using direct webhook responses only');
      setCacheLoading(false);
      
      // Set default values without cache calls
      setUserStage('active');
      setTokensRemaining(50000);
      setUserProfile(null);
      setUserPatterns([]);
      setBusinessMetrics([]);
      
      // For yacht AI, all data comes from yacht-specific webhooks
      // No need for /get-data endpoint
    };
    
    loadUserData();
  }, [user?.id]);

  // Load saved conversations - YACHT AI: Using localStorage only
  useEffect(() => {
    const loadSavedConversations = async () => {
      if (!user?.id) return;
      
      try {
        // YACHT AI: Skip cache, use localStorage directly
        const saved = localStorage.getItem(`celesteos_conversations_${user.id}`);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setConversations(parsed);
            console.log('🚢 Yacht AI: Conversations loaded from localStorage');
          } catch (e) {
            console.error('Failed to parse saved conversations:', e);
          }
        }
      } catch (error) {
        console.error('❌ Error loading conversations:', error);
      }
    };
    
    loadSavedConversations();
  }, [user?.id]);

  // Save conversations - YACHT AI: localStorage only
  const saveConversations = useCallback(async (newConversations) => {
    if (!user?.id) return;
    
    // YACHT AI: Save to localStorage only (no cache)
    localStorage.setItem(`celesteos_conversations_${user.id}`, JSON.stringify(newConversations));
    console.log('🚢 Yacht AI: Conversations saved to localStorage');
  }, [user?.id]);

  // Sorted conversations
  const sortedConversations = useMemo(() => 
    [...conversations].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)),
    [conversations]
  );

  // Mobile responsive detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        searchType: selectedSearchType, // Include search type for context-aware responses
        timestamp: new Date().toISOString()
      }, { maxRetries: 1, timeout: 30000, signal: controller.signal });
      
      if (result.success) {
        // Handle array response format
        const responseData = Array.isArray(result.data) ? result.data[0] : result.data;
        
        if (!responseData) {
          throw new Error('Empty response from server');
        }
        
        // Handle both old maritime format and new yacht AI format
        let aiResponseText, solutions, responseSources, confidence, processingTime, metadata;
        
        // Phase 1: Log webhook response for analysis
        logWebhookResponse(responseData);
        
        // Log the raw response for debugging
        console.log('🔍 Webhook Response Structure:', {
          hasResponse: !!responseData.response,
          responseType: typeof responseData.response,
          hasSuccess: responseData.response?.success,
          hasSolutions: !!(responseData.response?.solutions),
          solutionsCount: responseData.response?.solutions?.length || 0,
          hasMessage: !!(responseData.response?.message || responseData.message),
          rawData: responseData
        });
        
        // Check if this is the new yacht AI format with nested response object
        if (responseData.response && typeof responseData.response === 'object' && responseData.response.success !== undefined) {
          // New yacht AI format
          console.log('✅ Detected Yacht AI format with solutions');
          const yachtResponse = responseData.response;
          aiResponseText = yachtResponse.message || "I'm analyzing your yacht systems...";
          solutions = yachtResponse.solutions || [];
          responseSources = yachtResponse.sources || [];
          confidence = yachtResponse.confidence_score;
          metadata = yachtResponse.metadata || {};
          processingTime = metadata.processing_time_ms;
          
          // Log solution cards if present
          if (solutions.length > 0) {
            console.log(`📋 Found ${solutions.length} solution card(s):`, solutions);
          }
          
          // Extract yacht-specific fields
          const queryId = yachtResponse.query_id;
          const yachtId = metadata.yacht_id;
          const intent = metadata.intent;
          const entitiesFound = metadata.entities_found;
          const patternsIdentified = metadata.patterns_identified;
          const tokensUsed = metadata.tokens_used;
          const searchPerformed = metadata.search_performed;
          const documentsFound = metadata.documents_found;
          
        } else if (responseData.response?.answer) {
          // Old maritime format with response.answer
          aiResponseText = responseData.response.answer;
          solutions = [];
          responseSources = responseData.response?.sources || [];
          confidence = responseData.metadata?.confidence;
          processingTime = responseData.metrics?.processing_time_ms;
          metadata = responseData.metadata || {};
          
        } else {
          // Fallback for other formats
          aiResponseText = responseData.response || 
            responseData.message || 
            responseData.text ||
            "I'm processing your request. Let me help you with your yacht systems.";
          solutions = [];
          responseSources = [];
          confidence = responseData.metadata?.confidence;
          processingTime = responseData.metrics?.processing_time_ms;
          metadata = responseData.metadata || {};
        }
        
        // Extract additional response fields (keeping backward compatibility)
        const responseItems = responseData.response?.items || [];
        const responseReferences = responseData.response?.references || [];
        const responseSummary = responseData.response?.summary || '';
        
        // Extract metadata from various formats
        const queryId = responseData.query_id || responseData.response?.query_id;
        const conversationId = responseData.conversation_id || metadata.conversation_id;
        const intentType = responseData.intent_type || metadata.intent;
        const searchStrategy = responseData.search_strategy || metadata.search_strategy;
        
        // Update token information from metadata (keeping backward compatibility)
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
        
        // Update conversation to remove thinking state BEFORE streaming
        const preStreamConv = {
          ...updatedConv,
          messages: updatedConv.messages.map(msg => 
            msg.id === aiMessage.id 
              ? { 
                  ...msg, 
                  text: '',
                  isThinking: false,  // Stop showing typing indicator
                  isRecovered,
                  isStreaming: false,  // Not streaming yet
                  category: responseData.metadata?.category,
                  metadata: responseData.metadata,
                  // Add new response fields
                  queryId: queryId,
                  conversationId: conversationId,
                  intentType: intentType,
                  searchStrategy: searchStrategy,
                  confidence: confidence,
                  processingTime: processingTime,
                  items: responseItems,
                  sources: responseSources,
                  references: responseReferences,
                  summary: responseSummary,
                  // Add yacht AI solution cards
                  solutions: solutions,
                  yachtMetadata: metadata
                }
              : msg
          )
        };

        // Update state to hide typing indicator immediately
        setActiveConversation(preStreamConv);
        setConversations(prev => 
          prev.map(c => c.id === currentConversation.id ? preStreamConv : c)
        );

        // Small delay to ensure UI updates
        await new Promise(resolve => setTimeout(resolve, 50));

        const finalConv = preStreamConv;

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
  }, [message, activeConversation, isSending, user, sessionId, tokensRemaining, userStage, streamMessage, conversations, userProfile, saveConversations, editingMessage]);

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
    <div style={{ display: 'flex', height: '100vh', backgroundColor: DESIGN_TOKENS.colors.background }}>
      {/* Clean Sidebar */}
      <CleanSidebar
        user={user}
        conversations={sortedConversations}
        activeConversation={activeConversation}
        onNewConversation={createNewConversation}
        onSelectConversation={(conv) => {
          setActiveConversation(conv);
          setSidebarOpen(false);
        }}
        onDeleteConversation={(convId) => deleteConversation(convId)}
        onProfileClick={() => setShowProfilePanel(true)}
        onLogout={onLogout}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      {/* Main chat area */}
      <div style={{ 
        flex: 1,
        backgroundColor: DESIGN_TOKENS.colors.background,
        display: 'flex',
        flexDirection: 'column',
        marginLeft: sidebarOpen || !isMobile ? '280px' : '0'
      }}>
        {/* UPDATE UX Interface - Authentic Template */}
        {(!activeConversation || activeConversation.messages?.length === 0) ? (
          // Welcome State - Using UPDATE UX Template
          <UpdateUXWelcome
            isMobile={isMobile}
            displayName={userProfile?.display_name || user.name || user.displayName}
            isDarkMode={false}
            selectedModel="power"
            onModelChange={(modelId) => {
              console.log('Model changed to:', modelId);
              // Handle model change if needed
            }}
          />
        ) : (
          // Chat State - Using UPDATE UX Template  
          <UpdateUXChatArea
            messages={activeConversation.messages || []}
            user={user}
            isMobile={isMobile}
            isDarkMode={false}
            selectedModel="power"
            onModelChange={(modelId) => {
              console.log('Model changed to:', modelId);
              // Handle model change if needed
            }}
            messagesEndRef={messagesEndRef}
          />
        )}
        
        {/* Token status bar */}
        <div style={{
          padding: `${DESIGN_TOKENS.spacing.sm} ${DESIGN_TOKENS.spacing.lg}`,
          borderBottom: `1px solid ${DESIGN_TOKENS.colors.border}`,
          backgroundColor: DESIGN_TOKENS.colors.backgroundSecondary,
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: DESIGN_TOKENS.typography.sizes.caption,
            color: DESIGN_TOKENS.colors.text.secondary,
            fontFamily: DESIGN_TOKENS.typography.family
          }}>
            CelesteOS transforms patterns into profits • {tokensRemaining.toLocaleString()} tokens remaining
          </div>
        </div>

        {/* Error messages */}
        {error && (
          <div style={{ 
            padding: DESIGN_TOKENS.spacing.md,
            margin: DESIGN_TOKENS.spacing.md,
            backgroundColor: DESIGN_TOKENS.colors.error,
            color: '#ffffff',
            borderRadius: DESIGN_TOKENS.radius.md,
            border: `1px solid ${DESIGN_TOKENS.colors.border}`
          }}>
            <div style={{ maxWidth: '760px', margin: '0 auto' }}>
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
          <div style={{
            padding: DESIGN_TOKENS.spacing.md,
            textAlign: 'center'
          }}>
            <button
              onClick={stopGeneration}
              style={{
                ...DESIGN_TOKENS.createStyles?.button?.primary || {},
                backgroundColor: DESIGN_TOKENS.colors.error,
                display: 'inline-flex',
                alignItems: 'center',
                gap: DESIGN_TOKENS.spacing.sm
              }}
            >
              <StopCircle size={16} />
              Stop generating
            </button>
          </div>
        )}

        {/* UPDATE UX Input - Authentic Template with Search Intent */}
        <UpdateUXInput
          onStartChat={(msg, searchType) => {
            setMessage(msg);
            setSelectedSearchType(searchType);
            handleSendMessage();
          }}
          onSearchTypeChange={(searchType) => setSelectedSearchType(searchType)}
          isMobile={isMobile}
          isDarkMode={false}
          currentSearchType={selectedSearchType}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          isSending={isSending}
        />
            
        {editingMessage && (
          <div style={{
            marginTop: DESIGN_TOKENS.spacing.sm,
            display: 'flex',
            alignItems: 'center',
            gap: DESIGN_TOKENS.spacing.sm,
            fontSize: DESIGN_TOKENS.typography.sizes.body,
            color: DESIGN_TOKENS.colors.text.muted,
            padding: `0 ${DESIGN_TOKENS.spacing.lg}`
          }}>
            <Edit3 size={14} />
            <span>Editing message</span>
            <button
              onClick={() => {
                setEditingMessage(null);
                setMessage('');
              }}
              style={{
                color: DESIGN_TOKENS.colors.accent,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
      
      {/* User Profile Panel */}
      <UserProfilePanel 
        user={user}
        isOpen={showProfilePanel}
        onClose={() => setShowProfilePanel(false)}
      />
      
      {/* Debug Panel for Webhook Debugging */}
      <DebugPanel isDarkMode={false} />
    </div>
  );
};

// Export components
const Components = {
  AuthScreen,
  ChatInterface
};

export default Components;
