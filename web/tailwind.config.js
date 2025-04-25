/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'rytm-base': '#0f0f11',
        'rytm-surface': '#1c1c1f',
        'rytm-panel': '#151518',
        'rytm-border': '#27272a',
        'rytm-accent': '#7c3aed',
        'rytm-accent-hover': '#8b5cf6',
        'rytm-text-primary': '#f4f4f5',
        'rytm-text-secondary': '#a1a1aa'
      },
      borderRadius: {
        button: '0.25rem'
      },
      scale: {
        '98': '0.98'
      }
    },
  },
  plugins: [],
}
