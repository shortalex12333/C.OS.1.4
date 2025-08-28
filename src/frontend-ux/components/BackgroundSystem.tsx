import React from 'react';

interface BackgroundSystemProps {
  isDarkMode: boolean;
  isChatMode: boolean;
  isLoggedIn: boolean;
}

export const BackgroundSystem: React.FC<BackgroundSystemProps> = ({
  isDarkMode,
  isChatMode,
  isLoggedIn,
}) => {
  // Enhanced animation keyframes with ambient movements
  const keyframeStyles = `
    @keyframes fadeBlueGradient {
      0% { opacity: 1; transform: scale(1); }
      20% { opacity: 0.8; transform: scale(0.98); }
      50% { opacity: 0.4; transform: scale(0.95); }
      80% { opacity: 0.1; transform: scale(0.92); }
      100% { opacity: 0; transform: scale(0.9); }
    }
    @keyframes fadePlumGradient {
      0% { opacity: 1; transform: scale(1); }
      20% { opacity: 0.8; transform: scale(0.98); }
      50% { opacity: 0.4; transform: scale(0.95); }
      80% { opacity: 0.1; transform: scale(0.92); }
      100% { opacity: 0; transform: scale(0.9); }
    }
    @keyframes fadeToWhite {
      0% { opacity: 0; transform: scale(1.02); }
      30% { opacity: 0.3; transform: scale(1.01); }
      60% { opacity: 0.7; transform: scale(1.005); }
      100% { opacity: 1; transform: scale(1); }
    }
    @keyframes fadeToPlum {
      0% { opacity: 0; transform: scale(1.02); }
      30% { opacity: 0.3; transform: scale(1.01); }
      60% { opacity: 0.7; transform: scale(1.005); }
      100% { opacity: 1; transform: scale(1); }
    }
    @keyframes ambientFloat {
      0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
      33% { transform: translateY(-20px) translateX(10px) scale(1.02); }
      66% { transform: translateY(10px) translateX(-5px) scale(0.98); }
    }
    @keyframes ambientDrift {
      0%, 100% { transform: translateX(0px) translateY(0px); }
      25% { transform: translateX(30px) translateY(-15px); }
      50% { transform: translateX(-20px) translateY(20px); }
      75% { transform: translateX(15px) translateY(-10px); }
    }
    @keyframes subtlePulse {
      0%, 100% { opacity: 0.3; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.05); }
    }
    @keyframes auroraWave {
      0% { transform: translateX(-100%) rotate(-5deg); }
      100% { transform: translateX(100%) rotate(5deg); }
    }
    @keyframes glowPulse {
      0%, 100% { opacity: 0.2; filter: blur(40px); }
      50% { opacity: 0.4; filter: blur(60px); }
    }
  `;

  return (
    <div className="fixed inset-0 z-0 h-full w-full overflow-hidden">
      <style>{keyframeStyles}</style>
      
      {(!isLoggedIn || !isChatMode) ? (
        !isDarkMode ? (
          /* Light Mode Dashboard - Professional Marine Theme */
          <>
            {/* Base gradient */}
            <div className="absolute inset-0 h-full w-full" style={{ 
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0f9ff 100%)' 
            }} />
            
            {/* Animated aurora effect - subtle */}
            <div className="absolute inset-0 h-full w-full" style={{ 
              background: 'linear-gradient(90deg, transparent 0%, rgba(67, 166, 216, 0.05) 50%, transparent 100%)',
              animation: 'auroraWave 20s ease-in-out infinite',
              opacity: 0.5
            }} />
            
            {/* Primary organic shapes with animation */}
            <div className="absolute inset-0 h-full w-full" style={{ 
              background: 'radial-gradient(circle at 25% -10%, rgba(67, 166, 216, 0.15) 0%, rgba(129, 200, 228, 0.1) 25%, transparent 50%)',
              animation: 'ambientFloat 15s ease-in-out infinite'
            }} />
            
            <div className="absolute inset-0 h-full w-full" style={{ 
              background: 'radial-gradient(circle at 75% -5%, rgba(91, 184, 247, 0.12) 0%, rgba(67, 166, 216, 0.08) 30%, transparent 55%)',
              animation: 'ambientDrift 20s ease-in-out infinite'
            }} />
            
            <div className="absolute inset-0 h-full w-full" style={{ 
              background: 'radial-gradient(circle at 50% 0%, rgba(129, 200, 228, 0.08) 0%, transparent 40%)',
              animation: 'subtlePulse 10s ease-in-out infinite'
            }} />
            
            {/* Depth layers */}
            <div className="absolute inset-0 h-full w-full" style={{ 
              background: 'radial-gradient(ellipse at 30% 20%, rgba(255, 255, 255, 0.6) 0%, transparent 40%)',
              filter: 'blur(40px)'
            }} />
            
            <div className="absolute inset-0 h-full w-full" style={{ 
              background: 'radial-gradient(ellipse at 70% 30%, rgba(240, 248, 255, 0.5) 0%, transparent 50%)',
              filter: 'blur(30px)'
            }} />
            
            {/* Subtle mesh gradient overlay */}
            <div className="absolute inset-0 h-full w-full" style={{ 
              background: `
                radial-gradient(at 40% 20%, rgba(67, 166, 216, 0.05) 0px, transparent 50%),
                radial-gradient(at 80% 0%, rgba(129, 200, 228, 0.04) 0px, transparent 50%),
                radial-gradient(at 10% 50%, rgba(91, 184, 247, 0.03) 0px, transparent 50%),
                radial-gradient(at 90% 90%, rgba(67, 166, 216, 0.02) 0px, transparent 50%)
              `,
              backgroundBlendMode: 'normal'
            }} />
          </>
        ) : (
          /* Dark Mode Dashboard - Deep Ocean Aurora Theme */
          <>
            {/* Deep base */}
            <div className="absolute inset-0 h-full w-full" style={{ 
              background: 'linear-gradient(135deg, #0a0f1b 0%, #0f1823 50%, #0a0f1b 100%)' 
            }} />
            
            {/* Aurora borealis effect */}
            <div className="absolute inset-0 h-full w-full" style={{ 
              background: 'linear-gradient(90deg, transparent 0%, rgba(67, 166, 216, 0.15) 25%, rgba(91, 184, 247, 0.1) 50%, rgba(129, 200, 228, 0.15) 75%, transparent 100%)',
              animation: 'auroraWave 25s ease-in-out infinite',
              filter: 'blur(40px)',
              opacity: 0.6
            }} />
            
            {/* Primary animated gradients - more visible */}
            <div className="absolute inset-0 h-full w-full" style={{ 
              background: 'radial-gradient(circle at 20% -5%, rgba(67, 166, 216, 0.25) 0%, rgba(91, 184, 247, 0.15) 20%, transparent 45%)',
              animation: 'ambientFloat 18s ease-in-out infinite'
            }} />
            
            <div className="absolute inset-0 h-full w-full" style={{ 
              background: 'radial-gradient(circle at 70% 0%, rgba(129, 200, 228, 0.2) 0%, rgba(67, 166, 216, 0.1) 25%, transparent 50%)',
              animation: 'ambientDrift 22s ease-in-out infinite'
            }} />
            
            <div className="absolute inset-0 h-full w-full" style={{ 
              background: 'radial-gradient(circle at 45% -10%, rgba(91, 184, 247, 0.15) 0%, transparent 35%)',
              animation: 'subtlePulse 12s ease-in-out infinite'
            }} />
            
            {/* Glowing orbs for depth */}
            <div className="absolute inset-0 h-full w-full" style={{ 
              background: 'radial-gradient(circle at 30% 15%, rgba(67, 166, 216, 0.2) 0%, transparent 25%)',
              filter: 'blur(60px)',
              animation: 'glowPulse 8s ease-in-out infinite'
            }} />
            
            <div className="absolute inset-0 h-full w-full" style={{ 
              background: 'radial-gradient(circle at 75% 20%, rgba(129, 200, 228, 0.15) 0%, transparent 30%)',
              filter: 'blur(50px)',
              animation: 'glowPulse 10s ease-in-out infinite 2s'
            }} />
            
            {/* Mesh overlay for texture */}
            <div className="absolute inset-0 h-full w-full" style={{ 
              background: `
                radial-gradient(at 20% 10%, rgba(67, 166, 216, 0.08) 0px, transparent 40%),
                radial-gradient(at 60% 5%, rgba(91, 184, 247, 0.06) 0px, transparent 40%),
                radial-gradient(at 85% 15%, rgba(129, 200, 228, 0.07) 0px, transparent 40%),
                radial-gradient(at 40% 30%, rgba(67, 166, 216, 0.04) 0px, transparent 50%)
              `,
              backgroundBlendMode: 'screen'
            }} />
            
            {/* Subtle noise texture for depth */}
            <div className="absolute inset-0 h-full w-full" style={{ 
              opacity: 0.03,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat',
              backgroundSize: '256px 256px'
            }} />
          </>
        )
      ) : (
        !isDarkMode ? (
          /* Light Mode Chat State */
          <>
            <div className="absolute inset-0 h-full w-full transition-all duration-1200 ease-out" style={{ background: '#fcfeff', animation: isChatMode ? 'fadeToWhite 1.2s cubic-bezier(0.22, 0.61, 0.36, 1) forwards' : 'none' }} />
            <div className="absolute inset-0 h-full w-full transition-all duration-1200 ease-out" style={{ background: 'linear-gradient(180deg, rgba(252, 254, 255, 0.9) 0%, rgba(255, 255, 255, 1) 100%)', animation: isChatMode ? 'fadeToWhite 1.2s cubic-bezier(0.22, 0.61, 0.36, 1) forwards' : 'none' }} />
          </>
        ) : (
          /* Dark Mode Chat State */
          <>
            <div className="absolute inset-0 h-full w-full transition-all duration-1200 ease-out" style={{ background: '#0f0b12', animation: isChatMode ? 'fadeToPlum 1.2s cubic-bezier(0.22, 0.61, 0.36, 1) forwards' : 'none' }} />
            <div className="absolute inset-0 h-full w-full transition-all duration-1200 ease-out" style={{ background: 'linear-gradient(180deg, rgba(15, 11, 18, 0.9) 0%, rgba(15, 11, 18, 1) 100%)', animation: isChatMode ? 'fadeToPlum 1.2s cubic-bezier(0.22, 0.61, 0.36, 1) forwards' : 'none' }} />
          </>
        )
      )}
    </div>
  );
};