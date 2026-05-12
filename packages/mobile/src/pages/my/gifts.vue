<template>
  <view class="min-h-screen bg-gray-50 pb-10">
    <PageHeader title="我的礼包" fallback-url="/pages/my/index" />

    <view v-if="loading" class="px-6 pt-6 space-y-4">
      <view class="bg-white rounded-[32rpx] border border-gray-100 p-5">
        <view class="flex items-center gap-4">
          <view class="w-14 h-14 rounded-2xl bg-gray-100 animate-pulse"></view>
          <view class="flex-1 space-y-2">
            <view class="h-4 bg-gray-100 rounded animate-pulse"></view>
            <view class="h-3 w-24 bg-gray-100 rounded animate-pulse"></view>
          </view>
        </view>
        <view class="mt-5 h-16 rounded-2xl bg-gray-50 animate-pulse"></view>
      </view>
      <view class="bg-white rounded-[32rpx] border border-gray-100 p-5">
        <view class="flex items-center gap-4">
          <view class="w-14 h-14 rounded-2xl bg-gray-100 animate-pulse"></view>
          <view class="flex-1 space-y-2">
            <view class="h-4 bg-gray-100 rounded animate-pulse"></view>
            <view class="h-3 w-20 bg-gray-100 rounded animate-pulse"></view>
          </view>
        </view>
        <view class="mt-5 h-16 rounded-2xl bg-gray-50 animate-pulse"></view>
      </view>
    </view>

    <block v-else-if="giftList.length > 0">
      <view class="px-6 pt-5">
        <view class="mb-4 flex items-center justify-between">
          <text class="text-xs font-bold text-gray-400 tracking-wide">已领取礼包</text>
          <text class="text-xs font-bold text-gray-400">共 {{ giftList.length }} 个</text>
        </view>

        <view class="space-y-4">
          <view
            v-for="(item, index) in giftList"
            :key="index"
            class="bg-white rounded-[32rpx] border border-gray-100 p-5 active:bg-gray-50 transition-colors"
          >
            <view class="flex items-center gap-4">
              <image :src="item.cover" class="w-14 h-14 rounded-2xl bg-gray-100" mode="aspectFill" />
              <view class="min-w-0 flex-1">
                <text class="text-[15px] font-black text-gray-900 block leading-6">{{ item.title }}</text>
                <text class="mt-1 block text-[11px] text-gray-400 font-bold">{{ formatDate(item.created_at) }} 领取</text>
              </view>
              <view class="shrink-0 px-3 py-1 rounded-full bg-gray-50 border border-gray-100">
                <text class="text-[10px] text-gray-500 font-bold">已领取</text>
              </view>
            </view>

            <view class="my-4 h-px bg-gray-100"></view>

            <view
              class="rounded-2xl bg-gray-50 px-4 py-3.5 flex items-center justify-between active:bg-gray-100 transition-colors"
              @click="copyCode(item.gift_code)"
            >
              <view class="min-w-0 flex-1 pr-4">
                <text class="block text-[10px] text-gray-400 font-bold tracking-wide">激活码</text>
                <text class="mt-1 block text-sm font-black text-gray-900 tracking-wide">{{ item.gift_code }}</text>
              </view>
              <view class="shrink-0 flex items-center gap-1.5 text-gray-500">
                <text class="text-[11px] font-bold">复制</text>
                <view class="i-lucide-copy text-sm"></view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </block>

    <view v-else class="px-6 pt-20 flex flex-col items-center justify-center">
      <view class="w-18 h-18 bg-white rounded-full flex items-center justify-center border border-gray-100 mb-5">
        <view class="i-lucide-gift text-gray-300 text-3xl"></view>
      </view>
      <text class="text-base text-gray-900 font-black mb-2">还没有领取过礼包</text>
      <text class="text-xs text-gray-400 font-bold mb-8">去首页挑一个喜欢的游戏领取吧</text>
      <view
        class="px-8 h-11 bg-gray-900 rounded-full flex items-center justify-center active:scale-95 transition-all"
        @click="goToDiscover"
      >
        <text class="text-white text-xs font-black tracking-widest">去领取礼包</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getMyGiftsApi } from '@/api/user'
import PageHeader from '@/components/PageHeader.vue'

const loading = ref(true)
const giftList = ref<any[]>([])

const fetchGifts = async () => {
  const userInfoStr = uni.getStorageSync('user_info')
  if (!userInfoStr) {
    loading.value = false
    return
  }
  
  try {
    const res: any = await getMyGiftsApi()
    giftList.value = res
  } catch (e) {
    // 错误处理由 request 拦截器负责
  } finally {
    loading.value = false
  }
}

onShow(() => {
  fetchGifts()
})

const goToDiscover = () => {
  uni.switchTab({ url: '/pages/index/index' })
}

const copyCode = (code: string) => {
  uni.setClipboardData({
    data: code,
    success: () => {
      uni.vibrateShort({})
    }
  })
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}.${month}.${day}`
}
</script>
