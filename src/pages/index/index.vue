<template>
  <view class="min-h-screen pb-32 bg-[#F9FAFB]">
    
    <view class="sticky top-0 z-30 pt-3 pb-2 px-5 bg-white/80 backdrop-blur-xl border-b border-gray-100 relative" @click="goToSearch">
      <view class="absolute inset-0 z-40"></view>
      <view class="h-10 bg-gray-50 border border-gray-100 rounded-full flex items-center px-4 transition-all active:scale-[0.98]">
        <view class="i-lucide-search text-gray-400 text-lg mr-2"></view>
        <text class="text-gray-400 text-[13px] tracking-wide">搜索感兴趣的内容...</text>
      </view>
    </view>

    <view class="px-5 mt-4">
      <view class="rounded-2xl overflow-hidden border border-gray-100 bg-white">
        <view v-if="isFirstLoading" class="w-full bg-gray-100 animate-pulse" style="height: 465rpx;"></view>
        <wd-swiper 
          v-else
          :list="bannerList" 
          autoplay 
          :interval="4000"
          image-mode="aspectFill"
          indicator-active-color="#4F46E5"
          height="465rpx" 
        ></wd-swiper>
      </view>
    </view>

    <view class="mt-4 px-5">
      <view v-if="isFirstLoading" class="flex justify-between items-center bg-white rounded-2xl p-2 border border-gray-100 shadow-sm">
        <view v-for="i in 4" :key="i" class="flex flex-col items-center justify-center w-[22%] py-2">
          <view class="w-7 h-7 rounded-full bg-gray-100 animate-pulse mb-2"></view>
          <view class="w-8 h-2.5 rounded bg-gray-50 animate-pulse"></view>
        </view>
      </view>

      <view v-else class="flex justify-between items-center bg-white rounded-2xl p-2 border border-gray-100 shadow-sm">
        <view 
          v-for="(nav, index) in navList" 
          :key="index" 
          class="flex flex-col items-center justify-center w-[22%] py-2 rounded-xl active:bg-gray-50 transition-colors" 
          @click="handleNavClick(nav)" 
        >
          <view :class="['text-[22px] mb-1.5 text-indigo-500', nav.icon]"></view>
          <text class="text-[12px] font-medium text-gray-600 tracking-tight">{{ nav.name }}</text>
        </view>
      </view>
    </view>

    <view class="px-5 mt-8 pb-10">
      <view class="flex items-center justify-between mb-4 px-1">
        <text class="text-base font-bold text-gray-900 tracking-wide">热门推荐</text>
        <view class="flex items-center gap-1 px-2 py-1 bg-white border border-gray-100 rounded-full active:bg-gray-50 transition-colors" @click="refreshData">
          <view :class="['i-lucide-refresh-cw text-gray-400 text-[12px]', isRefreshing ? 'animate-spin' : '']"></view>
          <text class="text-[11px] text-gray-500 font-medium">换一批</text>
        </view>
      </view>

      <view v-if="isFirstLoading" class="flex flex-col gap-3">
        <view v-for="i in 5" :key="i" class="bg-white border border-gray-100 rounded-2xl p-3 flex animate-pulse">
          <view class="w-20 h-20 shrink-0 rounded-xl bg-gray-100"></view>
          <view class="flex-1 ml-4 py-1 flex flex-col justify-between">
            <view>
              <view class="h-4 bg-gray-100 rounded-md w-3/4 mb-2.5"></view>
              <view class="h-2.5 bg-gray-50 rounded-md w-full mb-1.5"></view>
              <view class="h-2.5 bg-gray-50 rounded-md w-2/3"></view>
            </view>
            <view class="flex gap-4 mt-2">
              <view class="h-2.5 bg-gray-50 rounded w-12"></view>
              <view class="h-2.5 bg-gray-50 rounded w-12"></view>
            </view>
          </view>
        </view>
      </view>

      <view v-else class="flex flex-col gap-3">
        <view 
          v-for="(game, index) in gameList" 
          :key="game.id" 
          class="bg-white border border-gray-100 rounded-2xl p-3 flex shadow-sm active:bg-gray-50 transition-all duration-300 animate-fade-in"
          @click="goToGameDetail(game)"
        >
          <view class="w-20 h-20 shrink-0 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
            <image :src="game.cover" class="w-full h-full object-cover" mode="aspectFill"></image>
          </view>
          <view class="flex-1 ml-4 flex flex-col justify-between py-1">
            <view>
              <view class="flex items-center justify-between mb-1">
                <text class="text-[15px] font-bold text-gray-900 truncate max-w-[300rpx]">{{ game.title }}</text>
                <text class="text-[10px] text-indigo-500 border border-indigo-100 px-1.5 py-0.5 rounded-sm">#{{ game.tag }}</text>
              </view>
              <text class="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">{{ game.desc }}</text>
            </view>
            <view class="flex items-center gap-4 mt-1">
              <view class="flex items-center">
                <text class="text-[10px] text-gray-400 mr-1">下载</text>
                <text class="text-[11px] font-medium text-gray-700">{{ game.downloads }}</text>
              </view>
              <view class="flex items-center">
                <text class="text-[10px] text-gray-400 mr-1">评分</text>
                <text class="text-[11px] font-medium text-gray-700">{{ game.rating }}</text>
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

    <CustomTabBar :current="0" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import CustomTabBar from '@/components/CustomTabBar.vue'
