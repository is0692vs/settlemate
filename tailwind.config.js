/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          500: "#6b7280", // より濃いグレー（元の#6b7280から#6b7280に変更）
          600: "#4b5563", // より濃いグレー
          700: "#374151", // より濃いグレー
        },
      },
    },
  },
  plugins: [],
};
