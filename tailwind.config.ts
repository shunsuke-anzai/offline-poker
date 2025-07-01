import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // "app/layout.tsx" で読み込んだフォントを 'font-cinzel' というクラスで使えるように設定
        cinzel: ['"Cinzel"', 'serif'],
      },
      backgroundImage: {
        // グラデーションの定義を少しシンプルで確実なものに変更
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