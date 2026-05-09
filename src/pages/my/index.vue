<template>
  <view class="min-h-screen bg-gray-50 pb-24">
    <view class="bg-white px-6 pt-24 pb-8 rounded-b-[40rpx] shadow-sm">
      <view class="flex items-center gap-5">
        <view class="w-20 h-20 rounded-full bg-gray-100 overflow-hidden shadow-sm border border-gray-50">
          <image :src="isLogin ? userInfo.avatar : '/static/default-avatar.png'" class="w-full h-full" mode="aspectFill" />
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
      </view>

      <view class="flex mt-10">
        <view class="flex-1 text-center active:bg-gray-50 transition-colors py-2 rounded-xl" @click="goTo('/pages/my/favorites')">
          <text class="block text-xl font-black text-gray-900">{{ stats.favCount }}</text>
          <text class="text-[10px] text-gray-400 font-bold uppercase mt-1">收藏</text>
        </view>
        <view class="flex-1 text-center active:bg-gray-50 transition-colors py-2 rounded-xl" @click="goTo('/pages/my/footprints')">
          <text class="block text-xl font-black text-gray-900">{{ stats.footCount }}</text>
          <text class="text-[10px] text-gray-400 font-bold uppercase mt-1">足迹</text>
        </view>
        <view class="flex-1 text-center active:bg-gray-50 transition-colors py-2 rounded-xl" @click="goTo('/pages/my/gifts')">
          <text class="block text-xl font-black text-gray-900">{{ stats.giftCount }}</text>
          <text class="text-[10px] text-gray-400 font-bold uppercase mt-1">礼包</text>
        </view>
      </view>
    </view>

    <view class="px-6 mt-6 space-y-4">
      <view class="bg-white rounded-3xl p-5 border border-gray-100 flex items-center justify-between active:scale-[0.98] transition-all shadow-sm shadow-gray-100/50" @click="goTo('/pages/my/gifts')">
        <view class="flex items-center gap-4">
          <view class="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
            <view class="i-lucide-gift text-amber-500 text-lg"></view>
          </view>
          <text class="text-sm font-black text-gray-900 tracking-wider">我的礼包</text>
        </view>
        <view class="flex items-center gap-2">
          <view v-if="stats.giftCount > 0" class="px-2 py-0.5 bg-red-50 rounded-md">
            <text class="text-[10px] font-bold text-red-500">{{ stats.giftCount }}</text>
          </view>
          <view class="i-lucide-chevron-right text-gray-300"></view>
        </view>
      </view>

      <view v-if="isLogin" class="mt-12 flex justify-center">
        <view class="px-8 py-3 rounded-full bg-gray-50 active:bg-gray-100 transition-all border border-gray-100" @click="handleLogout">
          <text class="text-xs font-black text-gray-400 tracking-widest uppercase">退出当前账号</text>
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
import { getUserStatsApi } from '@/api/user'

const isLogin = ref(false)
const userInfo = ref<any>({})
const stats = ref({ favCount: 0, footCount: 0, giftCount: 0 })

const checkLoginStatus = async () => {
  const info = uni.getStorageSync('user_info')
  if (info) {
    userInfo.value = JSON.parse(info)
    isLogin.value = true
    try {
      const res: any = await getUserStatsApi(userInfo.value.id)
      stats.value = res || { favCount: 0, footCount: 0, giftCount: 0 }
    } catch (e) {}
  } else {
    isLogin.value = false
    userInfo.value = {}
    stats.value = { favCount: 0, footCount: 0, giftCount: 0 }
  }
}

onShow(() => { checkLoginStatus() })

const handleUserClick = () => { if (!isLogin.value) uni.navigateTo({ url: '/pages/login/index' }) }
const goTo = (url: string) => {
  if (!isLogin.value) return uni.navigateTo({ url: '/pages/login/index' })
  uni.navigateTo({ url })
}
const handleLogout = () => {
  uni.showModal({
    title: '提示', content: '确定要退出吗？',
    success: (res) => { if (res.confirm) { uni.removeStorageSync('user_info'); checkLoginStatus() } }
  })
}
</script>
