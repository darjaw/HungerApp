/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        bungeeShade: ["Bungee Shade", "sans-serif"],
        cousine: ["Cousine", "monospace"],
      },
    },
  },
};
