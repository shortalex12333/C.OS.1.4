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
      
      const response = await fetch('https://api.celeste7.ai/webhook/profile-building', {
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
      const endpoint = isSignUp ? 'signup' : 'login'; // Changed from 'signin' to 'login'
      const response = await fetch(`https://api.celeste7.ai/webhook/auth/${endpoint}`, {
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
      
      // Show the actual error instead of immediately falling back to demo mode
      if (error.message.includes('CORS') || error.message.includes('NetworkError')) {
        setError(`Network connection issue: ${error.message}. Please check the n8n webhook endpoint.`);
      } else if (error.message.includes('Failed to fetch')) {
        setError(`Connection failed: Cannot reach authentication service at your n8n endpoint. Please verify the webhook is running.`);
      } else {
        setError(`Authentication error: ${error.message}`);
      }
      
      // Only fall back to demo mode after showing the real error for a few seconds
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
      }, 3000); // Show error for 3 seconds before demo mode
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
  const [onlineUserCount, setOnlineUserCount] = useState(1);
  const [sessionMessageCount, setSessionMessageCount] = useState(0);
  const [lastMessageTime, setLastMessageTime] = useState(Date.now());
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  
  // Helper function to detect business type from user profile and message content
  const detectBusinessType = (user, message) => {
    const lowerMessage = message.toLowerCase();
    const userProfile = JSON.parse(localStorage.getItem('celesteos_profile') || '{}');
    
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

  // Auto scroll to bottom with smooth animation
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

    // Find the message index
    const messageIndex = activeConversation.messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;

    // Remove all messages after this one (including AI responses)
    const messagesToKeep = activeConversation.messages.slice(0, messageIndex);
    
    // Update the edited message
    const editedMessage = {
      ...activeConversation.messages[messageIndex],
      text: editingText.trim(),
      isEdited: true,
      editedAt: Date.now()
    };

    // Update the conversation
    setActiveConversation(prev => ({
      ...prev,
      messages: [...messagesToKeep, editedMessage]
    }));

    // Clear editing state
    setEditingMessageId(null);
    setEditingText('');

    // Send the edited message to webhook
    await sendMessageToWebhook(editedMessage.text);
  };

  const sendMessageToWebhook = async (messageText) => {
    setIsTyping(true);

    // Get pending intervention ID to include with message
    const interventionId = getPendingInterventionId();

    // Get or create session ID from sessionStorage
    const sessionId = sessionStorage.getItem('celesteos_session_id') || `session_${user.id}_${Date.now()}`;
    
    // Store sessionId if it was just created
    if (!sessionStorage.getItem('celesteos_session_id')) {
      sessionStorage.setItem('celesteos_session_id', sessionId);
    }

    // Increment message count for this session
    const newMessageCount = sessionMessageCount + 1;
    setSessionMessageCount(newMessageCount);
    setLastMessageTime(Date.now());
    
    const requestPayload = {
      userId: user.id,
      chatId: activeConversation.id,
      message: messageText,
      timestamp: Date.now(),
      sessionId: sessionId,
      user: {
        email: user.email,
        displayName: user.name || user.displayName || 'Unknown User'
      },
      context: {
        businessType: detectBusinessType(user, messageText),
        messageCount: newMessageCount,
        lastMessageTime: lastMessageTime
      }
    };

    // Add intervention_id if there's a pending intervention
    if (interventionId) {
      requestPayload.intervention_id = interventionId;
    }

    try {
      const response = await fetch('https://api.celeste7.ai/webhook/text-chat', {
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
        
        // Process AI response (same logic as before)
        let aiResponseText = '';
        let patternDetected = null;
        let confidence = null;
        let interventionType = null;
        
        if (data.metadata && data.metadata.enhanced) {
          patternDetected = data.metadata.pattern_detected;
          confidence = data.metadata.confidence;
          interventionType = data.metadata.intervention_type;
          aiResponseText = data.message || data.Ai_reply || '';
        } else if (data.Ai_reply) {
          aiResponseText = data.Ai_reply.trim();
        } else if (data.userResponse) {
          const messageText = data.userResponse.message;
          const actionText = data.userResponse.action;
          const questionText = data.userResponse.question;
          
          if (messageText) aiResponseText += messageText;
          if (actionText) {
            if (aiResponseText.trim()) aiResponseText += '\n';
            aiResponseText += actionText;
          }
          if (questionText) {
            if (aiResponseText.trim()) aiResponseText += '\n';
            aiResponseText += questionText;
          }
        } else {
          aiResponseText = data.output || data.content || data.message || data.text || data.response || '';
        }
        
        if (data.strategic_question) {
          if (aiResponseText.trim()) aiResponseText += '\n\n';
          aiResponseText += '💡 ' + data.strategic_question;
        }
        
        if (interventionId) {
          if (aiResponseText.trim()) aiResponseText += '\n\n';
          aiResponseText += '🎯 Response enhanced with behavioral insights';
        }
        
        if (!aiResponseText.trim()) {
          aiResponseText = "No response received from AI service.";
        }
        
        const aiMessage = {
          id: Date.now() + 1,
          text: aiResponseText,
          isUser: false,
          timestamp: data.timestamp || Date.now(),
          rawData: data,
          interventionId: interventionId,
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
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Message send error:', error);
      
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

        if (interventionId) {
          markInterventionUsed(interventionId);
        }
      }, 1500);
    }

    setIsTyping(false);
  };

  // Online users heartbeat system
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

  const handleSendMessage = async () => {
    if (!message.trim() || !activeConversation) return;

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

    const messageToSend = message.trim();
    setMessage('');

    // Send message to webhook
    await sendMessageToWebhook(messageToSend);
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
    <div className={`flex h-screen ${isDarkMode ? 'bg-[#0f0f0f]' : 'bg-white'} transition-all duration-300`}>
      {/* Premium Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`w-80 ${isDarkMode ? 'bg-[#171717]' : 'bg-[#f7f7f8]'} border-r ${isDarkMode ? 'border-[#2a2a2a]' : 'border-gray-200'} flex flex-col shadow-2xl backdrop-blur-xl`}
          >
            {/* Enhanced Sidebar Header */}
            <div className={`p-6 border-b ${isDarkMode ? 'border-[#2a2a2a]' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#73c2e2] to-[#badde9] rounded-xl flex items-center justify-center shadow-lg">
                      <img 
                        src="https://images.unsplash.com/photo-1633412802994-5c058f151b66?w=100&h=100&fit=crop&crop=center"
                        alt="CelesteOS"
                        className="w-7 h-7 rounded-lg object-cover"
                      />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <div>
                    <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-[#0d1117]'}`} style={{ fontFamily: 'Eloquia-Text, sans-serif' }}>
                      Celeste<span className="bg-gradient-to-r from-[#73c2e2] to-[#badde9] bg-clip-text text-transparent">OS</span>
                    </h1>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Your proactive AI assistant</p>
                  </div>
                </div>
                <motion.button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-[#2a2a2a]' : 'hover:bg-gray-200'} transition-all duration-200`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isDarkMode ? (
                    <Sun className="text-yellow-400" size={20} />
                  ) : (
                    <Moon className="text-gray-600" size={20} />
                  )}
                </motion.button>
              </div>

              {/* Premium Online Users Display */}
              <div className={`mb-6 p-4 rounded-xl ${isDarkMode ? 'bg-[#2a2a2a]/50' : 'bg-white'} border ${isDarkMode ? 'border-[#373737]' : 'border-gray-200'} backdrop-blur-sm`}>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full animate-ping opacity-75"></div>
                  </div>
                  <div>
                    <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {onlineUserCount} {onlineUserCount === 1 ? 'user' : 'users'} online
                    </span>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active now</p>
                  </div>
                </div>
              </div>
              
              <motion.button
                onClick={handleNewConversation}
                className="w-full bg-gradient-to-r from-[#73c2e2] to-[#badde9] text-white px-6 py-4 rounded-xl font-semibold flex items-center justify-center space-x-3 hover:shadow-2xl transition-all duration-300 group"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                <span>New Conversation</span>
              </motion.button>
            </div>

            {/* Premium Conversations List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
              {conversations.map((conversation, index) => (
                <motion.button
                  key={conversation.id}
                  onClick={() => fetchConversation(conversation.id)}
                  className={`w-full p-4 rounded-xl text-left transition-all duration-200 group ${
                    activeConversation?.id === conversation.id 
                      ? 'bg-gradient-to-r from-[#73c2e2] to-[#badde9] text-white shadow-lg' 
                      : isDarkMode 
                        ? 'hover:bg-[#2a2a2a] text-gray-300 hover:shadow-md' 
                        : 'hover:bg-white text-gray-700 hover:shadow-md border border-transparent hover:border-gray-200'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activeConversation?.id === conversation.id ? 'bg-white' : 'bg-[#73c2e2]'
                    } group-hover:scale-150 transition-transform duration-200`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate text-sm">{conversation.title}</p>
                      <p className={`text-xs truncate mt-1 ${
                        activeConversation?.id === conversation.id ? 'text-white/80' : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {conversation.lastMessage || 'Start a conversation...'}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Enhanced Sidebar Footer */}
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

      {/* Main Chat Area - ChatGPT Style */}
      <div className="flex-1 flex flex-col">
        {/* Premium Header */}
        <div className={`${isDarkMode ? 'bg-[#171717]/80' : 'bg-white/80'} backdrop-blur-xl border-b ${isDarkMode ? 'border-[#2a2a2a]' : 'border-gray-200'} p-4 flex items-center justify-between sticky top-0 z-10`}>
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
                  CelesteOS is ready to assist
                </p>
              )}
            </div>
          </div>
          
          {/* Conversation Actions */}
          {activeConversation && (
            <div className="flex items-center space-x-2">
              <motion.button
                className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-[#2a2a2a]' : 'hover:bg-gray-100'} transition-colors`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                </svg>
              </motion.button>
            </div>
          )}
        </div>

        {/* ChatGPT-Style Messages Area */}
        <div className="flex-1 flex flex-col w-full min-h-0">
          <div className="flex-1 overflow-y-auto px-4 py-6 chat-scrollbar">
            <div className="max-w-4xl mx-auto">
              {activeConversation?.messages?.length === 0 ? (
              <div className="flex-1 flex items-center justify-center min-h-[60vh]">
                <motion.div 
                  className="text-center max-w-md"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-[#73c2e2] to-[#badde9] rounded-3xl flex items-center justify-center shadow-2xl glow-effect float-animation">
                    <MessageSquare className="text-white" size={32} />
                  </div>
                  <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                    Welcome to CelesteOS
                  </h3>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-lg leading-relaxed`}>
                    Your proactive AI assistant is ready to help. Start a conversation to begin.
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
                      {/* AI Avatar */}
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
                        {/* Message Content */}
                        <div className={`relative group/message ${
                          msg.isUser 
                            ? 'bg-[#181818] text-white rounded-3xl rounded-br-lg px-6 py-4 border-2 border-transparent bg-clip-padding relative max-w-2xl message-animation-user' 
                            : msg.isLoading
                              ? `${isDarkMode ? 'text-gray-300' : 'text-gray-700'} rounded-3xl rounded-bl-lg px-0 py-2 max-w-full`
                              : msg.isError
                                ? `${isDarkMode ? 'text-red-300' : 'text-red-700'} rounded-3xl rounded-bl-lg px-0 py-2 max-w-full`
                                : msg.isEnhanced
                                  ? `${isDarkMode ? 'text-purple-300' : 'text-purple-700'} rounded-3xl rounded-bl-lg px-0 py-2 max-w-full`
                                  : `${isDarkMode ? 'text-gray-100' : 'text-gray-900'} rounded-3xl rounded-bl-lg px-0 py-2 max-w-full message-animation-ai`
                        }`}>
                          
                          {/* Gradient Border for User Messages */}
                          {msg.isUser && (
                            <div className="absolute inset-0 rounded-3xl rounded-br-lg bg-gradient-to-r from-[#73c2e2] to-[#badde9] p-[1px] -z-10">
                              <div className="h-full w-full rounded-3xl rounded-br-lg bg-[#181818]"></div>
                            </div>
                          )}
                          
                          {/* Edit Mode */}
                          {editingMessageId === msg.id ? (
                            <div className="space-y-3">
                              <textarea
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className={`w-full bg-transparent border-none outline-none resize-none auto-resize ${
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
                              {/* Message Text */}
                              <div className={`whitespace-pre-wrap leading-relaxed ${
                                msg.isUser ? 'text-white' : isDarkMode ? 'text-gray-100' : 'text-gray-900'
                              }`}>
                                {msg.isLoading ? (
                                  <div className="flex items-center space-x-3">
                                    <div className="flex space-x-1">
                                      <div className="w-3 h-3 bg-[#73c2e2] rounded-full typing-dot"></div>
                                      <div className="w-3 h-3 bg-[#73c2e2] rounded-full typing-dot"></div>
                                      <div className="w-3 h-3 bg-[#73c2e2] rounded-full typing-dot"></div>
                                    </div>
                                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>CelesteOS is thinking...</span>
                                  </div>
                                ) : (
                                  msg.text.split('\n').map((line, index) => {
                                    // Handle bold text formatting
                                    if (line.includes('**')) {
                                      const parts = line.split('**');
                                      return (
                                        <p key={index} className={index > 0 ? 'mt-3' : ''}>
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
                                    return line ? <p key={index} className={index > 0 ? 'mt-3' : ''}>{line}</p> : <br key={index} />;
                                  })
                                )}
                              </div>
                              
                              {/* Message Metadata */}
                              {!msg.isLoading && (
                                <div className="flex items-center justify-between mt-4">
                                  <div className="flex items-center space-x-2">
                                    <p className={`text-xs ${
                                      msg.isUser ? 'text-white/70' : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                    }`}>
                                      {new Date(msg.timestamp).toLocaleTimeString()}
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
                                    {msg.isEnhanced && (
                                      <span className={`text-xs px-2 py-1 rounded-full ${
                                        isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-200 text-purple-700'
                                      }`}>
                                        🧠 Enhanced
                                      </span>
                                    )}
                                    {msg.patternDetected && (
                                      <span className={`text-xs px-2 py-1 rounded-full ${
                                        isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-200 text-blue-700'
                                      }`} title={`Pattern: ${msg.patternDetected} (${Math.round(msg.confidence * 100)}% confidence)`}>
                                        🔍 {msg.patternDetected}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                          
                          {/* Message Actions */}
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
                      
                      {/* User Avatar */}
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
                
                {/* Typing Indicator */}
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
                            <div className="w-3 h-3 bg-[#73c2e2] rounded-full typing-dot"></div>
                            <div className="w-3 h-3 bg-[#73c2e2] rounded-full typing-dot"></div>
                            <div className="w-3 h-3 bg-[#73c2e2] rounded-full typing-dot"></div>
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

        {/* ChatGPT-Style Input Area */}
        {activeConversation && (
          <div className="border-t border-transparent px-4 pb-6">
            <div className="max-w-4xl mx-auto">
              {/* Pending Intervention Indicator */}
              {pendingIntervention && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-4 p-4 rounded-2xl border-l-4 border-orange-500 backdrop-blur-sm ${
                    isDarkMode ? 'bg-orange-900/20 text-orange-200' : 'bg-orange-50 text-orange-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🎯</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Intervention Ready</p>
                      <p className="text-xs opacity-80">Your next message will include personalized guidance</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      isDarkMode ? 'bg-orange-800/50 text-orange-300' : 'bg-orange-200 text-orange-700'
                    }`}>
                      Priority {pendingIntervention.priority}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Premium Input Container */}
              <div className={`relative ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-white'} rounded-3xl border ${
                isDarkMode ? 'border-[#373737]' : 'border-gray-200'
              } shadow-2xl backdrop-blur-xl ${pendingIntervention ? 'ring-2 ring-orange-500/50' : ''} transition-all duration-300`}>
                
                {/* Input Field */}
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
                      placeholder={
                        pendingIntervention 
                          ? "Type your message (intervention will be applied)..." 
                          : "Message CelesteOS..."
                      }
                      className={`w-full bg-transparent border-none outline-none resize-none auto-resize ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      } placeholder-gray-400 text-base leading-relaxed`}
                      style={{ minHeight: '24px', maxHeight: '200px' }}
                    />
                    
                    {/* Character Count */}
                    {message.length > 0 && (
                      <div className={`absolute bottom-0 right-0 text-xs ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        {message.length}
                      </div>
                    )}
                  </div>
                  
                  {/* Send Button */}
                  <motion.button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isTyping}
                    className={`ml-4 p-3 rounded-2xl transition-all duration-200 ${
                      message.trim() && !isTyping
                        ? pendingIntervention 
                          ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-lg hover:shadow-xl glow-effect-hover' 
                          : 'bg-gradient-to-r from-[#73c2e2] to-[#badde9] text-white shadow-lg hover:shadow-xl glow-effect-hover'
                        : isDarkMode 
                          ? 'bg-[#373737] text-gray-500' 
                          : 'bg-gray-200 text-gray-400'
                    } disabled:cursor-not-allowed`}
                    whileHover={message.trim() && !isTyping ? { scale: 1.05 } : {}}
                    whileTap={message.trim() && !isTyping ? { scale: 0.95 } : {}}
                  >
                    {isTyping ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send size={20} />
                    )}
                  </motion.button>
                </div>
                
                {/* Input Footer */}
                <div className={`px-4 pb-3 flex items-center justify-between text-xs ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  <div className="flex items-center space-x-4">
                    <span>Press Enter to send, Shift+Enter for new line</span>
                    {pendingIntervention && (
                      <span className="text-orange-400 font-medium">🎯 Intervention mode active</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>CelesteOS Online</span>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions */}
              {activeConversation?.messages?.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 flex flex-wrap gap-2 justify-center"
                >
                  {[
                    "Help me brainstorm ideas",
                    "Explain something complex",
                    "Write something creative",
                    "Solve a problem"
                  ].map((prompt, index) => (
                    <motion.button
                      key={prompt}
                      onClick={() => setMessage(prompt)}
                      className={`px-4 py-2 rounded-full text-sm border transition-all duration-200 ${
                        isDarkMode 
                          ? 'border-[#373737] text-gray-400 hover:border-[#73c2e2] hover:text-[#73c2e2] hover:bg-[#73c2e2]/10' 
                          : 'border-gray-200 text-gray-600 hover:border-[#73c2e2] hover:text-[#73c2e2] hover:bg-[#73c2e2]/10'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {prompt}
                    </motion.button>
                  ))}
                </motion.div>
              )}
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