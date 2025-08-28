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
  const [showWhiteFade, setShowWhiteFade] = useState(false);
  const [fadeToInterface, setFadeToInterface] = useState(false);
  const [hasReceivedJSON, setHasReceivedJSON] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string>('');
  const [conversationHistory, setConversationHistory] = useState<Array<{
    id: string;
    title: string;
    timestamp: string;
    messages: ChatMessage[];
    searchType: SearchType;
  }>>([]);
  const [showScheduleCallPopup, setShowScheduleCallPopup] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  
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
        setDisplayName(user.user_metadata?.display_name || user.email?.split('@')[0] || 'User');
        
        // Only show white fade for actual login action, not on refresh
        // Check if this is a new login by checking if user was previously not logged in
        const isNewLogin = !isLoggedIn && !isAuthLoading;
        
        if (isNewLogin) {
          // New login - show white fade animation
          setShowWhiteFade(true);
          
          setTimeout(() => {
            setIsLoggedIn(true);
            setFadeToInterface(true);
            
            // Sync webhook service with new auth state
            setTimeout(() => {
              completeWebhookService.syncWithSupabaseAuth();
              checkAndShowTutorial();
              
              // Remove white fade after interface has loaded
              setTimeout(() => {
                setShowWhiteFade(false);
              }, 1600);
            }, 500);
          }, 1000); // Wait for white fade to reach peak
        } else {
          // Page refresh or existing session - no white fade
          setIsLoggedIn(true);
          
          // Sync webhook service immediately
          setTimeout(() => {
            completeWebhookService.syncWithSupabaseAuth();
            checkAndShowTutorial();
          }, 100);
        }
      } else {
        console.log('🔄 Auth state changed - User logged out');
        setIsLoggedIn(false);
        setDisplayName('User');
        setFadeToInterface(false);
        setShowWhiteFade(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Check for existing session on app start - intro only
  useEffect(() => {
    const checkSession = () => {
      // Check webhook service for existing session first
      if (!isLoggedIn && completeWebhookService.isLoggedIn()) {
        const user = completeWebhookService.getCurrentUser();
        if (user) {
          const name = user.userName || user.email || 'User';
          setDisplayName(name);
          setIsLoggedIn(true);
          console.log('✅ Restored webhook session for:', name);
          return; // Skip intro if logged in
        }
      }
      
      // Always show intro for unauthenticated users
      if (!isLoggedIn) {
        setShowIntro(true);
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

  // Trigger schedule call popup on 10th user message
  useEffect(() => {
    // Count only user messages (not bot responses)
    const userMessages = chatMessages.filter(message => message.isUser);
    const userMessageCount = userMessages.length;
    
    // Trigger popup when user sends their 10th message
    if (userMessageCount === 10 && !showScheduleCallPopup) {
      console.log('🎯 Triggering schedule call popup - user has sent 10 messages');
      setShowScheduleCallPopup(true);
    }
    
    // Update message count for debugging
    setMessageCount(userMessageCount);
  }, [chatMessages, showScheduleCallPopup]);

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
      const hasCompletedInitial = localStorage.getItem('hasCompletedInitialTutorial');
      
      // Show initial tutorial if nothing has been completed
      if (!hasCompletedTutorial && !hasCompletedInitial && !showTutorial) {
        console.log('🎓 User logged in, checking tutorial status');
        setTimeout(() => {
          setShowTutorial(true);
          console.log('🎓 Tutorial activated for logged-in user');
        }, 1500);
      }
    }
  }, [isLoggedIn, showIntro, showTutorial]);

  // Watch for hasReceivedJSON to trigger solution tutorial
  useEffect(() => {
    if (hasReceivedJSON && isLoggedIn) {
      const hasCompletedSolution = localStorage.getItem('hasCompletedSolutionTutorial');
      const hasCompletedInitial = localStorage.getItem('hasCompletedInitialTutorial');
      
      if (hasCompletedInitial && !hasCompletedSolution && !showTutorial) {
        console.log('🎓 JSON received, triggering solution tutorial');
        setTimeout(() => {
          setShowTutorial(true);
        }, 1500); // Give time for solution cards to render
      }
    }
  }, [hasReceivedJSON, isLoggedIn, showTutorial]);

  const handleLogin = async (email: string, password: string) => {
    // Note: The actual authentication is handled in the Login component via Supabase
    // This handler is kept for compatibility but auth state is managed by authService listener
    console.log('🔄 Login process initiated for:', email);
    
    // The white fade animation is now handled in the authService.onAuthStateChange listener
    // to ensure proper timing with the actual authentication state change
  };

  const handleSignUp = async (firstName: string, lastName: string, email: string, password: string) => {
    // Note: This is handled by Supabase now, but kept for compatibility
    console.log('🔄 Signup process initiated for:', email);
  };

  // Consolidated tutorial trigger function - with proper state check
  const checkAndShowTutorial = useCallback(() => {
    const hasCompletedTutorial = localStorage.getItem('hasCompletedTutorial');
    const hasCompletedInitial = localStorage.getItem('hasCompletedInitialTutorial');
    const hasCompletedSolution = localStorage.getItem('hasCompletedSolutionTutorial');
    
    if (!hasCompletedTutorial) {
      if (!hasCompletedInitial) {
        console.log('🎓 Initial tutorial not completed, will show for logged in user');
        // Use a slight delay to ensure UI is ready
        setTimeout(() => {
          setShowTutorial(true);
          console.log('🎓 Tutorial triggered');
        }, 1500);
      } else if (hasReceivedJSON && !hasCompletedSolution) {
        console.log('🎓 Solution tutorial needed, re-showing tutorial');
        setTimeout(() => {
          setShowTutorial(true);
          console.log('🎓 Solution tutorial triggered');
        }, 500);
      }
    } else {
      console.log('✅ Tutorial already completed');
    }
  }, [hasReceivedJSON]);

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
    
    // Set waiting state before sending
    setIsWaitingForResponse(true);
    
    // Send message to backend via webhook
    try {
      const webhookSearchType = searchType === 'email-yacht' ? 'email' : (searchType || 'local');
      const response = await completeWebhookService.sendTextChat(message, webhookSearchType as 'local' | 'yacht' | 'email');
      
      console.log('📤 Chat message sent:', message);
      console.log('📥 Backend response:', response);
      
      // Clear waiting state
      setIsWaitingForResponse(false);
      
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
        setIsWaitingForResponse(false);
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
      setIsWaitingForResponse(false);
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
  const handleCloseScheduleCallPopup = () => setShowScheduleCallPopup(false);
  
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
      animation: fadeToInterface ? 'fadeFromWhite 1.6s cubic-bezier(0.22, 0.61, 0.36, 1)' : 'fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundColor: isDarkMode ? '#0f0b12' : '#ffffff',
      minHeight: '100vh',
      color: isDarkMode ? '#f6f7fb' : '#1f2937',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      {/* Premium White Fade Overlay */}
      {showWhiteFade && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#ffffff',
            zIndex: 9999,
            pointerEvents: 'none',
            animation: 'whiteFadeInOut 2.6s cubic-bezier(0.4, 0, 0.2, 1)',
            animationFillMode: 'forwards'
          }}
        />
      )}

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
      {!showIntro && !isLoggedIn && !showWhiteFade ? (
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

            <div className="relative z-10 flex h-full w-full flex-row">
              {/* Sidebar - removed overflow-hidden to allow blur to work */}
              <div className={`
                ${isMobile 
                  ? `fixed left-0 z-[55] h-full transition-all duration-300 ease-out ${
                      isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }` 
                  : 'relative z-20 transition-all duration-300'
                } 
                ${getSidebarWidth(isMobile, isSidebarCollapsed)} 
                shrink-0 sidebar_container
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
                          onFAQpageClick={() => setShowAskAlex(true)}
                          isWaitingForResponse={isWaitingForResponse}
                          searchType={currentSearchType}
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

          {/* Schedule Call Popup - Triggered on 10th message */}
          {showScheduleCallPopup && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
              backdropFilter: 'blur(8px)'
            }}>
              <div style={{
                background: isDarkMode ? 'var(--background, #0f0b12)' : '#ffffff',
                borderRadius: '8px',
                padding: '32px',
                maxWidth: isMobile ? '90%' : '500px',
                width: '100%',
                margin: '20px',
                boxShadow: isDarkMode 
                  ? '0 20px 40px rgba(0, 0, 0, 0.8)' 
                  : '0 20px 40px rgba(0, 0, 0, 0.15)',
                border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.06)',
                animation: 'popupAppear 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: isDarkMode ? 'var(--headline, #f6f7fb)' : '#1f2937',
                  marginBottom: '16px',
                  textAlign: 'center'
                }}>
                  🎯 Ready to take the next step?
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: isDarkMode ? 'rgba(246, 247, 251, 0.8)' : '#6b7280',
                  marginBottom: '24px',
                  lineHeight: '1.5',
                  textAlign: 'center'
                }}>
                  You've been actively exploring CelesteOS! Let's schedule a quick call to show you how it can solve your specific engineering challenges.
                </p>
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  <button
                    onClick={() => {
                      window.open('https://calendly.com/celesteos/demo', '_blank');
                      handleCloseScheduleCallPopup();
                    }}
                    style={{
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 24px',
                      fontSize: '16px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Schedule a Demo
                  </button>
                  <button
                    onClick={handleCloseScheduleCallPopup}
                    style={{
                      backgroundColor: 'transparent',
                      color: isDarkMode ? 'rgba(246, 247, 251, 0.7)' : '#6b7280',
                      border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      padding: '12px 24px',
                      fontSize: '16px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Debug Message Count Display - Remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{
              position: 'fixed',
              top: '80px',
              right: '20px',
              background: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
              color: isDarkMode ? '#fff' : '#000',
              padding: '8px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'monospace',
              zIndex: 9999,
              border: '1px solid ' + (isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)')
            }}>
              User Messages: {messageCount}/10
            </div>
          )}

        </>
      ) : null}
      
      {/* Premium Animation Styles */}
      <style>{`
        @keyframes popupAppear {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes whiteFadeInOut {
          0% {
            opacity: 0;
          }
          35% {
            opacity: 1;
          }
          65% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
        
        @keyframes fadeFromWhite {
          0% {
            opacity: 0;
            transform: scale(1.02);
            filter: brightness(1.2);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.01);
            filter: brightness(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
            filter: brightness(1);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.98);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}