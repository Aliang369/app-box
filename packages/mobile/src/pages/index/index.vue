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

    <view class="mt-4 px-5" v-if="isFirstLoading || navList.length">
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
          <view class="text-[22px] mb-1.5 text-indigo-500 nav-icon" :style="getNavIconStyle(nav.icon)"></view>
          <text class="text-[12px] font-medium text-gray-600 tracking-tight">{{ nav.name }}</text>
        </view>
      </view>
    </view>

    <view class="px-5 mt-4 pb-10">
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
          <view class="flex-1 ml-4 min-w-0 h-20 flex flex-col">
            <view class="flex-1 min-h-0 flex items-center">
              <text class="text-[15px] font-bold text-gray-900 leading-tight break-all">{{ game.title }}</text>
            </view>
            <view class="flex-1 min-h-0 flex items-center gap-2">
              <text class="text-[11px] font-semibold text-amber-500 leading-none">★ {{ game.rating }}</text>
              <text class="text-[10px] text-indigo-500 border border-indigo-100 px-1.5 py-0.5 rounded-sm">#{{ game.tag }}</text>
            </view>
            <view class="flex-1 min-h-0 flex items-center">
              <view class="flex items-center">
                <text class="text-[10px] text-gray-400 mr-1">下载</text>
                <text class="text-[11px] font-medium text-gray-700">{{ game.downloads }}</text>
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
import { getGameList, getBannerList, getHomeNavList } from '@/api/game'

const bannerList = ref<string[]>([])
const navList = ref<any[]>([])

const gameList = ref<any[]>([])
const page = ref(1)
const loadingStatus = ref<'loadmore' | 'loading' | 'nomore'>('loadmore')
const isRefreshing = ref(false)
const isFirstLoading = ref(true)

const fetchGameListData = async (isRefresh = false) => {
  if (loadingStatus.value === 'loading' || (!isRefresh && loadingStatus.value === 'nomore')) return

  loadingStatus.value = 'loading'

  try {
    if (isRefresh) {
      const [banners, navs, newData] = await Promise.all([
        getBannerList(),
        getHomeNavList(),
        getGameList({ page: 1, limit: 5 })
      ])

      bannerList.value = banners.map((item: any) => item.image_url)
      navList.value = navs || []

      const data = newData.list || newData
      gameList.value = data
      uni.stopPullDownRefresh()
      isRefreshing.value = false
      loadingStatus.value = data.length < 5 ? 'nomore' : 'loadmore'
    } else {
      const newData = await getGameList({ page: page.value, limit: 5 })
      const data = newData.list || newData
      gameList.value = [...gameList.value, ...data]

      loadingStatus.value = data.length < 5 ? 'nomore' : 'loadmore'
    }

    isFirstLoading.value = false
  } catch (error) {
    console.error('请求失败:', error)
    isFirstLoading.value = false
    loadingStatus.value = 'loadmore'
    if (isRefresh) uni.stopPullDownRefresh()
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

const refreshData = () => {
  if (isRefreshing.value || loadingStatus.value === 'loading') return
  uni.vibrateShort({})
  isRefreshing.value = true
  isFirstLoading.value = true
  page.value = 1
  gameList.value = []
  fetchGameListData(true)
}

const goToSearch = () => uni.navigateTo({ url: '/pages/search/index' })
const getNavIconStyle = (icon: string) => {
  if (!icon) return {}
  const trimmed = icon.trim()
  if (!trimmed) return {}

  // 支持后端传 i-lucide-gamepad-2 / lucide:gamepad-2 / gamepad-2 三种格式
  const iconName = trimmed.startsWith('i-lucide-')
    ? `lucide:${trimmed.replace('i-lucide-', '')}`
    : trimmed.includes(':')
      ? trimmed
      : `lucide:${trimmed}`

  const encoded = encodeURIComponent(iconName)
  return {
    backgroundImage: `url("https://api.iconify.design/${encoded}.svg?color=%236366f1")`
  }
}

const handleNavClick = (nav: any) => {
  const rawLink = String(nav?.link_url ?? '').trim()
  if (!rawLink) return

  uni.vibrateShort({})

  // 兼容 http(s)://、//、www.xx.com、xx.com 等外链写法
  const isExternalLink =
    /^(https?:)?\/\//i.test(rawLink) || /^[a-z0-9-]+(\.[a-z0-9-]+)+([/:?#].*)?$/i.test(rawLink)

  if (isExternalLink) {
    const targetUrl = /^(https?:)?\/\//i.test(rawLink) ? rawLink : `https://${rawLink}`

    // #ifdef H5
    window.open(targetUrl, '_blank')
    return
    // #endif
    uni.showToast({ title: '当前端暂不支持外链直达', icon: 'none' })
    return
  }

  uni.navigateTo({
    url: rawLink,
    fail: () => {
      uni.showToast({ title: '该跳转页面未配置或不存在', icon: 'none' })
    }
  })
}
const goToGameDetail = (game: any) => {
  uni.navigateTo({ url: `/pages/detail/index?id=${game.id}` })
}
</script>

<style scoped>
.nav-icon {
  width: 22px;
  height: 22px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
