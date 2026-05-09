<template>
  <view class="min-h-screen bg-gray-50/50 pb-20">
    <view class="bg-white px-6 pt-20 pb-10 rounded-b-[60rpx] shadow-sm">
      <view class="flex items-center gap-5">
        <view class="w-20 h-20 rounded-3xl bg-gray-100 overflow-hidden border-4 border-white shadow-lg">
          <image
            :src="isLogin ? userInfo.avatar : '/static/default-avatar.png'"
            class="w-full h-full"
            mode="aspectFill"
          />
        </view>
        
        <view class="flex-1" @click="handleUserClick">
          <block v-if="isLogin">
            <text class="text-2xl font-black text-gray-900 block mb-1">{{ userInfo.username }}</text>
            <view class="inline-flex items-center px-2 py-1 bg-indigo-50 rounded-lg">
              <text class="text-[10px] text-indigo-500 font-bold tracking-tight">正式玩家 ID: {{ userInfo.id }}</text>
            </view>
          </block>
          <block v-else>
            <text class="text-2xl font-black text-gray-900 block mb-1">点击登录</text>
            <text class="text-sm text-gray-400 font-medium">登录领取专属游戏礼包</text>
          </block>
        </view>
        
        <view class="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center">
          <view class="i-lucide-settings text-gray-400 text-lg"></view>
        </view>
      </view>
      
      <view class="flex mt-10 px-4">
        <view class="flex-1 text-center">
          <text class="block text-xl font-black text-gray-900">0</text>
          <text class="text-[10px] text-gray-400 font-bold uppercase">收藏</text>
        </view>
        <view class="w-[1px] h-8 bg-gray-100 self-center"></view>
        <view class="flex-1 text-center">
          <text class="block text-xl font-black text-gray-900">12</text>
          <text class="text-[10px] text-gray-400 font-bold uppercase">足迹</text>
        </view>
        <view class="w-[1px] h-8 bg-gray-100 self-center"></view>
        <view class="flex-1 text-center" @click="goToGifts">
          <text class="block text-xl font-black text-gray-900">3</text>
          <text class="text-[10px] text-gray-400 font-bold uppercase">礼包</text>
        </view>
      </view>
    </view>

    <view class="px-6 mt-8 space-y-4">
      <view class="bg-white rounded-3xl p-5 flex items-center gap-4 active:scale-[0.98] transition-all shadow-sm" @click="goToGifts">
        <view class="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center">
          <view class="i-lucide-gift text-amber-500"></view>
        </view>
        <text class="flex-1 text-sm font-bold text-gray-700">我的礼包中心</text>
        <view class="i-lucide-chevron-right text-gray-300"></view>
      </view>

      <view class="bg-white rounded-3xl p-5 flex items-center gap-4 active:scale-[0.98] transition-all shadow-sm">
        <view class="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
          <view class="i-lucide-message-square text-blue-500"></view>
        </view>
        <text class="flex-1 text-sm font-bold text-gray-700">意见反馈</text>
        <view class="i-lucide-chevron-right text-gray-300"></view>
      </view>

      <view v-if="isLogin" class="bg-red-50 rounded-3xl p-5 flex items-center gap-4 active:scale-[0.98] transition-all" @click="handleLogout">
        <view class="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-red-500 shadow-sm">
          <view class="i-lucide-log-out"></view>
        </view>
        <text class="flex-1 text-sm font-bold text-red-500">安全退出账号</text>
      </view>
    </view>

    <CustomTabBar />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
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

// 每次进入页面都检查一下状态，确保登录回来后UI立即更新
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
        uni.showToast({ title: '已安全退出', icon: 'none' })
      }
    }
  })
}
</script>
