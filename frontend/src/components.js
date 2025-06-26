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
  // Switch between local and production
  baseUrl: 'http://localhost:5678/webhook', // Local n8n for testing
  // baseUrl: 'https://api.celeste7.ai/webhook', // Production
  
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
  maxRetries: 3, // Default retries for most endpoints
  chatMaxRetries: 1, // No retries for chat messages
  retryDelay: 1000
};

// CRITICAL: Lean retry logic - no bullshit metrics
const sendRequestWithRetry = async (endpoint, payload, options = {}) => {
  const { maxRetries = API_CONFIG.maxRetries, timeout = API_CONFIG.timeout } = options;
  const url = `${API_CONFIG.baseUrl}${endpoint}`;
  let lastError;
  
  // Only retry on network errors, not application errors
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`📡 Attempt ${attempt + 1}/${maxRetries} to ${endpoint}`);
      
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
      
      // If we got a response (even error), don't retry
      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ Success on attempt ${attempt + 1}`);
        return { success: true, data, attempt: attempt + 1 };
      }
      
      // Server responded with error - don't retry these
      console.log(`❌ Server error ${response.status} - not retrying`);
      return { success: false, data, error: `HTTP ${response.status}`, attempt: attempt + 1 };
      
    } catch (error) {
      lastError = error;
      console.error(`❌ Network error on attempt ${attempt + 1}:`, error.message);
      
      // Only retry on network/timeout errors
      if (error.name === 'AbortError' || error.message.includes('Failed to fetch')) {
        if (attempt < maxRetries - 1) {
          const delay = API_CONFIG.retryDelay * Math.pow(2, attempt);
          console.log(`⏳ Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      // Don't retry on other errors
      break;
    }
  }
  
  throw new Error(`Request failed: ${lastError.message}`);
};

