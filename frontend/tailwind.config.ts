import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",   // Never auto-activate dark mode — only via explicit .dark class (we never add it)
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        blue: {
          50: "#eff6ff", 100: "#dbeafe", 200: "#bfdbfe",
          300: "#93c5fd", 400: "#60a5fa", 500: "#3b82f6",
          600: "#2563eb", 700: "#1d4ed8", 800: "#1e40af", 900: "#1e3a8a",
        },
        slate: {
          50: "#f8fafc",  75: "#f3f6f9", 100: "#f1f5f9",
          150: "#eaf0f6", 200: "#e2e8f0", 300: "#cbd5e1",
          400: "#94a3b8", 500: "#64748b", 600: "#475569",
          700: "#334155", 800: "#1e293b", 900: "#0f172a",
        },
        emerald: {
          50: "#ecfdf5", 100: "#d1fae5", 500: "#10b981",
          600: "#059669", 700: "#047857",
        },
        amber: {
          50: "#fffbeb", 100: "#fef3c7", 500: "#f59e0b",
          600: "#d97706", 700: "#b45309",
        },
        red: {
          50: "#fef2f2", 100: "#fee2e2", 400: "#f87171",
          500: "#ef4444", 600: "#dc2626",
        },
      },
      boxShadow: {
        xs:    "0 1px 2px 0 rgb(0 0 0 / 0.04)",
        sm:    "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        md:    "0 4px 8px -2px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.04)",
        lg:    "0 8px 20px -4px rgb(0 0 0 / 0.1), 0 4px 8px -4px rgb(0 0 0 / 0.05)",
        modal: "0 24px 64px -12px rgb(0 0 0 / 0.2), 0 8px 20px -6px rgb(0 0 0 / 0.1)",
        card:  "0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        "card-hover": "0 6px 16px -4px rgb(0 0 0 / 0.1), 0 2px 6px -2px rgb(0 0 0 / 0.05)",
        toast: "0 8px 24px -4px rgb(0 0 0 / 0.14), 0 2px 8px -2px rgb(0 0 0 / 0.06)",
        "inner-sm": "inset 0 1px 2px 0 rgb(0 0 0 / 0.05)",
      },
      borderRadius: {
        sm: "0.25rem", DEFAULT: "0.375rem", md: "0.5rem",
        lg: "0.625rem", xl: "0.75rem", "2xl": "1rem",
        "3xl": "1.25rem", full: "9999px",
      },
      screens: {
        xs: "480px", sm: "640px", md: "768px",
        lg: "1024px", xl: "1280px", "2xl": "1536px",
      },
    },
  },
  plugins: [],
};

export default config;
