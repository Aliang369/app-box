<template>
  <view class="min-h-screen bg-[#F9FAFB] pb-32">
    
    <view class="px-6 pt-16 pb-8 bg-white border-b border-gray-100 relative">
      <view class="flex items-center">
        <view class="w-16 h-16 rounded-full border border-gray-200 overflow-hidden shrink-0 bg-gray-50 p-0.5">
          <image src="https://picsum.photos/200/200?random=100" class="w-full h-full rounded-full" mode="aspectFill"></image>
        </view>
        
        <view class="ml-4 flex-1">
          <view class="flex items-center gap-2">
            <text class="text-xl font-bold text-gray-900 tracking-tight">旅行者 A-Liang</text>
            <view class="bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] px-2 py-0.5 rounded-full font-medium">LV.99</view>
          </view>
          <text class="text-[11px] text-gray-400 mt-1 block">ID: 20260508</text>
        </view>
      </view>

      <view class="flex mt-8">
        <view class="flex-1 flex flex-col">
          <text class="text-lg font-bold text-gray-900">128</text>
          <text class="text-[11px] text-gray-400 mt-0.5">我的收藏</text>
        </view>
        <view class="flex-1 flex flex-col">
          <text class="text-lg font-bold text-gray-900">45</text>
          <text class="text-[11px] text-gray-400 mt-0.5">下载记录</text>
        </view>
        <view class="flex-1 flex flex-col">
          <text class="text-lg font-bold text-gray-900">9,200</text>
          <text class="text-[11px] text-gray-400 mt-0.5">幻想积分</text>
        </view>
      </view>
    </view>

    <view class="mt-4 px-4">
      <view class="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
        <view 
          v-for="(item, index) in menuList" 
          :key="index"
          class="flex items-center justify-between p-4 border-b border-gray-50 last:border-b-0 active:bg-gray-50 transition-colors"
          @click="handleMenuClick(item)"
        >
          <view class="flex items-center gap-3">
            <view :class="[item.icon, 'text-lg text-gray-400']"></view>
            <text class="text-[14px] font-medium text-gray-700">{{ item.title }}</text>
          </view>
          <view class="i-lucide-chevron-right text-gray-300 text-sm"></view>
        </view>
      </view>

      <button class="mt-6 w-full h-12 bg-white border border-gray-200 text-gray-500 font-medium text-[14px] rounded-xl active:bg-gray-50 transition-colors flex items-center justify-center m-0">
        退出当前账号
      </button>
    </view>

    <CustomTabBar :current="1" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CustomTabBar from '@/components/CustomTabBar.vue'

// 使用 lucide 极简图标
const menuList = ref([
  { title: '我的礼包码', icon: 'i-lucide-gift' },
  { title: '游戏更新提醒', icon: 'i-lucide-bell' },
  { title: '安全与设置', icon: 'i-lucide-settings' },
  { title: '联系猫耳客服', icon: 'i-lucide-headphones' },
  { title: '关于 App 盒子', icon: 'i-lucide-info' },
])

const handleMenuClick = (item: any) => {
  uni.showToast({
    title: `${item.title} 开发中`,
    icon: 'none'
  })
}
</script>

<style scoped>
button::after { border: none; }
</style>