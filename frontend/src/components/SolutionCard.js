import React, { useState } from 'react';

// Basic Solution Card Component for MVP
export function SolutionCard({ solution, index }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Validate solution object
  if (!solution) {
    console.warn('SolutionCard: No solution provided');
    return null;
  }
  
  // Get confidence color
  const getConfidenceColor = (score) => {
    const numScore = typeof score === 'number' ? score : 0.5;
    if (numScore >= 0.8) return '#22c55e'; // green
    if (numScore >= 0.5) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  return (
    <div 
      className="solution-card"
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px',
        backgroundColor: isExpanded ? '#f9fafb' : '#ffffff',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
            {solution.title || `Solution ${index + 1}`}
          </h3>
          
          {/* Source document */}
          {solution.source && (
            <div style={{ 
              fontSize: '13px', 
              color: '#6b7280',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#f3f4f6',
              padding: '4px 8px',
              borderRadius: '4px'
            }}>
              📄 {solution.source.title || 'Technical Manual'}
              {solution.source.page && ` - Page ${solution.source.page}`}
              {solution.source.revision && ` (Rev ${solution.source.revision})`}
            </div>
          )}
        </div>
        
        {/* Confidence indicator */}
        <div 
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: getConfidenceColor(solution.confidence_score || 0.5),
            flexShrink: 0
          }}
          title={`${Math.round((solution.confidence_score || 0.5) * 100)}% confidence`}
        />
      </div>

      {/* Expandable content */}
      {isExpanded && (
        <div style={{ marginTop: '16px' }}>
          {/* Steps */}
          {solution.steps && solution.steps.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                Steps:
              </h4>
              <ul style={{ marginLeft: '20px' }}>
                {solution.steps.map((step, idx) => {
                  // Handle both string and object step formats
                  const stepText = typeof step === 'string' ? step : (step.text || '');
                  const stepType = typeof step === 'object' ? step.type : 'normal';
                  const isBold = typeof step === 'object' ? step.isBold : false;
                  
                  return (
                    <li key={idx} style={{ 
                      marginBottom: '8px',
                      fontSize: '14px',
                      color: '#374151'
                    }}>
                      {/* Step type icon */}
                      {stepType === 'warning' && '⚠️ '}
                      {stepType === 'tip' && '💡 '}
                      {stepType === 'normal' && '✓ '}
                      <span style={{ fontWeight: isBold ? 'bold' : 'normal' }}>
                        {stepText}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Procedure link */}
          {solution.procedure_link && (
            <div style={{ marginTop: '12px' }}>
              <a 
                href={solution.procedure_link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  color: '#3b82f6',
                  fontSize: '14px',
                  textDecoration: 'none'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                🔗 View full procedure
              </a>
            </div>
          )}

          {/* MVP Feedback placeholder */}
          <div style={{ 
            marginTop: '16px', 
            paddingTop: '16px',
            borderTop: '1px solid #e5e7eb',
            fontSize: '13px',
            color: '#9ca3af'
          }}>
            [Feedback system will connect to: /webhook/solution-feedback]
          </div>
        </div>
      )}
    </div>
  );
}