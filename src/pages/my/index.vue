<template>
  <view class="min-h-screen bg-[#F8FAFF] flex flex-col items-center justify-center pb-32">
    <view class="w-24 h-24 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-pink-100">
      <text class="text-3xl">👧</text>
    </view>
    <text class="mt-4 text-lg font-black text-indigo-900">个人中心</text>
    <text class="mt-2 text-sm text-indigo-300">功能开发中，敬请期待...</text>
    
    <CustomTabBar :current="1" />
  </view>
</template>

<script setup lang="ts">
import CustomTabBar from '@/components/CustomTabBar.vue'
// 这里暂时不需要逻辑
</script>
