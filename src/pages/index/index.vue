<template>
  <view class="bg-gray-100 min-h-screen pb-6">
    
    <!-- 1. 搜索框 (添加了点击事件，后续可跳转到专门的搜索页) -->
    <view class="p-4 bg-white sticky top-0 z-10 shadow-sm" @click="goToSearch">
      <view class="bg-gray-100 rounded-full flex items-center px-4 py-2 pointer-events-none">
        <view class="i-carbon-search text-gray-400 mr-2 text-lg"></view>
        <text class="text-sm text-gray-400">搜索你想玩的游戏或应用...</text>
      </view>
    </view>

    <!-- 2. 横幅 (Banner) -->
    <view class="px-4 mt-3">
      <swiper 
        class="h-36 rounded-xl overflow-hidden transform-view" 
        circular :indicator-dots="true" autoplay :interval="3000" indicator-active-color="#3b82f6"
      >
        <swiper-item v-for="(item, index) in bannerList" :key="index">
          <image :src="item.image" class="w-full h-full object-cover" mode="aspectFill"></image>
        </swiper-item>
      </swiper>
    </view>

    <!-- 3. 快捷导航栏 -->
    <view class="bg-white mx-4 mt-4 rounded-xl p-4 grid grid-cols-4 gap-2 shadow-sm">
      <view 
        v-for="(nav, index) in navList" 
        :key="index" 
        class="flex flex-col items-center justify-center active:opacity-70 transition-opacity"
        @click="handleNavClick(nav)"
      >
        <view class="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-1 text-2xl">
          {{ nav.icon }}
        </view>
        <text class="text-xs text-gray-600">{{ nav.name }}</text>
      </view>
    </view>

    <!-- 4. 游戏卡片列表 -->
    <view class="px-4 mt-5">
      <view class="text-lg font-bold mb-3 text-gray-800 flex items-center justify-between">
        <text>热门推荐</text>
        <text class="text-sm text-gray-400 font-normal active:text-gray-600">查看更多 ></text>
      </view>
      
      <!-- 加载中状态展示 -->
      <view v-if="isLoading" class="flex justify-center items-center py-10">
        <text class="text-gray-400 text-sm">正在加载精彩内容...</text>
      </view>

      <!-- 游戏列表渲染 -->
      <view v-else class="flex flex-col gap-3">
        <view 
          v-for="(game, index) in gameList" 
          :key="index" 
          class="bg-white p-3 rounded-xl flex items-center shadow-sm active:bg-gray-50 transition-colors"
          @click="goToGameDetail(game)"
        >
          <image :src="game.cover" class="w-16 h-16 rounded-xl bg-gray-200 mr-3 shrink-0" mode="aspectFill"></image>
          
          <view class="flex-1 min-w-0">
            <view class="text-base font-bold text-gray-800 truncate">{{ game.title }}</view>
            <view class="text-xs text-gray-500 mt-1 truncate">{{ game.desc }}</view>
            <view class="text-xs text-blue-500 bg-blue-50 inline-block px-2 py-0.5 rounded mt-1">
              {{ game.tag }}
            </view>
          </view>
          
          <!-- 阻止事件冒泡 .stop，避免点击按钮时触发卡片的跳转事件 -->
          <button 
            @click.stop="downloadGame(game)"
            class="m-0 ml-2 px-5 py-1.5 bg-blue-500 text-white text-sm rounded-full border-none shadow-sm active:bg-blue-600 flex items-center justify-center"
          >
            打开
          </button>
        </view>
      </view>
    </view>

  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

// --- 状态定义 ---
const isLoading = ref(true) // 控制加载状态的变量
const bannerList = ref([
  { image: 'https://picsum.photos/600/300?random=1' },
  { image: 'https://picsum.photos/600/300?random=2' },
])
const navList = ref([
  { name: '新游', icon: '🎮' },
  { name: '排行', icon: '🏆' },
  { name: '分类', icon: '📦' },
  { name: '福利', icon: '🎁' },
])
const gameList = ref<any[]>([]) // 初始化为空数组

// --- 生命周期 ---
onLoad(() => {
  // 页面加载时触发获取数据
  fetchGameListData()
})

// --- 方法定义 ---

// 1. 模拟 API 请求的方法
const fetchGameListData = () => {
  isLoading.value = true // 请求开始，开启加载状态
  
  // 使用 setTimeout 模拟网络延迟 (800毫秒)
  setTimeout(() => {
    // 这里未来会替换为真实的 API 请求，例如： const res = await uni.request({ url: '...' })
    gameList.value = [
      { id: 1, title: '元气小骑士', desc: '像素风地牢探索动作游戏', tag: '动作冒险', cover: 'https://picsum.photos/100/100?random=11' },
      { id: 2, title: '开心消除大作战', desc: '轻松休闲的消除闯关小游戏', tag: '休闲益智', cover: 'https://picsum.photos/100/100?random=12' },
      { id: 3, title: '极速狂飙 3D', desc: '模拟真实赛车的物理竞速体验', tag: '赛车竞速', cover: 'https://picsum.photos/100/100?random=13' },
      { id: 4, title: '小小建造师', desc: '自由沙盒模拟经营', tag: '模拟经营', cover: 'https://picsum.photos/100/100?random=14' },
    ]
    isLoading.value = false // 数据赋值完毕，关闭加载状态
  }, 800)
}

// 2. 交互事件处理
const goToSearch = () => {
  console.log('点击了搜索框，准备跳转到搜索页...')
  // uni.navigateTo({ url: '/pages/search/index' })
}

const handleNavClick = (nav: any) => {
  console.log('点击了导航:', nav.name)
}

const goToGameDetail = (game: any) => {
  console.log('点击了游戏卡片，跳转到详情页，游戏ID:', game.id)
  // uni.navigateTo({ url: `/pages/detail/index?id=${game.id}` })
}

const downloadGame = (game: any) => {
  console.log('开始下载/打开游戏:', game.title)
  // 触发下载逻辑...
}
</script>

<style>
button::after {
  border: none;
}
</style>