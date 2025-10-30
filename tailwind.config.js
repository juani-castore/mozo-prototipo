// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Nueva paleta Pickap - Rojo, Azul y Blanco (tonos profesionales)
        'pickap-primary': '#E63946',      // Rojo coral elegante
        'pickap-secondary': '#457B9D',    // Azul profundo profesional
        'pickap-accent': '#2A9D8F',       // Verde azulado sofisticado
        'pickap-dark': '#1D3557',         // Azul marino oscuro
        'pickap-light': '#F8F9FA',        // Gris muy claro casi blanco
        'pickap-white': '#FFFFFF',        // Blanco puro
        
        // Alias legacy para compatibilidad
        'pickap-yellow': '#E63946',
        'pickap-black': '#1D3557',
        'pickap-green': '#2A9D8F',
        'pickap-red': '#E63946',
        'pickap-gray': '#F8F9FA',
        'pickap-gray-dark': '#6C757D',
        
        beige:    '#CCAD7F',
        brick:    '#1E272E',
        'brick-light': '#1E272E',
        mustard: '#FF4757',
        copper:  '#FF4757',
        gold:     '#FF4757',
        'gold-light': '#FDE68A',
        olive:    '#556B2F',
        teal:     '#2C7A7B',
        navy:     '#2A4365',
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-slow': 'bounce 2s ease-in-out infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      slate: '#64748B',
    }
  },
  plugins: [],
}
