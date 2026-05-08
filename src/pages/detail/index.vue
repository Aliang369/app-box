<template>
  <view class="min-h-screen pb-24 bg-white">

    <view class="sticky top-0 z-30 bg-white border-b border-gray-100 px-5 py-3 flex items-center">
      <view class="i-lucide-arrow-left text-gray-900 text-lg mr-3" @click="goBack"></view>
      <text class="text-sm font-medium text-gray-900 truncate">{{ gameDetail.title || '游戏详情' }}</text>
    </view>

    <view v-if="isLoading" class="flex justify-center items-center py-32">
      <view class="i-lucide-loader-2 text-gray-200 text-2xl animate-spin"></view>
    </view>

    <block v-else>
      <view class="px-5 pt-6 pb-5">
        <view class="flex">
          <view class="w-20 h-20 shrink-0 overflow-hidden rounded-xl">
            <image :src="gameDetail.cover" class="w-full h-full" mode="aspectFill"></image>
          </view>
          <view class="ml-4 flex-1 min-w-0 flex flex-col justify-between">
            <view>
              <text class="text-lg font-bold text-gray-900 truncate block">{{ gameDetail.title }}</text>
              <view class="flex items-center gap-2 mt-1.5">
                <view class="flex items-center">
                  <view class="i-lucide-star text-gray-400 text-xs mr-0.5"></view>
                  <text class="text-xs text-gray-500 font-medium">{{ gameDetail.rating }}</text>
                </view>
                <text class="text-gray-200">·</text>
                <text class="text-xs text-gray-400">{{ gameDetail.size }}</text>
                <text class="text-gray-200">·</text>
                <text class="text-xs text-gray-400">{{ gameDetail.downloads }}下载</text>
              </view>
            </view>
            <view class="flex gap-1.5 mt-2">
              <text class="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded" v-for="(tag, index) in gameDetail.tags" :key="index">
                {{ tag }}
              </text>
            </view>
          </view>
        </view>
      </view>

      <view class="border-t border-gray-50">
        <view class="px-5 py-4">
          <text class="text-xs font-medium text-gray-400 uppercase tracking-wider">游戏截图</text>
        </view>
        <scroll-view scroll-x class="whitespace-nowrap w-full pl-5 pr-2">
          <image
            v-for="(img, index) in gameDetail.screenshots"
            :key="index"
            :src="img"
            class="w-36 h-64 rounded-lg mr-3 inline-block border border-gray-100"
            mode="aspectFill"
          ></image>
        </scroll-view>
      </view>

      <view class="px-5 mt-4">
        <text class="text-xs font-medium text-gray-400 uppercase tracking-wider">游戏介绍</text>
        <text class="text-sm text-gray-600 leading-relaxed mt-3 block">{{ gameDetail.description }}</text>
      </view>
    </block>

    <view class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-safe z-50">
      <button
        @click="handleDownload"
        class="w-full bg-gray-900 text-white rounded-lg py-3 text-sm font-medium active:bg-gray-800 border-none m-0 transition-colors"
        :class="{'bg-gray-300': isDownloading}"
      >
        {{ isDownloading ? '下载中...' : '获取游戏' }}
      </button>
    </view>
    
    <wd-toast />
    <wd-message-box />

  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useToast, useMessage } from 'wot-design-uni'

const toast = useToast()
const message = useMessage()

const isLoading = ref(true)
const isDownloading = ref(false)
const gameId = ref('')
const gameDetail = ref<any>({})

const goBack = () => {
  uni.navigateBack()
}

onLoad((options: any) => {
  if (options.id) {
    gameId.value = options.id
    fetchGameDetail(options.id)
  }
})

const fetchGameDetail = (id: string) => {
  isLoading.value = true
  setTimeout(() => {
    gameDetail.value = {
      id: id,
      title: id === '1' ? '元气小骑士' : '星穹幻轨',
      cover: `https://picsum.photos/100/100?random=${id}1`,
      rating: '4.8',
      size: '128 MB',
      downloads: '10w+',
      tags: ['动作冒险', '像素风', '地牢'],
      screenshots: [
        `https://picsum.photos/300/500?random=${id}2`,
        `https://picsum.photos/300/500?random=${id}3`,
        `https://picsum.photos/300/500?random=${id}4`,
      ],
      description: '这是一款超级好玩的动作RPG。玩家将扮演主角，在广袤的奇幻世界中不断探索，结识性格迥异的伙伴，战胜各种强大的敌人。游戏拥有精美的二次元立绘、豪华的声优阵容以及绚丽的战斗特效，绝对让你爱不释手！快来缔结你的专属羁绊吧！'
    }
    isLoading.value = false
  }, 600)
}

const handleDownload = () => {
  if (isDownloading.value) return
  
  message.confirm({
    title: '下载确认',
    msg: `确认下载【${gameDetail.value.title}】？大小 ${gameDetail.value.size}`,
    confirmButtonText: '下载',
    cancelButtonText: '取消',
  }).then(() => {
    isDownloading.value = true
    toast.loading('下载中...')
    
    setTimeout(() => {
      isDownloading.value = false
      toast.close()
      toast.success('下载完成')
    }, 2500)
    
  }).catch(() => {
    console.log('用户取消了下载')
  })
}
</script>

<style>
.pb-safe { padding-bottom: max(env(safe-area-inset-bottom), 16px); }
button::after { border: none; }
::-webkit-scrollbar { display: none; }

.animate-spin {
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
