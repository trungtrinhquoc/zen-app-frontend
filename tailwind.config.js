/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'zen-dark': '#1a0b2e',
        'zen-purple': '#2d1b4e',
        'zen-primary': '#8B5CF6',
        'zen-accent': '#EC4899',
        'zen-light': '#A78BFA',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
