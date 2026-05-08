<template>
  <view class="min-h-screen bg-[#FFFFFF] pb-10">
    <view class="sticky top-0 z-30 pt-12 pb-4 px-5 bg-white/90 backdrop-blur-md border-b border-gray-50 flex items-center">
      <view class="i-lucide-arrow-left text-gray-900 text-xl" @click="goBack"></view>
      <text class="ml-4 text-lg font-bold text-gray-900">人气排行</text>
    </view>

    <view class="px-5 mt-4">
      <view 
        v-for="(item, index) in rankList" :key="item.id" 
        class="flex items-center py-4 border-b border-gray-50 last:border-0 active:bg-gray-50 px-2 rounded-xl transition-all"
        @click="goToDetail(item.id)"
      >
        <text :class="['text-lg font-black italic mr-4 w-6', index < 3 ? 'text-indigo-600' : 'text-gray-300']">{{ index + 1 }}</text>
        <image :src="item.cover" class="w-14 h-14 rounded-xl border border-gray-100 bg-gray-50" mode="aspectFill"></image>
        <view class="ml-4 flex-1">
          <text class="text-[15px] font-bold text-gray-900 block">{{ item.title }}</text>
          <view class="flex items-center mt-1">
            <view class="i-lucide-star text-orange-400 text-[10px] mr-1"></view>
            <text class="text-[11px] text-gray-400">{{ item.rating }}分 · {{ item.downloads }}次下载</text>
          </view>
        </view>
        <view class="i-lucide-chevron-right text-gray-200"></view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const goBack = () => uni.navigateBack()
const goToDetail = (id: string) => uni.navigateTo({ url: `/pages/detail/index?id=${id}` })

const rankList = ref([
  { id: '4', title: '荒野之息', rating: '5.0', downloads: '200w+', cover: 'https://picsum.photos/200/200?random=14' },
  { id: '1', title: '元气小骑士', rating: '4.9', downloads: '12w+', cover: 'https://picsum.photos/200/200?random=11' },
  { id: '2', title: '星穹幻轨', rating: '4.8', downloads: '85w+', cover: 'https://picsum.photos/200/200?random=12' },
])
</script>