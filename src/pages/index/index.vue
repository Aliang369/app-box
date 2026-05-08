<template>
  <view class="min-h-screen pb-28 bg-white">
    
    <view class="sticky top-0 z-30 bg-white border-b border-gray-100">
      <view class="px-5 pt-4 pb-3" @click="goToSearch">
        <view class="h-9 bg-gray-50 border border-gray-200 rounded-lg flex items-center px-3 active:bg-gray-100 transition-colors">
          <view class="i-lucide-search text-gray-300 text-sm mr-2"></view>
          <text class="text-gray-300 text-sm">搜索游戏</text>
        </view>
      </view>
    </view>

    <view class="px-5 mt-4">
      <view class="rounded-xl overflow-hidden border border-gray-100">
        <wd-swiper
          :list="bannerList"
          autoplay
          indicator
          indicator-active-color="#111827"
          :interval="3000"
        ></wd-swiper>
      </view>
    </view>

    <view class="mt-5 px-5">
      <scroll-view scroll-x class="whitespace-nowrap w-full" :show-scrollbar="false">
        <view 
          v-for="(nav, index) in navList" 
          :key="index" 
          class="inline-flex items-center mr-4 py-2 px-3 border border-gray-100 rounded-lg active:bg-gray-50 transition-colors align-top"
          @click="handleNavClick(nav)"
        >
          <image 
            :src="nav.icon" 
            class="w-5 h-5 shrink-0 mr-2" 
            mode="aspectFit"
          ></image>
          <text class="text-sm text-gray-700 font-medium whitespace-normal">{{ nav.name }}</text>
        </view>
      </scroll-view>
    </view>

    <view class="px-5 mt-6">
      <view class="flex items-center justify-between mb-4">
        <text class="text-base font-bold text-gray-900">热门推荐</text>
        <text class="text-xs text-gray-400">查看全部</text>
      </view>

      <view class="flex flex-col">
        <view 
          v-for="(game, index) in gameList" 
          :key="index" 
          class="py-4 flex active:bg-gray-50 transition-colors"
          :class="index < gameList.length - 1 ? 'border-b border-gray-50' : ''"
          @click="goToGameDetail(game)"
        >
          <view class="w-20 h-20 shrink-0 overflow-hidden rounded-lg">
            <image :src="game.cover" class="w-full h-full object-cover" mode="aspectFill"></image>
          </view>

          <view class="flex-1 ml-3 flex flex-col justify-between">
            <view>
              <view class="flex items-center gap-2">
                <text class="text-sm font-bold text-gray-900 truncate max-w-[280rpx]">{{ game.title }}</text>
                <text class="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{{ game.tag }}</text>
              </view>
              <text class="text-xs text-gray-400 mt-1 line-clamp-1">{{ game.desc }}</text>
            </view>

            <view class="flex items-center gap-3 mt-2">
              <text class="text-[11px] text-gray-300">{{ game.downloads }}</text>
              <view class="flex items-center">
                <view class="i-lucide-star text-[10px] text-gray-300 mr-0.5"></view>
                <text class="text-[11px] text-gray-500 font-medium">{{ game.rating }}</text>
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

const isLoading = ref(true)
const bannerList = ref([
  'https://picsum.photos/800/400?random=1',
  'https://picsum.photos/800/400?random=2',
  'https://picsum.photos/800/400?random=3'
])
const navList = ref([
  { name: '最新游玩', desc: 'NEW GAME', icon: '/static/icon-1.png' },
  { name: '热门排行', desc: 'TOP RANK', icon: '/static/icon-2.png' },
  { name: '专属福利', desc: 'CATEGORY', icon: '/static/icon-3.png' },
  { name: '分类大全', desc: 'GIFT BOX', icon: '/static/icon-4.png' },
])
const gameList = ref<any[]>([])

onLoad(() => {
  fetchGameListData()
})

const fetchGameListData = () => {
  isLoading.value = true
  setTimeout(() => {
    gameList.value = [
      { 
        id: '1', 
        title: '元气小骑士', 
        desc: '疯狂打怪兽，像素地牢大冒险！最纯粹的动作RPG体验。', 
        tag: '像素', 
        rating: '4.9', 
        downloads: '12w+', 
        size: '156M',
        cover: 'https://picsum.photos/200/200?random=11' 
      },
      { 
        id: '2', 
        title: '星穹幻轨', 
        desc: '银河冒险策略RPG，穿越星海的奇幻之旅，揭开星核秘密。', 
        tag: '回合', 
        rating: '4.8', 
        downloads: '85w+', 
        size: '1.2G',
        cover: 'https://picsum.photos/200/200?random=12' 
      },
      { 
        id: '3', 
        title: '蔚蓝档案', 
        desc: '青春战术剧情RPG，在学园的故事中寻找属于你们的奇迹。', 
        tag: '养成', 
        rating: '4.7', 
        downloads: '43w+', 
        size: '890M',
        cover: 'https://picsum.photos/200/200?random=13' 
      },
    ]
    isLoading.value = false
  }, 800)
}

const goToSearch = () => {
  uni.navigateTo({ url: '/pages/search/index' })
}
const handleNavClick = (nav: any) => console.log('点击了导航:', nav.name)
const goToGameDetail = (game: any) => {
  uni.navigateTo({ 
    url: `/pages/detail/index?id=${game.id}` 
  })
}
const downloadGame = (game: any) => console.log('开始下载/打开游戏:', game.title)
</script>

<style>
button::after { border: none; }
::-webkit-scrollbar { display: none; }
</style>
