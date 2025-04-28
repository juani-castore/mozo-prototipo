// tailwind.config.js
const theme = require('./src/theme.js')  // ajusta la ruta si tu theme.js está en otro lugar

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // importa TODOS tus colores
        ...theme.colors,
      }
    }
  },
  // si no usas dark mode, simplemente elimínalo; si quieres clase, pon 'class'
  // darkMode: 'class',
  plugins: [],
}
