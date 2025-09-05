/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'hsl(210 40% 96.1%)',
        accent: 'hsl(210 85% 45%)',
        primary: 'hsl(222.2 47.4% 11.2%)',
        surface: 'hsl(0 0% 100%)',
        'text-primary': 'hsl(217.9 26.3% 15%)',
        'text-secondary': 'hsl(217.9 26.3% 35%)',
      },
      borderRadius: {
        'lg': '12px',
        'md': '8px',
        'sm': '4px',
      },
      boxShadow: {
        'card': '0 4px 12px hsla(217, 26%, 15%, 0.1)',
      },
      spacing: {
        'lg': '24px',
        'md': '16px',
        'sm': '8px',
      },
    },
  },
  plugins: [],
}