<template>
  <view class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100">
    <view class="flex items-center h-12">
      <view 
        class="flex-1 flex items-center justify-center h-full active:bg-gray-50 transition-colors" 
        @click="switchTab(0, '/pages/index/index')"
      >
        <view class="flex items-center gap-1.5">
          <view :class="[
            active === 0 ? 'text-gray-900' : 'text-gray-300',
            'text-base transition-colors'
          ]">
            <view class="i-lucide-gamepad-2"></view>
          </view>
          <text :class="[
            active === 0 ? 'text-gray-900' : 'text-gray-300',
            'text-xs font-medium transition-colors'
          ]">精选</text>
        </view>
      </view>

      <view 
        class="flex-1 flex items-center justify-center h-full active:bg-gray-50 transition-colors" 
        @click="switchTab(1, '/pages/my/index')"
      >
        <view class="flex items-center gap-1.5">
          <view :class="[
            active === 1 ? 'text-gray-900' : 'text-gray-300',
            'text-base transition-colors'
          ]">
            <view class="i-lucide-user"></view>
          </view>
          <text :class="[
            active === 1 ? 'text-gray-900' : 'text-gray-300',
            'text-xs font-medium transition-colors'
          ]">我的</text>
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
  }, 150)
}
</script>
