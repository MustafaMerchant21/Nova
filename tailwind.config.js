// tailwind.config.js
const {heroui} = require("@heroui/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        "pop-blob": {
          "0%": { transform: "scale(1)" },
          "33%": { transform: "scale(1.2)" },
          "66%": { transform: "scale(0.8)" },
          "100%": { transform: "scale(1)" },
        },
      },
      colors: {
        filter: {
        "blur-20": "blur(20px)",
        "blur-25": "blur(25px)",
        },
      },
      animation: {
        "pop-blob": "pop-blob 0.5s infinite",
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};