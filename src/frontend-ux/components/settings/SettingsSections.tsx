import React from 'react';
import { SettingsSection } from './SettingsConstants';
import { 
  AppleSettingsRow, 
  SwitchRow, 
  FormGroup, 
  UnifiedTextarea 
} from './SettingsComponents';
import {
  languageOptions,
  appearanceOptions,
  dateRangeOptions,
  accountScopeOptions,
  messageTypeOptions
} from './SettingsConstants';
import { darkTheme } from '../../styles/darkModeTheme';
import completeWebhookService from '../../../services/webhookServiceComplete';

interface SectionContentProps {
  sectionId: SettingsSection;
  isMobile: boolean;
  displayName: string;
  onDisplayNameChange: (name: string) => void;
  emailNotifications: boolean;
  setEmailNotifications: (value: boolean) => void;
  pushNotifications: boolean;
  setPushNotifications: (value: boolean) => void;
  language: string;
  setLanguage: (value: string) => void;
  appearance: string;
  setAppearance: (value: string) => void;
  dateRange: string;
  setDateRange: (value: string) => void;
  accountScope: string;
  setAccountScope: (value: string) => void;
  messageType: string;
  setMessageType: (value: string) => void;
  messageContent: string;
  setMessageContent: (value: string) => void;
  userEmail: string;
  setUserEmail: (value: string) => void;
  isDarkMode?: boolean;
}

