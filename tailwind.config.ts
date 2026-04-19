import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Geist Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: 'var(--bg)',
        fg: 'var(--fg)',
        'fg-muted': 'var(--fg-muted)',
        'fg-subtle': 'var(--fg-subtle)',
        border: 'var(--border)',
        'surface-hover': 'var(--surface-hover)',
        accent: 'var(--accent)',
        'accent-fg': 'var(--accent-fg)',
        danger: 'var(--danger)',
      },
      borderRadius: {
        control: '6px',
        row: '4px',
      },
    },
  },
  plugins: [],
} satisfies Config
