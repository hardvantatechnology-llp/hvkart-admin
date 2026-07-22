/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette: deep navy, royal blue, silver, light grey, white
        navy: {
          DEFAULT: "#0a1f44",
          light: "#13315c",
          dark: "#06132b",
        },
        royal: {
          DEFAULT: "#1e4fd8",
          light: "#3b6ef5",
          dark: "#1740b0",
        },
        silver: {
          DEFAULT: "#c4cdd9",
          light: "#dde3ea",
          dark: "#9aa6b5",
        },
        cloud: "#f4f7fb", // light grey background
        ink: "#0a1f44",

        // Premium dark-first palette (glass/liquid design system)
        obsidian: {
          DEFAULT: "#05060a",
          light: "#0a0c14",
          dark: "#020308",
        },
        graphite: {
          DEFAULT: "#0d0f16",
          light: "#14161f",
          dark: "#08090e",
        },
        midnight: {
          DEFAULT: "#0a1128",
          light: "#101a3a",
          dark: "#060a18",
        },
        electric: {
          DEFAULT: "#3b82f6",
          light: "#60a5fa",
          dark: "#2563eb",
        },
        cyan: {
          DEFAULT: "#22d3ee",
          light: "#67e8f9",
          dark: "#0891b2",
        },
        liquid: {
          DEFAULT: "#a855f7",
          light: "#c084fc",
          dark: "#8b5cf6",
        },

        // HV Kart brand palette — used only by storefront-facing components
        // (kept separate from the tokens above so /admin, which reuses those
        // same tokens, is unaffected by this recolor).
        brand: {
          blue: "#163E6E",
          navy: "#0F2747",
          steel: "#3F6E9C",
          silver: "#E8ECEF",
          grey: "#C7CDD5",
          bg: "#F7F8FA",
          text: "#1F2937",
          muted: "#6B7280",
          border: "#D9DEE5",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 12px rgba(10, 31, 68, 0.08)",
        "card-hover": "0 8px 28px rgba(10, 31, 68, 0.16)",
        "glow-electric": "0 0 40px -8px rgba(59, 130, 246, 0.45)",
        "glow-cyan": "0 0 40px -8px rgba(34, 211, 238, 0.45)",
        "glow-purple": "0 0 40px -8px rgba(168, 85, 247, 0.45)",
        glass: "0 8px 32px -8px rgba(0, 0, 0, 0.45), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)",
        "brand-sm": "0 2px 12px rgba(15, 39, 71, 0.08)",
        "brand-md": "0 8px 28px rgba(15, 39, 71, 0.16)",
        "brand-glow": "0 0 32px -8px rgba(22, 62, 110, 0.35)",
        "brand-glass": "0 8px 32px -8px rgba(15, 39, 71, 0.12), inset 0 1px 0 0 rgba(255, 255, 255, 0.6)",
        "brand-glass-strong": "0 16px 48px -12px rgba(15, 39, 71, 0.18), inset 0 1px 0 0 rgba(255, 255, 255, 0.7)",
      },
      borderRadius: {
        "3xl": "1.75rem",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        ripple: {
          "0%": { transform: "scale(0)", opacity: "0.45" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
      },
      animation: {
        shimmer: "shimmer 2.5s linear infinite",
        "gradient-x": "gradient-x 8s ease infinite",
        ripple: "ripple 0.6s ease-out forwards",
      },
    },
  },
  plugins: [],
};
