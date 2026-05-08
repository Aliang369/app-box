<template>
  <view class="min-h-screen pb-24 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative">
    
    <view class="absolute top-0 left-0 right-0 h-64 overflow-hidden z-0">
      <image :src="gameDetail.cover" class="w-full h-full object-cover opacity-30 blur-xl scale-110" mode="aspectFill"></image>
      <view class="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-50/90"></view>
    </view>

    <view v-if="isLoading" class="flex justify-center items-center py-32 relative z-10">
      <text class="text-pink-400 text-sm animate-pulse">正在连接数据终端...</text>
    </view>

    <block v-else>
      <view class="mx-4 mt-4 pt-16 relative z-10">
        <view class="bg-white/60 backdrop-blur-xl p-5 rounded-3xl border border-white/80 shadow-[0_8px_20px_rgba(0,0,0,0.03)] flex items-end relative">
          <image :src="gameDetail.cover" class="w-24 h-24 rounded-3xl shadow-lg border-2 border-white absolute -top-8 shrink-0 bg-white" mode="aspectFill"></image>
          
          <view class="ml-28 flex-1 min-w-0">
            <view class="text-xl font-black text-indigo-900 truncate">{{ gameDetail.title }}</view>
            <view class="text-xs text-indigo-500 mt-1.5 flex items-center gap-2 font-medium">
              <text class="text-orange-400">⭐ {{ gameDetail.rating }}</text>
              <text class="text-indigo-200">|</text>
              <text>{{ gameDetail.size }}</text>
              <text class="text-indigo-200">|</text>
              <text>{{ gameDetail.downloads }}次下载</text>
            </view>
          </view>
        </view>
        
        <view class="mt-4 flex gap-2 flex-wrap px-1">
          <view class="text-xs text-cyan-600 bg-cyan-100/70 px-3 py-1 rounded-full border border-cyan-200/50" v-for="(tag, index) in gameDetail.tags" :key="index">
            # {{ tag }}
          </view>
        </view>
      </view>

      <view class="mt-6 relative z-10">
        <view class="text-base font-black text-indigo-900 mb-3 px-5 flex items-center gap-2">
          <text class="w-1 h-4 bg-cyan-400 rounded-full"></text>
          游戏实机
        </view>
        <scroll-view scroll-x class="whitespace-nowrap w-full pl-5 pr-2">
          <image
            v-for="(img, index) in gameDetail.screenshots"
            :key="index"
            :src="img"
            class="w-48 h-80 rounded-3xl mr-4 inline-block bg-white shadow-sm border border-white/50"
            mode="aspectFill"
          ></image>
        </scroll-view>
      </view>

      <view class="mx-4 mt-6 mb-4 p-5 rounded-3xl bg-white/50 backdrop-blur-md border border-white/80 shadow-[0_4px_12px_rgba(0,0,0,0.02)] relative z-10">
        <view class="text-base font-black text-indigo-900 mb-3 flex items-center gap-2">
           <text class="w-1 h-4 bg-purple-400 rounded-full"></text>
           情报解码
        </view>
        <text class="text-sm text-indigo-900/70 leading-relaxed font-medium">{{ gameDetail.description }}</text>
      </view>
    </block>

    <view class="fixed bottom-0 left-0 right-0 bg-white/70 backdrop-blur-xl p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] pb-safe z-50 border-t border-white/60">
      <button
        @click="handleDownload"
        class="w-full bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 text-white rounded-full py-3 text-lg font-black shadow-[0_6px_15px_rgba(236,72,153,0.3)] active:opacity-80 border-none m-0 flex items-center justify-center transition-all tracking-widest"
        :class="{'opacity-70 from-gray-400 to-gray-500 shadow-none': isDownloading}"
      >
        {{ isDownloading ? '同步数据中...' : '立即获取' }}
      </button>
    </view>
    
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const isLoading = ref(true)
const isDownloading = ref(false)
const gameId = ref('')
const gameDetail = ref<any>({})

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
  isDownloading.value = true
  uni.showToast({ title: '开始下载', icon: 'success' })
  setTimeout(() => {
    isDownloading.value = false
    uni.showToast({ title: '下载完成', icon: 'success' })
  }, 2000)
}
</script>

<style>
.pb-safe { padding-bottom: max(env(safe-area-inset-bottom), 16px); }
button::after { border: none; }
::-webkit-scrollbar { display: none; }
</style>