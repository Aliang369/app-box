<template>
  <view class="min-h-screen bg-[#FFFFFF] pb-10">
    <view class="sticky top-0 z-30 pt-12 pb-4 px-5 bg-white/90 backdrop-blur-md border-b border-gray-50 flex items-center">
      <view class="i-lucide-arrow-left text-gray-900 text-xl" @click="goBack"></view>
      <text class="ml-4 text-lg font-bold text-gray-900">最新上线</text>
    </view>
    
    <view class="px-5 mt-6">
      <view v-if="isFirstLoading">
        <view v-for="i in 5" :key="i" class="flex gap-4 mb-8 relative animate-pulse">
          <view class="w-[2px] bg-gray-50 absolute left-[40rpx] top-12 bottom-[-32rpx]" v-if="i !== 5"></view>
          <view class="flex flex-col items-center shrink-0">
            <view class="w-10 h-10 rounded-full bg-gray-100 z-10"></view>
          </view>
          <view class="flex-1 bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
            <view class="flex gap-3">
              <view class="w-16 h-16 rounded-xl bg-gray-100 shrink-0"></view>
              <view class="flex-1 flex flex-col justify-center">
                <view class="h-4 bg-gray-100 rounded w-2/3 mb-2.5"></view>
                <view class="h-2.5 bg-gray-50 rounded w-1/3"></view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view v-else>
        <view v-for="(item, index) in latestGames" :key="item.id" class="flex gap-4 mb-8 relative animate-fade-in">
          <view class="w-[2px] bg-gray-50 absolute left-[40rpx] top-12 bottom-[-32rpx]" v-if="index !== latestGames.length - 1"></view>
          <view class="flex flex-col items-center shrink-0">
            <view class="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center z-10">
              <text class="text-[10px] font-bold text-indigo-600">{{ item.date }}</text>
            </view>
          </view>
          <view class="flex-1 bg-gray-50/50 rounded-2xl p-4 border border-gray-100 active:bg-gray-100 transition-all" @click="goToDetail(item.id)">
            <view class="flex gap-3">
              <image :src="item.cover" class="w-16 h-16 rounded-xl border border-gray-100 bg-white" mode="aspectFill"></image>
              <view class="flex-1 flex flex-col justify-center">
                <text class="text-[15px] font-bold text-gray-900">{{ item.title }}</text>
                <text class="text-[12px] text-gray-400 mt-1">#{{ item.tag }} · 今日更新</text>
              </view>
            </view>
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
const goToDetail = (id: string) => uni.navigateTo({ url: `/pages/detail/index?id=${id}` })

const latestGames = ref<any[]>([])
const page = ref(1)
const loadingStatus = ref<'loadmore' | 'loading' | 'nomore'>('loadmore')
const isFirstLoading = ref(true)

const generateMockData = (pageNum: number) => {
  return Array.from({ length: 6 }).map((_, index) => {
    const id = `new-${pageNum}-${index}`
    return { 
      id, title: `新游戏 ${pageNum}-${index}`, date: `05.0${Math.max(1, 9 - pageNum)}`, 
      tag: pageNum % 2 === 0 ? '动作' : '二次元', cover: `https://picsum.photos/200/200?random=${pageNum}${index}new` 
    }
  })
}

const fetchData = async (isRefresh = false) => {
  if (loadingStatus.value === 'loading' || (!isRefresh && loadingStatus.value === 'nomore')) return
  loadingStatus.value = 'loading'
  
  setTimeout(() => {
    const newData = generateMockData(page.value)
    if (isRefresh) { latestGames.value = newData; uni.stopPullDownRefresh() } 
    else { latestGames.value = [...latestGames.value, ...newData] }
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