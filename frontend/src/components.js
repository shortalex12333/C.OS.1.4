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
  Settings
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cacheService } from './services/cacheService';
import UserProfilePanel from './components/UserProfilePanel';
import DebugPanel from './components/DebugPanel';

// API Configuration - FIXED PATHS (Task 2)
const API_CONFIG = {
  baseUrl: 'https://api.celeste7.ai/webhook',
  endpoints: {
    chat: '/text-chat-fast',
    fetchChat: '/fetch-chat',
    fetchConversations: '/fetch-conversations',
    auth: '/auth',
    login: '/auth/login',
    logout: '/auth/logout',  // FIXED: was auth-logout
    verifyToken: '/auth/verify-token',  // FIXED: was auth/verify-token
    signup: '/auth-signup',
    getData: '/get-data'  // ADDED: This was missing and called 78 times!
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
    const { maxRetries = API_CONFIG.maxRetries, timeout = API_CONFIG.timeout, signal } = options;
    const url = `${API_CONFIG.baseUrl}${endpoint}`;
    let lastError;
    
    const actualRetries = endpoint.includes('chat') ? 1 : maxRetries;
    
    for (let attempt = 0; attempt < actualRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        // Use provided signal or create new one
        const requestSignal = signal || controller.signal;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
          credentials: 'omit',
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
          throw error; // Don't retry on user abort
        }
        
        if (attempt < actualRetries - 1) {
          // Use longer delay for signup operations (10 seconds vs 1 second)
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

// Auth Screen Component
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
    
    // Check for weak patterns
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
      return { strength: score, text: 'Strong', color: 'text-green-600' };
    }
  };

  const handleSubmit = useCallback(async () => {
    if (isLoading) return;
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Validation
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
      // Check for weak passwords
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
        timeout: isSignup ? 10000 : 5000 // 10 seconds for signup, 5 seconds for login
      });

      if (result.success) {
        if (isSignup) {
          // Handle signup success - new API format
          const responseData = result.data;
          if (responseData.statusCode === 201 && responseData.response?.success) {
            setSignupSuccess(true);
            // Clear form fields on success
            setDisplayName('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setError('');
            
            // Auto-redirect to login after 3 seconds
            setTimeout(() => {
              setSignupSuccess(false);
              setIsSignup(false);
            }, 3000);
          } else {
            setError('Signup failed. Please try again.');
          }
        } else {
          // Handle login
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
        // Handle signup/login errors with new API format
        const errorData = result.data;
        
        if (isSignup) {
          // Handle signup-specific errors
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
          // Handle login errors
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

  // Show success message after signup
  if (signupSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-[#202123]">
              Celeste<span className="bg-gradient-to-r from-[#60A5FA] to-[#2563EB] bg-clip-text text-transparent">OS</span>
            </h1>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-md p-6 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">Account created successfully!</h3>
            <p className="text-green-700 mb-4">Welcome to CelesteOS! Your account is ready to use.</p>
            <p className="text-sm text-green-600 mb-6">Redirecting you to login in a few seconds...</p>
            
            <button
              onClick={() => {
                setSignupSuccess(false);
                setIsSignup(false);
                setEmail('');
                setPassword('');
              }}
              className="bg-[#2563EB] hover:bg-[#1e40af] text-white px-6 py-2 rounded-lg transition-colors"
            >
              Continue to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              placeholder="Display name (optional)"
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
            disabled={isLoading || !email || !password || (isSignup && !confirmPassword)}
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

// Utility functions for message actions
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

// Typing Indicator Component
const TypingIndicator = ({ isDarkMode }) => (
  <div className="flex items-center space-x-1 p-2">
    <div className="flex space-x-1">
      <div className={`w-2 h-2 rounded-full animate-pulse ${isDarkMode ? 'bg-gray-400' : 'bg-gray-400'}`}></div>
      <div className={`w-2 h-2 rounded-full animate-pulse ${isDarkMode ? 'bg-gray-400' : 'bg-gray-400'}`} style={{animationDelay: '0.2s'}}></div>
      <div className={`w-2 h-2 rounded-full animate-pulse ${isDarkMode ? 'bg-gray-400' : 'bg-gray-400'}`} style={{animationDelay: '0.4s'}}></div>
    </div>
    <span className={`text-sm ml-2 ${isDarkMode ? 'text-white' : 'text-gray-500'}`}>CelesteOS is thinking...</span>
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
    if (error?.type === 'token_limit') return 'bg-amber-50 border-amber-200 text-amber-800';
    if (error?.type === 'rate_limit') return 'bg-red-50 border-red-200 text-red-800';
    if (error?.type === 'success') return 'bg-green-50 border-green-200 text-green-800';
    return 'bg-gray-50 border-gray-200 text-gray-800';
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
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry Now
          </button>
        )}
        <button 
          onClick={onDismiss}
          className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};

// Message Actions Component
const MessageActions = ({ message, onCopy, onEdit, onRegenerate, isLastAiMessage, isDarkMode }) => {
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
    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-2">
      <button
        onClick={handleCopy}
        className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
          isDarkMode 
            ? 'text-white hover:text-white hover:bg-[#333]'
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
        }`}
        title="Copy message"
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
        {copied ? 'Copied!' : 'Copy'}
      </button>
      
      {!message.isUser && (
        <button
          onClick={() => onEdit(message)}
          className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
            isDarkMode 
              ? 'text-white hover:text-white hover:bg-[#333]'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }`}
          title="Edit message"
        >
          <Edit3 size={12} />
          Edit
        </button>
      )}
      
      {!message.isUser && isLastAiMessage && (
        <button
          onClick={() => onRegenerate(message)}
          className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
            isDarkMode 
              ? 'text-white hover:text-white hover:bg-[#333]'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }`}
          title="Regenerate response"
        >
          <RefreshCw size={12} />
          Regenerate
        </button>
      )}
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(1);
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

  // Load user data from cache on component mount
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

  // Simple presence tracking
  useEffect(() => {
    // For MVP: Use localStorage to track unique visitors
    const visitorId = localStorage.getItem('visitor_id') || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    if (!localStorage.getItem('visitor_id')) {
      localStorage.setItem('visitor_id', visitorId);
    }

    // Use a simple counter service (replace with your own endpoint)
    const updatePresence = async () => {
      try {
        // Option 1: Use a simple Vercel/Netlify function
        // const res = await fetch('/api/presence', { method: 'POST', body: JSON.stringify({ visitorId }) });
        
        // Option 2: For now, use localStorage to simulate
        const activeUsers = JSON.parse(localStorage.getItem('active_users') || '{}');
        activeUsers[visitorId] = Date.now();
        
        // Clean up old entries (>5 min)
        Object.keys(activeUsers).forEach(id => {
          if (Date.now() - activeUsers[id] > 300000) delete activeUsers[id];
        });
        
        localStorage.setItem('active_users', JSON.stringify(activeUsers));
        setOnlineUsers(Object.keys(activeUsers).length);
      } catch (err) {
        console.error('Presence update failed:', err);
      }
    };

    updatePresence();
    const interval = setInterval(updatePresence, 30000); // Update every 30s

    return () => clearInterval(interval);
  }, []);

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
    
    const updatedConversations = [newConv, ...conversations];
    setConversations(updatedConversations);
    setActiveConversation(newConv);
    setSidebarOpen(false);
    
    // Save to cache/storage
    saveConversations(updatedConversations);
  }, [conversations, saveConversations]);

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

    // Create abort controller for this request
    const controller = new AbortController();
    setAbortController(controller);

    try {
      const result = await sendRequestWithRetry(API_CONFIG.endpoints.chat, {
        userId: user.id,
        userName: user.name || user.displayName,
        message: trimmedMessage,
        chatId: currentConversation.id,
        sessionId: sessionId || `session_${user.id}_${Date.now()}`,
        timestamp: new Date().toISOString()
      }, { maxRetries: 1, timeout: 30000, signal: controller.signal });
      
      if (result.success) {
        // Handle array response format
        const responseData = Array.isArray(result.data) ? result.data[0] : result.data;
        
        if (!responseData) {
          throw new Error('Empty response from server');
        }
        
        // Extract data from new response format
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
        
        const finalConv = {
          ...updatedConv,
          messages: updatedConv.messages.map(msg => 
            msg.id === aiMessage.id 
              ? { 
                  ...msg, 
                  text: aiResponseText, 
                  isThinking: false,
                  isRecovered,
                  category: responseData.metadata?.category,
                  metadata: responseData.metadata
                }
              : msg
          )
        };

        setActiveConversation(finalConv);
        const updatedConversations = conversations.map(c => c.id === currentConversation.id ? finalConv : c);
        setConversations(updatedConversations);
        
        // Save to cache/storage
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
  }, [message, activeConversation, isSending, user, sessionId, tokensRemaining, userStage]);

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
    <div className={`flex h-screen ${isDarkMode ? 'dark bg-[#343541]' : 'bg-white'}`}>
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-md hover:bg-[#f7f7f8] md:hidden"
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        id="sidebar"
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed md:relative md:translate-x-0 z-40 w-[260px] h-full transition-transform duration-200 ease-in-out flex flex-col ${
          isDarkMode ? 'bg-[#202123]' : 'bg-[#f7f7f8]'
        }`}
      >
        {/* Logo and Users Online */}
        <div className={`p-4 border-b mt-14 md:mt-0 ${isDarkMode ? 'border-[#444654]' : 'border-[#e5e5e5]'}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[#60A5FA] to-[#2563EB] rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-[#202123]'}`}>
              Celeste<span className="bg-gradient-to-r from-[#60A5FA] to-[#2563EB] bg-clip-text text-transparent">OS</span>
            </h2>
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-[#d1d5db]' : 'text-[#6e6e80]'}`}>
            <span className="font-medium">{onlineUsers}</span> {onlineUsers === 1 ? 'User' : 'Users'} online
          </div>
        </div>

        {/* New chat button */}
        <div className="p-2">
          <button
            onClick={createNewConversation}
            className={`flex items-center gap-3 w-full rounded-md border px-3 py-3 text-sm transition-colors ${
              isDarkMode 
                ? 'border-[#444654] text-white hover:bg-[#2a2b32]'
                : 'border-[#e5e5e5] text-[#202123] hover:bg-[#e5e5e5]'
            }`}
          >
            <Plus size={16} />
            New chat
          </button>
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-2 pb-2">
            {sortedConversations.length === 0 ? (
              <div className={`text-center text-sm mt-8 px-4 ${isDarkMode ? 'text-[#d1d5db]' : 'text-[#6e6e80]'}`}>
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
                      ? (isDarkMode ? 'bg-[#2a2b32]' : 'bg-[#e5e5e5]')
                      : (isDarkMode ? 'hover:bg-[#2a2b32]' : 'hover:bg-[#e5e5e5]')
                  }`}
                >
                  <MessageSquare size={16} className="flex-shrink-0" />
                  <span className="flex-1 text-left truncate">{conv.title}</span>
                  <button
                    onClick={(e) => deleteConversation(conv.id, e)}
                    className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity ${
                      isDarkMode ? 'hover:bg-[#444654]' : 'hover:bg-[#d5d5d5]'
                    }`}
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
        <div className={`border-t ${isDarkMode ? 'border-[#444654]' : 'border-[#e5e5e5]'}`}>
          {/* Theme toggle */}
          <div className="p-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`flex items-center gap-3 w-full rounded-md px-3 py-3 text-sm transition-colors ${
                isDarkMode 
                  ? 'text-white hover:bg-[#2a2b32]'
                  : 'text-[#202123] hover:bg-[#e5e5e5]'
              }`}
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              <span className="flex-1 text-left">{isDarkMode ? 'Light mode' : 'Dark mode'}</span>
            </button>
          </div>
          
          {/* User section */}
          <div className="p-2 pt-0">
            <button
              onClick={() => setShowProfilePanel(true)}
              className={`flex items-center gap-3 w-full rounded-md px-3 py-3 text-sm transition-colors mb-2 ${
                isDarkMode 
                  ? 'text-white hover:bg-[#2a2b32]'
                  : 'text-[#202123] hover:bg-[#e5e5e5]'
              }`}
            >
              <Settings size={16} />
              <span className="flex-1 text-left">Profile & Data</span>
            </button>
            <button
              onClick={onLogout}
              className={`flex items-center gap-3 w-full rounded-md px-3 py-3 text-sm transition-colors ${
                isDarkMode 
                  ? 'text-white hover:bg-[#2a2b32]'
                  : 'text-[#202123] hover:bg-[#e5e5e5]'
              }`}
            >
              <User size={16} />
              <span className="flex-1 text-left truncate">{user.email}</span>
              <LogOut size={16} />
            </button>
          </div>
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

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header with token counter and user info */}
        <div className={`border-b p-4 py-3 ${isDarkMode ? 'bg-[#242424] border-[#444654]' : 'bg-white border-[#e5e5e5]'}`}>
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {/* Token display */}
            <div className="flex items-center gap-4">
              <div className="md:hidden">
                <h1 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-[#202123]'}`}>
                  Celeste<span className="bg-gradient-to-r from-[#60A5FA] to-[#2563EB] bg-clip-text text-transparent">OS</span>
                </h1>
              </div>
              <div className="hidden md:flex items-center gap-3">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-[#202123]'}`}>
                  {tokensRemaining.toLocaleString()} tokens today
                </span>
                <div className={`w-24 h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-[#444654]' : 'bg-gray-200'}`}>
                  <div 
                    className="h-full bg-gradient-to-r from-[#60A5FA] to-[#2563EB] transition-all duration-300"
                    style={{ width: `${Math.max(0, (tokensRemaining / 50000) * 100)}%` }}
                  />
                </div>
                {cacheLoading && (
                  <div className={`text-xs flex items-center gap-1 ${isDarkMode ? 'text-white' : 'text-[#6e6e80]'}`}>
                    <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </div>
                )}
              </div>
            </div>
            
            {/* User info */}
            <div className="flex items-center gap-2">
              <span className={`text-sm capitalize ${isDarkMode ? 'text-white' : 'text-[#6e6e80]'}`}>{userStage}</span>
              <span className={`hidden md:inline text-sm font-medium ${isDarkMode ? 'text-white' : 'text-[#202123]'}`}>
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
                className={`p-1 transition-colors ${isDarkMode ? 'text-white hover:text-white' : 'text-[#6e6e80] hover:text-[#202123]'}`}
                title="Refresh user data"
              >
                <RefreshCw size={14} className={cacheLoading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </div>

        {/* Messages container */}
        <div className={`flex-1 overflow-y-auto ${isDarkMode ? 'bg-[#242424]' : 'bg-white'}`}>
          {!activeConversation || activeConversation.messages?.length === 0 ? (
            <div className="h-full flex items-center justify-center p-4">
              <div className="text-center max-w-2xl mx-auto">
                <h1 className={`text-3xl md:text-4xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-[#202123]'}`}>
                  Celeste<span className="bg-gradient-to-r from-[#60A5FA] to-[#2563EB] bg-clip-text text-transparent">OS</span>
                </h1>
                <p className={`mb-8 ${isDarkMode ? 'text-white' : 'text-[#6e6e80]'}`}>Your success inevitability engine</p>
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
                      className={`p-4 rounded-md border text-sm transition-colors text-left ${
                        isDarkMode 
                          ? 'border-[#444654] text-white hover:bg-[#000000]'
                          : 'border-[#e5e5e5] text-[#202123] hover:bg-[#f7f7f8]'
                      }`}
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
                  <div
                    key={msg.id}
                    className={`group py-6 ${
                      msg.isUser 
                        ? (isDarkMode ? 'bg-[#242424]' : 'bg-white')
                        : (isDarkMode ? 'bg-[#242424]' : 'bg-[#f7f7f8]')
                    }`}
                  >
                    <div className="max-w-4xl mx-auto px-4">
                      {msg.isThinking ? (
                        <TypingIndicator isDarkMode={isDarkMode} />
                      ) : (
                        <div className={`flex gap-4 ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                          {/* Avatar */}
                          {!msg.isUser && (
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-[#2563EB] text-white rounded-sm flex items-center justify-center font-medium">
                                C
                              </div>
                            </div>
                          )}
                          
                          {/* Message content */}
                          <div className={`flex-1 max-w-[85%] ${msg.isUser ? 'max-w-[70%]' : ''}`}>
                            <div 
                              className={`
                                px-4 py-3 rounded-lg
                                ${msg.isUser 
                                  ? 'bg-[#2563eb] text-white rounded-tr-sm ml-auto'
                                  : isDarkMode 
                                    ? 'bg-[#000000] border-[#000000] text-white border rounded-tl-sm'
                                    : 'bg-[#ffffff] border-[#ffffff] text-[#202123] border rounded-tl-sm'
                                }
                              `}
                              style={!msg.isUser ? getCategoryStyles(msg.category) : {}}
                            >
                              <div className={`prose prose-sm max-w-none ${
                                msg.isUser 
                                  ? 'prose-invert' 
                                  : isDarkMode 
                                    ? 'prose-invert' 
                                    : ''
                              }`}>
                                <ReactMarkdown
                                  components={{
                                    p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                                    strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                                    em: ({children}) => <em className="italic">{children}</em>,
                                    code: ({children}) => (
                                      <code className={`px-1 py-0.5 rounded text-sm ${
                                        msg.isUser 
                                          ? 'bg-blue-800' 
                                          : isDarkMode 
                                            ? 'bg-[#333] text-white' 
                                            : 'bg-gray-100 text-gray-800'
                                      }`}>
                                        {children}
                                      </code>
                                    ),
                                    pre: ({children}) => (
                                      <pre className={`p-3 rounded-lg overflow-x-auto text-sm ${
                                        msg.isUser 
                                          ? 'bg-blue-800' 
                                          : isDarkMode 
                                            ? 'bg-[#333] text-white' 
                                            : 'bg-gray-100 text-gray-800'
                                      }`}>
                                        {children}
                                      </pre>
                                    ),
                                  }}
                                >
                                  {msg.text}
                                </ReactMarkdown>
                              </div>
                            </div>
                            
                            {/* Message actions */}
                            {!msg.isThinking && (
                              <MessageActions
                                message={msg}
                                onCopy={handleCopyMessage}
                                onEdit={handleEditMessage}
                                onRegenerate={handleRegenerateMessage}
                                isLastAiMessage={isLastAiMessage}
                                isDarkMode={isDarkMode}
                              />
                            )}
                          </div>
                          
                          {/* User avatar - keeping same styling as requested */}
                          {msg.isUser && (
                            <div className="flex-shrink-0">
                              <div className={`w-8 h-8 rounded-sm flex items-center justify-center font-medium ${
                                isDarkMode 
                                  ? 'bg-[#444654] border border-[#555] text-white'
                                  : 'bg-white border border-[#e5e5e5] text-[#202123]'
                              }`}>
                                {user.name?.[0]?.toUpperCase() || 'U'}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
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
            <ErrorMessage 
              error={error}
              onRetry={() => setError(null)}
              onDismiss={() => setError(null)}
            />
          </div>
        )}

        {/* Stop generation button */}
        {isGenerating && (
          <div className="mx-4 mb-2">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={stopGeneration}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <StopCircle size={16} />
                Stop generating
              </button>
            </div>
          </div>
        )}

        {/* Input area */}
        <div className={`border-t p-4 ${isDarkMode ? 'bg-[#242424] border-[#444654]' : 'bg-white border-[#e5e5e5]'}`}>
          <div className="max-w-4xl mx-auto">
            <div className={`relative flex items-end gap-2 rounded-lg border shadow-sm focus-within:ring-1 focus-within:ring-[#2563EB] ${
              isDarkMode 
                ? 'border-[#555] bg-[#242424] focus-within:border-[#2563EB]'
                : 'border-[#e5e5e5] bg-white focus-within:border-[#2563EB]'
            }`}>
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
                    ? "Ask anything about your business..." 
                    : "Start your transformation..."
                }
                className={`flex-1 resize-none bg-transparent px-4 py-3 focus:outline-none min-h-[24px] max-h-[200px] overflow-y-auto ${
                  isDarkMode 
                    ? 'text-white placeholder-[#888]'
                    : 'text-[#202123] placeholder-[#6e6e80]'
                }`}
                rows={1}
                disabled={isSending}
                style={{ height: 'auto' }}
                onInput={handleTextareaResize}
              />
              <button
                onClick={() => {
                  if (editingMessage) {
                    setEditingMessage(null);
                  }
                  handleSendMessage();
                }}
                disabled={!message.trim() || isSending}
                className="mb-3 mr-3 p-2 rounded-md text-white bg-gradient-to-r from-[#60A5FA] to-[#2563EB] disabled:opacity-40 disabled:cursor-not-allowed transition-opacity hover:opacity-90"
                aria-label={editingMessage ? "Update message" : "Send message"}
              >
                {isSending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
            
            {editingMessage && (
              <div className={`mt-2 flex items-center gap-2 text-sm ${isDarkMode ? 'text-white' : 'text-[#6e6e80]'}`}>
                <Edit3 size={14} />
                <span>Editing message</span>
                <button
                  onClick={() => {
                    setEditingMessage(null);
                    setMessage('');
                  }}
                  className="text-[#2563EB] hover:text-[#1d4ed8]"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          <p className={`text-xs text-center mt-2 max-w-4xl mx-auto ${isDarkMode ? 'text-white' : 'text-[#6e6e80]'}`}>
            CelesteOS transforms patterns into profits • {tokensRemaining.toLocaleString()} tokens remaining
          </p>
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

// Export components in the format App.js expects
const Components = {
  AuthScreen,
  ChatInterface
};

export default Components;