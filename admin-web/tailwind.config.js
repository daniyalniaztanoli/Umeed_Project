/** @type {import('tailwindcss').Config} */
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default {
  darkMode: 'class',
  content: [
    join(__dirname, 'index.html'),
    join(__dirname, 'src/**/*.{js,ts,jsx,tsx}'),
  ],
  safelist: [
    'bg-brand-gradient',
    'bg-primary',
    'bg-primary-dark',
    'bg-primary-light',
    'bg-secondary',
    'bg-ink',
    'text-ink',
    'text-primary',
    'text-primary-dark',
    'shadow-soft',
    'rounded-4xl',
  ],
  theme: {
    extend: {
      screens: {
        xs: '375px',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#22C55E',
          dark: '#0F9B87',
          light: '#DCFCE7',
        },
        secondary: {
          DEFAULT: '#FDE68A',
          dark: '#F4D03F',
        },
        ink: '#1F1F1A',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #22C55E 0%, #0F9B87 100%)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        soft: '0 10px 30px -10px rgba(15, 155, 135, 0.35)',
      },
    },
  },
  plugins: [],
}
