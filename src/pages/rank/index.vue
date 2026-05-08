<template>
  <view class="min-h-screen bg-[#FFFFFF] pb-10">
    <view class="sticky top-0 z-30 pt-12 pb-4 px-5 bg-white/90 backdrop-blur-md border-b border-gray-50 flex items-center">
      <view class="i-lucide-arrow-left text-gray-900 text-xl" @click="goBack"></view>
      <text class="ml-4 text-lg font-bold text-gray-900">人气排行</text>
    </view>

    <view class="px-5 mt-4">
      <view v-if="isFirstLoading">
        <view v-for="i in 8" :key="i" class="flex items-center py-4 border-b border-gray-50 animate-pulse px-2">
          <view class="w-4 h-6 bg-gray-100 rounded mr-6"></view>
          <view class="w-14 h-14 rounded-xl bg-gray-100 shrink-0"></view>
          <view class="ml-4 flex-1 flex flex-col justify-center">
            <view class="h-4 bg-gray-100 rounded w-1/2 mb-2"></view>
            <view class="h-2.5 bg-gray-50 rounded w-1/3"></view>
          </view>
          <view class="w-4 h-4 bg-gray-50 rounded"></view>
        </view>
      </view>

      <view v-else>
        <view 
          v-for="(item, index) in rankList" :key="item.id" 
          class="flex items-center py-4 border-b border-gray-50 last:border-0 active:bg-gray-50 px-2 rounded-xl transition-all animate-fade-in"
          @click="goToDetail(item.id)"
        >
          <text :class="['text-lg font-black italic mr-4 w-6', index < 3 ? 'text-indigo-600' : 'text-gray-300']">{{ index + 1 }}</text>
          <image :src="item.cover" class="w-14 h-14 rounded-xl border border-gray-100 bg-gray-50" mode="aspectFill"></image>
          <view class="ml-4 flex-1">
            <text class="text-[15px] font-bold text-gray-900 block">{{ item.title }}</text>
            <view class="flex items-center mt-1">
              <view class="i-lucide-star text-orange-400 text-[10px] mr-1"></view>
              <text class="text-[11px] text-gray-400">{{ item.rating }}分 · {{ item.downloads }}次下载</text>
            </view>
          </view>
          <view class="i-lucide-chevron-right text-gray-200"></view>
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

const rankList = ref<any[]>([])
const page = ref(1)
const loadingStatus = ref<'loadmore' | 'loading' | 'nomore'>('loadmore')
const isFirstLoading = ref(true)

const generateMockData = (pageNum: number) => {
  return Array.from({ length: 10 }).map((_, index) => {
    const id = `rank-${pageNum}-${index}`
    return { 
      id, title: `热门游戏榜 ${pageNum}-${index}`, rating: (5.0 - (pageNum * 0.1 + index * 0.05)).toFixed(1), 
      downloads: `${Math.floor(200 - pageNum * 20 - index)}w+`, cover: `https://picsum.photos/200/200?random=${pageNum}${index}rank` 
    }
  })
}

const fetchData = async (isRefresh = false) => {
  if (loadingStatus.value === 'loading' || (!isRefresh && loadingStatus.value === 'nomore')) return
  loadingStatus.value = 'loading'
  
  setTimeout(() => {
    const newData = generateMockData(page.value)
    if (isRefresh) { rankList.value = newData; uni.stopPullDownRefresh() } 
    else { rankList.value = [...rankList.value, ...newData] }
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