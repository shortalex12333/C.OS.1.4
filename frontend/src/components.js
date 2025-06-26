import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Plus, 
  Sun, 
  Moon, 
  LogOut, 
  User, 
  MessageSquare,
  Edit3,
  Trash2,
  MoreHorizontal,
  X
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// CRITICAL: API Configuration
const API_CONFIG = {
  // Your n8n is hosted on api.celeste7.ai - use this!
  baseUrl: 'https://api.celeste7.ai/webhook',
  
  endpoints: {
    chat: '/text-chat-fast',
    fetchChat: '/fetch-chat',
    fetchConversations: '/fetch-conversations',
    auth: '/auth',
    login: '/auth/login',
    logout: '/auth/logout',
    verifyToken: '/auth/verify-token',
    signup: '/auth/signup'
  },
  timeout: 10000,
  maxRetries: 3,
  chatMaxRetries: 1,
  retryDelay: 1000
};

// IMPORTANT: Your n8n shows localhost:5678 in the UI, but you access it via api.celeste7.ai
// The webhooks are:
// - https://api.celeste7.ai/webhook/auth/login
// - https://api.celeste7.ai/webhook/auth/signup
// - https://api.celeste7.ai/webhook/text-chat-fast
// etc.
//
// In n8n, make sure your webhook nodes have:
// 1. HTTP Method: POST
// 2. Path: /auth/login (NOT /webhook/auth/login - n8n adds /webhook automatically)
// 3. Response Headers:
//    - Access-Control-Allow-Origin: *
//    - Access-Control-Allow-Methods: POST, OPTIONS
//    - Access-Control-Allow-Headers: Content-Type

// Lean retry logic - UNCHANGED
const sendRequestWithRetry = async (endpoint, payload, options = {}) => {
  const { maxRetries = API_CONFIG.maxRetries, timeout = API_CONFIG.timeout } = options;
  const url = `${API_CONFIG.baseUrl}${endpoint}`;
  let lastError;
  
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
      
      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ Success on attempt ${attempt + 1}`);
        return { success: true, data, attempt: attempt + 1 };
      }
      
      console.log(`❌ Server error ${response.status} - not retrying`);
      return { success: false, data, error: `HTTP ${response.status}`, attempt: attempt + 1 };
      
    } catch (error) {
      lastError = error;
      console.error(`❌ Network error on attempt ${attempt + 1}:`, error.message);
      
      if (error.name === 'AbortError' || error.message.includes('Failed to fetch')) {
        if (attempt < maxRetries - 1) {
          const delay = API_CONFIG.retryDelay * Math.pow(2, attempt);
          console.log(`⏳ Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      break;
    }
  }
  
  throw new Error(`Request failed: ${lastError.message}`);
};

