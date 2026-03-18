import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 品牌色 - 心动粉
        primary: {
          50: '#FFF5F7',
          100: '#FFEBEF',
          200: '#FFD6E0',
          300: '#FFADC6',
          400: '#FF6B9D',
          500: '#FF4D84',
          600: '#F01D60',
          700: '#CC1452',
          800: '#A81348',
          900: '#8A1340',
          950: '#4F0520',
        },
        // 辅助色 - 柔和紫
        romance: {
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#B794F6',
          500: '#9F67EB',
          600: '#8836E4',
          700: '#7723CF',
          800: '#661EA9',
          900: '#561C88',
          950: '#3A0666',
        },
        // 强调色 - 活力橙
        accent: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
          950: '#431407',
        },
      },
      fontFamily: {
        sans: [
          'PingFang SC',
          'Microsoft YaHei',
          'Noto Sans SC',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
        display: ['Noto Sans SC', 'sans-serif'],
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'heart-beat': 'heart-beat 1.5s ease-in-out infinite',
        shimmer: 'shimmer 2s infinite linear',
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
        gradient: 'gradient-shift 8s ease infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'heart-beat': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      boxShadow: {
        'primary': '0 10px 40px -10px rgba(255, 107, 157, 0.3)',
        'romance': '0 10px 40px -10px rgba(183, 148, 246, 0.3)',
      },
    },
  },
  plugins: [],
}
export default config
