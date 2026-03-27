import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [basicSsl()],
  root: '.',
  server: {
    https: true,   // needed for Web Bluetooth on phones
    host: true,    // expose on LAN so phone can reach it
    port: 3000,
  },
  build: {
    rollupOptions: {
      input: {
        index:        'index.html',
        'bike-watts': 'bike-watts/index.html',
        test_ble:     'test_ble/index.html',
      },
    },
    outDir: '../dist',
    emptyOutDir: true,
  },
})
