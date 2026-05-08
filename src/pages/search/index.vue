<template>
  <view class="min-h-screen bg-white">
    
    <view class="sticky top-0 z-30 bg-white border-b border-gray-100 px-5 pt-4 pb-3 flex items-center gap-3">
      <view class="flex-1 h-9 bg-gray-50 border border-gray-200 rounded-lg flex items-center px-3">
        <view class="i-lucide-search text-gray-300 text-sm mr-2"></view>
        <input
          v-model="keyword"
          class="flex-1 text-sm text-gray-900 bg-transparent"
          placeholder="搜索游戏"
          placeholder-class="text-gray-300"
          focus
          @confirm="handleSearch"
        />
        <view v-if="keyword" class="i-lucide-x text-gray-300 text-sm ml-2" @click="keyword = ''"></view>
      </view>
      <text class="text-sm text-gray-500 shrink-0" @click="goBack">取消</text>
    </view>

    <view v-if="!isSearching" class="px-5 pt-6">
      <view v-if="historyList.length > 0" class="mb-8">
        <view class="flex items-center justify-between mb-3">
          <text class="text-xs font-medium text-gray-400 uppercase tracking-wider">搜索历史</text>
          <view class="i-lucide-trash-2 text-gray-300 text-sm" @click="clearHistory"></view>
        </view>
        <view class="flex flex-wrap gap-2">
          <view
            v-for="(item, index) in historyList" :key="index"
            class="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-md text-xs text-gray-500 active:bg-gray-100 transition-colors"
            @click="clickTag(item)"
          >
            {{ item }}
          </view>
        </view>
      </view>

      <view>
        <text class="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 block">热门搜索</text>
        <view class="flex flex-col">
          <view
            v-for="(item, index) in hotList" :key="index"
            class="flex items-center justify-between py-3 active:bg-gray-50 transition-colors"
            :class="index < hotList.length - 1 ? 'border-b border-gray-50' : ''"
            @click="clickTag(item)"
          >
            <view class="flex items-center gap-3">
              <text class="text-xs font-bold text-gray-300 w-4">{{ index + 1 }}</text>
              <text class="text-sm text-gray-700">{{ item }}</text>
            </view>
            <view class="i-lucide-arrow-right text-gray-200 text-xs"></view>
          </view>
        </view>
      </view>
    </view>

    <view v-else class="px-5 pt-6">
       <view v-if="isLoading" class="flex flex-col items-center justify-center py-20">
         <view class="i-lucide-loader-2 text-gray-200 text-2xl animate-spin"></view>
         <text class="text-xs text-gray-300 mt-3">搜索中...</text>
       </view>
       <view v-else class="flex flex-col">
         <view v-if="resultList.length === 0" class="flex flex-col items-center justify-center py-20">
           <view class="i-lucide-search text-gray-200 text-3xl"></view>
           <text class="text-sm text-gray-400 mt-3">没有找到相关游戏</text>
         </view>

         <view v-else>
           <text class="text-xs text-gray-400 mb-3">找到 {{ resultList.length }} 个结果</text>
           
           <view 
             v-for="(game, index) in resultList" 
             :key="index" 
             class="py-3 flex items-center active:bg-gray-50 transition-colors"
             :class="index < resultList.length - 1 ? 'border-b border-gray-50' : ''"
             @click="goToDetail(game)"
           >
             <image :src="game.cover" class="w-12 h-12 rounded-lg mr-3 shrink-0" mode="aspectFill"></image>
             <view class="flex-1 min-w-0">
               <view class="text-sm font-medium text-gray-900 truncate">{{ game.title }}</view>
               <view class="text-xs text-gray-400 mt-0.5 truncate">{{ game.desc }}</view>
             </view>
             <view class="i-lucide-chevron-right text-gray-200 text-sm ml-2"></view>
           </view>
         </view>
       </view>
    </view>

  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const keyword = ref('')
const isSearching = ref(false)
const isLoading = ref(false)

const historyList = ref(['元气小骑士', '二次元', '像素风', '动作RPG'])
const hotList = ref(['星穹幻轨', '原神', '绝区零', '蔚蓝档案', '明日方舟', '小动物之星'])
const resultList = ref<any[]>([])

const goBack = () => {
  uni.navigateBack()
}

const handleSearch = (value: string) => {
  const query = value || keyword.value
  if (!query.trim()) {
    uni.showToast({ title: '请输入关键词', icon: 'none' })
    return
  }
  
  isSearching.value = true
  isLoading.value = true
  
  const newHistory = historyList.value.filter(item => item !== query)
  newHistory.unshift(query)
  historyList.value = newHistory.slice(0, 10)

  setTimeout(() => {
    if (query.includes('原') || query.includes('神')) {
      resultList.value = [
         { id: '101', title: '原神', desc: '开放世界冒险RPG', tag: '角色扮演', cover: 'https://picsum.photos/100/100?random=88' }
      ]
    } else {
      resultList.value = [
        { id: '102', title: query + ' 幻想', desc: '根据你搜索生成的模拟游戏', tag: '动作冒险', cover: 'https://picsum.photos/100/100?random=89' },
        { id: '103', title: query + ' 大作战', desc: '休闲竞技派对游戏', tag: '休闲益智', cover: 'https://picsum.photos/100/100?random=90' },
      ]
    }
    isLoading.value = false
  }, 800)
}

const clickTag = (tag: string) => {
  keyword.value = tag
  handleSearch(tag)
}

const clearHistory = () => {
  uni.showModal({
    title: '提示',
    content: '确认清空搜索记录吗？',
    confirmColor: '#111827',
    success: (res) => {
      if (res.confirm) {
        historyList.value = []
      }
    }
  })
}

const goToDetail = (game: any) => {
  uni.navigateTo({ url: `/pages/detail/index?id=${game.id}` })
}
</script>

<style>
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
