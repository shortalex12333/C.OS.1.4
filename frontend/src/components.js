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

// CRITICAL: Performance Optimizations
// 1. Debounce utility
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// 2. Global cache managers
const ConversationCache = {
  data: null,
  timestamp: null,
  ttl: 30000, // 30 seconds
  
  isValid() {
    return this.data && this.timestamp && (Date.now() - this.timestamp < this.ttl);
  },
  
  set(data) {
    this.data = data;
    this.timestamp = Date.now();
  },
  
  get() {
    return this.isValid() ? this.data : null;
  },
  
  invalidate() {
    this.data = null;
    this.timestamp = null;
  }
};

// 3. Common response cache for instant replies
const CommonResponseCache = {
  responses: {
    'hi': { 
      response: "Hey there! How can I help you grow your business today?",
      category: 'casual',
      confidence: 1.0
    },
    'hello': {
      response: "Hello! What business challenge can I help you tackle?",
      category: 'casual', 
      confidence: 1.0
    },
    'thanks': {
      response: "You're welcome! Anything else I can help with?",
      category: 'casual',
      confidence: 1.0
    },
    'thank you': {
      response: "Happy to help! Let me know if you need anything else.",
      category: 'casual',
      confidence: 1.0
    },
    'bye': {
      response: "Take care! Feel free to come back anytime you need business advice.",
      category: 'casual',
      confidence: 1.0
    }
  },
  
  get(message) {
    const normalized = message.toLowerCase().trim();
    return this.responses[normalized] || null;
  }
};

// 4. Request deduplication
const pendingRequests = new Map();
const dedupedFetch = async (key, fetchFn) => {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }
  
  const promise = fetchFn();
  pendingRequests.set(key, promise);
  
  try {
    const result = await promise;
    return result;
  } finally {
    pendingRequests.delete(key);
  }
};

// 5. Message queue for offline support
const MessageQueue = {
  queue: [],
  processing: false,
  
  add(message) {
    this.queue.push({
      ...message,
      id: `pending-${Date.now()}`,
      status: 'pending'
    });
    this.process();
  },
  
  async process() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    const message = this.queue[0];
    
    try {
      const response = await sendRequestWithRetry(API_CONFIG.endpoints.chat, message);
      if (response.success) {
        this.queue.shift(); // Remove sent message
      }
    } catch (error) {
      // Retry later
      setTimeout(() => this.process(), 5000);
    } finally {
      this.processing = false;
      if (this.queue.length > 0) {
        this.process(); // Process next
      }
    }
  }
};

// CRITICAL: API Configuration with retry logic
const API_CONFIG = {
  baseUrl: 'https://api.celeste7.ai/webhook',
  endpoints: {
    chat: '/text-chat-fast',
    stream: '/text-chat-stream', // For future SSE implementation
    fetchChat: '/fetch-chat',
    fetchConversations: '/fetch-conversations',
    auth: '/auth',
    heartbeat: '/user-heartbeat',
    offline: '/user-offline',
    profile: '/profile-building'
  },
  timeout: 10000,
  maxRetries: 3,
  retryDelay: 1000 // Base delay in ms
};

// CRITICAL: Enhanced retry logic with performance tracking
const sendRequestWithRetry = async (endpoint, payload, options = {}) => {
  const { maxRetries = API_CONFIG.maxRetries, timeout = API_CONFIG.timeout } = options;
  const url = `${API_CONFIG.baseUrl}${endpoint}`;
  let lastError;
  const startTime = Date.now();
  
  // Initialize metrics if not exists
  if (!window.chatMetrics) {
    window.chatMetrics = {
      responses: [],
      errors: 0,
      total: 0,
      pending: 0,
      startTime: Date.now()
    };
  }
  
  // Track pending request
  window.chatMetrics.pending++;
  window.chatMetrics.total++;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`🔄 API Request attempt ${attempt + 1}/${maxRetries} to ${endpoint}`);
      
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
        const responseTime = Date.now() - startTime;
        
        // Track successful response
        window.chatMetrics.pending--;
        window.chatMetrics.responses.push(responseTime);
        
        // Keep only last 100 response times for memory efficiency
        if (window.chatMetrics.responses.length > 100) {
          window.chatMetrics.responses = window.chatMetrics.responses.slice(-100);
        }
        
        console.log(`✅ API Success on attempt ${attempt + 1} to ${endpoint} (${responseTime}ms)`);
        return { success: true, data, attempt: attempt + 1, responseTime };
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
    } catch (error) {
      lastError = error;
      console.error(`❌ API Attempt ${attempt + 1} failed:`, error.message);
      
      // Don't retry on certain errors
      if (error.name === 'AbortError') {
        window.chatMetrics.pending--;
        window.chatMetrics.errors++;
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      
      if (error.message.includes('401') || error.message.includes('403')) {
        window.chatMetrics.pending--;
        window.chatMetrics.errors++;
        throw new Error('Authentication failed');
      }
      
      // Exponential backoff for retries
      if (attempt < maxRetries - 1) {
        const delay = API_CONFIG.retryDelay * Math.pow(2, attempt);
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // All attempts failed
  window.chatMetrics.pending--;
  window.chatMetrics.errors++;
  throw new Error(`All ${maxRetries} attempts failed. Last error: ${lastError.message}`);
};

// TypewriterEffect Component for streaming-like experience
const TypewriterEffect = ({ text, speed = 30, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else if (!isComplete && currentIndex === text.length) {
      setIsComplete(true);
      if (onComplete) onComplete();
    }
  }, [currentIndex, text, speed, isComplete, onComplete]);

  // Reset when text changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  return (
    <span>
      {displayedText}
      {!isComplete && currentIndex < text.length && (
        <span className="animate-pulse text-[#73c2e2]">|</span>
      )}
    </span>
  );
};

// CRITICAL FIX: Add the missing hook or create a stub
const useInterventionsWithEvents = (userId) => {
  return {
    interventions: [],
    pendingIntervention: null,
    getPendingInterventionId: () => null,
    markInterventionUsed: (id) => {},
    clearInterventions: () => {}
  };
};

