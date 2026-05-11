<template>
  <view class="bg-white px-6 pb-5 border-b border-gray-100" :style="headerStyle">
    <view class="relative flex items-center justify-center min-h-[44px]">
      <view
        v-if="showBack"
        class="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center active:bg-gray-100 transition-colors"
        @click="handleBack"
      >
        <view class="i-lucide-chevron-left text-gray-700 text-lg"></view>
      </view>

      <text class="max-w-[60%] truncate text-[18px] font-black text-gray-900 tracking-tight text-center">
        {{ title }}
      </text>

      <view
        v-if="hasRightAction"
        class="absolute right-0 top-1/2 -translate-y-1/2 min-w-10 h-10 px-3 rounded-full bg-gray-50 flex items-center justify-center gap-1.5 active:bg-gray-100 transition-colors"
        @click="$emit('rightClick')"
      >
        <view v-if="rightIcon" :class="[rightIcon, 'text-gray-700 text-base']"></view>
        <text v-if="rightText" class="text-xs font-bold text-gray-700">{{ rightText }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  title: string
  showBack?: boolean
  fallbackUrl?: string
  rightIcon?: string
  rightText?: string
}>(), {
  showBack: true,
  fallbackUrl: ''
})

defineEmits<{
  rightClick: []
}>()

const headerStyle = computed(() => ({
  paddingTop: 'calc(var(--status-bar-height, 0px) + 16px)'
}))

const hasRightAction = computed(() => Boolean(props.rightIcon || props.rightText))

const handleBack = () => {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
    return
  }

  if (props.fallbackUrl) {
    uni.switchTab({ url: props.fallbackUrl })
  }
}
</script>
