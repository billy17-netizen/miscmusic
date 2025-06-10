/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        anime: {
          pink: '#FF6B9D',
          purple: '#C44AC0',
          blue: '#3B82F6',
          cyan: '#06B6D4',
          yellow: '#FBBF24',
          orange: '#F97316',
        },
        neon: {
          purple: '#8B5CF6',
          violet: '#A855F7',
          indigo: '#7C3AED',
          magenta: '#9333EA',
        }
      },
      backgroundImage: {
        'anime-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'neon-gradient': 'linear-gradient(45deg, #8B5CF6, #A855F7, #7C3AED)',
        'cosmic-gradient': 'linear-gradient(225deg, #FF3CAC 0%, #784BA0 50%, #2B86AB 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 2s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-in',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #8B5CF6, 0 0 10px #8B5CF6, 0 0 15px #8B5CF6' },
          '100%': { boxShadow: '0 0 10px #A855F7, 0 0 20px #A855F7, 0 0 30px #A855F7' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      fontFamily: {
        'anime': ['TAN Kulture', 'Inter', 'sans-serif'],
        'kulture': ['TAN Kulture', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 10px currentColor',
        'neon-lg': '0 0 20px currentColor, 0 0 40px currentColor',
        'anime': '0 8px 32px rgba(255, 107, 157, 0.3)',
      },
    },
  },
  plugins: [],
} 