import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()]
  ,
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ["d3-selection", "d3-zoom", "d3-transition"],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@utils': path.resolve(__dirname, 'src/utils'),
    },
    dedupe: ["react", "react-dom", "d3-selection", "d3-zoom", "d3-transition"],
  },
  server: {
    port: 3000,
    open: true,
  }
});
