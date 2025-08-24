import React, { useState } from 'react';

// Basic Solution Card Component for MVP
export function SolutionCard({ solution, index }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Validate solution object
  if (!solution) {
    console.warn('SolutionCard: No solution provided');
    return null;
  }
  
  // Log the full solution object for debugging
  console.log(`📋 Solution Card ${index + 1} Data:`, {
    id: solution.id,
    title: solution.title,
    confidence_score: solution.confidence_score,
    source: solution.source,
    steps: solution.steps,
    procedure_link: solution.procedure_link,
    // Any additional fields that might come from yacht AI
    equipment: solution.equipment,
    fault_codes: solution.fault_codes,
    parts_required: solution.parts_required,
    estimated_time: solution.estimated_time,
    difficulty: solution.difficulty,
    tools_required: solution.tools_required,
    safety_warnings: solution.safety_warnings,
    // Full raw solution object
    raw: solution
  });
  
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

          {/* Additional yacht-specific fields */}
          {(solution.equipment || solution.fault_codes || solution.parts_required || solution.tools_required) && (
            <div style={{ 
              marginTop: '12px', 
              paddingTop: '12px',
              borderTop: '1px solid #e5e7eb'
            }}>
              {solution.equipment && (
                <div style={{ marginBottom: '8px', fontSize: '13px' }}>
                  <strong>Equipment:</strong> {Array.isArray(solution.equipment) ? solution.equipment.join(', ') : solution.equipment}
                </div>
              )}
              {solution.fault_codes && (
                <div style={{ marginBottom: '8px', fontSize: '13px' }}>
                  <strong>Fault Codes:</strong> {Array.isArray(solution.fault_codes) ? solution.fault_codes.join(', ') : solution.fault_codes}
                </div>
              )}
              {solution.parts_required && (
                <div style={{ marginBottom: '8px', fontSize: '13px' }}>
                  <strong>Parts Required:</strong> {Array.isArray(solution.parts_required) ? solution.parts_required.join(', ') : solution.parts_required}
                </div>
              )}
              {solution.tools_required && (
                <div style={{ marginBottom: '8px', fontSize: '13px' }}>
                  <strong>Tools Required:</strong> {Array.isArray(solution.tools_required) ? solution.tools_required.join(', ') : solution.tools_required}
                </div>
              )}
              {solution.estimated_time && (
                <div style={{ marginBottom: '8px', fontSize: '13px' }}>
                  <strong>Estimated Time:</strong> {solution.estimated_time}
                </div>
              )}
              {solution.difficulty && (
                <div style={{ marginBottom: '8px', fontSize: '13px' }}>
                  <strong>Difficulty:</strong> {solution.difficulty}
                </div>
              )}
            </div>
          )}

          {/* Debug: Show ALL fields in the solution object */}
          <div style={{ 
            marginTop: '16px', 
            paddingTop: '16px',
            borderTop: '1px solid #e5e7eb',
            fontSize: '11px',
            color: '#6b7280',
            backgroundColor: '#f9fafb',
            padding: '8px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all'
          }}>
            <strong>DEBUG - Raw JSON:</strong><br/>
            {JSON.stringify(solution, null, 2)}
          </div>

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