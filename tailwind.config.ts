import type { Config } from 'tailwindcss'
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // White first - his brief and both reference sites. Clay is the logo
        // colour from the approved wordmark, used sparingly as the accent.
        ink: '#141414', muted: '#6b6b6b', line: '#e6e4e1',
        clay: { DEFAULT: '#a8503a', dark: '#8d4230', light: '#f6ece8' },
        paper: '#ffffff', soft: '#fafafa',
      },
      fontFamily: { sans: ['LatoText', 'system-ui', 'Segoe UI', 'sans-serif'] },
      maxWidth: { site: '1280px' },
    },
  },
  plugins: [],
} satisfies Config
