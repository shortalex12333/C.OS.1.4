import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Switch } from '../ui/switch';
import { darkTheme } from '../../styles/darkModeTheme';

interface SectionHeaderProps {
  title: string;
  isMobile?: boolean;
  isDarkMode?: boolean;
}

export const SectionHeader = ({ title, isMobile = false, isDarkMode = false }: SectionHeaderProps) => (
  <div style={{ marginBottom: 'var(--spacing-6)' }}>
    <h2 
      style={{
        fontSize: isMobile ? '20px' : '22px',
        lineHeight: isMobile ? '26px' : '28px',
        fontWeight: '400',
        color: isDarkMode ? darkTheme.text.primary : '#1f2937',
        fontFamily: 'Eloquia Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        margin: '0'
      }}
    >
      {title}
    </h2>
  </div>
);

interface FormGroupProps {
  label: string;
  children: React.ReactNode;
  description?: string;
  isDarkMode?: boolean;
}

export const FormGroup = ({ label, children, description, isDarkMode = false }: FormGroupProps) => (
  <div style={{ marginBottom: 'var(--spacing-6)' }}>
    <label 
      style={{
        display: 'block',
        fontSize: '14px',
        lineHeight: '20px',
        fontWeight: '500',
        color: isDarkMode ? darkTheme.text.primary : '#374151',
        fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        marginBottom: 'var(--spacing-2)'
      }}
    >
      {label}
    </label>
    {children}
    {description && (
      <p 
        style={{
          fontSize: '13px',
          lineHeight: '18px',
          fontWeight: '400',
          color: isDarkMode ? darkTheme.text.secondary : '#6b7280',
          fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          marginTop: 'var(--spacing-1)',
          margin: '0'
        }}
      >
        {description}
      </p>
    )}
  </div>
);

interface AppleSettingsRowProps {
  label: string;
  value: string;
  isEditable?: boolean;
  onChange?: (value: string) => void;
  type?: 'text' | 'select';
  options?: { value: string; label: string }[];
  placeholder?: string;
  isMobile?: boolean;
  isDarkMode?: boolean;
}

