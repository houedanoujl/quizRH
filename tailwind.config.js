/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      // Variables CSS définies dans assets/css/main.scss
      colors: {
        ink: 'var(--ink)',
        'ink-2': 'var(--ink-2)',
        navy: 'var(--navy)',
        sky: 'var(--bg)',
        cream: 'var(--cream)',
        line: 'var(--line)',
        ciprel: {
          orange: 'var(--orange)',
          'orange-ink': 'var(--orange-ink)',
          green: 'var(--green)',
        },
        energy: 'var(--energy)',
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
        display: ['"Baloo 2"', 'sans-serif'],
        body: ['Nunito', 'sans-serif'],
      },
      borderRadius: {
        sm: '10px',
        md: '18px',
        answer: '22px',
        lg: '26px',
      },
    },
  },
  plugins: [],
}
