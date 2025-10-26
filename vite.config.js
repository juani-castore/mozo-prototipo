import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/fud/',  // ✅ Base path para deploy en /fud
  build: {
    outDir: 'dist/fud',  // ← Generar archivos en dist/fud/
    emptyOutDir: true,
  }
})
