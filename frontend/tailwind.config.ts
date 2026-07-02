import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b5bdb',
          600: '#2f4bc7',
          700: '#263ea3',
          900: '#1b2b6b',
        },
      },
    },
  },
  plugins: [],
};
export default config;
