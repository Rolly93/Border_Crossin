import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.mjs',
  },

  resolve: {
    tsconfigPaths: true,
  },

  server: {
    proxy: {
      '/client': 'http://localhost:8000',
      '/sftp': 'http://localhost:8000',
      '/unit': 'http://localhost:8000',
      '/employee': 'http://localhost:8000',
      '/user': 'http://localhost:8000',
      '/system': 'http://localhost:8000',
      '/auth': 'http://localhost:8000',
      '/shipment': 'http://localhost:8000',
      '/events': {
        target: 'http://localhost:8000',
        ws: true,
      },
      '/api': 'http://localhost:8000',
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Group all Mantine packages together
            if (id.includes('@mantine/')) {
              return 'vendor-mantine';
            }
            // Group React ecosystem
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            // Group other utils
            if (id.includes('axios') || id.includes('dayjs') || id.includes('i18next')) {
              return 'vendor-utils';
            }
            // Everything else from node_modules
            return 'vendor-other';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});