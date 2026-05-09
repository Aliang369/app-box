<template>
  <view class="min-h-screen bg-white pb-24">
    <view class="px-6 pt-24 pb-8">
      <view class="flex items-center gap-5">
        <view class="w-20 h-20 rounded-full bg-gray-100 overflow-hidden shadow-sm border border-gray-50">
          <image 
            :src="isLogin ? userInfo.avatar : '/static/default-avatar.png'" 
            class="w-full h-full"
            mode="aspectFill"
          />
        </view>
        
        <view class="flex-1" @click="handleUserClick">
          <block v-if="isLogin">
            <text class="text-2xl font-black text-gray-900 block mb-1">{{ userInfo.username }}</text>
            <text class="text-xs text-gray-400 font-bold">正式玩家 ID: {{ userInfo.id }}</text>
          </block>
          <block v-else>
            <text class="text-2xl font-black text-gray-900 block mb-1">点击登录</text>
            <text class="text-sm text-gray-400 font-medium">登录领取专属游戏礼包</text>
          </block>
        </view>
        
        <view class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center active:bg-gray-100 transition-all">
          <view class="i-lucide-settings text-gray-600 text-lg"></view>
        </view>
      </view>
      
      <view class="flex mt-10">
        <view class="flex-1 text-center">
          <text class="block text-xl font-black text-gray-900">0</text>
          <text class="text-[10px] text-gray-400 font-bold uppercase mt-1">收藏</text>
        </view>
        <view class="flex-1 text-center">
          <text class="block text-xl font-black text-gray-900">12</text>
          <text class="text-[10px] text-gray-400 font-bold uppercase mt-1">足迹</text>
        </view>
        <view class="flex-1 text-center" @click="goToGifts">
          <text class="block text-xl font-black text-gray-900">3</text>
          <text class="text-[10px] text-gray-400 font-bold uppercase mt-1">礼包</text>
        </view>
      </view>
    </view>

    <view class="w-full h-2 bg-gray-50/50"></view>

    <view class="px-6 mt-8">
      <view class="bg-white rounded-3xl border border-gray-100 shadow-sm shadow-gray-100/50 overflow-hidden">
        <view class="p-5 flex items-center gap-4 active:bg-gray-50 transition-all" @click="goToGifts">
          <view class="i-lucide-gift text-gray-800 text-xl"></view>
          <text class="flex-1 text-sm font-bold text-gray-800">我的礼包中心</text>
          <view class="i-lucide-chevron-right text-gray-300 text-lg"></view>
        </view>
        
        <view class="h-[1px] bg-gray-50 mx-5"></view>
        
        <view class="p-5 flex items-center gap-4 active:bg-gray-50 transition-all">
          <view class="i-lucide-message-square text-gray-800 text-xl"></view>
          <text class="flex-1 text-sm font-bold text-gray-800">意见反馈</text>
          <view class="i-lucide-chevron-right text-gray-300 text-lg"></view>
        </view>
      </view>

      <view v-if="isLogin" class="mt-12 flex justify-center">
        <view class="px-6 py-3 rounded-full bg-gray-50 active:bg-gray-100 transition-all" @click="handleLogout">
          <text class="text-xs font-bold text-gray-400 tracking-widest">退出当前账号</text>
        </view>
      </view>
    </view>

    <CustomTabBar />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import CustomTabBar from '@/components/CustomTabBar.vue'

const isLogin = ref(false)
const userInfo = ref<any>({})

const checkLoginStatus = () => {
  const info = uni.getStorageSync('user_info')
  if (info) {
    userInfo.value = JSON.parse(info)
    isLogin.value = true
  } else {
    isLogin.value = false
    userInfo.value = {}
  }
}

onShow(() => {
  checkLoginStatus()
})

const handleUserClick = () => {
  if (!isLogin.value) {
    uni.navigateTo({ url: '/pages/login/index' })
  }
}

const goToGifts = () => {
  if (!isLogin.value) return uni.navigateTo({ url: '/pages/login/index' })
  uni.navigateTo({ url: '/pages/my/gifts' })
}

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        uni.removeStorageSync('user_info')
        checkLoginStatus()
      }
    }
  })
}
</script>