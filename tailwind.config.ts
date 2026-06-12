import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#22252c',
        'bg-2': '#2b3039',
        'bg-3': '#313742',
        'bg-4': '#383f4d',
        border: 'rgba(255, 255, 255, 0.05)',
        'border-2': 'rgba(255, 255, 255, 0.09)',
        'border-3': 'rgba(255, 255, 255, 0.13)',
        text: '#eef1f6',
        'text-2': '#8a95a3',
        'text-3': '#3d4f63',
        green: '#1ddb78',
        'green-bg': 'rgba(29, 219, 120, 0.06)',
        'green-border': 'rgba(29, 219, 120, 0.16)',
        red: '#ff5c5c',
        'red-bg': 'rgba(255, 92, 92, 0.07)',
        'red-border': 'rgba(255, 92, 92, 0.19)',
        yellow: '#f5c542',
        'yellow-bg': 'rgba(245, 197, 66, 0.07)',
        'yellow-border': 'rgba(245, 197, 66, 0.19)',
        blue: '#4d9fff',
        'blue-bg': 'rgba(77, 159, 255, 0.07)',
        'blue-border': 'rgba(77, 159, 255, 0.19)',
        purple: '#a78bfa',
        'purple-bg': 'rgba(167, 139, 250, 0.07)',
        'purple-border': 'rgba(167, 139, 250, 0.19)',
      },
      fontFamily: {
        serif: ['"Montserrat"', 'sans-serif'],
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      spacing: {
        '0.75': '0.1875rem',
        '1.5': '0.375rem',
        '1.75': '0.4375rem',
        '2.5': '0.625rem',
        '3.5': '0.875rem',
        '4.5': '1.125rem',
        '6.5': '1.625rem',
        '7': '1.75rem',
        '8.5': '2.125rem',
        '9.5': '2.375rem',
      },
      borderRadius: {
        '0.5': '0.125rem',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease both',
        'blink': 'blink 2s infinite',
        'marquee': 'marquee 15s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;