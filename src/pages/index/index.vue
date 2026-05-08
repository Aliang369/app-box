<template>
  <view class="min-h-screen pb-32 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
    
    <view class="sticky top-0 z-30 pt-3 pb-2 px-5 bg-transparent relative" @click="goToSearch">
      <view class="absolute inset-0 z-10 bg-white/10 backdrop-blur-2xl border-b border-white/20"></view>
      
      <view class="absolute inset-0 z-40"></view>

      <view class="relative z-20 h-10 bg-white/20 backdrop-blur-md border border-white/40 rounded-full flex items-center px-4 shadow-[0_4px_16px_rgba(31,38,135,0.05)] transition-all active:scale-[0.98]">
        <text class="text-indigo-900/40 text-lg mr-2">🔍</text>
        <text class="text-indigo-900/30 text-sm font-medium tracking-tight">探索未知的羁绊...</text>
        <view class="flex-1"></view>
        <view class="w-6 h-6 border border-indigo-900/10 rounded-full flex items-center justify-center">
          <text class="text-indigo-900/20 text-[10px]">📷</text>
        </view>
      </view>
    </view>

    <view class="px-4 mt-3 relative z-10">
      <view class="rounded-3xl overflow-hidden border-2 border-white/60 shadow-[0_8px_20px_rgba(236,72,153,0.15)] bg-white/50">
        <wd-swiper
          :list="bannerList"
          autoplay
          indicator
          indicator-active-color="#ec4899"
          :interval="3000"
        ></wd-swiper>
      </view>
    </view>

   <view class="mt-4 pl-4">
      <scroll-view scroll-x class="whitespace-nowrap w-full" :show-scrollbar="false">
        
        <view 
          v-for="(nav, index) in navList" 
          :key="index" 
          class="inline-flex items-center bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_4px_10px_rgba(0,0,0,0.03)] rounded-xl py-1.5 px-2.5 mr-2 active:scale-95 transition-all duration-200 align-top"
          @click="handleNavClick(nav)"
        >
          <view class="flex flex-col mr-2 whitespace-normal">
            <text class="text-[13px] font-black text-indigo-900 tracking-tight leading-tight">{{ nav.name }}</text>
            <text class="text-[8px] text-pink-400 font-bold opacity-80 uppercase leading-tight">{{ nav.desc }}</text>
          </view>

          <image 
            :src="nav.icon" 
            class="w-7 h-7 shrink-0" 
            mode="aspectFit"
          ></image>

        </view>
        
        <view class="inline-block w-4"></view>

      </scroll-view>
    </view>

    <view class="px-4 mt-6 pb-20">
      <view class="flex items-center mb-4 px-1">
        <view class="w-1.5 h-4 bg-gradient-to-t from-pink-500 to-purple-500 rounded-full mr-2"></view>
        <text class="text-base font-black text-indigo-900 tracking-wider">热门推荐</text>
      </view>

      <view class="flex flex-col gap-3">
        <view 
          v-for="(game, index) in gameList" 
          :key="index" 
          class="bg-white/50 backdrop-blur-md border border-white/80 rounded-3xl p-3 flex shadow-[0_4px_12px_rgba(0,0,0,0.02)] active:scale-[0.98] transition-all duration-300"
          @click="goToGameDetail(game)"
        >
          <view class="w-24 h-24 shrink-0 overflow-hidden rounded-2xl border border-white shadow-sm">
            <image :src="game.cover" class="w-full h-full object-cover" mode="aspectFill"></image>
          </view>

          <view class="flex-1 ml-4 flex flex-col justify-between py-0.5">
            <view>
              <view class="flex items-center gap-2 mb-1">
                <text class="text-base font-black text-indigo-950 truncate max-w-[300rpx]">{{ game.title }}</text>
                <text class="text-[10px] text-pink-500 bg-pink-50 px-1.5 py-0.5 rounded border border-pink-100/50">#{{ game.tag }}</text>
              </view>
              
              <text class="text-[11px] text-indigo-400/80 line-clamp-2 leading-relaxed">
                {{ game.desc }}
              </text>
            </view>

            <view class="flex items-center gap-4 mt-2">
              <view class="flex items-center">
                <text class="text-[10px] text-indigo-300 mr-1">游玩</text>
                <text class="text-[11px] font-bold text-indigo-500">{{ game.downloads }}</text>
              </view>
              
              <view class="w-[1px] h-2 bg-indigo-100"></view>

              <view class="flex items-center">
                <text class="i-carbon-star-filled text-[10px] text-orange-400 mr-1"></text>
                <text class="text-[11px] font-bold text-orange-500">{{ game.rating }}分</text>
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
  'https://picsum.photos/800/400?random=3' // 我顺便帮你多加了一张图，轮播效果更好看
])
// 2. 导航栏数据 (使用雪碧图定位百分比)
// 因为图片上有 4 个图标，分别位于 0%, 33.33%, 66.66%, 100% 的位置
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
  // 模拟从服务器获取更详细的数据
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
// 确保你的脚本中是这样定义的
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
