export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#16A34A',
          teal: '#0D9488',
          amber: '#F59E0B',
          ink: '#0F172A',
          bg: '#F8FAFC',
          red: '#DC2626',
        },
      },
      fontFamily: {
        heading: ['Poppins', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.06)',
        'card-hover': '0 4px 12px rgba(15,23,42,0.08)',
      },
      borderRadius: { card: '16px' },
    },
  },
  plugins: [],
}