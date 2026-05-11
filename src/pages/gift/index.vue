<template>
  <view class="min-h-screen bg-[#F9FAFB] pb-10">
    <view class="sticky top-0 z-30 pt-12 pb-4 px-5 bg-white border-b border-gray-100 flex items-center">
      <view class="i-lucide-arrow-left text-gray-900 text-xl" @click="goBack"></view>
      <text class="ml-4 text-lg font-bold text-gray-900">专属福利</text>
    </view>

    <view class="px-5 mt-6">
      <view v-if="isFirstLoading">
        <view v-for="i in 4" :key="i" class="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm mb-4 animate-pulse">
          <view class="p-4 flex justify-between items-center">
            <view class="flex gap-3 flex-1">
              <view class="w-12 h-12 rounded-lg bg-gray-100 shrink-0"></view>
              <view class="flex-1 flex flex-col justify-center">
                <view class="h-4 bg-gray-100 rounded w-1/2 mb-2"></view>
                <view class="h-2.5 bg-gray-50 rounded w-1/3"></view>
              </view>
            </view>
            <view class="w-16 h-8 rounded-full bg-gray-100"></view>
          </view>
          <view class="px-4 h-8 bg-gray-50 flex items-center">
            <view class="w-1/3 h-2.5 bg-gray-200 rounded"></view>
          </view>
        </view>
      </view>

      <view v-else>
        <view v-for="item in gifts" :key="item.id" class="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm mb-4 animate-fade-in">
          <view class="p-4 flex justify-between items-center">
            <view class="flex gap-3">
              <image :src="item.cover" class="w-12 h-12 rounded-lg border border-gray-100" mode="aspectFill"></image>
              <view>
                <text class="text-[15px] font-bold text-gray-900 block">{{ item.title }}</text>
                <text class="text-[11px] text-indigo-500 font-medium">价值 ¥{{ item.value }} 礼包</text>
              </view>
            </view>
            <button class="m-0 h-8 px-4 bg-indigo-600 text-white text-xs font-bold rounded-full active:bg-indigo-700" @click="claimGift(item)">领取</button>
          </view>
          <view class="px-4 py-2 bg-gray-50 border-t border-gray-50 flex items-center">
            <view class="i-lucide-clock text-gray-300 text-[10px] mr-1"></view>
            <text class="text-[10px] text-gray-400">剩余时间：{{ item.deadline }}</text>
          </view>
        </view>
      </view>
    </view>

    <view v-if="!isFirstLoading" class="py-6 flex items-center justify-center gap-2">
      <view v-if="loadingStatus === 'loading'" class="i-lucide-loader-2 text-gray-400 animate-spin text-sm"></view>
      <text class="text-[11px] text-gray-400 font-medium tracking-widest">
        {{ loadingStatus === 'loading' ? '正在加载更多...' : (loadingStatus === 'nomore' ? '— 已经到底啦 —' : '上拉加载更多') }}
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'

const goBack = () => uni.navigateBack()

const claimGift = (item: any) => {
  const data = uni.getStorageSync('user_info')
  if (!data) {
    uni.showModal({ title: '请先登录', content: '登录后即可领取', confirmText: '去登录', success: (res) => { if (res.confirm) uni.navigateTo({ url: '/pages/login/index' }) }})
    return
  }
  uni.showToast({ title: '领取成功！可在“我的”查看', icon: 'none' })
}

const gifts = ref<any[]>([])
const page = ref(1)
const loadingStatus = ref<'loadmore' | 'loading' | 'nomore'>('loadmore')
const isFirstLoading = ref(true)

const generateMockData = (pageNum: number) => {
  return Array.from({ length: 6 }).map((_, index) => {
    const id = `gift-${pageNum}-${index}`
    return { 
      id, title: `豪华大礼包 ${pageNum}-${index}`, value: Math.floor(Math.random() * 200 + 50), 
      cover: `https://picsum.photos/200/200?random=${pageNum}${index}gift`, deadline: `${Math.floor(Math.random() * 5 + 1)}天 ${Math.floor(Math.random() * 24)}小时` 
    }
  })
}

const fetchData = async (isRefresh = false) => {
  if (loadingStatus.value === 'loading' || (!isRefresh && loadingStatus.value === 'nomore')) return
  loadingStatus.value = 'loading'
  
  setTimeout(() => {
    const newData = generateMockData(page.value)
    if (isRefresh) { gifts.value = newData; uni.stopPullDownRefresh() } 
    else { gifts.value = [...gifts.value, ...newData] }
    isFirstLoading.value = false
    loadingStatus.value = page.value >= 3 ? 'nomore' : 'loadmore'
  }, 800)
}

onLoad(() => fetchData(true))
onPullDownRefresh(() => { page.value = 1; isFirstLoading.value = true; fetchData(true) })
onReachBottom(() => { if (loadingStatus.value !== 'nomore') { page.value++; fetchData(false) } })
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
</style>