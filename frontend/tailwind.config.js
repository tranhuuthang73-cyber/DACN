/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nature: {
          light: '#f4f1ea', // beige
          DEFAULT: '#889c76', // soft green
          dark: '#586b45',
          accent: '#d88c51' // earthy orange
        }
      }
    },
  },
  plugins: [],
}
