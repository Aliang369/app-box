<template>
  <view class="min-h-screen bg-[#FFFFFF] pb-10">
    <view class="sticky top-0 z-30 pt-12 pb-4 px-5 bg-white/90 backdrop-blur-md border-b border-gray-50 flex items-center">
      <view class="i-lucide-arrow-left text-gray-900 text-xl" @click="goBack"></view>
      <text class="ml-4 text-lg font-bold text-gray-900">最新上线</text>
    </view>

    <view class="px-5 mt-6">
      <view v-for="(item, index) in latestGames" :key="item.id" class="flex gap-4 mb-8 relative">
        <view class="w-[2px] bg-gray-50 absolute left-[40rpx] top-12 bottom-[-32rpx]" v-if="index !== latestGames.length - 1"></view>
        
        <view class="flex flex-col items-center shrink-0">
          <view class="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center z-10">
            <text class="text-[10px] font-bold text-indigo-600">{{ item.date }}</text>
          </view>
        </view>

        <view class="flex-1 bg-gray-50/50 rounded-2xl p-4 border border-gray-100 active:bg-gray-100 transition-all" @click="goToDetail(item.id)">
          <view class="flex gap-3">
            <image :src="item.cover" class="w-16 h-16 rounded-xl border border-gray-100 bg-white" mode="aspectFill"></image>
            <view class="flex-1 flex flex-col justify-center">
              <text class="text-[15px] font-bold text-gray-900">{{ item.title }}</text>
              <text class="text-[12px] text-gray-400 mt-1">#{{ item.tag }} · 今日更新</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const goBack = () => uni.navigateBack()
const goToDetail = (id: string) => uni.navigateTo({ url: `/pages/detail/index?id=${id}` })

const latestGames = ref([
  { id: '1', title: '元气小骑士', date: '05.08', tag: '动作', cover: 'https://picsum.photos/200/200?random=11' },
  { id: '2', title: '星穹幻轨', date: '05.07', tag: '策略', cover: 'https://picsum.photos/200/200?random=12' },
  { id: '3', title: '蔚蓝档案', date: '05.07', tag: '二次元', cover: 'https://picsum.photos/200/200?random=13' },
])
</script>