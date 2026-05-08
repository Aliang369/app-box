<template>
  <view class="min-h-screen bg-white px-8 pt-32 pb-10 flex flex-col">
    <view class="mb-12">
      <view class="i-lucide-shield-check text-indigo-600 text-5xl mb-6"></view>
      <text class="text-2xl font-bold text-gray-900 block">欢迎来到 App 盒子</text>
      <text class="text-sm text-gray-400 mt-2 block">发现属于你的次元羁绊</text>
    </view>

    <view class="flex flex-col gap-6">
      <view class="h-14 border-b border-gray-100 flex items-center">
        <view class="i-lucide-smartphone text-gray-300 mr-3 text-lg"></view>
        <input
          v-model="phone"
          type="number"
          placeholder="请输入手机号"
          placeholder-class="text-gray-200"
          class="flex-1 text-[15px] text-gray-900"
        />
      </view>
      <view class="h-14 border-b border-gray-100 flex items-center">
        <view class="i-lucide-lock text-gray-300 mr-3 text-lg"></view>
        <input
          v-model="code"
          type="number"
          placeholder="请输入验证码"
          placeholder-class="text-gray-200"
          class="flex-1 text-[15px] text-gray-900"
        />
        <text class="text-[13px] font-bold text-indigo-600 ml-2" @click="sendCode">获取验证码</text>
      </view>
    </view>

    <button
      class="mt-12 w-full h-12 bg-indigo-600 text-white rounded-full font-bold text-[15px] active:scale-[0.98] transition-all flex items-center justify-center shadow-lg shadow-indigo-100 m-0"
      @click="handleLogin"
    >
      立即登录
    </button>

    <view class="flex items-center justify-center mt-6 gap-4">
      <text class="text-[12px] text-gray-300">其他方式登录</text>
      <view class="flex gap-4">
        <view class="i-lucide-wechat text-gray-300 text-xl"></view>
        <view class="i-lucide-apple text-gray-300 text-xl"></view>
      </view>
    </view>

    <view class="mt-auto text-center">
      <text class="text-[11px] text-gray-300">登录即代表同意《用户协议》与《隐私政策》</text>
    </view>
    
    <view class="absolute top-12 left-6" @click="goBack">
      <view class="i-lucide-chevron-left text-gray-900 text-xl"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const phone = ref('')
const code = ref('')

const goBack = () => uni.navigateBack()

const sendCode = () => {
  if (!phone.value) return uni.showToast({ title: '请输入手机号', icon: 'none' })
  uni.showToast({ title: '验证码已发送', icon: 'none' })
}

const handleLogin = () => {
  if (!phone.value || !code.value) return uni.showToast({ title: '请填写完整信息', icon: 'none' })
  
  uni.showLoading({ title: '登录中...' })
  
  setTimeout(() => {
    const userInfo = {
      nickname: '旅行者 A-Liang',
      avatar: ' `https://picsum.photos/200/200?random=100` ',
      token: 'mock_token_123456'
    }
    uni.setStorageSync('user_info', JSON.stringify(userInfo))
    uni.hideLoading()
    uni.showToast({ title: '登录成功' })
    
    setTimeout(() => {
      uni.navigateBack()
    }, 500)
  }, 1000)
}
</script>

<style scoped>
button::after { border: none; }
</style>