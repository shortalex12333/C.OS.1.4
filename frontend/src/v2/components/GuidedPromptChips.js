import React, { useState, useCallback } from 'react';

/**
 * GuidedPromptChips Component
 * Provides suggested queries for new users to get started
 * Extracted and adapted from static site with full webhook integration
 */

const DEFAULT_PROMPTS = [
  "Find the hydraulic pump manual",
  "Show last stabilizer fault log",
  "How much was last month's invoice for Starlink?",
  "What does Error E-343 on main engine mean?"
];

export function GuidedPromptChips({ 
  onPromptSelect, 
  prompts = DEFAULT_PROMPTS,
  isMobile = false, 
  isDarkMode = false,
  className = ''
}) {
  const [hoveredChip, setHoveredChip] = useState(null);
  const [selectedChip, setSelectedChip] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleChipClick = useCallback(async (prompt, index) => {
    if (isProcessing) return;
    
    // Visual feedback
    setSelectedChip(index);
    setIsProcessing(true);
    
    // Log for analytics
    console.log('[GuidedPromptChips] User selected:', prompt);
    
    try {
      // Call parent handler
      if (onPromptSelect) {
        await onPromptSelect(prompt);
      }
      
      // Track successful interaction
      if (window.analytics) {
        window.analytics.track('Guided Prompt Selected', {
          prompt,
          index,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('[GuidedPromptChips] Error handling prompt:', error);
    } finally {
      // Reset states after animation
      setTimeout(() => {
        setSelectedChip(null);
        setIsProcessing(false);
      }, 300);
    }
  }, [onPromptSelect, isProcessing]);

  // Dynamic styles based on state
  const getChipStyles = (index) => {
    const isHovered = hoveredChip === index;
    const isSelected = selectedChip === index;
    
    return {
      // Core styling
      padding: isMobile 
        ? 'var(--spacing-2) var(--spacing-3)' 
        : 'var(--spacing-3) var(--spacing-4)',
      borderRadius: 'var(--radius-full)',
      border: `1px solid ${
        isSelected 
          ? isDarkMode ? 'var(--opulent-gold)' : 'var(--maritime-blue)'
          : isDarkMode 
            ? 'rgba(255, 255, 255, 0.12)' 
            : 'rgba(0, 0, 0, 0.08)'
      }`,
      
      // Background with glassmorphism
      background: isDarkMode 
        ? isHovered || isSelected
          ? 'rgba(246, 247, 251, 0.12)' 
          : 'rgba(246, 247, 251, 0.06)'
        : isHovered || isSelected
          ? 'rgba(255, 255, 255, 0.95)' 
          : 'rgba(255, 255, 255, 0.8)',
      
      // Glass effects
      backdropFilter: 'var(--glass-blur)',
      WebkitBackdropFilter: 'var(--glass-blur)',
      
      // Typography
      fontFamily: 'var(--font-text)',
      fontSize: isMobile ? 'var(--text-sm)' : 'var(--text-sm)',
      fontWeight: 400,
      lineHeight: isMobile ? '18px' : '20px',
      color: isDarkMode 
        ? isHovered || isSelected
          ? 'var(--headline)' 
          : 'rgba(246, 247, 251, 0.85)'
        : isHovered || isSelected
          ? '#1f2937' 
          : '#374151',
      
      // Shadows
      boxShadow: isHovered || isSelected
        ? isDarkMode 
          ? '0 4px 16px rgba(0, 0, 0, 0.25), 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          : '0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
        : isDarkMode 
          ? '0 2px 8px rgba(0, 0, 0, 0.15), 0 1px 2px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.06)'
          : '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
      
      // Interactive states
      cursor: isProcessing ? 'wait' : 'pointer',
      outline: 'none',
      transform: isSelected 
        ? 'translateY(0) scale(0.98)'
        : isHovered 
          ? 'translateY(-1px) scale(1.02)' 
          : 'translateY(0) scale(1)',
      opacity: isProcessing && !isSelected ? 0.6 : 1,
      
      // Transitions
      transition: 'all var(--transition-base)',
      
      // Disable text selection
      userSelect: 'none',
      WebkitUserSelect: 'none'
    };
  };

  return (
    <div 
      className={`guided-prompt-chips ${className}`}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 'var(--spacing-2)',
        maxWidth: isMobile ? '390px' : '760px',
        margin: '0 auto',
        padding: isMobile ? '0 var(--spacing-4)' : '0 var(--spacing-6)',
        marginBottom: 'var(--spacing-4)',
        animation: 'fadeIn 0.6s ease-out'
      }}
      role="group"
      aria-label="Suggested prompts"
    >
      {prompts.map((prompt, index) => (
        <button
          key={`prompt-chip-${index}`}
          className="guided-prompt-chip"
          onClick={() => handleChipClick(prompt, index)}
          onMouseEnter={() => setHoveredChip(index)}
          onMouseLeave={() => setHoveredChip(null)}
          style={getChipStyles(index)}
          disabled={isProcessing}
          role="button"
          tabIndex={0}
          aria-label={`Use guided prompt: ${prompt}`}
          aria-pressed={selectedChip === index}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleChipClick(prompt, index);
            }
          }}
        >
          <span style={{
            display: 'inline-block',
            animation: selectedChip === index ? 'pulse 0.3s ease-out' : 'none'
          }}>
            {prompt}
          </span>
        </button>
      ))}
    </div>
  );
}

