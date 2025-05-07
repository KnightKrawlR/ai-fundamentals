module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          50: '#F5F3FA',
          100: '#E9E4F5',
          200: '#D3C9EB',
          300: '#BDAEE0',
          400: '#A793D6',
          500: '#9178CC',
          600: '#7B5DC2',
          700: '#4B2E83', // Primary brand color
          800: '#3A2266',
          900: '#29174A',
        },
        blue: {
          500: '#3498DB', // Secondary accent color
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 10px 30px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      },
    },
  },
  plugins: [],
}
