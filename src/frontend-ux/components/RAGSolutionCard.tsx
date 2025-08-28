import React, { useState } from 'react';
import { ChevronDown, ChevronRight, ExternalLink, Copy } from 'lucide-react';

interface RAGSolution {
  id: string;
  title: string;
  confidence: 'low' | 'medium' | 'high';
  source: {
    title: string;
    page?: number;
  };
  content: string;
}

interface RAGSolutionCardProps {
  solutions: RAGSolution[];
  isDarkMode?: boolean;
}

export function RAGSolutionCard({ solutions, isDarkMode = false }: RAGSolutionCardProps) {
  const [expandedSolutions, setExpandedSolutions] = useState<Set<string>>(new Set([solutions[0]?.id]));

  const toggleSolution = (solutionId: string) => {
    const newExpanded = new Set(expandedSolutions);
    if (newExpanded.has(solutionId)) {
      newExpanded.delete(solutionId);
    } else {
      newExpanded.add(solutionId);
    }
    setExpandedSolutions(newExpanded);
  };

  return (
    <div 
      className="w-full rounded-xl shadow-sm overflow-hidden"
      style={{
        backgroundColor: 'var(--solution-card-bg)',
        border: `1px solid var(--solution-card-border)`
      }}
    >
      {solutions.map((solution, index) => {
        const isExpanded = expandedSolutions.has(solution.id);
        
        return (
          <div
            key={solution.id}
            className="transition-colors duration-200"
            style={{
              borderTop: index > 0 ? `1px solid var(--solution-card-border)` : 'none',
              backgroundColor: isExpanded 
                ? (isDarkMode ? 'rgba(99, 110, 255, 0.1)' : 'rgba(59, 130, 246, 0.05)')
                : 'transparent'
            }}
            onMouseEnter={(e) => {
              if (!isExpanded) {
                e.currentTarget.style.backgroundColor = 'var(--solution-card-bg-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isExpanded) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            {/* Header */}
            <button
              onClick={() => toggleSolution(solution.id)}
              className="w-full p-4 text-left flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 
                    className="font-medium"
                    style={{
                      fontSize: '16px',
                      lineHeight: '24px',
                      fontFamily: 'Eloquia Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      color: 'var(--solution-title-color)'
                    }}
                  >
                    {solution.title}
                  </h3>
                  
                  <span 
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                      fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      background: solution.confidence === 'high' 
                        ? 'var(--confidence-high-bg)' 
                        : solution.confidence === 'medium'
                        ? 'var(--confidence-medium-bg)'
                        : 'var(--confidence-low-bg)',
                      color: solution.confidence === 'high' 
                        ? 'var(--confidence-high-text)' 
                        : solution.confidence === 'medium'
                        ? 'var(--confidence-medium-text)'
                        : 'var(--confidence-low-text)',
                      border: `1px solid ${
                        solution.confidence === 'high' 
                          ? 'var(--confidence-high-border)' 
                          : solution.confidence === 'medium'
                          ? 'var(--confidence-medium-border)'
                          : 'var(--confidence-low-border)'
                      }`
                    }}
                  >
                    {solution.confidence} confidence
                  </span>
                </div>
                
                <div 
                  className="text-sm flex items-center gap-1"
                  style={{
                    fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    color: 'var(--solution-secondary-color)'
                  }}
                >
                  <ExternalLink className="w-3 h-3" />
                  {solution.source.title}
                  {solution.source.page && ` (p. ${solution.source.page})`}
                </div>
              </div>
              
              <div className="ml-4">
                {isExpanded ? (
                  <ChevronDown 
                    className="w-5 h-5"
                    style={{ color: 'var(--solution-secondary-color)' }}
                  />
                ) : (
                  <ChevronRight 
                    className="w-5 h-5"
                    style={{ color: 'var(--solution-secondary-color)' }}
                  />
                )}
              </div>
            </button>
            
            {/* Expanded Content */}
            {isExpanded && (
              <div className="px-4 pb-4">
                <div 
                  style={{
                    borderTop: `1px solid var(--solution-card-border)`,
                    paddingTop: '16px'
                  }}
                >
                  <div 
                    className="mb-4"
                    style={{
                      fontSize: '15px',
                      lineHeight: '24px',
                      fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      color: 'var(--solution-text-color)'
                    }}
                  >
                    {solution.content}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <button
                      className="text-sm font-medium flex items-center gap-1 transition-colors"
                      style={{
                        fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        color: 'var(--solution-link-color)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--solution-link-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--solution-link-color)';
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                      View source
                    </button>
                    
                    <button
                      className="p-2 rounded-md transition-colors"
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
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}