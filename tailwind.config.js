/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#08080a',
        onyx: '#040406',
        carbon: '#121317',
        graphite: '#1c1d22',
        slate: '#2e3038',
        smoke: '#464853',
        ash: '#5e616e',
        steel: '#777a88',
        fog: '#9194a1',
        mist: '#acafb9',
        silver: '#c7c9d1',
        bone: '#e2e3e9',
        'paper-white': '#ffffff',
        copper: '#cc9166',
        surface: {
          0: '#08080a', // obsidian
          1: '#040406', // onyx
          2: '#121317', // carbon
          3: '#18181e',
          4: '#22232a',
          5: '#2e3038',
        },
        border: {
          subtle: '#1c1d22', // graphite hairline
          default: '#24252d',
          strong: '#2e3038', // slate
        },
        accent: {
          copper: '#cc9166',
          gilded: '#ae9357',
          blue: '#3b82f6',
          green: '#22c55e',
          yellow: '#eab308',
          red: '#ef4444',
          purple: '#a855f7',
          cyan: '#06b6d4',
        },
        text: {
          primary: '#e2e3e9', // bone
          secondary: '#9194a1', // fog
          tertiary: '#5e616e', // ash
          inverse: '#08080a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Ivy Presto"', '"Playfair Display"', '"DM Serif Display"', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      boxShadow: {
        'elevated': '0 2px 8px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.2)',
        'modal': '0 8px 32px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
}
