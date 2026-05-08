<template>
  <view class="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative">
    
    <view class="sticky top-0 z-20 bg-white/60 backdrop-blur-xl shadow-sm border-b border-white/50 pt-2 pb-2 px-2">
      <wd-search 
        v-model="keyword"
        placeholder="输入游戏名或类型..." 
        focus
        bg-color="rgba(255, 255, 255, 0.6)"
        cancel-txt="返回"
        @search="handleSearch"
        @cancel="goBack"
        @clear="handleClear"
      ></wd-search>
    </view>

    <view v-if="!isSearching" class="p-4 relative z-10">
      
      <view v-if="historyList.length > 0" class="mb-6">
        <view class="flex items-center justify-between mb-3">
          <text class="text-sm font-black text-indigo-900 flex items-center gap-2">
            <text class="w-1 h-3 bg-purple-400 rounded-full"></text>
            搜索记忆
          </text>
          <view class="i-carbon-trash-can text-indigo-400 active:text-pink-400 p-2" @click="clearHistory"></view>
        </view>
        <view class="flex flex-wrap gap-2">
          <view 
            v-for="(item, index) in historyList" 
            :key="index"
            class="text-xs text-indigo-600 font-medium bg-white/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/80 shadow-sm active:scale-95 transition-transform"
            @click="clickTag(item)"
          >
            {{ item }}
          </view>
        </view>
      </view>

      <view>
        <view class="flex items-center justify-between mb-3">
          <text class="text-sm font-black text-indigo-900 flex items-center gap-2">
            <text class="w-1 h-3 bg-pink-400 rounded-full"></text>
            热门情报
          </text>
        </view>
        <view class="flex flex-wrap gap-2">
          <view 
            v-for="(item, index) in hotList" 
            :key="index"
            class="text-xs text-pink-600 font-medium bg-gradient-to-r from-pink-50 to-orange-50 px-3 py-1.5 rounded-full border border-pink-100 shadow-sm active:scale-95 transition-transform flex items-center gap-1"
            @click="clickTag(item)"
          >
            <text v-if="index < 3" class="i-carbon-fire text-orange-500"></text>
            {{ item }}
          </view>
        </view>
      </view>

    </view>

    <view v-else class="p-4 relative z-10">
      
      <view v-if="isLoading" class="flex flex-col items-center justify-center py-20">
        <view class="i-carbon-circle-dash animate-spin text-3xl text-pink-400 mb-2"></view>
        <text class="text-xs text-indigo-400 font-medium tracking-widest">检索数据库中...</text>
      </view>

      <view v-else-if="resultList.length === 0" class="flex flex-col items-center justify-center py-20">
        <view class="w-24 h-24 bg-white/50 rounded-full flex items-center justify-center mb-3 shadow-inner">
          <view class="i-carbon-ghost text-4xl text-indigo-200"></view>
        </view>
        <text class="text-sm text-indigo-400">未能找到相关内容...</text>
      </view>

      <view v-else class="flex flex-col gap-4">
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

    <wd-toast />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'wot-design-uni'

const toast = useToast()

// --- 状态定义 ---
const keyword = ref('')
const isSearching = ref(false)
const isLoading = ref(false)

// 模拟数据
const historyList = ref(['元气小骑士', '二次元', '像素风', '动作RPG'])
const hotList = ref(['星穹幻轨', '原神', '绝区零', '蔚蓝档案', '明日方舟', '小动物之星'])
const resultList = ref<any[]>([])

// --- 方法定义 ---

// 点击右侧返回/取消
const goBack = () => {
  uni.navigateBack()
}

// 触发搜索
const handleSearch = (value: string) => {
  const query = value || keyword.value
  if (!query.trim()) {
    toast.show('请输入要搜索的内容')
    return
  }
  
  // 切换到搜索结果视图
  isSearching.value = true
  isLoading.value = true
  
  // 将搜索词加入历史记录 (去重并放在首位)
  const newHistory = historyList.value.filter(item => item !== query)
  newHistory.unshift(query)
  historyList.value = newHistory.slice(0, 10) // 最多保留10条

  // 模拟网络请求检索
  setTimeout(() => {
    // 简单做一个假搜索：如果搜"原神"就出假数据，否则出其他数据
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

// 清除输入框内容
const handleClear = () => {
  isSearching.value = false
  resultList.value = []
}

// 点击标签直接搜索
const clickTag = (tag: string) => {
  keyword.value = tag
  handleSearch(tag)
}

// 清空历史记录
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

// 跳转到详情
const goToDetail = (game: any) => {
  uni.navigateTo({ url: `/pages/detail/index?id=${game.id}` })
}

// 下载
const downloadGame = (game: any) => {
  toast.success(`开始下载 ${game.title}`)
}
</script>

<style>
button::after { border: none; }
::-webkit-scrollbar { display: none; }
</style>