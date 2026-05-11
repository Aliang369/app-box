<template>
  <view class="min-h-screen bg-white px-8 pt-32 pb-10 flex flex-col relative">
    <view class="absolute top-14 left-6 w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center active:bg-gray-100 transition-all" @click="goBack">
      <view class="i-lucide-arrow-left text-gray-900 text-lg"></view>
    </view>

    <view class="mb-14 animate-fade-in-up">
      <text class="text-4xl font-black text-gray-900 block mb-3 tracking-wider">欢迎回来</text>
      <text class="text-sm text-gray-400 font-bold">登录或注册以领取专属游戏福利</text>
    </view>

    <view class="space-y-6 animate-fade-in-up" style="animation-delay: 0.1s;">
      <view class="bg-gray-50 rounded-2xl p-4 flex items-center border-2 border-transparent focus-within:border-indigo-100 focus-within:bg-white transition-all">
        <view class="i-lucide-user text-gray-400 text-xl mr-3"></view>
        <input v-model="form.username" type="text" placeholder="请输入账号 (新账号将自动注册)" class="flex-1 text-gray-900 font-bold placeholder-gray-300 text-sm h-full" />
      </view>

      <view class="bg-gray-50 rounded-2xl p-4 flex items-center border-2 border-transparent focus-within:border-indigo-100 focus-within:bg-white transition-all">
        <view class="i-lucide-lock text-gray-400 text-xl mr-3"></view>
        <input v-model="form.password" type="password" placeholder="请输入密码" class="flex-1 text-gray-900 font-bold placeholder-gray-300 text-sm h-full" />
      </view>
    </view>

    <view class="mt-14 animate-fade-in-up" style="animation-delay: 0.2s;">
      <view class="w-full h-14 bg-indigo-600 rounded-2xl flex items-center justify-center active:scale-[0.98] active:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/30" @click="handleLogin">
        <view v-if="isLoading" class="i-lucide-loader-2 animate-spin text-white text-xl"></view>
        <text v-else class="text-white font-black text-base tracking-widest">立即出发</text>
      </view>
    </view>
    
    <view class="mt-auto text-center animate-fade-in-up" style="animation-delay: 0.3s;">
      <text class="text-xs text-gray-400 font-bold">登录即代表同意用户协议与隐私政策</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { loginApi } from '@/api/user'

const isLoading = ref(false)
const form = reactive({
  username: '',
  password: ''
})

const goBack = () => {
  uni.navigateBack()
}

const handleLogin = async () => {
  if (!form.username.trim() || !form.password.trim()) {
    return uni.showToast({ title: '账号或密码不能为空', icon: 'none' })
  }
  
  isLoading.value = true
  try {
    const res: any = await loginApi(form)
    uni.setStorageSync('user_info', JSON.stringify({
      token: res.token,
      ...res.userInfo
    }))
    
    uni.showToast({ title: '登录成功', icon: 'success' })
    
    setTimeout(() => {
      uni.$emit('login_success')
      uni.navigateBack()
    }, 1000)
  } catch (error) {
    // 错误已经在 request.ts 拦截器里提示过了
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30rpx); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
