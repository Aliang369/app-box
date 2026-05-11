import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import Unocss from 'unocss/vite'

export default defineConfig({
  server: {
    port: 9999
  },
  plugins: [uni(), Unocss()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/variables.scss" as *;`
      }
    }
  }
})