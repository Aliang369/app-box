<template>
  <view class="min-h-screen bg-[#F8FAFF]">
    <view class="sticky top-0 z-30 pt-4 pb-3 px-5 bg-white/20 backdrop-blur-2xl border-b border-white/30 flex items-center gap-4">
      <view class="flex-1 h-11 bg-white/40 border border-white/60 rounded-2xl flex items-center px-4 shadow-sm">
        <text class="text-indigo-600/50 text-xl mr-2">🔍</text>
        <input
          v-model="keyword"
          class="flex-1 text-sm text-indigo-950/80 bg-transparent"
          placeholder="关键词..."
          placeholder-class="text-indigo-900/20"
          focus
          @confirm="handleSearch"
        />
        <text v-if="keyword" class="text-indigo-900/10 ml-2" @click="keyword = ''">✕</text>
      </view>
      <text class="text-sm font-bold text-indigo-600/60" @click="goBack">取消</text>
    </view>

    <view v-if="!isSearching" class="p-6">
      
      <view v-if="historyList.length > 0" class="mb-10">
        <view class="flex items-center justify-between mb-5">
          <text class="text-[13px] font-black text-indigo-950/30 tracking-widest uppercase">History</text>
          <text class="text-indigo-900/20" @click="clearHistory">🗑️</text>
        </view>
        <view class="flex flex-wrap gap-3">
          <view
            v-for="(item, index) in historyList" :key="index"
            class="px-4 py-1.5 bg-white/40 border border-white/80 rounded-xl text-xs text-indigo-900/60 font-medium shadow-[0_2px_8px_rgba(0,0,0,0.02)] active:scale-90 transition-all"
            @click="clickTag(item)"
          >
            {{ item }}
          </view>
        </view>
      </view>

      <view>
        <text class="text-[13px] font-black text-indigo-950/30 tracking-widest uppercase mb-5 block">Trending</text>
        <view class="flex flex-col gap-2">
          <view
            v-for="(item, index) in hotList" :key="index"
            class="group flex items-center justify-between p-4 bg-white/20 border border-white/40 rounded-2xl active:bg-white/60 transition-all"
            @click="clickTag(item)"
          >
            <view class="flex items-center gap-3">
              <text class="text-xs font-black text-indigo-600/30">0{{ index + 1 }}</text>
              <text class="text-sm font-bold text-indigo-950/70">{{ item }}</text>
            </view>
            <text class="text-indigo-900/10 text-xs group-active:translate-x-1 transition-transform">›</text>
          </view>
        </view>
      </view>
    </view>

    <view v-else class="p-6">
       <view v-if="isLoading" class="flex flex-col items-center justify-center py-20">
         <view class="text-3xl text-indigo-900/10 animate-spin">⟳</view>
         <text class="text-xs text-indigo-950/20 mt-4 tracking-widest uppercase">Searching...</text>
       </view>
       <view v-else class="flex flex-col gap-3">
         <view v-if="resultList.length === 0" class="flex flex-col items-center justify-center py-20">
           <view class="w-20 h-20 bg-white/30 rounded-full flex items-center justify-center mb-3">
             <text class="text-3xl text-indigo-900/10">🔍</text>
           </view>
           <text class="text-sm text-indigo-950/40">No results found</text>
         </view>

         <view v-else>
           <view class="text-xs text-indigo-950/30 mb-3">Found {{ resultList.length }} results</view>
           
           <view 
             v-for="(game, index) in resultList" 
             :key="index" 
             class="p-4 rounded-2xl flex items-center bg-white/30 border border-white/60 shadow-[0_2px_8px_rgba(0,0,0,0.02)] active:bg-white/50 transition-all"
             @click="goToDetail(game)"
           >
             <image :src="game.cover" class="w-14 h-14 rounded-xl mr-3 shrink-0" mode="aspectFill"></image>
             <view class="flex-1 min-w-0">
               <view class="text-sm font-bold text-indigo-950/80 truncate">{{ game.title }}</view>
               <view class="text-xs text-indigo-950/40 mt-0.5 truncate">{{ game.desc }}</view>
             </view>
             <view class="text-xs text-indigo-600/50 font-medium">→</view>
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
    confirmColor: '#4f46e5',
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
