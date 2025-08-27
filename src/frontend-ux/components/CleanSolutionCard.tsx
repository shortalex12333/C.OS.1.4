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
  console.log('🎨 CleanSolutionCard rendering with solutions:', solutions);
  
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

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.75) return '#f59e0b'; // Orange for high confidence
    if (confidence >= 0.5) return '#f59e0b';  // Orange for medium
    return '#ef4444'; // Red for low
  };

  const formatConfidenceText = (confidence: number) => {
    const percentage = Math.round(confidence * 100);
    if (percentage >= 75) return 'high confidence';
    if (percentage >= 50) return 'medium confidence';
    return 'low confidence';
  };

  // Safety check
  if (!solutions || solutions.length === 0) {
    console.log('⚠️ No solutions to render');
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
            className={`rounded-lg border overflow-hidden transition-colors ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
            style={{
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
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
                    className={`text-lg font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                    style={{
                      fontFamily: 'Eloquia Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}
                  >
                    {solution.title}
                  </h3>
                  
                  {/* Orange Confidence Indicator */}
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: getConfidenceColor(confidence)
                    }}
                    title={formatConfidenceText(confidence)}
                  />
                </div>
                
                {/* Source Reference */}
                {solution.source_document && (
                  <div 
                    className={`text-sm flex items-center gap-2 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                    style={{
                      fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
                  <ChevronDown className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                ) : (
                  <ChevronRight className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                )}
              </div>
            </button>
            
            {/* Expanded Content */}
            {isExpanded && (
              <div className={`border-t px-6 pb-6 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                {/* Description */}
                {solution.description && (
                  <div 
                    className={`mt-4 mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    style={{
                      fontSize: '15px',
                      lineHeight: '24px',
                      fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 transition-colors"
                    style={{
                      fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
                    className={`p-2 rounded-md transition-colors hover:bg-opacity-80 ${
                      isDarkMode 
                        ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
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