/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        base: '#0b0e14',
        panel: '#131722',
        border: '#232838',
        accent: '#4f8cff',
        good: '#3ecf8e',
        warn: '#e8b339',
        bad: '#ef5b5b',
      },
    },
  },
  plugins: [],
};
