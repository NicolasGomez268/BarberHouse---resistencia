import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        surface: {
          DEFAULT: '#0f0f0f',
          deep: '#151515',
        },
        accent: '#f5c518',
        text: {
          primary: '#ffffff',
          secondary: '#a0a0a0',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
