import React, { useState } from 'react';
import { Send, Loader } from 'lucide-react';
import { DESIGN_TOKENS } from '../styles/design-system.js';

/**
 * Clean Chat Input - Based on UPDATE UX template
 * Simple, white design with subtle borders
 */
export function CleanChatInput({ onSendMessage, isSending = false, placeholder = "Send a message...", value, onChange }) {
  const [localMessage, setLocalMessage] = useState('');
  
  // Use controlled value if provided, otherwise use local state
  const message = value !== undefined ? value : localMessage;
  const handleMessageChange = (e) => {
    if (onChange) {
      onChange(e);
    } else {
      setLocalMessage(e.target.value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isSending) {
      onSendMessage(message.trim());
      // Only clear local state if we're managing it locally
      if (onChange) {
        onChange({ target: { value: '' } });
      } else {
        setLocalMessage('');
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div style={{
      maxWidth: '760px',
      margin: '0 auto',
      padding: DESIGN_TOKENS.spacing.lg
    }}>
      <form onSubmit={handleSubmit}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: DESIGN_TOKENS.spacing.sm,
          padding: DESIGN_TOKENS.spacing.md,
          backgroundColor: DESIGN_TOKENS.colors.background,
          border: `1px solid ${DESIGN_TOKENS.colors.border}`,
          borderRadius: DESIGN_TOKENS.radius.lg,
          minHeight: '56px',
          boxShadow: DESIGN_TOKENS.shadows.sm
        }}>
          <textarea
            value={message}
            onChange={handleMessageChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isSending}
            rows={1}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              resize: 'none',
              backgroundColor: 'transparent',
              fontSize: DESIGN_TOKENS.typography.sizes.body,
              fontFamily: DESIGN_TOKENS.typography.family,
              color: DESIGN_TOKENS.colors.text.primary,
              lineHeight: 1.5
            }}
          />
          
          <button
            type="submit"
            disabled={!message.trim() || isSending}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              backgroundColor: message.trim() && !isSending 
                ? DESIGN_TOKENS.colors.accent 
                : DESIGN_TOKENS.colors.text.muted,
              color: '#ffffff',
              border: 'none',
              borderRadius: DESIGN_TOKENS.radius.sm,
              cursor: message.trim() && !isSending ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease'
            }}
          >
            {isSending ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CleanChatInput;