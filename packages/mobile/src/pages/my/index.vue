<template>
  <view class="min-h-screen bg-gray-50 pb-24">
    <view class="bg-white px-6 pt-[calc(var(--status-bar-height,0px)+16px)] pb-8 rounded-b-[40rpx] shadow-sm">
      <view class="flex items-center gap-5">
        <view class="w-20 h-20 rounded-full bg-gray-100 overflow-hidden shadow-sm border border-gray-50">
          <image :src="isLogin ? userInfo.avatar : '/static/default-avatar.png'" class="w-full h-full" mode="aspectFill" />
        </view>
        <view class="flex-1" @click="handleUserClick">
          <block v-if="isLogin">
            <text class="text-2xl font-black text-gray-900 block mb-1">{{ userInfo.nickname || userInfo.username }}</text>
            <text class="text-xs text-gray-400 font-bold">账号：{{ userInfo.username }}</text>
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

    <view class="px-6 mt-6 pb-20">
      <view class="bg-white rounded-[32rpx] overflow-hidden shadow-sm shadow-gray-100/50 border border-gray-100/80">
        <view class="flex items-center justify-between p-5 active:bg-gray-50 transition-colors" @click="goToProfile">
          <view class="flex items-center gap-3">
            <view class="i-lucide-user-round text-gray-800 text-xl"></view>
            <text class="text-[15px] font-bold text-gray-900 tracking-wide">个人资料</text>
          </view>
          <view class="i-lucide-chevron-right text-gray-300"></view>
        </view>

        <view class="w-full h-px bg-gray-50 ml-12"></view>

        <view class="flex items-center justify-between p-5 active:bg-gray-50 transition-colors" @click="goTo('/pages/my/gifts')">
          <view class="flex items-center gap-3">
            <view class="i-lucide-gift text-gray-800 text-xl"></view>
            <text class="text-[15px] font-bold text-gray-900 tracking-wide">我的礼包</text>
          </view>
          <view class="flex items-center gap-2">
            <view v-if="stats.giftCount > 0" class="px-2 py-0.5 bg-red-50 rounded-full border border-red-100">
              <text class="text-[10px] font-black text-red-500">{{ stats.giftCount }}</text>
            </view>
            <view class="i-lucide-chevron-right text-gray-300"></view>
          </view>
        </view>

        <view class="w-full h-px bg-gray-50 ml-12"></view>

        <view class="flex items-center justify-between p-5 active:bg-gray-50 transition-colors">
          <view class="flex items-center gap-3">
            <view class="i-lucide-info text-gray-800 text-xl"></view>
            <text class="text-[15px] font-bold text-gray-900 tracking-wide">关于盒子</text>
          </view>
          <view class="i-lucide-chevron-right text-gray-300"></view>
        </view>

      </view>

      <view v-if="isLogin" class="mt-8 flex justify-center">
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
import { getUserProfileApi, getUserStatsApi } from '@/api/user'

const isLogin = ref(false)
const userInfo = ref<any>({})
const stats = ref({ favCount: 0, footCount: 0, giftCount: 0 })

const checkLoginStatus = async () => {
  const info = uni.getStorageSync('user_info')
  if (info) {
    userInfo.value = JSON.parse(info)
    isLogin.value = true
    try {
      const profile: any = await getUserProfileApi()
      userInfo.value = {
        ...userInfo.value,
        ...profile
      }
      uni.setStorageSync('user_info', JSON.stringify({
        ...JSON.parse(info),
        ...profile
      }))

      const res: any = await getUserStatsApi()
      stats.value = res || { favCount: 0, footCount: 0, giftCount: 0 }
    } catch (e) {
      uni.removeStorageSync('user_info')
      isLogin.value = false
      userInfo.value = {}
      stats.value = { favCount: 0, footCount: 0, giftCount: 0 }
    }
  } else {
    isLogin.value = false
    userInfo.value = {}
    stats.value = { favCount: 0, footCount: 0, giftCount: 0 }
  }
}

onShow(() => { checkLoginStatus() })

const handleUserClick = () => {
  if (!isLogin.value) return uni.navigateTo({ url: '/pages/login/index' })
  goToProfile()
}

const goToProfile = () => {
  if (!isLogin.value) return uni.navigateTo({ url: '/pages/login/index' })
  uni.navigateTo({ url: '/pages/my/profile' })
}

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
