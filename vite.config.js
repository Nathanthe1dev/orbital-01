import { defineConfig } from 'vite';

export default defineConfig({
  base: '/orbital-01/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 5173,
    open: true
  }
});