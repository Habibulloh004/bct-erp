import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { imagetools } from 'vite-imagetools'
import viteCompression from 'vite-plugin-compression'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    svgr(),
    // Static image transforms: ?w=..., ?format=...
    imagetools(),
    // Pre-compress build output to .br va .gz (Nginx xizmat qiladi)
    viteCompression({ algorithm: 'brotliCompress' }),
    viteCompression({ algorithm: 'gzip' }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    // file nomlariga hash qoʻyiladi -> immutable cache uchun
    assetsInlineLimit: 0,
  }
})
