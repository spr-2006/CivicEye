/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0f9ff',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
        },
        civic: {
          blue: '#0284c7',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
          purple: '#8b5cf6'
        }
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-red': 'glowRed 2s infinite',
      },
      keyframes: {
        glowRed: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(244, 63, 94, 0.6)' },
          '50%': { boxShadow: '0 0 25px rgba(244, 63, 94, 0.9)' },
        }
      }
    },
  },
  plugins: [],
}
