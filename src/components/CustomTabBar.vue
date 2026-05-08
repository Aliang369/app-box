<template>
  <view class="fixed bottom-8 left-0 right-0 z-50 flex justify-center px-6">
    <view class="w-full max-w-[440rpx] bg-white/70 backdrop-blur-2xl border border-white/80 rounded-full h-14 shadow-[0_12px_40px_rgba(99,102,241,0.15)] flex items-center justify-between relative px-1.5">
      
      <view
        class="absolute h-11 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) z-0 shadow-lg shadow-indigo-300/50"
        :style="{
          width: '46%',
          left: active === 0 ? '3%' : '51%'
        }"
      ></view>

      <view
        class="flex-1 flex items-center justify-center z-10 h-full transition-all duration-300"
        @click="switchTab(0, '/pages/index/index')"
      >
        <view class="flex items-center gap-2">
          <view :class="[
            active === 0 ? 'i-carbon-recommend text-white scale-110' : 'i-carbon-recommend text-indigo-400',
            'text-xl transition-all duration-300'
          ]"></view>
          <text v-if="active === 0" class="text-white font-black text-[24rpx] tracking-tighter animate-fade-in">精选</text>
        </view>
      </view>

      <view
        class="flex-1 flex items-center justify-center z-10 h-full transition-all duration-300"
        @click="switchTab(1, '/pages/my/index')"
      >
        <view class="flex items-center gap-2">
          <view :class="[
            active === 1 ? 'i-carbon-user-avatar-filled text-white scale-110' : 'i-carbon-user-avatar text-indigo-400',
            'text-xl transition-all duration-300'
          ]"></view>
          <text v-if="active === 1" class="text-white font-black text-[24rpx] tracking-tighter animate-fade-in">我的</text>
        </view>
      </view>

    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  current: number
}>()

const active = ref(props.current)

watch(() => props.current, (val) => {
  active.value = val
})

const switchTab = (index: number, url: string) => {
  if (active.value === index) return
  
  uni.vibrateShort({})
  
  active.value = index
  setTimeout(() => {
    uni.switchTab({ url })
  }, 100)
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-4px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>
