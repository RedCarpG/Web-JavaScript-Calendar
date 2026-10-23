import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  // The main chunk sits just over Vite's 500 kB default (tyme4ts is large);
  // iztro is already split into the lazily loaded 紫微 chunk.
  build: { chunkSizeWarningLimit: 600 },
})
