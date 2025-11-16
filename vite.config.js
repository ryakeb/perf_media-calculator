import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // app served at root of https://media.wecommit.be
  optimizeDeps: {
    // ffmpeg's ESM build ships worker files that we must load at runtime
    exclude: ['@ffmpeg/ffmpeg'],
  },
})
