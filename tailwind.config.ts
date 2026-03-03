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
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#63d297",
          dark: "#4ecdc4",
          light: "#7edba8",
        },
        card: "rgba(255,255,255,0.03)",
        "card-hover": "rgba(255,255,255,0.06)",
        surface: {
          DEFAULT: "#12121c",
          dark: "#0a0a0f",
        },
      },
      maxWidth: {
        app: "430px",
      },
      borderRadius: {
        card: "16px",
        "card-lg": "18px",
      },
      minHeight: {
        touch: "44px",
      },
      minWidth: {
        touch: "44px",
      },
    },
  },
  plugins: [],
};
export default config;
