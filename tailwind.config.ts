import type { Config } from "tailwindcss";

// Every shade below resolves through a CSS variable (defined in
// app/globals.css) instead of a literal hex, so the SAME class name
// (bg-slate-950, text-rose-500, ...) renders a different value in light vs.
// dark mode without touching a single component. Light values live on
// :root; dark values are re-declared under `@media (prefers-color-scheme:
// dark)`. The <alpha-value> placeholder keeps Tailwind's opacity modifiers
// (bg-slate-950/80) working with CSS variables.
function themed(name: string) {
  return `rgb(var(--color-${name}) / <alpha-value>)`;
}

const config: Config = {
  darkMode: 'media',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Warm-neutral scale, themed via CSS variables: light mode keeps the
        // Airbnb/Funda direction (950 near-white page/card bg, 50 near-black
        // text); dark mode re-declares the same steps the "right way round"
        // (950 near-black, 50 near-white) in globals.css.
        slate: {
          50: themed('slate-50'),
          100: themed('slate-100'),
          200: themed('slate-200'),
          300: themed('slate-300'),
          400: themed('slate-400'),
          500: themed('slate-500'),
          600: themed('slate-600'),
          700: themed('slate-700'),
          800: themed('slate-800'),
          900: themed('slate-900'),
          950: themed('slate-950'),
        },
        // Watermelon — "necesito alojamiento". Juicy warm pink-red, not a
        // dusty earth tone and not an alarm/"hot" red.
        rose: {
          50: themed('rose-50'),
          100: themed('rose-100'),
          200: themed('rose-200'),
          300: themed('rose-300'),
          400: themed('rose-400'),
          500: themed('rose-500'),
          600: themed('rose-600'),
          700: themed('rose-700'),
          800: themed('rose-800'),
          900: themed('rose-900'),
          950: themed('rose-950'),
        },
        // Fresh green — "tengo espacio disponible" / trust & availability
        emerald: {
          50: themed('emerald-50'),
          100: themed('emerald-100'),
          200: themed('emerald-200'),
          300: themed('emerald-300'),
          400: themed('emerald-400'),
          500: themed('emerald-500'),
          600: themed('emerald-600'),
          700: themed('emerald-700'),
          800: themed('emerald-800'),
          900: themed('emerald-900'),
          950: themed('emerald-950'),
        },
        // Gold, for cautionary accents (PIN, warnings)
        amber: {
          50: themed('amber-50'),
          100: themed('amber-100'),
          200: themed('amber-200'),
          300: themed('amber-300'),
          400: themed('amber-400'),
          500: themed('amber-500'),
          600: themed('amber-600'),
          700: themed('amber-700'),
          800: themed('amber-800'),
          900: themed('amber-900'),
        },
        solidarity: {
          50: themed('emerald-50'),
          100: themed('emerald-100'),
          500: themed('emerald-500'),
          600: themed('emerald-600'),
          700: themed('emerald-700'),
          800: themed('emerald-800'),
          900: themed('emerald-900'),
          950: themed('emerald-950'),
        },
        emergency: {
          50: themed('rose-50'),
          100: themed('rose-100'),
          500: themed('rose-500'),
          600: themed('rose-600'),
          700: themed('rose-700'),
        },
        accent: {
          amber: themed('accent-amber'),
          blue: themed('accent-blue'),
        },
        // WhatsApp brand green — a different hue register than `emerald`,
        // used only for the "Contactar por WhatsApp" action so it isn't
        // confused with the "Ofrezco" journey's emerald affordance.
        whatsapp: {
          500: themed('whatsapp-500'),
          600: themed('whatsapp-600'),
          700: themed('whatsapp-700'),
        },
        // US-1.7: distinct Footer background in light mode (see globals.css
        // for why — bg-slate-950 was indistinguishable from the page bg).
        footer: {
          DEFAULT: themed('footer-bg'),
          divider: themed('footer-divider'),
        },
      },
    },
  },
  plugins: [],
};

export default config;
