import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return { 
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
      watch: {
        usePolling: true
      },
      hmr: {
        clientPort: 5173,
        host: 'localhost',
      },
      proxy: {
        '/api': {
          target: env.VITE_API_URL ,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      } 
    } // <--- Close server
  }; // <--- Close return object (This is likely what is missing!)
}); // <--- Close defineConfig (Line 28)