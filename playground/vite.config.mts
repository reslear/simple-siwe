import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'
import Inspect from 'vite-plugin-inspect'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Inspect(),
  ],

  resolve: {
    alias: {
      'packagename': resolve('../src/index.ts'),
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
        },
      },
    },
  },
})
