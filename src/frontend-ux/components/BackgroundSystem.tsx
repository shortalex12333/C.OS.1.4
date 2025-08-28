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
      0%, 100% { transform: translate3d(0,0,0) scale(1); }
      50% { transform: translate3d(0,-1%,0) scale(1.01); }
    }
    @keyframes ambientDrift {
      0%, 100% { transform: translate3d(0,0,0) scale(1); }
      50% { transform: translate3d(0,-1%,0) scale(1.01); }
    }
    @keyframes subtlePulse {
      0%, 100% { transform: translate3d(0,0,0) scale(1); }
      50% { transform: translate3d(0,-1%,0) scale(1.01); }
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
          /* Light Mode Dashboard - CelesteOS Ocean Gradient Theme */
          <>
            {/* Base unifying wash */}
            <div className="absolute inset-0 h-full w-full" style={{ 
              background: 'linear-gradient(180deg, #f7fbff 0%, #BADDE9 100%)'
            }} />
            
            {/* Layered ocean blues with brand logo gradient - Position 1: soft cyan glow */}
            <div className="absolute inset-0 h-full w-full" style={{ 
              background: 'radial-gradient(60vmax 60vmax at 18% 20%, rgba(47, 185, 232, 0.35) 0%, transparent 55%)',
              filter: 'saturate(110%) contrast(102%)',
              animation: 'ambientFloat 26s ease-in-out infinite'
            }} />
            
            {/* Position 2: pure blue glow */}
            <div className="absolute inset-0 h-full w-full" style={{ 
              background: 'radial-gradient(70vmax 70vmax at 82% 18%, rgba(0, 112, 255, 0.4) 0%, transparent 60%)',
              filter: 'saturate(110%) contrast(102%)',
              animation: 'ambientDrift 26s ease-in-out infinite'
            }} />
            
            {/* Position 3: logo turquoise */}
            <div className="absolute inset-0 h-full w-full" style={{ 
              background: 'radial-gradient(70vmax 70vmax at 22% 78%, rgba(186, 221, 233, 0.6) 0%, transparent 55%)',
              filter: 'saturate(110%) contrast(102%)',
              animation: 'subtlePulse 26s ease-in-out infinite'
            }} />
            
            {/* Position 4: navy lift */}
            <div className="absolute inset-0 h-full w-full" style={{ 
              background: 'radial-gradient(85vmax 85vmax at 78% 82%, rgba(0, 40, 90, 0.18) 0%, transparent 65%)',
              filter: 'saturate(110%) contrast(102%)'
            }} />
            
            {/* Vignette to hold focus center */}
            <div className="absolute h-full w-full" style={{ 
              position: 'absolute',
              inset: '-10vmax',
              background: 'radial-gradient(120vmax 90vmax at 50% 45%, transparent 0 64%, rgba(0, 15, 40, 0.06) 100%)',
              pointerEvents: 'none',
              mixBlendMode: 'multiply'
            }} />
            
            {/* Grain to remove banding (very light) */}
            <div className="absolute inset-0 h-full w-full" style={{ 
              pointerEvents: 'none',
              opacity: 0.05,
              mixBlendMode: 'overlay',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E")`,
              backgroundSize: '280px 280px',
              animation: 'ambientFloat 26s ease-in-out infinite reverse'
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