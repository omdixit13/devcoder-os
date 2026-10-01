import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    proxy: {
      '/api/leetcode': {
        target: 'https://leetcode.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/leetcode/, ''),
        headers: {
          Referer: 'https://leetcode.com',
          Origin: 'https://leetcode.com',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
      },
    },
  },
});
