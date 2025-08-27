import React from 'react';
import { DynamicFAQSuggestions } from './DynamicFAQSuggestions';

interface PreloadedQuestionsProps {
  onQuestionClick: (question: string) => void;
  isDarkMode?: boolean;
  isMobile?: boolean;
}

export function PreloadedQuestions({ onQuestionClick, isDarkMode = false, isMobile = false }: PreloadedQuestionsProps) {
  return (
    <div className="preloaded-questions-container">
      <DynamicFAQSuggestions
        onQuestionClick={onQuestionClick}
        isDarkMode={isDarkMode}
        isMobile={isMobile}
        maxSuggestions={3}
        showCategories={true}
      />
    </div>
  );
}