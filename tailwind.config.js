/** @type {import('tailwindcss').Config} */
module.exports = {
  // Asegúrate de que el contenido incluya tus archivos JSX/TSX
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "*-*.{js,ts,jsx,tsx,mdx}", // Agregué un patrón más general para asegurar que todos los archivos sean escaneados
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f6ffed",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};