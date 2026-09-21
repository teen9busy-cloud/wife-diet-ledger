/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf6f4',
          100: '#faece8',
          200: '#f6dcd5',
          300: '#eec2b5',
          400: '#df9e8c',
          500: '#ce7760',
          600: '#b84e33', // Key terracotta brown/orange from screenshots!
          700: '#9b3d24',
          800: '#803420',
          900: '#6b2f1e',
          950: '#3a150c',
        },
      },
    },
  },
  plugins: [],
}
