import { defineConfig } from 'vite';

// Relative asset paths so the built site can be hosted at any subpath
// (e.g. apps.charliekrug.com/chrono-cipher) with no server-side rewriting.
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
  },
});
