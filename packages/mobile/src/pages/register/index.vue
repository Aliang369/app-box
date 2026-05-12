<template>
  <view class="min-h-screen bg-gray-50">
    <PageHeader title="注册账号" fallback-url="/pages/my/index" />

    <view class="px-6 pt-8 pb-10">
      <view class="mb-10">
        <text class="text-[30px] font-black text-gray-900 block tracking-tight">创建新账号</text>
      </view>

      <view class="rounded-[36rpx] border border-gray-100 bg-white px-5 py-5 shadow-sm shadow-gray-100/70">
        <view class="space-y-4">
          <view class="bg-gray-50 rounded-2xl px-4 h-14 flex items-center border border-transparent focus-within:border-gray-200 focus-within:bg-white transition-colors">
            <view class="i-lucide-user-round-plus text-gray-400 text-lg mr-3"></view>
            <input
              v-model="form.username"
              type="text"
              maxlength="20"
              placeholder="设置账号，支持字母数字下划线"
              class="flex-1 text-sm text-gray-900 font-bold h-full"
              placeholder-class="text-gray-300"
            />
          </view>

          <view class="bg-gray-50 rounded-2xl px-4 h-14 flex items-center border border-transparent focus-within:border-gray-200 focus-within:bg-white transition-colors">
            <view class="i-lucide-lock text-gray-400 text-lg mr-3"></view>
            <input
              v-model="form.password"
              type="password"
              maxlength="20"
              password
              placeholder="设置密码，6-20位"
              class="flex-1 text-sm text-gray-900 font-bold h-full"
              placeholder-class="text-gray-300"
            />
          </view>

          <view class="bg-gray-50 rounded-2xl px-4 h-14 flex items-center border border-transparent focus-within:border-gray-200 focus-within:bg-white transition-colors">
            <view class="i-lucide-shield-check text-gray-400 text-lg mr-3"></view>
            <input
              v-model="form.confirmPassword"
              type="password"
              maxlength="20"
              password
              placeholder="再次输入密码"
              class="flex-1 text-sm text-gray-900 font-bold h-full"
              placeholder-class="text-gray-300"
            />
          </view>
        </view>
      </view>

      <view class="mt-6">
        <view class="w-full h-12 rounded-full bg-gray-900 flex items-center justify-center active:scale-[0.98] transition-transform" @click="handleRegister">
          <view v-if="isLoading" class="i-lucide-loader-2 animate-spin text-white text-lg"></view>
          <text v-else class="text-white text-sm font-black tracking-widest">注册并创建账号</text>
        </view>
      </view>

      <view class="mt-4 rounded-[28rpx] border border-gray-100 bg-white px-4 py-3">
        <view class="flex items-center gap-3" @click="agreed = !agreed">
          <view style="width: 20px; height: 20px;" class="mt-0.5 shrink-0 rounded-md border-2 flex items-center justify-center transition-colors shadow-[0_0_0_1px_rgba(0,0,0,0.35)]" :class="agreed ? 'bg-gray-900 border-gray-900 shadow-none' : 'bg-white border-gray-900'">
            <view v-if="agreed" class="i-lucide-check text-white text-[12px]"></view>
          </view>
          <view class="min-w-0 flex-1">
            <text class="text-[11px] leading-5 text-gray-500 font-bold">点击注册即代表你已同意 </text>
            <text class="text-[11px] leading-5 text-gray-900 font-black" @click.stop="openAgreement('user')">《用户协议》</text>
            <text class="text-[11px] leading-5 text-gray-400 font-bold"> 和 </text>
            <text class="text-[11px] leading-5 text-gray-900 font-black" @click.stop="openAgreement('privacy')">《隐私政策》</text>
          </view>
        </view>
      </view>

      <view class="mt-4 flex items-center justify-between px-1">
        <text class="text-xs text-gray-400 font-bold">已有账号？</text>
        <text class="text-xs text-gray-900 font-black" @click="goLogin">返回登录</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { registerApi } from '@/api/user'
import PageHeader from '@/components/PageHeader.vue'

const isLoading = ref(false)
const agreed = ref(false)
const form = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

const handleRegister = async () => {
  if (!form.username.trim() || !form.password || !form.confirmPassword) {
    return uni.showToast({ title: '请完整填写注册信息', icon: 'none' })
  }

  if (!agreed.value) {
    agreed.value = true
    uni.showToast({ title: '已为你勾选协议', icon: 'none' })
  }

  isLoading.value = true
  try {
    await registerApi({
      username: form.username.trim(),
      password: form.password,
      confirmPassword: form.confirmPassword
    })
    uni.showToast({ title: '注册成功', icon: 'success' })
    setTimeout(() => {
      uni.redirectTo({ url: '/pages/login/index' })
    }, 600)
  } catch (error) {
    // 错误提示由 request 统一处理
  } finally {
    isLoading.value = false
  }
}

const goLogin = () => {
  uni.redirectTo({ url: '/pages/login/index' })
}

const openAgreement = (type: 'user' | 'privacy') => {
  uni.navigateTo({ url: `/pages/agreement/index?type=${type}` })
}
</script>
