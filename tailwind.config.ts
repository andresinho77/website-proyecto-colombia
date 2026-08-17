import type { Config } from "tailwindcss";

const config: Config = {
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
        // Light-first warm-neutral scale (Airbnb/Funda direction): the SAME
        // "slate" name every component already uses, but inverted so 950 is
        // near-white (page/card bg) and 50 is near-black (primary text) —
        // this flips every existing bg-slate-950/text-slate-100/etc. from
        // the old dark theme to a light one with zero per-component edits.
        slate: {
          50: '#14141a',
          100: '#242430',
          200: '#3d3d4a',
          300: '#56566a',
          400: '#71717f',
          500: '#8a8a96',
          600: '#a7a7b0',
          700: '#c6c6cc',
          800: '#e4e4e8',
          900: '#f0f0f3',
          950: '#f7f7fa',
        },
        // Watermelon — "necesito alojamiento". Juicy warm pink-red, not a
        // dusty earth tone and not an alarm/"hot" red.
        rose: {
          50: '#fff1f3',
          100: '#ffe1e6',
          200: '#ffc3cd',
          300: '#ff96a8',
          400: '#fb6c82',
          500: '#f2465f',
          600: '#d92e49',
          700: '#b02339',
          800: '#861c2d',
          900: '#611624',
          950: '#3d0f18',
        },
        // Fresh green — "tengo espacio disponible" / trust & availability
        emerald: {
          50: '#eefaf3',
          100: '#d3f2e1',
          200: '#a3e4c1',
          300: '#6ecf9d',
          400: '#3fb87d',
          500: '#219d63',
          600: '#177d4f',
          700: '#136341',
          800: '#114f35',
          900: '#0e3f2b',
          950: '#082419',
        },
        // Gold, for cautionary accents (PIN, warnings)
        amber: {
          50: '#fff8ea',
          100: '#ffedc2',
          200: '#ffd982',
          300: '#ffc247',
          400: '#f7a721',
          500: '#e08a12',
          600: '#b96b0d',
          700: '#93520f',
          800: '#734111',
          900: '#4a2a0c',
        },
        solidarity: {
          50: '#eefaf3',
          100: '#d3f2e1',
          500: '#219d63',
          600: '#177d4f',
          700: '#136341',
          800: '#114f35',
          900: '#0e3f2b',
          950: '#082419',
        },
        emergency: {
          50: '#fff1f3',
          100: '#ffe1e6',
          500: '#f2465f',
          600: '#d92e49',
          700: '#b02339',
        },
        accent: {
          amber: '#f7a721',
          blue: '#0074e4',
        }
      },
    },
  },
  plugins: [],
};

export default config;
