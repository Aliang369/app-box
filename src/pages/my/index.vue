<template>
  <view class="min-h-screen pb-28 bg-white">
    
    <view class="px-5 pt-14 pb-8 border-b border-gray-50">
      <view class="flex items-center justify-between">
        <view class="flex items-center">
          <view class="w-14 h-14 rounded-full overflow-hidden shrink-0">
            <image src="https://picsum.photos/200/200?random=100" class="w-full h-full" mode="aspectFill"></image>
          </view>
          <view class="ml-4">
            <text class="text-lg font-bold text-gray-900">A-Liang</text>
            <text class="text-xs text-gray-400 mt-1 block">ID: 20260508</text>
          </view>
        </view>
        <view class="i-lucide-settings text-gray-300 text-lg"></view>
      </view>

      <view class="flex mt-7">
        <view class="flex-1 flex flex-col items-center py-3">
          <text class="text-xl font-bold text-gray-900">128</text>
          <text class="text-[11px] text-gray-400 mt-1">收藏</text>
        </view>
        <view class="w-[1px] bg-gray-100 my-2"></view>
        <view class="flex-1 flex flex-col items-center py-3">
          <text class="text-xl font-bold text-gray-900">45</text>
          <text class="text-[11px] text-gray-400 mt-1">下载</text>
        </view>
        <view class="w-[1px] bg-gray-100 my-2"></view>
        <view class="flex-1 flex flex-col items-center py-3">
          <text class="text-xl font-bold text-gray-900">9.2k</text>
          <text class="text-[11px] text-gray-400 mt-1">积分</text>
        </view>
      </view>
    </view>

    <view class="px-5 mt-2">
      <view
        v-for="(item, index) in menuList"
        :key="index"
        class="flex items-center justify-between py-4 active:bg-gray-50 transition-colors"
        :class="index < menuList.length - 1 ? 'border-b border-gray-50' : ''"
        @click="handleMenuClick(item)"
      >
        <view class="flex items-center gap-3">
          <view class="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
            <view :class="[item.icon, 'text-gray-400 text-sm']"></view>
          </view>
          <text class="text-sm text-gray-700">{{ item.title }}</text>
        </view>
        <view class="i-lucide-chevron-right text-gray-200 text-sm"></view>
      </view>
    </view>

    <view class="px-5 mt-10">
      <button class="w-full h-10 bg-white border border-gray-200 text-gray-400 text-sm rounded-lg active:bg-gray-50">
        退出登录
      </button>
    </view>

    <CustomTabBar :current="1" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CustomTabBar from '@/components/CustomTabBar.vue'

const menuList = ref([
  { title: '我的礼包码', icon: 'i-lucide-gift' },
  { title: '游戏更新提醒', icon: 'i-lucide-bell' },
  { title: '安全与设置', icon: 'i-lucide-settings' },
  { title: '联系客服', icon: 'i-lucide-message-circle' },
  { title: '关于', icon: 'i-lucide-info' },
])

const handleMenuClick = (item: any) => {
  uni.showToast({ title: `${item.title} 开发中`, icon: 'none' })
}
</script>

<style>
button::after { border: none; }
</style>