// Minimal Auth Screen - ChatGPT style
const AuthScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('');

  // Test connection on mount
  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setConnectionStatus('Testing connection to n8n...');
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      });
      
      if (response.ok || response.status === 404) {
        setConnectionStatus(`✅ Connected to n8n at ${API_CONFIG.baseUrl}`);
      } else {
        setConnectionStatus(`⚠️ n8n responded with status ${response.status}`);
      }
    } catch (error) {
      setConnectionStatus(`❌ Cannot reach n8n at ${API_CONFIG.baseUrl} - ${error.message}`);
      console.error('Connection test failed:', error);
    }
  };

  const handleSubmit = async () => {
    if (!email || !password) return;
    
    setIsLoading(true);
    setError('');

    console.log('🔐 Attempting login to:', `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.login}`);

    try {
      const result = await sendRequestWithRetry(API_CONFIG.endpoints.login, {
        email,
        password
      }, { maxRetries: 2 });

      if (result.success) {
        console.log('✅ Login successful:', result.data);
        const authData = Array.isArray(result.data) ? result.data[0] : result.data;
        
        if (authData && authData.user && authData.access_token) {
          const userData = {
            id: authData.user.id,
            email: authData.user.email,
            name: authData.user.email.split('@')[0],
            displayName: authData.user.email.split('@')[0]
          };
          
          onLogin(userData, authData.access_token);
        } else {
          console.error('❌ Invalid auth response structure:', authData);
          setError('Invalid response from authentication service');
        }
      } else {
        console.error('❌ Login failed:', result);
        setError('Invalid credentials');
      }
    } catch (error) {
      console.error('❌ Auth failed:', error);
      setError('Connection error. Check if n8n webhooks are configured correctly.');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#343541] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-[#202123] dark:text-white mb-2">
            Welcome back
          </h1>
          <p className="text-[#6e6e80] dark:text-[#c5c5d2]">
            Log in to continue
          </p>
        </div>

        {connectionStatus && (
          <div className={`text-xs mb-4 p-2 rounded ${
            connectionStatus.includes('✅') ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
            connectionStatus.includes('❌') ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
            'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
          }`}>
            <div>{connectionStatus}</div>
            {connectionStatus.includes('❌') && (
              <div className="mt-2 text-xs">
                <div>Webhook URLs should be:</div>
                <div className="font-mono">• {API_CONFIG.baseUrl}/auth/login</div>
                <div className="font-mono">• {API_CONFIG.baseUrl}/auth/signup</div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit();
                }
              }}
              className="w-full px-3 py-3 bg-white dark:bg-[#40414f] border border-[#e5e5e5] dark:border-[#40414f] rounded-md text-[#202123] dark:text-white placeholder-[#6e6e80] dark:placeholder-[#8e8ea0] focus:outline-none focus:ring-2 focus:ring-[#10a37f] focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit();
                }
              }}
              className="w-full px-3 py-3 bg-white dark:bg-[#40414f] border border-[#e5e5e5] dark:border-[#40414f] rounded-md text-[#202123] dark:text-white placeholder-[#6e6e80] dark:placeholder-[#8e8ea0] focus:outline-none focus:ring-2 focus:ring-[#10a37f] focus:border-transparent"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">
              <div>{error}</div>
              {error.includes('Connection') && (
                <div className="text-xs mt-1">
                  Check console (F12) for detailed debugging info
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-[#10a37f] text-white py-3 rounded-md font-medium hover:bg-[#0d8d6d] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Continue'}
          </button>

          <button
            onClick={testConnection}
            className="w-full text-sm text-[#6e6e80] dark:text-[#8e8ea0] hover:text-[#10a37f] dark:hover:text-[#10a37f] transition-colors"
          >
            Test n8n Connection
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Chat Interface - ChatGPT Clone
const ChatInterface = ({ user, onLogout }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Log API configuration on mount
  useEffect(() => {
    console.log('🚀 CelesteOS Chat Interface');
    console.log(`🌐 API URL: ${API_CONFIG.baseUrl}`);
    console.log('📍 Auth endpoint:', `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.login}`);
    console.log('📍 Chat endpoint:', `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.chat}`);
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Initialize conversations and test CORS
  useEffect(() => {
    const initializeConversations = async () => {
      console.log('🏁 Initializing conversations for user:', user?.id);
      console.log('🌐 Using API:', API_CONFIG.baseUrl);
      
      // Create 10 fixed slots
      const conversationSlots = Array.from({ length: 10 }, (_, i) => ({
        id: String(i + 1),
        title: `New chat`,
        lastMessage: null,
        timestamp: null,
        messages: [],
        isEmpty: true
      }));
      
      setConversations(conversationSlots);
      setActiveConversation(conversationSlots[0]);

      // Try to fetch existing conversations
      try {
        const response = await sendRequestWithRetry(API_CONFIG.endpoints.fetchConversations, {
          userId: user.id
        }, { maxRetries: 1 });

        if (response.success && response.data.conversations) {
          const updatedSlots = conversationSlots.map((slot, index) => {
            const existingConv = response.data.conversations.find(conv => 
              conv.chat_id === slot.id || conv.id === slot.id
            );
            
            return existingConv ? {
              ...slot,
              title: existingConv.title || `New chat`,
              lastMessage: existingConv.last_message || null,
              timestamp: existingConv.updated_at || null,
              isEmpty: !existingConv.last_message
            } : slot;
          });
          
          setConversations(updatedSlots);
          setActiveConversation(updatedSlots[0]);
        }
      } catch (error) {
        console.error('❌ CORS/Connection Error:', error);
        console.error('Failed to reach:', `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.fetchConversations}`);
        setError(`Cannot connect to n8n at ${API_CONFIG.baseUrl}. Check console for details.`);
      }
    };

    if (user?.id) {
      initializeConversations();
    }
  }, [user?.id]);

  // Auto scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConversation?.messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  // Conversation switching
  const handleConversationSwitch = async (conversation) => {
    console.log('🔄 Switching to conversation:', conversation.id);
    setActiveConversation(conversation);
    
    if (!conversation.isEmpty && conversation.lastMessage) {
      try {
        const response = await sendRequestWithRetry(API_CONFIG.endpoints.fetchChat, {
          userId: user.id,
          chatId: conversation.id,
          sessionId: `session_${user.id}_${Date.now()}`
        }, { maxRetries: 1 });

        if (response.success && response.data) {
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
      } catch (error) {
        console.error('Fetch conversation error:', error);
      }
    }
  };

  // New conversation
  const handleNewConversation = () => {
    const emptySlot = conversations.find(conv => conv.isEmpty);
    
    if (emptySlot) {
      setActiveConversation({
        ...emptySlot,
        messages: [],
        isEmpty: true
      });
      setShowNewChat(false);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!message.trim() || !activeConversation || isSending) return;
    
    console.log('🚀 Sending message:', message.trim());
    setIsSending(true);
    setError(null);

    const userMessage = {
      id: Date.now(),
      text: message.trim(),
      isUser: true,
      timestamp: Date.now()
    };

    const aiMessage = {
      id: Date.now() + 1,
      text: '',
      isUser: false,
      isThinking: true,
      timestamp: new Date().toISOString()
    };

    setActiveConversation(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage, aiMessage],
      lastMessage: message.trim(),
      isEmpty: false,
      title: prev.isEmpty ? message.trim().substring(0, 30) + '...' : prev.title
    }));

    // Update conversation list
    setConversations(prev => prev.map(conv => 
      conv.id === activeConversation.id 
        ? { 
            ...conv, 
            title: conv.isEmpty ? message.trim().substring(0, 30) + '...' : conv.title,
            lastMessage: message.trim(), 
            timestamp: Date.now(),
            isEmpty: false
          }
        : conv
    ));

    const messageToSend = message.trim();
    setMessage('');

    try {
      const result = await sendRequestWithRetry(API_CONFIG.endpoints.chat, {
        userId: user.id,
        userName: user.name || user.displayName || 'Unknown User',
        message: messageToSend,
        chatId: activeConversation.id,
        sessionId: `session_${user.id}_${Date.now()}`,
        streamResponse: true
      }, { maxRetries: API_CONFIG.chatMaxRetries });
      
      if (result.success && result.data) {
        const aiResponseText = result.data.response || "I apologize, but I couldn't process your request. Please try again.";

        // Update AI message
        setActiveConversation(prev => ({
          ...prev,
          messages: prev.messages.map(msg => 
            msg.id === aiMessage.id 
              ? {
                  ...msg,
                  text: aiResponseText,
                  isThinking: false
                }
              : msg
          )
        }));
        
        console.log('✅ Message sent successfully');
      } else {
        throw new Error(result.error || 'Failed to get response');
      }
      
    } catch (error) {
      console.error('❌ Message send failed:', error);
      setError('Failed to send message. Please try again.');
      
      // Remove failed message
      setActiveConversation(prev => ({
        ...prev,
        messages: prev.messages.filter(msg => msg.id !== aiMessage.id)
      }));
    } finally {
      setIsSending(false);
    }
  };

  // Clear conversation
  const handleClearConversation = (conversationId) => {
    const clearedConversation = {
      ...conversations.find(c => c.id === conversationId),
      title: 'New chat',
      lastMessage: null,
      timestamp: null,
      messages: [],
      isEmpty: true
    };

    setConversations(prev => prev.map(conv => 
      conv.id === conversationId ? clearedConversation : conv
    ));
    
    if (activeConversation?.id === conversationId) {
      setActiveConversation(clearedConversation);
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-[#343541]">
      {/* Sidebar - ChatGPT style */}
      <div className="w-[260px] bg-[#f7f7f8] dark:bg-[#202123] flex flex-col">
        {/* New chat button */}
        <div className="p-2">
          <button
            onClick={handleNewConversation}
            className="flex items-center gap-3 w-full rounded-md border border-[#e5e5e5] dark:border-white/20 px-3 py-3 text-sm text-[#202123] dark:text-white hover:bg-[#e5e5e5] dark:hover:bg-[#2a2a2b] transition-colors"
          >
            <Plus size={16} />
            New chat
          </button>
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-2 pb-2">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleConversationSwitch(conv)}
                className={`group relative flex items-center gap-3 w-full rounded-md px-3 py-3 text-sm transition-colors ${
                  activeConversation?.id === conv.id
                    ? 'bg-[#e5e5e5] dark:bg-[#2a2a2b] text-[#202123] dark:text-white'
                    : 'text-[#202123] dark:text-white hover:bg-[#e5e5e5] dark:hover:bg-[#2a2a2b]'
                }`}
              >
                <MessageSquare size={16} />
                <span className="flex-1 text-left truncate">
                  {conv.isEmpty ? 'New chat' : conv.title}
                </span>
                {activeConversation?.id === conv.id && !conv.isEmpty && (
                  <div className="absolute right-2 flex gap-1 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Rename functionality can be added here
                      }}
                      className="p-1 hover:bg-[#d5d5d5] dark:hover:bg-[#353535] rounded"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearConversation(conv.id);
                      }}
                      className="p-1 hover:bg-[#d5d5d5] dark:hover:bg-[#353535] rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-[#e5e5e5] dark:border-white/20 p-2 space-y-2">
          {/* Theme toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex items-center gap-3 w-full rounded-md px-3 py-3 text-sm text-[#202123] dark:text-white hover:bg-[#e5e5e5] dark:hover:bg-[#2a2a2b] transition-colors"
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            {isDarkMode ? 'Light mode' : 'Dark mode'}
          </button>
          
          {/* User section */}
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full rounded-md px-3 py-3 text-sm text-[#202123] dark:text-white hover:bg-[#e5e5e5] dark:hover:bg-[#2a2a2b] transition-colors"
          >
            <User size={16} />
            <span className="flex-1 text-left truncate">{user.email}</span>
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {activeConversation?.messages?.length === 0 || activeConversation?.isEmpty ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-2xl mx-auto px-4">
                <h1 className="text-4xl font-semibold text-[#202123] dark:text-white mb-8">
                  CelesteOS
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    'How can I grow my business?',
                    'Help me be more productive', 
                    'I need creative ideas'
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => setMessage(prompt)}
                      className="p-4 rounded-md border border-[#e5e5e5] dark:border-[#40414f] text-sm text-[#202123] dark:text-white hover:bg-[#f7f7f8] dark:hover:bg-[#40414f] transition-colors text-left"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="pb-32">
              {activeConversation?.messages.map((msg, index) => (
                <div
                  key={msg.id}
                  className={`${
                    msg.isUser 
                      ? 'bg-white dark:bg-[#343541]' 
                      : 'bg-[#f7f7f8] dark:bg-[#444654]'
                  }`}
                >
                  <div className="max-w-3xl mx-auto px-4 py-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-sm flex items-center justify-center ${
                          msg.isUser 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-[#10a37f] text-white'
                        }`}>
                          {msg.isUser ? 'U' : 'C'}
                        </div>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        {msg.isThinking ? (
                          <div className="flex items-center gap-1 text-[#202123] dark:text-[#c5c5d2]">
                            <div className="w-2 h-2 bg-[#10a37f] rounded-full animate-pulse" />
                            <div className="w-2 h-2 bg-[#10a37f] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                            <div className="w-2 h-2 bg-[#10a37f] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                          </div>
                        ) : (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Error display */}
        {error && (
          <div className="mx-auto max-w-3xl px-4 mb-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md">
              <div className="font-medium">{error}</div>
              <div className="text-sm mt-2">
                Check browser console (F12) for detailed debugging information.
              </div>
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="absolute bottom-0 left-[260px] right-0 bg-gradient-to-t from-white dark:from-[#343541] pt-6">
          <div className="mx-auto max-w-3xl px-4">
            <div className="relative flex items-end gap-2 rounded-md border border-[#e5e5e5] dark:border-[#565869] bg-white dark:bg-[#40414f] shadow-sm">
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
                placeholder="Send a message..."
                className="flex-1 resize-none bg-transparent px-4 py-3 text-[#202123] dark:text-white placeholder-[#6e6e80] dark:placeholder-[#8e8ea0] focus:outline-none min-h-[24px] max-h-[200px]"
                style={{ height: '24px' }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || isSending}
                className="mb-3 mr-3 p-1 rounded-md text-[#6e6e80] dark:text-[#c5c5d2] hover:bg-[#e5e5e5] dark:hover:bg-[#565869] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-xs text-center text-[#6e6e80] dark:text-[#c5c5d2] py-2">
              CelesteOS can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        /* ChatGPT font stack */
        body {
          font-family: Söhne, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif, "Helvetica Neue", Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
        }
        
        /* Custom scrollbar like ChatGPT */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background-color: #c5c5d2;
          border-radius: 4px;
        }
        
        .dark ::-webkit-scrollbar-thumb {
          background-color: #565869;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background-color: #a0a0a0;
        }
        
        .dark ::-webkit-scrollbar-thumb:hover {
          background-color: #6e6e80;
        }

        /* Prose styling for markdown */
        .prose pre {
          background-color: #f7f7f8;
          border: 1px solid #e5e5e5;
        }
        
        .dark .prose pre {
          background-color: #000;
          border: 1px solid #565869;
        }
        
        .prose code {
          background-color: #f7f7f8;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
        }
        
        .dark .prose code {
          background-color: #000;
        }
      `}</style>
    </div>
  );
};

// Main App Component
const App = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('celesteos_user');
    const savedToken = localStorage.getItem('celesteos_token');
    
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (error) {
        console.error('Invalid saved session');
        localStorage.removeItem('celesteos_user');
        localStorage.removeItem('celesteos_token');
      }
    }
    
    setIsCheckingAuth(false);
  }, []);

  const handleLogin = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('celesteos_user', JSON.stringify(userData));
    localStorage.setItem('celesteos_token', authToken);
    
    // Generate session ID
    const sessionId = `session_${userData.id}_${Date.now()}`;
    sessionStorage.setItem('celesteos_session_id', sessionId);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('celesteos_user');
    localStorage.removeItem('celesteos_token');
    sessionStorage.removeItem('celesteos_session_id');
  };

  if (isCheckingAuth) {
    return null; // Or minimal loading state
  }

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return <ChatInterface user={user} onLogout={handleLogout} />;
};

export default App;