export const renderSectionContent = ({
  sectionId,
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
  setAppearance,
  dateRange,
  setDateRange,
  accountScope,
  setAccountScope,
  messageType,
  setMessageType,
  messageContent,
  setMessageContent,
  userEmail,
  setUserEmail,
  isDarkMode = false
}: SectionContentProps) => {
  const getLanguageLabel = (value: string) => {
    const option = languageOptions.find(opt => opt.value === value);
    return option ? option.label : 'English';
  };

  const getAppearanceLabel = (value: string) => {
    const option = appearanceOptions.find(opt => opt.value === value);
    return option ? option.label : 'Light';
  };

  const getDateRangeLabel = (value: string) => {
    const option = dateRangeOptions.find(opt => opt.value === value);
    return option ? option.label : 'Last 30 days';
  };

  const getAccountScopeLabel = (value: string) => {
    const option = accountScopeOptions.find(opt => opt.value === value);
    return option ? option.label : 'This account';
  };

  const getMessageTypeLabel = (value: string) => {
    if (value === '') return 'Select type...';
    if (value === 'issue' && isMobile) return 'Tech Issue';
    const option = messageTypeOptions.find(opt => opt.value === value);
    return option ? option.label : 'Select type...';
  };

  switch (sectionId) {
    case 'general':
      return (
        <>
          {/* Premium Settings List */}
          <div 
            style={{
              background: isDarkMode ? '#292929' : '#ffffff',
              backdropFilter: 'none',
              WebkitBackdropFilter: 'none',
              border: `1px solid ${isDarkMode ? '#343434' : '#e7e7e7'}`,
              borderRadius: '8px',
              overflow: 'hidden',
              marginBottom: '20px',
              boxShadow: 'none'
            }}
          >
            <AppleSettingsRow
              label="Display Name"
              value={displayName}
              isEditable={true}
              onChange={onDisplayNameChange}
              placeholder="Enter your display name"
              isMobile={isMobile}
               isDarkMode={isDarkMode}
            />
            
            <AppleSettingsRow
              label="Department"
              value="Captain"
              isEditable={false}
              isMobile={isMobile}
               isDarkMode={isDarkMode}
            />
            
            <AppleSettingsRow
              label="Language"
              value={getLanguageLabel(language)}
              isEditable={true}
              onChange={setLanguage}
              type="select"
              options={languageOptions}
              isMobile={isMobile}
               isDarkMode={isDarkMode}
            />
            
            <AppleSettingsRow
              label="Appearance"
              value={appearance}
              isEditable={true}
              onChange={setAppearance}
              type="select"
              options={appearanceOptions}
              isMobile={isMobile}
               isDarkMode={isDarkMode}
            />
          </div>


        </>
      );

    case 'connectors':
      return (
        <>
          {/* Premium Settings List for Connectors */}
          <div 
            style={{
              background: isDarkMode ? '#292929' : '#ffffff',
              backdropFilter: 'none',
              WebkitBackdropFilter: 'none',
              border: `1px solid ${isDarkMode ? '#343434' : '#e7e7e7'}`,
              borderRadius: '8px',
              overflow: 'hidden',
              marginBottom: '20px',
              boxShadow: 'none'
            }}
          >
            <AppleSettingsRow
              label="Microsoft Outlook"
              value="Connected"
              isEditable={false}
              isMobile={isMobile}
              isDarkMode={isDarkMode}
            />
            
            <AppleSettingsRow
              label={isMobile ? "Email" : "Email Address"}
              value={isMobile ? "john@company.com" : "john.doe@company.com"}
              isEditable={false}
              isMobile={isMobile}
              isDarkMode={isDarkMode}
            />
            
            <AppleSettingsRow
              label="Organization"
              value="Acme Corporation"
              isEditable={false}
              isMobile={isMobile}
              isDarkMode={isDarkMode}
            />
            
            <AppleSettingsRow
              label="Last Synced"
              value={isMobile ? "Jan 15, 2:45 PM" : "January 15, 2024 at 2:45 PM"}
              isEditable={false}
              isMobile={isMobile}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Premium Action Buttons */}
          <div 
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '20px'
            }}
          >
            <button
              style={{
                width: '120px', // Golden ratio: 120/1.618 ≈ 74px height, but using 48px for consistency
                height: '48px',
                padding: '0 20px', // Reduced padding for better proportions
                fontSize: '15px', // Slightly smaller font
                lineHeight: '20px',
                fontWeight: '600',
                fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                background: isDarkMode ? '#343434' : '#f8f8f8',
                color: isDarkMode ? '#939293' : '#8a8a8a',
                border: `1px solid ${isDarkMode ? '#343434' : '#e7e7e7'}`,
                borderRadius: '24px', // Completely rounded (half of height)
                cursor: 'pointer',
                transition: `all ${isDarkMode ? darkTheme.effects.microDelay : '240ms'} cubic-bezier(0.22, 0.61, 0.36, 1)`,
                outline: 'none',
                boxSizing: 'border-box',
                boxShadow: 'none',
                backdropFilter: isDarkMode ? 'none' : 'blur(8px)',
                WebkitBackdropFilter: isDarkMode ? 'none' : 'blur(8px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDarkMode ? darkTheme.buttons.secondary.backgroundHover : 'rgba(255, 255, 255, 0.8)';
                e.currentTarget.style.color = isDarkMode ? darkTheme.text.primary : '#374151';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDarkMode ? darkTheme.buttons.secondary.background : 'rgba(255, 255, 255, 0.6)';
                e.currentTarget.style.color = isDarkMode ? darkTheme.buttons.secondary.text : '#6b7280';
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Disconnect
            </button>
            <button
              style={{
                width: '120px', // Golden ratio proportions
                height: '48px',
                padding: '0 20px', // Reduced padding for better proportions
                fontSize: '15px', // Slightly smaller font
                lineHeight: '20px',
                fontWeight: '600',
                fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                background: '#0078fa',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '24px', // Completely rounded (half of height)
                cursor: 'pointer',
                transition: 'all 200ms cubic-bezier(0.23, 1, 0.32, 1)',
                outline: 'none',
                boxSizing: 'border-box',
                boxShadow: 'none',
                transform: 'translateY(0)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#0078fa';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#0078fa';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Reconnect
            </button>
          </div>
        </>
      );

    case 'handover':
      return (
        <>


          {/* Export Options */}
          <div 
            style={{
              background: isDarkMode ? '#292929' : '#ffffff',
              backdropFilter: 'none',
              WebkitBackdropFilter: 'none',
              border: `1px solid ${isDarkMode ? '#343434' : '#e7e7e7'}`,
              borderRadius: '8px',
              overflow: 'hidden',
              marginBottom: '20px',
              boxShadow: 'none'
            }}
          >
            <AppleSettingsRow
              label="Date Range"
              value={getDateRangeLabel(dateRange)}
              isEditable={true}
              onChange={setDateRange}
              type="select"
              options={dateRangeOptions}
              isMobile={isMobile}
              isDarkMode={isDarkMode}
            />
            
            <AppleSettingsRow
              label="Your email"
              value={userEmail}
              isEditable={true}
              onChange={setUserEmail}
              placeholder="your@email.com"
              isMobile={isMobile}
              isDarkMode={isDarkMode}
            />
            
            <AppleSettingsRow
              label="Account Scope"
              value={getAccountScopeLabel(accountScope)}
              isEditable={true}
              onChange={setAccountScope}
              type="select"
              options={accountScopeOptions}
              isMobile={isMobile}
              isDarkMode={isDarkMode}
            />
          </div>

          <div 
            style={{
              fontSize: '14px',
              lineHeight: '20px',
              fontWeight: '400',
              color: isDarkMode ? '#939293' : '#8a8a8a',
              fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              marginBottom: '20px'
            }}
          >
            Export the work you've done, or what's happened across your team.
          </div>

          {/* Premium Export Button */}
          <button
            style={{
              width: '194px', // Golden ratio: 194/1.618 ≈ 120px (but using 48px height for consistency)
              height: '48px',
              padding: '0 20px', // Reduced padding for better proportions
              fontSize: '15px', // Slightly smaller font
              lineHeight: '20px',
              fontWeight: '600',
              fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              background: '#0078fa',
              color: '#ffffff',
              border: 'none',
              borderRadius: '24px', // Completely rounded (half of height)
              cursor: 'pointer',
              transition: 'all 200ms cubic-bezier(0.23, 1, 0.32, 1)',
              outline: 'none',
              boxSizing: 'border-box',
              boxShadow: 'none',
              transform: 'translateY(0)',
              margin: '0 auto', // Center the button since it's no longer full width
              display: 'block'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#004aff';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#004aff';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Send to my email
          </button>
        </>
      );

    case 'account':
      return (
        <>
          <div 
            style={{
              background: isDarkMode ? '#292929' : '#ffffff',
              backdropFilter: 'none',
              WebkitBackdropFilter: 'none',
              border: `1px solid ${isDarkMode ? '#343434' : '#e7e7e7'}`,
              borderRadius: '8px',
              overflow: 'hidden',
              marginBottom: '20px',
              boxShadow: 'none'
            }}
          >
            <AppleSettingsRow
              label={isMobile ? "Email" : "Email Address"}
              value={isMobile ? "john@company.com" : "john.doe@company.com"}
              isEditable={false}
              isMobile={isMobile}
                isDarkMode={isDarkMode}
            />
            
            <AppleSettingsRow
              label="Account Type"
              value="Yacht"
              isEditable={false}
              isMobile={isMobile}
                isDarkMode={isDarkMode}
            />
            
            <AppleSettingsRow
              label="Member Since"
              value={isMobile ? "Mar 15, 2023" : "March 15, 2023"}
              isEditable={false}
              isMobile={isMobile}
                isDarkMode={isDarkMode}
            />
          </div>

          {/* Logout Button - CelesteOS Brand Style */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={async () => {
              try {
                console.log('🚀 Attempting to logout...');
                
                // Use Supabase auth service for logout
                const { authService } = await import('../../../services/supabaseClient');
                const success = await authService.signOut();
                
                if (success) {
                  console.log('✅ Supabase logout successful');
                } else {
                  console.warn('⚠️ Supabase logout had issues, but continuing with cleanup');
                }
                
                // Also call webhook for any backend cleanup (optional)
                try {
                  const response = await fetch('/api/webhook?endpoint=auth-logout', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      user_id: localStorage.getItem('celesteos_user') ? JSON.parse(localStorage.getItem('celesteos_user') || '{}').id : 'unknown',
                      timestamp: new Date().toISOString()
                    })
                  });
                  
                  if (response.ok) {
                    console.log('✅ Backend logout webhook successful');
                  }
                } catch (webhookError) {
                  console.log('ℹ️ Backend webhook cleanup skipped:', webhookError);
                }
                
              } catch (error) {
                console.error('❌ Logout error:', error);
                console.log('🔄 Performing manual cleanup...');
              }
              
              // Clear all possible local storage keys
              localStorage.removeItem('ms_user_id');
              localStorage.removeItem('user_id');
              localStorage.removeItem('authToken');
              localStorage.removeItem('userData');
              localStorage.removeItem('celesteos_user');
              localStorage.removeItem('celesteos_access_token');
              localStorage.removeItem('celesteos_refresh_token');
              localStorage.removeItem('hasSeenIntro');
              localStorage.removeItem('hasCompletedTutorial');
              localStorage.removeItem('appearance');
              sessionStorage.clear();
              
              console.log('🔄 All session data cleared, reloading page...');
              
              // Reload the page to reset the app state
              window.location.reload();
            }}
            style={{
              width: '120px', // Golden ratio proportions
              height: '48px',
              padding: '0 20px', // Reduced padding for better proportions
              fontSize: '15px', // Slightly smaller font
              lineHeight: '20px',
              fontWeight: '600',
              fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              background: '#0078fa',
              color: '#ffffff',
              border: 'none',
              borderRadius: '24px', // Completely rounded (half of height)
              cursor: 'pointer',
              transition: 'all 200ms cubic-bezier(0.23, 1, 0.32, 1)',
              outline: 'none',
              boxSizing: 'border-box',
              boxShadow: 'none',
              transform: 'translateY(0)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#004aff';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#004aff';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Logout
          </button>
          </div>
        </>
      );

    case 'help-contact':
      return (
        <>
          {/* Enterprise Microcopy */}
          <div style={{
            marginBottom: '20px',
            padding: '16px 20px',
            background: isDarkMode ? darkTheme.backgrounds.tertiary : 'rgba(255, 255, 255, 0.6)',
            border: `1px solid ${isDarkMode ? darkTheme.modal.border : 'rgba(255, 255, 255, 0.3)'}`,
            borderRadius: '12px',
            backdropFilter: isDarkMode ? 'none' : 'blur(16px) saturate(1.1)',
            WebkitBackdropFilter: isDarkMode ? 'none' : 'blur(16px) saturate(1.1)'
          }}>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: '16px',
              fontWeight: '600',
              color: isDarkMode ? '#ffffff' : '#0f0f0f',
              fontFamily: 'Eloquia Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>We're here to help</h3>
            <p style={{
              margin: 0,
              fontSize: '14px',
              lineHeight: '20px',
              color: isDarkMode ? '#939293' : '#8a8a8a',
              fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>Replies usually within 24h. Urgent? Email support@celesteos.io</p>
          </div>

          {/* Contact Form */}
          <div 
            style={{
              background: isDarkMode ? '#292929' : '#ffffff',
              backdropFilter: 'none',
              WebkitBackdropFilter: 'none',
              border: `1px solid ${isDarkMode ? '#343434' : '#e7e7e7'}`,
              borderRadius: '8px',
              overflow: 'hidden',
              marginBottom: '20px',
              boxShadow: 'none'
            }}
          >
            <AppleSettingsRow
              label="Message Type"
              value={getMessageTypeLabel(messageType)}
              isEditable={true}
              onChange={setMessageType}
              type="select"
              options={messageTypeOptions}
              isMobile={isMobile}
              isDarkMode={isDarkMode}
            />
            
            <AppleSettingsRow
              label="Your Email"
              value={isMobile ? "john@company.com" : (typeof displayName === 'string' ? displayName.toLowerCase().replace(' ', '.') + '@company.com' : 'user@company.com')}
              isEditable={true}
              onChange={() => {}}
              placeholder="your@email.com"
              isMobile={isMobile}
              isDarkMode={isDarkMode}
            />
          </div>

          <FormGroup 
            label="Message"
            description="Please describe your feedback or issue in detail."
            isDarkMode={isDarkMode}
          >
            <UnifiedTextarea
              placeholder="Please describe your feedback or issue in detail..."
              rows={6}
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              isDarkMode={isDarkMode}
            />
          </FormGroup>

          {/* Premium CTA Button with Rolex-level quality */}
          {(() => {
            const hasContent = messageContent.trim();
            const hasType = messageType;
            const isFullyEnabled = hasContent && hasType;
            const isPartiallyEnabled = hasContent && !hasType;
            const isDisabled = !hasContent;
            
            return (
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', width: '100%' }}>
                <button
                  type="button"
                  disabled={isDisabled}
                  onClick={async (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    
                    if (isDisabled) return;
                    if (isPartiallyEnabled) {
                      // Show message to select type
                      alert('Please select a message type first');
                      return;
                    }

                    // Get metadata
                    const yachtId = localStorage.getItem('yacht_id') || 'unknown';
                    const sessionId = sessionStorage.getItem('session_id') || `session_${Date.now()}`;
                    const deviceType = isMobile ? 'Mobile' : 'Desktop';
                    const clientVersion = '1.0.0';
                    
                    // Prepare email body with all metadata
                    const emailBody = `
${messageContent}

---
Metadata:
Yacht ID: ${yachtId}
Device Type: ${deviceType}
Client Version: ${clientVersion}
Session ID: ${sessionId}
User: ${displayName}
Timestamp: ${new Date().toISOString()}
                    `.trim();

                    // Get message type label for subject
                    const messageTypeLabel = messageType === 'issue' 
                      ? 'Technical Issue' 
                      : messageType === 'feature' 
                      ? 'Feature Request'
                      : messageType === 'bug'
                      ? 'Bug Report'
                      : 'General Feedback';

                    try {
                      console.log('🚀 Attempting to send help-contact request via CORS proxy');
                      console.log('Data being sent:', {
                        messageType,
                        messageContent,
                        userEmail: typeof displayName === 'string' ? displayName.toLowerCase().replace(' ', '.') + '@company.com' : 'user@company.com'
                      });
                      
                      // Send to help-contact webhook via CORS proxy
                      const response = await fetch('http://localhost:5679/webhook/help-contact', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          messageType: messageType,
                          messageTypeLabel: messageTypeLabel,
                          messageContent: messageContent,
                          userEmail: typeof displayName === 'string' ? displayName.toLowerCase().replace(' ', '.') + '@company.com' : 'user@company.com',
                          displayName: displayName,
                          yachtId: yachtId,
                          deviceType: deviceType,
                          clientVersion: clientVersion,
                          sessionId: sessionId,
                          timestamp: new Date().toISOString(),
                          destination: 'contact@celeste7.ai'
                        })
                      });

                      console.log('✅ Response received:', response.status, response.statusText);
                      
                      if (response.ok) {
                        const result = await response.json();
                        console.log('✅ Webhook success:', result);
                        alert('Message sent successfully! We will get back to you soon.');
                        setMessageContent('');
                        setMessageType('');
                      } else {
                        console.log('❌ Webhook failed with status:', response.status);
                        throw new Error(`Webhook failed: ${response.status}`);
                      }
                    } catch (error) {
                      console.error('❌ Failed to send via webhook:', error);
                      console.log('📧 Falling back to mailto');
                      
                      // Fallback to mailto link
                      const mailtoLink = `mailto:contact@celeste7.ai?subject=${encodeURIComponent(messageTypeLabel)}&body=${encodeURIComponent(emailBody)}`;
                      window.location.href = mailtoLink;
                    }
                  }}
                  style={{
                    width: '168px', // Golden ratio: 168/1.618 ≈ 104px (but using 48px height for consistency)
                    height: '48px',
                    padding: '0 20px', // Reduced padding for better proportions
                    fontSize: '15px', // Slightly smaller font
                    lineHeight: '20px',
                    fontWeight: '600',
                    fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    background: isFullyEnabled 
                      ? (isDarkMode ? '#0078fa' : '#0078fa')
                      : isPartiallyEnabled
                      ? (isDarkMode ? '#003ad1' : '#9ca3af')
                      : (isDarkMode ? darkTheme.buttons.disabled.background : 'rgba(255, 255, 255, 0.6)'),
                    color: isFullyEnabled 
                      ? (isDarkMode ? darkTheme.buttons.primary.text : '#ffffff')
                      : isPartiallyEnabled
                      ? '#ffffff'
                      : (isDarkMode ? darkTheme.buttons.disabled.text : '#9ca3af'),
                    border: isFullyEnabled || isPartiallyEnabled 
                      ? 'none'
                      : `1px solid ${isDarkMode ? darkTheme.buttons.disabled.border : 'rgba(255, 255, 255, 0.3)'}`,
                    borderRadius: '24px', // Completely rounded (half of height)
                    cursor: isFullyEnabled || isPartiallyEnabled ? 'pointer' : 'not-allowed',
                    transition: `all ${isDarkMode ? darkTheme.effects.microDelay : '240ms'} cubic-bezier(0.22, 0.61, 0.36, 1)`,
                    outline: 'none',
                    boxSizing: 'border-box',
                    boxShadow: 'none',
                    transform: 'scale(1)',
                    backdropFilter: (isFullyEnabled || isPartiallyEnabled) ? 'none' : (isDarkMode ? 'none' : 'blur(8px)'),
                    WebkitBackdropFilter: (isFullyEnabled || isPartiallyEnabled) ? 'none' : (isDarkMode ? 'none' : 'blur(8px)')
                  }}
                  onMouseEnter={(e) => {
                    if (isFullyEnabled) {
                      e.currentTarget.style.background = isDarkMode 
                        ? darkTheme.buttons.primary.backgroundHover 
                        : '#0078fa';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = isDarkMode ? darkTheme.buttons.primary.scale : 'scale(1.03)';
                    } else if (isPartiallyEnabled) {
                      e.currentTarget.style.background = isDarkMode 
                        ? '#003ad1' 
                        : '#6b7280';
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isFullyEnabled) {
                      e.currentTarget.style.background = isDarkMode 
                        ? darkTheme.buttons.primary.background 
                        : '#0078fa';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'scale(1)';
                    } else if (isPartiallyEnabled) {
                      e.currentTarget.style.background = isDarkMode 
                        ? '#003ad1' 
                        : '#9ca3af';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                  onFocus={(e) => {
                    if (isFullyEnabled) {
                      e.currentTarget.style.boxShadow = 'none';
                    } else if (isPartiallyEnabled) {
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                  onBlur={(e) => {
                    if (isFullyEnabled) {
                      e.currentTarget.style.boxShadow = 'none';
                    } else if (isPartiallyEnabled) {
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  Send Message
                </button>
                
                {/* Tooltip for disabled state - Enterprise quality */}
                {isDisabled && (
                  <div 
                    style={{
                      position: 'absolute',
                      bottom: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      marginBottom: '8px',
                      padding: '8px 12px',
                      background: isDarkMode ? darkTheme.buttons.disabled.tooltip : 'rgba(0, 0, 0, 0.9)',
                      color: isDarkMode ? darkTheme.buttons.disabled.tooltipText : '#ffffff',
                      fontSize: '12px',
                      lineHeight: '16px',
                      fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      borderRadius: '4px', // Base tier for buttons
                      whiteSpace: 'nowrap',
                      opacity: 0,
                      pointerEvents: 'none',
                      transition: `opacity ${isDarkMode ? darkTheme.effects.microDelay : '240ms'} cubic-bezier(0.22, 0.61, 0.36, 1)`,
                      zIndex: 1000
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                  >
                    Please select message type and enter message
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: 0,
                      borderLeft: '4px solid transparent',
                      borderRight: '4px solid transparent',
                      borderTop: `4px solid ${isDarkMode ? darkTheme.buttons.disabled.tooltip : 'rgba(0, 0, 0, 0.9)'}`
                    }} />
                  </div>
                )}
              </div>
            );
          })()}
        </>
      );

    default:
      return (
        <div 
          style={{
            fontSize: '16px',
            lineHeight: '24px',
            fontWeight: '400',
            color: isDarkMode ? darkTheme.text.secondary : '#6b7280',
            fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        >
          Settings for this section will be available soon.
        </div>
      );
  }
};