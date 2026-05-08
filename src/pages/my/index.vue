<template>
  <view class="min-h-screen pb-32 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
    
    <view class="absolute top-0 left-0 right-0 h-60 bg-gradient-to-b from-indigo-200/30 to-transparent z-0"></view>

    <view class="relative z-10 px-5 pt-12">
      <view class="bg-white/40 backdrop-blur-xl border border-white/80 rounded-[40rpx] p-6 shadow-[0_20px_50px_rgba(99,102,241,0.1)] mb-6">
        <view class="flex items-center">
          <view class="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden shrink-0 shadow-indigo-200/50">
            <image src="https://picsum.photos/200/200?random=100" class="w-full h-full" mode="aspectFill"></image>
          </view>
          
          <view class="ml-4 flex-1">
            <view class="flex items-center gap-2">
              <text class="text-xl font-black text-indigo-900">旅行者 A-Liang</text>
              <view class="bg-pink-400 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">LV.99</view>
            </view>
            <text class="text-xs text-indigo-400 mt-1 block">ID: 20260508</text>
            <view class="mt-3 bg-indigo-50/50 rounded-lg px-3 py-1.5 border border-indigo-100/50">
              <text class="text-[11px] text-indigo-500 font-medium">“在星海中寻找属于我的那枚勋章 ✨”</text>
            </view>
          </view>
        </view>

        <view class="flex justify-around mt-8 border-t border-indigo-50/50 pt-5">
          <view class="flex flex-col items-center">
            <text class="text-lg font-black text-indigo-900">128</text>
            <text class="text-[10px] text-indigo-400 font-bold uppercase tracking-tighter">我的收藏</text>
          </view>
          <view class="w-[1px] h-8 bg-indigo-100/50"></view>
          <view class="flex flex-col items-center">
            <text class="text-lg font-black text-indigo-900">45</text>
            <text class="text-[10px] text-indigo-400 font-bold uppercase tracking-tighter">下载记录</text>
          </view>
          <view class="w-[1px] h-8 bg-indigo-100/50"></view>
          <view class="flex flex-col items-center">
            <text class="text-lg font-black text-indigo-900">9.2k</text>
            <text class="text-[10px] text-indigo-400 font-bold uppercase tracking-tighter">幻想积分</text>
          </view>
        </view>
      </view>

      <view class="bg-white/30 backdrop-blur-md border border-white/60 rounded-[32rpx] overflow-hidden shadow-sm">
        <view class="p-2">
          <view
            v-for="(item, index) in menuList"
            :key="index"
            class="flex items-center justify-between p-4 hover:bg-white/20 active:bg-white/40 transition-colors rounded-2xl mb-1 last:mb-0"
            @click="handleMenuClick(item)"
          >
            <view class="flex items-center gap-3">
              <text :class="[item.icon, 'text-xl text-indigo-500']">{{ item.emoji }}</text>
              <text class="text-sm font-bold text-indigo-800">{{ item.title }}</text>
            </view>
            <text class="text-indigo-300">›</text>
          </view>
        </view>
      </view>

      <view class="mt-8 px-4">
        <button class="w-full h-12 rounded-full bg-white/40 border border-white/80 text-pink-500 font-bold text-sm shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-2">
          <text>🔓</text>
          退出当前账号
        </button>
      </view>
    </view>

    <CustomTabBar :current="1" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CustomTabBar from '@/components/CustomTabBar.vue'

const menuList = ref([
  { title: '我的礼包码', icon: '', emoji: '🎁', path: '/pages/gift/index' },
  { title: '游戏更新提醒', icon: '', emoji: '🔔', path: '/pages/notify/index' },
  { title: '安全与设置', icon: '', emoji: '⚙️', path: '/pages/settings/index' },
  { title: '联系猫耳客服', icon: '', emoji: '💬', path: '/pages/service/index' },
  { title: '关于 App 盒子', icon: '', emoji: 'ℹ️', path: '/pages/about/index' },
])

const handleMenuClick = (item: any) => {
  uni.showToast({
    title: `${item.title} 开发中...`,
    icon: 'none'
  })
}
</script>

<style>
button::after { border: none; }
</style>
