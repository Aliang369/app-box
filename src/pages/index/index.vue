<template>
  <view class="min-h-screen pb-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
    
    <view class="sticky top-0 z-20 bg-white/60 backdrop-blur-xl shadow-sm border-b border-white/50 pt-2 pb-2 px-2 relative" @click="goToSearch">
      
      <view class="absolute inset-0 z-30"></view>

      <wd-search 
        placeholder="寻找羁绊与冒险..." 
        placeholder-left
        disabled
        hide-cancel 
        bg-color="rgba(255, 255, 255, 0.5)"
        class="custom-search"
      ></wd-search>
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

    <view class="mx-4 mt-5 rounded-3xl p-4 grid grid-cols-4 gap-2 bg-white/40 backdrop-blur-lg border border-white/60 shadow-[0_8px_16px_rgba(0,0,0,0.03)]">
      <view
        v-for="(nav, index) in navList"
        :key="index"
        class="flex flex-col items-center justify-center active:scale-95 transition-transform"
        @click="handleNavClick(nav)"
      >
        <view class="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-100 to-blue-100 flex items-center justify-center mb-1 text-2xl shadow-sm border border-white">
          {{ nav.icon }}
        </view>
        <text class="text-xs text-gray-600 font-medium">{{ nav.name }}</text>
      </view>
    </view>

    <view class="px-4 mt-6">
      <view class="text-lg font-black mb-3 text-indigo-900 flex items-center justify-between tracking-wide">
        <text class="flex items-center gap-2">
          <text class="w-1 h-4 bg-pink-400 rounded-full"></text>
          少女推荐
        </text>
        <text class="text-xs text-indigo-400 bg-indigo-50 px-2 py-1 rounded-full active:bg-indigo-100 transition-colors">查看全部 ></text>
      </view>
      
      <view v-if="isLoading" class="flex justify-center items-center py-10">
        <text class="text-pink-400 text-sm">魔法载入中...</text>
      </view>

      <view v-else class="flex flex-col gap-4">
        <view
          v-for="(game, index) in gameList"
          :key="index"
          class="p-3 rounded-3xl flex items-center bg-white/50 backdrop-blur-md border border-white/80 shadow-[0_4px_12px_rgba(0,0,0,0.04)] active:scale-[0.98] transition-transform"
          @click="goToGameDetail(game)"
        >
          <image :src="game.cover" class="w-16 h-16 rounded-2xl shadow-sm mr-3 shrink-0 border border-white" mode="aspectFill"></image>
          
          <view class="flex-1 min-w-0">
            <view class="text-base font-bold text-indigo-900 truncate">{{ game.title }}</view>
            <view class="text-xs text-indigo-500/80 mt-1 truncate">{{ game.desc }}</view>
            <view class="text-[10px] text-pink-500 bg-pink-100/80 inline-block px-2 py-0.5 rounded-full mt-1.5 border border-pink-200/50">
              {{ game.tag }}
            </view>
          </view>
          
          <button
            @click.stop="downloadGame(game)"
            class="m-0 ml-2 px-5 py-1.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-sm font-bold rounded-full border-none shadow-[0_4px_10px_rgba(56,189,248,0.4)] active:opacity-80 flex items-center justify-center"
          >
            启动
          </button>
        </view>
      </view>
    </view>

  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const isLoading = ref(true)
const bannerList = ref([
  'https://picsum.photos/800/400?random=1',
  'https://picsum.photos/800/400?random=2',
  'https://picsum.photos/800/400?random=3' // 我顺便帮你多加了一张图，轮播效果更好看
])
const navList = ref([
  { name: '新游', icon: '✨' },
  { name: '排行', icon: '👑' },
  { name: '分类', icon: '🧭' },
  { name: '福利', icon: '💌' },
])
const gameList = ref<any[]>([])

onLoad(() => {
  fetchGameListData()
})

const fetchGameListData = () => {
  isLoading.value = true
  setTimeout(() => {
    gameList.value = [
      { id: 1, title: '元气小骑士', desc: '像素风地牢探索动作游戏', tag: '动作冒险', cover: 'https://picsum.photos/100/100?random=11' },
      { id: 2, title: '星穹幻轨', desc: '银河冒险策略RPG', tag: '回合策略', cover: 'https://picsum.photos/100/100?random=12' },
      { id: 3, title: '蔚蓝档案', desc: '青春战术剧情RPG', tag: '角色扮演', cover: 'https://picsum.photos/100/100?random=13' },
    ]
    isLoading.value = false
  }, 800)
}

const goToSearch = () => {
  uni.navigateTo({ url: '/pages/search/index' })
}
const handleNavClick = (nav: any) => console.log('点击了导航:', nav.name)
const goToGameDetail = (game: any) => uni.navigateTo({ url: `/pages/detail/index?id=${game.id}` })
const downloadGame = (game: any) => console.log('开始下载/打开游戏:', game.title)
</script>

<style>
button::after { border: none; }
::-webkit-scrollbar { display: none; }
</style>
