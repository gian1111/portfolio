/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        background: '#000000',     // Il nero profondo
        accent: '#F6FB6B',         // Il giallo acido per CTA e dettagli
        foreground: '#FFFFFF',     // Il bianco puro per testi principali
        muted: '#C2C2C2',          // Grigio medio per testi secondari
        surface: '#E8E8E8',       // Grigio chiaro per bordi o card chiare
      },
    },
  },
  plugins: [],
}