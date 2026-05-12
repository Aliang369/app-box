<template>
  <view class="min-h-screen bg-gray-50 pb-28">
    <PageHeader
      title="游戏详情"
      fallback-url="/pages/index/index"
      right-icon="i-lucide-share-2"
      @right-click="handleShare"
    />

    <view v-if="loading" class="p-6 space-y-4">
      <view class="w-full h-32 bg-gray-200 animate-pulse rounded-2xl"></view>
      <view class="w-2/3 h-8 bg-gray-200 animate-pulse rounded-lg"></view>
      <view class="w-full h-40 bg-gray-200 animate-pulse rounded-2xl"></view>
    </view>

    <block v-else>
      <view class="px-6 pt-6 pb-6 bg-white">
        <view class="flex items-center gap-4 mb-6">
          <image :src="gameInfo.cover" class="w-20 h-20 rounded-2xl bg-gray-100 shadow-sm border border-gray-50 object-cover" mode="aspectFill" />
          <view class="flex-1 flex flex-col justify-center">
            <text class="text-xl font-black text-gray-900 block mb-1.5">{{ gameInfo.title }}</text>
            <view class="flex items-center">
              <view class="px-2 py-0.5 bg-indigo-50 text-indigo-500 rounded text-[10px] font-bold border border-indigo-100/50">
                {{ gameInfo.tag || '热门游戏' }}
              </view>
            </view>
          </view>
        </view>

        <view class="flex items-center justify-between px-4 py-3 bg-gray-50/50 rounded-2xl border border-gray-50">
          <view class="flex-1 flex flex-col items-center justify-center border-r border-gray-200/50">
            <view class="flex items-baseline gap-1 mb-1">
              <text class="text-lg font-black text-gray-900">{{ gameInfo.rating }}</text>
              <view class="i-lucide-star text-[10px] text-amber-500 fill-current mb-0.5"></view>
            </view>
            <text class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">评分</text>
          </view>
          
          <view class="flex-1 flex flex-col items-center justify-center border-r border-gray-200/50">
            <text class="text-lg font-black text-gray-900 mb-1">{{ gameInfo.downloads }}</text>
            <text class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">下载</text>
          </view>
          
          <view class="flex-1 flex flex-col items-center justify-center">
            <text class="text-lg font-black text-gray-900 mb-1">{{ gameSizeText }}</text>
            <text class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">大小</text>
          </view>
        </view>
      </view>

      <view class="px-6 mt-6 space-y-8">
        <view v-if="showGiftCard" class="bg-indigo-50/50 rounded-3xl p-5 border border-indigo-100/50 flex items-center justify-between">
          <view class="flex items-center gap-4">
            <view class="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-sm shadow-indigo-500/30">
              <view class="i-lucide-gift text-white text-xl"></view>
            </view>
            <view>
              <text class="block text-sm font-black text-gray-900 mb-0.5">{{ gameInfo.gift_name }}</text>
              <text class="text-[10px] text-gray-500 font-bold">{{ gameInfo.gift_desc }}</text>
            </view>
          </view>
          <view 
            class="px-5 py-2 rounded-full flex items-center justify-center transition-all"
            :class="hasClaimed ? 'bg-gray-100' : 'bg-indigo-600 active:scale-95 active:bg-indigo-700 shadow-md shadow-indigo-600/30'"
            @click="handleClaimGift"
          >
            <text class="text-xs font-black" :class="hasClaimed ? 'text-gray-400' : 'text-white'">
              {{ hasClaimed ? '已领取' : '免费领' }}
            </text>
          </view>
        </view>

        <view>
          <text class="text-sm font-black text-gray-900 block mb-4 tracking-tighter">详细介绍</text>
          <text class="text-sm text-gray-600 leading-relaxed font-medium">{{ gameInfo.short_desc }}</text>
        </view>

        <view v-if="screenshots.length > 0">
          <text class="text-sm font-black text-gray-900 block mb-4 tracking-tighter">游戏截图</text>
          <scroll-view scroll-x class="whitespace-nowrap w-full" shows-scrollbar="false">
            <view 
              v-for="(img, idx) in screenshots" 
              :key="idx" 
              class="inline-block h-56 mr-3 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100"
            >
              <image :src="img" class="h-full" mode="heightFix" @click="previewImage(idx)"></image>
            </view>
          </scroll-view>
        </view>
      </view>

      <view class="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md pb-safe border-t border-gray-100 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] z-50">
        <view class="px-6 h-20 flex items-center gap-4">
          <view 
            class="flex flex-col items-center justify-center w-14 transition-all active:scale-90"
            @click="handleFavorite"
          >
            <view class="text-2xl transition-colors duration-300 mb-1" :class="isFavorited ? 'i-lucide-heart text-red-500 fill-current animate-bounce-short' : 'i-lucide-heart text-gray-400'"></view>
            <text class="text-[10px] font-bold" :class="isFavorited ? 'text-red-500' : 'text-gray-400'">{{ isFavorited ? '已收藏' : '收藏' }}</text>
          </view>

          <view class="flex-1 h-12 bg-gray-900 rounded-full flex items-center justify-center active:scale-[0.98] transition-all shadow-lg shadow-gray-900/20" @click="handleDownload">
            <view class="i-lucide-download text-white text-lg mr-2"></view>
            <text class="text-white font-black text-[15px] tracking-widest">立即下载</text>
          </view>
        </view>
      </view>
    </block>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { getGameDetailApi } from '@/api/game'
