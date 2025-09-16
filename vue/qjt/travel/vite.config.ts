import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    Components({
      resolvers: [VantResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve('./src'),
      '@components': path.resolve('./src/components'),
      '@views': path.resolve('./src/views'),
      '@api': path.resolve('./src/api'),
      '@hooks': path.resolve('./src/hooks'),
      '@store': path.resolve('./src/store'),
      '@types': path.resolve('./src/types'),
      '@assets': path.resolve('./src/assets'),
      '@router': path.resolve('./src/router'),
    }
  }
})
