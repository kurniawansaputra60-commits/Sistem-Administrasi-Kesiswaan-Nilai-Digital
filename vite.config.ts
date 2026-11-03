import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  const currentDir = import.meta.dirname || path.resolve();
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(currentDir, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio container environment
      hmr: false,
      watch: null,
    },
  };
});
