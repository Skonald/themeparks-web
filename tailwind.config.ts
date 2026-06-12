import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#1E88E5",
          accent: "#448AFF",
          "primary-dark": "#1565C0",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F8FAFC",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        "card-hover":
          "0 10px 25px -5px rgb(30 136 229 / 0.12), 0 4px 6px -4px rgb(0 0 0 / 0.08)",
        nav: "0 1px 0 0 rgb(0 0 0 / 0.05)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
      screens: {
        nav: "880px",
      },
    },
  },
  plugins: [],
};

export default config;
