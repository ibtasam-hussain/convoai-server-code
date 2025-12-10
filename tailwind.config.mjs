/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      screens: {
        '4xl': '1600px',
        '3xl': '1500px',
        '2xl': '1366px',
        'xl': '1366px',
        '3lg': '1200px',
        '2lg': '1150px',
        'lg': '1024px',
        '2md': '900px',
        'md': '768px',
        '4sm': '650px',
        '3sm': '600px',
        '2sm': '550px',
        'sm': '500px',
        'xs': '450px',
        '2xs': '410px',
        '3xs': '375px',
        '4xs': '350px',
        '5xs': '325px',
      },

    },
  },
  plugins: [],
};
