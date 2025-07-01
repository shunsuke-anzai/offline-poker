import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cinzel: ['var(--font-cinzel)'],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(145deg, #BF953F, #FCF6BA, #B38728)",
      },
      boxShadow: {
        'gold': '0 0 15px 5px rgba(252, 246, 186, 0.4)',
      }
    },
  },
  plugins: [],
};
export default config;