/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#060a0d',
          900: '#0A0F14',
          850: '#0d151d',
          800: '#111b24',
          700: '#172430',
        },
        deepteal: {
          900: '#061a1b',
          800: '#0a2a2b',
          700: '#0F3D3E',
          600: '#144d4f',
        },
        cyanteal: {
          700: '#1e4c4f',
          600: '#265f62',
          500: '#2E6F73',
          400: '#3c8f94',
        },
        iceteal: {
          400: '#6ea6ac',
          300: '#7FB3B8',
          200: '#a3ccd0',
          100: '#d1e6e8',
        },
        cream: {
          400: '#d4c2a7',
          300: '#EADCC8',
          200: '#f2e8da',
          100: '#faf6f0',
        },
        copper: {
          600: '#a34c14',
          500: '#C6601F',
          400: '#dd732e',
          300: '#ea8d50',
        },
        emeraldink: {
          950: '#03261D',
          900: '#064E3B',
          800: '#08634B',
          700: '#0E7A5D',
        },
        champagne: {
          400: '#E0CB9F',
          300: '#F8E7C9',
          200: '#FAEFD8',
          100: '#FCF6EA',
        },
        citron: {
          500: '#D4FF00',
          400: '#DDFF33',
        },
        brand: {
          50: '#f0f9fa',
          100: '#d1e6e8',
          200: '#a3ccd0',
          300: '#7FB3B8',
          400: '#3c8f94',
          500: '#2E6F73',
          600: '#0F3D3E',
          700: '#0c2e2f',
          800: '#081f20',
          900: '#0A0F14',
        }
      },
      backgroundImage: {
        'glow-ambient': 'radial-gradient(circle at 10% 20%, rgba(198, 96, 31, 0.09) 0%, transparent 40%), radial-gradient(circle at 90% 10%, rgba(127, 179, 184, 0.12) 0%, transparent 45%)',
        'card-gradient': 'linear-gradient(145deg, rgba(15, 61, 62, 0.25) 0%, rgba(10, 15, 20, 0.8) 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
      },
      boxShadow: {
        'glow-teal': '0 0 25px -5px rgba(127, 179, 184, 0.25)',
        'glow-copper': '0 0 25px -5px rgba(198, 96, 31, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
      }
    },
  },
  plugins: [],
}
