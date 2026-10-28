/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        earth: {
          50: '#fbfaf8',
          100: '#f5f2eb',
          200: '#e8e2d5',
          300: '#d6cbb8',
          400: '#bcae96',
          500: '#9e8f76',
          600: '#80725c',
          700: '#665b4a',
          800: '#52493d',
          900: '#433c33',
        }
      }
    },
  },
  plugins: [],
}

