/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['Eloquia Display', 'Inter', 'system-ui', 'sans-serif'],
        'text': ['Eloquia Text', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}