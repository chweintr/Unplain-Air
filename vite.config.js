import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  server: {
    port: 3000,
    https: true,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
