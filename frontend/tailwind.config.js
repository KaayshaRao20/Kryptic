/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F7F8F7',
        secondary: '#F0F3F2',
        surface: '#FFFFFF',
        textPrimary: '#182124',
        textSecondary: '#687276',
        techBlue: '#557CFF',
        healthGreen: '#4E9B78',
        riskRed: '#B95D63',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'], 
      },
      keyframes: {
        dash: {
          to: {
            strokeDashoffset: '-10',
          },
        },
      },
      animation: {
        dash: 'dash 1s linear infinite',
      },
    },
  },
  plugins: [],
}
