/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        pink: {
          50: '#FFF0F5',
          100: '#FCE4EC',
          200: '#F8BBD0',
          300: '#F48FB1',
          400: '#F06292',
          500: '#EC407A',
          600: '#E91E63',
          700: '#C2185B',
          800: '#AD1457',
          900: '#880E4F',
        },
        rose: {
          light: '#FCE4EC',
          DEFAULT: '#EC407A',
          dark: '#C2185B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-pink': 'pulsePink 2s infinite',
        'destruct': 'destruct 0.5s ease-in forwards',
        'bounce-soft': 'bounceSoft 1s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        pulsePink: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(236, 64, 122, 0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(236, 64, 122, 0)' },
        },
        destruct: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.05)', filter: 'blur(2px)' },
          '100%': { opacity: '0', transform: 'scale(0.8)', filter: 'blur(8px)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      boxShadow: {
        'pink-sm': '0 2px 8px rgba(236, 64, 122, 0.15)',
        'pink-md': '0 4px 16px rgba(236, 64, 122, 0.2)',
        'pink-lg': '0 8px 32px rgba(236, 64, 122, 0.25)',
        'glass': '0 8px 32px rgba(31, 38, 135, 0.07)',
      },
    },
  },
  plugins: [],
};
