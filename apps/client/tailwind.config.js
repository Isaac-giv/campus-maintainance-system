/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Cosmopolitan University brand palette (deep university navy & summit gold)
        primary: {
          50: '#eef1f7',
          100: '#d6dded',
          200: '#adbbd9',
          300: '#8499c5',
          400: '#5b77b1',
          500: '#3a5a9e',
          600: '#2d4880',
          700: '#1e2a4a', // Core brand navy
          800: '#17203a',
          900: '#0f1526',
        },
        accent: {
          DEFAULT: '#f59e0b', // Amber accent for call-to-action
          light: '#fde68a',
          dark: '#b45309',
        },
        // Status colours consistent with ReportStatus enum
        status: {
          pending: '#f59e0b',
          assigned: '#3b82f6',
          inProgress: '#8b5cf6',
          awaitingVerification: '#06b6d4',
          resolved: '#22c55e',
          rejected: '#ef4444',
          cancelled: '#6b7280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
