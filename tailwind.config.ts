import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdf8f0",
          100: "#f9edd9",
          200: "#f2d8b0",
          300: "#e9bd7e",
          400: "#df9c4d",
          500: "#d6822d",
          600: "#c46a22",
          700: "#a3521f",
          800: "#844221",
          900: "#6c381e",
        },
      },
    },
  },
  plugins: [],
};

export default config;
