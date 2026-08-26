import animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "hsl(var(--bg))",
        surface: "hsl(var(--surface))",
        "text-primary": "hsl(var(--text))",
        muted: "hsl(var(--muted))",
        stroke: "hsl(var(--stroke))",
      },
      fontFamily: {
        // 中文回退：正文 Noto Sans SC，展示衬线 Noto Serif SC（星海标题大量中文）
        body: ["Inter", "'Noto Sans SC'", "sans-serif"],
        display: ["'Instrument Serif'", "'Noto Serif SC'", "serif"],
      },
      // Keyframes/animations are defined in src/index.css (scroll-down,
      // role-fade-in, gradient-shift) per the design system spec.
    },
  },
  plugins: [animate],
};
