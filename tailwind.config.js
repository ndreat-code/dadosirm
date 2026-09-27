/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dado: {
          black: '#111111',
          green: '#1a7a5e',
          'green-light': '#1db88a',
          yellow: '#d4f000',
          purple: '#c840f0',
          orange: '#ff6b35',
          'orange-light': '#ff8c5a',
          teal: '#00c896',
          white: '#f5f5f0',
        }
      },
      fontFamily: {
        'major-mono':  ['"Major Mono Display"', 'monospace'],
        'monofett':    ['Monofett', 'display'],
        'inspiration': ['Inspiration', 'cursive'],
        'nico-moji':   ['"Nico Moji"', 'sans-serif'],
        'goldman':     ['Goldman', 'sans-serif'],
        'press-start': ['"Press Start 2P"', 'monospace'],
        'red-rose':    ['"Red Rose"', 'sans-serif'],
        'revalia':     ['Revalia', 'cursive'],
        'sixtyfour':   ['Sixtyfour', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
