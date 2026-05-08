<template>
  <view class="min-h-screen bg-[#F9FAFB] pb-10">
    <view class="sticky top-0 z-30 pt-12 pb-4 px-5 bg-white border-b border-gray-100 flex items-center">
      <view class="i-lucide-arrow-left text-gray-900 text-xl" @click="goBack"></view>
      <text class="ml-4 text-lg font-bold text-gray-900">专属福利</text>
    </view>

    <view class="px-5 mt-6">
      <view v-for="item in gifts" :key="item.id" class="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm mb-4">
        <view class="p-4 flex justify-between items-center">
          <view class="flex gap-3">
            <image :src="item.cover" class="w-12 h-12 rounded-lg border border-gray-100" mode="aspectFill"></image>
            <view>
              <text class="text-[15px] font-bold text-gray-900 block">{{ item.title }}</text>
              <text class="text-[11px] text-indigo-500 font-medium">价值 ¥{{ item.value }} 礼包</text>
            </view>
          </view>
          <button class="m-0 h-8 px-4 bg-indigo-600 text-white text-xs font-bold rounded-full active:bg-indigo-700" @click="claimGift(item)">领取</text>
        </view>
        <view class="px-4 py-2 bg-gray-50 border-t border-gray-50 flex items-center">
          <view class="i-lucide-clock text-gray-300 text-[10px] mr-1"></view>
          <text class="text-[10px] text-gray-400">剩余时间：{{ item.deadline }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const goBack = () => uni.navigateBack()
const claimGift = (item: any) => uni.showToast({ title: '领取成功！可在“我的”查看', icon: 'none' })

const gifts = ref([
  { id: '1', title: '元气小骑士 · 进阶礼包', value: '68', cover: 'https://picsum.photos/200/200?random=11', deadline: '2天 14小时' },
  { id: '2', title: '星穹幻轨 · 新手补给', value: '128', cover: 'https://picsum.photos/200/200?random=12', deadline: '5天 08小时' },
])
</script>