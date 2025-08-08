import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    '../../packages/shared/src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6C5CE7',
          dark: '#4B3FB6',
        },
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)'
      }
    },
  },
  darkMode: 'class',
  plugins: [],
} satisfies Config;