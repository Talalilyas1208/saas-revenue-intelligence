/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      colors: {
        canvas: '#09090b',
        surface: {
          50: '#1e1e24',
          100: '#18181b',
          200: '#141416',
          300: '#101012',
          DEFAULT: '#121215',
        },
        border: {
          subtle: 'rgba(255, 255, 255, 0.06)',
          DEFAULT: 'rgba(255, 255, 255, 0.09)',
          bright: 'rgba(255, 255, 255, 0.16)',
        },
        accent: {
          DEFAULT: '#6366f1',
          hover: '#4f46e5',
          glow: 'rgba(99, 102, 241, 0.15)',
        }
      },
      boxShadow: {
        'bevel': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        'bevel-subtle': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.03)',
        'elevated': '0 10px 30px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.06)',
      }
    },
  },
  plugins: [],
}
