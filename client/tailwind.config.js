/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      ringColor: {
        'DEFAULT': '#1e40af', // blue-800 - high contrast default focus ring
        'dark': '#60a5fa', // blue-400 - accessible dark mode focus ring
      },
      colors: {
        'focus': {
          light: '#1e40af', // blue-800 - high contrast
          dark: '#60a5fa',  // blue-400 - accessible in dark mode
        }
      }
    },
  },
  plugins: [],
};


