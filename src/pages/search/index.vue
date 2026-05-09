<template>
  <view class="min-h-screen bg-white">
    <view class="sticky top-0 z-30 pt-12 pb-3 px-5 bg-white border-b border-gray-100 flex items-center gap-3">
      <view class="flex-1 h-10 bg-gray-50 border border-gray-100 rounded-full flex items-center px-4">
        <view class="i-lucide-search text-gray-400 text-lg mr-2"></view>
        <input 
          v-model="keyword"
          class="flex-1 text-[13px] text-gray-900 bg-transparent"
          placeholder="输入游戏名称..."
          placeholder-class="text-gray-300"
          focus
          @confirm="handleSearch"
        />
        <view v-if="keyword" class="i-lucide-x-circle text-gray-300 ml-2" @click="clearKeyword"></view>
      </view>
      <text class="text-[13px] font-medium text-gray-500" @click="goBack">取消</text>
    </view>

    <view v-if="!hasSearched" class="p-5 animate-fade-in">
      <view v-if="historyList.length > 0" class="mb-8">
        <view class="flex items-center justify-between mb-4">
          <text class="text-xs font-bold text-gray-400">搜索历史</text>
          <view class="i-lucide-trash-2 text-gray-300 text-sm" @click="clearHistory"></view>
        </view>
        <view class="flex flex-wrap gap-2">
          <view v-for="(item, index) in historyList" :key="index" class="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs text-gray-600 active:bg-gray-100" @click="clickTag(item)">{{ item }}</view>
        </view>
      </view>
      <view>
        <text class="text-xs font-bold text-gray-400 mb-4 block">热门搜索</text>
        <view class="flex flex-wrap gap-2">
          <view v-for="(item, index) in hotList" :key="index" class="px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-600 active:bg-indigo-100" @click="clickTag(item)">{{ item }}</view>
        </view>
      </view>
    </view>

    <view v-else class="p-5">
      <view v-if="isFirstLoading" class="flex flex-col gap-3">
        <view v-for="i in 6" :key="i" class="flex items-center p-2 rounded-xl border border-gray-50 animate-pulse">
           <view class="w-12 h-12 rounded-lg bg-gray-100 shrink-0"></view>
           <view class="ml-3 flex-1">
             <view class="h-3.5 bg-gray-100 rounded w-1/2 mb-2"></view>
             <view class="h-2.5 bg-gray-50 rounded w-1/4"></view>
           </view>
           <view class="w-4 h-4 bg-gray-50 rounded"></view>
        </view>
      </view>

      <view v-else>
        <view v-if="searchResult.length > 0" class="flex flex-col gap-3 animate-fade-in">
          <view v-for="game in searchResult" :key="game.id" class="flex items-center p-2 rounded-xl border border-gray-50 active:bg-gray-50" @click="goToDetail(game.id)">
            <image :src="game.cover" class="w-12 h-12 rounded-lg bg-gray-100 border border-gray-100" mode="aspectFill"></image>
            <view class="ml-3 flex-1">
              <text class="text-sm font-bold text-gray-900 block">{{ game.title }}</text>
              <text class="text-xs text-gray-400 mt-1 block">#{{ game.tag }}</text>
            </view>
            <view class="i-lucide-chevron-right text-gray-300"></view>
          </view>
        </view>

        <view v-else class="flex flex-col items-center justify-center pt-20 animate-fade-in">
          <view class="i-lucide-search-x text-4xl text-gray-200 mb-4"></view>
          <text class="text-sm text-gray-400">未找到相关游戏</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { searchGames } from '@/api/game'

const keyword = ref('')
const hasSearched = ref(false)
const isFirstLoading = ref(false)
const historyList = ref<string[]>([])
const hotList = ref(['星穹幻轨', '元气小骑士', '荒野之息'])
const searchResult = ref<any[]>([])

onMounted(() => {
  const savedHistory = uni.getStorageSync('search_history')
  if (savedHistory) historyList.value = JSON.parse(savedHistory)
})

const goBack = () => uni.navigateBack()

const clearKeyword = () => {
  keyword.value = ''
  hasSearched.value = false
  searchResult.value = []
}

const handleSearch = async () => {
  const query = keyword.value.trim()
  if (!query) return
  
  hasSearched.value = true
  isFirstLoading.value = true // 显示骨架屏
  
  // 记录历史
  let history = historyList.value.filter(item => item !== query)
  history.unshift(query)
  if (history.length > 10) history = history.slice(0, 10)
  historyList.value = history
  uni.setStorageSync('search_history', JSON.stringify(history))

  try {
    // 🚀 发起真实搜索请求
    const newData = await searchGames({ keyword: query, limit: 20 })
    searchResult.value = newData
  } catch (error) {
    uni.showToast({ title: '搜索出错', icon: 'none' })
  } finally {
    isFirstLoading.value = false // 结束骨架屏
  }
}

const clickTag = (tag: string) => {
  keyword.value = tag
  handleSearch()
}

const clearHistory = () => {
  historyList.value = []
  uni.removeStorageSync('search_history')
}

const goToDetail = (id: string) => uni.navigateTo({ url: `/pages/detail/index?id=${id}` })
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
</style>