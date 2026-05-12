<template>
  <view class="min-h-screen bg-gray-50">
    <PageHeader :title="pageTitle" fallback-url="/pages/login/index" />

    <view class="px-6 pt-6 pb-10">
      <view class="bg-white rounded-[32rpx] border border-gray-100 p-5">
        <view class="flex items-center justify-between mb-6 pb-5 border-b border-gray-100">
          <view>
            <text class="block text-xs text-gray-400 font-bold">协议版本</text>
            <text class="block mt-1 text-sm text-gray-900 font-black">v{{ versionText }}</text>
          </view>
          <text class="text-xs text-gray-400 font-bold">最近更新：{{ updatedAt }}</text>
        </view>

        <view v-for="(section, index) in sections" :key="index" class="mb-8 last:mb-0">
          <text class="block text-base font-black text-gray-900 mb-3">{{ index + 1 }}. {{ section.title }}</text>
          <text class="block text-sm text-gray-600 leading-7 whitespace-pre-line">{{ section.content }}</text>
        </view>
      </view>

      <view v-if="confirmMode" class="mt-6 space-y-3">
        <view class="rounded-2xl bg-white border border-gray-100 px-4 py-3">
          <text class="text-xs text-gray-500 font-bold leading-6">为继续使用服务，请确认最新版本的《用户协议》和《隐私政策》。</text>
        </view>
        <view class="w-full h-12 rounded-full bg-gray-900 flex items-center justify-center active:scale-[0.98] transition-transform" @click="handleConfirmAgreement">
          <view v-if="confirmLoading" class="i-lucide-loader-2 animate-spin text-white text-lg"></view>
          <text v-else class="text-white text-sm font-black tracking-widest">我已阅读并确认</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import PageHeader from '@/components/PageHeader.vue'
import { confirmAgreementApi, getAgreementMetaApi } from '@/api/user'
import { getStoredUserInfo, setStoredUserInfo } from '@/utils/auth'

type AgreementType = 'user' | 'privacy'

const currentType = ref<AgreementType>('user')
const confirmMode = ref(false)
const confirmLoading = ref(false)
const updatedAt = ref('2026-05-11')
const versions = ref({
  userVersion: '2026.05',
  privacyVersion: '2026.05'
})

const agreementMap: Record<AgreementType, { title: string; sections: Array<{ title: string; content: string }> }> = {
  user: {
    title: '用户协议',
    sections: [
      {
        title: '协议适用范围',
        content: '本协议适用于你使用本应用提供的游戏浏览、礼包领取、收藏记录、足迹记录和账号服务。你在注册、登录或使用相关功能前，应当认真阅读并理解本协议。'
      },
      {
        title: '账号使用规则',
        content: '你应当妥善保管账号和密码，不得将账号出借、出租、出售或以其他方式转让给第三方使用。因账号保管不当造成的风险和损失，由账号持有人自行承担。'
      },
      {
        title: '服务内容说明',
        content: '平台会持续优化产品体验，并可能根据业务需要调整部分页面、功能或活动内容。相关调整将尽量以合理方式告知用户。'
      },
      {
        title: '用户行为规范',
        content: '你不得利用本平台从事违法违规活动，不得恶意刷取礼包、攻击系统、冒充他人、传播违法信息，或实施任何干扰平台正常运行的行为。'
      },
      {
        title: '免责与责任限制',
        content: '在法律允许的范围内，平台会尽力保证服务稳定，但不对因网络波动、第三方服务异常、不可抗力等导致的中断、延迟或数据丢失承担超出法定范围的责任。'
      }
    ]
  },
  privacy: {
    title: '隐私政策',
    sections: [
      {
        title: '信息收集说明',
        content: '为了完成注册登录、资料展示、礼包领取和账号安全管理，我们可能收集你的账号、昵称、头像、登录状态及必要的设备标识信息。'
      },
      {
        title: '信息使用方式',
        content: '收集到的信息将用于身份识别、登录鉴权、资料展示、服务优化和安全风控，不会在未经授权的情况下超范围使用。'
      },
      {
        title: '信息存储与保护',
        content: '我们会采取合理的技术和管理措施保护你的个人信息，包括但不限于访问控制、密码加密存储、权限隔离等。'
      },
      {
        title: '信息共享与披露',
        content: '除法律法规另有要求，或为完成服务所必需的合法合作场景外，我们不会向无关第三方出售你的个人信息。'
      },
      {
        title: '用户权利',
        content: '你有权访问、修改你的昵称、密码等资料信息。如对隐私处理存在疑问，可通过平台提供的联系方式发起反馈。'
      }
    ]
  }
}

onLoad((options: any) => {
  if (options.type === 'privacy') currentType.value = 'privacy'
  if (options.mode === 'confirm') confirmMode.value = true
  fetchAgreementMeta()
})

const pageTitle = computed(() => agreementMap[currentType.value].title)
const sections = computed(() => agreementMap[currentType.value].sections)
const versionText = computed(() => currentType.value === 'privacy' ? versions.value.privacyVersion : versions.value.userVersion)

const fetchAgreementMeta = async () => {
  try {
    const res: any = await getAgreementMetaApi()
    versions.value = {
      userVersion: res.userVersion,
      privacyVersion: res.privacyVersion
    }
    updatedAt.value = res.updatedAt
  } catch (error) {
    // 使用兜底版本
  }
}

const handleConfirmAgreement = async () => {
  const currentUser = getStoredUserInfo()
  if (!currentUser.token) {
    uni.redirectTo({ url: '/pages/login/index' })
    return
  }

  confirmLoading.value = true
  try {
    const res: any = await confirmAgreementApi({
      userVersion: versions.value.userVersion,
      privacyVersion: versions.value.privacyVersion
    })
    setStoredUserInfo(res)
    uni.showToast({ title: '协议确认成功', icon: 'success' })
    setTimeout(() => {
      uni.switchTab({ url: '/pages/my/index' })
    }, 600)
  } catch (error) {
    // 错误提示由 request 统一处理
  } finally {
    confirmLoading.value = false
  }
}
</script>
