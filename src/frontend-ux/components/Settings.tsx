import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { 
  SettingsSection, 
  settingsMenuItems,
  languageOptions,
  appearanceOptions,
  dateRangeOptions,
  accountScopeOptions,
  messageTypeOptions
} from './settings/SettingsConstants';
import { SectionHeader, AppleSettingsRow, FormGroup, UnifiedTextarea } from './settings/SettingsComponents';
import { renderSectionContent as renderSettingsContent } from './settings/SettingsSections';
import { darkTheme } from '../styles/darkModeTheme';

// =====================================================
// DESIGN TOKENS - PREMIUM MARITIME INTELLIGENCE SYSTEM
// =====================================================
const MODAL_DESIGN = {
  modal: {
    width: '800px',
    height: '650px',
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 32px 64px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    // Dark mode premium modal
    dark: {
      background: darkTheme.backgrounds.secondary, // #13151a - elevated modal
      boxShadow: darkTheme.effects.elevationHigh,
      border: `1px solid ${darkTheme.modal.border}`,
      backdropFilter: 'blur(8px)'
    }
  },
  header: {
    background: '#f8f9fa',
    borderBottom: '1px solid #e9ecef',
    padding: '18px 24px',
    height: '60px',
    // Dark mode header with gradient
    dark: {
      background: darkTheme.modal.header,
      borderBottom: `1px solid ${darkTheme.modal.headerBorder}`
    }
  },
  sidebar: {
    width: '220px',
    background: '#f8f9fa',
    borderRight: '1px solid #e9ecef',
    // Dark mode sidebar
    dark: {
      background: darkTheme.backgrounds.primary, // #0a0b0d - deep ocean
      borderRight: `1px solid ${darkTheme.sidebar.border}`
    }
  },
  content: {
    background: '#ffffff',
    padding: '28px 36px',
    // Dark mode content
    dark: {
      background: darkTheme.backgrounds.secondary // #13151a - elevated
    }
  },
  nav: {
    item: {
      padding: '10px 16px',
      fontSize: '14px',
      borderRadius: '8px',
      margin: '4px 12px',
      transition: `all ${darkTheme.effects.timingFast} ${darkTheme.effects.easingDefault}`,
      whiteSpace: 'nowrap'
    }
  }
};

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile?: boolean;
  displayName: string;
  onDisplayNameChange: (name: string) => void;
  isChatMode?: boolean;
  appearance?: string;
  onAppearanceChange?: (appearance: string) => void;
  isDarkMode?: boolean;
}

interface MicrosoftConnectionStatus {
  connected: boolean;
  email?: string;
  displayName?: string;
  organization?: string;
  lastSynced?: string;
  loading: boolean;
  error?: string;
}

