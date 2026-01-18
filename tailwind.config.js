module.exports = {
  darkMode: "class",
  content: [
    "./app/components/**/*.{js,vue,ts}",
    "./app/layouts/**/*.vue",
    "./app/pages/**/*.vue",
    "./app/plugins/**/*.{js,ts}",
    "./app/app.vue",
    "./app/error.vue",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-primary)",
        surface: "var(--bg-secondary)",
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        border: "var(--border-color)",
        brand: "var(--accent-color)",
      },
    },
  },
  plugins: [],
};
