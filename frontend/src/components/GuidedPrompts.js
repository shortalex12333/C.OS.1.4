import React, { useState } from 'react';

/**
 * Guided Prompt Chips - SINGLE FEATURE IMPLEMENTATION
 * Reality Check: Building ONE thing properly instead of claiming to build everything
 * 
 * This component adds maritime-specific prompt suggestions to improve user onboarding
 * Designed to integrate with the existing 1,818-line components.js file
 */

const MARITIME_PROMPTS = [
  "Show fault code 110-00 solutions",
  "Find CAT fuel filter maintenance",
  "Hydraulic pump service manual",
  "Generator troubleshooting steps"
];

export function GuidedPrompts({ onPromptSelect, isVisible = true }) {
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePromptClick = async (prompt, index) => {
    if (isProcessing) return;
    
    try {
      setSelectedPrompt(index);
      setIsProcessing(true);
      
      console.log('[GuidedPrompts] User selected:', prompt);
      
      // Call the parent's prompt handler
      if (onPromptSelect) {
        await onPromptSelect(prompt);
      }
      
      // Reset after a moment
      setTimeout(() => {
        setSelectedPrompt(null);
        setIsProcessing(false);
      }, 1000);
      
    } catch (error) {
      console.error('[GuidedPrompts] Error:', error);
      setSelectedPrompt(null);
      setIsProcessing(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
      padding: '20px',
      marginBottom: '20px'
    }}>
      <div style={{
        fontSize: '18px',
        fontWeight: '500',
        color: '#374151',
        textAlign: 'center',
        marginBottom: '8px'
      }}>
        Try asking about:
      </div>
      
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '8px',
        maxWidth: '600px'
      }}>
        {MARITIME_PROMPTS.map((prompt, index) => (
          <button
            key={index}
            onClick={() => handlePromptClick(prompt, index)}
            disabled={isProcessing}
            style={{
              padding: '8px 16px',
              background: selectedPrompt === index 
                ? '#3b82f6' 
                : isProcessing 
                  ? '#e5e7eb'
                  : '#f3f4f6',
              color: selectedPrompt === index ? '#ffffff' : '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '20px',
              fontSize: '14px',
              cursor: isProcessing ? 'wait' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: isProcessing && selectedPrompt !== index ? 0.5 : 1,
              // Hover effect
              ':hover': {
                backgroundColor: selectedPrompt === index ? '#3b82f6' : '#e5e7eb'
              }
            }}
            onMouseEnter={(e) => {
              if (!isProcessing && selectedPrompt !== index) {
                e.target.style.backgroundColor = '#e5e7eb';
              }
            }}
            onMouseLeave={(e) => {
              if (!isProcessing && selectedPrompt !== index) {
                e.target.style.backgroundColor = '#f3f4f6';
              }
            }}
          >
            {selectedPrompt === index ? 'Sending...' : prompt}
          </button>
        ))}
      </div>
      
      {isProcessing && (
        <div style={{
          fontSize: '12px',
          color: '#6b7280',
          fontStyle: 'italic'
        }}>
          Processing your query...
        </div>
      )}
    </div>
  );
}

/**
 * TEST COMPONENT - For validation
 */
export function GuidedPromptsTest() {
  const [lastSelected, setLastSelected] = useState(null);
  const [testLog, setTestLog] = useState([]);

  const handleTestPrompt = async (prompt) => {
    setLastSelected(prompt);
    setTestLog(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      action: 'prompt_selected',
      prompt: prompt
    }]);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const runBasicTest = () => {
    const prompts = document.querySelectorAll('button');
    const results = [];
    
    results.push({
      test: 'Renders 4 prompts',
      passed: prompts.length >= 4,
      details: `Found ${prompts.length} prompt buttons`
    });
    
    results.push({
      test: 'Buttons are clickable',
      passed: prompts[0] && !prompts[0].disabled,
      details: 'First button is enabled'
    });
    
    setTestLog(prev => [...prev, ...results.map(r => ({
      timestamp: new Date().toLocaleTimeString(),
      action: 'test_result',
      test: r.test,
      passed: r.passed,
      details: r.details
    }))]);
  };

  return (
    <div style={{ padding: '20px', background: '#f9fafb', borderRadius: '8px' }}>
      <h3 style={{ marginBottom: '20px' }}>GuidedPrompts - Single Feature Test</h3>
      
      <GuidedPrompts 
        onPromptSelect={handleTestPrompt}
        isVisible={true}
      />
      
      <div style={{ marginTop: '20px', padding: '16px', background: '#ffffff', borderRadius: '6px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button 
            onClick={runBasicTest}
            style={{
              padding: '8px 16px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Run Basic Test
          </button>
        </div>
        
        {lastSelected && (
          <div style={{ 
            padding: '8px', 
            background: '#dcfce7', 
            borderRadius: '4px',
            marginBottom: '10px'
          }}>
            Last selected: "{lastSelected}"
          </div>
        )}
        
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          <h4>Test Log:</h4>
          {testLog.map((log, i) => (
            <div key={i} style={{ 
              fontSize: '12px', 
              padding: '4px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              gap: '8px'
            }}>
              <span style={{ color: '#6b7280' }}>{log.timestamp}</span>
              <span style={{ 
                color: log.passed === true ? '#16a34a' : log.passed === false ? '#dc2626' : '#374151' 
              }}>
                {log.action}: {log.test || log.prompt} {log.details && `(${log.details})`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GuidedPrompts;