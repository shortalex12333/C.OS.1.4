import React from 'react';

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
  // Use Blue Brain Logo from root directory
  const logoSrc = "/blue-brain-logo.png";
  
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