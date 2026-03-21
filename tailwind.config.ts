import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FDFCF8",
        foreground: "#2C2C24",
        primary: {
          DEFAULT: "#5D7052",
          foreground: "#F3F4F1",
        },
        secondary: {
          DEFAULT: "#C18C5D",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#E6DCCD",
          foreground: "#4A4A40",
        },
        muted: {
          DEFAULT: "#F0EBE5",
          foreground: "#78786C",
        },
        border: "#DED8CF",
        destructive: "#A85448",
        card: "#FEFEFA",
      },
      fontFamily: {
        heading: ["Fraunces", "Georgia", "serif"],
        body: ["Nunito", "system-ui", "sans-serif"],
      },
      borderRadius: {
        organic: "60% 40% 30% 70% / 60% 30% 70% 40%",
        "organic-2": "30% 70% 70% 30% / 30% 30% 70% 70%",
        "organic-3": "70% 30% 50% 50% / 40% 60% 40% 60%",
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(93, 112, 82, 0.15)",
        float: "0 10px 40px -10px rgba(193, 140, 93, 0.2)",
        "soft-hover": "0 20px 40px -10px rgba(93, 112, 82, 0.15)",
        "soft-lg": "0 6px 24px -4px rgba(93, 112, 82, 0.25)",
      },
      animation: {
        "float-slow": "float 8s ease-in-out infinite",
        "float-slower": "float 12s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
