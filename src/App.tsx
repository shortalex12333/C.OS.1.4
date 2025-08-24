import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { InputArea } from './components/InputArea';
import { Settings } from './components/Settings';
import { Login } from './components/Login';
import { AnimatedIntro } from './components/AnimatedIntro';
import { TutorialOverlay } from './components/TutorialOverlay';
import { AskAlex } from './components/AskAlex';
import { DesktopMobileComparison } from './components/DesktopMobileComparison';
import { BackgroundSystem } from './components/BackgroundSystem';
import { MobileHeader } from './components/MobileHeader';
import { getSidebarWidth, checkIsMobile, checkComparisonMode } from './utils/appUtils';
import completeWebhookService from './services/webhookServiceComplete';

type SearchType = 'yacht' | 'email' | 'web' | 'email-yacht';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isChatMode, setIsChatMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [displayName, setDisplayName] = useState('John Doe');
  const [appearance, setAppearance] = useState('light');
  const [currentSearchType, setCurrentSearchType] = useState<SearchType>('yacht');
  const [selectedModel, setSelectedModel] = useState<string>('air');
  const [showIntro, setShowIntro] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showAskAlex, setShowAskAlex] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    content: string;
    isUser: boolean;
    timestamp: string;
    searchType?: SearchType;
  }>>([]);

  // Check for existing session on app start
  useEffect(() => {
    const checkSession = () => {
      // Check if user has seen intro
      const hasSeenIntro = localStorage.getItem('hasSeenIntro');
      if (!hasSeenIntro) {
        setShowIntro(true);
        return;
      }
      
      if (completeWebhookService.isLoggedIn()) {
        const user = completeWebhookService.getCurrentUser();
        if (user) {
          setDisplayName(user.userName || user.email);
          setIsLoggedIn(true);
          console.log('✅ Restored session for:', user.userName);
          
          // Check if user has completed tutorial
          const hasCompletedTutorial = localStorage.getItem('hasCompletedTutorial');
          if (!hasCompletedTutorial) {
            // Show tutorial after user logs in for the first time
            setTimeout(() => setShowTutorial(true), 1000);
          }
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
    if (isLoggedIn && isChatMode) {
      document.body.classList.add('chat-mode');
    } else {
      document.body.classList.remove('chat-mode');
    }
    return () => document.body.classList.remove('chat-mode');
  }, [isLoggedIn, isChatMode]);

  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await completeWebhookService.login(username, password);
      
      if (response.success && response.data) {
        setDisplayName(response.data.userName || username);
        setIsLoggedIn(true);
        console.log('✅ Login successful:', response.data);
        
        // Check if user has completed tutorial
        const hasCompletedTutorial = localStorage.getItem('hasCompletedTutorial');
        if (!hasCompletedTutorial) {
          // Show tutorial after user logs in for the first time
          setTimeout(() => setShowTutorial(true), 1500);
        }
      } else {
        console.error('❌ Login failed:', response.error || response.message);
        alert('Login failed: ' + (response.error || response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      alert('Login error: ' + (error instanceof Error ? error.message : 'Network error'));
    }
  };

  const handleStartChat = async (message: string, searchType?: SearchType) => {
    if (searchType) {
      setCurrentSearchType(searchType);
      console.log('Starting chat with search type:', searchType);
    }
    
    // Add user message to chat immediately
    const userMessageId = `msg_${Date.now()}_user`;
    const userMessage = {
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
      const response = await completeWebhookService.sendTextChat(message, webhookSearchType as 'local' | 'yacht' | 'email' | 'web');
      
      console.log('📤 Chat message sent:', message);
      console.log('📥 Backend response:', response);
      
      if (response.success && response.data) {
        // Add bot response to chat
        const botMessageId = `msg_${Date.now()}_bot`;
        const botMessage = {
          id: botMessageId,
          content: response.data.response || 'Response received',
          isUser: false,
          timestamp: new Date().toISOString(),
          searchType
        };
        setChatMessages(prev => [...prev, botMessage]);
      } else {
        console.error('❌ Chat failed:', response.error);
        // Add error message to chat
        const errorMessageId = `msg_${Date.now()}_error`;
        const errorMessage = {
          id: errorMessageId,
          content: `Error: ${response.error || 'Unknown error'}`,
          isUser: false,
          timestamp: new Date().toISOString(),
          searchType
        };
        setChatMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('❌ Chat error:', error);
      // Add error message to chat
      const errorMessageId = `msg_${Date.now()}_error`;
      const errorMessage = {
        id: errorMessageId,
        content: `Network error: ${error instanceof Error ? error.message : 'Connection failed'}`,
        isUser: false,
        timestamp: new Date().toISOString(),
        searchType
      };
      setChatMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    console.log('Model changed to:', modelId);
  };

  const handleNewChat = () => {
    setIsChatMode(false);
    setChatMessages([]);
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

  const isDarkMode = appearance === 'dark';

  if (showComparison) {
    return <DesktopMobileComparison />;
  }

  return (
    <div className={`flex h-full w-full flex-col relative overflow-hidden chat-mode-transition ${isDarkMode ? 'dark' : ''}`}>
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
        />
      )}

      {/* Ask Alex Modal */}
      {showAskAlex && (
        <AskAlex
          isDarkMode={isDarkMode}
          onClose={() => setShowAskAlex(false)}
          isMobile={isMobile}
        />
      )}

      {/* Show Login Page if not logged in and intro is complete */}
      {!showIntro && !isLoggedIn ? (
        <div className="relative z-10 h-full w-full">
          <Login onLogin={handleLogin} isMobile={isMobile} />
        </div>
      ) : !showIntro && isLoggedIn ? (
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
            onAppearanceChange={setAppearance}
          />

          <div className="relative flex h-full w-full flex-1 transition-colors z-10">
            {/* Mobile Header */}
            {isMobile && (
              <MobileHeader 
                isMobileMenuOpen={isMobileMenuOpen}
                onToggleMobileMenu={toggleMobileMenu}
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
                  onSearchTypeChange={setCurrentSearchType}
                  selectedSearchType={currentSearchType}
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
                        />
                      </div>
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
      ) : null}
    </div>
  );
}