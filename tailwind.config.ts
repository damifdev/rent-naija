import type { Config } from "tailwindcss";

// Tokens come straight from the Stitch design system (DESIGN.md).
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F6F1E8", // page canvas
        surface: "#FFFCF7", // cards and forms
        ink: "#1C1917", // primary text
        clay: "#78716C", // secondary text
        stone: "#E7E5E4", // hairline borders
        palm: { DEFAULT: "#1B6B4A", dark: "#145238", soft: "#E8F3EC" },
        alert: "#B42318",
        whatsapp: "#25D366",
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans Variable"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        whisper: "0 1px 2px rgba(28,25,23,.04), 0 2px 10px rgba(28,25,23,.05)",
      },
      maxWidth: { page: "1200px" },
    },
  },
  plugins: [],
};
export default config;
