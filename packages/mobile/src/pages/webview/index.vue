<template>
  <view class="w-full h-screen">
    <web-view v-if="url" :src="url"></web-view>
    <view v-else class="flex items-center justify-center h-full text-gray-400 text-sm">
      加载中或链接无效...
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const url = ref('')

onLoad((options: any) => {
  if (options.url) {
    url.value = decodeURIComponent(options.url)
  }
})
</script>