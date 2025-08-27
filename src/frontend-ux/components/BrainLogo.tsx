import React from 'react';
import logoBlack from '../assets/logos/logo-black.png';
import logoWhite from '../assets/logos/logo-white.png';

interface BrainLogoProps {
  className?: string;
  size?: number;
  isDarkMode?: boolean;
}

export function BrainLogo({ 
  className = "", 
  size = 48,
  isDarkMode = false
}: BrainLogoProps) {
  // Use white logo for dark mode and login pages (which have dark backgrounds)
  // Use black logo for light mode
  const logoSrc = isDarkMode ? logoWhite : logoBlack;
  
  return (
    <img 
      src={logoSrc}
      alt="CelesteOS Logo"
      className={className}
      style={{
        width: size,
        height: size,
        objectFit: 'contain'
      }}
    />
  );
}