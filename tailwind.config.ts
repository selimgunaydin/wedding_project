import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        champagne: "hsl(var(--champagne))",
        rose: "hsl(var(--rose))",
        sage: "hsl(var(--sage))",
        ink: "hsl(var(--ink))"
      },
      boxShadow: {
        soft: "0 24px 80px rgb(62 52 43 / 0.10)",
        line: "0 1px 0 rgb(62 52 43 / 0.08)"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"]
      },
      borderRadius: {
        xl: "0.5rem",
        "2xl": "0.75rem"
      }
    }
  },
  plugins: []
};

export default config;
