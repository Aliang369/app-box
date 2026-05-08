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
import { ref, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'

const props = defineProps<{
  current: number
}>()

const active = ref(props.current)

watch(() => props.current, (val) => {
  active.value = val
}, { immediate: true })

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