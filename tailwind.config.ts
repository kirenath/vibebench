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
        organic: {
          bg: "#FDFCF8",
          fg: "#2C2C24",
          primary: "#5D7052",
          "primary-fg": "#F3F4F1",
          secondary: "#C18C5D",
          "secondary-fg": "#FFFFFF",
          accent: "#E6DCCD",
          "accent-fg": "#4A4A40",
          muted: "#F0EBE5",
          "muted-fg": "#78786C",
          border: "#DED8CF",
          destructive: "#A85448",
          card: "#FEFEFA",
          stone: "#F0EBE5",
        },
      },
      fontFamily: {
        heading: ["'Fraunces'", "Georgia", "serif"],
        body: ["'Nunito'", "system-ui", "sans-serif"],
      },
      borderRadius: {
        organic: "2rem",
        "organic-lg": "3rem",
        blob: "60% 40% 30% 70% / 60% 30% 70% 40%",
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(93, 112, 82, 0.15)",
        float: "0 10px 40px -10px rgba(193, 140, 93, 0.2)",
        "soft-hover": "0 20px 40px -10px rgba(93, 112, 82, 0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
