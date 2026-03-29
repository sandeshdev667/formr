import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#F5F4EF",
        surface: "#EEEDE7",
        dark: "#0A0A0A",
        accent: "#1A7A4A",
        "accent-hover": "#155C38",
        "text-muted": "#6B6B5E",
        "text-faint": "#A8A89E",
        border: "#DDDDD6",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['DM Serif Display', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;