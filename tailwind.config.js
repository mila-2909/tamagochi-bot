/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Nunito"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'bounce-pet': {
          '0%, 100%': { transform: 'translateY(0) scale(1, 1)' },
          '30%': { transform: 'translateY(-34px) scaleY(0.9) scaleX(1.1)' },
          '60%': { transform: 'translateY(0) scaleY(1.08) scaleX(0.94)' },
        },
        'idle-bob': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'float-up': {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '1' },
          '100%': { transform: 'translateY(-96px) scale(1.5)', opacity: '0' },
        },
        'pop-in': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-6deg)' },
          '75%': { transform: 'rotate(6deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 30px 6px rgba(250, 204, 21, 0.35)' },
          '50%': { boxShadow: '0 0 50px 14px rgba(250, 204, 21, 0.6)' },
        },
      },
      animation: {
        'bounce-pet': 'bounce-pet 0.42s ease-out',
        'idle-bob': 'idle-bob 2.6s ease-in-out infinite',
        'float-up': 'float-up 0.9s ease-out forwards',
        'pop-in': 'pop-in 0.3s ease-out',
        'wiggle': 'wiggle 0.42s ease-in-out',
        'pulse-glow': 'pulse-glow 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
