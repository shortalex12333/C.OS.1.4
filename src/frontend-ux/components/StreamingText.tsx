import React, { useState, useEffect } from 'react';

interface StreamingTextProps {
  text: string;
  delay?: number;
  onComplete?: () => void;
  isStreaming?: boolean;
}

export function StreamingText({ 
  text, 
  delay = 30, // Smooth delay like ChatGPT/Claude
  onComplete,
  isStreaming = true 
}: StreamingTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isStreaming) {
      setDisplayedText(text);
      setCurrentIndex(text.length);
      return;
    }

    // Reset when text changes
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text, isStreaming]);

  useEffect(() => {
    if (!isStreaming || currentIndex >= text.length) {
      if (currentIndex >= text.length && onComplete) {
        onComplete();
      }
      return;
    }

    const timer = setTimeout(() => {
      // Add next character
      setDisplayedText(prev => prev + text.charAt(currentIndex));
      setCurrentIndex(prev => prev + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [currentIndex, text, delay, onComplete, isStreaming]);

  return (
    <span style={{ whiteSpace: 'pre-wrap' }}>
      {displayedText}
      {isStreaming && currentIndex < text.length && (
        <span 
          style={{
            display: 'inline-block',
            width: '8px',
            height: '16px',
            backgroundColor: 'currentColor',
            marginLeft: '2px',
            animation: 'blink 1s infinite',
            verticalAlign: 'text-bottom'
          }}
        />
      )}
    </span>
  );
}