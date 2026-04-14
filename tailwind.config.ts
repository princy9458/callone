import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
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
        surface: {
          DEFAULT: "var(--surface)",
          muted: "var(--surface-muted)",
          elevated: "var(--surface-elevated)",
          strong: "var(--surface-strong)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          strong: "var(--primary-strong)",
        },
        border: "var(--border)",
        success: "var(--success)",
        danger: "var(--danger)",
        warning: "var(--warning)",
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: "var(--accent)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
