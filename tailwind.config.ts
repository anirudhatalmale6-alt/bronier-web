import type { Config } from 'tailwindcss'
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // White and black. He asked for the clay to go: "make the logo black
        // and all the colors black instead of brown, it's better estetics".
        // `clay` is kept as a NAME so nothing has to be renamed across the
        // app, but every value in it is now a neutral - one place to change if
        // he ever wants an accent back.
        ink: '#141414', muted: '#6b6b6b', line: '#e6e4e1',
        clay: { DEFAULT: '#141414', dark: '#141414', light: '#f4f4f4' },
        paper: '#ffffff', soft: '#fafafa',
      },
      fontFamily: { sans: ['LatoText', 'system-ui', 'Segoe UI', 'sans-serif'] },
      maxWidth: { site: '1280px' },
    },
  },
  plugins: [],
} satisfies Config
