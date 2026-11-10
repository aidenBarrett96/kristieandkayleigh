import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Matches the save-the-date: warm stone background, soft charcoal ink.
        stone: {
          DEFAULT: "#ECEAE6",
          light: "#F4F2EF",
          dark: "#E3E0DB",
        },
        ink: {
          DEFAULT: "#3A3A38",
          soft: "#5C5B58",
          faint: "#8A8884",
        },
        line: "#D6D2CC",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        script: ["var(--font-script)", "cursive"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.28em",
      },
    },
  },
  plugins: [],
};

export default config;
