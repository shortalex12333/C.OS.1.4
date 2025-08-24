import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { SettingsSection, settingsMenuItems } from './settings/SettingsConstants';
import { SectionHeader, SettingsRow, SettingsSection as Section } from './settings/SettingsComponents';

// =====================================================
// DESIGN TOKENS - MATCHING CHATGPT STYLE
// =====================================================
const MODAL_DESIGN = {
  modal: {
    width: '700px',
    height: '600px',
    background: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e1e5e9'
  },
  header: {
    background: '#f8f9fa',
    borderBottom: '1px solid #e9ecef',
    padding: '20px 24px'
  },
  sidebar: {
    width: '200px',
    background: '#f8f9fa',
    borderRight: '1px solid #e9ecef'
  },
  content: {
    background: '#ffffff',
    padding: '32px 40px'
  },
  nav: {
    item: {
      padding: '12px 20px',
      fontSize: '14px',
      borderRadius: '6px',
      margin: '2px 8px',
      transition: 'all 0.15s ease'
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
  onAppearanceChange 
}: SettingsProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>('general');
  const [language, setLanguage] = useState('en');
  
  // Microsoft Connection Status Management
  const [microsoftStatus, setMicrosoftStatus] = useState<MicrosoftConnectionStatus>({
    connected: false,
    loading: true
  });

  // Language and appearance options
  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' }
  ];

  const appearanceOptions = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'auto', label: 'Auto-detect' }
  ];

  // Function to check Microsoft connection status
  const checkMicrosoftConnection = async () => {
    try {
      setMicrosoftStatus(prev => ({ ...prev, loading: true, error: undefined }));
      
      const userId = localStorage.getItem('ms_user_id') || `user_${Date.now()}`;
      
      const response = await fetch('http://localhost:5679/webhook/microsoft-auth', {
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
      const REDIRECT_URI = encodeURIComponent('http://localhost:8003/auth/callback');
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
    switch (activeSection) {
      case 'general':
        return (
          <Section>
            <SettingsRow
              label="Display Name"
              value={displayName}
              isEditable={true}
              onChange={onDisplayNameChange}
              placeholder="Enter your display name"
            />
            <SettingsRow
              label="Language"
              value={languageOptions.find(opt => opt.value === language)?.label || 'English'}
              isEditable={true}
              onChange={setLanguage}
              type="select"
              options={languageOptions}
            />
            <SettingsRow
              label="Appearance"
              value={appearanceOptions.find(opt => opt.value === appearance)?.label || 'Light'}
              isEditable={true}
              onChange={onAppearanceChange || (() => {})}
              type="select"
              options={appearanceOptions}
            />
          </Section>
        );

      case 'connectors':
        return (
          <Section>
            <SettingsRow
              label="Microsoft Outlook"
              value={
                microsoftStatus.loading 
                  ? "Checking..." 
                  : microsoftStatus.connected 
                    ? "Connected" 
                    : microsoftStatus.error 
                      ? "Connection Error"
                      : "Not Connected"
              }
            />
            {microsoftStatus.connected && (
              <>
                <SettingsRow
                  label="Email Address"
                  value={microsoftStatus.email || "Unknown"}
                />
                <SettingsRow
                  label="Display Name"
                  value={microsoftStatus.displayName || "Unknown User"}
                />
              </>
            )}
            {!microsoftStatus.connected && !microsoftStatus.loading && (
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button
                  onClick={handleMicrosoftConnect}
                  style={{
                    background: '#0d6efd',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#0b5ed7'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#0d6efd'}
                >
                  Connect to Email
                </button>
              </div>
            )}
          </Section>
        );

      default:
        return (
          <Section>
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: '#6c757d',
              fontSize: '14px'
            }}>
              This section is not implemented yet.
            </div>
          </Section>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        className="relative z-10"
        style={{
          width: MODAL_DESIGN.modal.width,
          height: MODAL_DESIGN.modal.height,
          maxWidth: '90vw',
          maxHeight: '90vh',
          background: MODAL_DESIGN.modal.background,
          borderRadius: MODAL_DESIGN.modal.borderRadius,
          boxShadow: MODAL_DESIGN.modal.boxShadow,
          border: MODAL_DESIGN.modal.border,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          style={{
            background: MODAL_DESIGN.header.background,
            borderBottom: MODAL_DESIGN.header.borderBottom,
            padding: MODAL_DESIGN.header.padding,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}
        >
          <h1 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#212529',
            margin: 0,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}>
            Settings
          </h1>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#6c757d',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#212529'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#6c757d'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Sidebar */}
          <div 
            style={{
              width: MODAL_DESIGN.sidebar.width,
              background: MODAL_DESIGN.sidebar.background,
              borderRight: MODAL_DESIGN.sidebar.borderRight,
              padding: '8px 0',
              overflowY: 'auto'
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
                    background: isActive ? '#e9ecef' : 'transparent',
                    color: isActive ? '#212529' : '#6c757d',
                    border: 'none',
                    padding: MODAL_DESIGN.nav.item.padding,
                    fontSize: MODAL_DESIGN.nav.item.fontSize,
                    borderRadius: MODAL_DESIGN.nav.item.borderRadius,
                    margin: MODAL_DESIGN.nav.item.margin,
                    cursor: 'pointer',
                    transition: MODAL_DESIGN.nav.item.transition,
                    textAlign: 'left',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    gap: '12px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = '#f8f9fa';
                      e.currentTarget.style.color = '#212529';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#6c757d';
                    }
                  }}
                >
                  <Icon className="w-4 h-4" style={{ opacity: isActive ? 1 : 0.7 }} />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div 
            style={{
              flex: 1,
              background: MODAL_DESIGN.content.background,
              padding: MODAL_DESIGN.content.padding,
              overflowY: 'auto'
            }}
          >
            <SectionHeader 
              title={settingsMenuItems.find(item => item.id === activeSection)?.label || 'Settings'} 
            />
            {renderSectionContent()}
          </div>
        </div>
      </div>
    </div>
  );
}