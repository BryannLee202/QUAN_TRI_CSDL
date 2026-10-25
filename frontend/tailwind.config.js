/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'warm-slate': '#F8FAFC',
        'pine-green': '#0D5C3A',
        'champagne-gold': '#D4AF37',
        'obsidian-charcoal': '#0F172A',
      },
    },
  },
  plugins: [],
}