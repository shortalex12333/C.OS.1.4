import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Plus, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  LogOut, 
  User, 
  MessageSquare,
  Trash2,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Clock,
  Hash,
  AlertTriangle,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// CRITICAL: API Configuration
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
    heartbeat: '/user-heartbeat',
    offline: '/user-offline',
    profile: '/profile-building'
  },
  timeout: 10000,
  maxRetries: 3,
  retryDelay: 1000
};

// CRITICAL: Lean retry logic - no bullshit metrics
const sendRequestWithRetry = async (endpoint, payload, options = {}) => {
  const { maxRetries = API_CONFIG.maxRetries, timeout = API_CONFIG.timeout } = options;
  const url = `${API_CONFIG.baseUrl}${endpoint}`;
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
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
      
      if (response.ok) {
        const data = await response.json();
        return { success: true, data, attempt: attempt + 1 };
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
    } catch (error) {
      lastError = error;
      
      // Don't retry on auth errors
      if (error.message.includes('401') || error.message.includes('403')) {
        throw new Error('Authentication failed');
      }
      
      // Exponential backoff
      if (attempt < maxRetries - 1) {
        const delay = API_CONFIG.retryDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`All ${maxRetries} attempts failed. Last error: ${lastError.message}`);
};

// TypewriterEffect Component - Keep it simple
const TypewriterEffect = ({ text, speed = 30, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else if (currentIndex === text.length && onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  return <span>{displayedText}</span>;
};

// DELETED: useInterventionsWithEvents - not used
// DELETED: CommonResponseCache - not used
// DELETED: MessageQueue - not used
// DELETED: ConversationCache - causes memory leaks
// DELETED: pendingRequests - causes memory leaks
// DELETED: dedupedFetch - overengineered

// CRITICAL: Lean ConversationSwitcher
const ConversationSwitcher = ({ userId, currentChatId, onSwitch, conversations, isDarkMode }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = (now - date) / (1000 * 60 * 60);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-2">
      {conversations.map((conv, index) => {
        const isActive = conv.id === currentChatId;
        const isEmpty = conv.isEmpty || !conv.lastMessage;
        
        return (
          <button
            key={conv.id}
            onClick={() => onSwitch(conv.id)}
            className={`w-full p-4 rounded-xl text-left transition-all duration-200 group relative ${
              isActive 
                ? 'bg-gradient-to-r from-[#73c2e2] to-[#badde9] text-white shadow-lg' 
                : isEmpty
                  ? isDarkMode 
                    ? 'hover:bg-[#2a2a2a] text-gray-500 border-2 border-dashed border-gray-600' 
                    : 'hover:bg-gray-50 text-gray-400 border-2 border-dashed border-gray-300'
                  : isDarkMode 
                    ? 'hover:bg-[#2a2a2a] text-gray-300 border border-[#373737]' 
                    : 'hover:bg-white text-gray-700 border border-gray-200'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                isActive 
                  ? 'bg-white/20 text-white' 
                  : isEmpty
                    ? isDarkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'
                    : 'bg-[#73c2e2]/10 text-[#73c2e2]'
              }`}>
                <Hash size={14} />
                {conv.id}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className={`font-semibold truncate text-sm mb-1 ${isEmpty ? 'opacity-60' : ''}`}>
                  {conv.title}
                </div>
                
                <div className={`text-xs truncate ${
                  isActive 
                    ? 'text-white/80' 
                    : isEmpty 
                      ? isDarkMode ? 'text-gray-600' : 'text-gray-400'
                      : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {isEmpty ? 'Click to start...' : conv.lastMessage}
                </div>
                
                {conv.timestamp && !isEmpty && (
                  <div className={`flex items-center space-x-1 mt-1 text-xs ${
                    isActive ? 'text-white/60' : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    <Clock size={10} />
                    <span>{formatTime(conv.timestamp)}</span>
                  </div>
                )}
              </div>
              
              {isActive && (
                <div className="flex-shrink-0 w-3 h-3 bg-white rounded-full shadow-lg" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

// Loading Screen Component
const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#73c2e2] via-[#badde9] to-[#73c2e2] flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-white rounded-2xl shadow-lg flex items-center justify-center">
          <img 
            src="https://images.unsplash.com/photo-1633412802994-5c058f151b66?w=100&h=100&fit=crop&crop=center"
            alt="CelesteOS"
            className="w-12 h-12 rounded-lg object-cover"
          />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Celeste<span className="text-white/80">OS</span>
        </h1>
        <p className="text-[#f8f8ff] text-lg opacity-90">Your proactive AI assistant</p>
      </div>
    </div>
  );
};

// Onboarding Screen Component
const OnboardingScreen = ({ user, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState({
    age_range: '',
    primary_goal: '',
    work_style: '',
    biggest_challenge: ''
  });

  const steps = [
    {
      id: 1,
      question: "What's your age range?",
      field: 'age_range',
      options: ["18-22", "23-26", "27-30", "31+"]
    },
    {
      id: 2,
      question: "What's your main focus right now?",
      field: 'primary_goal',
      options: [
        { label: "Growing my business", value: "business_growth" },
        { label: "Career advancement", value: "career_advancement" },
        { label: "Fitness & health", value: "fitness_health" },
        { label: "Being more productive", value: "productivity" },
        { label: "Work-life balance", value: "work_life_balance" }
      ]
    },
    {
      id: 3,
      question: "How do you typically work?",
      field: 'work_style',
      options: [
        { label: "Entrepreneur/Self-employed", value: "entrepreneur" },
        { label: "Remote employee", value: "remote_employee" },
        { label: "Office-based", value: "office_based" },
        { label: "Student", value: "student" },
        { label: "Freelancer/Contractor", value: "freelancer" }
      ]
    },
    {
      id: 4,
      question: "What's your biggest challenge?",
      field: 'biggest_challenge',
      options: [
        { label: "Procrastination", value: "procrastination" },
        { label: "Staying focused", value: "staying_focused" },
        { label: "Following through on plans", value: "following_through" },
        { label: "Time management", value: "time_management" },
        { label: "Being consistent", value: "being_consistent" }
      ]
    }
  ];

  const currentStepData = steps.find(step => step.id === currentStep);
  const progressPercentage = (currentStep / steps.length) * 100;

  const handleOptionSelect = (option) => {
    const value = typeof option === 'object' ? option.value : option;
    setAnswers(prev => ({
      ...prev,
      [currentStepData.field]: value
    }));
  };

  const handleNext = async () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      await sendRequestWithRetry(API_CONFIG.endpoints.profile, {
        userId: user.id,
        stage: 4,
        data: answers
      });
    } catch (error) {
      console.error('Profile submission error:', error);
    }

    onComplete({
      userId: user.id,
      email: user.email,
      name: user.name,
      ...answers,
      timestamp: Date.now()
    });

    setIsSubmitting(false);
  };

  const isStepComplete = answers[currentStepData.field] !== '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#73c2e2] via-[#badde9] to-[#73c2e2] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#73c2e2] to-[#badde9] p-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Welcome to CelesteOS</h1>
            <div className="text-right">
              <div className="text-2xl font-bold">{currentStep}/{steps.length}</div>
            </div>
          </div>
          
          <div className="relative">
            <div className="w-full bg-white/20 rounded-full h-3">
              <div 
                className="bg-white h-3 rounded-full shadow-lg transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="p-8">
          <h2 className="text-2xl font-semibold text-[#181818] mb-6">
            {currentStepData.question}
          </h2>

          <div className="grid gap-4 mb-8">
            {currentStepData.options.map((option) => {
              const isObject = typeof option === 'object';
              const displayText = isObject ? option.label : option;
              const optionValue = isObject ? option.value : option;
              const isSelected = answers[currentStepData.field] === optionValue;
              
              return (
                <button
                  key={optionValue}
                  onClick={() => handleOptionSelect(option)}
                  className={`p-6 rounded-2xl border-2 text-left font-medium transition-all ${
                    isSelected
                      ? 'border-[#73c2e2] bg-[#73c2e2]/10 text-[#181818] shadow-lg'
                      : 'border-gray-200 hover:border-[#73c2e2]/50 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {displayText}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-xl font-medium ${
                currentStep === 1 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-600 hover:text-[#73c2e2] border border-gray-200'
              }`}
            >
              Back
            </button>

            <button
              onClick={handleNext}
              disabled={!isStepComplete || isSubmitting}
              className={`px-8 py-4 rounded-xl font-medium shadow-lg ${
                isStepComplete && !isSubmitting
                  ? 'bg-gradient-to-r from-[#73c2e2] to-[#badde9] text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Setting up...' : currentStep === steps.length ? 'Complete' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Authentication Screen Component
const AuthScreen = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (isSignUp && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const endpoint = isSignUp ? `${API_CONFIG.endpoints.auth}/signup` : API_CONFIG.endpoints.login;
      
      const result = await sendRequestWithRetry(endpoint, {
        email: formData.email,
        password: formData.password,
        name: isSignUp ? formData.name : undefined
      });

      if (result.success) {
        const authData = Array.isArray(result.data) ? result.data[0] : result.data;
        
        if (authData && authData.user && authData.access_token) {
          const userData = {
            id: authData.user.id,
            email: authData.user.email,
            name: authData.user.email.split('@')[0],
            displayName: authData.user.email.split('@')[0],
            role: authData.user.role || 'authenticated'
          };
          
          onLogin(userData, authData.access_token);
        } else {
          setError('Invalid response from authentication service');
        }
      }
    } catch (error) {
      setError(error.message.includes('Authentication') ? 'Invalid credentials' : 'Connection error');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#73c2e2] via-[#badde9] to-[#73c2e2] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#181818] mb-2">
            CelesteOS
          </h1>
          <p className="text-gray-600">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isSignUp && (
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#73c2e2]"
              required
            />
          )}
          
          <input
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#73c2e2]"
            required
          />
          
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#73c2e2] pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {isSignUp && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#73c2e2]"
              required
            />
          )}

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#73c2e2] to-[#badde9] text-white py-3 rounded-lg font-medium disabled:opacity-70"
          >
            {isLoading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setFormData({ email: '', password: '', confirmPassword: '', name: '' });
              }}
              className="text-[#73c2e2] hover:underline ml-1 font-medium"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// DELETED: PerformanceMonitor - development only cruft
// DELETED: useRateLimit - overengineered, handle server-side
// DELETED: ConnectionStatus - unnecessary complexity
// DELETED: ErrorDisplay - inline errors are enough

// Main Chat Interface Component
const ChatInterface = ({ user, onLogout }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [onlineUserCount, setOnlineUserCount] = useState(1);
  const [streamingMessages, setStreamingMessages] = useState(new Set());
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Handle typewriter completion
  const handleStreamingComplete = (messageId) => {
    setStreamingMessages(prev => {
      const newSet = new Set(prev);
      newSet.delete(messageId);
      return newSet;
    });
  };

  // Initialize conversations
  useEffect(() => {
    const initializeConversations = async () => {
      try {
        const response = await sendRequestWithRetry(API_CONFIG.endpoints.fetchConversations, {
          userId: user.id
        });

        if (response.success && response.data.conversations) {
          const conversationSlots = Array.from({ length: 10 }, (_, i) => {
            const chatId = String(i + 1);
            const existingConv = response.data.conversations.find(conv => 
              conv.chat_id === chatId || conv.id === chatId
            );
            
            return existingConv ? {
              id: chatId,
              title: existingConv.title || `Conversation ${i + 1}`,
              lastMessage: existingConv.last_message || '',
              timestamp: existingConv.updated_at || null,
              messages: []
            } : {
              id: chatId,
              title: `Conversation ${i + 1}`,
              lastMessage: null,
              timestamp: null,
              messages: [],
              isEmpty: true
            };
          });
          
          setConversations(conversationSlots);
          if (!activeConversation) {
            setActiveConversation(conversationSlots[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
        
        // Fallback
        const conversationSlots = Array.from({ length: 10 }, (_, i) => ({
          id: String(i + 1),
          title: `Conversation ${i + 1}`,
          lastMessage: null,
          timestamp: null,
          messages: [],
          isEmpty: true
        }));
        
        setConversations(conversationSlots);
        setActiveConversation(conversationSlots[0]);
      }
    };

    if (user?.id) {
      initializeConversations();
    }
  }, [user]);

  // Auto scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConversation?.messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  // Conversation switching
  const handleConversationSwitch = (chatId) => {
    const conversation = conversations.find(conv => conv.id === chatId);
    if (conversation) {
      setActiveConversation(conversation);
      if (!conversation.isEmpty && conversation.lastMessage) {
        fetchConversation(chatId);
      }
    }
  };

  // New conversation
  const handleNewConversation = () => {
    const emptySlot = conversations.find(conv => conv.isEmpty || !conv.lastMessage);
    
    if (emptySlot) {
      setActiveConversation({
        ...emptySlot,
        messages: [],
        isEmpty: false
      });
    } else {
      setShowDeleteModal(true);
    }
  };

  // Send message
  const sendMessageToWebhook = async (messageText) => {
    setIsTyping(true);
    setError(null);

    const requestPayload = {
      userId: user.id,
      userName: user.name || user.displayName || 'Unknown User',
      message: messageText,
      chatId: activeConversation.id,
      sessionId: sessionStorage.getItem('celesteos_session_id') || `session_${user.id}_${Date.now()}`,
      streamResponse: true
    };

    const aiMessage = {
      id: Date.now() + 1,
      text: 'CelesteOS is thinking...',
      isUser: false,
      isThinking: true,
      timestamp: new Date().toISOString()
    };

    setActiveConversation(prev => ({
      ...prev,
      messages: [...prev.messages, aiMessage]
    }));

    try {
      const result = await sendRequestWithRetry(API_CONFIG.endpoints.chat, requestPayload);
      
      if (result.success) {
        const data = result.data;
        const aiResponseText = data.response || "No response received.";

        // Update AI message
        setActiveConversation(prev => ({
          ...prev,
          messages: prev.messages.map(msg => 
            msg.id === aiMessage.id 
              ? {
                  ...msg,
                  text: aiResponseText,
                  isThinking: false,
                  isStreaming: true,
                  metadata: {
                    category: data.category,
                    confidence: data.confidence,
                    responseTimeMs: data.responseTimeMs
                  }
                }
              : msg
          ),
          lastMessage: aiResponseText.substring(0, 100) + '...',
          timestamp: Date.now()
        }));

        setStreamingMessages(prev => new Set(prev).add(aiMessage.id));

        // Update conversation list
        setConversations(prev => prev.map(conv => 
          conv.id === activeConversation.id 
            ? { 
                ...conv, 
                lastMessage: aiResponseText.substring(0, 100) + '...', 
                timestamp: Date.now(),
                isEmpty: false
              }
            : conv
        ));
      }
    } catch (error) {
      console.error('Message send error:', error);
      setError(error.message);
      
      // Remove failed message
      setActiveConversation(prev => ({
        ...prev,
        messages: prev.messages.filter(msg => msg.id !== aiMessage.id)
      }));
    }

    setIsTyping(false);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !activeConversation) return;

    const userMessage = {
      id: Date.now(),
      text: message.trim(),
      isUser: true,
      timestamp: Date.now()
    };

    setActiveConversation(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      lastMessage: message.trim(),
      isEmpty: false
    }));

    const messageToSend = message.trim();
    setMessage('');

    await sendMessageToWebhook(messageToSend);
  };

  // Delete conversation
  const handleDeleteConversation = (conversationId) => {
    const resetConversation = {
      id: conversationId,
      title: `Conversation ${conversationId}`,
      lastMessage: null,
      timestamp: null,
      messages: [],
      isEmpty: true
    };

    setConversations(prev => prev.map(conv => 
      conv.id === conversationId ? resetConversation : conv
    ));
    
    if (activeConversation?.id === conversationId) {
      setActiveConversation(resetConversation);
    }
    
    setShowDeleteModal(false);
  };

  // Fetch conversation
  const fetchConversation = async (conversationId) => {
    try {
      const response = await sendRequestWithRetry(API_CONFIG.endpoints.fetchChat, {
        userId: user.id,
        chatId: conversationId,
        sessionId: sessionStorage.getItem('celesteos_session_id') || `session_${user.id}_${Date.now()}`
      });

      if (response.success) {
        const conversation = conversations.find(conv => conv.id === conversationId);
        if (conversation) {
          let messages = [];
          
          if (response.data.output) {
            messages = [{
              id: `history_${Date.now()}`,
              text: response.data.output.trim(),
              isUser: false,
              timestamp: Date.now()
            }];
          } else if (response.data.messages) {
            messages = response.data.messages.map(msg => ({
              ...msg,
              text: msg.text || msg.content || msg.message || ''
            }));
          }
          
          setActiveConversation({
            ...conversation,
            messages,
            isEmpty: messages.length === 0
          });
        }
      }
    } catch (error) {
      console.error('Fetch conversation error:', error);
    }
  };

  // Heartbeat
  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        const response = await sendRequestWithRetry(API_CONFIG.endpoints.heartbeat, {
          userId: user.id,
          timestamp: Date.now()
        });

        if (response.success && response.data.onlineUsers) {
          setOnlineUserCount(response.data.onlineUsers);
        }
      } catch (error) {
        console.error('Heartbeat failed:', error);
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 30000);

    return () => {
      clearInterval(interval);
      sendRequestWithRetry(API_CONFIG.endpoints.offline, {
        userId: user.id,
        timestamp: Date.now()
      }).catch(console.error);
    };
  }, [user?.id]);

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'} transition-colors duration-300`}>
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            className={`w-80 ${isDarkMode ? 'bg-slate-800' : 'bg-white'} border-r ${isDarkMode ? 'border-slate-700' : 'border-gray-200'} flex flex-col`}
          >
            {/* Sidebar Header */}
            <div className={`p-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold text-[#73c2e2]">CelesteOS</h1>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
                >
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </div>

              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                <span className="text-sm font-medium">
                  {onlineUserCount} {onlineUserCount === 1 ? 'user' : 'users'} online
                </span>
              </div>
              
              <button
                onClick={handleNewConversation}
                className="w-full mt-4 bg-[#73c2e2] text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
              >
                <Plus size={20} />
                <span>New Conversation</span>
              </button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-3">
              <ConversationSwitcher
                userId={user.id}
                currentChatId={activeConversation?.id}
                onSwitch={handleConversationSwitch}
                conversations={conversations}
                isDarkMode={isDarkMode}
              />
            </div>

            {/* Sidebar Footer */}
            <div className={`p-4 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#73c2e2] rounded-full flex items-center justify-center">
                    <User size={18} className="text-white" />
                  </div>
                  <div>
                    <p className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {user.name}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'} p-4 flex items-center justify-between`}>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
            >
              <Menu size={20} />
            </button>
            <div>
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {activeConversation?.title || 'Select a conversation'}
              </h2>
              {activeConversation && (
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Chat #{activeConversation.id}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            {activeConversation?.messages?.length === 0 || activeConversation?.isEmpty ? (
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                  <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                    Start a conversation
                  </h3>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Ask CelesteOS anything!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {activeConversation?.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-3xl ${msg.isUser ? 'bg-[#181818] text-white' : isDarkMode ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-900'} rounded-2xl px-6 py-4`}>
                      {msg.isThinking ? (
                        <span className="text-gray-400">CelesteOS is thinking...</span>
                      ) : msg.isStreaming && streamingMessages.has(msg.id) ? (
                        <TypewriterEffect 
                          text={msg.text} 
                          speed={30}
                          onComplete={() => handleStreamingComplete(msg.id)}
                        />
                      ) : (
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      )}
                      
                      {msg.metadata && (
                        <div className="mt-2 text-xs opacity-70">
                          {msg.metadata.responseTimeMs && 
                            `${(msg.metadata.responseTimeMs / 1000).toFixed(1)}s`
                          }
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className={`${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'} rounded-2xl px-6 py-4`}>
                      <span className="text-gray-400">CelesteOS is typing...</span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-4 mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Input Area */}
        {activeConversation && (
          <div className="border-t border-transparent px-4 pb-6">
            <div className="max-w-4xl mx-auto">
              <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-2xl shadow-lg p-4`}>
                <div className="flex items-end">
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
                    placeholder="Message CelesteOS..."
                    className={`flex-1 bg-transparent border-none outline-none resize-none ${isDarkMode ? 'text-white' : 'text-gray-900'} placeholder-gray-400`}
                    style={{ minHeight: '24px', maxHeight: '200px' }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isTyping}
                    className={`ml-4 p-3 rounded-lg ${
                      message.trim() && !isTyping
                        ? 'bg-[#73c2e2] text-white'
                        : 'bg-gray-300 text-gray-500'
                    } disabled:cursor-not-allowed`}
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-6 max-w-md w-full`}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                All slots full
              </h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                Clear a conversation to start a new one.
              </p>
              <div className="space-y-2 mb-6 max-h-40 overflow-y-auto">
                {conversations.filter(conv => !conv.isEmpty).map((conv) => (
                  <div key={conv.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <span>#{conv.id} {conv.title}</span>
                    <button
                      onClick={() => handleDeleteConversation(conv.id)}
                      className="text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-full bg-[#73c2e2] text-white py-3 rounded-lg"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Export components
const Components = {
  LoadingScreen,
  AuthScreen,
  OnboardingScreen,
  ChatInterface
};

export default Components;