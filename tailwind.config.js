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
        // Nueva paleta Pickap
        'pickap-yellow': '#F5C518',
        'pickap-black': '#1B1B1B',
        'pickap-white': '#FFFFFF',
        'pickap-green': '#4CAF50',
        'pickap-red': '#E53935',
        'pickap-gray': '#F9FAFB',
        'pickap-gray-dark': '#6B7280',
        
        // Alias legacy para compatibilidad (se irán removiendo)
        beige:    '#CCAD7F',
        brick:    '#1B1B1B', // Ahora mapea a negro Pickap
        'brick-light': '#1B1B1B',
        mustard: '#F5C518', // Ahora mapea a amarillo Pickap
        copper:  '#F5C518',
        gold:     '#F5C518', // Ahora mapea a amarillo Pickap
        'gold-light': '#FDE68A',
        olive:    '#556B2F',
        teal:     '#2C7A7B',
        navy:     '#2A4365',
        slate:    '#64748B',
      }
    }
  },
  plugins: [],
}
