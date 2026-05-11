<template>
  <view class="min-h-screen bg-[#FFFFFF] pb-10">
    <view class="sticky top-0 z-30 pt-12 pb-4 px-5 bg-white/90 backdrop-blur-md border-b border-gray-50 flex items-center">
      <view class="i-lucide-arrow-left text-gray-900 text-xl" @click="goBack"></view>
      <text class="ml-4 text-lg font-bold text-gray-900">{{ categoryName }}</text>
    </view>
    
    <view class="px-5 mt-6">
      <view v-if="isFirstLoading">
        <view v-for="i in 5" :key="i" class="flex gap-4 mb-8 relative animate-pulse">
          <view class="w-10 h-10 rounded-full bg-gray-100 z-10 shrink-0"></view>
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
        <view v-for="item in gameList" :key="item.id" class="flex gap-4 mb-8 relative animate-fade-in">
          <view class="flex flex-col items-center shrink-0">
            <view class="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center z-10">
              <view class="i-lucide-gamepad-2 text-indigo-500 text-lg"></view>
            </view>
          </view>
          <view class="flex-1 bg-gray-50/50 rounded-2xl p-4 border border-gray-100 active:bg-gray-100 transition-all" @click="goToDetail(item.id)">
            <view class="flex gap-3">
              <image :src="item.cover" class="w-16 h-16 rounded-xl border border-gray-100 bg-white" mode="aspectFill"></image>
              <view class="flex-1 flex flex-col justify-center">
                <text class="text-[15px] font-bold text-gray-900">{{ item.title }}</text>
                <view class="flex items-center gap-2 mt-1">
                  <text class="text-[11px] font-semibold text-amber-500 leading-none">★ {{ item.rating }}</text>
                  <text class="text-[10px] text-indigo-500 border border-indigo-100 px-1.5 py-0.5 rounded-sm">#{{ item.tag }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view v-if="!isFirstLoading" class="py-6 flex items-center justify-center gap-2">
      <view v-if="loadingStatus === 'loading'" class="i-lucide-loader-2 text-gray-400 animate-spin text-sm"></view>
      <text class="text-[11px] text-gray-400 font-medium tracking-widest">
        {{ loadingStatus === 'loading' ? '加载中...' : (loadingStatus === 'nomore' ? '— 到底啦 —' : '上拉加载') }}
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'

const categoryName = ref('分类结果')
const goBack = () => uni.navigateBack()
const goToDetail = (id: string) => uni.navigateTo({ url: `/pages/detail/index?id=${id}` })

const gameList = ref<any[]>([])
const page = ref(1)
const loadingStatus = ref<'loadmore' | 'loading' | 'nomore'>('loadmore')
const isFirstLoading = ref(true)

onLoad((options: any) => {
  if (options.name) categoryName.value = options.name
  fetchData(true)
})

const fetchData = async (isRefresh = false) => {
  if (loadingStatus.value === 'loading' || (!isRefresh && loadingStatus.value === 'nomore')) return
  loadingStatus.value = 'loading'
  setTimeout(() => {
    const newData = Array.from({ length: 6 }).map((_, i) => ({
      id: `cat-${page.value}-${i}`,
      title: `${categoryName.value}游戏 ${page.value}-${i}`,
      tag: categoryName.value,
      rating: (Math.random() * 5).toFixed(1),
      cover: `https://picsum.photos/200/200?random=${page.value}${i}cat`
    }))
    if (isRefresh) { gameList.value = newData; uni.stopPullDownRefresh() }
    else { gameList.value = [...gameList.value, ...newData] }
    isFirstLoading.value = false
    loadingStatus.value = page.value >= 3 ? 'nomore' : 'loadmore'
  }, 800)
}

onPullDownRefresh(() => { page.value = 1; isFirstLoading.value = true; fetchData(true) })
onReachBottom(() => { if (loadingStatus.value !== 'nomore') { page.value++; fetchData(false) } })
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
</style>
