import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c0d0ff',
          300: '#93aaff',
          400: '#6072ff',
          500: '#4052f5',
          600: '#2f3de8',
          700: '#2530cc',
          800: '#2028a5',
          900: '#1e2882',
        },
        surface: {
          50:  '#ffffff',
          100: '#faf8ff',
          200: '#f3f0ff',
          800: '#f7f4ff',
          850: '#f0ecff',
          900: '#e4dfff',
          950: '#faf8ff',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)',
        'slide-down': 'slideDown 0.4s cubic-bezier(0.16,1,0.3,1)',
        'scale-in':   'scaleIn 0.25s cubic-bezier(0.16,1,0.3,1)',
        'bounce-in':  'bounceIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275)',
        'spin-slow':  'spin 3s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer':    'shimmer 1.5s infinite',
        'flip':       'flip 0.6s cubic-bezier(0.16,1,0.3,1)',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { transform: 'translateY(20px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        slideDown: { from: { transform: 'translateY(-20px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        scaleIn:   { from: { transform: 'scale(0.9)', opacity: '0' }, to: { transform: 'scale(1)', opacity: '1' } },
        bounceIn:  { from: { transform: 'scale(0.3)', opacity: '0' }, to: { transform: 'scale(1)', opacity: '1' } },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(99,102,241,0.4)' },
          '50%':      { boxShadow: '0 0 0 12px rgba(99,102,241,0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        flip: {
          '0%':   { transform: 'perspective(400px) rotateY(0deg)' },
          '100%': { transform: 'perspective(400px) rotateY(360deg)' },
        },
      },
      backdropBlur: { xs: '2px' },
      borderRadius: { '2xl': '1rem', '3xl': '1.5rem', '4xl': '2rem' },
      boxShadow: {
        'glow':    '0 0 20px rgba(99,102,241,0.25)',
        'glow-lg': '0 0 40px rgba(99,102,241,0.3)',
        'card':    '0 2px 16px rgba(99,102,241,0.08)',
        'card-lg': '0 6px 32px rgba(99,102,241,0.14)',
      },
    },
  },
  plugins: [],
} satisfies Config
