module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ], // Escanea las rutas necesarias para Tailwind
  theme: {
    extend: {
      colors: {
        brick: "#CC603B", // Color principal (ladrillo)
        "brick-light": "#E3875D", // Versión más clara del ladrillo
        "brick-dark": "#A84F32", // Versión más oscura del ladrillo
        gold: "#FFD700", // Color dorado
        "gold-light": "#FFE066", // Versión más clara del dorado
        "gold-dark": "#BFA500", // Versión más oscura del dorado
        white: "#FFFFFF", // Color blanco
        gray: {
          100: "#F5F5F5", // Gris muy claro
          300: "#D9D9D9", // Gris claro
          500: "#A3A3A3", // Gris medio
          700: "#6C6C6C", // Gris oscuro
          900: "#3D3D3D", // Gris muy oscuro
        },
        black: "#000000", // Negro puro
        blue: {
          100: "#DCEEFB", // Azul claro
          300: "#8AB6D6", // Azul medio
          500: "#4F8FC4", // Azul principal
          700: "#1A567B", // Azul oscuro
        },
        green: {
          100: "#DFF7DF", // Verde claro
          300: "#88D18A", // Verde medio
          500: "#4CAF50", // Verde principal
          700: "#2B7A2F", // Verde oscuro
        },
        red: {
          100: "#FFD8D8", // Rojo claro
          300: "#F58B8B", // Rojo medio
          500: "#E53935", // Rojo principal
          700: "#A12727", // Rojo oscuro
        },
        yellow: {
          100: "#FFF5CC", // Amarillo claro
          300: "#FFDD80", // Amarillo medio
          500: "#FFC107", // Amarillo principal
          700: "#B38705", // Amarillo oscuro
        },
      },
      fontFamily: {
        sans: ["Roboto", "Arial", "sans-serif"], // Fuente base
        serif: ["Merriweather", "serif"], // Fuente alternativa para estilos elegantes
        mono: ["Courier New", "monospace"], // Fuente monoespaciada
      },
    },
  },
  plugins: [],
};