export function Settings({ 
  isOpen, 
  onClose, 
  isMobile = false, 
  displayName, 
  onDisplayNameChange, 
  isChatMode = false, 
  appearance = 'light', 
  onAppearanceChange,
  isDarkMode = false 
}: SettingsProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>('general');
  const [language, setLanguage] = useState('en');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [dateRange, setDateRange] = useState('30');
  const [accountScope, setAccountScope] = useState('this');
  const [messageType, setMessageType] = useState('');
  const [messageContent, setMessageContent] = useState('');
  
  // Microsoft Connection Status Management
  const [microsoftStatus, setMicrosoftStatus] = useState<MicrosoftConnectionStatus>({
    connected: false,
    loading: true
  });

  // Language and appearance options are imported from SettingsConstants
  // Removed local duplicates to avoid conflicts

  // Function to check Microsoft connection status
  const checkMicrosoftConnection = async () => {
    try {
      setMicrosoftStatus(prev => ({ ...prev, loading: true, error: undefined }));
      
      const userId = localStorage.getItem('ms_user_id') || `user_${Date.now()}`;
      
      const response = await fetch(`${import.meta.env.VITE_WEBHOOK_BASE_URL || 'https://api.celeste7.ai/webhook/'}microsoft-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'check_status',
          user_id: userId
        }),
        signal: AbortSignal.timeout(10000)
      });

      if (response.ok) {
        const data = await response.json();
        setMicrosoftStatus({
          connected: data.connected || false,
          email: data.email,
          displayName: data.display_name || data.displayName,
          organization: data.organization,
          lastSynced: data.last_synced || data.lastSynced,
          loading: false
        });
      } else {
        throw new Error(`Status check failed: ${response.status}`);
      }
    } catch (error) {
      console.log('Microsoft connection check failed:', error);
      setMicrosoftStatus({
        connected: false,
        loading: false,
        error: 'Unable to check connection status'
      });
    }
  };

  // Check connection status on component mount and when connectors section is viewed
  useEffect(() => {
    if (activeSection === 'connectors') {
      checkMicrosoftConnection();
      const interval = setInterval(checkMicrosoftConnection, 30000);
      return () => clearInterval(interval);
    }
  }, [activeSection]);

  // Handle Microsoft OAuth connection
  const handleMicrosoftConnect = async () => {
    try {
      const userId = localStorage.getItem('ms_user_id') || `user_${Date.now()}`;
      localStorage.setItem('ms_user_id', userId);
      
      // Save current appearance preference for OAuth callback page
      localStorage.setItem('appearance', appearance);

      const CLIENT_ID = '41f6dc82-8127-4330-97e0-c6b26e6aa967';
      const REDIRECT_URI = encodeURIComponent(import.meta.env.VITE_OAUTH_REDIRECT_URI || `${window.location.origin}/api/auth/callback`);
      const SCOPES = encodeURIComponent('openid profile email offline_access User.Read IMAP.AccessAsUser.All');

      const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=${SCOPES}&state=${userId}&prompt=select_account`;

      const popup = window.open(authUrl, '_blank', 'width=500,height=700,scrollbars=yes,resizable=yes');
      
      // Listen for success message from popup
      const messageHandler = (event) => {
        if (event.data && event.data.type === 'oauth_success') {
          console.log('OAuth success received:', event.data);
          checkMicrosoftConnection();
          window.removeEventListener('message', messageHandler);
        }
      };
      window.addEventListener('message', messageHandler);
      
      setTimeout(() => {
        checkMicrosoftConnection();
      }, 2000);
    } catch (error) {
      console.error('Microsoft connection error:', error);
    }
  };

  if (!isOpen) return null;

  // Render section content
  const renderSectionContent = () => {
    return renderSettingsContent({
      sectionId: activeSection,
      isMobile,
      displayName,
      onDisplayNameChange,
      emailNotifications,
      setEmailNotifications,
      pushNotifications,
      setPushNotifications,
      language,
      setLanguage,
      appearance,
      setAppearance: onAppearanceChange || (() => {}),
      dateRange,
      setDateRange,
      accountScope,
      setAccountScope,
      messageType,
      setMessageType,
      messageContent,
      setMessageContent,
      isDarkMode
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop - Premium elevation */}
      <div 
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: isDarkMode ? darkTheme.modal.overlay : 'rgba(0, 0, 0, 0.5)',
          backdropFilter: isDarkMode ? darkTheme.modal.backdropBlur : 'blur(8px)',
          WebkitBackdropFilter: isDarkMode ? darkTheme.modal.backdropBlur : 'blur(8px)'
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        className="relative z-10"
        style={{
          width: isMobile ? '100%' : MODAL_DESIGN.modal.width,
          height: isMobile ? '100%' : MODAL_DESIGN.modal.height,
          maxWidth: isMobile ? '100%' : '90vw',
          maxHeight: isMobile ? '100%' : '90vh',
          background: isDarkMode ? darkTheme.modal.background : MODAL_DESIGN.modal.background,
          borderRadius: isMobile ? '0' : (isDarkMode ? darkTheme.modal.borderRadius : MODAL_DESIGN.modal.borderRadius),
          boxShadow: isDarkMode ? darkTheme.modal.shadow : MODAL_DESIGN.modal.boxShadow,
          border: isDarkMode ? `1px solid ${darkTheme.modal.border}` : MODAL_DESIGN.modal.border,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: isDarkMode ? 'modalEntrance 500ms cubic-bezier(0.22, 0.61, 0.36, 1)' : undefined
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - CelesteOS Styling */}
        <div 
          style={{
            background: isDarkMode ? darkTheme.modal.header : MODAL_DESIGN.header.background,
            borderBottom: isDarkMode ? `1px solid ${darkTheme.modal.border}` : MODAL_DESIGN.header.borderBottom,
            padding: MODAL_DESIGN.header.padding,
            height: MODAL_DESIGN.header.height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            boxSizing: 'border-box'
          }}
        >
          <h1 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: isDarkMode ? darkTheme.text.primary : '#212529',
            margin: 0,
            fontFamily: 'Eloquia Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}>
            Settings
          </h1>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: isDarkMode ? darkTheme.text.tertiary : '#6c757d',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: `color ${darkTheme.effects.microDelay} cubic-bezier(0.22, 0.61, 0.36, 1)`
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = isDarkMode ? darkTheme.text.primary : '#212529'}
            onMouseLeave={(e) => e.currentTarget.style.color = isDarkMode ? darkTheme.text.tertiary : '#6c757d'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Sidebar - CelesteOS Nav */}
          <div 
            style={{
              width: isMobile ? '160px' : MODAL_DESIGN.sidebar.width,
              background: isDarkMode ? darkTheme.sidebar.background : MODAL_DESIGN.sidebar.background,
              borderRight: isDarkMode ? `1px solid ${darkTheme.sidebar.border}` : MODAL_DESIGN.sidebar.borderRight,
              padding: isMobile ? '8px 0' : '12px 0',
              overflowX: 'hidden',
              overflowY: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              flexShrink: 0
            }}
          >
            {settingsMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    position: 'relative',
                    background: isActive 
                      ? (isDarkMode ? darkTheme.sidebar.itemBackgroundActive : '#e9ecef')
                      : 'transparent',
                    color: isActive 
                      ? (isDarkMode ? darkTheme.sidebar.itemTextActive : '#212529')  // PRIMARY TEXT for active
                      : (isDarkMode ? darkTheme.sidebar.itemText : '#6c757d'),       // TERTIARY for inactive
                    border: 'none',
                    borderLeft: isActive && isDarkMode ? `2px solid ${darkTheme.sidebar.itemActiveIndicator}` : '2px solid transparent',
                    padding: isDarkMode && isActive 
                      ? `${MODAL_DESIGN.nav.item.padding.split(' ')[0]} calc(${MODAL_DESIGN.nav.item.padding.split(' ')[1]} - 2px)`
                      : MODAL_DESIGN.nav.item.padding,
                    fontSize: MODAL_DESIGN.nav.item.fontSize,
                    borderRadius: MODAL_DESIGN.nav.item.borderRadius,
                    margin: MODAL_DESIGN.nav.item.margin,
                    cursor: 'pointer',
                    transition: 'all 240ms cubic-bezier(0.22, 0.61, 0.36, 1)',  // CelesteOS easing
                    textAlign: 'left',
                    fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    gap: '10px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = isDarkMode ? darkTheme.sidebar.itemBackgroundHover : '#f8f9fa';
                      e.currentTarget.style.color = isDarkMode ? darkTheme.sidebar.itemTextHover : '#212529';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = isDarkMode ? darkTheme.sidebar.itemText : '#6c757d';
                    }
                  }}
                >
                  <Icon className="w-4 h-4" style={{ opacity: isActive ? 1 : 0.7, flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div 
            style={{
              flex: 1,
              background: isDarkMode ? '#1a1a1a' : MODAL_DESIGN.content.background,
              padding: MODAL_DESIGN.content.padding,
              overflowY: 'auto',
              color: isDarkMode ? '#f0f0f0' : '#212529'
            }}
          >
            <SectionHeader 
              title={settingsMenuItems.find(item => item.id === activeSection)?.label || 'Settings'} 
              isMobile={isMobile}
              isDarkMode={isDarkMode}
            />
            {renderSectionContent()}
          </div>
        </div>
      </div>
    </div>
  );
}