/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        'landscape': {'raw': '(orientation: landscape) and (max-height: 500px)'},
      },
      colors: {
        blue: {
          25: '#f8faff',
        },
        green: {
          25: '#f7fdf9',
        },
        purple: {
          25: '#faf8ff',
        },
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        fadeInUp: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(30px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        slideInFromLeft: {
          '0%': {
            opacity: '0',
            transform: 'translateX(-100px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)'
          }
        },
        slideInFromRight: {
          '0%': {
            opacity: '0',
            transform: 'translateX(100px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)'
          }
        },
        scaleIn: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.8)'
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)'
          }
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' }
        },
        pulseGlow: {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(245, 158, 11, 0.5), 0 0 40px rgba(245, 158, 11, 0.3), 0 0 60px rgba(245, 158, 11, 0.1)'
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(245, 158, 11, 0.8), 0 0 60px rgba(245, 158, 11, 0.5), 0 0 90px rgba(245, 158, 11, 0.3)'
          }
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out',
        'fade-in-up': 'fadeInUp 0.8s ease-out',
        'slide-in-left': 'slideInFromLeft 0.8s ease-out',
        'slide-in-right': 'slideInFromRight 0.8s ease-out',
        'scale-in': 'scaleIn 0.6s ease-out',
        'pulse-slow': 'pulse 2s infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite'
      }
    },
  },
  plugins: [],
};