import { getGameList } from '@/api/game'

const bannerList = ref([
  '/static/banner-1.jpg',
  '/static/banner-2.jpg',
  '/static/banner-3.jpg'
])

const navList = ref([
  { name: '最新', url: '/pages/latest/index', icon: 'i-lucide-sparkles' },
  { name: '排行', url: '/pages/rank/index', icon: 'i-lucide-bar-chart-2' },
  { name: '福利', url: '/pages/gift/index', icon: 'i-lucide-gift' },
  { name: '分类', url: '/pages/category/index', icon: 'i-lucide-layout-grid' },
])

const gameList = ref<any[]>([])
const page = ref(1)
const loadingStatus = ref<'loadmore' | 'loading' | 'nomore'>('loadmore')
const isRefreshing = ref(false)
const isFirstLoading = ref(true) // 控制骨架屏显示

const fetchGameListData = async (isRefresh = false) => {
  if (loadingStatus.value === 'loading' || (!isRefresh && loadingStatus.value === 'nomore')) return
  
  loadingStatus.value = 'loading'
  
  try {
    const newData = await getGameList({ page: page.value, limit: 5 })
    
    if (isRefresh) {
      gameList.value = newData
      uni.stopPullDownRefresh()
      isRefreshing.value = false
    } else {
      gameList.value = [...gameList.value, ...newData]
    }
    
    isFirstLoading.value = false
    
    loadingStatus.value = page.value >= 3 ? 'nomore' : 'loadmore'
  } catch (error) {
    console.error('请求失败:', error)
    isFirstLoading.value = false
    loadingStatus.value = 'loadmore'
  }
}

onLoad(() => {
  fetchGameListData(true)
})

onPullDownRefresh(() => {
  page.value = 1
  fetchGameListData(true)
})

onReachBottom(() => {
  if (loadingStatus.value === 'nomore') return
  page.value++
  fetchGameListData(false)
})

const handleNavClick = (nav: any) => {
  uni.vibrateShort({})
  if (nav.url) {
    uni.navigateTo({ url: nav.url })
  }
}

const refreshData = () => {
  if (isRefreshing.value || loadingStatus.value === 'loading') return
  uni.vibrateShort({})
  isRefreshing.value = true
  isFirstLoading.value = true // 换一批时再次显示骨架屏
  page.value = 1
  gameList.value = [] // 清空旧数据
  fetchGameListData(true)
}

const goToSearch = () => uni.navigateTo({ url: '/pages/search/index' })
const goToGameDetail = (game: any) => {
  uni.navigateTo({ url: `/pages/detail/index?id=${game.id}` })
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>