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
        beige:    '#CCAD7F',
        brick:    '#CC603B',
        'brick-light': '#CC7A3B',
        mustard: '#CCB53B',
        copper:  '#CC7A3B',
        gold:     '#EFD700',
        'gold-light': '#E6CBA8',
        olive:    '#556B2F',
        teal:     '#2C7A7B',
        navy:     '#2A4365',
        slate:    '#64748B',
      }
    }
  },
  plugins: [],
}
