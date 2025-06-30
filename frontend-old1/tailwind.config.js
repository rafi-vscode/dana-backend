// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#007bff",
        accent: "#ffd700",
        dark: "#1e1e2f",
        light: "#f9fafb",
      },
    },
  },
  plugins: [],
};