// TypewriterEffect Component - Premium feel
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
          <motion.button
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
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
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
        transition={{ duration: 0.8, ease: "easeOut" }}
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
        >
          Celeste<span className="text-white/80">OS</span>
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
      }, { maxRetries: 1 });
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
      <motion.div 
        className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-gradient-to-r from-[#73c2e2] to-[#badde9] p-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <motion.h1 
              className="text-2xl font-bold"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Welcome to CelesteOS
            </motion.h1>
            <motion.div 
              className="text-right"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <div className="text-2xl font-bold">{currentStep}/{steps.length}</div>
            </motion.div>
          </div>
          
          <div className="relative">
            <div className="w-full bg-white/20 rounded-full h-3">
              <motion.div 
                className="bg-white h-3 rounded-full shadow-lg"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>
          </div>
        </div>

        <div className="p-8">
          <motion.h2 
            key={currentStep}
            className="text-2xl font-semibold text-[#181818] mb-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            {currentStepData.question}
          </motion.h2>

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
                  className={`p-6 rounded-2xl border-2 text-left font-medium transition-all ${
                    isSelected
                      ? 'border-[#73c2e2] bg-gradient-to-r from-[#73c2e2]/10 to-[#badde9]/10 text-[#181818] shadow-lg'
                      : 'border-gray-200 hover:border-[#73c2e2]/50 hover:bg-gray-50 text-gray-700'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative">
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-[#73c2e2] to-[#badde9] rounded-full flex items-center justify-center"
                      >
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </motion.div>
                    )}
                    {displayText}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>

          <div className="flex items-center justify-between">
            <motion.button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-xl font-medium ${
                currentStep === 1 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-600 hover:text-[#73c2e2] border border-gray-200 hover:border-[#73c2e2]/50 transition-all'
              }`}
              whileHover={currentStep > 1 ? { scale: 1.05 } : {}}
              whileTap={currentStep > 1 ? { scale: 0.95 } : {}}
            >
              <ChevronLeft className="inline mr-1" size={16} />
              Back
            </motion.button>

            <motion.button
              onClick={handleNext}
              disabled={!isStepComplete || isSubmitting}
              className={`px-8 py-4 rounded-xl font-medium shadow-lg ${
                isStepComplete && !isSubmitting
                  ? 'bg-gradient-to-r from-[#73c2e2] to-[#badde9] text-white hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              whileHover={isStepComplete && !isSubmitting ? { scale: 1.02, y: -2 } : {}}
              whileTap={isStepComplete && !isSubmitting ? { scale: 0.98 } : {}}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <motion.div 
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Setting up...
                </div>
              ) : currentStep === steps.length ? (
                <>Complete</>
              ) : (
                <>
                  Continue
                  <ChevronRight className="inline ml-1" size={16} />
                </>
              )}
            </motion.button>
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
      const endpoint = isSignUp ? `${API_CONFIG.endpoints.auth}/signup` : API_CONFIG.endpoints.login;
      
      const result = await sendRequestWithRetry(endpoint, {
        email: formData.email,
        password: formData.password,
        name: isSignUp ? formData.name : undefined
      }, { maxRetries: 2 }); // Limit auth retries

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
      <motion.div 
        className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-8">
          <motion.div
            className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[#73c2e2] to-[#badde9] rounded-2xl flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <img 
              src="https://images.unsplash.com/photo-1633412802994-5c058f151b66?w=100&h=100&fit=crop&crop=center"
              alt="CelesteOS"
              className="w-10 h-10 rounded-xl object-cover"
            />
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#73c2e2] to-[#badde9] bg-clip-text text-transparent mb-2">
            CelesteOS
          </h1>
          <p className="text-gray-600">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <motion.input
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#73c2e2] focus:border-transparent transition-all"
              required
            />
          )}
          
          <input
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#73c2e2] focus:border-transparent transition-all"
            required
          />
          
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#73c2e2] focus:border-transparent transition-all pr-12"
              required
            />
            <motion.button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#73c2e2] transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </motion.button>
          </div>

          {isSignUp && (
            <motion.input
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#73c2e2] focus:border-transparent transition-all"
              required
            />
          )}

          {error && (
            <motion.div 
              className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-xl"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#73c2e2] to-[#badde9] text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            whileHover={!isLoading ? { scale: 1.02, y: -1 } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <motion.div 
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Processing...
              </div>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </motion.button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <motion.button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setFormData({ email: '', password: '', confirmPassword: '', name: '' });
              }}
              className="text-[#73c2e2] hover:text-[#5bb3db] ml-1 font-medium transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </motion.button>
          </p>
        </div>
      </motion.div>
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [onlineUserCount, setOnlineUserCount] = useState(1);
  const [streamingMessages, setStreamingMessages] = useState(new Set());
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  
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
      console.log('🏁 Initializing conversations for user:', user?.id);
      try {
        const response = await sendRequestWithRetry(API_CONFIG.endpoints.fetchConversations, {
          userId: user.id
        }, { maxRetries: 1 });

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
  }, [user?.id]); // Only run when user ID changes

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
    console.log('🔄 Switching to conversation:', chatId);
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
    if (isSending) {
      console.warn('⚠️ Already sending, ignoring duplicate request');
      return;
    }
    
    console.log('📤 Starting send for:', messageText);
    setIsSending(true);
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
      const result = await sendRequestWithRetry(API_CONFIG.endpoints.chat, requestPayload, {
        maxRetries: API_CONFIG.chatMaxRetries // Use specific chat retry limit
      });
      
      if (result.success && result.data) {
        console.log('✅ Got successful response:', result);
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
        
        console.log('✅ Message sent successfully');
      } else {
        // Handle non-success response without retrying
        console.error('❌ Got non-success response:', result);
        throw new Error(result.error || 'Failed to get response');
      }
      
      setIsSending(false);
    } catch (error) {
      console.error('❌ Message send failed:', error);
      setError(error.message);
      
      // Remove failed message
      setActiveConversation(prev => ({
        ...prev,
        messages: prev.messages.filter(msg => msg.id !== aiMessage.id)
      }));
      
      setIsSending(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !activeConversation || isSending) return;
    
    console.log('🚀 Sending message:', message.trim());

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
    console.log('📥 Fetching conversation:', conversationId);
    try {
      const response = await sendRequestWithRetry(API_CONFIG.endpoints.fetchChat, {
        userId: user.id,
        chatId: conversationId,
        sessionId: sessionStorage.getItem('celesteos_session_id') || `session_${user.id}_${Date.now()}`
      }, { maxRetries: 1 });

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
        console.log('💓 Sending heartbeat');
        const response = await sendRequestWithRetry(API_CONFIG.endpoints.heartbeat, {
          userId: user.id,
          timestamp: Date.now()
        }, { maxRetries: 1 }); // Don't retry heartbeat

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
      }, { maxRetries: 1 }).catch(console.error);
    };
  }, [user?.id]);

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'} transition-all duration-500`}>
      {/* Premium Sidebar with Glassmorphism */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={`w-80 ${isDarkMode ? 'bg-slate-800/90 backdrop-blur-xl' : 'bg-white/90 backdrop-blur-xl'} border-r ${isDarkMode ? 'border-slate-700/50' : 'border-gray-200/50'} flex flex-col shadow-2xl`}
          >
            {/* Sidebar Header */}
            <div className={`p-6 border-b ${isDarkMode ? 'border-slate-700/30' : 'border-gray-200/30'}`}>
              <div className="flex items-center justify-between mb-6">
                <motion.h1 
                  className="text-xl font-bold bg-gradient-to-r from-[#73c2e2] to-[#badde9] bg-clip-text text-transparent"
                  whileHover={{ scale: 1.05 }}
                >
                  CelesteOS
                </motion.h1>
                <motion.button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`p-3 rounded-xl ${isDarkMode ? 'bg-slate-700/50 hover:bg-slate-600/50' : 'bg-gray-100/50 hover:bg-gray-200/50'} transition-all duration-300 backdrop-blur-sm`}
                  whileHover={{ scale: 1.05, rotate: 180 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-600" />}
                </motion.button>
              </div>

              <motion.div 
                className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-700/40' : 'bg-gray-100/60'} backdrop-blur-sm`}
                whileHover={{ scale: 1.02 }}
              >
                <span className="text-sm font-medium">
                  {onlineUserCount} {onlineUserCount === 1 ? 'user' : 'users'} online
                </span>
              </motion.div>
              
              <motion.button
                onClick={handleNewConversation}
                className="w-full mt-4 bg-gradient-to-r from-[#73c2e2] to-[#badde9] text-white px-4 py-3 rounded-xl font-medium flex items-center justify-center space-x-2 shadow-lg"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={20} />
                <span>New Conversation</span>
              </motion.button>
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
            <div className={`p-4 border-t ${isDarkMode ? 'border-slate-700/30' : 'border-gray-200/30'} backdrop-blur-sm`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <motion.div 
                    className="relative"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-[#73c2e2] to-[#badde9] rounded-full flex items-center justify-center shadow-lg">
                      <User size={18} className="text-white" />
                    </div>
                    <motion.div 
                      className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                  <div>
                    <p className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {user.name}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {user.email}
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={onLogout}
                  className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-100/50'} transition-all`}
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
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className={`${isDarkMode ? 'bg-slate-800/80 backdrop-blur-xl' : 'bg-white/80 backdrop-blur-xl'} border-b ${isDarkMode ? 'border-slate-700/30' : 'border-gray-200/30'} p-4 flex items-center justify-between sticky top-0 z-10`}>
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-3 rounded-xl ${isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-100/50'} transition-all`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Menu size={20} />
            </motion.button>
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
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <motion.div 
                    className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-[#73c2e2] to-[#badde9] rounded-3xl flex items-center justify-center shadow-2xl"
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Hash size={28} className="text-white" />
                    <span className="text-white font-bold text-xl">{activeConversation?.id}</span>
                  </motion.div>
                  <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                    Start a conversation
                  </h3>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-8`}>
                    Ask CelesteOS anything!
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {['How can I grow my business?', 'Help me be more productive', 'I need creative ideas'].map((suggestion, index) => (
                      <motion.button
                        key={suggestion}
                        onClick={() => setMessage(suggestion)}
                        className={`px-4 py-2 rounded-full text-sm ${isDarkMode ? 'bg-slate-700/50 text-gray-300 hover:bg-slate-600/50' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-all`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {suggestion}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="space-y-6">
                {activeConversation?.messages.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <motion.div 
                      className={`max-w-3xl ${msg.isUser ? 'bg-gradient-to-r from-[#181818] to-[#282828] text-white' : isDarkMode ? 'bg-slate-700/80 backdrop-blur-sm text-white' : 'bg-gray-100 text-gray-900'} rounded-2xl px-6 py-4 shadow-lg`}
                      whileHover={{ scale: 1.01 }}
                    >
                      {msg.isThinking ? (
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <motion.div 
                              className="w-2 h-2 bg-[#73c2e2] rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                            />
                            <motion.div 
                              className="w-2 h-2 bg-[#73c2e2] rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                            />
                            <motion.div 
                              className="w-2 h-2 bg-[#73c2e2] rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                            />
                          </div>
                          <span className="text-sm opacity-70">CelesteOS is thinking</span>
                        </div>
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
                    </motion.div>
                  </motion.div>
                ))}
                
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
          <motion.div 
            className="border-t border-transparent px-4 pb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="max-w-4xl mx-auto">
              <motion.div 
                className={`${isDarkMode ? 'bg-slate-800/80 backdrop-blur-xl' : 'bg-white/80 backdrop-blur-xl'} rounded-2xl shadow-2xl p-4 border ${isDarkMode ? 'border-slate-700/30' : 'border-gray-200/30'}`}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-end">
                  <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && !isSending) {
                        e.preventDefault();
                        e.stopPropagation(); // Prevent event bubbling
                        handleSendMessage();
                      }
                    }}
                    placeholder="Message CelesteOS..."
                    className={`flex-1 bg-transparent border-none outline-none resize-none ${isDarkMode ? 'text-white' : 'text-gray-900'} placeholder-gray-400`}
                    style={{ minHeight: '24px', maxHeight: '200px' }}
                  />
                  <motion.button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isSending}
                    className={`ml-4 p-3 rounded-xl ${
                      message.trim() && !isSending
                        ? 'bg-gradient-to-r from-[#73c2e2] to-[#badde9] text-white shadow-lg'
                        : 'bg-gray-300 text-gray-500'
                    } disabled:cursor-not-allowed transition-all duration-200`}
                    whileHover={message.trim() && !isSending ? { scale: 1.1 } : {}}
                    whileTap={message.trim() && !isSending ? { scale: 0.9 } : {}}
                  >
                    {isSending ? (
                      <motion.div 
                        className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    ) : (
                      <Send size={20} />
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-6 max-w-md w-full shadow-2xl`}
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
                  <motion.div 
                    key={conv.id} 
                    className={`flex items-center justify-between p-3 rounded-lg border ${isDarkMode ? 'border-slate-700 bg-slate-700/50' : 'border-gray-200 bg-gray-50'}`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <span>#{conv.id} {conv.title}</span>
                    <motion.button
                      onClick={() => handleDeleteConversation(conv.id)}
                      className="text-red-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
              <motion.button
                onClick={() => setShowDeleteModal(false)}
                className="w-full bg-gradient-to-r from-[#73c2e2] to-[#badde9] text-white py-3 rounded-xl font-medium shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom styles for premium feel */}
      <style jsx global>{`
        /* Hide scrollbar for premium feel */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #73c2e2;
          border-radius: 3px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #5bb3db;
        }
        
        /* Premium transitions */
        * {
          transition-property: background-color, border-color, color, fill, stroke;
          transition-duration: 200ms;
        }
      `}</style>
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