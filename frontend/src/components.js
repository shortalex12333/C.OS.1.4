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

// Main Chat Interface Component with FIXED JSX
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
  
  // Use intervention hooks
  const {
    interventions,
    pendingIntervention,
    getPendingInterventionId,
    markInterventionUsed,
    clearInterventions
  } = useInterventionsWithEvents(user?.id);

  // Helper function to detect business type from user profile and message content
  const detectBusinessType = (user, message) => {
    const lowerMessage = message.toLowerCase();
    const userProfile = JSON.parse(localStorage.getItem('celesteos_profile') || '{}');
    
    if (userProfile.primary_goal === 'business_growth' || userProfile.work_style === 'entrepreneur') {
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

  // Initialize conversations
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
            setConversations(data.conversations);
            return;
          }
        }
      } catch (error) {
        console.error('Failed to fetch conversations list:', error);
      }

      // Fallback to mock conversations
      const mockConversations = [
        {
          id: 1,
          title: "Getting Started with AI",
          lastMessage: "Click to load conversation...",
          timestamp: Date.now() - 86400000,
          messages: []
        },
        {
          id: 2,
          title: "Python Programming Help",
          lastMessage: "Click to load conversation...",
          timestamp: Date.now() - 172800000,
          messages: []
        },
        {
          id: 3,
          title: "Creative Writing Ideas",
          lastMessage: "Click to load conversation...",
          timestamp: Date.now() - 259200000,
          messages: []
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

  const sendMessageToWebhook = async (messageText) => {
    setIsTyping(true);

    const interventionId = getPendingInterventionId();
    const sessionId = sessionStorage.getItem('celesteos_session_id') || `session_${user.id}_${Date.now()}`;
    
    if (!sessionStorage.getItem('celesteos_session_id')) {
      sessionStorage.setItem('celesteos_session_id', sessionId);
    }

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

        setConversations(prev => prev.map(conv => 
          conv.id === activeConversation.id 
            ? { 
                ...conv, 
                lastMessage: aiResponseText.substring(0, 100) + '...', 
                timestamp: data.timestamp || Date.now() 
              }
            : conv
        ));

        if (interventionId) {
          markInterventionUsed(interventionId);
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Message send error:', error);
      
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
      lastMessage: message.trim()
    }));

    const messageToSend = message.trim();
    setMessage('');

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
              lastMessage: data.output ? data.output.substring(0, 100) + '...' : (processedMessages.length > 0 ? processedMessages[processedMessages.length - 1].text.substring(0, 100) + '...' : 'No messages yet')
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
    <div className={`flex h-screen ${isDarkMode ? 'bg-[#0f0f0f]' : 'bg-white'} transition-all duration-300 overflow-hidden`}>
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`w-80 ${isDarkMode ? 'bg-[#171717]' : 'bg-[#f7f7f8]'} border-r ${isDarkMode ? 'border-[#2a2a2a]' : 'border-gray-200'} flex flex-col shadow-2xl backdrop-blur-xl`}
          >
            {/* Sidebar Header */}
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

              {/* Online Users Display */}
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

            {/* Conversations List */}
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
                  CelesteOS is ready to assist
                </p>
              )}
            </div>
          </div>
          
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

        {/* Messages Area - FIXED */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            {activeConversation?.messages?.length === 0 ? (
              <div className="flex-1 flex items-center justify-center min-h-[60vh]">
                <motion.div 
                  className="text-center max-w-md"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-[#73c2e2] to-[#badde9] rounded-3xl flex items-center justify-center shadow-2xl">
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
                                : msg.isEnhanced
                                  ? `${isDarkMode ? 'text-purple-300' : 'text-purple-700'} rounded-3xl rounded-bl-lg px-0 py-2 max-w-full`
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
                                ) : (
                                  msg.text.split('\n').map((line, index) => {
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

        {/* Input Area - FIXED: Now only appears once */}
        {activeConversation && (
          <div className="flex-shrink-0 border-t border-transparent px-4 pb-6">
            <div className="max-w-4xl mx-auto">
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
                      placeholder="Message CelesteOS..."
                      className={`w-full bg-transparent border-none outline-none resize-none ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      } placeholder-gray-400 text-base leading-relaxed`}
                      style={{ minHeight: '24px', maxHeight: '200px' }}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isTyping}
                    className={`relative ml-4 p-3 rounded-2xl transition-all duration-200 ${
                      message.trim() && !isTyping
                        ? 'bg-[#181818] text-white shadow-lg hover:shadow-xl border-2 border-transparent bg-clip-padding'
                        : isDarkMode
                          ? 'bg-[#373737] text-gray-500'
                          : 'bg-gray-200 text-gray-400'
                    } disabled:cursor-not-allowed`}
                  >
                    {message.trim() && !isTyping && (
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#73c2e2] to-[#badde9] p-[1px] -z-10">
                        <div className="h-full w-full rounded-2xl bg-[#181818]" />
                      </div>
                    )}
                    {isTyping ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
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

// Export the component
export default ChatInterface;