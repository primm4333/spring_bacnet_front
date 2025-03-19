import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    global: "globalThis", // Fix for 'global is not defined' error
  },
  server: {
    proxy: {
      "/ws": {
        target: "http://localhost:8080",
        ws: true,
      },
      "/getDevices": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
