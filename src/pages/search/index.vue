<template>
  <view class="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
    
    <view class="sticky top-0 z-30 pt-4 pb-3 px-4 bg-white/40 backdrop-blur-2xl border-b border-white/50 flex items-center gap-3">
      <view class="flex-1 h-11 bg-white/60 border border-white/80 rounded-full shadow-sm flex items-center px-4">
        <text class="text-indigo-500 text-xl mr-2">🔍</text>
        <input
          v-model="keyword"
          class="flex-1 text-sm text-indigo-900 bg-transparent"
          placeholder="输入关键字..."
          placeholder-class="text-indigo-300"
          focus
          @confirm="handleSearch"
        />
        <view v-if="keyword" class="text-indigo-200 ml-2 text-sm" @click="keyword = ''">✕</view>
      </view>
      <text class="text-sm font-black text-indigo-500 px-2" @click="goBack">取消</text>
    </view>

    <view v-if="!isSearching" class="p-5 animate-fade-in">
      
      <view v-if="historyList.length > 0" class="mb-8">
        <view class="flex items-center justify-between mb-4">
          <view class="flex items-center gap-2">
            <view class="w-1 h-3 bg-indigo-400 rounded-full"></view>
            <text class="text-sm font-black text-indigo-900 tracking-wider">搜索记忆</text>
          </view>
          <view class="text-indigo-300 p-1 text-sm" @click="clearHistory">🗑️</view>
        </view>
        <view class="flex flex-wrap gap-2.5">
          <view
            v-for="(item, index) in historyList" :key="index"
            class="px-4 py-1.5 bg-white/50 backdrop-blur-md border border-white/80 rounded-full text-xs text-indigo-600 font-bold shadow-sm active:scale-90 transition-transform"
            @click="clickTag(item)"
          >
            {{ item }}
          </view>
        </view>
      </view>

      <view>
        <view class="flex items-center gap-2 mb-4">
          <view class="w-1 h-3 bg-pink-400 rounded-full"></view>
          <text class="text-sm font-black text-indigo-900 tracking-wider">热门情报</text>
        </view>
        <view class="flex flex-wrap gap-2.5">
          <view
            v-for="(item, index) in hotList" :key="index"
            class="px-4 py-1.5 bg-gradient-to-r from-pink-50 to-indigo-50 border border-white rounded-full text-xs text-pink-500 font-bold shadow-sm flex items-center gap-1 active:scale-90 transition-transform"
            @click="clickTag(item)"
          >
            <text v-if="index < 3" class="text-[10px] text-orange-400">🔥</text>
            {{ item }}
          </view>
        </view>
      </view>
    </view>

    <view v-else class="p-4 animate-fade-in">
       <view v-if="isLoading" class="flex flex-col items-center justify-center py-20">
         <view class="text-3xl text-indigo-300 animate-spin">🌀</view>
         <text class="text-xs text-indigo-300 mt-4 tracking-widest uppercase">Searching...</text>
       </view>
       <view v-else class="flex flex-col gap-3">
         <view v-if="resultList.length === 0" class="flex flex-col items-center justify-center py-20">
           <view class="w-24 h-24 bg-white/50 rounded-full flex items-center justify-center mb-3 shadow-inner">
             <text class="text-4xl text-indigo-200">👻</text>
           </view>
           <text class="text-sm text-indigo-400">未能找到相关内容...</text>
         </view>

         <view v-else>
           <view class="text-xs text-indigo-400 mb-1">找到 {{ resultList.length }} 个结果</view>
           
           <view 
             v-for="(game, index) in resultList" 
             :key="index" 
             class="p-3 rounded-3xl flex items-center bg-white/50 backdrop-blur-md border border-white/80 shadow-[0_4px_12px_rgba(0,0,0,0.04)] active:scale-[0.98] transition-transform"
             @click="goToDetail(game)"
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
    uni.showToast({ title: '请输入要搜索的内容', icon: 'none' })
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
    content: '确认清空搜索记忆吗？',
    confirmColor: '#ec4899',
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

const downloadGame = (game: any) => {
  uni.showToast({ title: `开始下载 ${game.title}`, icon: 'success' })
}
</script>

<style>
button::after { border: none; }
::-webkit-scrollbar { display: none; }

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
