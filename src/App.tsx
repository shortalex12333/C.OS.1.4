import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './frontend-ux/components/Sidebar';
import { ChatArea } from './frontend-ux/components/ChatArea';
import { InputArea } from './frontend-ux/components/InputArea';
import { Settings } from './frontend-ux/components/Settings';
import { Login } from './frontend-ux/components/Login';
import { SignUp } from './frontend-ux/components/SignUp';
import { AnimatedIntro } from './frontend-ux/components/AnimatedIntro';
import { TutorialOverlay } from './frontend-ux/components/TutorialOverlay';
import { PreloadedQuestions } from './frontend-ux/components/PreloadedQuestions';
import { AskAlex } from './frontend-ux/components/AskAlex';
import { AskAlexPage } from './frontend-ux/components/AskAlexPage';
import { DesktopMobileComparison } from './frontend-ux/components/DesktopMobileComparison';
import { BackgroundSystem } from './frontend-ux/components/BackgroundSystem';
import { MobileHeader } from './frontend-ux/components/MobileHeader';
import { getSidebarWidth, checkIsMobile, checkComparisonMode } from './frontend-ux/utils/appUtils';
import completeWebhookService from './services/webhookServiceComplete';
import { authService } from './services/supabaseClient';
import type { ChatMessage } from './types/webhook';
import './frontend-ux/styles/enterpriseComponents.css';

