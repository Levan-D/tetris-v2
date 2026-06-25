import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages serves this project at /tetris-v2/; dev stays at root.
  base: command === 'build' ? '/tetris-v2/' : '/',
  plugins: [react(), tailwindcss()],
}))
