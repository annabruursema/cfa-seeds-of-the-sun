/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        gallery: {
          50: '#faf9f7',
          100: '#f0eeea',
          200: '#e0dcd4',
          300: '#c9c2b6',
          400: '#b0a595',
          500: '#9a8c79',
          600: '#8a7b6a',
          700: '#736658',
          800: '#60554b',
          900: '#504841',
          950: '#2a2521',
        },
      },
    },
  },
  plugins: [],
};
