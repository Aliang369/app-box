<template>
  <view class="min-h-screen bg-gray-50">
    <PageHeader title="个人资料" fallback-url="/pages/my/index" />

    <view class="px-6 pt-5 pb-10 space-y-4">
      <view v-if="loading" class="bg-white rounded-[32rpx] border border-gray-100 p-5">
        <view class="flex items-center gap-4">
          <view class="w-16 h-16 rounded-full bg-gray-100 animate-pulse"></view>
          <view class="flex-1 space-y-2">
            <view class="h-4 rounded bg-gray-100 animate-pulse"></view>
            <view class="h-3 w-28 rounded bg-gray-100 animate-pulse"></view>
          </view>
        </view>
      </view>

      <block v-else>
        <view class="bg-white rounded-[32rpx] border border-gray-100 p-5">
          <view class="flex items-center gap-4">
            <image :src="profile.avatar" class="w-16 h-16 rounded-full bg-gray-100 border border-gray-100" mode="aspectFill" />
            <view class="flex-1 min-w-0">
              <text class="block text-xl font-black text-gray-900 truncate">{{ profile.nickname }}</text>
              <text class="block mt-1 text-xs text-gray-400 font-bold">账号：{{ profile.username }}</text>
            </view>
          </view>

          <view class="mt-5 pt-5 border-t border-gray-100 space-y-4">
            <view>
              <text class="block text-xs text-gray-400 font-bold mb-2">账号</text>
              <view class="h-12 rounded-2xl bg-gray-50 px-4 flex items-center">
                <text class="text-sm text-gray-900 font-bold">{{ profile.username }}</text>
              </view>
            </view>

            <view>
              <text class="block text-xs text-gray-400 font-bold mb-2">昵称</text>
              <view class="h-12 rounded-2xl bg-gray-50 px-4 flex items-center border border-transparent focus-within:border-gray-200 focus-within:bg-white transition-colors">
                <input
                  v-model="nickname"
                  type="text"
                  maxlength="20"
                  placeholder="请输入昵称"
                  class="flex-1 text-sm text-gray-900 font-bold h-full"
                  placeholder-class="text-gray-300"
                />
              </view>
            </view>

            <view class="w-full h-11 rounded-full bg-gray-900 flex items-center justify-center active:scale-[0.98] transition-transform" @click="handleSaveNickname">
              <view v-if="savingNickname" class="i-lucide-loader-2 animate-spin text-white text-lg"></view>
              <text v-else class="text-white text-xs font-black tracking-widest">保存昵称</text>
            </view>
          </view>
        </view>

        <view class="bg-white rounded-[32rpx] border border-gray-100 p-5">
          <text class="block text-base font-black text-gray-900 mb-4">修改密码</text>

          <view class="space-y-4">
            <view class="h-12 rounded-2xl bg-gray-50 px-4 flex items-center border border-transparent focus-within:border-gray-200 focus-within:bg-white transition-colors">
              <input
                v-model="passwordForm.oldPassword"
                type="password"
                password
                maxlength="20"
                placeholder="请输入原密码"
                class="flex-1 text-sm text-gray-900 font-bold h-full"
                placeholder-class="text-gray-300"
              />
            </view>

            <view class="h-12 rounded-2xl bg-gray-50 px-4 flex items-center border border-transparent focus-within:border-gray-200 focus-within:bg-white transition-colors">
              <input
                v-model="passwordForm.newPassword"
                type="password"
                password
                maxlength="20"
                placeholder="请输入新密码"
                class="flex-1 text-sm text-gray-900 font-bold h-full"
                placeholder-class="text-gray-300"
              />
            </view>

            <view class="h-12 rounded-2xl bg-gray-50 px-4 flex items-center border border-transparent focus-within:border-gray-200 focus-within:bg-white transition-colors">
              <input
                v-model="passwordForm.confirmPassword"
                type="password"
                password
                maxlength="20"
                placeholder="请再次输入新密码"
                class="flex-1 text-sm text-gray-900 font-bold h-full"
                placeholder-class="text-gray-300"
              />
            </view>

            <view class="w-full h-11 rounded-full bg-gray-100 flex items-center justify-center active:scale-[0.98] transition-transform" @click="handleChangePassword">
              <view v-if="savingPassword" class="i-lucide-loader-2 animate-spin text-gray-700 text-lg"></view>
              <text v-else class="text-gray-900 text-xs font-black tracking-widest">修改密码</text>
            </view>
          </view>
        </view>
      </block>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import PageHeader from '@/components/PageHeader.vue'
import { getUserProfileApi, updateNicknameApi, updatePasswordApi } from '@/api/user'

const loading = ref(true)
const savingNickname = ref(false)
const savingPassword = ref(false)
const nickname = ref('')
const profile = ref<any>({
  avatar: '',
  nickname: '',
  username: ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const syncLocalUserInfo = (nextUser: any) => {
  const current = uni.getStorageSync('user_info')
  const parsed = current ? JSON.parse(current) : {}
  uni.setStorageSync('user_info', JSON.stringify({
    ...parsed,
    ...nextUser
  }))
}

const fetchProfile = async () => {
  const userInfoStr = uni.getStorageSync('user_info')
  if (!userInfoStr) {
    uni.redirectTo({ url: '/pages/login/index' })
    return
  }

  loading.value = true
  try {
    const res: any = await getUserProfileApi()
    profile.value = res
    nickname.value = res.nickname
    syncLocalUserInfo(res)
  } catch (error) {
    uni.removeStorageSync('user_info')
    uni.redirectTo({ url: '/pages/login/index' })
  } finally {
    loading.value = false
  }
}

onShow(() => {
  fetchProfile()
})

const handleSaveNickname = async () => {
  if (!nickname.value.trim()) {
    return uni.showToast({ title: '昵称不能为空', icon: 'none' })
  }

  savingNickname.value = true
  try {
    const res: any = await updateNicknameApi({ nickname: nickname.value.trim() })
    profile.value = res
    nickname.value = res.nickname
    syncLocalUserInfo(res)
    uni.showToast({ title: '昵称已更新', icon: 'success' })
  } catch (error) {
    // 错误提示由 request 统一处理
  } finally {
    savingNickname.value = false
  }
}

const handleChangePassword = async () => {
  if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
    return uni.showToast({ title: '请完整填写密码信息', icon: 'none' })
  }

  savingPassword.value = true
  try {
    await updatePasswordApi({ ...passwordForm })
    uni.removeStorageSync('user_info')
    uni.showToast({ title: '请重新登录', icon: 'success' })
    setTimeout(() => {
      uni.redirectTo({ url: '/pages/login/index' })
    }, 600)
  } catch (error) {
    // 错误提示由 request 统一处理
  } finally {
    savingPassword.value = false
  }
}
</script>
