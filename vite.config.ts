import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// base './' permite publicar en GitHub Pages bajo cualquier nombre de repositorio
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'],
          blockly: ['blockly'],
        },
      },
    },
  },
});
