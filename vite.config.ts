import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-components': [
            '@/components/ui/button',
            '@/components/ui/input',
            '@/components/ui/form',
            '@/components/ui/dialog',
            '@/components/ui/alert-dialog',
            '@/components/ui/alert',
            '@/components/ui/sheet',
            '@/components/ui/command',
            '@/components/ui/label',
            '@/components/ui/popover',
            '@/components/ui/drawer',
            '@/components/ui/select',
            '@/components/ui/tabs',
          ],
        },
      },
    },
  },
});
