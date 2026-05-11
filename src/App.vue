<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('App Launch')
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
.animate-pulse {
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* 强制隐藏 UniApp 在 H5 端生成的原生 TabBar */
uni-tabbar {
  display: none !important;
}

/* 防止隐藏原生 TabBar 后，页面底部留出空白的占位高度 */
uni-page-wrapper {
  padding-bottom: 0 !important;
}
</style>
