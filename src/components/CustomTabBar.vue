<template>
  <view class="fixed bottom-8 left-0 right-0 z-50 flex justify-center px-6 pointer-events-none">
    
    <view class="pointer-events-auto w-full max-w-[360rpx] bg-white/90 backdrop-blur-xl border border-gray-200 rounded-full h-12 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex items-center justify-between px-2">

      <view 
        class="flex-1 flex items-center justify-center h-full transition-all duration-200"
        @click="switchTab(0, '/pages/index/index')"
      >
        <view class="flex items-center gap-2">
          <view :class="[
            active === 0 ? 'i-lucide-compass text-indigo-600' : 'i-lucide-compass text-gray-400',
            'text-[20px] transition-colors'
          ]"></view>
          <text v-if="active === 0" class="text-[12px] font-bold text-indigo-600 tracking-tight">发现</text>
        </view>
      </view>

      <view 
        class="flex-1 flex items-center justify-center h-full transition-all duration-200"
        @click="switchTab(1, '/pages/my/index')"
      >
        <view class="flex items-center gap-2">
          <view :class="[
            active === 1 ? 'i-lucide-user text-indigo-600' : 'i-lucide-user text-gray-400',
            'text-[20px] transition-colors'
          ]"></view>
          <text v-if="active === 1" class="text-[12px] font-bold text-indigo-600 tracking-tight">我的</text>
        </view>
      </view>

    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'

const props = defineProps<{
  current: number
}>()

const active = ref(props.current)

// tabBar 列表配置
const list = [
  { pagePath: '/pages/index/index' },
  { pagePath: '/pages/my/index' }
]

watch(() => props.current, (val) => {
  active.value = val
}, { immediate: true })

onMounted(() => {
  // 获取当前页面栈
  const pages = getCurrentPages()
  if (pages.length === 0) return
  // 获取当前页面路由路径 (如: 'pages/my/index')
  const currentPageRoute = pages[pages.length - 1].route
  
  // 遍历 tabBar 列表，如果当前路由与 list 中的 pagePath 匹配，就把它设为高亮
  const index = list.findIndex(item => item.pagePath === `/${currentPageRoute}` || item.pagePath === currentPageRoute)
  
  if (index !== -1) {
    active.value = index
  }
})

onShow(() => {
  active.value = props.current
})

const switchTab = (index: number, url: string) => {
  if (active.value === index) return
  
  uni.vibrateShort({})
  active.value = index
  
  setTimeout(() => {
    uni.reLaunch({ 
      url,
      fail: () => uni.switchTab({ url })
    })
  }, 150) // 缩短延迟，因为极简风的动画更轻量
}
</script>