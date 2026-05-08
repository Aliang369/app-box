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
        <wd-swiper :list="bannerList" autoplay indicator indicator-active-color="#4F46E5" :interval="4000"></wd-swiper>
      </view>
    </view>

   <view class="mt-6 px-5">
      <view class="flex justify-between items-center bg-white rounded-2xl p-2 border border-gray-100 shadow-sm">
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

      <view class="flex flex-col gap-3">
        <view 
          v-for="(game, index) in gameList" 
          :key="game.id" 
          class="bg-white border border-gray-100 rounded-2xl p-3 flex shadow-sm active:bg-gray-50 transition-all duration-300 animate-fade-in"
          :style="{ animationDelay: `${index * 50}ms` }"
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
              <text class="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                {{ game.desc }}
              </text>
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

    <CustomTabBar :current="0" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import CustomTabBar from '@/components/CustomTabBar.vue'

const bannerList = ref([
  'https://picsum.photos/800/400?random=1',
  'https://picsum.photos/800/400?random=2',
  'https://picsum.photos/800/400?random=3'
])

// 金刚区导航数据，配置目标路径
const navList = ref([
  { name: '最新', url: '/pages/latest/index', icon: 'i-lucide-sparkles' },
  { name: '排行', url: '/pages/rank/index', icon: 'i-lucide-bar-chart-2' },
  { name: '福利', url: '/pages/gift/index', icon: 'i-lucide-gift' },
  { name: '分类', url: '/pages/category/index', icon: 'i-lucide-layout-grid' },
])

const isRefreshing = ref(false)
const gameList = ref<any[]>([])

onLoad(() => {
  fetchGameListData()
})

const fetchGameListData = () => {
  isRefreshing.value = true
  setTimeout(() => {
    gameList.value = [
      { id: '1', title: '元气小骑士', desc: '像素地牢大冒险！最纯粹的动作RPG体验。', tag: '动作', rating: '4.9', downloads: '12w+', cover: 'https://picsum.photos/200/200?random=11' },
      { id: '2', title: '星穹幻轨', desc: '银河冒险策略RPG，穿越星海的奇幻之旅。', tag: '策略', rating: '4.8', downloads: '85w+', cover: 'https://picsum.photos/200/200?random=12' },
      { id: '3', title: '蔚蓝档案', desc: '青春战术剧情RPG，寻找属于你们的奇迹。', tag: '二次元', rating: '4.6', downloads: '43w+', cover: 'https://picsum.photos/200/200?random=13' },
      { id: '4', title: '荒野之息', desc: '开放世界探索，攀爬、滑翔、解谜。', tag: '开放世界', rating: '5.0', downloads: '200w+', cover: 'https://picsum.photos/200/200?random=14' },
      { id: '5', title: '极速飙车', desc: '真实的物理引擎，体验极致的漂移快感。', tag: '竞速', rating: '4.5', downloads: '30w+', cover: 'https://picsum.photos/200/200?random=15' },
    ]
    isRefreshing.value = false
  }, 600)
}

// 金刚区点击：执行页面跳转
const handleNavClick = (nav: any) => {
  uni.vibrateShort({})
  if (nav.url) {
    uni.navigateTo({ url: nav.url })
  }
}

// 换一批逻辑：仅打乱下方列表数据
const refreshData = () => {
  if (isRefreshing.value) return
  uni.vibrateShort({})
  isRefreshing.value = true
  setTimeout(() => {
    gameList.value = gameList.value.sort(() => Math.random() - 0.5)
    isRefreshing.value = false
  }, 500)
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
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>