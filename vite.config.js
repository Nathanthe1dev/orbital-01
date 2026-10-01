import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    terserOptions: {
      compress: {
        drop_console: true
      }
    }
  },
  server: {
    port: 5173,
    open: true
  }
});