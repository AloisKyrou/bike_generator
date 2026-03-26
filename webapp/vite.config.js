import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [basicSsl()],
  root: 'test_ble',
  server: {
    https: true,   // needed for Web Bluetooth on phones
    host: true,    // expose on LAN so phone can reach it
    port: 3000,
  },
  build: {
    outDir: '../dist',
  },
})
