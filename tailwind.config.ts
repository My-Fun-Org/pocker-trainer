import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        felt: {
          DEFAULT: "#1b6b47",
          dark: "#0f4d31",
          light: "#2a8a5e",
        },
        table: {
          rail: "#3a2417",
          railLight: "#5a3a22",
        },
        chip: {
          red: "#d4453b",
          blue: "#2f6fb0",
          green: "#2e8b57",
          black: "#222222",
          gold: "#e0b64a",
        },
      },
      fontFamily: {
        display: ["'Poppins'", "system-ui", "sans-serif"],
      },
      gridTemplateColumns: {
        13: "repeat(13, minmax(0, 1fr))",
      },
      boxShadow: {
        table: "inset 0 0 120px rgba(0,0,0,0.55), 0 20px 60px rgba(0,0,0,0.5)",
        card: "0 4px 12px rgba(0,0,0,0.35)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out",
      },
    },
  },
  plugins: [],
} satisfies Config;
