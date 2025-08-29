import React, { useState, useEffect, useRef } from 'react';
import { Send, Ship, Mail, Settings, Layers } from 'lucide-react';

interface InputAreaProps {
  onStartChat: (message: string, searchType?: SearchType) => void;
  isMobile?: boolean;
  isDarkMode?: boolean;
  currentSearchType?: SearchType;
}

type SearchType = 'yacht' | 'email' | 'email-yacht';

export function InputArea({ 
  onStartChat, 
  isMobile = false, 
  isDarkMode = false, 
  currentSearchType = 'yacht'
}: InputAreaProps) {
  const [message, setMessage] = useState('');
  const [selectedSearchType, setSelectedSearchType] = useState<SearchType>(currentSearchType);
  const [isMobileControlsOpen, setIsMobileControlsOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Synchronize with parent component's search type
  useEffect(() => {
    setSelectedSearchType(currentSearchType);
  }, [currentSearchType]);

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = '24px'; // Reset to min height
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = isMobile ? 150 : 200; // Max lines: ~6 mobile, ~8 desktop
      textarea.style.height = Math.min(scrollHeight, maxHeight) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // Add slight delay for smooth transition effect
      const messageToSend = message.trim();
      setMessage('');
      // Reset textarea height immediately
      if (textareaRef.current) {
        textareaRef.current.style.height = '24px';
      }
      // Small delay to allow input to clear visually before message appears
      setTimeout(() => {
        onStartChat(messageToSend, selectedSearchType);
      }, 50);
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMessage = e.target.value;
    setMessage(newMessage);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSearchTypeSelect = (type: SearchType) => {
    setSelectedSearchType(type);
    if (isMobile) {
      setIsMobileControlsOpen(false);
    }
  };

  const searchTypes = [
    {
      id: 'yacht' as SearchType,
      icon: Ship,
      title: 'NAS',
      description: 'Search NAS storage and documents',
      placeholder: 'Ask anything about your files...'
    },
    {
      id: 'email' as SearchType,
      icon: Mail,
      title: 'EMAIL',
      description: 'Search through email communications',
      placeholder: 'Ask about emails and correspondence...'
    },
    {
      id: 'email-yacht' as SearchType,
      icon: Layers,
      title: 'BOTH',
      description: 'Search both NAS and emails',
      placeholder: 'Search across all your data...'
    }
  ];

  const getCurrentPlaceholder = () => {
    const currentType = searchTypes.find(type => type.id === selectedSearchType);
    return currentType?.placeholder || 'Ask me anything...';
  };

  const getCurrentSearchType = () => {
    return searchTypes.find(type => type.id === selectedSearchType);
  };

  return (
    <div 
      className="flex flex-col query_input_container"
      style={{
        maxWidth: isMobile ? '390px' : 'min(790px, calc(100vw - 320px))',
        margin: '0 auto',
        padding: isMobile ? '16px' : '24px'
      }}
    >
      {/* Search Type Indicator */}
      <div className="flex items-center justify-center mb-2">
        <div 
          className="flex items-center gap-2 px-3 py-1 rounded-full text-xs transition-all duration-200"
          style={{
            backgroundColor: isDarkMode 
              ? 'rgba(246, 247, 251, 0.08)' 
              : 'rgba(24, 24, 24, 0.06)',
            color: isDarkMode ? 'rgba(246, 247, 251, 0.8)' : '#6b7280',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`
          }}
        >
          {(() => {
            const currentType = getCurrentSearchType();
            if (currentType) {
              const Icon = currentType.icon;
              return (
                <>
                  <Icon className="w-3 h-3" />
                  <span className="font-medium">
                    Searching: {currentType.title}
                  </span>
                </>
              );
            }
            return null;
          })()}
        </div>
      </div>

      {/* Main Input Area */}
      <form onSubmit={handleSubmit} className="relative">
        <div 
          className="relative transition-all duration-300 glass-subtle"
          style={{
            borderRadius: '4px',
            backgroundColor: isDarkMode 
              ? 'rgba(60, 60, 60, 0.95)' 
              : 'rgba(248, 248, 248, 0.95)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)'}`,
            boxShadow: isDarkMode 
              ? '0 4px 12px rgba(0, 0, 0, 0.25)' 
              : '0 4px 12px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div className="flex items-center gap-3 p-4">
            {/* Desktop: Search Type Selector Icons */}
            {!isMobile && (
              <>
                <div className="flex items-center gap-1">
                  {searchTypes.map((searchType) => {
                    const IconComponent = searchType.icon;
                    const isSelected = selectedSearchType === searchType.id;
                    
                    return (
                      <button
                        key={searchType.id}
                        type="button"
                        onClick={() => handleSearchTypeSelect(searchType.id)}
                        className="flex items-center justify-center p-2 rounded-lg transition-all duration-200"
                        style={{
                          width: '36px',
                          height: '36px',
                          color: isSelected 
                            ? isDarkMode ? '#BADDE9' : '#00a4ff'
                            : isDarkMode ? 'rgba(246, 247, 251, 0.7)' : '#6b7280',
                          backgroundColor: isSelected 
                            ? isDarkMode ? 'rgba(186, 221, 233, 0.12)' : 'rgba(0, 164, 255, 0.08)'
                            : 'transparent'
                        }}
                        title={searchType.title}
                      >
                        <IconComponent className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
                
                {/* Separator */}
                <div 
                  className="w-px self-center" 
                  style={{ 
                    height: '20px',
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)'
                  }} 
                />
              </>
            )}

            {/* Mobile: Controls Button */}
            {isMobile && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsMobileControlsOpen(!isMobileControlsOpen)}
                  className="flex items-center justify-center p-2 rounded-lg transition-all duration-200"
                  style={{
                    width: '36px',
                    height: '36px',
                    color: isDarkMode ? 'rgba(246, 247, 251, 0.7)' : '#6b7280',
                    backgroundColor: isMobileControlsOpen 
                      ? isDarkMode ? 'rgba(246, 247, 251, 0.12)' : 'rgba(24, 24, 24, 0.08)'
                      : 'transparent'
                  }}
                >
                  <Settings className={`w-4 h-4 transition-transform duration-200 ${isMobileControlsOpen ? 'rotate-90' : ''}`} />
                </button>

                {/* Mobile Dropdown */}
                {isMobileControlsOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setIsMobileControlsOpen(false)}
                    />
                    
                    <div 
                      className="absolute bottom-full left-0 mb-2 rounded-xl shadow-lg border glass-medium z-50"
                      style={{
                        backgroundColor: isDarkMode ? 'rgba(60, 60, 60, 1.0)' : 'rgba(248, 248, 248, 1.0)',
                        border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'}`,
                        minWidth: '280px'
                      }}
                    >
                      <div className="py-2">
                        <div className="px-4 py-2 text-xs font-medium" style={{ color: isDarkMode ? 'rgba(246, 247, 251, 0.6)' : '#9ca3af' }}>
                          Search Type
                        </div>
                        {searchTypes.map((searchType) => {
                          const IconComponent = searchType.icon;
                          const isSelected = selectedSearchType === searchType.id;
                          
                          return (
                            <button
                              key={searchType.id}
                              onClick={() => handleSearchTypeSelect(searchType.id)}
                              className="flex items-center w-full px-4 py-3 transition-all duration-200"
                              style={{
                                backgroundColor: isSelected 
                                  ? isDarkMode ? 'rgba(200, 169, 81, 0.12)' : 'rgba(0, 112, 255, 0.08)'
                                  : 'transparent',
                                color: isDarkMode ? '#f6f7fb' : '#1f2937'
                              }}
                            >
                              <IconComponent className="w-5 h-5 mr-3" style={{ color: isSelected ? isDarkMode ? '#BADDE9' : '#2563eb' : isDarkMode ? 'rgba(246, 247, 251, 0.7)' : '#6b7280' }} />
                              <div className="flex flex-col items-start flex-1">
                                <div className="font-medium" style={{ color: isSelected ? isDarkMode ? '#BADDE9' : '#2563eb' : 'inherit' }}>
                                  {searchType.title}
                                </div>
                                <div className="text-sm" style={{ color: isDarkMode ? 'rgba(246, 247, 251, 0.65)' : '#6b7280' }}>
                                  {searchType.description}
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
            )}

            {/* Text Input */}
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleMessageChange}
              onKeyDown={handleKeyDown}
              placeholder={getCurrentPlaceholder()}
              className={`flex-1 resize-none bg-transparent border-none outline-none overflow-hidden self-center ${isDarkMode ? 'placeholder:text-white/55' : 'placeholder:text-gray-500'}`}
              style={{
                color: isDarkMode ? '#f6f7fb' : '#1f2937',
                fontSize: '16px',
                lineHeight: '24px',
                minHeight: '24px',
                height: '24px',
                paddingTop: '6px',
                paddingBottom: '6px'
              }}
              rows={1}
            />

            {/* Send Button - Premium CelesteOS Style */}
            <button
              type="submit"
              disabled={!message.trim()}
              className="flex items-center justify-center rounded-lg disabled:cursor-not-allowed flex-shrink-0 self-center"
              style={{
                width: '36px',
                height: '36px',
                opacity: message.trim() ? 1 : 0.3,
                background: message.trim() 
                  ? '#0070ff'
                  : isDarkMode ? 'rgba(0, 112, 255, 0.1)' : 'rgba(0, 112, 255, 0.15)',
                boxShadow: message.trim() 
                  ? '0 1px 3px rgba(0, 112, 255, 0.2), 0 4px 12px rgba(0, 112, 255, 0.15)'
                  : 'none',
                transition: 'all 300ms cubic-bezier(0.23, 1, 0.32, 1)',
                transform: 'translateY(0)'
              }}
              onMouseEnter={(e) => {
                if (message.trim()) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 112, 255, 0.2), 0 8px 24px rgba(0, 112, 255, 0.25)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = message.trim() 
                  ? '0 1px 3px rgba(0, 112, 255, 0.2), 0 4px 12px rgba(0, 112, 255, 0.15)'
                  : 'none';
              }}
            >
              <Send className="w-4 h-4" style={{ color: message.trim() ? '#FFFFFF' : isDarkMode ? 'rgba(246, 247, 251, 0.4)' : '#9ca3af' }} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}