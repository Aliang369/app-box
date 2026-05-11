<template>
  <view class="min-h-screen bg-white px-6 pt-24 pb-10 flex flex-col">
    <view class="mb-10 flex items-center justify-between">
      <view>
        <text class="text-3xl font-black text-gray-900 block mb-2 tracking-tight">我的礼包</text>
        <text class="text-xs text-gray-400 font-bold uppercase tracking-widest">Gift Center</text>
      </view>
      <view class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center active:bg-gray-100" @click="goBack">
        <view class="i-lucide-x text-gray-400 text-lg"></view>
      </view>
    </view>

    <view v-if="loading" class="flex flex-col items-center justify-center py-20">
      <view class="i-lucide-loader-2 animate-spin text-gray-200 text-3xl mb-4"></view>
      <text class="text-xs text-gray-300 font-bold">正在整理您的福利...</text>
    </view>

    <block v-else-if="giftList.length > 0">
      <view class="space-y-6">
        <view
          v-for="(item, index) in giftList"
          :key="index"
          class="group bg-white rounded-[40rpx] border border-gray-100 p-5 shadow-sm shadow-gray-100/50 active:scale-[0.98] transition-all"
        >
          <view class="flex items-center gap-4 mb-5">
            <image :src="item.cover" class="w-14 h-14 rounded-2xl bg-gray-50" mode="aspectFill" />
            <view class="flex-1">
              <text class="text-base font-black text-gray-900 block mb-0.5">{{ item.title }}</text>
              <text class="text-[10px] text-gray-400 font-bold">{{ formatDate(item.created_at) }} 领取</text>
            </view>
            <view class="px-3 py-1 bg-green-50 rounded-lg">
              <text class="text-[10px] text-green-600 font-bold">已入库</text>
            </view>
          </view>

          <view
            class="bg-gray-50/80 rounded-2xl p-4 flex items-center justify-between border border-dashed border-gray-200"
            @click="copyCode(item.gift_code)"
          >
            <view>
              <text class="text-[10px] text-gray-400 font-bold block mb-1 uppercase tracking-tighter">激活码</text>
              <text class="text-sm font-mono font-black text-indigo-600 tracking-wider">{{ item.gift_code }}</text>
            </view>
            <view class="flex items-center gap-1.5 text-indigo-400">
              <text class="text-[10px] font-black uppercase">复制</text>
              <view class="i-lucide-copy text-xs"></view>
            </view>
          </view>
        </view>
      </view>
    </block>

    <view v-else class="flex-1 flex flex-col items-center justify-center pb-20">
      <view class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
        <view class="i-lucide-gift text-gray-200 text-4xl"></view>
      </view>
      <text class="text-sm text-gray-400 font-bold mb-10">这里空空如也，快去领一个吧</text>
      <view
        class="px-8 py-3 bg-gray-900 rounded-full active:scale-95 transition-all"
        @click="goToDiscover"
      >
        <text class="text-white text-xs font-black tracking-widest">去发现惊喜</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getMyGiftsApi } from '@/api/user'

const loading = ref(true)
const giftList = ref<any[]>([])

const fetchGifts = async () => {
  const userInfoStr = uni.getStorageSync('user_info')
  if (!userInfoStr) {
    loading.value = false
    return
  }
  
  const user = JSON.parse(userInfoStr)
  try {
    const res: any = await getMyGiftsApi(user.id)
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

const goBack = () => uni.navigateBack()

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
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`
}
</script>