type SearchType = 'yacht' | 'email' | 'email-yacht';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [appearance, setAppearance] = useState(() => {
    return localStorage.getItem('appearance') || 'light';
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedAppearance = localStorage.getItem('appearance') || 'light';
    if (savedAppearance === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return savedAppearance === 'dark';
  });
  const [isChatMode, setIsChatMode] = useState(false);
  const [showAskAlex, setShowAskAlex] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [displayName, setDisplayName] = useState<string>('User');
  const [currentSearchType, setCurrentSearchType] = useState<SearchType>('yacht');
  const [selectedModel, setSelectedModel] = useState<string>('air');
  const [showIntro, setShowIntro] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [hasReceivedJSON, setHasReceivedJSON] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string>('');
  const [conversationHistory, setConversationHistory] = useState<Array<{
    id: string;
    title: string;
    timestamp: string;
    messages: ChatMessage[];
    searchType: SearchType;
  }>>([]);
  
  // Theme change handler for Settings component
  const handleAppearanceChange = (newAppearance: string) => {
    setAppearance(newAppearance);
    localStorage.setItem('appearance', newAppearance);
    
    // Update dark mode state
    if (newAppearance === 'auto') {
      setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    } else {
      setIsDarkMode(newAppearance === 'dark');
    }
  };
  
  // Listen for system theme changes when in auto mode
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (appearance === 'auto') {
        setIsDarkMode(e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [appearance]);
  
  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    document.body.classList.toggle('dark-theme', isDarkMode);
    document.body.classList.toggle('light-theme', !isDarkMode);
  }, [isDarkMode]);

  // Check for existing Supabase session on mount
  // Initialize conversation ID on app load
  useEffect(() => {
    if (!currentConversationId) {
      setCurrentConversationId(generateConversationId());
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsAuthLoading(true);
        
        // Check for existing session
        const session = await authService.getSession();
        const user = await authService.getCurrentUser();
        
        if (session && user) {
          console.log('✅ Restored session for:', user.email);
          setIsLoggedIn(true);
          
          // Set display name from user metadata or email
          const savedUser = localStorage.getItem('celesteos_user');
          if (savedUser) {
            const userData = JSON.parse(savedUser);
            setDisplayName(userData.displayName || user.email?.split('@')[0] || 'User');
          } else {
            setDisplayName(user.user_metadata?.display_name || user.email?.split('@')[0] || 'User');
          }
          
          // Sync webhook service with restored auth state
          setTimeout(() => {
            completeWebhookService.syncWithSupabaseAuth();
            // Check if tutorial should be shown for existing session
            checkAndShowTutorial();
          }, 500);
        } else {
          console.log('ℹ️ No existing session found');
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('❌ Auth check error:', error);
        setIsLoggedIn(false);
      } finally {
        setIsAuthLoading(false);
      }
    };

    checkAuth();

    // Subscribe to auth state changes
    const unsubscribe = authService.onAuthStateChange((user) => {
      if (user) {
        console.log('🔄 Auth state changed - User logged in:', user.email);
        setIsLoggedIn(true);
        setDisplayName(user.user_metadata?.display_name || user.email?.split('@')[0] || 'User');
        
        // Sync webhook service with new auth state
        setTimeout(() => {
          completeWebhookService.syncWithSupabaseAuth();
          // Check if tutorial should be shown after auth sync
          checkAndShowTutorial();
        }, 500);
      } else {
        console.log('🔄 Auth state changed - User logged out');
        setIsLoggedIn(false);
        setDisplayName('User');
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Check for existing session on app start - intro only
  useEffect(() => {
    const checkSession = () => {
      // Check if user has seen intro
      const hasSeenIntro = localStorage.getItem('hasSeenIntro');
      if (!hasSeenIntro) {
        setShowIntro(true);
        return;
      }
      
      // Only check webhook service if Supabase auth didn't already handle it
      if (!isLoggedIn && completeWebhookService.isLoggedIn()) {
        const user = completeWebhookService.getCurrentUser();
        if (user) {
          const name = user.userName || user.email || 'User';
          setDisplayName(name);
          setIsLoggedIn(true);
          console.log('✅ Restored webhook session for:', name);
          // Tutorial will be handled by the main auth flow
        }
      }
    };
    checkSession();
  }, []);

  // Check if device is mobile
  useEffect(() => {
    const handleResize = () => setIsMobile(checkIsMobile());
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check for comparison mode from URL hash
  useEffect(() => {
    const handleHashChange = () => setShowComparison(checkComparisonMode());
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Close mobile menu when switching to desktop
  useEffect(() => {
    if (!isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobile]);

  // Apply chat mode class to body for clean white workspace
  useEffect(() => {
    document.body.classList.add('theme-transition');
    if (isLoggedIn && isChatMode) {
      document.body.classList.add('chat-mode');
    } else {
      document.body.classList.remove('chat-mode');
    }
    return () => document.body.classList.remove('chat-mode');
  }, [isLoggedIn, isChatMode]);

  // Watch for login state changes to trigger tutorial
  useEffect(() => {
    if (isLoggedIn && !showIntro) {
      const hasCompletedTutorial = localStorage.getItem('hasCompletedTutorial');
      if (!hasCompletedTutorial && !showTutorial) {
        console.log('🎓 User logged in, checking tutorial status');
        setTimeout(() => {
          setShowTutorial(true);
          console.log('🎓 Tutorial activated for logged-in user');
        }, 1500);
      }
    }
  }, [isLoggedIn, showIntro, showTutorial]);

  const handleLogin = async (email: string, password: string) => {
    // Note: The actual authentication is handled in the Login component via Supabase
    // This handler is kept for compatibility but auth state is managed by authService listener
    console.log('🔄 Login process initiated for:', email);
    
    // Check and show tutorial for new users after successful login
    const hasCompletedTutorial = localStorage.getItem('hasCompletedTutorial');
    if (!hasCompletedTutorial) {
      console.log('🎓 New user logged in - will show tutorial');
      setTimeout(() => {
        setShowTutorial(true);
      }, 1500);
    }
  };

  const handleSignUp = async (firstName: string, lastName: string, email: string, password: string) => {
    // Note: This is handled by Supabase now, but kept for compatibility
    console.log('🔄 Signup process initiated for:', email);
  };

  // Consolidated tutorial trigger function - with proper state check
  const checkAndShowTutorial = useCallback(() => {
    const hasCompletedTutorial = localStorage.getItem('hasCompletedTutorial');
    if (!hasCompletedTutorial) {
      console.log('🎓 Tutorial not completed, will show for logged in user');
      // Use a slight delay to ensure UI is ready
      setTimeout(() => {
        setShowTutorial(true);
        console.log('🎓 Tutorial triggered');
      }, 1500);
    } else {
      console.log('✅ Tutorial already completed');
    }
  }, []);

  const handleStartChat = async (message: string, searchType?: SearchType) => {
    if (searchType) {
      setCurrentSearchType(searchType);
      console.log('Starting chat with search type:', searchType);
    }
    
    // Add user message to chat immediately
    const userMessageId = `msg_${Date.now()}_user`;
    const userMessage: ChatMessage = {
      id: userMessageId,
      content: message,
      isUser: true,
      timestamp: new Date().toISOString(),
      searchType
    };
    setChatMessages(prev => [...prev, userMessage]);
    
    // Switch to chat mode
    setTimeout(() => setIsChatMode(true), 50);
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
    
    // Send message to backend via webhook
    try {
      const webhookSearchType = searchType === 'email-yacht' ? 'email' : (searchType || 'local');
      const response = await completeWebhookService.sendTextChat(message, webhookSearchType as 'local' | 'yacht' | 'email');
      
      console.log('📤 Chat message sent:', message);
      console.log('📥 Backend response:', response);
      
      if (response.success && response.data) {
        // Check if response contains JSON with solution cards
        const isJSON = typeof response.data === 'object' && 
          (response.data.items || response.data.solutions || response.data.sources);
        
        if (isJSON) {
          setHasReceivedJSON(true);
        }
        
        // Add bot response to chat
        const botMessageId = `msg_${Date.now()}_bot`;
        
        // Pass the raw response data to let ChatMessage component handle formatting
        const botMessage: ChatMessage = {
          id: botMessageId,
          content: response.data, // Pass the entire response object
          isUser: false,
          timestamp: new Date().toISOString(),
          searchType,
          metadata: response.data.metadata,
          isStreaming: true // Enable streaming animation
        };
        setChatMessages(prev => [...prev, botMessage]);
        
        // Mark streaming complete after animation duration
        const streamDuration = typeof response.data === 'string' 
          ? response.data.length * 20 
          : (response.data.answer || response.data.message || '').length * 20;
        
        setTimeout(() => {
          setChatMessages(prev => 
            prev.map(msg => 
              msg.id === botMessageId 
                ? { ...msg, isStreaming: false }
                : msg
            )
          );
        }, Math.min(streamDuration, 5000)); // Cap at 5 seconds
      } else {
        console.error('❌ Chat failed:', response.error);
        // Add error message to chat
        const errorMessageId = `msg_${Date.now()}_error`;
        const errorMessage: ChatMessage = {
          id: errorMessageId,
          content: `Error: ${response.error || 'Unknown error'}`,
          isUser: false,
          timestamp: new Date().toISOString(),
          searchType,
          isStreaming: true
        };
        setChatMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('❌ Chat error:', error);
      // Add error message to chat
      const errorMessageId = `msg_${Date.now()}_error`;
      const errorMessage: ChatMessage = {
        id: errorMessageId,
        content: `Network error: ${error instanceof Error ? error.message : 'Connection failed'}`,
        isUser: false,
        timestamp: new Date().toISOString(),
        searchType,
        isStreaming: true
      };
      setChatMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    console.log('Model changed to:', modelId);
  };

  const generateConversationId = () => {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const saveCurrentConversation = () => {
    if (currentConversationId && chatMessages.length > 0) {
      const firstUserMessage = chatMessages.find(msg => msg.isUser);
      const title = firstUserMessage?.content.toString().slice(0, 50) || 'New Chat';
      
      setConversationHistory(prev => [
        {
          id: currentConversationId,
          title: title + (title.length >= 50 ? '...' : ''),
          timestamp: new Date().toISOString(),
          messages: chatMessages,
          searchType: currentSearchType
        },
        ...prev.filter(conv => conv.id !== currentConversationId)
      ]);
    }
  };

  const handleNewChat = () => {
    // Save current conversation if it exists
    saveCurrentConversation();
    
    // Create new conversation
    setIsChatMode(false);
    setChatMessages([]);
    setCurrentConversationId(generateConversationId());
  };
  const handleSearchTypeChangeWithNewChat = (searchType: SearchType) => {
    // Save current conversation if it exists
    saveCurrentConversation();
    
    // Start new conversation with new search type
    setCurrentSearchType(searchType);
    setIsChatMode(false);
    setChatMessages([]);
    setCurrentConversationId(generateConversationId());
    
    // Close mobile menu if open
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleSidebarCollapse = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };
  const handleCloseSettings = () => setIsSettingsOpen(false);
  
  const handleMainContentClick = () => {
    // Hide sidebar when clicking main content area on mobile (homepage only)
    if (isMobile && isMobileMenuOpen && !isChatMode) {
      setIsMobileMenuOpen(false);
    }
  };

  // isDarkMode now comes from ThemeProvider

  if (showComparison) {
    return <DesktopMobileComparison />;
  }

  // Show loading state while checking auth
  if (isAuthLoading) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${isDarkMode ? 'dark' : ''}`} style={{
        backgroundColor: isDarkMode ? '#0f0b12' : '#ffffff',
      }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-full w-full flex-col relative overflow-hidden chat-mode-transition theme-transition ${isDarkMode ? 'dark' : ''}`} style={{
      animation: 'fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundColor: isDarkMode ? '#0f0b12' : '#ffffff',
      minHeight: '100vh',
      color: isDarkMode ? '#f6f7fb' : '#1f2937',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      {/* Background System */}
      <BackgroundSystem 
        isDarkMode={isDarkMode}
        isChatMode={isChatMode}
        isLoggedIn={isLoggedIn}
      />

      {/* Animated Intro */}
      {showIntro && (
        <AnimatedIntro
          isVisible={showIntro}
          onComplete={() => {
            setShowIntro(false);
            localStorage.setItem('hasSeenIntro', 'true');
          }}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Tutorial Overlay */}
      {showTutorial && isLoggedIn && (
        <TutorialOverlay
          isVisible={showTutorial}
          onComplete={() => setShowTutorial(false)}
          isDarkMode={isDarkMode}
          messageCount={chatMessages.length}
          hasReceivedJSON={hasReceivedJSON}
        />
      )}


      {/* Show Login or SignUp Page if not logged in and intro is complete */}
      {!showIntro && !isLoggedIn ? (
        <div className="relative z-10 h-full w-full" style={{
          animation: 'scaleIn 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          {showSignUp ? (
            <SignUp 
              onSignUp={handleSignUp} 
              onBack={() => setShowSignUp(false)}
              isMobile={isMobile}
              isDarkMode={isDarkMode}
            />
          ) : (
            <Login 
              onLogin={handleLogin} 
              onSignUp={() => setShowSignUp(true)}
              isMobile={isMobile}
              isDarkMode={isDarkMode}
            />
          )}
        </div>
      ) : !showIntro && isLoggedIn ? (
        <>
          {/* Ask Alex Page */}
          {showAskAlex ? (
            <AskAlexPage 
              onBack={() => setShowAskAlex(false)}
              isDarkMode={isDarkMode}
              isMobile={isMobile}
            />
          ) : (
            <>
              {/* Settings Modal */}
              <Settings 
                isOpen={isSettingsOpen} 
                onClose={handleCloseSettings} 
                isMobile={isMobile}
                displayName={displayName}
                onDisplayNameChange={setDisplayName}
                isChatMode={isChatMode}
                appearance={appearance}
                onAppearanceChange={handleAppearanceChange}
              />

              <div className="relative flex h-full w-full flex-1 transition-colors z-10">
            {/* Mobile Header */}
            {isMobile && (
              <MobileHeader 
                isMobileMenuOpen={isMobileMenuOpen}
                onToggleMobileMenu={toggleMobileMenu}
                isDarkMode={isDarkMode}
              />
            )}

            <div className="relative flex h-full w-full flex-row">
              {/* Sidebar */}
              <div className={`
                ${isMobile 
                  ? `fixed left-0 z-[55] h-full transition-all duration-300 ease-out ${
                      isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }` 
                  : 'relative z-20 transition-all duration-300'
                } 
                ${getSidebarWidth(isMobile, isSidebarCollapsed)} 
                shrink-0 overflow-hidden sidebar_container
                ${isMobile ? 'top-0' : ''}
              `}>
                <Sidebar 
                  onNewChat={handleNewChat} 
                  onOpenSettings={handleOpenSettings}
                  onAskAlex={() => setShowAskAlex(true)}
                  isMobile={isMobile}
                  isCollapsed={isSidebarCollapsed}
                  onToggleCollapse={toggleSidebarCollapse}
                  onMobileMenuClose={() => setIsMobileMenuOpen(false)}
                  displayName={displayName}
                  isChatMode={isChatMode}
                  isDarkMode={isDarkMode}
                  onSearchTypeChange={handleSearchTypeChangeWithNewChat}
                  selectedSearchType={currentSearchType}
                  conversationHistory={conversationHistory}
                />
              </div>
              
              {/* Main content area */}
              <div 
                className={`
                  relative flex h-full flex-1 flex-col transition-all duration-300 main_content_container
                  ${isMobile ? 'w-full min-w-0' : 'max-w-full'}
                `}
                onClick={handleMainContentClick}
              >
                <main className={`
                  relative h-full w-full flex-1 overflow-auto scrollbar-hidden chat_interface
                  ${isMobile ? 'pt-[64px]' : ''}
                `}>
                  <div className="h-full w-full">
                    <div className="flex h-full flex-col focus-visible:outline-0 overflow-hidden">
                      <div className="flex-1 overflow-auto scrollbar-hidden">
                        <ChatArea 
                          isChatMode={isChatMode} 
                          isMobile={isMobile} 
                          displayName={displayName}
                          isDarkMode={isDarkMode}
                          selectedModel={selectedModel}
                          onModelChange={handleModelChange}
                          messages={chatMessages}
                          onAskAlexClick={() => setShowAskAlex(true)}
                        />
                      </div>
                      {/* Show preloaded questions when no messages, regardless of chat mode */}
                      {chatMessages.length === 0 && (
                        <div className="flex-shrink-0">
                          <PreloadedQuestions 
                            onQuestionClick={handleStartChat}
                            isDarkMode={isDarkMode}
                            isMobile={isMobile}
                          />
                        </div>
                      )}
                      <div className="flex-shrink-0">
                        <InputArea 
                          onStartChat={handleStartChat} 
                          isMobile={isMobile}
                          isDarkMode={isDarkMode}
                          currentSearchType={currentSearchType}
                        />
                      </div>
                    </div>
                  </div>
                </main>
              </div>
            </div>
          </div>
            </>
          )}

        </>
      ) : null}
    </div>
  );
}