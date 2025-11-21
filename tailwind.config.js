/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // ✅ Enables manual dark mode toggle
  content: [
    "./index.html", // ✅ Make sure this is included
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#F97316",  // warm orange
        secondary: "#FBBF24", // golden accent
        darkbg: "#1E1E1E",   // dark background
        lightbg: "#FFF7ED",  // soft cream
        textDark: "#2E2E2E",
        textLight: "#FAFAFA",
        white: "#ffffff",
        black: "#000000",
        gray: {
          100: "#f3f4f6",
          300: "#d1d5db",
          400: "#9ca3af",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
        },
      },
      boxShadow: {
        smooth: "0 4px 14px rgba(0, 0, 0, 0.08)",
      },
    },
  },
  plugins: [],
};
