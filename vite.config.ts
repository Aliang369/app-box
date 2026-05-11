import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import Unocss from 'unocss/vite'

export default defineConfig({
<<<<<<< HEAD
  server: {
    port: 9999
  },
=======
>>>>>>> fb2793f092f942c1d0a66e4f8bca85e0db4319fb
  plugins: [uni(), Unocss()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/variables.scss" as *;`
      }
    }
  }
})