// Self-test component for validation
export function GuidedPromptChipsTest() {
  const [lastSelected, setLastSelected] = useState(null);
  const [testResults, setTestResults] = useState([]);

  const runTests = () => {
    const tests = [];
    
    // Test 1: Render check
    const chips = document.querySelectorAll('.guided-prompt-chip');
    tests.push({
      name: 'Renders all prompts',
      passed: chips.length === 4,
      details: `Found ${chips.length} chips`
    });
    
    // Test 2: Click functionality
    tests.push({
      name: 'Click handler works',
      passed: lastSelected !== null,
      details: lastSelected ? `Last selected: "${lastSelected}"` : 'No selection yet'
    });
    
    // Test 3: Accessibility
    const hasAriaLabels = Array.from(chips).every(chip => 
      chip.getAttribute('aria-label')
    );
    tests.push({
      name: 'Accessibility labels present',
      passed: hasAriaLabels,
      details: 'All chips have ARIA labels'
    });
    
    // Test 4: Responsive styling
    const firstChip = chips[0];
    if (firstChip) {
      const styles = window.getComputedStyle(firstChip);
      tests.push({
        name: 'Styles applied correctly',
        passed: styles.borderRadius === '9999px',
        details: `Border radius: ${styles.borderRadius}`
      });
    }
    
    setTestResults(tests);
  };

  return (
    <div style={{ padding: '20px', background: '#f3f4f6', borderRadius: '8px' }}>
      <h3>GuidedPromptChips Test Suite</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>Light Mode - Desktop</h4>
        <GuidedPromptChips 
          onPromptSelect={(prompt) => setLastSelected(prompt)}
          isDarkMode={false}
          isMobile={false}
        />
      </div>
      
      <div style={{ marginBottom: '20px', background: '#0a0e1a', padding: '20px', borderRadius: '8px' }}>
        <h4 style={{ color: '#fff' }}>Dark Mode - Mobile</h4>
        <GuidedPromptChips 
          onPromptSelect={(prompt) => setLastSelected(prompt)}
          isDarkMode={true}
          isMobile={true}
        />
      </div>
      
      <button 
        onClick={runTests}
        style={{
          padding: '10px 20px',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          marginBottom: '10px'
        }}
      >
        Run Tests
      </button>
      
      {lastSelected && (
        <div style={{ 
          padding: '10px', 
          background: '#10b981', 
          color: 'white',
          borderRadius: '6px',
          marginBottom: '10px'
        }}>
          Last selected: "{lastSelected}"
        </div>
      )}
      
      {testResults.length > 0 && (
        <div>
          <h4>Test Results:</h4>
          {testResults.map((test, i) => (
            <div key={i} style={{ 
              padding: '8px',
              background: test.passed ? '#d1fae5' : '#fee2e2',
              borderRadius: '4px',
              marginBottom: '4px'
            }}>
              {test.passed ? '✅' : '❌'} {test.name}: {test.details}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GuidedPromptChips;