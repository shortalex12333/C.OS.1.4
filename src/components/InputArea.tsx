import React, { useState, useEffect } from 'react';
import { Send, Ship, Mail, Settings, Layers } from 'lucide-react';
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
      setMessage('');
      setShowSuggestions(false);
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMessage = e.target.value;
    setMessage(newMessage);
    setShowSuggestions(showFAQSuggestions && newMessage.trim().length >= 2);
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
        maxWidth: isMobile ? '390px' : '760px',
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
          className="relative rounded-2xl transition-all duration-300 glass-subtle"
          style={{
            backgroundColor: isDarkMode 
              ? 'rgba(15, 11, 18, 0.95)' 
              : 'rgba(255, 255, 255, 0.95)',
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
                            ? isDarkMode ? '#c8a951' : '#181818'
                            : isDarkMode ? 'rgba(246, 247, 251, 0.7)' : '#6b7280',
                          backgroundColor: isSelected 
                            ? isDarkMode ? 'rgba(200, 169, 81, 0.12)' : 'rgba(24, 24, 24, 0.08)'
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
                  className="w-px" 
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
                        backgroundColor: isDarkMode ? 'rgba(15, 11, 18, 1.0)' : 'rgba(255, 255, 255, 1.0)',
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
                              <IconComponent className="w-5 h-5 mr-3" style={{ color: isSelected ? isDarkMode ? '#c8a951' : '#2563eb' : isDarkMode ? 'rgba(246, 247, 251, 0.7)' : '#6b7280' }} />
                              <div className="flex flex-col items-start flex-1">
                                <div className="font-medium" style={{ color: isSelected ? isDarkMode ? '#c8a951' : '#2563eb' : 'inherit' }}>
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
              value={message}
              onChange={handleMessageChange}
              onKeyDown={handleKeyDown}
              placeholder={getCurrentPlaceholder()}
              className={`flex-1 resize-none bg-transparent border-none outline-none ${isDarkMode ? 'placeholder:text-white/55' : 'placeholder:text-gray-500'}`}
              style={{
                color: isDarkMode ? '#f6f7fb' : '#1f2937',
                fontSize: '16px',
                lineHeight: '24px',
                minHeight: '24px',
                maxHeight: '120px'
              }}
              rows={1}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!message.trim()}
              className="flex items-center justify-center p-2 rounded-lg text-white transition-all duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed"
              style={{
                width: '36px',
                height: '36px',
                opacity: message.trim() ? 1 : 0.5,
                backgroundColor: message.trim() 
                  ? isDarkMode ? '#c8a951' : '#2563eb'
                  : isDarkMode ? 'rgba(200, 169, 81, 0.3)' : 'rgba(107, 114, 128, 0.3)'
              }}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* FAQ Suggestions */}
        {showSuggestions && (
          <DynamicFAQSuggestions
            userInput={message}
            onSelectQuestion={(question) => {
              setMessage(question);
              setShowSuggestions(false);
            }}
            maxSuggestions={isMobile ? 2 : 3}
            isDarkMode={isDarkMode}
            isMobile={isMobile}
          />
        )}
      </form>
    </div>
  );
}