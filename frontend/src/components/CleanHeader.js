import React from 'react';
import { ChevronDown, Zap, Target, Wind } from 'lucide-react';
import { DESIGN_TOKENS } from '../styles/design-system.js';

/**
 * Clean Header - Based on UPDATE UX MainHeader template
 * Simple, white design with model selector
 */
export function CleanHeader({ 
  user = null, 
  activeConversation = null, 
  isSending = false,
  selectedModel = 'power',
  onModelChange = () => {}
}) {
  
  const models = [
    {
      id: 'power',
      name: 'Power',
      description: 'Our most advanced model',
      icon: Zap
    },
    {
      id: 'reach',
      name: 'Reach', 
      description: 'Get more thorough answers',
      icon: Target
    },
    {
      id: 'air',
      name: 'Air',
      description: 'Fastest model, for simple tasks',
      icon: Wind
    }
  ];

  const selectedModelData = models.find(m => m.id === selectedModel);
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    return 'Evening';
  };

  const displayName = user?.displayName || user?.name || 'User';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center', 
      justifyContent: 'center',
      padding: DESIGN_TOKENS.spacing.lg,
      backgroundColor: DESIGN_TOKENS.colors.background,
      borderBottom: `1px solid ${DESIGN_TOKENS.colors.border}`,
      minHeight: '72px'
    }}>
      
      {/* Center - CelesteOS Branding */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 400,
          lineHeight: '28px',
          fontFamily: DESIGN_TOKENS.typography.family,
          color: DESIGN_TOKENS.colors.text.primary,
          margin: 0,
          marginBottom: DESIGN_TOKENS.spacing.xs
        }}>
          Celeste
          <span style={{
            color: DESIGN_TOKENS.colors.accent,
            fontWeight: 500
          }}>
            OS
          </span>
        </h1>
        
        {/* Welcome message or current model */}
        {!activeConversation ? (
          <div style={{
            fontSize: DESIGN_TOKENS.typography.sizes.body,
            color: DESIGN_TOKENS.colors.text.secondary,
            fontFamily: DESIGN_TOKENS.typography.family
          }}>
            {getTimeBasedGreeting()}, {displayName}
          </div>
        ) : (
          <div style={{
            fontSize: DESIGN_TOKENS.typography.sizes.caption,
            color: DESIGN_TOKENS.colors.text.muted,
            fontFamily: DESIGN_TOKENS.typography.family,
            textTransform: 'uppercase',
            letterSpacing: '1.2px'
          }}>
            {selectedModel.toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}

export default CleanHeader;