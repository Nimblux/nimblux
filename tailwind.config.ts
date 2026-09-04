import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#090B0B",
        foreground: "#F5F1E8",
        surface: {
          primary: "#090B0B",
          secondary: "#0E1110",
          card: "#111615",
          elevated: "#151A18",
          hover: "#181F1C",
        },
        ivory: {
          50: "#FAFAF7",
          100: "#F5F1E8", // Main text
          200: "#E7D5B2", // Light beige
          300: "#D6D5CD",
          400: "#A9AAA5", // Secondary text
          500: "#7E807B", // Muted text
        },
        charcoal: {
          800: "#1C2321",
          850: "#151A18", // Elevated card
          900: "#0E1110", // Secondary bg
          950: "#090B0B", // Primary bg
          card: "#111615", // Card bg
          cardBorder: "rgba(255, 255, 255, 0.08)", // Standard border
          hover: "#181F1C",
        },
        bronze: {
          50: "#FBF8F3",
          100: "#F5EFE4",
          200: "#EFE5CE",
          300: "#E7D5B2", // Light beige
          400: "#E0C99A",
          500: "#D8B77A", // Warm gold / beige accent
          600: "#C39F5F",
          700: "#9A7A41",
          800: "#6B5328",
          900: "#3E2E13",
        },
        forest: {
          50: "#F3F7F4",
          100: "#E3ECE5",
          200: "#C4D8C8",
          300: "#A6C2AB",
          400: "#8FA58E", // Muted green
          500: "#455A4B", // Deep green
          600: "#37493D",
          700: "#2B3A30",
          800: "#1F2A23",
          900: "#141C16",
        },
        sage: {
          50: "#F4F7F4",
          100: "#E5ECE6",
          200: "#C8D9CB",
          300: "#AAC4AE",
          400: "#8FA58E", // Muted green
          500: "#758A74",
          600: "#5D6E5C",
          700: "#465345",
        },
        fog: {
          300: "#D0D3CF",
          400: "#B8BAB5",
          500: "#A7AAA6", // Fog gray
          600: "#8B8D89",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        serif: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        display: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "Geist Mono",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      backgroundImage: {
        "gold-radial": "radial-gradient(ellipse 70% 50% at 50% -20%, rgba(216, 183, 122, 0.09), transparent 70%)",
        "fog-radial": "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(167, 170, 166, 0.06), transparent 70%)",
        "green-radial": "radial-gradient(ellipse 60% 40% at 50% 10%, rgba(69, 90, 75, 0.12), transparent 70%)",
        "card-ambient": "radial-gradient(400px circle at var(--mouse-x, 0) var(--mouse-y, 0), rgba(216, 183, 122, 0.04), transparent 80%)",
      },
      boxShadow: {
        soft: "0 2px 10px 0 rgba(0, 0, 0, 0.35)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.4)",
        "card-hover": "0 12px 32px -4px rgba(0, 0, 0, 0.55), 0 0 1px 1px rgba(216, 183, 122, 0.15)",
        button: "0 2px 10px -1px rgba(216, 183, 122, 0.25)",
      },
      borderRadius: {
        button: "9px",
        input: "11px",
        card: "15px",
        section: "20px",
      },
      animation: {
        "fade-up": "fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fadeIn 0.3s ease-out forwards",
        "ambient-drift": "ambientDrift 14s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        ambientDrift: {
          "0%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(15px, -10px) scale(1.03)" },
          "100%": { transform: "translate(-10px, 15px) scale(0.98)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
