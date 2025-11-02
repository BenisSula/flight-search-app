/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'media', // Enable dark mode based on prefers-color-scheme
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/features/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#4285f4',
        'accent-yellow': '#fbbc05',
        'text-dark': '#202124',
      },
      backgroundImage: {
        'flight-hero': 'url("/flight.png")',
      },
      animation: {
        'pulse-0': 'pulse 1.4s ease-in-out 0s infinite',
        'pulse-1': 'pulse 1.4s ease-in-out 0.2s infinite',
        'pulse-2': 'pulse 1.4s ease-in-out 0.4s infinite',
      },
    },
  },
  plugins: [],
}
