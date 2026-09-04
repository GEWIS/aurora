import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
const coreUrl = process.env.VITE_CORE_URL || 'http://localhost:3000';
const coreWsUrl = coreUrl.replace(/^http/, 'ws');

export default defineConfig({
  base: '/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
  server: {
    host: '0.0.0.0',
    port: 8081,
    proxy: {
      '/api': {
        target: coreUrl,
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      '/socket.io': {
        target: coreWsUrl,
        ws: true,
      },
      '/static/posters': {
        target: coreUrl,
        changeOrigin: true,
        secure: false,
      },
      '/static/local-posters': {
        target: coreUrl,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: './dist',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        },
      },
    },
    chunkSizeWarningLimit: 750,
  },
  publicDir: './public',
});
