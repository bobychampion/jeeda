/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          green: '#10B981',
          DEFAULT: '#10B981',
        },
        text: {
          dark: '#1a1a1a',
        },
        background: {
          light: '#f5f5f5',
        },
        status: {
          delivered: '#10B981',
          'out-for-delivery': '#3B82F6',
          processing: '#F59E0B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
