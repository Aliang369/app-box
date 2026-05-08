<template>
  <view class="min-h-screen bg-[#F9FAFB] pb-10">
    <view class="sticky top-0 z-30 pt-12 pb-4 px-5 bg-white border-b border-gray-100 flex items-center">
      <view class="i-lucide-arrow-left text-gray-900 text-xl" @click="goBack"></view>
      <text class="ml-4 text-lg font-bold text-gray-900">我的礼包</text>
    </view>

    <view class="px-5 mt-6">
      <view v-if="isFirstLoading">
         <view v-for="i in 4" :key="i" class="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm mb-4 animate-pulse h-28"></view>
      </view>

      <view v-else>
        <view v-if="gifts.length === 0" class="flex flex-col items-center justify-center pt-20">
          <view class="i-lucide-inbox text-4xl text-gray-200 mb-4"></view>
          <text class="text-sm text-gray-400">暂未领取任何礼包</text>
        </view>
        <view v-else v-for="item in gifts" :key="item.id" class="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-4 animate-fade-in">
          <view class="flex items-center justify-between mb-3">
             <text class="text-[15px] font-bold text-gray-900">{{ item.title }}</text>
             <text class="text-[10px] text-gray-400">{{ item.date }}</text>
          </view>
          <view class="flex items-center justify-between bg-gray-50 rounded-xl p-3 border border-gray-100/50">
             <text class="text-lg font-mono font-bold text-indigo-600 tracking-wider">{{ item.code }}</text>
             <view class="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-100 active:bg-gray-50" @click="copyCode(item.code)">
               <view class="i-lucide-copy text-gray-500 text-sm"></view>
             </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app'

const goBack = () => uni.navigateBack()
const copyCode = (code: string) => {
  uni.setClipboardData({ data: code, success: () => uni.showToast({ title: '复制成功', icon: 'none' }) })
}

const gifts = ref<any[]>([])
const isFirstLoading = ref(true)

const fetchData = () => {
  setTimeout(() => {
    gifts.value = [
      { id: '1', title: '《星穹幻轨》新手十连抽', date: '2026.05.08', code: 'STAR2026XQ' },
      { id: '2', title: '《元气小骑士》金币补给', date: '2026.05.07', code: 'YQKNIGHT99' }
    ]
    isFirstLoading.value = false
    uni.stopPullDownRefresh()
  }, 600)
}

onLoad(() => fetchData())
onPullDownRefresh(() => { isFirstLoading.value = true; fetchData() })
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
</style>