/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // macOS system colors
        'macos': {
          'bg': '#F5F5F7',
          'bg-secondary': '#FFFFFF',
          'bg-tertiary': '#F9F9F9',
          'text': '#1D1D1F',
          'text-secondary': '#86868B',
          'border': '#D2D2D7',
          'accent': '#007AFF',
          'accent-hover': '#0051D5',
          'success': '#34C759',
          'warning': '#FF9500',
          'error': '#FF3B30',
          'sidebar': '#F5F5F7',
          'sidebar-hover': '#E8E8ED',
        }
      },
      fontFamily: {
        'sf': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'xxs': '0.625rem',
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
      },
      borderRadius: {
        'macos': '10px',
        'macos-sm': '6px',
        'macos-lg': '12px',
      },
      boxShadow: {
        'macos': '0 0 0 0.5px rgba(0, 0, 0, 0.05), 0 2px 10px rgba(0, 0, 0, 0.1)',
        'macos-lg': '0 0 0 0.5px rgba(0, 0, 0, 0.05), 0 10px 40px rgba(0, 0, 0, 0.15)',
        'macos-inset': 'inset 0 0 0 0.5px rgba(0, 0, 0, 0.05)',
      },
      backdropBlur: {
        'macos': '20px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}