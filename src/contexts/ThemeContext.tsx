import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { darkTheme, lightTheme, applyDarkTheme, Theme, getTheme } from '../styles/darkModeTheme';

// Theme context type definition
interface ThemeContextType {
  isDarkMode: boolean;
  appearance: 'light' | 'dark' | 'auto';
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (appearance: 'light' | 'dark' | 'auto' | boolean) => void;
  applyThemeToDocument: () => void;
}

// Create the context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider component
interface ThemeProviderProps {
  children: ReactNode;
  defaultDarkMode?: boolean;
}

export function ThemeProvider({ children, defaultDarkMode = false }: ThemeProviderProps) {
  const [appearance, setAppearance] = useState<'light' | 'dark' | 'auto'>(() => {
    // Use single source of truth: 'appearance' key
    const savedAppearance = localStorage.getItem('appearance');
    if (savedAppearance && ['light', 'dark', 'auto'].includes(savedAppearance)) {
      return savedAppearance as 'light' | 'dark' | 'auto';
    }
    return 'auto'; // Default to auto-detect
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Compute actual dark mode based on appearance setting
  const isDarkMode = appearance === 'auto' ? systemPrefersDark : appearance === 'dark';

  const theme = getTheme(isDarkMode);

  const toggleTheme = () => {
    const newAppearance = appearance === 'dark' ? 'light' : 'dark';
    setAppearance(newAppearance);
  };

  const setTheme = (newAppearance: 'light' | 'dark' | 'auto' | boolean) => {
    if (typeof newAppearance === 'boolean') {
      // Legacy support for boolean parameter
      setAppearance(newAppearance ? 'dark' : 'light');
    } else {
      setAppearance(newAppearance);
    }
  };

  const applyThemeToDocument = () => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const themeVars = applyDarkTheme(isDarkMode);
    
    // Apply all CSS custom properties to the document root
    Object.entries(themeVars).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Add theme class to body for additional styling
    document.body.classList.toggle('dark-theme', isDarkMode);
    document.body.classList.toggle('light-theme', !isDarkMode);
    
    // Ensure smooth transitions
    document.body.classList.add('theme-transition');
  };

  // Apply theme when it changes
  useEffect(() => {
    applyThemeToDocument();
    
    // Save appearance preference (single source of truth)
    localStorage.setItem('appearance', appearance);
    // Clean up old theme key if it exists
    localStorage.removeItem('theme');
    
    // Update meta theme color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme.backgrounds.primary);
    } else {
      // Create meta theme color if it doesn't exist
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = theme.backgrounds.primary;
      document.head.appendChild(meta);
    }
  }, [isDarkMode, theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
      // Auto-detect mode will automatically update through computed isDarkMode
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleSystemThemeChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      } else {
        mediaQuery.removeListener(handleSystemThemeChange);
      }
    };
  }, []);

  const contextValue: ThemeContextType = {
    isDarkMode,
    appearance,
    theme,
    toggleTheme,
    setTheme,
    applyThemeToDocument,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook to use theme context
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Hook for theme-aware styling
export function useThemedStyle() {
  const { isDarkMode, appearance, theme } = useTheme();
  
  return {
    isDarkMode,
    appearance,
    theme,
    
    // Helper functions for common styling patterns
    getBackground: (level: 'primary' | 'secondary' | 'tertiary' | 'elevated' = 'primary') => 
      theme.backgrounds[level],
    
    getText: (level: 'primary' | 'secondary' | 'tertiary' | 'inverse' = 'primary') => 
      theme.text[level],
    
    getInput: () => theme.inputs,
    
    getButton: (variant: 'primary' | 'secondary' | 'disabled' | 'ghost' = 'primary') => 
      theme.buttons[variant],
    
    getSidebar: () => theme.sidebar,
    
    getModal: () => theme.modal,
    
    getBrand: () => theme.brand,
    
    getEffects: () => theme.effects,
    
    // Semantic color helpers
    getSemanticColor: (type: 'success' | 'warning' | 'error' | 'accent') => 
      theme.text[type],
    
    // Style object generators for common patterns
    getCardStyle: () => ({
      backgroundColor: theme.backgrounds.tertiary,
      border: `1px solid ${theme.sidebar.border}`,
      borderRadius: theme.modal.borderRadius,
      color: theme.text.primary,
    }),
    
    getInputStyle: () => ({
      backgroundColor: theme.inputs.background,
      border: `1px solid ${theme.inputs.border}`,
      color: theme.inputs.text,
      borderRadius: '8px',
      '&:hover': {
        backgroundColor: theme.inputs.backgroundHover,
        borderColor: theme.inputs.borderHover,
      },
      '&:focus': {
        backgroundColor: theme.inputs.backgroundFocus,
        borderColor: theme.inputs.borderFocus,
        color: theme.inputs.textFocus,
        boxShadow: theme.effects.focusRing,
      },
      '&::placeholder': {
        color: theme.inputs.placeholder,
      },
    }),
    
    getButtonStyle: (variant: 'primary' | 'secondary' | 'ghost' = 'primary') => {
      const buttonTheme = theme.buttons[variant];
      return {
        background: buttonTheme.background,
        color: buttonTheme.text,
        border: 'border' in buttonTheme ? `1px solid ${buttonTheme.border}` : 'none',
        borderRadius: '8px',
        boxShadow: 'shadow' in buttonTheme ? buttonTheme.shadow : 'none',
        transition: `all ${theme.effects.microDelay} ${theme.effects.modalEntrance}`,
        '&:hover': {
          background: buttonTheme.backgroundHover,
          color: 'textHover' in buttonTheme ? buttonTheme.textHover : buttonTheme.text,
          boxShadow: 'shadowHover' in buttonTheme ? buttonTheme.shadowHover : 'shadow' in buttonTheme ? buttonTheme.shadow : 'none',
          transform: 'scale' in buttonTheme ? buttonTheme.scale : 'scale(1.02)',
        },
        '&:focus': {
          boxShadow: `${theme.effects.focusRing}, ${'shadow' in buttonTheme ? buttonTheme.shadow : 'none'}`,
        },
      };
    },
    
    getModalStyle: () => ({
      backgroundColor: theme.modal.background,
      border: `1px solid ${theme.modal.border}`,
      borderRadius: theme.modal.borderRadius,
      boxShadow: theme.modal.shadow,
      backdropFilter: theme.modal.backdropBlur,
      color: theme.text.primary,
    }),
    
    getOverlayStyle: () => ({
      backgroundColor: theme.modal.overlay,
      backdropFilter: theme.effects.backdropBlur,
    }),
    
    getSidebarStyle: () => ({
      backgroundColor: theme.sidebar.background,
      borderRight: `1px solid ${theme.sidebar.border}`,
      color: theme.sidebar.itemText,
    }),
    
    getSidebarItemStyle: (isActive: boolean = false, isHovered: boolean = false) => ({
      backgroundColor: isActive 
        ? theme.sidebar.itemBackgroundActive 
        : isHovered 
          ? theme.sidebar.itemBackgroundHover 
          : theme.sidebar.itemBackground,
      color: isActive 
        ? theme.sidebar.itemTextActive 
        : isHovered 
          ? theme.sidebar.itemTextHover 
          : theme.sidebar.itemText,
      borderLeft: isActive ? `3px solid ${theme.sidebar.itemActiveIndicator}` : '3px solid transparent',
      transition: `all ${theme.effects.microDelay} ${theme.effects.modalEntrance}`,
    }),
  };
}

// Hook for responsive theming
export function useResponsiveTheme() {
  const themedStyle = useThemedStyle();
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return {
    ...themedStyle,
    isMobile,
    
    // Mobile-specific style helpers
    getMobileModalStyle: () => ({
      ...themedStyle.getModalStyle(),
      margin: isMobile ? '16px' : '40px',
      maxHeight: isMobile ? 'calc(100vh - 32px)' : 'calc(100vh - 80px)',
      borderRadius: isMobile ? '12px' : themedStyle.theme.modal.borderRadius,
    }),
    
    getMobileInputStyle: () => ({
      ...themedStyle.getInputStyle(),
      fontSize: isMobile ? '16px' : '14px', // Prevent zoom on iOS
      padding: isMobile ? '12px 16px' : '8px 12px',
    }),
    
    getMobileButtonStyle: (variant: 'primary' | 'secondary' | 'ghost' = 'primary') => ({
      ...themedStyle.getButtonStyle(variant),
      padding: isMobile ? '12px 20px' : '8px 16px',
      fontSize: isMobile ? '16px' : '14px',
      minHeight: isMobile ? '44px' : '36px', // Touch target size
    }),
  };
}