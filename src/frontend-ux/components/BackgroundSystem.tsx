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
  // Enhanced animation keyframes with luxury movements
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
    @keyframes luxuryFloat1 {
      0%, 100% { transform: translate3d(0,0,0) scale(1); opacity: 0.7; }
      30% { transform: translate3d(-2%, 1.5%, 0) scale(1.05); opacity: 0.85; }
      65% { transform: translate3d(1.8%, -2.2%, 0) scale(0.95); opacity: 0.75; }
      85% { transform: translate3d(-0.8%, 0.9%, 0) scale(1.02); opacity: 0.80; }
    }
    @keyframes luxuryFloat2 {
      0%, 100% { transform: translate3d(0,0,0) scale(1); opacity: 0.65; }
      25% { transform: translate3d(2.2%, -1.8%, 0) scale(0.92); opacity: 0.78; }
      60% { transform: translate3d(-1.5%, 2%, 0) scale(1.08); opacity: 0.72; }
      90% { transform: translate3d(1%, -0.6%, 0) scale(1.03); opacity: 0.69; }
    }
    @keyframes luxuryFloat3 {
      0%, 100% { transform: translate3d(0,0,0) scale(1); opacity: 0.6; }
      40% { transform: translate3d(1.4%, 2.5%, 0) scale(1.06); opacity: 0.75; }
      75% { transform: translate3d(-2.1%, -1.2%, 0) scale(0.94); opacity: 0.65; }
    }
    @keyframes luxuryFloat4 {
      0%, 100% { transform: translate3d(0,0,0) scale(1); opacity: 0.55; }
      35% { transform: translate3d(-1.8%, -2.0%, 0) scale(1.04); opacity: 0.68; }
      70% { transform: translate3d(2.3%, 1.6%, 0) scale(0.96); opacity: 0.61; }
    }
    @keyframes luxuryGlow1 {
      0%, 100% { opacity: 0.15; }
      45% { opacity: 0.35; }
      80% { opacity: 0.22; }
    }
    @keyframes luxuryGlow2 {
      0%, 100% { opacity: 0.12; }
      38% { opacity: 0.28; }
      72% { opacity: 0.18; }
    }
    @keyframes luxuryWarm {
      0%, 100% { opacity: 0.08; }
      50% { opacity: 0.20; }
    }
    @keyframes blueStorm1 {
      0%, 100% { transform: translate3d(0,0,0) scale(1); opacity: 0.95; }
      21% { transform: translate3d(-3.2%, 1.8%, 0) scale(1.12); opacity: 1.0; }
      54% { transform: translate3d(2.7%, -2.5%, 0) scale(0.88); opacity: 0.87; }
      78% { transform: translate3d(-1.4%, 1.1%, 0) scale(1.06); opacity: 0.93; }
    }
    @keyframes blueStorm2 {
      0%, 100% { transform: translate3d(0,0,0) scale(1); opacity: 0.90; }
      17% { transform: translate3d(2.8%, -1.2%, 0) scale(0.93); opacity: 0.98; }
      43% { transform: translate3d(-3.1%, 2.9%, 0) scale(1.09); opacity: 0.85; }
      71% { transform: translate3d(1.6%, -2.1%, 0) scale(1.04); opacity: 0.92; }
      89% { transform: translate3d(-0.8%, 1.3%, 0) scale(0.97); opacity: 0.94; }
    }
    @keyframes blueStorm3 {
      0%, 100% { transform: translate3d(0,0,0) scale(1); opacity: 0.85; }
      29% { transform: translate3d(-2.4%, -2.8%, 0) scale(1.08); opacity: 0.95; }
      63% { transform: translate3d(3.0%, 2.2%, 0) scale(0.92); opacity: 0.88; }
    }
    @keyframes blueStorm4 {
      0%, 100% { transform: translate3d(0,0,0) scale(1); opacity: 0.80; }
      24% { transform: translate3d(3.5%, 1.7%, 0) scale(0.89); opacity: 0.92; }
      58% { transform: translate3d(-2.8%, -3.2%, 0) scale(1.11); opacity: 0.84; }
      84% { transform: translate3d(1.9%, 1.5%, 0) scale(1.03); opacity: 0.88; }
    }
    @keyframes blueStorm5 {
      0%, 100% { transform: translate3d(0,0,0) scale(1); opacity: 0.75; }
      38% { transform: translate3d(-2.1%, 3.4%, 0) scale(1.13); opacity: 0.87; }
      74% { transform: translate3d(2.5%, -1.8%, 0) scale(0.86); opacity: 0.81; }
    }
    @keyframes blueStorm6 {
      0%, 100% { transform: translate3d(0,0,0) scale(1); opacity: 0.70; }
      33% { transform: translate3d(1.8%, -2.6%, 0) scale(1.07); opacity: 0.83; }
      67% { transform: translate3d(-2.9%, 1.9%, 0) scale(0.94); opacity: 0.77; }
    }
    @keyframes blueCascade1 {
      0%, 100% { transform: translate3d(0,0,0) scale(1); opacity: 0.75; }
      35% { transform: translate3d(2.2%, 2.1%, 0) scale(1.05); opacity: 0.88; }
      70% { transform: translate3d(-1.8%, -2.4%, 0) scale(0.95); opacity: 0.82; }
    }
    @keyframes blueCascade2 {
      0%, 100% { transform: translate3d(0,0,0) scale(1); opacity: 0.70; }
      27% { transform: translate3d(-2.5%, -1.6%, 0) scale(1.04); opacity: 0.83; }
      61% { transform: translate3d(2.1%, 2.8%, 0) scale(0.96); opacity: 0.76; }
    }
    @keyframes blueCascade3 {
      0%, 100% { transform: translate3d(0,0,0) scale(1); opacity: 0.65; }
      44% { transform: translate3d(1.4%, -2.2%, 0) scale(1.06); opacity: 0.78; }
      81% { transform: translate3d(-1.9%, 1.7%, 0) scale(0.94); opacity: 0.71; }
    }
    @keyframes baseBlue {
      0%, 100% { transform: translate3d(0,0,0) scale(1); opacity: 0.60; }
      50% { transform: translate3d(1.2%, 1.8%, 0) scale(1.02); opacity: 0.72; }
    }
    @keyframes warmBalance {
      0%, 100% { opacity: 0.25; }
      50% { opacity: 0.40; }
    }
  `;

  return (
    <div className="fixed inset-0 z-0 h-full w-full overflow-hidden">
      <style>{keyframeStyles}</style>
      
      {(!isLoggedIn || !isChatMode) ? (
        !isDarkMode ? (
          /* Light Mode Dashboard - Ultra Blue Luxury Theme */
          <>
            {/* Foundation: Rich blue progression */}
            <div className="absolute inset-0 h-full w-full" style={{ 
              background: 'linear-gradient(148deg, #fdfdff 0%, #fafcff 8%, #f7faff 16%, #f4f8ff 24%, #f1f6fe 32%, #eef4fe 40%, #ebf2fd 48%, #e8f0fc 56%, #ebf2fd 64%, #eef4fe 72%, #f1f6fe 80%, #f4f8ff 88%, #fdfdff 96%)'
            }} />
            
            {/* TOP BLUE STORM - Heavy concentration */}
            <div className="absolute inset-0 h-full w-full" style={{ 
              background: 'radial-gradient(85vmax 55vmax at 12% 8%, rgba(47, 185, 232, 0.25) 0%, #ebf2fd 35%, transparent 70%)',
              animation: 'blueStorm1 37s ease-in-out infinite',
              willChange: 'transform, opacity'
            }} />
            
            <div className="absolute inset-0 h-full w-full" style={{ 
              background: 'radial-gradient(95vmax 50vmax at 38% 5%, rgba(186, 221, 233, 0.28) 0%, #e8f0fc 40%, transparent 75%)',
              animation: 'blueStorm2 53s ease-in-out infinite 5s',
              willChange: 'transform, opacity'
            }} />
            
            <div className="absolute inset-0 h-full w-full" style={{ 
              background: 'radial-gradient(75vmax 60vmax at 64% 10%, rgba(0, 112, 255, 0.22) 0%, #e5eefc 30%, transparent 65%)',
              animation: 'blueStorm3 71s ease-in-out infinite 12s',
              willChange: 'transform, opacity'
            }} />
            
            <div className="absolute inset-0 h-full w-full" style={{ 
              background: 'radial-gradient(110vmax 45vmax at 82% 15%, rgba(129, 200, 228, 0.24) 0%, #e2ecfb 45%, transparent 80%)',
              animation: 'blueStorm4 43s ease-in-out infinite 18s',
              willChange: 'transform, opacity'
            }} />
            
            <div className="absolute inset-0 h-full w-full" style={{ 
              background: 'radial-gradient(65vmax 40vmax at 75% 2%, rgba(67, 166, 216, 0.20) 0%, transparent 60%)',
              animation: 'blueStorm5 89s ease-in-out infinite 25s',
              willChange: 'transform, opacity'
            }} />
            
            <div className="absolute inset-0 h-full w-full" style={{ 
              background: 'radial-gradient(70vmax 50vmax at 28% 15%, rgba(91, 184, 247, 0.18) 0%, #dfebfa 28%, transparent 62%)',
              animation: 'blueStorm6 61s ease-in-out infinite 32s',
              willChange: 'transform, opacity'
            }} />
            
            {/* MID BLUE CASCADES */}
            <div className="absolute inset-0 h-full w-full" style={{ 
              background: 'radial-gradient(120vmax 95vmax at 18% 48%, rgba(47, 185, 232, 0.15) 0%, #ebf2fd 50%, transparent 85%)',
              animation: 'blueCascade1 97s ease-in-out infinite',
              willChange: 'transform, opacity'
            }} />
            
            <div className="absolute inset-0 h-full w-full" style={{ 
              background: 'radial-gradient(105vmax 110vmax at 82% 52%, rgba(186, 221, 233, 0.18) 0%, #e8f0fc 48%, transparent 82%)',
              animation: 'blueCascade2 79s ease-in-out infinite 15s',
              willChange: 'transform, opacity'
            }} />
            
            <div className="absolute inset-0 h-full w-full" style={{ 
              background: 'radial-gradient(90vmax 90vmax at 50% 60%, rgba(0, 112, 255, 0.12) 0%, #e5eefc 42%, transparent 78%)',
              animation: 'blueCascade3 53s ease-in-out infinite 28s',
              willChange: 'transform, opacity'
            }} />
            
            {/* BASE SUPPORT */}
            <div className="absolute inset-0 h-full w-full" style={{ 
              background: 'radial-gradient(140vmax 120vmax at 45% 88%, rgba(129, 200, 228, 0.10) 0%, transparent 78%)',
              animation: 'baseBlue 71s ease-in-out infinite 20s',
              willChange: 'transform, opacity'
            }} />
            
            {/* Warm balance */}
            <div className="absolute inset-0 h-full w-full" style={{ 
              background: 'radial-gradient(70vmax 70vmax at 85% 25%, rgba(200, 169, 81, 0.06) 0%, transparent 52%)',
              animation: 'warmBalance 89s ease-in-out infinite 45s',
              willChange: 'opacity'
            }} />
          </>
        ) : (
          /* Dark Mode Dashboard - Premium Luxury Theme */
          <>
            {/* Foundation: Rich gradient base */}
            <div className="absolute inset-0 h-full w-full" style={{ 
              background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 25%, #242424 50%, #1a1a1a 75%, #0f0f0f 100%)'
            }} />
            
            {/* Depth Layer 1: Primary mass */}
            <div className="absolute inset-0 h-full w-full" style={{ 
              background: 'radial-gradient(80vmax 70vmax at 15% 20%, #424242 0%, #2e2e2e 35%, transparent 70%)',
              animation: 'luxuryFloat1 43s ease-in-out infinite',
              willChange: 'transform, opacity'
            }} />
            
            {/* Depth Layer 2: Counter mass */}
            <div className="absolute inset-0 h-full w-full" style={{ 
              background: 'radial-gradient(90vmax 80vmax at 85% 15%, #4a4a4a 0%, #383838 40%, transparent 75%)',
              animation: 'luxuryFloat2 59s ease-in-out infinite',
              willChange: 'transform, opacity'
            }} />
            
            {/* Depth Layer 3: Lower formation */}
            <div className="absolute inset-0 h-full w-full" style={{ 
              background: 'radial-gradient(70vmax 90vmax at 20% 80%, #2e2e2e 0%, #1a1a1a 30%, transparent 65%)',
              animation: 'luxuryFloat3 67s ease-in-out infinite',
              willChange: 'transform, opacity'
            }} />
            
            {/* Depth Layer 4: Corner accent */}
            <div className="absolute inset-0 h-full w-full" style={{ 
              background: 'radial-gradient(75vmax 75vmax at 78% 82%, #4a4a4a 0%, #242424 25%, transparent 60%)',
              animation: 'luxuryFloat4 37s ease-in-out infinite',
              willChange: 'transform, opacity'
            }} />
            
            {/* Brand Accent 1: Minimal presence */}
            <div className="absolute inset-0 h-full w-full" style={{ 
              background: 'radial-gradient(60vmax 60vmax at 45% 25%, rgba(186, 221, 233, 0.12) 0%, transparent 50%)',
              animation: 'luxuryGlow1 71s ease-in-out infinite',
              willChange: 'opacity'
            }} />
            
            {/* Brand Accent 2: Secondary whisper */}
            <div className="absolute inset-0 h-full w-full" style={{ 
              background: 'radial-gradient(50vmax 70vmax at 65% 70%, rgba(186, 221, 233, 0.08) 0%, transparent 45%)',
              animation: 'luxuryGlow2 43s ease-in-out infinite 20s',
              willChange: 'opacity'
            }} />
            
            {/* Warm Accent: Luxury gold hints */}
            <div className="absolute inset-0 h-full w-full" style={{ 
              background: 'radial-gradient(55vmax 55vmax at 75% 25%, rgba(200, 169, 81, 0.06) 0%, transparent 40%)',
              animation: 'luxuryWarm 67s ease-in-out infinite 30s',
              willChange: 'opacity'
            }} />
            
            {/* Material texture system */}
            <div className="absolute inset-0 h-full w-full" style={{ 
              background: `
                radial-gradient(at 18% 15%, #2e2e2e 0px, transparent 40%),
                radial-gradient(at 62% 8%, #242424 0px, transparent 35%),
                radial-gradient(at 85% 22%, #424242 0px, transparent 38%),
                radial-gradient(at 25% 75%, #242424 0px, transparent 42%),
                radial-gradient(at 88% 88%, #2e2e2e 0px, transparent 35%)
              `,
              opacity: 0.4,
              mixBlendMode: 'soft-light'
            }} />
            
            {/* Premium vignette */}
            <div className="absolute inset-0 h-full w-full" style={{ 
              position: 'absolute',
              inset: '-10vmax',
              background: 'radial-gradient(120vmax 90vmax at 50% 50%, transparent 0 65%, rgba(0,0,0,0.6) 100%)',
              pointerEvents: 'none'
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