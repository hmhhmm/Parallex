import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
        space: ['var(--font-space-grotesk)', 'sans-serif'],
      },
      colors: {
        void: '#000000',
        'parallex-cyan': '#00FFFF',
        'parallex-blue': '#0066FF',
        'parallex-magenta': '#FF00FF',
        'galaxy-cyan': '#5DBADB',
        'galaxy-blue': '#3568C9',
        'galaxy-magenta': '#A04AB5',
        'galaxy-core': '#A5D8EE',
        'ui-text': '#F5F5F8',
        'ui-dim': '#C5D8E8',
        'ui-muted': '#8A95A8',
        'ui-faint': '#6B7895',
        'ui-ghost': '#4A5568',
      },
    },
  },
  plugins: [],
}

export default config
