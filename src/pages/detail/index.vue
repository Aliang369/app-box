<template>
  <view class="min-h-screen bg-[#F9FAFB] pb-24">
    <view class="w-full relative bg-gray-100" style="height: 521rpx;">
      <image :src="gameDetail.cover" class="w-full h-full" mode="aspectFill"></image>
      <view class="absolute inset-0 bg-gradient-to-t from-[#F9FAFB] via-transparent to-black/10"></view>
      <view class="absolute top-12 left-4 w-8 h-8 bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center" @click="goBack">
        <view class="i-lucide-arrow-left text-white text-lg"></view>
      </view>
    </view>

    <view class="relative z-10 px-5 -mt-16">
      <view class="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
        <view class="flex justify-between items-start">
          <view class="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white shadow-sm bg-white -mt-10">
            <image :src="gameDetail.cover" class="w-full h-full object-cover"></image>
          </view>
          <view class="bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full flex items-center">
            <text class="i-lucide-star text-indigo-500 text-[12px] mr-1"></text>
            <text class="text-[12px] font-bold text-indigo-600">{{ gameDetail.rating }}</text>
          </view>
        </view>
        
        <text class="text-xl font-bold text-gray-900 mt-3 block">{{ gameDetail.title }}</text>
        <text class="text-xs text-gray-400 mt-1 block">#{{ gameDetail.tag }} · {{ gameDetail.downloads }} 次下载 · {{ gameDetail.size }}</text>
        
        <view class="mt-4 pt-4 border-t border-gray-50">
          <text class="text-sm font-bold text-gray-900 mb-2 block">游戏简介</text>
          <text class="text-[13px] text-gray-500 leading-relaxed">{{ gameDetail.fullDesc }}</text>
        </view>
      </view>
    </view>

    <view class="mt-6 px-5" v-if="gameDetail.screenshots && gameDetail.screenshots.length">
      <text class="text-sm font-bold text-gray-900 mb-3 block">游戏截图</text>
      <scroll-view scroll-x class="whitespace-nowrap" :show-scrollbar="false">
        <image 
          v-for="(img, idx) in gameDetail.screenshots" :key="idx"
          :src="img" 
          class="inline-block w-48 h-28 rounded-xl mr-3 border border-gray-100" 
          mode="aspectFill"
          @click="previewImage(idx)"
        ></image>
      </scroll-view>
    </view>

    <view class="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-lg border-t border-gray-100 flex items-center justify-between z-50">
      <view class="flex flex-col">
        <text class="text-sm font-bold text-gray-900">免费下载</text>
        <text class="text-[10px] text-gray-400">无内购 · 无广告</text>
      </view>
      <button 
        :class="[
          'h-10 px-8 rounded-full text-sm font-bold transition-all flex items-center justify-center m-0',
          downloadStatus === 'idle' ? 'bg-indigo-600 text-white active:bg-indigo-700' : 
          downloadStatus === 'downloading' ? 'bg-indigo-100 text-indigo-500' : 'bg-gray-100 text-gray-900'
        ]"
        @click="handleDownload"
      >
        {{ downloadText }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const gameDetail = ref<any>({})
const downloadStatus = ref<'idle' | 'downloading' | 'done'>('idle')
const progress = ref(0)
const downloadText = ref('立即获取')

onLoad((options: any) => {
  // 实际开发中根据 options.id 去请求数据，这里做本地 mock
  const id = options.id || '1'
  gameDetail.value = {
    id,
    title: '示例游戏名称',
    tag: '动作冒险',
    rating: '4.8',
    downloads: '10w+',
    size: '1.2GB',
    cover: `https://picsum.photos/400/400?random=${id}`,
    fullDesc: '这是一款极其出色的动作角色扮演游戏。在这里你将探索未知的地下城，收集传说中的武器，并与强大的首领展开史诗般的战斗。游戏采用了最先进的物理引擎，打击感拳拳到肉。',
    screenshots: [
      `https://picsum.photos/600/300?random=${id}1`,
      `https://picsum.photos/600/300?random=${id}2`,
      `https://picsum.photos/600/300?random=${id}3`
    ]
  }
})

const goBack = () => uni.navigateBack()

const previewImage = (index: number) => {
  uni.previewImage({
    urls: gameDetail.value.screenshots,
    current: index
  })
}

// 模拟下载流程逻辑
const handleDownload = () => {
  if (downloadStatus.value !== 'idle') {
    if (downloadStatus.value === 'done') uni.showToast({ title: '打开游戏', icon: 'none' })
    return
  }
  
  downloadStatus.value = 'downloading'
  progress.value = 0
  
  const timer = setInterval(() => {
    progress.value += 15
    downloadText.value = `下载中 ${progress.value}%`
    
    if (progress.value >= 100) {
      clearInterval(timer)
      downloadStatus.value = 'done'
      downloadText.value = '立即打开'
      uni.vibrateShort({})
    }
  }, 300)
}
</script>