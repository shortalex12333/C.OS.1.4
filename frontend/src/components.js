import React, { useState, useEffect, useRef } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { useInterventionsWithEvents } from './hooks/useInterventions';

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
      
      const response = await fetch('http://46.62.139.129:5678/webhook-test/profile-building', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({
          userId: user.id,
          stage: stage,
          data: stageData
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Stage ${stage} response:`, data);
        return data;
      }
    } catch (error) {
      console.error(`Stage ${stage} error:`, error);
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-[#181818]" style={{ fontFamily: 'Eloquia-Text, sans-serif' }}>
              Quick Setup
            </h1>
            <span className="text-gray-500 text-sm font-medium">
              {currentStep} of {steps.length}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <motion.div 
              className="bg-gradient-to-r from-[#73c2e2] to-[#badde9] h-2 rounded-full"
              initial={{ width: '25%' }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Question */}
          <motion.h2 
            className="text-xl font-semibold text-[#181818] mb-6"
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            {currentStepData.question}
          </motion.h2>
        </div>

        {/* Options */}
        <motion.div 
          className="space-y-3 mb-8"
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
                className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all ${
                  isSelected
                    ? 'border-[#73c2e2] bg-gradient-to-r from-[#73c2e2]/10 to-[#badde9]/10 text-[#181818]'
                    : 'border-gray-200 hover:border-[#73c2e2]/50 hover:bg-gray-50 text-gray-700'
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {displayText}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
              currentStep === 1 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-600 hover:text-[#73c2e2] hover:bg-gray-100'
            }`}
          >
            <ChevronLeft size={18} />
            <span>Back</span>
          </button>

          <motion.button
            onClick={handleNext}
            disabled={!canProceed || isSubmitting}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
              canProceed && !isSubmitting
                ? 'bg-gradient-to-r from-[#73c2e2] to-[#badde9] text-white hover:shadow-lg transform hover:scale-[1.02]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            whileHover={canProceed ? { scale: 1.02 } : {}}
            whileTap={canProceed ? { scale: 0.98 } : {}}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Setting up...</span>
              </>
            ) : currentStep === steps.length ? (
              <span>Complete Setup</span>
            ) : (
              <>
                <span>Next</span>
                <ChevronRight size={18} />
              </>
            )}
          </motion.button>
        </div>

        {/* Footer message */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            This helps us personalize your AI experience
          </p>
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
      const endpoint = isSignUp ? 'signup' : 'login'; // Changed from 'signin' to 'login'
      const response = await fetch(`http://46.62.139.129:5678/webhook/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: isSignUp ? formData.name : undefined
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          onLogin(data.user, data.token);
        } else {
          setError(data.message || 'Authentication failed');
        }
      } else {
        console.error('❌ Auth failed with status:', response.status);
        console.error('❌ Response headers:', [...response.headers.entries()]);
        
        // Check if it's a CORS preflight issue
        if (response.status === 0) {
          setError('Network connection issue. Please check your internet connection.');
        } else {
          setError(`Authentication failed (${response.status}). Please try again.`);
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      
      // Check if it's a CORS error
      if (error.message.includes('CORS') || error.message.includes('NetworkError')) {
        setError('Network connection issue. Using demo mode.');
      } else {
        setError('Authentication service unavailable. Using demo mode.');
      }
      
      // For demo purposes, simulate successful login
      setTimeout(() => {
        const mockUser = {
          id: 'demo_user_123',
          email: formData.email,
          name: formData.name || 'Demo User',
          displayName: formData.name || 'Demo User' // Ensure both name and displayName are set
        };
        console.log('✅ Mock login successful with user:', mockUser);
        onLogin(mockUser, 'demo_token_123');
      }, 1000);
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

// Main Chat Interface Component
const ChatInterface = ({ user, onLogout }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [onlineUserCount, setOnlineUserCount] = useState(1); // New state for online users
  const [sessionMessageCount, setSessionMessageCount] = useState(0); // Track messages per session
  const [lastMessageTime, setLastMessageTime] = useState(Date.now()); // Track timing patterns
  const messagesEndRef = useRef(null);
  
  // Helper function to detect business type from user profile and message content
  const detectBusinessType = (user, message) => {
    const lowerMessage = message.toLowerCase();
    const userProfile = JSON.parse(localStorage.getItem('celeste7_profile') || '{}');
    
    // Check user profile first
    if (userProfile.primary_goal === 'business_growth' || userProfile.work_style === 'entrepreneur') {
      // Analyze message content for specific business types
      if (lowerMessage.includes('saas') || lowerMessage.includes('software') || lowerMessage.includes('subscription')) {
        return 'saas';
      }
      if (lowerMessage.includes('agency') || lowerMessage.includes('client') || lowerMessage.includes('marketing')) {
        return 'agency';
      }
      if (lowerMessage.includes('ecommerce') || lowerMessage.includes('product') || lowerMessage.includes('store')) {
        return 'ecommerce';
      }
      if (lowerMessage.includes('consultant') || lowerMessage.includes('consulting') || lowerMessage.includes('advice')) {
        return 'consultant';
      }
    }
    
    return 'unknown';
  };
  
  // Use intervention hooks
  const {
    interventions,
    pendingIntervention,
    getPendingInterventionId,
    markInterventionUsed,
    clearInterventions
  } = useInterventionsWithEvents(user?.id);

  // Initialize conversations - fetch list from webhook or use mock data
  useEffect(() => {
    const initializeConversations = async () => {
      try {
        // Try to fetch conversation list from webhook
        const response = await fetch('https://ventruk.app.n8n.cloud/webhook/c7/fetch-conversations', {
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
            setConversations(data.conversations);
            return;
          }
        }
      } catch (error) {
        console.error('Failed to fetch conversations list:', error);
      }

      // Fallback to mock conversations (empty - will be populated when clicked)
      const mockConversations = [
        {
          id: 1,
          title: "Getting Started with AI",
          lastMessage: "Click to load conversation...",
          timestamp: Date.now() - 86400000,
          messages: [] // Empty - will be populated via webhook
        },
        {
          id: 2,
          title: "Python Programming Help",
          lastMessage: "Click to load conversation...",
          timestamp: Date.now() - 172800000,
          messages: [] // Empty - will be populated via webhook
        },
        {
          id: 3,
          title: "Creative Writing Ideas",
          lastMessage: "Click to load conversation...",
          timestamp: Date.now() - 259200000,
          messages: [] // Empty - will be populated via webhook
        }
      ];
      
      setConversations(mockConversations);
    };

    if (user?.id) {
      initializeConversations();
    }
  }, [user]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  // Online users heartbeat system
  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        const sessionId = sessionStorage.getItem('celeste7_session_id');
        const response = await fetch('https://ventruk.app.n8n.cloud/webhook/c7/user-heartbeat', {
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
        // Keep existing count on error
      }
    };

    // Send initial heartbeat
    sendHeartbeat();

    // Send heartbeat every 30 seconds
    const heartbeatInterval = setInterval(sendHeartbeat, 30000);

    // Cleanup on unmount
    return () => {
      clearInterval(heartbeatInterval);
      
      // Send offline status when component unmounts
      fetch('https://ventruk.app.n8n.cloud/webhook/c7/user-offline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({
          userId: user.id,
          sessionId: sessionStorage.getItem('celeste7_session_id'),
          timestamp: Date.now()
        })
      }).catch(console.error);
    };
  }, [user?.id]);

  const handleSendMessage = async () => {
    if (!message.trim() || !activeConversation) return;

    // Get pending intervention ID to include with message
    const interventionId = getPendingInterventionId();

    const userMessage = {
      id: Date.now(),
      text: message.trim(),
      isUser: true,
      timestamp: Date.now()
    };

    // Add user message immediately
    setActiveConversation(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      lastMessage: message.trim()
    }));

    setMessage('');
    setIsTyping(true);

    // Get or create session ID from sessionStorage
    const sessionId = sessionStorage.getItem('celeste7_session_id') || `session_${user.id}_${Date.now()}`;
    
    // Store sessionId if it was just created
    if (!sessionStorage.getItem('celeste7_session_id')) {
      sessionStorage.setItem('celeste7_session_id', sessionId);
    }

    // Increment message count for this session
    const newMessageCount = sessionMessageCount + 1;
    setSessionMessageCount(newMessageCount);
    setLastMessageTime(Date.now());
    
    const requestPayload = {
      userId: user.id,
      chatId: activeConversation.id,
      message: message.trim(),
      timestamp: Date.now(),
      sessionId: sessionId,
      user: {
        email: user.email,
        displayName: user.name || user.displayName || 'Unknown User'
      },
      // NEW: Oracle API Context Fields
      context: {
        businessType: detectBusinessType(user, message.trim()),
        messageCount: newMessageCount,
        lastMessageTime: lastMessageTime
      }
    };

    // Debug user object to ensure we have the right data
    console.log('👤 Current user object:', JSON.stringify(user, null, 2));
    console.log('📝 User displayName being sent:', user.name || user.displayName || 'Unknown User');
    console.log('🔑 SessionId being sent:', sessionId);

    // Add intervention_id if there's a pending intervention
    if (interventionId) {
      requestPayload.intervention_id = interventionId;
      console.log('🎯 Including intervention ID with message:', interventionId);
    }
    
    console.log('📤 Sending text-chat payload:', JSON.stringify(requestPayload, null, 2));

    try {
      // Send to webhook
      const response = await fetch('https://ventruk.app.n8n.cloud/webhook/c7/text-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify(requestPayload)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Full Webhook Response:', JSON.stringify(data, null, 2)); // Enhanced debug log
        
        if (data) {
          console.log('🔍 Oracle API Enhanced Response:', JSON.stringify(data, null, 2));
          console.log('📊 Available fields:', Object.keys(data));
          
          // Format the AI response - handle both simple and enhanced Oracle API responses
          let aiResponseText = '';
          let patternDetected = null;
          let confidence = null;
          let interventionType = null;
          
          // Check for Oracle API enhanced response
          if (data.metadata && data.metadata.enhanced) {
            console.log('✨ Oracle API Enhancement Detected!');
            patternDetected = data.metadata.pattern_detected;
            confidence = data.metadata.confidence;
            interventionType = data.metadata.intervention_type;
            
            // Use enhanced message from Oracle API
            aiResponseText = data.message || data.Ai_reply || '';
            console.log('🧠 Pattern detected:', patternDetected, 'with confidence:', confidence);
          }
          // Fallback to standard Ai_reply format
          else if (data.Ai_reply) {
            aiResponseText = data.Ai_reply.trim();
            console.log('✅ Found standard Ai_reply:', data.Ai_reply);
          }
          // Legacy userResponse format support
          else if (data.userResponse) {
            const messageText = data.userResponse.message;
            const actionText = data.userResponse.action;
            const questionText = data.userResponse.question;
            
            if (messageText) {
              aiResponseText += messageText;
              console.log('✅ Found legacy message text:', messageText);
            }
            if (actionText) {
              if (aiResponseText.trim()) aiResponseText += '\n';
              aiResponseText += actionText;
              console.log('✅ Found legacy action text:', actionText);
            }
            if (questionText) {
              if (aiResponseText.trim()) aiResponseText += '\n';
              aiResponseText += questionText;
              console.log('✅ Found legacy question text:', questionText);
            }
          }
          // Final fallback for other formats
          else {
            aiResponseText = data.output || data.content || data.message || data.text || data.response;
            if (aiResponseText) {
              console.log('✅ Found fallback response:', aiResponseText);
            }
          }
          
          // Try strategic question if present
          if (data.strategic_question) {
            if (aiResponseText.trim()) aiResponseText += '\n\n';
            aiResponseText += '💡 ' + data.strategic_question;
            console.log('✅ Found strategic question:', data.strategic_question);
          }
          
          // If intervention was included, add special note
          if (interventionId) {
            if (aiResponseText.trim()) aiResponseText += '\n\n';
            aiResponseText += '🎯 Response enhanced with behavioral insights';
          }
          
          // Final fallback check
          if (!aiResponseText.trim()) {
            console.log('⚠️ No AI response found in any expected fields');
            aiResponseText = "No response received from AI service.";
          } else {
            console.log('✅ Successfully parsed AI response');
          }
          
          const aiMessage = {
            id: Date.now() + 1,
            text: aiResponseText,
            isUser: false,
            timestamp: data.timestamp || Date.now(),
            rawData: data,
            interventionId: interventionId,
            // NEW: Oracle API Pattern Detection Metadata
            patternDetected: patternDetected,
            confidence: confidence,
            interventionType: interventionType,
            isEnhanced: data.metadata?.enhanced || false
          };

          setActiveConversation(prev => ({
            ...prev,
            messages: [...prev.messages, aiMessage],
            lastMessage: aiResponseText.substring(0, 100) + '...'
          }));

          // Update conversation in list
          setConversations(prev => prev.map(conv => 
            conv.id === activeConversation.id 
              ? { 
                  ...conv, 
                  lastMessage: aiResponseText.substring(0, 100) + '...', 
                  timestamp: data.timestamp || Date.now() 
                }
              : conv
          ));

          // Mark intervention as used if it was included
          if (interventionId) {
            markInterventionUsed(interventionId);
          }
        } else {
          console.error('❌ No valid response data found in webhook response');
          throw new Error('Invalid webhook response structure');
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Message send error:', error);
      console.log('🔍 Request payload was:', JSON.stringify(requestPayload, null, 2));
      
      // Check if it's actually a response parsing issue
      if (error.message.includes('Unexpected token') || error.message.includes('JSON')) {
        console.error('🚨 JSON parsing error - webhook may be returning non-JSON response');
      }
      
      // Mock AI response for demo when webhook fails
      setTimeout(() => {
        const responses = [
          "I understand your question. As an AI assistant, I'm here to help with a wide variety of tasks including answering questions, providing explanations, helping with creative projects, and more. How can I assist you further?",
          "That's a great question! Let me help you with that. I can provide detailed explanations, code examples, creative writing assistance, and much more.",
          "I'm happy to help! Based on your message, I can offer insights and assistance. What specific aspect would you like me to focus on?",
          "Thanks for your message! I'm designed to be helpful, harmless, and honest. I can assist with analysis, creative tasks, problem-solving, and general questions.",
          "I appreciate you reaching out. As your AI assistant, I can help break down complex topics, provide step-by-step guidance, or explore creative solutions together."
        ];
        
        let aiResponseText = responses[Math.floor(Math.random() * responses.length)];
        
        // Add intervention note for demo
        if (interventionId) {
          aiResponseText += '\n\n🎯 **Intervention Applied:** Response tailored based on detected patterns (Demo Mode)';
        }
        
        const aiResponse = {
          id: Date.now() + 1,
          text: aiResponseText,
          isUser: false,
          timestamp: Date.now(),
          interventionId: interventionId
        };

        setActiveConversation(prev => ({
          ...prev,
          messages: [...prev.messages, aiResponse],
          lastMessage: aiResponse.text
        }));

        // Update conversation in list
        setConversations(prev => prev.map(conv => 
          conv.id === activeConversation.id 
            ? { ...conv, lastMessage: aiResponse.text, timestamp: aiResponse.timestamp }
            : conv
        ));

        // Mark intervention as used if it was included
        if (interventionId) {
          markInterventionUsed(interventionId);
        }
      }, 1500);
    }

    setIsTyping(false);
  };

  const handleNewConversation = () => {
    if (conversations.length >= 10) {
      setShowDeleteModal(true);
      return;
    }

    const newConversation = {
      id: conversations.length + 1,
      title: `New Conversation ${conversations.length + 1}`,
      lastMessage: "",
      timestamp: Date.now(),
      messages: []
    };

    setConversations([newConversation, ...conversations]);
    setActiveConversation(newConversation);
  };

  const handleDeleteConversation = (conversationId) => {
    const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
    setConversations(updatedConversations);
    
    if (activeConversation?.id === conversationId) {
      setActiveConversation(updatedConversations[0] || null);
    }
    
    setShowDeleteModal(false);
  };

  const fetchConversation = async (conversationId) => {
    // Show loading state
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      // Set conversation as active with loading state
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
      
      const response = await fetch('https://ventruk.app.n8n.cloud/webhook/c7/fetch-chat', {
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
          sessionId: sessionStorage.getItem('celeste7_session_id') || `session_${user.id}_${Date.now()}`,
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
          // Handle the simple output schema
          let processedMessages = [];
          
          if (data.output) {
            // Single output response - create a simple AI message
            const aiMessage = {
              id: `history_${Date.now()}`,
              text: data.output.trim(),
              isUser: false,
              timestamp: Date.now() - 3600000, // 1 hour ago for demo
              isHistorical: true
            };
            processedMessages = [aiMessage];
            console.log('✅ Processed single output message:', data.output);
          } else if (data.messages && Array.isArray(data.messages)) {
            // Handle array of messages if provided
            processedMessages = data.messages.map(msg => {
              if (!msg.isUser && (msg.userResponse || msg.output)) {
                // Format AI messages with response schema or simple output
                let formattedText = '';
                
                if (msg.output) {
                  formattedText = msg.output.trim();
                } else if (msg.userResponse) {
                  // Handle userResponse format
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
            // No messages in this conversation yet
            processedMessages = [];
          }
          
          if (conversation) {
            const updatedConversation = {
              ...conversation,
              messages: processedMessages,
              lastMessage: data.output ? data.output.substring(0, 100) + '...' : (processedMessages.length > 0 ? processedMessages[processedMessages.length - 1].text.substring(0, 100) + '...' : 'No messages yet')
            };
            
            setActiveConversation(updatedConversation);
            
            // Update the conversation in the list with latest info
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
      
      // Show error message if webhook fails
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
    <div className={`flex h-screen ${isDarkMode ? 'bg-[#181818]' : 'bg-[#f8f8ff]'} transition-colors duration-300`}>
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className={`w-80 ${isDarkMode ? 'bg-[#202020]' : 'bg-white'} border-r ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex flex-col`}
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#73c2e2] to-[#badde9] rounded-lg flex items-center justify-center">
                    <img 
                      src="https://images.unsplash.com/photo-1633412802994-5c058f151b66?w=100&h=100&fit=crop&crop=center"
                      alt="CelesteOS"
                      className="w-6 h-6 rounded object-cover"
                    />
                  </div>
                  <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-[#181818]'}`} style={{ fontFamily: 'Eloquia-Text, sans-serif' }}>
                    Celeste<span className="bg-gradient-to-r from-[#73c2e2] to-[#badde9] bg-clip-text text-transparent">OS</span>
                  </h1>
                </div>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                >
                  {isDarkMode ? <Sun className="text-yellow-400" size={18} /> : <Moon className="text-gray-600" size={18} />}
                </button>
              </div>

              {/* Online Users Counter */}
              <div className={`mb-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {onlineUserCount} {onlineUserCount === 1 ? 'user' : 'users'} online
                  </span>
                </div>
              </div>
              
              <motion.button
                onClick={handleNewConversation}
                className="w-full bg-gradient-to-r from-[#73c2e2] to-[#badde9] text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 hover:shadow-lg transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={18} />
                <span>New Conversation</span>
              </motion.button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-2">
              {conversations.map((conversation) => (
                <motion.button
                  key={conversation.id}
                  onClick={() => fetchConversation(conversation.id)}
                  className={`w-full p-3 mb-2 rounded-lg text-left transition-all ${
                    activeConversation?.id === conversation.id 
                      ? 'bg-gradient-to-r from-[#73c2e2] to-[#badde9] text-white' 
                      : isDarkMode 
                        ? 'hover:bg-gray-700 text-gray-300' 
                        : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    <MessageSquare size={16} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{conversation.title}</p>
                      <p className="text-sm opacity-70 truncate">{conversation.lastMessage}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Sidebar Footer */}
            <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#73c2e2] to-[#badde9] rounded-full flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-[#181818]'}`}>{user.name}</p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                >
                  <LogOut size={18} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className={`${isDarkMode ? 'bg-[#202020]' : 'bg-white'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} p-4 flex items-center justify-between`}>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
            >
              <Menu size={20} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
            </button>
            <h2 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-[#181818]'}`}>
              {activeConversation?.title || 'Select a conversation'}
            </h2>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeConversation?.messages?.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[#73c2e2] to-[#badde9] rounded-full flex items-center justify-center">
                  <MessageSquare className="text-white" size={24} />
                </div>
                <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-[#181818]'} mb-2`}>
                  Start a Conversation
                </h3>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Send a message to begin this conversation.
                </p>
              </div>
            </div>
          ) : (
            activeConversation?.messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-2xl ${
                  msg.isUser 
                    ? 'bg-gradient-to-r from-[#73c2e2] to-[#badde9] text-white' 
                    : msg.isLoading
                      ? isDarkMode ? 'bg-[#2a2a2a] text-gray-400' : 'bg-gray-100 text-gray-500'
                      : msg.isError
                        ? isDarkMode ? 'bg-red-900/50 text-red-200' : 'bg-red-100 text-red-700'
                        : msg.isIntervention
                          ? isDarkMode ? 'bg-gradient-to-r from-orange-900/50 to-yellow-900/50 text-orange-200 border border-orange-500/30' : 'bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 border border-orange-300'
                          : msg.isEnhanced
                            ? isDarkMode ? 'bg-gradient-to-r from-purple-900/30 to-blue-900/30 text-purple-200 border border-purple-500/30' : 'bg-gradient-to-r from-purple-50 to-blue-50 text-purple-800 border border-purple-200'
                            : isDarkMode 
                              ? 'bg-[#2a2a2a] text-gray-100' 
                              : 'bg-gray-100 text-[#181818]'
                }`}>
                  <div className="whitespace-pre-wrap">
                    {msg.isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-[#73c2e2] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-[#73c2e2] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-[#73c2e2] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span>Loading conversation...</span>
                      </div>
                    ) : (
                      msg.text.split('\n').map((line, index) => {
                        // Handle bold text formatting
                        if (line.includes('**')) {
                          const parts = line.split('**');
                          return (
                            <p key={index} className={index > 0 ? 'mt-2' : ''}>
                              {parts.map((part, partIndex) => 
                                partIndex % 2 === 1 ? (
                                  <strong key={partIndex} className="font-semibold">{part}</strong>
                                ) : (
                                  part
                                )
                              )}
                            </p>
                          );
                        }
                        return line ? <p key={index} className={index > 0 ? 'mt-2' : ''}>{line}</p> : <br key={index} />;
                      })
                    )}
                  </div>
                  {!msg.isLoading && (
                    <div className="flex items-center justify-between mt-2">
                      <p className={`text-xs opacity-70`}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                      <div className="flex items-center space-x-1">
                        {msg.isIntervention && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isDarkMode 
                              ? 'bg-orange-900/30 text-orange-300' 
                              : 'bg-orange-200 text-orange-700'
                          }`}>
                            Intervention
                          </span>
                        )}
                        {msg.isEnhanced && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isDarkMode 
                              ? 'bg-purple-900/30 text-purple-300' 
                              : 'bg-purple-200 text-purple-700'
                          }`}>
                            🧠 Enhanced
                          </span>
                        )}
                        {msg.patternDetected && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isDarkMode 
                              ? 'bg-blue-900/30 text-blue-300' 
                              : 'bg-blue-200 text-blue-700'
                          }`} title={`Pattern: ${msg.patternDetected} (${Math.round(msg.confidence * 100)}% confidence)`}>
                            🔍 {msg.patternDetected}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className={`px-4 py-3 rounded-2xl ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-100'}`}>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-[#73c2e2] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-[#73c2e2] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-[#73c2e2] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {activeConversation && (
          <div className={`${isDarkMode ? 'bg-[#202020]' : 'bg-white'} border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} p-4`}>
            {/* Pending Intervention Indicator */}
            {pendingIntervention && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-3 p-3 rounded-lg border-l-4 border-orange-500 ${
                  isDarkMode ? 'bg-orange-900/20 text-orange-200' : 'bg-orange-50 text-orange-800'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🎯</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Intervention Ready</p>
                    <p className="text-xs opacity-80">Your next message will include personalized guidance</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isDarkMode ? 'bg-orange-800/50 text-orange-300' : 'bg-orange-200 text-orange-700'
                  }`}>
                    Priority {pendingIntervention.priority}
                  </span>
                </div>
              </motion.div>
            )}

            <div className="flex space-x-4">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={pendingIntervention ? "Type your message (intervention will be applied)..." : "Type your message..."}
                className={`flex-1 px-4 py-3 rounded-xl border ${isDarkMode ? 'bg-[#2a2a2a] border-gray-600 text-white' : 'bg-white border-gray-300 text-[#181818]'} focus:outline-none focus:ring-2 focus:ring-[#73c2e2] focus:border-transparent transition-all ${
                  pendingIntervention ? 'ring-2 ring-orange-500/50' : ''
                }`}
              />
              <motion.button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className={`p-3 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                  pendingIntervention 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white' 
                    : 'bg-gradient-to-r from-[#73c2e2] to-[#badde9] text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Send size={20} />
              </motion.button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Conversation Modal */}
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
                Conversation Limit Reached
              </h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                You have reached the maximum of 10 conversations. Please delete one or more conversations to create a new one.
              </p>
              
              <div className="space-y-2 mb-6 max-h-40 overflow-y-auto">
                {conversations.map((conversation) => (
                  <div key={conversation.id} className="flex items-center justify-between p-2 rounded-lg border border-gray-600">
                    <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} truncate`}>{conversation.title}</span>
                    <button
                      onClick={() => handleDeleteConversation(conversation.id)}
                      className="text-red-500 hover:text-red-400 transition-colors"
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

// Export all components
const Components = {
  LoadingScreen,
  AuthScreen,
  OnboardingScreen,
  ChatInterface
};

export default Components;