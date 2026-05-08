<template>
  <view class="fixed bottom-8 left-0 right-0 z-50 flex justify-center px-6">
    <view class="w-full max-w-[420rpx] bg-white/60 backdrop-blur-xl border border-gray-200/50 rounded-full h-12 shadow-sm flex items-center justify-between relative px-1">
      
      <view
        class="absolute h-10 bg-indigo-600 rounded-full transition-all duration-400 ease-out z-0"
        :style="{
          width: '48%',
          left: active === 0 ? '2%' : '50%'
        }"
      ></view>

      <view class="flex-1 flex items-center justify-center z-10 h-full" @click="switchTab(0, '/pages/index/index')">
        <view class="flex items-center gap-2">
          <text :class="[
            active === 0 ? 'text-white' : 'text-gray-400',
            'text-lg transition-colors'
          ]">{{ active === 0 ? '⭐' : '☆' }}</text>
          <text v-if="active === 0" class="text-white font-medium text-[22rpx] tracking-wide">精选</text>
        </view>
      </view>

      <view class="flex-1 flex items-center justify-center z-10 h-full" @click="switchTab(1, '/pages/my/index')">
        <view class="flex items-center gap-2">
          <text :class="[
            active === 1 ? 'text-white' : 'text-gray-400',
            'text-lg transition-colors'
          ]">{{ active === 1 ? '👤' : '👥' }}</text>
          <text v-if="active === 1" class="text-white font-medium text-[22rpx] tracking-wide">我的</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { onShow } from '@dcloudio/uni-app'

const props = defineProps<{
  current: number
}>()

const active = ref(props.current)

watch(() => props.current, (val) => {
  active.value = val
}, { immediate: true })

onShow(() => {
  nextTick(() => {
    active.value = props.current
  })
})

const switchTab = (index: number, url: string) => {
  if (active.value === index) return
  
  uni.vibrateShort({})
  
  active.value = index
  
  setTimeout(() => {
    uni.reLaunch({
      url,
      fail: () => {
        uni.switchTab({ url })
      }
    })
  }, 200)
}
</script>
