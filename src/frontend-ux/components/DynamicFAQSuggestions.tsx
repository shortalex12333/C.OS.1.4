import React, { useState, useEffect, useMemo } from 'react';
import { HelpCircle, Book, AlertTriangle, Settings, Shield, Wrench, DollarSign, Navigation, FileText, Mail } from 'lucide-react';
import { searchFAQ, getTopFAQs, getTopFAQsBySearchType, FAQItem } from '../../data/faqDatabase';

interface DynamicFAQSuggestionsProps {
  onQuestionClick: (question: string) => void;
  searchQuery?: string;
  isDarkMode?: boolean;
  isMobile?: boolean;
  maxSuggestions?: number;
  showCategories?: boolean;
  className?: string;
  searchType?: 'yacht' | 'email' | 'email-yacht';
}

const categoryIcons: { [key: string]: React.ReactNode } = {
  'System': <Settings size={16} />,
  'Installation': <Wrench size={16} />,
  'Security': <Shield size={16} />,
  'Training': <Book size={16} />,
  'Business': <DollarSign size={16} />,
  'Operations': <Navigation size={16} />,
  'Maintenance': <Wrench size={16} />,
  'Safety': <AlertTriangle size={16} />,
  'Documents': <FileText size={16} />,
  'Email Search': <Mail size={16} />
};

