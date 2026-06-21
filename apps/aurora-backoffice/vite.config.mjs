import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const coreUrl = process.env.VITE_CORE_URL || 'http://localhost:3000';
const coreWsUrl = coreUrl.replace(/^http/, 'ws');

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
        target: coreUrl,
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      '/socket.io': {
        target: coreWsUrl,
        ws: true,
      },
      '/static/audio': {
        target: coreUrl,
        changeOrigin: true,
        secure: false,
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
