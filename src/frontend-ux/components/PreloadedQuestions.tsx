import React from 'react';
import { DynamicFAQSuggestions } from './DynamicFAQSuggestions';

interface PreloadedQuestionsProps {
  onQuestionClick: (question: string) => void;
  isDarkMode?: boolean;
  isMobile?: boolean;
  searchType?: 'yacht' | 'email' | 'email-yacht';
}

export function PreloadedQuestions({ onQuestionClick, isDarkMode = false, isMobile = false, searchType = 'yacht' }: PreloadedQuestionsProps) {
  return (
    <div className="preloaded-questions-container">
      <DynamicFAQSuggestions
        onQuestionClick={onQuestionClick}
        isDarkMode={isDarkMode}
        isMobile={isMobile}
        maxSuggestions={3}
        showCategories={true}
        searchType={searchType}
      />
    </div>
  );
}