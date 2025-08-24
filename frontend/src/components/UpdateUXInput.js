import React, { useState, useEffect, useCallback } from 'react';
import { Send, Paperclip, Ship, Mail, Search, ChevronDown, Settings, Layers } from 'lucide-react';

export function UpdateUXInput({ 
  onStartChat = () => {}, 
  onSearchTypeChange = () => {},
  isMobile = false, 
  isDarkMode = false, 
  currentSearchType = 'yacht',
  value = '',
  onChange = () => {},
  isSending = false
}) {
  const [localMessage, setLocalMessage] = useState('');
  const [selectedSearchType, setSelectedSearchType] = useState(currentSearchType);
  const [isMobileControlsOpen, setIsMobileControlsOpen] = useState(false);

  // Use controlled value if provided, otherwise use local state
  const message = value !== undefined && value !== '' ? value : localMessage;
  const handleMessageChange = (e) => {
    if (onChange && value !== undefined) {
      onChange(e);
    } else {
      setLocalMessage(e.target.value);
    }
  };

  // Synchronize with parent component's search type
  useEffect(() => {
    setSelectedSearchType(currentSearchType);
  }, [currentSearchType]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isSending) {
      onStartChat(message.trim(), selectedSearchType);
      // Clear message
      if (onChange && value !== undefined) {
        onChange({ target: { value: '' } });
      } else {
        setLocalMessage('');
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSearchTypeSelect = useCallback((type) => {
    setSelectedSearchType(type);
    onSearchTypeChange(type);
    setIsMobileControlsOpen(false);
  }, [onSearchTypeChange]);

  const handleAttachment = useCallback(() => {
    // Handle attachment logic here
    setIsMobileControlsOpen(false);
  }, []);

  // Optimized hover handlers
  const handleButtonHover = useCallback((e, isEntering) => {
    const hoverBg = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
    const defaultBg = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)';
    e.target.style.backgroundColor = isEntering ? hoverBg : defaultBg;
  }, [isDarkMode]);

  const searchTypes = [
    {
      id: 'yacht',
      icon: Ship,
      title: 'Yacht Search',
      description: 'Search yacht maintenance and operations',
      placeholder: 'Ask anything...'
    },
    {
      id: 'email',
      icon: Mail,
      title: 'Email Search',
      description: 'Search through email communications',
      placeholder: 'Ask me anything about email communications or correspondence...'
    },
    {
      id: 'email-yacht',
      icon: Layers,
      title: 'Email + Yacht',
      description: 'Search both for holistic view',
      placeholder: 'Ask me anything across both email and yacht systems...'
    },
    {
      id: 'web',
      icon: Search,
      title: 'Web Search',
      description: 'Search the web for current information',
      placeholder: 'Ask me anything and I\'ll search the web for current information...'
    }
  ];

  const getCurrentPlaceholder = () => {
    const currentType = searchTypes.find(type => type.id === selectedSearchType);
    return currentType?.placeholder || 'Ask me anything...';
  };

  const getCurrentSearchType = () => {
    return searchTypes.find(type => type.id === selectedSearchType);
  };

  const currentType = getCurrentSearchType();
  const CurrentIcon = currentType?.icon || Ship;

  return (
    <div 
      className="flex flex-col query_input_container"
      style={{
        maxWidth: isMobile ? '390px' : '760px',
        margin: '0 auto',
        padding: isMobile ? '16px' : '24px'
      }}
    >
      {/* Search Type Selector - Matches Screenshot Exactly */}
      <div className="flex items-center justify-center mb-2">
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button
            onClick={() => setIsMobileControlsOpen(!isMobileControlsOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              color: isDarkMode ? 'rgba(246, 247, 251, 0.8)' : '#374151',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: 'transparent'
            }}
            onMouseEnter={(e) => handleButtonHover(e, true)}
            onMouseLeave={(e) => handleButtonHover(e, false)}
          >
            <CurrentIcon 
              style={{
                width: '16px',
                height: '16px',
                color: isDarkMode ? 'var(--opulent-gold, #c8a951)' : '#2563eb'
              }}
            />
            <span style={{ fontWeight: 500 }}>{currentType?.title}</span>
            <ChevronDown 
              style={{
                width: '14px',
                height: '14px',
                transform: isMobileControlsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }}
            />
          </button>

          {/* Search Type Dropdown */}
          {isMobileControlsOpen && (
            <>
              {/* Backdrop */}
              <div 
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 40
                }}
                onClick={() => setIsMobileControlsOpen(false)}
              />
              
              <div 
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '4px',
                  backgroundColor: isDarkMode ? 'rgba(15, 11, 18, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'}`,
                  borderRadius: '12px',
                  boxShadow: isDarkMode 
                    ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
                    : '0 8px 32px rgba(0, 0, 0, 0.12)',
                  zIndex: 50,
                  minWidth: '280px'
                }}
              >
                <div 
                  style={{
                    padding: '12px 16px',
                    borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
                    fontFamily: 'Eloquia Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: isDarkMode ? 'var(--headline, #f6f7fb)' : '#1f2937'
                  }}
                >
                  Search Intent
                </div>
                
                <div style={{ padding: '8px 0' }}>
                  {searchTypes.map((type) => {
                    const TypeIcon = type.icon;
                    const isSelected = selectedSearchType === type.id;
                    
                    return (
                      <button
                        key={type.id}
                        onClick={() => handleSearchTypeSelect(type.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          width: '100%',
                          padding: '12px 16px',
                          backgroundColor: isSelected 
                            ? isDarkMode 
                              ? 'rgba(200, 169, 81, 0.12)' 
                              : 'rgba(0, 112, 255, 0.08)'
                            : 'transparent',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                          gap: '12px'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.target.style.backgroundColor = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.target.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <TypeIcon 
                          style={{
                            width: '18px',
                            height: '18px',
                            color: isSelected 
                              ? isDarkMode ? 'var(--opulent-gold, #c8a951)' : '#2563eb'
                              : isDarkMode ? 'rgba(246, 247, 251, 0.7)' : '#6b7280'
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div 
                            style={{
                              fontFamily: 'Eloquia Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                              fontSize: '15px',
                              fontWeight: 500,
                              color: isSelected 
                                ? isDarkMode ? 'var(--opulent-gold, #c8a951)' : '#2563eb'
                                : isDarkMode ? 'var(--headline, #f6f7fb)' : '#1f2937'
                            }}
                          >
                            {type.title}
                          </div>
                          <div 
                            style={{
                              fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                              fontSize: '13px',
                              color: isDarkMode ? 'rgba(246, 247, 251, 0.6)' : '#6b7280',
                              marginTop: '2px'
                            }}
                          >
                            {type.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>


      {/* Simple Input Form - Matches Screenshot */}
      <form onSubmit={handleSubmit}>
        <div 
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '8px',
            padding: '16px',
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'}`,
            borderRadius: '16px',
            boxShadow: isDarkMode 
              ? '0 4px 16px rgba(0, 0, 0, 0.2)' 
              : '0 4px 16px rgba(0, 0, 0, 0.06)',
            minHeight: '56px'
          }}
        >
          {/* Attachment Button */}
          <button
            type="button"
            onClick={handleAttachment}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              color: isDarkMode ? 'rgba(246, 247, 251, 0.6)' : '#6b7280',
              transition: 'all 0.2s',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)';
              e.target.style.color = isDarkMode ? 'rgba(246, 247, 251, 0.8)' : '#374151';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = isDarkMode ? 'rgba(246, 247, 251, 0.6)' : '#6b7280';
            }}
          >
            <Paperclip style={{ width: '18px', height: '18px' }} />
          </button>

          {/* Text Input */}
          <textarea
            value={message}
            onChange={handleMessageChange}
            onKeyDown={handleKeyDown}
            placeholder={getCurrentPlaceholder()}
            disabled={isSending}
            rows={1}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              resize: 'none',
              backgroundColor: 'transparent',
              fontSize: '16px',
              lineHeight: '24px',
              fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              color: isDarkMode ? 'var(--headline, #f6f7fb)' : '#1f2937',
              minHeight: '24px',
              maxHeight: '120px',
              overflow: 'auto'
            }}
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!message.trim() || isSending}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              backgroundColor: message.trim() && !isSending 
                ? isDarkMode ? 'var(--opulent-gold, #c8a951)' : '#2563eb'
                : isDarkMode ? 'rgba(246, 247, 251, 0.2)' : '#d1d5db',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: message.trim() && !isSending ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              flexShrink: 0
            }}
          >
            {isSending ? (
              <div 
                style={{
                  width: '14px',
                  height: '14px',
                  border: '2px solid transparent',
                  borderTop: '2px solid currentColor',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}
              />
            ) : (
              <Send style={{ width: '16px', height: '16px' }} />
            )}
          </button>
        </div>
      </form>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default UpdateUXInput;