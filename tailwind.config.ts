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
        background: "#0D0E11",
        foreground: "#F4F4EE",
        ivory: {
          50: "#FAFAF7",
          100: "#F4F4EE",
          200: "#EAEAE2",
          300: "#DCDCD2",
          400: "#C4C4B8",
          500: "#9E9E90",
        },
        charcoal: {
          800: "#22242A",
          850: "#1A1C21",
          900: "#141518",
          950: "#0D0E11",
          card: "#131519",
          cardBorder: "#24272E",
          hover: "#1A1C22",
        },
        bronze: {
          50: "#FBF8F3",
          100: "#F5EFE4",
          200: "#E9DCBF",
          300: "#DBC79A",
          400: "#CBB175",
          500: "#C5A880",
          600: "#A88B4B",
          700: "#7F6838",
          800: "#574726",
          900: "#362C17",
        },
        forest: {
          50: "#F2F7F4",
          100: "#E1EDE6",
          200: "#C3DBCF",
          300: "#98BFAD",
          400: "#699F87",
          500: "#2D5A47",
          600: "#244939",
          700: "#1B372B",
          800: "#1B4D3E",
          900: "#0F211A",
        },
        sage: {
          50: "#F6F8F6",
          100: "#E9ECE9",
          200: "#D4DAD4",
          300: "#B8C2B8",
          400: "#9FA99F",
          500: "#8A9A86",
          600: "#6B7B67",
          700: "#505D4D",
        },
        taupe: {
          300: "#D8D6CE",
          400: "#B8B5AB",
          500: "#969389",
          600: "#747168",
        },
      },
      fontFamily: {
        serif: [
          "Newsreader",
          "Playfair Display",
          "Georgia",
          "Cambria",
          "serif",
        ],
        sans: [
          "Plus Jakarta Sans",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: [
          "Plus Jakarta Sans",
          "Inter",
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
        "fog-radial": "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(197, 168, 128, 0.08), transparent 70%)",
        "forest-radial": "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(45, 90, 71, 0.12), transparent 70%)",
        "card-ambient": "radial-gradient(400px circle at var(--mouse-x, 0) var(--mouse-y, 0), rgba(197, 168, 128, 0.04), transparent 80%)",
      },
      boxShadow: {
        editorial: "0 1px 2px 0 rgba(0, 0, 0, 0.05), 0 8px 24px -4px rgba(0, 0, 0, 0.3)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.25)",
        "card-hover": "0 12px 32px -4px rgba(0, 0, 0, 0.45), 0 0 1px 1px rgba(197, 168, 128, 0.15)",
        button: "0 2px 10px -1px rgba(197, 168, 128, 0.25)",
      },
      animation: {
        "fade-up": "fadeUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fadeIn 0.3s ease-out forwards",
        "float-subtle": "floatSubtle 6s ease-in-out infinite",
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
        floatSubtle: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
