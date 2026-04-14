import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: './',
  publicDir: 'public',
  server: {
    port: 5174,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin/index.html'),
        category: resolve(__dirname, 'category/'),
        checkout: resolve(__dirname, 'checkout/index.html'),
        course: resolve(__dirname, 'course/index.html'),
        signUp: resolve(__dirname, 'sign-up/'),
        signIn: resolve(__dirname, 'sign-in/'),
      },
    },
  },
});
