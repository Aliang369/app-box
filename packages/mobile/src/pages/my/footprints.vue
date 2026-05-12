<template>
  <view class="min-h-screen bg-gray-50 pb-10">
    <PageHeader title="最近浏览" fallback-url="/pages/my/index" />

    <view v-if="loading" class="flex justify-center py-20 px-6">
      <view class="i-lucide-loader-2 animate-spin text-gray-300 text-3xl"></view>
    </view>

    <block v-else-if="list.length > 0">
      <view class="px-6 pt-5 space-y-4">
        <view
          v-for="(item, index) in list" :key="index"
          class="bg-white rounded-[32rpx] border border-gray-100 p-4 flex gap-4 items-center active:bg-gray-50 transition-colors"
          @click="goToDetail(item.id)"
        >
          <image :src="item.cover" class="w-20 h-20 rounded-2xl bg-gray-100 object-cover" />
          <view class="flex-1">
            <text class="text-base font-black text-gray-900 block mb-1">{{ item.title }}</text>
            <view class="px-2 py-0.5 bg-indigo-50 text-indigo-500 rounded inline-block text-[10px] font-bold mb-2">
              {{ item.tag || '热门推荐' }}
            </view>
            <text v-if="item.view_time" class="block text-[10px] text-gray-400">上次查看: {{ item.view_time.substring(0, 10) }}</text>
          </view>
          <view class="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
            <view class="i-lucide-chevron-right text-gray-400"></view>
          </view>
        </view>
      </view>
    </block>

    <view v-else class="px-6 pt-20 flex flex-col items-center justify-center">
      <view class="w-18 h-18 bg-white rounded-full flex items-center justify-center border border-gray-100 mb-5">
        <view class="i-lucide-history text-gray-300 text-3xl"></view>
      </view>
      <text class="text-base text-gray-900 font-black mb-2">还没有浏览记录</text>
      <text class="text-xs text-gray-400 font-bold">浏览过的游戏会出现在这里</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getMyFootprintsApi } from '@/api/user'
import PageHeader from '@/components/PageHeader.vue'

const loading = ref(true)
const list = ref<any[]>([])

onLoad(async () => {
  const userInfoStr = uni.getStorageSync('user_info')
  if (!userInfoStr) return loading.value = false
  try {
    const res: any = await getMyFootprintsApi()
    list.value = res || []
  } catch (e) {} finally {
    loading.value = false
  }
})

const goToDetail = (id: number) => uni.navigateTo({ url: `/pages/detail/index?id=${id}` })
</script>