export const AppleSettingsRow = ({ 
  label, 
  value, 
  isEditable = false,
  onChange,
  type = 'text',
  options,
  placeholder,
  isMobile = false,
  isDarkMode = false
}: AppleSettingsRowProps) => (
  <div 
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: isMobile ? 'var(--spacing-3) var(--spacing-4)' : 'var(--spacing-4)',
      borderBottom: isDarkMode ? `1px solid ${darkTheme.sidebar.border}` : '1px solid rgba(255, 255, 255, 0.2)',
      minHeight: isMobile ? '44px' : '48px',
      background: isDarkMode ? darkTheme.backgrounds.tertiary : 'rgba(255, 255, 255, 0.4)',
      backdropFilter: isDarkMode ? 'none' : 'blur(8px)',
      WebkitBackdropFilter: isDarkMode ? 'none' : 'blur(8px)',
      transition: 'all 0.2s ease'
    }}
  >
    <div 
      style={{
        fontSize: isMobile ? '14px' : '16px',
        lineHeight: '20px',
        fontWeight: '400',
        color: isDarkMode ? darkTheme.text.primary : '#1f2937',
        fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        flex: '0 0 auto',
        marginRight: 'var(--spacing-2)',
        minWidth: isMobile ? '120px' : '140px',
        whiteSpace: isMobile ? 'nowrap' : 'normal'
      }}
    >
      {label}
    </div>
    
    <div style={{ 
      flex: '1 1 auto', 
      textAlign: 'right', 
      maxWidth: isMobile ? '45%' : '60%', 
      position: 'relative',
      minWidth: '0'
    }}>
      {isEditable ? (
        type === 'select' && options ? (
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <select
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              style={{
                appearance: 'none',
                background: isDarkMode ? darkTheme.inputs.background : 'rgba(255, 255, 255, 0.6)',
                border: isDarkMode ? `1px solid ${darkTheme.inputs.border}` : '1px solid rgba(255, 255, 255, 0.3)',
                outline: 'none',
                fontSize: isMobile ? '13px' : '16px',
                lineHeight: '20px',
                fontWeight: '400',
                color: isDarkMode ? darkTheme.inputs.text : '#6b7280',
                fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                textAlign: 'right',
                cursor: 'pointer',
                width: '100%',
                padding: isMobile ? 'var(--spacing-1) var(--spacing-5) var(--spacing-1) var(--spacing-2)' : 'var(--spacing-2) var(--spacing-6) var(--spacing-2) var(--spacing-2)',
                borderRadius: '8px',
                backdropFilter: isDarkMode ? 'none' : 'blur(4px)',
                WebkitBackdropFilter: isDarkMode ? 'none' : 'blur(4px)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.background = isDarkMode ? darkTheme.inputs.backgroundFocus : 'rgba(255, 255, 255, 0.8)';
                e.target.style.color = isDarkMode ? darkTheme.inputs.textFocus : '#1f2937';
                e.target.style.borderColor = isDarkMode ? darkTheme.inputs.borderFocus : 'rgba(255, 255, 255, 0.5)';
                e.target.style.boxShadow = isDarkMode ? `${darkTheme.inputs.focusRing}, ${darkTheme.inputs.focusGlow}` : '0 0 0 2px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.background = isDarkMode ? darkTheme.inputs.background : 'rgba(255, 255, 255, 0.6)';
                e.target.style.color = isDarkMode ? darkTheme.inputs.text : '#6b7280';
                e.target.style.borderColor = isDarkMode ? darkTheme.inputs.border : 'rgba(255, 255, 255, 0.3)';
                e.target.style.boxShadow = 'none';
              }}
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown 
              style={{
                position: 'absolute',
                right: isMobile ? 'var(--spacing-1)' : 'var(--spacing-2)',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '16px',
                height: '16px',
                color: isDarkMode ? darkTheme.text.tertiary : '#6b7280',
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
              background: isDarkMode ? darkTheme.inputs.background : 'rgba(255, 255, 255, 0.6)',
              border: isDarkMode ? `1px solid ${darkTheme.inputs.border}` : '1px solid rgba(255, 255, 255, 0.3)',
              outline: 'none',
              fontSize: isMobile ? '13px' : '16px',
              lineHeight: '20px',
              fontWeight: '400',
              color: isDarkMode ? darkTheme.inputs.text : '#6b7280',
              fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              textAlign: 'right',
              width: '100%',
              padding: isMobile ? 'var(--spacing-1) var(--spacing-2)' : 'var(--spacing-2)',
              borderRadius: '8px',
              backdropFilter: isDarkMode ? 'none' : 'blur(4px)',
              WebkitBackdropFilter: isDarkMode ? 'none' : 'blur(4px)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
            onFocus={(e) => {
              e.target.style.background = isDarkMode ? darkTheme.inputs.backgroundFocus : 'rgba(255, 255, 255, 0.8)';
              e.target.style.color = isDarkMode ? darkTheme.inputs.textFocus : '#1f2937';
              e.target.style.borderColor = isDarkMode ? darkTheme.inputs.borderFocus : 'rgba(255, 255, 255, 0.5)';
              e.target.style.boxShadow = isDarkMode ? `${darkTheme.inputs.focusRing}, ${darkTheme.inputs.focusGlow}` : '0 0 0 2px rgba(59, 130, 246, 0.1)';
              e.target.style.transition = `all ${darkTheme.effects.timingFast} ${darkTheme.effects.easingDefault}`;
            }}
            onBlur={(e) => {
              e.target.style.background = isDarkMode ? darkTheme.inputs.background : 'rgba(255, 255, 255, 0.6)';
              e.target.style.color = isDarkMode ? darkTheme.inputs.text : '#6b7280';
              e.target.style.borderColor = isDarkMode ? darkTheme.inputs.border : 'rgba(255, 255, 255, 0.3)';
              e.target.style.boxShadow = 'none';
            }}
          />
        )
      ) : (
        <div 
          style={{
            fontSize: isMobile ? '13px' : '16px',
            lineHeight: '20px',
            fontWeight: '400',
            color: isDarkMode ? darkTheme.text.secondary : '#6b7280',
            fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            textAlign: 'right',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {value}
        </div>
      )}
    </div>
  </div>
);

interface SwitchRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  isMobile?: boolean;
  isDarkMode?: boolean;
}

export const SwitchRow = ({ 
  label, 
  description, 
  checked, 
  onCheckedChange,
  isMobile = false,
  isDarkMode = false
}: SwitchRowProps) => (
  <div 
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      padding: isMobile ? 'var(--spacing-3) var(--spacing-4)' : 'var(--spacing-4)',
      borderBottom: isDarkMode ? `1px solid ${darkTheme.sidebar.border}` : '1px solid rgba(255, 255, 255, 0.2)',
      minHeight: isMobile ? '44px' : '48px',
      background: isDarkMode ? darkTheme.backgrounds.tertiary : 'rgba(255, 255, 255, 0.4)',
      backdropFilter: isDarkMode ? 'none' : 'blur(8px)',
      WebkitBackdropFilter: isDarkMode ? 'none' : 'blur(8px)'
    }}
  >
    <div style={{ flex: 1, marginRight: 'var(--spacing-3)' }}>
      <div 
        style={{
          fontSize: isMobile ? '15px' : '16px',
          lineHeight: '20px',
          fontWeight: '400',
          color: isDarkMode ? darkTheme.text.primary : '#1f2937',
          fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          marginBottom: description ? 'var(--spacing-1)' : '0'
        }}
      >
        {label}
      </div>
      {description && (
        <div 
          style={{
            fontSize: isMobile ? '13px' : '14px',
            lineHeight: '18px',
            fontWeight: '400',
            color: isDarkMode ? darkTheme.text.secondary : '#6b7280',
            fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        >
          {description}
        </div>
      )}
    </div>
    <Switch
      checked={checked}
      onCheckedChange={onCheckedChange}
      style={{ flexShrink: 0 }}
    />
  </div>
);

interface UnifiedTextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  isDarkMode?: boolean;
}

export const UnifiedTextarea = ({ value, onChange, placeholder, rows = 4, isDarkMode = false }: UnifiedTextareaProps) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    style={{
      width: '100%',
      maxWidth: '400px',
      padding: 'var(--spacing-3)',
      fontSize: '16px',
      lineHeight: '24px',
      fontWeight: '400',
      color: isDarkMode ? darkTheme.inputs.text : '#1f2937',
      fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: isDarkMode ? darkTheme.inputs.background : 'rgba(255, 255, 255, 0.6)',
      border: isDarkMode ? `1px solid ${darkTheme.inputs.border}` : '1px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '8px',
      outline: 'none',
      resize: 'vertical',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box',
      minHeight: '100px',
      backdropFilter: isDarkMode ? 'none' : 'blur(4px)',
      WebkitBackdropFilter: isDarkMode ? 'none' : 'blur(4px)'
    }}
    onFocus={(e) => {
      e.target.style.background = isDarkMode ? darkTheme.inputs.backgroundFocus : 'rgba(255, 255, 255, 0.8)';
      e.target.style.borderColor = isDarkMode ? darkTheme.inputs.borderFocus : 'rgba(59, 130, 246, 0.4)';
      e.target.style.boxShadow = isDarkMode ? `0 0 0 3px ${darkTheme.inputs.borderFocus}33` : '0 0 0 3px rgba(59, 130, 246, 0.1)';
    }}
    onBlur={(e) => {
      e.target.style.background = isDarkMode ? darkTheme.inputs.background : 'rgba(255, 255, 255, 0.6)';
      e.target.style.borderColor = isDarkMode ? darkTheme.inputs.border : 'rgba(255, 255, 255, 0.3)';
      e.target.style.boxShadow = 'none';
    }}
  />
);

interface MobileSectionHeaderProps {
  section: {
    id: string;
    label: string;
    icon: React.ComponentType<any>;
  };
  isExpanded: boolean;
  onToggle: () => void;
}

export const MobileSectionHeader = ({ 
  section, 
  isExpanded, 
  onToggle 
}: MobileSectionHeaderProps) => {
  const Icon = section.icon;
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between text-left transition-all duration-200"
      style={{
        padding: 'var(--spacing-4)',
        background: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(16px) saturate(1.1)',
        WebkitBackdropFilter: 'blur(16px) saturate(1.1)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '12px',
        marginBottom: isExpanded ? '0' : 'var(--spacing-3)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
        <Icon 
          style={{
            width: '18px',
            height: '18px',
            color: '#6b7280'
          }}
        />
        <span 
          style={{
            fontSize: '16px',
            lineHeight: '20px',
            fontWeight: '500',
            color: '#1f2937',
            fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        >
          {section.label}
        </span>
      </div>
      <ChevronDown 
        style={{
          width: '16px',
          height: '16px',
          color: '#6b7280',
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease'
        }}
      />
    </button>
  );
};