import React, { useState, useEffect } from 'react';

/**
 * Enhanced Guided Prompts Component - Production Ready
 * Achieves visual parity with static site while working with JavaScript architecture
 */

const YACHT_PROMPTS = [
  "Find the hydraulic pump manual",
  "Show last stabilizer fault log", 
  "How much was last month's invoice for Starlink?",
  "What does Error E-343 on main engine mean?"
];

export function EnhancedGuidedPrompts({ onPromptSelect, isVisible = true, isDarkMode = false }) {
  const [hoveredChip, setHoveredChip] = useState(null);
  const [selectedChip, setSelectedChip] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleChipClick = async (prompt, index) => {
    if (isProcessing) return;
    
    try {
      setSelectedChip(index);
      setIsProcessing(true);
      
      // Call parent handler
      if (onPromptSelect) {
        await onPromptSelect(prompt);
      }
      
      // Reset after animation
      setTimeout(() => {
        setSelectedChip(null);
        setIsProcessing(false);
      }, 1000);
      
    } catch (error) {
      console.error('[EnhancedGuidedPrompts] Error:', error);
      setSelectedChip(null);
      setIsProcessing(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className="guided-prompts-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        padding: '24px',
        marginBottom: '24px',
        maxWidth: '760px',
        margin: '0 auto'
      }}
    >
      <div style={{
        fontSize: '20px',
        fontWeight: '500',
        color: isDarkMode ? '#f6f7fb' : '#1f2937',
        textAlign: 'center',
        marginBottom: '12px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        Try these yacht operations queries:
      </div>
      
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '8px',
        width: '100%'
      }}>
        {YACHT_PROMPTS.map((prompt, index) => (
          <button
            key={index}
            onClick={() => handleChipClick(prompt, index)}
            onMouseEnter={() => setHoveredChip(index)}
            onMouseLeave={() => setHoveredChip(null)}
            disabled={isProcessing}
            style={{
              // Core styling with glassmorphism effect
              padding: '12px 20px',
              borderRadius: '9999px',
              border: `1px solid ${
                isDarkMode 
                  ? 'rgba(255, 255, 255, 0.12)' 
                  : 'rgba(0, 0, 0, 0.08)'
              }`,
              
              // Background with hover states
              background: isDarkMode 
                ? hoveredChip === index || selectedChip === index
                  ? 'rgba(246, 247, 251, 0.12)' 
                  : 'rgba(246, 247, 251, 0.06)'
                : hoveredChip === index || selectedChip === index
                  ? 'rgba(255, 255, 255, 0.95)' 
                  : 'rgba(255, 255, 255, 0.8)',
              
              // Glassmorphism effects
              backdropFilter: 'blur(12px) saturate(1.1)',
              WebkitBackdropFilter: 'blur(12px) saturate(1.1)',
              
              // Typography
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: '14px',
              fontWeight: '400',
              lineHeight: '20px',
              color: isDarkMode 
                ? hoveredChip === index || selectedChip === index
                  ? '#f6f7fb'
                  : 'rgba(246, 247, 251, 0.85)'
                : hoveredChip === index || selectedChip === index
                  ? '#1f2937' 
                  : '#374151',
              
              // Enhanced shadows
              boxShadow: hoveredChip === index || selectedChip === index
                ? isDarkMode 
                  ? '0 4px 16px rgba(0, 0, 0, 0.25), 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  : '0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                : isDarkMode 
                  ? '0 2px 8px rgba(0, 0, 0, 0.15), 0 1px 2px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.06)'
                  : '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
              
              // Interactive states
              cursor: isProcessing ? 'wait' : 'pointer',
              outline: 'none',
              transform: selectedChip === index 
                ? 'translateY(0) scale(0.98)'
                : hoveredChip === index 
                  ? 'translateY(-1px) scale(1.02)' 
                  : 'translateY(0) scale(1)',
              transition: 'all 0.2s cubic-bezier(0.22, 0.61, 0.36, 1)',
              opacity: isProcessing && selectedChip !== index ? 0.5 : 1,
            }}
          >
            {selectedChip === index ? 'Processing...' : prompt}
          </button>
        ))}
      </div>
      
      {isProcessing && (
        <div style={{
          fontSize: '13px',
          color: isDarkMode ? 'rgba(246, 247, 251, 0.6)' : '#6b7280',
          fontStyle: 'italic',
          marginTop: '8px'
        }}>
          Searching yacht operations database...
        </div>
      )}
    </div>
  );
}

export default EnhancedGuidedPrompts;