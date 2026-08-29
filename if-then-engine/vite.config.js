import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

// Deployed as a project-site subpath: /JavaScript-Playground/if-then-engine/
// Override with IFTHEN_BASE when hosting elsewhere (e.g. "/" for a root domain).
export default defineConfig({
  base: process.env.IFTHEN_BASE ?? '/JavaScript-Playground/if-then-engine/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
    },
  },
})
