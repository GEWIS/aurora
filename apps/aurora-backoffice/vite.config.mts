import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  base: '/',
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  plugins: [vue()],
  server: {
    port: 8080,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      '/socket.io': {
        target: 'ws://localhost:3000',
        ws: true,
      },
      '/static/audio': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/static/posters': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/static/local-posters': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'ESNext',
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
});
