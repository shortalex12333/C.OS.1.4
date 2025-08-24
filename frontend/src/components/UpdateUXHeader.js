import React, { useState } from 'react';
import { ChevronDown, Zap, Target, Wind, Check } from 'lucide-react';

const models = [
  {
    id: 'power',
    name: 'Power',
    description: 'Our most advanced model',
    icon: Zap
  },
  {
    id: 'reach',
    name: 'Reach',
    description: 'Get more thorough answers',
    icon: Target
  },
  {
    id: 'air',
    name: 'Air',
    description: 'Fastest model, for simple tasks',
    icon: Wind
  }
];

export function UpdateUXHeader({ 
  isMobile = false, 
  isDarkMode = false, 
  isChatMode = false, 
  selectedModel = 'air', 
  onModelChange = () => {} 
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleModelSelect = (modelId) => {
    setIsDropdownOpen(false);
    onModelChange(modelId);
  };

  const selectedModelData = models.find(m => m.id === selectedModel);

  return (
    <div 
      className="flex items-center px-6 py-4 main_header_container"
      style={{
        padding: isMobile ? '12px 16px' : '16px 24px',
        minHeight: isMobile ? '60px' : '72px',
        background: 'transparent',
        justifyContent: isMobile ? 'center' : 'space-between'
      }}
    >
      {/* CelesteOS Branding with Model Selector */}
      <div className="relative celeste_branding_dropdown">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {/* CelesteOS Text */}
            <h1 
              style={{
                fontSize: isMobile ? '20px' : '24px',
                fontWeight: 400,
                lineHeight: isMobile ? '24px' : '28px',
                fontFamily: 'Eloquia Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                color: isDarkMode ? 'var(--headline, #f6f7fb)' : '#1f2937',
                margin: 0
              }}
            >
              Celeste
              <span 
                style={{
                  color: isDarkMode 
                    ? 'var(--opulent-gold, #c8a951)' 
                    : '#2563eb',
                  fontWeight: 500
                }}
              >
                OS
              </span>
            </h1>

            {/* Dropdown Chevron */}
            <ChevronDown 
              style={{
                width: isMobile ? '16px' : '18px',
                height: isMobile ? '16px' : '18px',
                color: isDarkMode ? 'var(--headline, #f6f7fb)' : '#6b7280',
                marginLeft: '4px',
                transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }}
            />
          </button>
          
          {/* Model Type Subheader */}
          <div 
            style={{
              fontSize: isMobile ? '10px' : '11px',
              fontWeight: 500,
              lineHeight: isMobile ? '12px' : '14px',
              fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              color: isDarkMode 
                ? 'rgba(246, 247, 251, 0.65)' 
                : 'rgba(31, 41, 55, 0.6)',
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '1.2px',
              marginTop: isMobile ? '2px' : '4px'
            }}
          >
            {selectedModel.toUpperCase()}
          </div>
        </div>

        {/* Model Selector Dropdown */}
        {isDropdownOpen && (
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
              onClick={() => setIsDropdownOpen(false)}
            />
            
            {/* Mobile Blur Backdrop */}
            {isMobile && (
              <div 
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 40,
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  backgroundColor: isDarkMode 
                    ? 'rgba(0, 0, 0, 0.2)' 
                    : 'rgba(0, 0, 0, 0.1)'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen(false);
                }}
              />
            )}
            
            <div 
              style={{
                position: 'absolute',
                top: '100%',
                marginTop: '8px',
                left: isMobile ? '50%' : '0',
                transform: isMobile ? 'translateX(-50%)' : 'none',
                borderRadius: '12px',
                backgroundColor: isDarkMode 
                  ? 'rgba(15, 11, 18, 0.95)' 
                  : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'}`,
                boxShadow: isDarkMode 
                  ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)' 
                  : '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
                minWidth: isMobile ? '280px' : '320px',
                maxWidth: isMobile ? '320px' : '380px',
                zIndex: 50
              }}
            >
              {/* Header */}
              <div 
                style={{
                  padding: '12px 16px',
                  borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
                  color: isDarkMode ? 'var(--headline, #f6f7fb)' : '#1f2937'
                }}
              >
                <div 
                  style={{
                    fontFamily: 'Eloquia Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fontSize: isMobile ? '14px' : '15px',
                    fontWeight: 500
                  }}
                >
                  Select Model
                </div>
              </div>

              {/* Model Options */}
              <div style={{ padding: '8px 0' }}>
                {models.map((model) => {
                  const IconComponent = model.icon;
                  const isSelected = selectedModel === model.id;
                  
                  return (
                    <button
                      key={model.id}
                      onClick={() => handleModelSelect(model.id)}
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
                        color: isDarkMode ? 'var(--headline, #f6f7fb)' : '#1f2937',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = isDarkMode 
                            ? 'rgba(246, 247, 251, 0.06)' 
                            : 'rgba(0, 0, 0, 0.03)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        } else {
                          e.currentTarget.style.backgroundColor = isDarkMode 
                            ? 'rgba(200, 169, 81, 0.12)' 
                            : 'rgba(0, 112, 255, 0.08)';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <IconComponent 
                          style={{
                            width: '20px',
                            height: '20px',
                            color: isSelected 
                              ? isDarkMode 
                                ? 'var(--opulent-gold, #c8a951)' 
                                : '#2563eb'
                              : isDarkMode 
                                ? 'rgba(246, 247, 251, 0.7)' 
                                : '#6b7280'
                          }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1 }}>
                          <div 
                            style={{
                              fontFamily: 'Eloquia Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                              fontSize: isMobile ? '15px' : '16px',
                              fontWeight: 500,
                              lineHeight: '20px',
                              color: isSelected 
                                ? isDarkMode 
                                  ? 'var(--opulent-gold, #c8a951)' 
                                  : '#2563eb'
                                : 'inherit'
                            }}
                          >
                            {model.name}
                          </div>
                          <div 
                            style={{
                              fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                              fontSize: isMobile ? '13px' : '14px',
                              lineHeight: '18px',
                              color: isDarkMode 
                                ? 'rgba(246, 247, 251, 0.65)' 
                                : '#6b7280',
                              marginTop: '2px'
                            }}
                          >
                            {model.description}
                          </div>
                        </div>
                      </div>
                      
                      {/* Selection Check */}
                      {isSelected && (
                        <Check 
                          style={{
                            width: '16px',
                            height: '16px',
                            marginLeft: '8px',
                            color: isDarkMode 
                              ? 'var(--opulent-gold, #c8a951)' 
                              : '#2563eb'
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Current Model Display (Only in Chat Mode and Desktop) */}
      {isChatMode && selectedModelData && !isMobile && (
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: isDarkMode ? 'rgba(246, 247, 251, 0.7)' : '#6b7280',
            fontSize: isMobile ? '13px' : '14px',
            fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        >
          <selectedModelData.icon style={{ width: '16px', height: '16px' }} />
          <span>{selectedModelData.name}</span>
        </div>
      )}
    </div>
  );
}

export default UpdateUXHeader;