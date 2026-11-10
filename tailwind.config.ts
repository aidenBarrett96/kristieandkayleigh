import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Matches the printed invitation: warm cream card, black line-art ink.
        stone: {
          DEFAULT: "#F6F1E6",
          light: "#FBF8F1",
          dark: "#EDE6D7",
        },
        ink: {
          DEFAULT: "#20201E",
          soft: "#4A463F",
          faint: "#8B8378",
        },
        line: "#D9CFBC",
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
