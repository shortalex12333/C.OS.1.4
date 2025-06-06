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
  EyeOff
} from 'lucide-react';

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
            alt="Celeste7"
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
          Celeste7
        </motion.h1>
        <motion.p 
          className="text-[#f8f8ff] text-lg opacity-90"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          AI-Powered Conversations
        </motion.p>
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
      const endpoint = isSignUp ? 'signup' : 'signin';
      const response = await fetch(`https://ventruk.app.n8n.cloud/webhook/c7/auth/${endpoint}`, {
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
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
          name: formData.name || 'Demo User'
        };
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
              alt="Celeste7"
              className="w-10 h-10 rounded-lg object-cover"
            />
          </motion.div>
          <h1 className="text-3xl font-bold text-[#181818] mb-2" style={{ fontFamily: 'Eloquia-Text, sans-serif' }}>
            Celeste7
          </h1>
          <p className="text-gray-600">
            {isSignUp ? 'Create your account' : 'Welcome back'}
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
  const messagesEndRef = useRef(null);

  // Mock conversations data
  useEffect(() => {
    const mockConversations = [
      {
        id: 1,
        title: "Getting Started with AI",
        lastMessage: "Hello! How can I help you today?",
        timestamp: Date.now() - 86400000,
        messages: [
          { id: 1, text: "Hello! How can I help you today?", isUser: false, timestamp: Date.now() - 86400000 },
          { id: 2, text: "I'd like to know about AI capabilities", isUser: true, timestamp: Date.now() - 86300000 },
          { id: 3, text: "I'd be happy to help! AI can assist with various tasks like answering questions, creative writing, code generation, analysis, and much more. What specific area interests you?", isUser: false, timestamp: Date.now() - 86200000 }
        ]
      },
      {
        id: 2,
        title: "Python Programming Help",
        lastMessage: "Great! That's a solid foundation.",
        timestamp: Date.now() - 172800000,
        messages: [
          { id: 1, text: "Can you help me with Python programming?", isUser: true, timestamp: Date.now() - 172800000 },
          { id: 2, text: "Absolutely! I'd be happy to help with Python. What specific topic or problem are you working on?", isUser: false, timestamp: Date.now() - 172700000 },
          { id: 3, text: "I'm learning about data structures", isUser: true, timestamp: Date.now() - 172600000 },
          { id: 4, text: "Great! That's a solid foundation. Python has excellent built-in data structures like lists, dictionaries, sets, and tuples. Which one would you like to explore first?", isUser: false, timestamp: Date.now() - 172500000 }
        ]
      },
      {
        id: 3,
        title: "Creative Writing Ideas",
        lastMessage: "Here are some creative prompts...",
        timestamp: Date.now() - 259200000,
        messages: [
          { id: 1, text: "I need help with creative writing", isUser: true, timestamp: Date.now() - 259200000 },
          { id: 2, text: "I'd love to help with your creative writing! What type of writing are you interested in - short stories, poetry, novels, or something else?", isUser: false, timestamp: Date.now() - 259100000 },
          { id: 3, text: "Short stories, I'm looking for interesting prompts", isUser: true, timestamp: Date.now() - 259000000 },
          { id: 4, text: "Here are some creative prompts to spark your imagination:\n\n1. A character discovers they can see 24 hours into the future, but only on Tuesdays\n2. The last bookstore on Earth receives a mysterious midnight delivery\n3. A time traveler keeps arriving at the same coffee shop, but in different decades\n\nWhich one interests you most?", isUser: false, timestamp: Date.now() - 258900000 }
        ]
      }
    ];
    
    setConversations(mockConversations);
    setActiveConversation(mockConversations[0]);
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

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

    setMessage('');
    setIsTyping(true);

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
        body: JSON.stringify({
          userId: user.id,
          chatId: activeConversation.id,
          message: message.trim(),
          timestamp: Date.now()
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Webhook response:', data); // Debug log
        
        if (data.success) {
          // Format the AI response with content, pattern_insight, and action_items
          let aiResponseText = '';
          
          // Add main content
          if (data.content) {
            aiResponseText += data.content;
          }
          
          // Add pattern insight
          if (data.pattern_insight) {
            aiResponseText += '\n\n💡 **Insight:** ' + data.pattern_insight;
          }
          
          // Add action items
          if (data.action_items && Array.isArray(data.action_items) && data.action_items.length > 0) {
            aiResponseText += '\n\n📋 **Action Items:**';
            data.action_items.forEach((item, index) => {
              aiResponseText += `\n${index + 1}. ${item}`;
            });
          }
          
          // Add strategic question if present
          if (data.strategic_question) {
            aiResponseText += '\n\n🤔 **Strategic Question:** ' + data.strategic_question;
          }
          
          const aiMessage = {
            id: Date.now() + 1,
            text: aiResponseText,
            isUser: false,
            timestamp: data.timestamp || Date.now(),
            rawData: data // Store full webhook response for potential future use
          };

          setActiveConversation(prev => ({
            ...prev,
            messages: [...prev.messages, aiMessage],
            lastMessage: data.content || aiResponseText.substring(0, 100) + '...'
          }));

          // Update conversation in list
          setConversations(prev => prev.map(conv => 
            conv.id === activeConversation.id 
              ? { ...conv, lastMessage: data.content || aiResponseText.substring(0, 100) + '...', timestamp: data.timestamp || Date.now() }
              : conv
          ));
        } else {
          throw new Error(data.message || 'Chat request failed');
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
        
        const aiResponse = {
          id: Date.now() + 1,
          text: responses[Math.floor(Math.random() * responses.length)],
          isUser: false,
          timestamp: Date.now()
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
    try {
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
          chatId: conversationId
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.messages) {
          const conversation = conversations.find(conv => conv.id === conversationId);
          if (conversation) {
            setActiveConversation({
              ...conversation,
              messages: data.messages
            });
            return;
          }
        }
      }
      
      // If webhook fails or no data, use existing mock data
      const conversation = conversations.find(conv => conv.id === conversationId);
      if (conversation) {
        setActiveConversation(conversation);
      }
    } catch (error) {
      console.error('Fetch conversation error:', error);
      // Use existing mock data
      const conversation = conversations.find(conv => conv.id === conversationId);
      if (conversation) {
        setActiveConversation(conversation);
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
                      alt="Celeste7"
                      className="w-6 h-6 rounded object-cover"
                    />
                  </div>
                  <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-[#181818]'}`} style={{ fontFamily: 'Eloquia-Text, sans-serif' }}>
                    Celeste7
                  </h1>
                </div>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                >
                  {isDarkMode ? <Sun className="text-yellow-400" size={18} /> : <Moon className="text-gray-600" size={18} />}
                </button>
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
          {activeConversation?.messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-2xl ${
                msg.isUser 
                  ? 'bg-gradient-to-r from-[#73c2e2] to-[#badde9] text-white' 
                  : isDarkMode 
                    ? 'bg-[#2a2a2a] text-gray-100' 
                    : 'bg-gray-100 text-[#181818]'
              }`}>
                <div className="whitespace-pre-wrap">
                  {msg.text.split('\n').map((line, index) => {
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
                  })}
                </div>
                <p className={`text-xs mt-2 opacity-70`}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}
          
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
            <div className="flex space-x-4">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className={`flex-1 px-4 py-3 rounded-xl border ${isDarkMode ? 'bg-[#2a2a2a] border-gray-600 text-white' : 'bg-white border-gray-300 text-[#181818]'} focus:outline-none focus:ring-2 focus:ring-[#73c2e2] focus:border-transparent transition-all`}
              />
              <motion.button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="bg-gradient-to-r from-[#73c2e2] to-[#badde9] text-white p-3 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
  ChatInterface
};

export default Components;