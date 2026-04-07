import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#f2e8d8",
        "paper-dark": "#e8dcc8",
        ink: "#2a2622",
        "ink-muted": "#5c5348",
        sepia: "#6b5344",
        tape: "#d4a574",
      },
      fontFamily: {
        hand: ["var(--font-hand)", "cursive"],
        journal: ["var(--font-journal)", "cursive"],
      },
      boxShadow: {
        sheet: "2px 3px 0 rgba(42,38,34,0.12), 6px 10px 24px rgba(80,60,40,0.12)",
        lift: "0 1px 0 rgba(255,255,255,0.65) inset",
      },
    },
  },
  plugins: [],
};

export default config;
