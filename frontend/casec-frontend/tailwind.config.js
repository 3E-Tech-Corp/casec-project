/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary, #047857)',
          dark: 'var(--color-primary-dark, #065f46)',
          light: 'var(--color-primary-light, #d1fae5)',
        },
        accent: {
          DEFAULT: 'var(--color-accent, #f59e0b)',
          dark: 'var(--color-accent-dark, #d97706)',
          light: 'var(--color-accent-light, #fef3c7)',
        },
        success: 'var(--color-success, #10b981)',
        error: 'var(--color-error, #ef4444)',
        warning: 'var(--color-warning, #f59e0b)',
        info: 'var(--color-info, #3b82f6)',
      },
      fontFamily: {
        sans: ['var(--font-family, Inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-family-heading, Playfair Display)', 'serif'],
      },
    },
  },
  plugins: [],
}
