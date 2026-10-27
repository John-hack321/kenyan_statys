/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
    "./providers/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "dark-green-ascents": "#064D30",
        "brand": "#064D30",
        "brand-soft": "#0A7A4D",
        "black-300": "#5D5F6D",
        "primary-300": "#064D30",
        "gray-200": "#E5E7EB",
      },
    },
  },
  plugins: [],
};
