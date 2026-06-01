import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    allowedHosts: [
      'flavor-toll-refused-pioneer.trycloudflare.com',
      '.trycloudflare.com', 
    ],
    host: '0.0.0.0', 
  },
});