// CRITICAL: Enhanced ConversationSwitcher with caching
const ConversationSwitcher = ({ userId, currentChatId, onSwitch, conversations, isDarkMode, setConversations }) => {
  const [loading, setLoading] = useState(false);

  const loadConversations = useCallback(async (forceRefresh = false) => {
    // Check cache first
    if (!forceRefresh) {
      const cached = ConversationCache.get();
      if (cached) {
        setConversations(cached);
        return;
      }
    }

    setLoading(true);
    try {
      const result = await dedupedFetch(
        `conversations-${userId}`,
        () => sendRequestWithRetry(API_CONFIG.endpoints.fetchConversations, { userId })
      );

      if (result.success && result.data.conversations) {
        const conversationSlots = Array.from({ length: 10 }, (_, i) => {
          const chatId = String(i + 1);
          const existingConv = result.data.conversations.find(conv => conv.chat_id === chatId || conv.id === chatId);
          
          return existingConv ? {
            id: chatId,
            title: existingConv.title || `Conversation ${i + 1}`,
            lastMessage: existingConv.last_message || existingConv.lastMessage || '',
            timestamp: existingConv.updated_at || existingConv.timestamp || null,
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
        
        ConversationCache.set(conversationSlots);
        setConversations(conversationSlots);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, setConversations]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    loadConversations();
    const interval = setInterval(() => loadConversations(true), 30000);
    return () => clearInterval(interval);
  }, [loadConversations]);

  const handleSwitch = (chatId) => {
    onSwitch(chatId);
    // Refresh in background after switch
    setTimeout(() => loadConversations(true), 1000);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
    if (diffHours < 168) return `${Math.floor(diffHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  // Ensure we always have 10 conversation slots
  const conversationSlots = Array.from({ length: 10 }, (_, i) => {
    const chatId = String(i + 1);
    const existingConv = conversations.find(conv => conv.id === chatId);
    
    return existingConv || {
      id: chatId,
      title: `Conversation ${i + 1}`,
      lastMessage: null,
      timestamp: null,
      messages: [],
      isEmpty: true
    };
  });

  return (
    <div className="space-y-2">
      {loading && (
        <div className={`text-xs text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <RefreshCw size={12} className="inline animate-spin mr-1" />
          Syncing conversations...
        </div>
      )}
      {conversationSlots.map((conv, index) => {
        const isActive = conv.id === currentChatId;
        const isEmpty = conv.isEmpty || !conv.lastMessage;
        
        return (
          <motion.button
            key={conv.id}
            onClick={() => handleSwitch(conv.id)}
            className={`w-full p-4 rounded-xl text-left transition-all duration-200 group relative ${
              isActive 
                ? 'bg-gradient-to-r from-[#73c2e2] to-[#badde9] text-white shadow-lg' 
                : isEmpty
                  ? isDarkMode 
                    ? 'hover:bg-[#2a2a2a] text-gray-500 border-2 border-dashed border-gray-600 hover:border-[#73c2e2]/50' 
                    : 'hover:bg-gray-50 text-gray-400 border-2 border-dashed border-gray-300 hover:border-[#73c2e2]/50'
                  : isDarkMode 
                    ? 'hover:bg-[#2a2a2a] text-gray-300 hover:shadow-md border border-[#373737]' 
                    : 'hover:bg-white text-gray-700 hover:shadow-md border border-gray-200 hover:border-[#73c2e2]/30'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start space-x-3">
              {/* Chat ID Indicator */}
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
                {/* Conversation Title */}
                <div className={`font-semibold truncate text-sm mb-1 ${
                  isEmpty ? 'opacity-60' : ''
                }`}>
                  {conv.title}
                </div>
                
                {/* Last Message Preview */}
                <div className={`text-xs truncate ${
                  isActive 
                    ? 'text-white/80' 
                    : isEmpty 
                      ? isDarkMode ? 'text-gray-600' : 'text-gray-400'
                      : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {isEmpty ? 'Click to start conversation...' : conv.lastMessage}
                </div>
                
                {/* Timestamp */}
                {conv.timestamp && !isEmpty && (
                  <div className={`flex items-center space-x-1 mt-1 text-xs ${
                    isActive ? 'text-white/60' : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    <Clock size={10} />
                    <span>{formatTime(conv.timestamp)}</span>
                  </div>
                )}
              </div>
              
              {/* Active Indicator */}
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex-shrink-0 w-3 h-3 bg-white rounded-full shadow-lg"
                />
              )}
              
              {/* Empty Slot Plus Icon */}
              {isEmpty && !isActive && (
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                } group-hover:bg-[#73c2e2] transition-colors`}>
                  <Plus size={12} className={`${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  } group-hover:text-white transition-colors`} />
                </div>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

// Loading Screen Component
const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#73c2e2] via-[#badde9] to-[#73c2e2] flex items-center justify-center">
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="w-20 h-20 mx-auto mb-6 bg-white rounded-2xl shadow-lg flex items-center justify-center"
          animate={{ 
            rotateY: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <img 
            src="https://images.unsplash.com/photo-1633412802994-5c058f151b66?w=100&h=100&fit=crop&crop=center"
            alt="CelesteOS"
            className="w-12 h-12 rounded-lg object-cover"
          />
        </motion.div>
        <motion.h1 
          className="text-4xl font-bold text-white mb-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          style={{ fontFamily: 'Eloquia-Text, sans-serif' }}
        >
          Celeste<span className="bg-gradient-to-r from-[#badde9] to-white bg-clip-text text-transparent">OS</span>
        </motion.h1>
        <motion.p 
          className="text-[#f8f8ff] text-lg opacity-90"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Your proactive AI assistant
        </motion.p>
      </motion.div>
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
      options: [
        "18-22",
        "23-26", 
        "27-30",
        "31+"
      ]
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

  const sendStageData = async (stage, stageData) => {
    try {
      console.log(`Sending stage ${stage} data:`, stageData);
      
      // CRITICAL: Use enhanced retry logic for profile building
      const result = await sendRequestWithRetry(API_CONFIG.endpoints.profile, {
        userId: user.id,
        stage: stage,
        data: stageData
      }, { maxRetries: 2, timeout: 8000 });

      if (result.success) {
        console.log(`Stage ${stage} response after ${result.attempt} attempts:`, result.data);
        return result.data;
      }
    } catch (error) {
      console.error(`Stage ${stage} error:`, error);
      // Don't block onboarding for profile data failures
      return { success: false, error: error.message };
    }
  };

  const handleNext = async () => {
    const currentValue = answers[currentStepData.field];
    
    // Send current stage data
    const stageData = {
      [currentStepData.field]: currentValue
    };
    
    await sendStageData(currentStep, stageData);
    
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

    // Send final stage (4) with complete profile data
    const completeProfileData = {
      age_range: answers.age_range,
      primary_goal: answers.primary_goal,
      work_style: answers.work_style,
      biggest_challenge: answers.biggest_challenge
    };

    try {
      const finalResponse = await sendStageData(4, completeProfileData);
      
      // Store the complete profile data locally
      const profileData = {
        userId: user.id,
        email: user.email,
        name: user.name,
        ...completeProfileData,
        timestamp: Date.now(),
        finalResponse: finalResponse
      };

      onComplete(profileData);
    } catch (error) {
      console.error('Final submission error:', error);
      // Complete onboarding even if final submission fails
      onComplete({
        userId: user.id,
        email: user.email,
        name: user.name,
        ...completeProfileData,
        timestamp: Date.now()
      });
    }

    setIsSubmitting(false);
  };

  const isStepComplete = answers[currentStepData.field] !== '';
  const canProceed = isStepComplete;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#73c2e2] via-[#badde9] to-[#73c2e2] flex items-center justify-center p-4">
      <motion.div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Enhanced Header with Better Branding */}
        <div className="bg-gradient-to-r from-[#73c2e2] to-[#badde9] p-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1633412802994-5c058f151b66?w=100&h=100&fit=crop&crop=center"
                  alt="CelesteOS"
                  className="w-8 h-8 rounded-lg object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ fontFamily: 'Eloquia-Text, sans-serif' }}>
                  Welcome to Celeste<span className="text-white/90">OS</span>
                </h1>
                <p className="text-white/80 text-sm">Your proactive AI assistant</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/70">Step</div>
              <div className="text-2xl font-bold">{currentStep}</div>
              <div className="text-sm text-white/70">of {steps.length}</div>
            </div>
          </div>
          
          {/* Enhanced Progress Bar */}
          <div className="relative">
            <div className="w-full bg-white/20 rounded-full h-3">
              <motion.div 
                className="bg-white h-3 rounded-full shadow-lg"
                initial={{ width: '25%' }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-white/90">
                {Math.round(progressPercentage)}% Complete
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Question Section */}
        <div className="p-8">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-[#73c2e2] to-[#badde9] rounded-full flex items-center justify-center text-white font-bold">
                {currentStep}
              </div>
              <h2 className="text-2xl font-semibold text-[#181818]">
                {currentStepData.question}
              </h2>
            </div>
            
            <p className="text-gray-600 mb-6">
              {currentStep === 1 && "This helps us understand your stage of life and tailor recommendations accordingly."}
              {currentStep === 2 && "Let us know what you're focusing on so we can provide relevant guidance."}
              {currentStep === 3 && "Understanding your work environment helps us suggest better productivity strategies."}
              {currentStep === 4 && "Knowing your main challenge allows us to provide targeted support and interventions."}
            </p>
          </motion.div>

          {/* Enhanced Options Grid */}
          <motion.div 
            className="grid gap-4 mb-8"
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {currentStepData.options.map((option, index) => {
              const isObject = typeof option === 'object';
              const displayText = isObject ? option.label : option;
              const optionValue = isObject ? option.value : option;
              const isSelected = answers[currentStepData.field] === optionValue;
              
              return (
                <motion.button
                  key={optionValue}
                  onClick={() => handleOptionSelect(option)}
                  className={`relative p-6 rounded-2xl border-2 text-left font-medium transition-all duration-300 ${
                    isSelected
                      ? 'border-[#73c2e2] bg-gradient-to-r from-[#73c2e2]/10 to-[#badde9]/10 text-[#181818] shadow-lg transform scale-[1.02]'
                      : 'border-gray-200 hover:border-[#73c2e2]/50 hover:bg-gray-50 text-gray-700 hover:shadow-md hover:transform hover:scale-[1.01]'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: isSelected ? 1.02 : 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-r from-[#73c2e2] to-[#badde9] rounded-full flex items-center justify-center"
                    >
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                  <div className="pr-8">
                    <span className="text-lg">{displayText}</span>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>

          {/* Enhanced Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-100">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
                currentStep === 1 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-600 hover:text-[#73c2e2] hover:bg-gray-100 border border-gray-200 hover:border-[#73c2e2]/30'
              }`}
            >
              <ChevronLeft size={18} />
              <span>Back</span>
            </button>

            <motion.button
              onClick={handleNext}
              disabled={!canProceed || isSubmitting}
              className={`flex items-center space-x-3 px-8 py-4 rounded-xl font-medium transition-all shadow-lg ${
                canProceed && !isSubmitting
                  ? 'bg-gradient-to-r from-[#73c2e2] to-[#badde9] text-white hover:shadow-xl transform hover:scale-[1.02]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              whileHover={canProceed ? { scale: 1.02 } : {}}
              whileTap={canProceed ? { scale: 0.98 } : {}}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Setting up your AI...</span>
                </>
              ) : currentStep === steps.length ? (
                <>
                  <span>Complete Setup</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ChevronRight size={18} />
                </>
              )}
            </motion.button>
          </div>

          {/* Enhanced Footer */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Secure & Private</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <span>Powered by Celeste7</span>
            </div>
          </div>
        </div>
      </motion.div>
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
      const endpoint = isSignUp ? `${API_CONFIG.endpoints.auth}/signup` : `${API_CONFIG.endpoints.auth}/login`;
      
      // CRITICAL: Use enhanced retry logic for authentication
      const result = await sendRequestWithRetry(endpoint, {
        email: formData.email,
        password: formData.password,
        name: isSignUp ? formData.name : undefined
      }, { maxRetries: 2, timeout: 8000 }); // Shorter timeout for auth

      if (result.success && result.data.success) {
        console.log(`✅ Authentication successful after ${result.attempt} attempts`);
        onLogin(result.data.user, result.data.token);
      } else {
        setError(result.data.message || 'Authentication failed');
      }
      
    } catch (error) {
      console.error('Auth error:', error);
      
      if (error.message.includes('timeout')) {
        setError('Authentication timeout. Please check your connection and try again.');
      } else if (error.message.includes('Authentication failed') || error.message.includes('401')) {
        setError('Invalid email or password. Please try again.');
      } else if (error.message.includes('All') && error.message.includes('attempts failed')) {
        setError('Unable to connect to authentication service. Please try again later.');
        
        // Fallback to demo mode for testing
        setTimeout(() => {
          if (formData.email.includes('demo') || formData.email.includes('test')) {
            console.log('Demo mode activated for testing...');
            const mockUser = {
              id: 'demo_user_123',
              email: formData.email,
              name: formData.name || 'Demo User',
              displayName: formData.name || 'Demo User'
            };
            console.log('✅ Mock login successful with user:', mockUser);
            onLogin(mockUser, 'demo_token_123');
          }
        }, 3000);
      } else {
        setError(`Connection error: ${error.message}`);
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#73c2e2] via-[#badde9] to-[#73c2e2] flex items-center justify-center p-4">
      <motion.div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[#73c2e2] to-[#badde9] rounded-xl flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
          >
            <img 
              src="https://images.unsplash.com/photo-1633412802994-5c058f151b66?w=100&h=100&fit=crop&crop=center"
              alt="CelesteOS"
              className="w-10 h-10 rounded-lg object-cover"
            />
          </motion.div>
          <h1 className="text-3xl font-bold text-[#181818] mb-2" style={{ fontFamily: 'Eloquia-Text, sans-serif' }}>
            Celeste<span className="bg-gradient-to-r from-[#73c2e2] to-[#badde9] bg-clip-text text-transparent">OS</span>
          </h1>
          <p className="text-gray-600">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Your proactive AI assistant
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {isSignUp && (
            <div>
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#73c2e2] focus:border-transparent transition-all"
                required
              />
            </div>
          )}
          
          <div>
            <input
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#73c2e2] focus:border-transparent transition-all"
              required
            />
          </div>
          
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#73c2e2] focus:border-transparent transition-all pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#73c2e2] transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {isSignUp && (
            <div>
              <input
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#73c2e2] focus:border-transparent transition-all"
                required
              />
            </div>
          )}

          {error && (
            <motion.div 
              className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#73c2e2] to-[#badde9] text-white py-3 rounded-lg font-medium hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {isSignUp ? 'Creating Account...' : 'Signing In...'}
              </div>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </motion.button>
        </form>

        {/* Toggle Form */}
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
      </motion.div>
    </div>
  );
};

// CRITICAL: Performance Monitor Component (Development Only)
const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    avgResponseTime: 0,
    totalMessages: 0,
    errorRate: 0,
    pendingRequests: 0,
    lastUpdateTime: Date.now()
  });

  useEffect(() => {
    // Initialize global metrics tracker
    if (!window.chatMetrics) {
      window.chatMetrics = {
        responses: [],
        errors: 0,
        total: 0,
        pending: 0,
        startTime: Date.now()
      };
    }

    // Update metrics every 3 seconds
    const interval = setInterval(() => {
      const metrics = window.chatMetrics;
      const recent = metrics.responses.slice(-50); // Last 50 responses
      const uptime = (Date.now() - metrics.startTime) / 1000;
      
      setMetrics({
        avgResponseTime: recent.length > 0 ? recent.reduce((a, b) => a + b, 0) / recent.length : 0,
        totalMessages: metrics.total,
        errorRate: metrics.total > 0 ? (metrics.errors / metrics.total * 100) : 0,
        pendingRequests: metrics.pending,
        lastUpdateTime: Date.now(),
        uptime: uptime,
        throughput: metrics.total / (uptime / 60) // messages per minute
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <motion.div 
      className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-xl text-xs font-mono z-50 backdrop-blur-sm border border-gray-600"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="text-green-400">Avg Response:</div>
          <div className={`font-bold ${metrics.avgResponseTime > 3000 ? 'text-red-400' : 'text-green-400'}`}>
            {(metrics.avgResponseTime / 1000).toFixed(1)}s
          </div>
        </div>
        <div>
          <div className="text-blue-400">Total Msgs:</div>
          <div className="font-bold text-blue-400">{metrics.totalMessages}</div>
        </div>
        <div>
          <div className="text-yellow-400">Error Rate:</div>
          <div className={`font-bold ${metrics.errorRate > 10 ? 'text-red-400' : 'text-yellow-400'}`}>
            {metrics.errorRate.toFixed(1)}%
          </div>
        </div>
        <div>
          <div className="text-purple-400">Pending:</div>
          <div className={`font-bold ${metrics.pendingRequests > 3 ? 'text-red-400' : 'text-purple-400'}`}>
            {metrics.pendingRequests}
          </div>
        </div>
        <div className="col-span-2 pt-2 border-t border-gray-600">
          <div className="text-gray-400">
            Throughput: {metrics.throughput?.toFixed(1) || 0} msg/min
          </div>
          <div className="text-gray-400">
            Uptime: {metrics.uptime ? Math.floor(metrics.uptime / 60) : 0}m {metrics.uptime ? Math.floor(metrics.uptime % 60) : 0}s
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// CRITICAL: Frontend Rate Limiter Hook
const useRateLimit = (maxRequests = 10, windowMs = 60000) => {
  const requestTimesRef = useRef([]);
  
  const checkRateLimit = useCallback(() => {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Remove old requests
    requestTimesRef.current = requestTimesRef.current.filter(time => time > windowStart);
    
    if (requestTimesRef.current.length >= maxRequests) {
      const oldestRequest = requestTimesRef.current[0];
      const timeUntilReset = oldestRequest + windowMs - now;
      return {
        allowed: false,
        timeUntilReset: Math.ceil(timeUntilReset / 1000),
        requestsRemaining: 0
      };
    }
    
    // Add current request
    requestTimesRef.current.push(now);
    
    return {
      allowed: true,
      timeUntilReset: 0,
      requestsRemaining: maxRequests - requestTimesRef.current.length
    };
  }, [maxRequests, windowMs]);
  
  return checkRateLimit;
};  
const ConnectionStatus = ({ isOnline, isReconnecting, onReconnect, isDarkMode }) => {
  if (isOnline) {
    return (
      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
        isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'
      }`}>
        <Wifi size={12} />
        <span>Connected</span>
      </div>
    );
  }
  
  return (
    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
      isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'
    }`}>
      <WifiOff size={12} />
      <span>Disconnected</span>
      {isReconnecting ? (
        <RefreshCw size={12} className="animate-spin" />
      ) : (
        <button 
          onClick={onReconnect}
          className="ml-1 underline hover:no-underline"
        >
          Retry
        </button>
      )}
    </div>
  );
};

// CRITICAL: Enhanced Error Display Component
const ErrorDisplay = ({ error, onRetry, onDismiss, isDarkMode }) => {
  if (!error) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`${
        isDarkMode ? 'bg-red-900/20 border-red-500/30' : 'bg-red-50 border-red-200'
      } border rounded-xl p-4 flex items-center justify-between`}
    >
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isDarkMode ? 'bg-red-500/20' : 'bg-red-100'
        }`}>
          <AlertTriangle size={16} className="text-red-500" />
        </div>
        <div>
          <p className={`font-semibold ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
            {error.type || 'Connection Error'}
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
            {error.message}
          </p>
          {error.canRetry && (
            <button
              onClick={onRetry}
              className={`text-xs underline mt-1 ${
                isDarkMode ? 'text-red-300 hover:text-red-200' : 'text-red-600 hover:text-red-500'
              }`}
            >
              Try again
            </button>
          )}
        </div>
      </div>
      <button
        onClick={onDismiss}
        className={`${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-400'} transition-colors`}
      >
        <X size={20} />
      </button>
    </motion.div>
  );
};

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
  const [sessionMessageCount, setSessionMessageCount] = useState(0);
  const [lastMessageTime, setLastMessageTime] = useState(Date.now());
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [streamingMessages, setStreamingMessages] = useState(new Set());
  const [error, setError] = useState(null);
  
  // CRITICAL: Enhanced error and connection state
  const [connectionStatus, setConnectionStatus] = useState({
    isOnline: true,
    isReconnecting: false,
    lastSeen: Date.now()
  });
  const [retryQueue, setRetryQueue] = useState([]);
  const [apiErrors, setApiErrors] = useState([]);
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const heartbeatRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  
  // Handle typewriter effect completion
  const handleStreamingComplete = (messageId) => {
    setStreamingMessages(prev => {
      const newSet = new Set(prev);
      newSet.delete(messageId);
      return newSet;
    });
  };
  
  // Use intervention hooks
  const {
    interventions,
    pendingIntervention,
    getPendingInterventionId,
    markInterventionUsed,
    clearInterventions
  } = useInterventionsWithEvents(user?.id);

  // FIXED: Initialize conversations with proper 10-slot structure
  useEffect(() => {
    const initializeConversations = async () => {
      try {
        const response = await fetch('https://api.celeste7.ai/webhook/fetch-conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
          credentials: 'omit',
          body: JSON.stringify({
            userId: user.id
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.conversations) {
            // Ensure 10 conversation slots exist
            const conversationSlots = Array.from({ length: 10 }, (_, i) => {
              const chatId = String(i + 1);
              const existingConv = data.conversations.find(conv => conv.chat_id === chatId || conv.id === chatId);
              
              return existingConv ? {
                id: chatId,
                title: existingConv.title || `Conversation ${i + 1}`,
                lastMessage: existingConv.last_message || existingConv.lastMessage || '',
                timestamp: existingConv.updated_at || existingConv.timestamp || null,
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
            // Set first conversation as active if none selected
            if (!activeConversation) {
              setActiveConversation(conversationSlots[0]);
            }
            return;
          }
        }
      } catch (error) {
        console.error('Failed to fetch conversations list:', error);
      }

      // Fallback: Create 10 empty conversation slots
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
    };

    if (user?.id) {
      initializeConversations();
    }
  }, [user]);

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  }, [activeConversation?.messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  // FIXED: Conversation switching function
  const handleConversationSwitch = (chatId) => {
    console.log(`🔄 Switching to conversation ${chatId}`);
    
    // Find conversation in current list
    const conversation = conversations.find(conv => conv.id === chatId);
    if (conversation) {
      setActiveConversation(conversation);
      
      // If it's an empty conversation, don't fetch - user will start fresh
      if (conversation.isEmpty || !conversation.lastMessage) {
        console.log(`📝 Opening empty conversation slot ${chatId}`);
        return;
      }
      
      // Fetch conversation messages if it has content
      fetchConversation(chatId);
    }
  };

  // FIXED: Enhanced new conversation handler
  const handleNewConversation = () => {
    // Find first empty conversation slot
    const emptySlot = conversations.find(conv => conv.isEmpty || !conv.lastMessage);
    
    if (emptySlot) {
      console.log(`🆕 Starting new conversation in slot ${emptySlot.id}`);
      setActiveConversation({
        ...emptySlot,
        messages: [],
        isEmpty: false
      });
    } else {
      // All slots full - show user they need to clear one
      setShowDeleteModal(true);
    }
  };

  // Handle message editing
  const handleEditMessage = (messageId) => {
    const messageToEdit = activeConversation?.messages.find(msg => msg.id === messageId);
    if (messageToEdit && messageToEdit.isUser) {
      setEditingMessageId(messageId);
      setEditingText(messageToEdit.text);
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingText('');
  };

  const handleSaveEdit = async (messageId) => {
    if (!editingText.trim() || !activeConversation) return;

    const messageIndex = activeConversation.messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;

    const messagesToKeep = activeConversation.messages.slice(0, messageIndex);
    
    const editedMessage = {
      ...activeConversation.messages[messageIndex],
      text: editingText.trim(),
      isEdited: true,
      editedAt: Date.now()
    };

    setActiveConversation(prev => ({
      ...prev,
      messages: [...messagesToKeep, editedMessage]
    }));

    setEditingMessageId(null);
    setEditingText('');

    await sendMessageToWebhook(editedMessage.text);
  };

  // CRITICAL: Enhanced error handling functions
  const addApiError = useCallback((error) => {
    const errorObj = {
      id: Date.now(),
      type: error.type || 'API Error',
      message: error.message,
      timestamp: new Date(),
      canRetry: !error.message.includes('Authentication') && !error.message.includes('401'),
      retryAction: error.retryAction
    };
    
    setApiErrors(prev => [errorObj, ...prev.slice(0, 4)]); // Keep last 5 errors
    setConnectionStatus(prev => ({ ...prev, isOnline: false }));
  }, []);

  const dismissError = useCallback((errorId) => {
    setApiErrors(prev => prev.filter(err => err.id !== errorId));
  }, []);

  const retryErrorAction = useCallback(async (errorId) => {
    const error = apiErrors.find(err => err.id === errorId);
    if (error?.retryAction) {
      dismissError(errorId);
      await error.retryAction();
    }
  }, [apiErrors, dismissError]);

  // CRITICAL: Enhanced connection monitoring
  const checkConnection = useCallback(async () => {
    try {
      setConnectionStatus(prev => ({ ...prev, isReconnecting: true }));
      
      const result = await sendRequestWithRetry(API_CONFIG.endpoints.heartbeat, {
        userId: user.id,
        sessionId: sessionStorage.getItem('celesteos_session_id'),
        timestamp: Date.now(),
        user: {
          email: user.email,
          displayName: user.name || user.displayName || 'Unknown User'
        }
      }, { maxRetries: 1, timeout: 5000 });

      if (result.success) {
        setConnectionStatus({
          isOnline: true,
          isReconnecting: false,
          lastSeen: Date.now()
        });
        
        // Clear connection-related errors
        setApiErrors(prev => prev.filter(err => !err.type.includes('Connection')));
        
        if (result.data.onlineUsers || result.data.activeUsers || result.data.userCount) {
          const count = result.data.onlineUsers || result.data.activeUsers || result.data.userCount;
          setOnlineUserCount(count);
        }
      }
    } catch (error) {
      console.error('❌ Connection check failed:', error);
      addApiError({
        type: 'Connection Error',
        message: 'Unable to reach server',
        retryAction: checkConnection
      });
      setConnectionStatus(prev => ({ ...prev, isReconnecting: false }));
    }
  }, [user, addApiError]);

  const sendMessageToWebhook = async (messageText) => {
    setIsTyping(true);
    setError(null);

    const sessionId = sessionStorage.getItem('celesteos_session_id') || `session_${user.id}_${Date.now()}`;
    
    if (!sessionStorage.getItem('celesteos_session_id')) {
      sessionStorage.setItem('celesteos_session_id', sessionId);
    }

    // Enhanced ChatRequest format with proper chatId
    const requestPayload = {
      userId: user.id,
      userName: user.name || user.displayName || 'Unknown User',
      message: messageText,
      chatId: activeConversation.id,
      sessionId: sessionId,
      streamResponse: true
    };

    // CRITICAL FIX: Create AI message with thinking state immediately (no double messages)
    const aiMessage = {
      id: Date.now() + 1,
      text: 'CelesteOS is thinking...',
      isUser: false,
      role: 'assistant',
      isThinking: true, // NEW: Use thinking state instead of separate typing indicator
      timestamp: new Date().toISOString()
    };

    // Add AI message with thinking state
    setActiveConversation(prev => ({
      ...prev,
      messages: [...prev.messages, aiMessage],
      isEmpty: false
    }));

    try {
      // CRITICAL: Use enhanced retry logic
      const result = await sendRequestWithRetry(API_CONFIG.endpoints.chat, requestPayload);
      
      if (result.success) {
        const data = result.data;
        const aiResponseText = data.response || "No response received from AI service.";
        
        console.log('📊 Enhanced Chat Response:', {
          summary: data.summary,
          category: data.category,
          confidence: data.confidence,
          responseTime: `${data.responseTimeMs}ms`,
          crossChatUsed: data.crossChatUsed,
          stage: data.stage,
          tokensUsed: data.tokensUsed,
          attempts: result.attempt
        });

        // Update the AI message with full response and metadata
        setActiveConversation(prev => ({
          ...prev,
          messages: prev.messages.map(msg => 
            msg.id === aiMessage.id 
              ? {
                  ...msg,
                  text: aiResponseText,
                  isStreaming: false,
                  metadata: {
                    summary: data.summary,
                    category: data.category,
                    confidence: data.confidence,
                    responseTimeMs: data.responseTimeMs,
                    contextUsed: data.contextUsed,
                    crossChatUsed: data.crossChatUsed,
                    stage: data.stage,
                    tokensUsed: data.tokensUsed,
                    attempts: result.attempt
                  }
                }
              : msg
          ),
          lastMessage: aiResponseText.substring(0, 100) + '...',
          timestamp: data.timestamp || Date.now()
        }));

        // Update conversation in list
        setConversations(prev => prev.map(conv => 
          conv.id === activeConversation.id 
            ? { 
                ...conv, 
                lastMessage: aiResponseText.substring(0, 100) + '...', 
                timestamp: data.timestamp || Date.now(),
                isEmpty: false
              }
            : conv
        ));

        // Update connection status on success
        setConnectionStatus(prev => ({ ...prev, isOnline: true, lastSeen: Date.now() }));

      }
    } catch (error) {
      console.error('❌ Enhanced message send error:', error);
      
      // Add structured error with retry capability
      addApiError({
        type: 'Message Send Failed',
        message: error.message,
        retryAction: () => sendMessageToWebhook(messageText)
      });
      
      // Remove the failed AI message
      setActiveConversation(prev => ({
        ...prev,
        messages: prev.messages.filter(msg => msg.id !== aiMessage.id)
      }));
      
      // Remove from streaming
      setStreamingMessages(prev => {
        const newSet = new Set(prev);
        newSet.delete(aiMessage.id);
        return newSet;
      });
    }

    setIsTyping(false);
  };

  // Online users heartbeat
  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        const sessionId = sessionStorage.getItem('celesteos_session_id');
        const response = await fetch('https://api.celeste7.ai/webhook/user-heartbeat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
          credentials: 'omit',
          body: JSON.stringify({
            userId: user.id,
            sessionId: sessionId,
            timestamp: Date.now(),
            user: {
              email: user.email,
              displayName: user.name || user.displayName || 'Unknown User'
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.onlineUsers || data.activeUsers || data.userCount) {
            const count = data.onlineUsers || data.activeUsers || data.userCount;
            setOnlineUserCount(count);
            console.log('👥 Online users updated:', count);
          }
        }
      } catch (error) {
        console.error('❌ Heartbeat failed:', error);
      }
    };

    sendHeartbeat();

    const heartbeatInterval = setInterval(sendHeartbeat, 30000);

    return () => {
      clearInterval(heartbeatInterval);
      
      fetch('https://api.celeste7.ai/webhook/user-offline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({
          userId: user.id,
          sessionId: sessionStorage.getItem('celesteos_session_id'),
          timestamp: Date.now()
        })
      }).catch(console.error);
    };
  }, [user?.id]);

  // CRITICAL: Frontend rate limiting
  const checkRateLimit = useRateLimit(15, 60000); // 15 messages per minute
  const [rateLimitError, setRateLimitError] = useState(null);
  
  // CRITICAL: Enhanced input handling with debouncing
  const handleInputChange = useCallback((e) => {
    setMessage(e.target.value);
    
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
    }
    
    // Reset the debounce timer
    stopTyping();
  }, [isTyping, stopTyping]);

  const handleSendMessage = async () => {
    if (!message.trim() || !activeConversation) return;

    // CRITICAL: Check rate limit before sending
    const rateLimitResult = checkRateLimit();
    if (!rateLimitResult.allowed) {
      setRateLimitError({
        message: `Rate limit exceeded. Please wait ${rateLimitResult.timeUntilReset} seconds before sending another message.`,
        timeUntilReset: rateLimitResult.timeUntilReset
      });
      
      // Auto-clear rate limit error
      setTimeout(() => setRateLimitError(null), rateLimitResult.timeUntilReset * 1000);
      return;
    }

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
    setIsTyping(false); // Stop typing indicator immediately
    setRateLimitError(null); // Clear any existing rate limit errors

    await sendMessageToWebhook(messageToSend);
  };

  // CRITICAL: Message pagination with intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && 
            hasMoreMessages[activeConversation?.id] && 
            !loadingHistory && 
            activeConversation?.messages?.length > 20) {
          loadOlderMessages();
        }
      },
      { threshold: 0.1 }
    );
    
    const topElement = messagesTopRef.current;
    if (topElement && activeConversation?.messages?.length > 20) {
      observer.observe(topElement);
    }
    
    return () => {
      if (topElement) observer.unobserve(topElement);
    };
  }, [hasMoreMessages, loadingHistory, activeConversation?.id]);

  const loadOlderMessages = async () => {
    if (!activeConversation?.id || loadingHistory) return;
    
    setLoadingHistory(true);
    try {
      const currentPage = messagePage[activeConversation.id] || 1;
      const result = await sendRequestWithRetry('/api/messages', {
        chatId: activeConversation.id,
        page: currentPage + 1,
        limit: 20
      });
      
      if (result.success && result.data.messages?.length > 0) {
        setActiveConversation(prev => ({
          ...prev,
          messages: [...result.data.messages.reverse(), ...prev.messages]
        }));
        
        setMessagePage(prev => ({
          ...prev,
          [activeConversation.id]: currentPage + 1
        }));
        
        setHasMoreMessages(prev => ({
          ...prev,
          [activeConversation.id]: result.data.hasMore
        }));
        
        // Maintain scroll position
        messagesTopRef.current?.scrollIntoView({ block: 'end' });
      } else {
        setHasMoreMessages(prev => ({
          ...prev,
          [activeConversation.id]: false
        }));
      }
    } catch (error) {
      console.error('Failed to load older messages:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDeleteConversation = (conversationId) => {
    // Reset the conversation slot instead of deleting it
    const resetConversation = {
      id: conversationId,
      title: `Conversation ${conversationId}`,
      lastMessage: null,
      timestamp: null,
      messages: [],
      isEmpty: true
    };

    const updatedConversations = conversations.map(conv => 
      conv.id === conversationId ? resetConversation : conv
    );
    
    setConversations(updatedConversations);
    
    if (activeConversation?.id === conversationId) {
      setActiveConversation(resetConversation);
    }
    
    setShowDeleteModal(false);
  };

  const fetchConversation = async (conversationId) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      setActiveConversation({
        ...conversation,
        messages: [
          {
            id: 'loading',
            text: 'Loading conversation...',
            isUser: false,
            timestamp: Date.now(),
            isLoading: true
          }
        ]
      });
    }

    try {
      console.log('Fetching conversation:', conversationId, 'for user:', user.id);
      
      const response = await fetch('https://api.celeste7.ai/webhook/fetch-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({
          userId: user.id,
          chatId: conversationId,
          sessionId: sessionStorage.getItem('celesteos_session_id') || `session_${user.id}_${Date.now()}`,
          user: {
            email: user.email,
            displayName: user.name || user.displayName || 'Unknown User'
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetch conversation response:', data);
        
        if (data.success || data.output) {
          let processedMessages = [];
          
          if (data.output) {
            const aiMessage = {
              id: `history_${Date.now()}`,
              text: data.output.trim(),
              isUser: false,
              timestamp: Date.now() - 3600000,
              isHistorical: true
            };
            processedMessages = [aiMessage];
            console.log('✅ Processed single output message:', data.output);
          } else if (data.messages && Array.isArray(data.messages)) {
            processedMessages = data.messages.map(msg => {
              if (!msg.isUser && (msg.userResponse || msg.output)) {
                let formattedText = '';
                
                if (msg.output) {
                  formattedText = msg.output.trim();
                } else if (msg.userResponse) {
                  if (msg.userResponse.message) formattedText += msg.userResponse.message;
                  if (msg.userResponse.action) {
                    if (formattedText) formattedText += '\n';
                    formattedText += msg.userResponse.action;
                  }
                  if (msg.userResponse.question) {
                    if (formattedText) formattedText += '\n';
                    formattedText += msg.userResponse.question;
                  }
                }
                
                return {
                  ...msg,
                  text: formattedText || msg.text || msg.content || msg.message || ''
                };
              }
              return {
                ...msg,
                text: msg.text || msg.content || msg.message || ''
              };
            });
          } else {
            processedMessages = [];
          }
          
          if (conversation) {
            const updatedConversation = {
              ...conversation,
              messages: processedMessages,
              lastMessage: data.output ? data.output.substring(0, 100) + '...' : (processedMessages.length > 0 ? processedMessages[processedMessages.length - 1].text.substring(0, 100) + '...' : 'No messages yet'),
              isEmpty: processedMessages.length === 0
            };
            
            setActiveConversation(updatedConversation);
            
            setConversations(prev => prev.map(conv => 
              conv.id === conversationId 
                ? updatedConversation
                : conv
            ));
          }
          return;
        }
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
    } catch (error) {
      console.error('Fetch conversation error:', error);
      
      if (conversation) {
        setActiveConversation({
          ...conversation,
          messages: [
            {
              id: 'error',
              text: 'Failed to load conversation. This might be a new conversation or the server is unavailable. You can start chatting and your messages will be saved.',
              isUser: false,
              timestamp: Date.now(),
              isError: true
            }
          ]
        });
      }
    }
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'} transition-all duration-500 overflow-hidden`}>
      {/* Premium Sidebar with Glassmorphism */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={`w-80 ${
              isDarkMode 
                ? 'bg-gradient-to-b from-slate-800/90 via-slate-900/95 to-slate-900/90' 
                : 'bg-gradient-to-b from-white/90 via-gray-50/95 to-white/90'
            } backdrop-blur-xl border-r ${
              isDarkMode ? 'border-slate-700/50' : 'border-gray-200/50'
            } flex flex-col shadow-2xl relative overflow-hidden`}
          >
            {/* Premium Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,200,230,0.3),transparent)] animate-pulse"></div>
              <div className="absolute top-0 left-0 w-full h-full bg-[conic-gradient(from_0deg_at_50%_50%,transparent,rgba(120,200,230,0.1),transparent)]"></div>
            </div>

            {/* Enhanced Sidebar Header */}
            <div className={`p-6 border-b ${isDarkMode ? 'border-slate-700/30' : 'border-gray-200/30'} relative z-10`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="relative group">
                    <motion.div 
                      className="w-12 h-12 bg-gradient-to-br from-blue-400 via-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-xl relative overflow-hidden"
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {/* Shimmer effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      />
                      <img 
                        src="https://images.unsplash.com/photo-1633412802994-5c058f151b66?w=100&h=100&fit=crop&crop=center"
                        alt="CelesteOS"
                        className="w-8 h-8 rounded-xl object-cover relative z-10"
                      />
                    </motion.div>
                    <motion.div 
                      className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-lg"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  <div>
                    <motion.h1 
                      className={`text-xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent`}
                      style={{ fontFamily: 'Eloquia-Text, sans-serif' }}
                      animate={{ 
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      Celeste<span className="text-slate-400">OS</span>
                    </motion.h1>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'} font-medium`}>
                      Proactive AI Assistant
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`p-3 rounded-xl ${
                    isDarkMode 
                      ? 'bg-slate-700/50 hover:bg-slate-600/50 text-amber-400' 
                      : 'bg-white/50 hover:bg-white/80 text-slate-600'
                  } transition-all duration-300 backdrop-blur-sm border ${
                    isDarkMode ? 'border-slate-600/30' : 'border-white/30'
                  } shadow-lg`}
                  whileHover={{ scale: 1.05, rotate: 180 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isDarkMode ? (
                    <Sun className="drop-shadow-sm" size={18} />
                  ) : (
                    <Moon className="drop-shadow-sm" size={18} />
                  )}
                </motion.button>
              </div>

              {/* Premium Status Card */}
              <motion.div 
                className={`mb-6 p-4 rounded-2xl ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-slate-700/40 via-slate-800/30 to-slate-700/40' 
                    : 'bg-gradient-to-br from-white/80 via-gray-50/60 to-white/80'
                } border ${
                  isDarkMode ? 'border-slate-600/30' : 'border-white/50'
                } backdrop-blur-sm shadow-xl relative overflow-hidden`}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Animated background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/5 to-blue-500/10"
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <motion.div 
                          className={`w-3 h-3 rounded-full ${
                            connectionStatus.isOnline 
                              ? 'bg-gradient-to-r from-emerald-400 to-green-500' 
                              : 'bg-gradient-to-r from-red-400 to-red-500'
                          }`}
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        {connectionStatus.isOnline && (
                          <motion.div 
                            className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full"
                            animate={{ scale: [1, 2, 1], opacity: [0.7, 0, 0.7] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}
                      </div>
                      <div>
                        <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {onlineUserCount} {onlineUserCount === 1 ? 'user' : 'users'} online
                        </span>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {connectionStatus.isOnline ? 'Connected' : 'Reconnecting...'}
                        </p>
                      </div>
                    </div>
                    <ConnectionStatus 
                      isOnline={connectionStatus.isOnline}
                      isReconnecting={connectionStatus.isReconnecting}
                      onReconnect={checkConnection}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                  
                  {/* Enhanced API Error Display */}
                  <AnimatePresence>
                    {apiErrors.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 mt-3 pt-3 border-t border-slate-600/20"
                      >
                        {apiErrors.slice(0, 2).map((error) => (
                          <motion.div 
                            key={error.id} 
                            className={`text-xs p-3 rounded-xl ${
                              isDarkMode 
                                ? 'bg-red-900/30 text-red-300 border border-red-700/30' 
                                : 'bg-red-50 text-red-600 border border-red-200/50'
                            } backdrop-blur-sm`}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{error.type}</span>
                              <button
                                onClick={() => dismissError(error.id)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                              >
                                <X size={12} />
                              </button>
                            </div>
                            <p className="mt-1 truncate opacity-80">{error.message}</p>
                            {error.canRetry && (
                              <motion.button
                                onClick={() => retryErrorAction(error.id)}
                                className="mt-2 text-xs underline hover:no-underline flex items-center space-x-1 opacity-80 hover:opacity-100"
                                whileHover={{ scale: 1.05 }}
                              >
                                <RefreshCw size={10} />
                                <span>Retry</span>
                              </motion.button>
                            )}
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
              
              {/* Premium New Conversation Button */}
              <motion.button
                onClick={handleNewConversation}
                className="w-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center space-x-3 shadow-2xl relative overflow-hidden group"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Animated background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-white/20"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="relative z-10 flex items-center space-x-3"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                  <span>New Conversation</span>
                </motion.div>
              </motion.button>
            </div>

            {/* FIXED: Use Enhanced ConversationSwitcher with caching */}
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
              <ConversationSwitcher
                userId={user.id}
                currentChatId={activeConversation?.id}
                onSwitch={handleConversationSwitch}
                conversations={conversations}
                setConversations={setConversations}
                isDarkMode={isDarkMode}
              />
            </div>

            {/* Sidebar Footer */}
            <div className={`p-4 border-t ${isDarkMode ? 'border-[#2a2a2a]' : 'border-gray-200'} backdrop-blur-sm`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#73c2e2] to-[#badde9] rounded-full flex items-center justify-center shadow-lg">
                      <User size={18} className="text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <p className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.name}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</p>
                  </div>
                </div>
                <motion.button
                  onClick={onLogout}
                  className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-[#2a2a2a]' : 'hover:bg-gray-200'} transition-colors duration-200`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogOut size={18} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className={`flex-shrink-0 ${isDarkMode ? 'bg-[#171717]/80' : 'bg-white/80'} backdrop-blur-xl border-b ${isDarkMode ? 'border-[#2a2a2a]' : 'border-gray-200'} p-4 flex items-center justify-between sticky top-0 z-10`}>
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-3 rounded-lg ${isDarkMode ? 'hover:bg-[#2a2a2a]' : 'hover:bg-gray-100'} transition-all duration-200`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Menu size={20} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
            </motion.button>
            <div>
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {activeConversation?.title || 'Select a conversation'}
              </h2>
              {activeConversation && (
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Chat #{activeConversation.id} • CelesteOS is ready to assist
                </p>
              )}
            </div>
          </div>
          
          {activeConversation && (
            <div className="flex items-center space-x-2">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                isDarkMode ? 'bg-[#2a2a2a] text-gray-300' : 'bg-gray-100 text-gray-600'
              }`}>
                #{activeConversation.id}
              </div>
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            {activeConversation?.messages?.length === 0 || activeConversation?.isEmpty ? (
              <div className="flex-1 flex items-center justify-center min-h-[60vh]">
                <motion.div 
                  className="text-center max-w-md"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-[#73c2e2] to-[#badde9] rounded-3xl flex items-center justify-center shadow-2xl">
                    <div className="flex items-center space-x-1">
                      <Hash className="text-white" size={16} />
                      <span className="text-white font-bold text-lg">{activeConversation?.id}</span>
                    </div>
                  </div>
                  <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                    {activeConversation?.title}
                  </h3>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-lg leading-relaxed`}>
                    Your conversation slot #{activeConversation?.id} is ready. Start chatting with CelesteOS!
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2 justify-center">
                    {['Ask me anything', 'Get creative help', 'Solve problems', 'Learn something new'].map((suggestion, index) => (
                      <motion.button
                        key={suggestion}
                        onClick={() => setMessage(suggestion)}
                        className={`px-4 py-2 rounded-full text-sm ${isDarkMode ? 'bg-[#2a2a2a] text-gray-300 hover:bg-[#373737]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-all duration-200 hover:scale-105`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {suggestion}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="space-y-6 pb-6">
                {activeConversation?.messages.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className={`group ${msg.isUser ? 'flex justify-end' : 'flex justify-start'}`}
                  >
                    <div className={`relative max-w-3xl w-full ${msg.isUser ? 'flex justify-end' : 'flex justify-start'}`}>
                      {!msg.isUser && (
                        <div className="flex-shrink-0 mr-4">
                          <div className="w-8 h-8 bg-gradient-to-r from-[#73c2e2] to-[#badde9] rounded-full flex items-center justify-center shadow-lg">
                            <img 
                              src="https://images.unsplash.com/photo-1633412802994-5c058f151b66?w=100&h=100&fit=crop&crop=center"
                              alt="CelesteOS"
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className={`flex-1 ${msg.isUser ? 'flex justify-end' : ''}`}>
                        <div className={`relative group/message ${
                          msg.isUser 
                            ? 'bg-[#181818] text-white rounded-3xl rounded-br-lg px-6 py-4 border-2 border-transparent bg-clip-padding relative max-w-2xl' 
                            : msg.isLoading
                              ? `${isDarkMode ? 'text-gray-300' : 'text-gray-700'} rounded-3xl rounded-bl-lg px-0 py-2 max-w-full`
                              : msg.isError
                                ? `${isDarkMode ? 'text-red-300' : 'text-red-700'} rounded-3xl rounded-bl-lg px-0 py-2 max-w-full`
                                : `${isDarkMode ? 'text-gray-100' : 'text-gray-900'} rounded-3xl rounded-bl-lg px-0 py-2 max-w-full`
                        }`}>
                          
                          {msg.isUser && (
                            <div className="absolute inset-0 rounded-3xl rounded-br-lg bg-gradient-to-r from-[#73c2e2] to-[#badde9] p-[1px] -z-10">
                              <div className="h-full w-full rounded-3xl rounded-br-lg bg-[#181818]"></div>
                            </div>
                          )}
                          
                          {editingMessageId === msg.id ? (
                            <div className="space-y-3">
                              <textarea
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className={`w-full bg-transparent border-none outline-none resize-none ${
                                  isDarkMode ? 'text-white' : 'text-gray-900'
                                } placeholder-gray-400`}
                                placeholder="Edit your message..."
                                autoFocus
                              />
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleSaveEdit(msg.id)}
                                  className="px-4 py-2 bg-[#73c2e2] text-white rounded-lg text-sm font-medium hover:bg-[#5bb3db] transition-colors"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className={`px-4 py-2 ${isDarkMode ? 'bg-[#373737] text-gray-300' : 'bg-gray-200 text-gray-700'} rounded-lg text-sm font-medium transition-colors`}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className={`whitespace-pre-wrap leading-relaxed ${
                                msg.isUser ? 'text-white' : isDarkMode ? 'text-gray-100' : 'text-gray-900'
                              }`}>
                                {msg.isLoading ? (
                                  <div className="flex items-center space-x-3">
                                    <div className="flex space-x-1">
                                      <div className="w-3 h-3 bg-[#73c2e2] rounded-full animate-pulse"></div>
                                      <div className="w-3 h-3 bg-[#73c2e2] rounded-full animate-pulse animation-delay-200"></div>
                                      <div className="w-3 h-3 bg-[#73c2e2] rounded-full animate-pulse animation-delay-400"></div>
                                    </div>
                                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>CelesteOS is thinking...</span>
                                  </div>
                                ) : msg.isUser ? (
                                  // FIXED: Proper rendering for user messages
                                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                                ) : (
                                  // FIXED: AI messages with TypewriterEffect and ReactMarkdown  
                                  <div className="whitespace-pre-wrap">
                                    {msg.isStreaming ? (
                                      <TypewriterEffect 
                                        text={msg.text} 
                                        speed={msg.metadata?.responseTimeMs ? Math.max(20, Math.min(60, 3000 / msg.text.length)) : 30}
                                        onComplete={() => handleStreamingComplete(msg.id)}
                                      />
                                    ) : (
                                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                                    )}
                                    
                                    {/* Cross-chat indicator */}
                                    {msg.metadata?.crossChatUsed && (
                                      <div className="mt-3 p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                          <span className="text-purple-400">💡</span>
                                          <span className={`text-sm ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                                            Used insights from your other conversations
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              {!msg.isLoading && (
                                <div className="flex items-center justify-between mt-4">
                                  <div className="flex items-center space-x-2">
                                    <p className={`text-xs ${
                                      msg.isUser ? 'text-white/70' : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                    }`}>
                                      {new Date(msg.timestamp).toLocaleTimeString()}
                                      {/* CRITICAL: Enhanced metadata display with retry info */}
                                      {!msg.isUser && msg.metadata?.responseTimeMs && (
                                        <span className="ml-2 text-xs">
                                          ({(msg.metadata.responseTimeMs / 1000).toFixed(1)}s
                                          {msg.metadata.attempts > 1 && (
                                            <span className="text-yellow-400 ml-1" title={`Required ${msg.metadata.attempts} attempts`}>
                                              ⚡{msg.metadata.attempts}
                                            </span>
                                          )}
                                          )
                                        </span>
                                      )}
                                    </p>
                                    {msg.isEdited && (
                                      <span className={`text-xs px-2 py-1 rounded-full ${
                                        msg.isUser ? 'bg-white/20 text-white/70' : isDarkMode ? 'bg-[#373737] text-gray-400' : 'bg-gray-200 text-gray-500'
                                      }`}>
                                        edited
                                      </span>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center space-x-2">
                                    {msg.metadata?.crossChatUsed && (
                                      <span className={`text-xs px-2 py-1 rounded-full ${
                                        isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-200 text-purple-700'
                                      }`}>
                                        💡 Cross-chat
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                          
                          {msg.isUser && editingMessageId !== msg.id && (
                            <div className="absolute -right-2 top-2 opacity-0 group-hover/message:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEditMessage(msg.id)}
                                className="p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-colors"
                                title="Edit message"
                              >
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {msg.isUser && (
                        <div className="flex-shrink-0 ml-4">
                          <div className="w-8 h-8 bg-gradient-to-r from-[#73c2e2] to-[#badde9] rounded-full flex items-center justify-center shadow-lg">
                            <User size={16} className="text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#73c2e2] to-[#badde9] rounded-full flex items-center justify-center shadow-lg">
                        <img 
                          src="https://images.unsplash.com/photo-1633412802994-5c058f151b66?w=100&h=100&fit=crop&crop=center"
                          alt="CelesteOS"
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      </div>
                      <div className={`${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-100'} rounded-3xl rounded-bl-lg px-6 py-4 shadow-sm`}>
                        <div className="flex items-center space-x-3">
                          <div className="flex space-x-1">
                            <div className="w-3 h-3 bg-[#73c2e2] rounded-full animate-pulse"></div>
                            <div className="w-3 h-3 bg-[#73c2e2] rounded-full animate-pulse animation-delay-200"></div>
                            <div className="w-3 h-3 bg-[#73c2e2] rounded-full animate-pulse animation-delay-400"></div>
                          </div>
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>CelesteOS is thinking...</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* CRITICAL: Enhanced Error Display */}
        <AnimatePresence>
          {apiErrors.length > 0 && (
            <div className="max-w-4xl mx-auto px-4 pb-4 space-y-3">
              {apiErrors.slice(0, 3).map((error) => (
                <ErrorDisplay
                  key={error.id}
                  error={error}
                  onRetry={() => retryErrorAction(error.id)}
                  onDismiss={() => dismissError(error.id)}
                  isDarkMode={isDarkMode}
                />
              ))}
              {apiErrors.length > 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-center text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  +{apiErrors.length - 3} more errors (check sidebar for details)
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        {activeConversation && (
          <div className="flex-shrink-0 border-t border-transparent px-4 pb-6">
            <div className="max-w-4xl mx-auto">
              {/* CRITICAL: Rate Limit Error Display */}
              <AnimatePresence>
                {rateLimitError && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`mb-4 p-3 rounded-xl ${
                      isDarkMode ? 'bg-yellow-900/20 border-yellow-500/30 text-yellow-300' : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                    } border text-sm flex items-center space-x-2`}
                  >
                    <AlertTriangle size={16} />
                    <span>{rateLimitError.message}</span>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className={`relative ${isDarkMode ? 'bg-[#181818]' : 'bg-white'} rounded-3xl border-2 border-transparent bg-clip-padding shadow-2xl backdrop-blur-xl transition-all duration-300`}>
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#73c2e2] to-[#badde9] p-[1px] -z-10">
                  <div className={`h-full w-full rounded-3xl ${isDarkMode ? 'bg-[#181818]' : 'bg-white'}`}></div>
                </div>
                <div className="flex items-end p-4">
                  <div className="flex-1 relative">
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
                      placeholder={`Message CelesteOS (Chat #${activeConversation.id})...`}
                      className={`w-full bg-transparent border-none outline-none resize-none ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      } placeholder-gray-400 text-base leading-relaxed`}
                      style={{ minHeight: '24px', maxHeight: '200px' }}
                      disabled={!!rateLimitError}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isTyping || !!rateLimitError}
                    className={`relative ml-4 p-3 rounded-2xl transition-all duration-200 ${
                      message.trim() && !isTyping && !rateLimitError
                        ? 'bg-[#181818] text-white shadow-lg hover:shadow-xl border-2 border-transparent bg-clip-padding'
                        : isDarkMode
                          ? 'bg-[#373737] text-gray-500'
                          : 'bg-gray-200 text-gray-400'
                    } disabled:cursor-not-allowed`}
                  >
                    {message.trim() && !isTyping && !rateLimitError && (
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#73c2e2] to-[#badde9] p-[1px] -z-10">
                        <div className="h-full w-full rounded-2xl bg-[#181818]" />
                      </div>
                    )}
                    {isTyping ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : rateLimitError ? (
                      <Clock size={20} />
                    ) : (
                      <Send size={20} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CRITICAL: Performance Monitor (Development Only) */}
      <PerformanceMonitor />

      {/* CRITICAL: Hide Emergent Badge */}
      <style jsx global>{`
        #emergent-badge {
          display: none !important;
        }
      `}</style>

      {/* FIXED: Enhanced Delete Modal */}
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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-white'} rounded-2xl p-6 max-w-md w-full`}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-[#181818]'} mb-4`}>
                All Conversation Slots Full
              </h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                You have 10 conversation slots. Clear one to start a new conversation.
              </p>
              <div className="space-y-2 mb-6 max-h-40 overflow-y-auto">
                {conversations.filter(conv => !conv.isEmpty).map((conversation) => (
                  <div key={conversation.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                    isDarkMode ? 'border-gray-600 bg-[#373737]' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div>
                      <div className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        #{conversation.id} {conversation.title}
                      </div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} truncate max-w-48`}>
                        {conversation.lastMessage || 'No messages'}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteConversation(conversation.id)}
                      className="text-red-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                      title="Clear this conversation"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-full bg-gradient-to-r from-[#73c2e2] to-[#badde9] text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all"
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

// CRITICAL: Export all components as a single object (matching your original export)
const Components = {
  LoadingScreen,
  AuthScreen,
  OnboardingScreen,
  ChatInterface
};

export default Components;