import { claimGiftApi, checkFavoriteApi, toggleFavoriteApi, addFootprintApi } from '@/api/user'
import PageHeader from '@/components/PageHeader.vue'

const loading = ref(true)
const gameInfo = ref<any>({})
const screenshots = ref<string[]>([])
const hasClaimed = ref(false)
const isFavorited = ref(false)

const gameSizeText = computed(() => {
  let mb = Number(gameInfo.value?.size_mb)
  if (!(mb > 0)) mb = Number(gameInfo.value?.size)
  if (mb > 0) {
    if (mb >= 1000) {
      const gb = mb / 1024
      return `${gb.toFixed(2)}GB`
    }
    return `${mb}MB`
  }
  return '256MB'
})

const showGiftCard = computed(() => {
  return Boolean(gameInfo.value?.gift_name || gameInfo.value?.gift_desc)
})

// 预取礼包和收藏状态 (模拟逻辑，若后端接口存在则直接调用)
const fetchUserStatus = async (gameId: number) => {
  const userInfoStr = uni.getStorageSync('user_info')
  if (!userInfoStr) return
  const user = JSON.parse(userInfoStr)
  try {
    const favRes: any = await checkFavoriteApi(gameId)
    isFavorited.value = favRes.isFavorited
    // 如果后端有 check 接口，在这里检查礼包：hasClaimed.value = res.isClaimed
  } catch (error) {}
}

const fetchGameDetail = async (id: string) => {
  try {
    const res: any = await getGameDetailApi(id)
    gameInfo.value = res
    if (res.screenshots) {
      screenshots.value = typeof res.screenshots === 'string' ? JSON.parse(res.screenshots) : res.screenshots
    }
    await fetchUserStatus(res.id)
    
    // 追加：静默记录足迹埋点
    const userInfoStr = uni.getStorageSync('user_info')
    if (userInfoStr) {
       addFootprintApi({ game_id: res.id })
    }
    
  } catch (error) {
    uni.showToast({ title: '获取数据失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

onLoad((options: any) => {
  if (options.id) fetchGameDetail(options.id)
})

const handleClaimGift = async () => {
  if (hasClaimed.value) return uni.showToast({ title: '请前往我的礼包查看', icon: 'none' })
  const userInfoStr = uni.getStorageSync('user_info')
  if (!userInfoStr) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => uni.navigateTo({ url: '/pages/login/index' }), 1000)
    return
  }
  uni.showLoading({ title: '领取中' })
  try {
    const res: any = await claimGiftApi({ game_id: gameInfo.value.id })
    uni.hideLoading()
    uni.showToast({ title: '领取成功', icon: 'success' })
    hasClaimed.value = true
    setTimeout(() => {
      uni.showModal({
        title: '激活码', content: res.gift_code, confirmText: '复制',
        success: (mRes) => { if (mRes.confirm) uni.setClipboardData({ data: res.gift_code }) }
      })
    }, 1000)
  } catch (error: any) {
    uni.hideLoading()
    if (error && error.code === 400) hasClaimed.value = true
  }
}

const handleFavorite = async () => {
  const userInfoStr = uni.getStorageSync('user_info')
  if (!userInfoStr) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => uni.navigateTo({ url: '/pages/login/index' }), 1000)
    return
  }
  try {
    const res: any = await toggleFavoriteApi({ game_id: gameInfo.value.id })
    isFavorited.value = res.isFavorited
    
    // 强制前端显示 Toast，不依赖后端的 message 字段
    uni.showToast({
      title: isFavorited.value ? '收藏成功' : '已取消收藏',
      icon: 'none',
      duration: 2000
    })
    
    // 兼容处理：H5在电脑端可能会因为不支持震动而报错
    try {
      if(isFavorited.value) uni.vibrateShort({})
    } catch(err) {}
    
  } catch (e) {
    console.error('收藏失败', e)
  }
}

const handleDownload = () => {
  uni.showToast({ title: '准备开始下载...', icon: 'none' })
}

const previewImage = (index: number) => {
  uni.previewImage({ current: index, urls: screenshots.value })
}

const handleShare = () => {
  // #ifdef H5
  uni.showToast({ title: '请点击浏览器右上角菜单分享', icon: 'none' })
  // #endif
}

// 小程序分享
onShareAppMessage(() => ({ title: gameInfo.value.title, path: `/pages/detail/index?id=${gameInfo.value.id}` }))
onShareTimeline(() => ({ title: gameInfo.value.title, query: `id=${gameInfo.value.id}` }))
</script>

<style scoped>
.animate-bounce-short {
  animation: bounceShort 0.5s ease-in-out 1;
}
@keyframes bounceShort {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}
</style>
