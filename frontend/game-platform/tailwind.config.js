/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'alphabets-primary': '#7c3aed',
        'alphabets-secondary': '#3b82f6',
        'numerals-primary': '#10b981',
        'numerals-secondary': '#14b8a6',
        'words-primary': '#f97316',
        'words-secondary': '#ec4899',
        'phrases-primary': '#6366f1',
        'phrases-secondary': '#8b5cf6',
      },
    },
  },
  plugins: [],
}