export function DynamicFAQSuggestions({ 
  onQuestionClick, 
  searchQuery = '', 
  isDarkMode = false, 
  isMobile = false,
  maxSuggestions = 6,
  showCategories = false,
  className = '',
  searchType = 'yacht'
}: DynamicFAQSuggestionsProps) {
  const [displayedSuggestions, setDisplayedSuggestions] = useState<FAQItem[]>([]);

  // Memoize FAQ suggestions based on search query and search type
  const suggestions = useMemo(() => {
    if (searchQuery.trim().length >= 2) {
      return searchFAQ(searchQuery, maxSuggestions);
    } else {
      return getTopFAQsBySearchType(searchType, maxSuggestions);
    }
  }, [searchQuery, maxSuggestions, searchType]);

  // Animate suggestions change
  useEffect(() => {
    // Small delay to create smooth transition effect
    const timer = setTimeout(() => {
      setDisplayedSuggestions(suggestions);
    }, 100);

    return () => clearTimeout(timer);
  }, [suggestions]);

  const baseTextColor = isDarkMode ? '#ffffff' : '#1f2937';
  const secondaryTextColor = isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#6b7280';
  const backgroundColor = isDarkMode ? '#181818' : 'rgba(255, 255, 255, 0.95)';
  const borderColor = isDarkMode ? '#313235' : 'rgba(229, 231, 235, 0.95)';
  const hoverBackgroundColor = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(249, 250, 251, 0.95)';

  if (displayedSuggestions.length === 0) {
    return null;
  }

  return (
    <div 
      className={`dynamic-faq-suggestions ${className}`}
      style={{
        maxWidth: isMobile ? '100%' : '760px',
        margin: '0 auto',
        padding: isMobile ? '16px' : '24px',
        animation: 'fadeIn 0.4s ease-out',
        backgroundColor: isDarkMode ? '#2e2e2e' : 'transparent'
      }}
    >
      {/* Header */}
      {searchQuery.trim().length >= 2 ? (
        <div style={{
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: baseTextColor,
            margin: '0 0 4px 0',
            fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
          }}>
            Related Questions
          </h4>
          <p style={{
            fontSize: '13px',
            color: secondaryTextColor,
            margin: 0,
            fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
          }}>
            Found {displayedSuggestions.length} suggestions matching "{searchQuery}"
          </p>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: baseTextColor,
            margin: '0 0 4px 0',
            fontFamily: 'Eloquia Display, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
          }}>
            Here's what CelesteOS can solve in seconds
          </h3>
          <p style={{
            fontSize: '14px',
            color: secondaryTextColor,
            margin: 0,
            fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
          }}>
            Tap a question — see how your yacht's knowledge comes alive.
          </p>
        </div>
      )}

      {/* Suggestions Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '12px',
        animation: 'slideIn 0.5s ease-out'
      }}>
        {displayedSuggestions.map((item) => (
          <button
            key={item.id}
            onClick={() => onQuestionClick(item.question)}
            className="faq-suggestion-card"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '16px',
              background: backgroundColor,
              backdropFilter: 'blur(12px) saturate(1.2)',
              WebkitBackdropFilter: 'blur(12px) saturate(1.2)',
              border: 'none',
              borderRadius: '4px', // Base tier for inner elements // Container tier for cards
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              textAlign: 'left',
              width: '100%',
              fontFamily: 'inherit',
              boxShadow: isDarkMode 
                ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
                : '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = hoverBackgroundColor;
              e.currentTarget.style.backdropFilter = 'blur(16px) saturate(1.3)';
              e.currentTarget.style.webkitBackdropFilter = 'blur(16px) saturate(1.3)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = isDarkMode 
                ? '0 4px 16px rgba(0, 0, 0, 0.4)' 
                : '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = backgroundColor;
              e.currentTarget.style.backdropFilter = 'blur(12px) saturate(1.2)';
              e.currentTarget.style.webkitBackdropFilter = 'blur(12px) saturate(1.2)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = isDarkMode 
                ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
                : '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)';
            }}
          >
            {/* Icon */}
            <div style={{
              flexShrink: 0,
              width: '36px',
              height: '36px',
              borderRadius: '4px', // Base tier for inner elements
              background: isDarkMode ? 'rgba(186, 221, 233, 0.2)' : 'rgba(54, 54, 54, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isDarkMode ? '#BADDE9' : '#363636'
            }}>
              {categoryIcons[item.category] || <HelpCircle size={16} />}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: '14px',
                fontWeight: '500',
                color: baseTextColor,
                margin: '0 0 4px 0',
                lineHeight: '1.4',
                fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
              }}>
                {item.question}
              </p>

              {/* Category and Priority */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '6px'
              }}>
                {showCategories && (
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '500',
                    color: isDarkMode ? '#BADDE9' : '#363636',
                    background: isDarkMode ? 'rgba(186, 221, 233, 0.15)' : 'rgba(54, 54, 54, 0.1)',
                    padding: '2px 6px',
                    borderRadius: '2px', // Micro tier for badges
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {item.category}
                  </span>
                )}
                
                {/* Priority indicator */}
                {item.priority >= 9 && (
                  <span style={{
                    fontSize: '11px',
                    color: isDarkMode ? '#004aff' : '#004aff',
                    fontWeight: '500'
                  }}>
                    Popular
                  </span>
                )}
              </div>

              {/* Answer Preview (for search results) */}
              {searchQuery.trim().length >= 2 && (
                <p style={{
                  fontSize: '12px',
                  color: secondaryTextColor,
                  margin: '6px 0 0 0',
                  lineHeight: '1.3',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical' as const
                }}>
                  {item.answer.length > 100 
                    ? `${item.answer.substring(0, 100)}...` 
                    : item.answer
                  }
                </p>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Show more hint for search results */}
      {searchQuery.trim().length >= 2 && displayedSuggestions.length === maxSuggestions && (
        <div style={{
          textAlign: 'center',
          marginTop: '16px'
        }}>
          <p style={{
            fontSize: '12px',
            color: secondaryTextColor,
            margin: 0,
            fontStyle: 'italic'
          }}>
            Showing top {maxSuggestions} results. Try being more specific for better matches.
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideIn {
          from { 
            opacity: 0; 
            transform: translateY(10px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }

        .faq-suggestion-card:focus {
          outline: 2px solid ${isDarkMode ? '#BADDE9' : '#363636'};
          outline-offset: 2px;
        }

        .faq-suggestion-card:active {
          transform: translateY(0) !important;
        }

        @media (prefers-reduced-motion: reduce) {
          .dynamic-faq-suggestions,
          .faq-suggestion-card {
            animation: none !important;
            transition: none !important;
          }
          
          .faq-suggestion-card:hover {
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}