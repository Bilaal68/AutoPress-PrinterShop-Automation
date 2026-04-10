/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-navy': '#1a1a2e',
        'teal': {
          400: '#00b4d8',
          500: '#0096c7',
          600: '#0077b6',
        }
      }
    },
  },
  plugins: [],
}