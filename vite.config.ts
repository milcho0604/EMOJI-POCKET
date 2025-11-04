import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      // HTML(=popup.html)이 엔트리이므로 별도 input 지정 없이도 OK
    },
    emptyOutDir: true
  },
  publicDir: 'public' // manifest.json, icons → dist/로 그대로 복사됨
});
