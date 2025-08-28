import React, { useState } from 'react';
import { ChevronDown, ChevronRight, ExternalLink, Copy } from 'lucide-react';

interface SolutionCardProps {
  solutions: Array<{
    solution_id?: string;
    id?: string;
    title: string;
    description?: string;
    confidence?: number;
    steps?: string[];
    parts_needed?: string[];
    estimated_time?: string;
    safety_warnings?: string[];
    original_doc_url?: string;
    source_document?: {
      fault_code?: string;
      equipment?: string;
      manufacturer?: string;
    };
  }>;
  isDarkMode?: boolean;
}

export function CleanSolutionCard({ solutions, isDarkMode = false }: SolutionCardProps) {
  const [expandedSolutions, setExpandedSolutions] = useState<Set<string>>(
    new Set() // Collapsed by default
  );

  const toggleSolution = (solutionId: string) => {
    const newExpanded = new Set(expandedSolutions);
    if (newExpanded.has(solutionId)) {
      newExpanded.delete(solutionId);
    } else {
      newExpanded.add(solutionId);
    }
    setExpandedSolutions(newExpanded);
  };

  const getConfidenceColor = (confidence: number, isDarkMode: boolean = false) => {
    if (confidence >= 0.75) {
      // High confidence - Green (premium)
      return isDarkMode ? '#10b981' : '#059669';
    }
    if (confidence >= 0.5) {
      // Medium confidence - Amber (premium) 
      return isDarkMode ? '#f59e0b' : '#d97706';
    }
    // Low confidence - Red (premium)
    return isDarkMode ? '#ef4444' : '#dc2626';
  };

  const formatConfidenceText = (confidence: number) => {
    const percentage = Math.round(confidence * 100);
    if (percentage >= 75) return 'high confidence';
    if (percentage >= 50) return 'medium confidence';
    return 'low confidence';
  };

  // Safety check
  if (!solutions || solutions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {solutions.map((solution, index) => {
        const solutionId = solution.solution_id || solution.id || `solution_${index}`;
        const isExpanded = expandedSolutions.has(solutionId);
        const confidence = solution.confidence || 0.5;
        
        return (
          <div
            key={solutionId}
            className="rounded-lg border overflow-hidden transition-colors"
            style={{
              backgroundColor: 'var(--solution-card-bg)',
              borderColor: 'var(--solution-card-border)',
              boxShadow: 'var(--solution-card-shadow)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--solution-card-bg-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--solution-card-bg)';
            }}
          >
            {/* Header - Always Visible */}
            <button
              onClick={() => toggleSolution(solutionId)}
              className="w-full p-6 text-left flex items-center justify-between hover:bg-opacity-80 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 
                    className="text-lg font-semibold"
                    style={{
                      fontFamily: 'Eloquia Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      color: 'var(--solution-title-color)'
                    }}
                  >
                    {solution.title}
                  </h3>
                  
                  {/* Premium Confidence Indicator */}
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: getConfidenceColor(confidence, isDarkMode)
                    }}
                    title={formatConfidenceText(confidence)}
                  />
                </div>
                
                {/* Source Reference */}
                {solution.source_document && (
                  <div 
                    className="text-sm flex items-center gap-2"
                    style={{
                      fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      color: 'var(--solution-secondary-color)'
                    }}
                  >
                    <ExternalLink className="w-3 h-3" />
                    {solution.source_document.manufacturer} {solution.source_document.equipment}
                    {solution.source_document.fault_code && ` - ${solution.source_document.fault_code}`}
                  </div>
                )}
              </div>
              
              <div className="ml-4">
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5" style={{ color: 'var(--solution-secondary-color)' }} />
                ) : (
                  <ChevronRight className="w-5 h-5" style={{ color: 'var(--solution-secondary-color)' }} />
                )}
              </div>
            </button>
            
            {/* Expanded Content */}
            {isExpanded && (
              <div className="border-t px-6 pb-6" style={{ borderColor: 'var(--solution-card-border)' }}>
                {/* Description */}
                {solution.description && (
                  <div 
                    className="mt-4 mb-6"
                    style={{
                      fontSize: '15px',
                      lineHeight: '24px',
                      fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segue UI", Roboto, sans-serif',
                      color: 'var(--solution-text-color)'
                    }}
                  >
                    {solution.description}
                  </div>
                )}
                
                {/* Steps */}
                {solution.steps && solution.steps.length > 0 && (
                  <div className="mb-6">
                    <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Procedure:
                    </h4>
                    <ol className="space-y-2">
                      {solution.steps.map((step, stepIndex) => (
                        <li 
                          key={stepIndex}
                          className={`flex items-start gap-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                          style={{
                            fontSize: '15px',
                            lineHeight: '22px',
                            fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                          }}
                        >
                          <span className={`flex-shrink-0 w-6 h-6 rounded-full text-xs flex items-center justify-center font-medium ${
                            isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {stepIndex + 1}
                          </span>
                          <span className="flex-1">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Additional Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Estimated Time */}
                  {solution.estimated_time && (
                    <div>
                      <h5 className={`font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Estimated Time:
                      </h5>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {solution.estimated_time}
                      </p>
                    </div>
                  )}

                  {/* Parts Needed */}
                  {solution.parts_needed && solution.parts_needed.length > 0 && (
                    <div>
                      <h5 className={`font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Parts Needed:
                      </h5>
                      <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {solution.parts_needed.map((part, idx) => (
                          <li key={idx}>• {part}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Safety Warnings */}
                {solution.safety_warnings && solution.safety_warnings.length > 0 && (
                  <div className="mb-6 p-4 rounded-md bg-orange-50 border border-orange-200">
                    <h5 className="font-medium mb-2 text-orange-800 flex items-center gap-2">
                      ⚠️ Safety Warnings:
                    </h5>
                    <ul className="text-sm space-y-1 text-orange-700">
                      {solution.safety_warnings.map((warning, idx) => (
                        <li key={idx}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-4">
                  <a
                    href={solution.original_doc_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium flex items-center gap-1 transition-colors"
                    style={{
                      fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      color: isDarkMode ? '#818cf8' : '#3b82f6'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = isDarkMode ? '#a5b4fc' : '#2563eb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = isDarkMode ? '#818cf8' : '#3b82f6';
                    }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    View source document
                  </a>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const text = `${solution.title}\n\n${solution.steps?.join('\n') || solution.description || ''}`;
                      navigator.clipboard.writeText(text);
                    }}
                    className="p-2 rounded-md transition-colors hover:bg-opacity-80"
                    style={{
                      color: isDarkMode ? '#8892a0' : '#6b7280',
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = isDarkMode ? '#f0f2f5' : '#374151';
                      e.currentTarget.style.backgroundColor = isDarkMode ? '#252832' : '#f3f4f6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = isDarkMode ? '#8892a0' : '#6b7280';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    title="Copy solution"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}