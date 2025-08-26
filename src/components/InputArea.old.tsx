import React, { useState, useEffect } from 'react';
import { Send, Paperclip, Ship, Mail, Search, ChevronDown, Settings, Layers } from 'lucide-react';
import { DynamicFAQSuggestions } from './DynamicFAQSuggestions';

interface InputAreaProps {
  onStartChat: (message: string, searchType?: SearchType) => void;
  isMobile?: boolean;
  isDarkMode?: boolean;
  currentSearchType?: SearchType;
  showFAQSuggestions?: boolean;
}

type SearchType = 'yacht' | 'email' | 'email-yacht';

export function InputArea({ 
  onStartChat, 
  isMobile = false, 
  isDarkMode = false, 
  currentSearchType = 'yacht', 
  showFAQSuggestions = true 
}: InputAreaProps) {
  
  const [message, setMessage] = useState('');
  const [selectedSearchType, setSelectedSearchType] = useState<SearchType>(currentSearchType);
  const [isMobileControlsOpen, setIsMobileControlsOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Synchronize with parent component's search type
  useEffect(() => {
    setSelectedSearchType(currentSearchType);
  }, [currentSearchType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onStartChat(message.trim(), selectedSearchType);
      setMessage(''); // Clear input after sending
      setShowSuggestions(false); // Hide suggestions after sending
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMessage = e.target.value;
    setMessage(newMessage);
    
    // Show suggestions when user starts typing (2+ characters) and FAQ suggestions are enabled
    setShowSuggestions(showFAQSuggestions && newMessage.trim().length >= 2);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
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
        maxWidth: isMobile ? '390px' : '760px',
        margin: '0 auto',
        padding: isMobile ? '16px' : '24px'
      }}
    >
      {/* Search Type Indicator */}
      <div className="flex items-center justify-center mb-2">
        <div 
          className="flex items-center gap-2 px-3 py-1 rounded-full text-xs transition-all duration-200 search_type_indicator"
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
              return <Icon className="w-3 h-3" />;
            }
            return null;
          })()}
          <span className="font-medium">
            Searching: {getCurrentSearchType()?.title}
          </span>
        </div>
      </div>

      {/* Main Input Area */}
      <form onSubmit={handleSubmit} className="relative">
        <div 
          className="relative rounded-2xl transition-all duration-300 input_container"
          style={{
            borderRadius: isMobile ? '16px' : '20px',
            minHeight: '56px',
            boxShadow: isDarkMode 
              ? '0 4px 12px rgba(0, 0, 0, 0.25)' 
              : '0 4px 12px rgba(0, 0, 0, 0.05)',
            background: isDarkMode 
              ? 'rgba(15, 11, 18, 0.95)' 
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderColor: isDarkMode 
              ? 'rgba(255, 255, 255, 0.12)' 
              : 'rgba(0, 0, 0, 0.1)'
          }}
        >
          <div className="flex items-end">
            {/* Main textarea */}
            <textarea
              value={message}
              onChange={handleMessageChange}
              onKeyDown={handleKeyDown}
              placeholder={getCurrentPlaceholder()}
              className="input-enterprise flex-1 resize-none bg-transparent border-0 outline-none"
              style={{
                minHeight: isMobileDevice ? '44px' : '52px',
                maxHeight: '200px',
                padding: isMobileDevice ? '14px 16px' : '16px 20px',
                lineHeight: '1.5',
                fontSize: isMobileDevice ? '16px' : '14px',
                color: theme.text.primary,
                ...getInputStyle(),
              }}
              rows={1}
            />

            {/* Controls */}
            <div className="flex items-end p-2 gap-2">
              {/* Mobile: Collapse controls into dropdown */}
              {isMobileDevice ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsMobileControlsOpen(!isMobileControlsOpen)}
                    className="btn-ghost p-2 rounded-lg"
                    style={getMobileButtonStyle('ghost')}
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  
                  {isMobileControlsOpen && (
                    <div 
                      className="absolute bottom-full right-0 mb-2 rounded-lg shadow-lg border"
                      style={{
                        backgroundColor: theme.backgrounds.elevated,
                        border: `1px solid ${theme.inputs.border}`,
                        boxShadow: theme.modal.shadow,
                        minWidth: '200px',
                        zIndex: 10
                      }}
                    >
                      <div className="p-3">
                        <div className="text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                          Search Mode
                        </div>
                        {searchTypes.map((type) => {
                          const Icon = type.icon;
                          const isSelected = selectedSearchType === type.id;
                          return (
                            <button
                              key={type.id}
                              type="button"
                              onClick={() => {
                                setSelectedSearchType(type.id);
                                setIsMobileControlsOpen(false);
                              }}
                              className="w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors"
                              style={{
                                backgroundColor: isSelected 
                                  ? theme.sidebar.itemBackgroundActive 
                                  : 'transparent',
                                color: isSelected 
                                  ? theme.sidebar.itemTextActive 
                                  : theme.sidebar.itemText
                              }}
                            >
                              <Icon className="w-4 h-4" />
                              <div>
                                <div className="text-sm font-medium">{type.title}</div>
                                <div className="text-xs opacity-70">{type.description}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Desktop: Show search type selector */
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsMobileControlsOpen(!isMobileControlsOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors btn-secondary"
                    style={getButtonStyle('secondary')}
                  >
                    {(() => {
                      const currentType = getCurrentSearchType();
                      if (currentType) {
                        const Icon = currentType.icon;
                        return <Icon className="w-4 h-4" />;
                      }
                      return null;
                    })()}
                    <span className="text-sm font-medium">
                      {getCurrentSearchType()?.title}
                    </span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  
                  {isMobileControlsOpen && (
                    <div 
                      className="absolute bottom-full right-0 mb-2 rounded-lg shadow-lg border"
                      style={{
                        backgroundColor: theme.backgrounds.elevated,
                        border: `1px solid ${theme.inputs.border}`,
                        boxShadow: theme.modal.shadow,
                        minWidth: '280px',
                        zIndex: 10
                      }}
                    >
                      <div className="p-2">
                        {searchTypes.map((type) => {
                          const Icon = type.icon;
                          const isSelected = selectedSearchType === type.id;
                          return (
                            <button
                              key={type.id}
                              type="button"
                              onClick={() => {
                                setSelectedSearchType(type.id);
                                setIsMobileControlsOpen(false);
                              }}
                              className="w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors"
                              style={{
                                backgroundColor: isSelected 
                                  ? theme.sidebar.itemBackgroundActive 
                                  : 'transparent',
                                color: isSelected 
                                  ? theme.sidebar.itemTextActive 
                                  : theme.sidebar.itemText
                              }}
                            >
                              <Icon className="w-5 h-5" />
                              <div className="flex-1">
                                <div className="font-medium">{type.title}</div>
                                <div className="text-sm opacity-70">{type.description}</div>
                              </div>
                              {isSelected && (
                                <div 
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: theme.brand.primary }}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Send Button */}
              <button
                type="submit"
                disabled={!message.trim()}
                className="btn-primary p-3 rounded-xl transition-all duration-200"
                style={{
                  ...getMobileButtonStyle('primary'),
                  minWidth: '48px',
                  minHeight: '48px',
                  opacity: message.trim() ? 1 : 0.5
                }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic FAQ Suggestions */}
        {showSuggestions && (
          <div className="mt-2">
            <DynamicFAQSuggestions
              query={message}
              onSuggestionClick={(suggestion) => {
                setMessage(suggestion);
                setShowSuggestions(false);
                // Auto-submit the suggestion
                setTimeout(() => {
                  if (suggestion.trim()) {
                    onStartChat(suggestion.trim(), selectedSearchType);
                    setMessage('');
                  }
                }, 100);
              }}
              maxSuggestions={isMobileDevice ? 2 : 3}
              isDarkMode={isThemeDark}
              isMobile={isMobileDevice}
            />
          </div>
        )}
      </form>

      {/* Hint text */}
      <div 
        className="text-xs text-center mt-2 opacity-60"
        style={{ color: theme.text.tertiary }}
      >
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
}