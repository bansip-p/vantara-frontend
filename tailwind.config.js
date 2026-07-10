/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vantaraGreen: '#1B4332',
        vantaraGold: '#D4A017',
      },
    },
  },
  plugins: [],
}