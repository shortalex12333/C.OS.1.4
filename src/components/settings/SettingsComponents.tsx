import React from 'react';
import { ChevronDown } from 'lucide-react';

// =====================================================
// UNIFIED DESIGN SYSTEM - CLEAN AND CONSISTENT
// =====================================================

const DESIGN_TOKENS = {
  // Colors - Simple, clean palette
  colors: {
    background: '#ffffff',
    backgroundSecondary: '#f8f9fa',
    border: '#e9ecef',
    text: {
      primary: '#212529',
      secondary: '#6c757d',
      muted: '#adb5bd'
    },
    accent: '#0d6efd',
    input: {
      background: '#ffffff',
      border: '#ced4da',
      focus: '#0d6efd'
    }
  },
  // Typography - Consistent hierarchy
  typography: {
    sizes: {
      header: '24px',
      subheader: '16px',
      body: '14px',
      caption: '12px'
    },
    weights: {
      normal: '400',
      medium: '500',
      semibold: '600'
    },
    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  // Spacing - 8px grid system
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  },
  // Border radius - Consistent rounding
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px'
  }
};

// =====================================================
// SECTION HEADER COMPONENT
// =====================================================
interface SectionHeaderProps {
  title: string;
}

export const SectionHeader = ({ title }: SectionHeaderProps) => (
  <div style={{ marginBottom: DESIGN_TOKENS.spacing.lg }}>
    <h2 
      style={{
        fontSize: DESIGN_TOKENS.typography.sizes.header,
        fontWeight: DESIGN_TOKENS.typography.weights.semibold,
        color: DESIGN_TOKENS.colors.text.primary,
        fontFamily: DESIGN_TOKENS.typography.family,
        margin: 0,
        lineHeight: 1.2
      }}
    >
      {title}
    </h2>
  </div>
);

// =====================================================
// SETTINGS ROW COMPONENT - CLEAN AND SIMPLE
// =====================================================
interface SettingsRowProps {
  label: string;
  value: string;
  isEditable?: boolean;
  onChange?: (value: string) => void;
  type?: 'text' | 'select';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export const SettingsRow = ({ 
  label, 
  value, 
  isEditable = false,
  onChange,
  type = 'text',
  options,
  placeholder
}: SettingsRowProps) => (
  <div 
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `${DESIGN_TOKENS.spacing.md} 0`,
      borderBottom: `1px solid ${DESIGN_TOKENS.colors.border}`,
      minHeight: '56px'
    }}
  >
    {/* Label */}
    <div 
      style={{
        fontSize: DESIGN_TOKENS.typography.sizes.body,
        fontWeight: DESIGN_TOKENS.typography.weights.normal,
        color: DESIGN_TOKENS.colors.text.primary,
        fontFamily: DESIGN_TOKENS.typography.family,
        minWidth: '120px',
        marginRight: DESIGN_TOKENS.spacing.md
      }}
    >
      {label}
    </div>
    
    {/* Value/Input */}
    <div style={{ 
      flex: 1, 
      maxWidth: '200px',
      textAlign: 'right'
    }}>
      {isEditable ? (
        type === 'select' && options ? (
          <div style={{ position: 'relative' }}>
            <select
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              style={{
                appearance: 'none',
                background: DESIGN_TOKENS.colors.input.background,
                border: `1px solid ${DESIGN_TOKENS.colors.input.border}`,
                borderRadius: DESIGN_TOKENS.radius.sm,
                padding: `${DESIGN_TOKENS.spacing.sm} ${DESIGN_TOKENS.spacing.lg} ${DESIGN_TOKENS.spacing.sm} ${DESIGN_TOKENS.spacing.sm}`,
                fontSize: DESIGN_TOKENS.typography.sizes.body,
                fontFamily: DESIGN_TOKENS.typography.family,
                color: DESIGN_TOKENS.colors.text.primary,
                width: '100%',
                cursor: 'pointer',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = DESIGN_TOKENS.colors.accent;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = DESIGN_TOKENS.colors.input.border;
              }}
            >
              {options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown 
              className="w-4 h-4" 
              style={{
                position: 'absolute',
                right: DESIGN_TOKENS.spacing.sm,
                top: '50%',
                transform: 'translateY(-50%)',
                color: DESIGN_TOKENS.colors.text.muted,
                pointerEvents: 'none'
              }}
            />
          </div>
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            style={{
              background: DESIGN_TOKENS.colors.input.background,
              border: `1px solid ${DESIGN_TOKENS.colors.input.border}`,
              borderRadius: DESIGN_TOKENS.radius.sm,
              padding: `${DESIGN_TOKENS.spacing.sm} ${DESIGN_TOKENS.spacing.sm}`,
              fontSize: DESIGN_TOKENS.typography.sizes.body,
              fontFamily: DESIGN_TOKENS.typography.family,
              color: DESIGN_TOKENS.colors.text.primary,
              width: '100%',
              outline: 'none',
              textAlign: 'right',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = DESIGN_TOKENS.colors.accent;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = DESIGN_TOKENS.colors.input.border;
            }}
          />
        )
      ) : (
        <div 
          style={{
            fontSize: DESIGN_TOKENS.typography.sizes.body,
            fontFamily: DESIGN_TOKENS.typography.family,
            color: DESIGN_TOKENS.colors.text.secondary,
            textAlign: 'right'
          }}
        >
          {value}
        </div>
      )}
    </div>
  </div>
);

// =====================================================
// SETTINGS SECTION CONTAINER
// =====================================================
interface SettingsSectionProps {
  children: React.ReactNode;
}

export const SettingsSection = ({ children }: SettingsSectionProps) => (
  <div 
    style={{
      background: DESIGN_TOKENS.colors.background,
      border: `1px solid ${DESIGN_TOKENS.colors.border}`,
      borderRadius: DESIGN_TOKENS.radius.md,
      padding: DESIGN_TOKENS.spacing.lg,
      marginBottom: DESIGN_TOKENS.spacing.lg
    }}
  >
    {children}
  </div>
);