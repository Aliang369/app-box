<template>
  <view class="min-h-screen bg-white pb-24">
    <view class="fixed top-0 left-0 right-0 z-50 px-4 pt-12 pb-3 flex justify-between items-center bg-white/80 backdrop-blur-md">
      <view class="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center active:bg-gray-100" @click="goBack">
        <view class="i-lucide-chevron-left text-gray-900"></view>
      </view>
      <view class="flex gap-4">
        <view class="i-lucide-share-2 text-gray-900 text-lg"></view>
        <view class="i-lucide-heart text-gray-900 text-lg"></view>
      </view>
    </view>

    <view v-if="isLoading" class="animate-pulse">
      <view class="w-full h-[500rpx] bg-gray-100"></view>
      <view class="p-5">
        <view class="flex gap-4 mb-6">
          <view class="w-20 h-20 bg-gray-100 rounded-2xl"></view>
          <view class="flex-1 py-1">
            <view class="h-6 bg-gray-100 rounded w-3/4 mb-3"></view>
            <view class="h-4 bg-gray-50 rounded w-1/2"></view>
          </view>
        </view>
        <view class="h-4 bg-gray-100 rounded w-full mb-2"></view>
        <view class="h-4 bg-gray-100 rounded w-full mb-2"></view>
        <view class="h-4 bg-gray-100 rounded w-2/3"></view>
      </view>
    </view>

    <view v-else class="animate-fade-in">
      <image :src="gameInfo.cover" class="w-full h-[500rpx] bg-gray-50" mode="aspectFill"></image>

      <view class="px-5 -mt-6 relative z-10">
        <view class="bg-white rounded-3xl p-5 shadow-xl shadow-gray-100/50 border border-gray-50">
          <view class="flex gap-4 mb-6">
            <image :src="gameInfo.cover" class="w-20 h-20 rounded-2xl border border-gray-100 shadow-sm" mode="aspectFill"></image>
            <view class="flex-1 flex flex-col justify-center">
              <text class="text-xl font-black text-gray-900 mb-1">{{ gameInfo.title }}</text>
              <text class="text-xs text-indigo-500 font-bold uppercase tracking-widest">#{{ gameInfo.tag }}</text>
            </view>
          </view>

          <view class="flex justify-between py-4 border-t border-gray-50">
            <view class="flex flex-col items-center flex-1 border-r border-gray-50">
              <text class="text-lg font-black text-gray-900">{{ gameInfo.rating }}</text>
              <text class="text-[10px] text-gray-400 font-bold">评分</text>
            </view>
            <view class="flex flex-col items-center flex-1 border-r border-gray-50">
              <text class="text-lg font-black text-gray-900">{{ gameInfo.downloads }}</text>
              <text class="text-[10px] text-gray-400 font-bold">下载</text>
            </view>
            <view class="flex flex-col items-center flex-1">
              <text class="text-lg font-black text-gray-900">128M</text>
              <text class="text-[10px] text-gray-400 font-bold">大小</text>
            </view>
          </view>
        </view>

        <view class="mt-8" v-if="screenshots.length > 0">
          <text class="text-sm font-black text-gray-900 block mb-4 tracking-tighter">游戏截图</text>
          <scroll-view scroll-x class="whitespace-nowrap w-full" shows-scrollbar="false">
            <view
              v-for="(img, idx) in screenshots"
              :key="idx"
              class="inline-block h-64 mr-3 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100"
              style="min-width: 200rpx;"
            >
              <image
                :src="img"
                class="h-full"
                mode="heightFix"
                @click="previewImage(idx)"
              ></image>
            </view>
          </scroll-view>
        </view>

        <view class="mt-8">
          <text class="text-sm font-black text-gray-900 block mb-4 tracking-tighter">专属福利</text>
          <view class="bg-indigo-50/50 rounded-3xl p-5 border border-indigo-100/50 flex items-center justify-between">
            <view class="flex items-center gap-4">
              <view class="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-sm shadow-indigo-500/30">
                <view class="i-lucide-gift text-white text-xl"></view>
              </view>
              <view>
                <text class="block text-sm font-black text-gray-900 mb-0.5">新手启航礼包</text>
                <text class="text-[10px] text-gray-500 font-bold">包含海量金币与限定道具</text>
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
        </view>

        <view class="mt-8">
          <text class="text-sm font-black text-gray-900 block mb-3 tracking-tighter">关于游戏</text>
          <text class="text-sm text-gray-500 leading-relaxed text-justify">
            {{ gameInfo.full_desc || gameInfo.short_desc || '暂无介绍' }}
          </text>
        </view>
      </view>
    </view>

    <view class="fixed bottom-0 left-0 right-0 p-5 bg-white/90 backdrop-blur-xl border-t border-gray-50 flex gap-4">
      <view class="flex-1 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center active:scale-[0.98] transition-all" @click="handleDownload">
        <text class="text-white font-black text-sm tracking-widest">立即下载</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getGameDetail } from '@/api/game'
import { claimGiftApi } from '@/api/user'

const isLoading = ref(true)
const gameInfo = ref<any>({})
const hasClaimed = ref(false)

// 计算截图数组（兼容数据库存 JSON 字符串或空的情况）
const screenshots = computed(() => {
  if (!gameInfo.value.screenshots) return []
  try {
    return typeof gameInfo.value.screenshots === 'string'
      ? JSON.parse(gameInfo.value.screenshots)
      : gameInfo.value.screenshots
  } catch (e) {
    return []
  }
})

const handleClaimGift = async () => {
  if (hasClaimed.value) return uni.showToast({ title: '已领过了，请前往我的礼包查看', icon: 'none' })
  
  const userInfoStr = uni.getStorageSync('user_info')
  if (!userInfoStr) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => uni.navigateTo({ url: '/pages/login/index' }), 1000)
    return
  }
  
  const user = JSON.parse(userInfoStr)
  uni.showLoading({ title: '领取中...' })
  
  try {
    const res: any = await claimGiftApi({
      user_id: user.id,
      game_id: gameInfo.value.id
    })
    
    uni.hideLoading()
    uni.showToast({ title: '领取成功！', icon: 'success' })
    hasClaimed.value = true
    
    setTimeout(() => {
      uni.showModal({
        title: '您的专属激活码',
        content: res.gift_code,
        confirmText: '复制',
        success: (mRes) => {
          if (mRes.confirm) {
            uni.setClipboardData({ data: res.gift_code })
          }
        }
      })
    }, 1500)
    
  } catch (error) {
    uni.hideLoading()
    if (error && (error as any).code === 400) {
       hasClaimed.value = true
    }
  }
}

onLoad(async (options: any) => {
  if (options.id) {
    try {
      const data = await getGameDetail(options.id)
      gameInfo.value = data
    } catch (e) {
      uni.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      isLoading.value = false
    }
  }
})

const goBack = () => uni.navigateBack()

const previewImage = (current: number) => {
  uni.previewImage({
    urls: screenshots.value,
    current: current
  })
}

const handleDownload = () => {
  uni.vibrateShort({})
  uni.showLoading({ title: '准备下载...' })
  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({ title: '由于是演示版本，暂不支持真实下载', icon: 'none' })
  }, 1500)
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10rpx); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
