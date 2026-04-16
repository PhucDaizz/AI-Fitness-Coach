/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0e0e0e',
        primary: {
          DEFAULT: '#b1ff24',
          container: '#a4f005',
        },
        secondary: '#6a9cff',
        surface: {
          lowest: '#000000',
          DEFAULT: '#1a1919',
          highest: '#262626',
        },
        'on-surface': {
          variant: '#adaaaa',
        },
        'outline-variant': '#494847',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

