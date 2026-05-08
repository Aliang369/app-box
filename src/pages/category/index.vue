<template>
  <view class="min-h-screen bg-[#FFFFFF] pb-10">
    <view class="sticky top-0 z-30 pt-12 pb-4 px-5 bg-white/90 backdrop-blur-md border-b border-gray-50 flex items-center">
      <view class="i-lucide-arrow-left text-gray-900 text-xl" @click="goBack"></view>
      <text class="ml-4 text-lg font-bold text-gray-900">分类大全</text>
    </view>
    <view class="p-5 grid grid-cols-2 gap-4">
      <view v-for="cat in categories" :key="cat.name" class="h-24 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center active:bg-indigo-50 active:border-indigo-100 transition-all" @click="goToCategory(cat.name)">
        <view :class="[cat.icon, 'text-2xl text-gray-400 mb-2']"></view>
        <text class="text-[13px] font-bold text-gray-700">{{ cat.name }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const goBack = () => uni.navigateBack()
const goToCategory = (name: string) => uni.showToast({ title: `进入${name}频道`, icon: 'none' })
const categories = ref([
  { name: '动作冒险', icon: 'i-lucide-sword' },
  { name: '策略战争', icon: 'i-lucide-castle' },
  { name: '角色扮演', icon: 'i-lucide-user-cog' },
  { name: '休闲益智', icon: 'i-lucide-puzzle' },
  { name: '体育竞技', icon: 'i-lucide-trophy' },
  { name: '模拟经营', icon: 'i-lucide-shrub' },
])
</script>