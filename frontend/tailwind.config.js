/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Static Site Glassmorphism Theme - ONLY THESE COLORS
        glass: {
          'card': 'rgba(255, 255, 255, 0.1)',
          'hover': 'rgba(255, 255, 255, 0.15)',
          'border': 'rgba(255, 255, 255, 0.2)',
          'text': '#1e293b',
          'muted': '#64748b',
        },
        // Brand colors from static site
        blue: {
          500: '#3b82f6',
          600: '#2563eb',
        },
        slate: {
          800: '#1e293b',
          600: '#475569',
          500: '#64748b',
        }
      },
      fontFamily: {
        'inter': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-purple': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
    },
  },
  plugins: [
    require('tailwindcss/plugin')(({ addUtilities }) => {
      addUtilities({
        '.glass-card': {
          'background': 'rgba(255, 255, 255, 0.1)',
          'backdrop-filter': 'blur(16px) saturate(1.5)',
          '-webkit-backdrop-filter': 'blur(16px) saturate(1.5)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
          'box-shadow': '0 8px 32px rgba(0, 0, 0, 0.1)',
        },
        '.glass-input': {
          'background': 'rgba(255, 255, 255, 0.05)',
          'backdrop-filter': 'blur(10px)',
          '-webkit-backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
        },
      })
    })
  ],
}