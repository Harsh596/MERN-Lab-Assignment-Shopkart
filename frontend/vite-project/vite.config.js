import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Helper to bypass proxy when the browser requests an HTML document on page refresh
const bypassHtml = (req) => {
  if (req.headers.accept && req.headers.accept.includes('text/html')) {
    return '/index.html';
  }
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/customers': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        bypass: bypassHtml,
      },
      '/products': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        bypass: bypassHtml,
      },
      '/wishlist': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        bypass: bypassHtml,
      },
      '/cart': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        bypass: bypassHtml,
      },
      '/orders': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        bypass: bypassHtml,
      },
    },
  },
})

