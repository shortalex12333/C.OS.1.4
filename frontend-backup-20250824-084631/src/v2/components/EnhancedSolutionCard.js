import React, { useState, useCallback, useMemo } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, AlertCircle, Wrench, FileText, DollarSign, Clock, TrendingUp, Shield } from 'lucide-react';

/**
 * EnhancedSolutionCard Component
 * Displays AI-generated solutions with confidence scores and expanded details
 * Major upgrade from basic SolutionCard with visual indicators
 */

export function EnhancedSolutionCard({ 
  solution, 
  index = 0,
  isDarkMode = false,
  isMobile = false,
  onFeedback,
  onActionClick
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(null);
  const [isImplementing, setIsImplementing] = useState(false);

  // Confidence level calculation
  const getConfidenceLevel = useCallback((score) => {
    if (score >= 85) return { level: 'high', color: 'var(--success-green)', label: 'High Confidence' };
    if (score >= 70) return { level: 'medium', color: 'var(--warning-amber)', label: 'Medium Confidence' };
    return { level: 'low', color: 'var(--error-red)', label: 'Low Confidence' };
  }, []);

  const confidence = useMemo(() => 
    getConfidenceLevel(solution?.confidence || 75),
    [solution?.confidence, getConfidenceLevel]
  );

  // Priority badge color
  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'critical': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  // Handle feedback
  const handleFeedback = async (isHelpful) => {
    setFeedbackGiven(isHelpful);
    
    if (onFeedback) {
      await onFeedback({
        solutionId: solution.id || index,
        isHelpful,
        confidence: solution.confidence,
        timestamp: Date.now()
      });
    }
    
    // Analytics tracking
    if (window.analytics) {
      window.analytics.track('Solution Feedback', {
        solutionId: solution.id || index,
        helpful: isHelpful,
        confidence: solution.confidence
      });
    }
  };

  // Handle action button clicks
  const handleAction = async (action) => {
    setIsImplementing(true);
    
    try {
      if (onActionClick) {
        await onActionClick(action, solution);
      }
      
      // Simulate implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log(`[SolutionCard] Action triggered: ${action}`);
    } finally {
      setIsImplementing(false);
    }
  };

  // Calculate estimated metrics
  const metrics = useMemo(() => ({
    timeToImplement: solution?.estimatedTime || '30-45 min',
    costSavings: solution?.costSavings || '$2,400/month',
    successRate: solution?.successRate || '94%',
    riskLevel: solution?.riskLevel || 'Low'
  }), [solution]);

  const cardStyles = {
    background: isDarkMode 
      ? 'linear-gradient(135deg, rgba(20, 24, 36, 0.95) 0%, rgba(26, 30, 42, 0.95) 100%)'
      : 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
    border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
    borderRadius: 'var(--ai-card-radius-lg)',
    padding: isMobile ? 'var(--spacing-4)' : 'var(--spacing-5)',
    marginBottom: 'var(--spacing-4)',
    boxShadow: isDarkMode 
      ? '0 4px 24px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)'
      : '0 4px 24px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.03)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    transition: 'all var(--transition-base)',
    animation: `slideInUp ${0.4 + index * 0.1}s var(--easing-smooth)`,
    position: 'relative',
    overflow: 'hidden'
  };

  // Confidence indicator bar
  const confidenceBarStyles = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: `linear-gradient(90deg, ${confidence.color} ${solution?.confidence || 75}%, transparent ${solution?.confidence || 75}%)`,
    borderRadius: 'var(--ai-card-radius-lg) var(--ai-card-radius-lg) 0 0'
  };

  return (
    <div className="enhanced-solution-card" style={cardStyles}>
      {/* Confidence indicator bar */}
      <div style={confidenceBarStyles} aria-hidden="true" />
      
      {/* Header Section */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: 'var(--spacing-4)'
      }}>
        <div style={{ flex: 1 }}>
          {/* Solution Number Badge */}
          <div style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--spacing-2)',
            marginBottom: 'var(--spacing-2)'
          }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: isDarkMode 
                ? 'linear-gradient(135deg, var(--opulent-gold) 0%, #e6c574 100%)'
                : 'linear-gradient(135deg, var(--maritime-blue) 0%, #4da6ff 100%)',
              color: '#ffffff',
              fontFamily: 'var(--font-text)',
              fontSize: 'var(--text-sm)',
              fontWeight: 600
            }}>
              {index + 1}
            </span>
            
            {solution?.priority && (
              <span style={{
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                background: getPriorityColor(solution.priority),
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase'
              }}>
                {solution.priority}
              </span>
            )}
          </div>
          
          {/* Title */}
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: isMobile ? 'var(--text-lg)' : 'var(--text-xl)',
            fontWeight: 600,
            color: isDarkMode ? 'var(--headline)' : 'var(--text-primary)',
            marginBottom: 'var(--spacing-2)',
            lineHeight: 'var(--leading-tight)'
          }}>
            {solution?.title || `Solution ${index + 1}`}
          </h3>
          
          {/* Description */}
          <p style={{
            fontFamily: 'var(--font-text)',
            fontSize: 'var(--text-sm)',
            color: isDarkMode ? 'var(--text-muted-dark)' : 'var(--text-muted)',
            lineHeight: 'var(--leading-relaxed)'
          }}>
            {solution?.description || 'AI-generated solution based on your query'}
          </p>
        </div>
        
        {/* Confidence Score */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minWidth: '80px'
        }}>
          <div style={{
            position: 'relative',
            width: '60px',
            height: '60px'
          }}>
            <svg
              style={{ 
                transform: 'rotate(-90deg)',
                width: '60px',
                height: '60px'
              }}
            >
              <circle
                cx="30"
                cy="30"
                r="26"
                fill="none"
                stroke={isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                strokeWidth="4"
              />
              <circle
                cx="30"
                cy="30"
                r="26"
                fill="none"
                stroke={confidence.color}
                strokeWidth="4"
                strokeDasharray={`${(solution?.confidence || 75) * 1.63} 163`}
                strokeLinecap="round"
              />
            </svg>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontFamily: 'var(--font-text)',
              fontSize: 'var(--text-lg)',
              fontWeight: 700,
              color: confidence.color
            }}>
              {solution?.confidence || 75}%
            </div>
          </div>
          <span style={{
            fontSize: '10px',
            color: isDarkMode ? 'var(--text-muted-dark)' : 'var(--text-muted)',
            marginTop: 'var(--spacing-1)',
            textAlign: 'center'
          }}>
            {confidence.label}
          </span>
        </div>
      </div>
      
      {/* Quick Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: 'var(--spacing-3)',
        marginBottom: 'var(--spacing-4)',
        padding: 'var(--spacing-3)',
        background: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.02)',
        borderRadius: 'var(--radius-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
          <Clock size={14} style={{ color: confidence.color }} />
          <div>
            <div style={{ fontSize: '11px', color: isDarkMode ? 'var(--text-muted-dark)' : 'var(--text-muted)' }}>
              Time
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: isDarkMode ? 'var(--headline)' : 'var(--text-primary)' }}>
              {metrics.timeToImplement}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
          <DollarSign size={14} style={{ color: confidence.color }} />
          <div>
            <div style={{ fontSize: '11px', color: isDarkMode ? 'var(--text-muted-dark)' : 'var(--text-muted)' }}>
              Savings
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: isDarkMode ? 'var(--headline)' : 'var(--text-primary)' }}>
              {metrics.costSavings}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
          <TrendingUp size={14} style={{ color: confidence.color }} />
          <div>
            <div style={{ fontSize: '11px', color: isDarkMode ? 'var(--text-muted-dark)' : 'var(--text-muted)' }}>
              Success
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: isDarkMode ? 'var(--headline)' : 'var(--text-primary)' }}>
              {metrics.successRate}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
          <Shield size={14} style={{ color: confidence.color }} />
          <div>
            <div style={{ fontSize: '11px', color: isDarkMode ? 'var(--text-muted-dark)' : 'var(--text-muted)' }}>
              Risk
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: isDarkMode ? 'var(--headline)' : 'var(--text-primary)' }}>
              {metrics.riskLevel}
            </div>
          </div>
        </div>
      </div>
      
      {/* Expand/Collapse Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          padding: 'var(--spacing-3)',
          background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
          border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)'}`,
          borderRadius: 'var(--radius-md)',
          color: isDarkMode ? 'var(--headline)' : 'var(--text-primary)',
          fontFamily: 'var(--font-text)',
          fontSize: 'var(--text-sm)',
          fontWeight: 500,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--spacing-2)',
          transition: 'all var(--transition-fast)'
        }}
        aria-expanded={isExpanded}
        aria-label={isExpanded ? 'Collapse solution details' : 'Expand solution details'}
      >
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        {isExpanded ? 'Hide Details' : 'View Implementation Steps'}
      </button>
      
      {/* Expanded Content */}
      {isExpanded && (
        <div style={{
          marginTop: 'var(--spacing-4)',
          padding: 'var(--spacing-4)',
          background: isDarkMode ? 'rgba(0, 0, 0, 0.15)' : 'rgba(0, 0, 0, 0.02)',
          borderRadius: 'var(--radius-md)',
          animation: 'slideInUp 0.3s var(--easing-smooth)'
        }}>
          {/* Implementation Steps */}
          {solution?.steps && solution.steps.length > 0 && (
            <div style={{ marginBottom: 'var(--spacing-4)' }}>
              <h4 style={{
                fontFamily: 'var(--font-text)',
                fontSize: 'var(--text-base)',
                fontWeight: 600,
                color: isDarkMode ? 'var(--headline)' : 'var(--text-primary)',
                marginBottom: 'var(--spacing-3)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-2)'
              }}>
                <Wrench size={16} />
                Implementation Steps
              </h4>
              <ol style={{ 
                marginLeft: 'var(--spacing-5)',
                listStyleType: 'decimal'
              }}>
                {solution.steps.map((step, i) => (
                  <li key={i} style={{
                    marginBottom: 'var(--spacing-2)',
                    color: isDarkMode ? 'var(--text-muted-dark)' : 'var(--text-muted)',
                    fontSize: 'var(--text-sm)',
                    lineHeight: 'var(--leading-relaxed)'
                  }}>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}
          
          {/* Parts Needed */}
          {solution?.partsNeeded && solution.partsNeeded.length > 0 && (
            <div style={{ marginBottom: 'var(--spacing-4)' }}>
              <h4 style={{
                fontFamily: 'var(--font-text)',
                fontSize: 'var(--text-base)',
                fontWeight: 600,
                color: isDarkMode ? 'var(--headline)' : 'var(--text-primary)',
                marginBottom: 'var(--spacing-3)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-2)'
              }}>
                <FileText size={16} />
                Required Parts/Documents
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-2)' }}>
                {solution.partsNeeded.map((part, i) => (
                  <span key={i} style={{
                    padding: 'var(--spacing-1) var(--spacing-3)',
                    background: isDarkMode ? 'rgba(74, 144, 226, 0.2)' : 'rgba(0, 112, 255, 0.1)',
                    border: `1px solid ${isDarkMode ? 'rgba(74, 144, 226, 0.3)' : 'rgba(0, 112, 255, 0.2)'}`,
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--text-xs)',
                    color: isDarkMode ? 'var(--steel-blue)' : 'var(--maritime-blue)'
                  }}>
                    {part}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: 'var(--spacing-3)',
            flexWrap: 'wrap',
            paddingTop: 'var(--spacing-3)',
            borderTop: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)'}`
          }}>
            <button
              onClick={() => handleAction('implement')}
              disabled={isImplementing}
              style={{
                flex: isMobile ? '1' : 'initial',
                padding: 'var(--spacing-2) var(--spacing-4)',
                background: isImplementing 
                  ? '#6b7280'
                  : isDarkMode 
                    ? 'linear-gradient(135deg, var(--opulent-gold) 0%, #e6c574 100%)'
                    : 'linear-gradient(135deg, var(--maritime-blue) 0%, #4da6ff 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-text)',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                cursor: isImplementing ? 'not-allowed' : 'pointer',
                transition: 'all var(--transition-fast)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--spacing-2)'
              }}
            >
              {isImplementing ? (
                <>
                  <div style={{
                    width: '14px',
                    height: '14px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid #ffffff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Implementing...
                </>
              ) : (
                <>
                  <CheckCircle size={14} />
                  Start Implementation
                </>
              )}
            </button>
            
            <button
              onClick={() => handleAction('schedule')}
              style={{
                padding: 'var(--spacing-2) var(--spacing-4)',
                background: 'transparent',
                border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
                borderRadius: 'var(--radius-md)',
                color: isDarkMode ? 'var(--headline)' : 'var(--text-primary)',
                fontFamily: 'var(--font-text)',
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              Schedule for Later
            </button>
          </div>
        </div>
      )}
      
      {/* Feedback Section */}
      <div style={{
        marginTop: 'var(--spacing-4)',
        paddingTop: 'var(--spacing-3)',
        borderTop: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span style={{
          fontSize: 'var(--text-xs)',
          color: isDarkMode ? 'var(--text-muted-dark)' : 'var(--text-muted)'
        }}>
          Was this solution helpful?
        </span>
        <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
          <button
            onClick={() => handleFeedback(true)}
            disabled={feedbackGiven !== null}
            style={{
              padding: 'var(--spacing-1) var(--spacing-3)',
              background: feedbackGiven === true 
                ? 'var(--success-green)' 
                : 'transparent',
              border: `1px solid ${feedbackGiven === true ? 'var(--success-green)' : isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
              borderRadius: 'var(--radius-md)',
              color: feedbackGiven === true 
                ? '#ffffff' 
                : isDarkMode ? 'var(--text-muted-dark)' : 'var(--text-muted)',
              fontSize: 'var(--text-xs)',
              cursor: feedbackGiven !== null ? 'default' : 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            👍 Yes
          </button>
          <button
            onClick={() => handleFeedback(false)}
            disabled={feedbackGiven !== null}
            style={{
              padding: 'var(--spacing-1) var(--spacing-3)',
              background: feedbackGiven === false 
                ? 'var(--error-red)' 
                : 'transparent',
              border: `1px solid ${feedbackGiven === false ? 'var(--error-red)' : isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
              borderRadius: 'var(--radius-md)',
              color: feedbackGiven === false 
                ? '#ffffff' 
                : isDarkMode ? 'var(--text-muted-dark)' : 'var(--text-muted)',
              fontSize: 'var(--text-xs)',
              cursor: feedbackGiven !== null ? 'default' : 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            👎 No
          </button>
        </div>
      </div>
    </div>
  );
}

// Test Component
export function EnhancedSolutionCardTest() {
  const [testResults, setTestResults] = useState([]);

  const mockSolution = {
    id: 'sol_001',
    title: 'Replace Hydraulic Pump Seal',
    description: 'The hydraulic pump is showing signs of seal degradation. This solution involves replacing the main seal to prevent fluid leakage and maintain system pressure.',
    confidence: 92,
    priority: 'high',
    estimatedTime: '45-60 min',
    costSavings: '$3,200/month',
    successRate: '96%',
    riskLevel: 'Low',
    steps: [
      'Shut down hydraulic system and release pressure',
      'Drain hydraulic fluid from pump reservoir',
      'Remove pump housing bolts (8x M12)',
      'Extract old seal using seal puller tool',
      'Clean seal housing with approved solvent',
      'Install new seal with proper orientation',
      'Reassemble pump housing with new gasket',
      'Refill with hydraulic fluid and test'
    ],
    partsNeeded: [
      'Seal Kit #HP-2847',
      'Hydraulic Fluid (5L)',
      'Housing Gasket',
      'Service Manual PDF'
    ],
    source: 'Maintenance Database'
  };

  const runTests = () => {
    const tests = [];
    
    // Test rendering
    const card = document.querySelector('.enhanced-solution-card');
    tests.push({
      name: 'Card renders',
      passed: card !== null,
      details: card ? 'Card element found' : 'Card not found'
    });
    
    // Test confidence display
    const confidenceElements = document.querySelectorAll('svg circle');
    tests.push({
      name: 'Confidence indicator displayed',
      passed: confidenceElements.length > 0,
      details: `Found ${confidenceElements.length} SVG elements`
    });
    
    // Test expand functionality
    const expandButton = document.querySelector('[aria-expanded]');
    tests.push({
      name: 'Expand button present',
      passed: expandButton !== null,
      details: expandButton ? 'Button found with ARIA attributes' : 'Button not found'
    });
    
    setTestResults(tests);
  };

  return (
    <div style={{ padding: '20px', background: '#f3f4f6', borderRadius: '8px' }}>
      <h3>EnhancedSolutionCard Test Suite</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>Light Mode</h4>
        <EnhancedSolutionCard
          solution={mockSolution}
          index={0}
          isDarkMode={false}
          isMobile={false}
          onFeedback={(data) => console.log('Feedback:', data)}
          onActionClick={(action, solution) => console.log('Action:', action, solution)}
        />
      </div>
      
      <div style={{ marginBottom: '20px', background: '#0a0e1a', padding: '20px', borderRadius: '8px' }}>
        <h4 style={{ color: '#fff' }}>Dark Mode - Mobile</h4>
        <EnhancedSolutionCard
          solution={mockSolution}
          index={0}
          isDarkMode={true}
          isMobile={true}
          onFeedback={(data) => console.log('Feedback:', data)}
          onActionClick={(action, solution) => console.log('Action:', action, solution)}
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
          cursor: 'pointer'
        }}
      >
        Run Tests
      </button>
      
      {testResults.length > 0 && (
        <div style={{ marginTop: '20px' }}>
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

export default EnhancedSolutionCard;