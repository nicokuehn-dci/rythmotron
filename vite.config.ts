import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

export default defineConfig({
  plugins: [react(), svelte()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'web': path.resolve(__dirname, './src')
    }
  }
});