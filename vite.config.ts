import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// This repository is published at https://behnamzarei20-arch.github.io/bbberah/.
// Use the explicit project path so production assets always resolve from that URL.
export default defineConfig({
  base: '/bbberah/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
