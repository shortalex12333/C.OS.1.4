/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Clean white design system (from UPDATE UX template)
        background: '#ffffff',
        'background-secondary': '#f8f9fa',
        border: '#e9ecef',
        'text-primary': '#212529',
        'text-secondary': '#6c757d',
        'text-muted': '#adb5bd',
        accent: '#0d6efd',
        'input-bg': '#ffffff',
        'input-border': '#ced4da',
        success: '#28a745',
        warning: '#ffc107',
        error: '#dc3545',
        info: '#17a2b8'
      },
      fontFamily: {
        'system': ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'header': '24px',
        'subheader': '16px',
        'body': '14px',
        'caption': '12px'
      },
      spacing: {
        'xs': '4px',
        'sm': '8px', 
        'md': '16px',
        'lg': '24px',
        'xl': '32px'
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px'
      },
      boxShadow: {
        'sm': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
        'modal': '0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)'
      }
    },
  },
  plugins: [],
}