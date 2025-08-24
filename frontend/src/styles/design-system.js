// =====================================================
// CLEAN WHITE DESIGN SYSTEM - FROM UPDATE UX TEMPLATE
// =====================================================

export const DESIGN_TOKENS = {
  // Colors - Simple, clean palette (copied from UPDATE UX)
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
    },
    // Additional colors for chat interface
    success: '#28a745',
    warning: '#ffc107',
    error: '#dc3545',
    info: '#17a2b8'
  },
  
  // Typography - Consistent hierarchy (copied from UPDATE UX)
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
  
  // Spacing - 8px grid system (copied from UPDATE UX)
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  },
  
  // Border radius - Consistent rounding (copied from UPDATE UX)
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px'
  },

  // Shadows - Simple, clean shadows
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    modal: '0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)'
  }
};

// =====================================================
// UTILITY FUNCTIONS FOR APPLYING DESIGN TOKENS
// =====================================================

export const createStyles = {
  // Standard button styles
  button: {
    primary: {
      backgroundColor: DESIGN_TOKENS.colors.accent,
      color: '#ffffff',
      border: 'none',
      borderRadius: DESIGN_TOKENS.radius.sm,
      padding: `${DESIGN_TOKENS.spacing.sm} ${DESIGN_TOKENS.spacing.md}`,
      fontSize: DESIGN_TOKENS.typography.sizes.body,
      fontFamily: DESIGN_TOKENS.typography.family,
      fontWeight: DESIGN_TOKENS.typography.weights.medium,
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    
    secondary: {
      backgroundColor: DESIGN_TOKENS.colors.background,
      color: DESIGN_TOKENS.colors.text.primary,
      border: `1px solid ${DESIGN_TOKENS.colors.border}`,
      borderRadius: DESIGN_TOKENS.radius.sm,
      padding: `${DESIGN_TOKENS.spacing.sm} ${DESIGN_TOKENS.spacing.md}`,
      fontSize: DESIGN_TOKENS.typography.sizes.body,
      fontFamily: DESIGN_TOKENS.typography.family,
      fontWeight: DESIGN_TOKENS.typography.weights.medium,
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    }
  },

  // Standard input styles
  input: {
    backgroundColor: DESIGN_TOKENS.colors.input.background,
    border: `1px solid ${DESIGN_TOKENS.colors.input.border}`,
    borderRadius: DESIGN_TOKENS.radius.sm,
    padding: `${DESIGN_TOKENS.spacing.sm} ${DESIGN_TOKENS.spacing.sm}`,
    fontSize: DESIGN_TOKENS.typography.sizes.body,
    fontFamily: DESIGN_TOKENS.typography.family,
    color: DESIGN_TOKENS.colors.text.primary,
    outline: 'none',
    transition: 'border-color 0.2s ease'
  },

  // Standard card styles
  card: {
    backgroundColor: DESIGN_TOKENS.colors.background,
    border: `1px solid ${DESIGN_TOKENS.colors.border}`,
    borderRadius: DESIGN_TOKENS.radius.md,
    padding: DESIGN_TOKENS.spacing.lg,
    boxShadow: DESIGN_TOKENS.shadows.sm
  },

  // Modal styles
  modal: {
    backgroundColor: DESIGN_TOKENS.colors.background,
    borderRadius: DESIGN_TOKENS.radius.lg,
    boxShadow: DESIGN_TOKENS.shadows.modal,
    border: `1px solid ${DESIGN_TOKENS.colors.border}`
  }
};

export default DESIGN_TOKENS;