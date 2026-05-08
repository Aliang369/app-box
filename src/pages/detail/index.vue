<template>
  <view class="bg-gray-100 min-h-screen pb-24">
    
    <view v-if="isLoading" class="flex justify-center items-center py-20">
      <text class="text-gray-400 text-sm">正在加载详情...</text>
    </view>

    <block v-else>
      <view class="bg-white p-4 flex items-center shadow-sm">
        <image :src="gameDetail.cover" class="w-20 h-20 rounded-2xl bg-gray-200 mr-4 shrink-0" mode="aspectFill"></image>
        <view class="flex-1 min-w-0">
          <view class="text-xl font-bold text-gray-800 truncate">{{ gameDetail.title }}</view>
          
          <view class="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <text>⭐ {{ gameDetail.rating }}</text>
            <text>|</text>
            <text>{{ gameDetail.size }}</text>
            <text>|</text>
            <text>{{ gameDetail.downloads }}次下载</text>
          </view>
          
          <view class="mt-2 flex gap-2 flex-wrap">
            <view class="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded" v-for="(tag, index) in gameDetail.tags" :key="index">
              {{ tag }}
            </view>
          </view>
        </view>
      </view>

      <view class="bg-white mt-3 p-4 shadow-sm">
        <view class="text-base font-bold text-gray-800 mb-3">游戏截图</view>
        <scroll-view scroll-x class="whitespace-nowrap w-full">
          <image
            v-for="(img, index) in gameDetail.screenshots"
            :key="index"
            :src="img"
            class="w-40 h-72 rounded-lg mr-3 inline-block bg-gray-200"
            mode="aspectFill"
          ></image>
        </scroll-view>
      </view>

      <view class="bg-white mt-3 p-4 shadow-sm">
        <view class="text-base font-bold text-gray-800 mb-3">游戏简介</view>
        <text class="text-sm text-gray-600 leading-relaxed">{{ gameDetail.description }}</text>
      </view>
    </block>

    <view class="fixed bottom-0 left-0 right-0 bg-white p-3 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pb-safe z-50">
      <button
        @click="handleDownload"
        class="w-full bg-blue-500 text-white rounded-full py-2.5 text-base font-bold shadow-md active:bg-blue-600 border-none m-0 flex items-center justify-center transition-all"
        :class="{'opacity-70': isDownloading}"
      >
        {{ isDownloading ? '正在下载...' : '立即下载' }}
      </button>
    </view>
    
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

// --- 状态定义 ---
const isLoading = ref(true)
const isDownloading = ref(false)
const gameId = ref('')
const gameDetail = ref<any>({})

// --- 生命周期 ---
onLoad((options: any) => {
  // options 对象包含了从上一个页面 url 中传过来的参数
  if (options.id) {
    gameId.value = options.id
    fetchGameDetail(options.id)
  }
})

// --- 方法定义 ---

// 根据传入的 ID 获取游戏详情
const fetchGameDetail = (id: string) => {
  isLoading.value = true
  
  // 模拟网络请求延迟
  setTimeout(() => {
    // 这里我们用一个模拟的详情数据，真实情况是通过 id 发送 API 请求
    gameDetail.value = {
      id: id,
      title: id === '1' ? '元气小骑士' : '其他好玩的游戏',
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
      description: '这是一款超级好玩的像素风地牢探索动作游戏。玩家将扮演一名小骑士，在随机生成的地下城中不断探索，收集奇葩的武器，战胜各种怪兽。游戏节奏轻快，操作简单易上手，同时拥有丰富的装备系统和极具挑战性的Boss战，绝对让你爱不释手！快来体验这个充满惊喜的冒险世界吧！'
    }
    isLoading.value = false
  }, 600)
}

// 模拟下载按钮点击事件
const handleDownload = () => {
  if (isDownloading.value) return
  
  isDownloading.value = true
  uni.showToast({ title: '开始下载', icon: 'success' })
  
  // 模拟下载进度，2秒后恢复
  setTimeout(() => {
    isDownloading.value = false
    uni.showToast({ title: '下载完成', icon: 'success' })
  }, 2000)
}
</script>

<style>
/* 适配苹果手机底部小白条的安全距离 */
.pb-safe {
  padding-bottom: max(env(safe-area-inset-bottom), 12px);
}
/* 去除 uniapp 默认按钮边框 */
button::after {
  border: none;
}
</style>
