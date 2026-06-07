/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink: {
          950: '#0a0a0f',
          900: '#12121a',
          800: '#1c1c28',
          700: '#26263a',
          600: '#32324a',
          400: '#6b6b8a',
          300: '#9090aa',
          200: '#c0c0d0',
          100: '#e8e8f0',
        },
        acid: {
          DEFAULT: '#b8ff57',
          dim: '#8fd43a',
        },
        rose: '#ff5f7e',
        sky: '#5fbaff',
        amber: '#ffb95f',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulse2: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        }
      },
      animation: {
        fadeUp: 'fadeUp 0.4s ease forwards',
        fadeIn: 'fadeIn 0.3s ease forwards',
        shimmer: 'shimmer 1.8s linear infinite',
        pulse2: 'pulse2 1.5s ease-in-out infinite',
        scaleIn: 'scaleIn 0.2s ease forwards',
      },
    },
  },
  plugins: [],
}
