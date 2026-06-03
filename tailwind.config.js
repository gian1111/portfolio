/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./js/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        accent: '#F6FB6B',
        foreground: '#FFFFFF',
        muted: '#C2C2C2',
        surface: '#E8E8E8',
      },
      fontFamily: {
        'satoshi': ['Satoshi', 'sans-serif'],
        'aujournuit': ['aujournuit', 'serif'],
      },
    },
  },
  plugins: [],
}
