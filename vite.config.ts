import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // 여기에 .css, .tsx, .ts 파일은 절대 추가하지 말기
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
