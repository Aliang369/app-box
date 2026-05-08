<template>
  <view class="min-h-screen pb-32 bg-[#F9FAFB]">
    <view class="px-6 pt-16 pb-8 bg-white border-b border-gray-100">
      <view class="flex items-center">
        <view class="w-16 h-16 rounded-full border border-gray-100 overflow-hidden shrink-0">
          <image src="https://picsum.photos/200/200?random=100" class="w-full h-full" mode="aspectFill"></image>
        </view>
        <view class="ml-4">
          <text class="text-xl font-bold text-gray-900">旅行者 A-Liang</text>
          <view class="flex items-center gap-2 mt-1">
            <text class="text-[10px] text-gray-400 font-medium">ID: 20260508</text>
            <text class="text-[10px] py-0.5 px-1.5 bg-gray-100 text-gray-500 rounded">LV.99</text>
          </view>
        </view>
      </view>

      <view class="flex mt-8">
        <view class="flex-1 flex flex-col items-center">
          <text class="text-base font-bold text-gray-900">128</text>
          <text class="text-[10px] text-gray-400">收藏</text>
        </view>
        <view class="w-[1px] h-6 bg-gray-100"></view>
        <view class="flex-1 flex flex-col items-center">
          <text class="text-base font-bold text-gray-900">45</text>
          <text class="text-[10px] text-gray-400">下载</text>
        </view>
        <view class="w-[1px] h-6 bg-gray-100"></view>
        <view class="flex-1 flex flex-col items-center">
          <text class="text-base font-bold text-gray-900">9.2k</text>
          <text class="text-[10px] text-gray-400">积分</text>
        </view>
      </view>
    </view>

    <view class="mt-4 px-4">
      <view class="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
        <view
          v-for="(item, index) in menuList"
          :key="index"
          class="flex items-center justify-between p-4 border-b border-gray-50 last:border-0 active:bg-gray-50"
          @click="handleMenuClick(item)"
        >
          <view class="flex items-center gap-3">
            <text class="text-xl text-gray-400">{{ item.emoji }}</text>
            <text class="text-sm text-gray-700">{{ item.title }}</text>
          </view>
          <text class="text-gray-300 text-lg">›</text>
        </view>
      </view>

      <button class="mt-6 w-full h-11 bg-white border border-gray-200 text-gray-500 text-sm font-medium rounded-full active:bg-gray-100">
        退出当前账号
      </button>
    </view>

    <CustomTabBar :current="1" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CustomTabBar from '@/components/CustomTabBar.vue'

const menuList = ref([
  { title: '我的礼包码', emoji: '🎁' },
  { title: '游戏更新提醒', emoji: '🔔' },
  { title: '安全与设置', emoji: '⚙️' },
  { title: '联系猫耳客服', emoji: '💬' },
  { title: '关于 App 盒子', emoji: 'ℹ️' },
])

const handleMenuClick = (item: any) => {
  uni.showToast({ title: `${item.title} 开发中`, icon: 'none' })
}
</script>

<style>
button::after { border: none; }
</style>
