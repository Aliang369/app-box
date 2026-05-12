export interface StoredUserInfo {
  token?: string
  refreshToken?: string
  id?: number
  username?: string
  nickname?: string
  avatar?: string
  agreement_status?: {
    userVersion?: string
    privacyVersion?: string
    currentUserVersion?: string
    currentPrivacyVersion?: string
    needConfirm?: boolean
  }
  [key: string]: any
}

export const getStoredUserInfo = (): StoredUserInfo => {
  const raw = uni.getStorageSync('user_info')
  if (!raw) return {}
  try {
    return JSON.parse(raw)
  } catch (error) {
    return {}
  }
}

export const setStoredUserInfo = (payload: StoredUserInfo) => {
  const current = getStoredUserInfo()
  uni.setStorageSync('user_info', JSON.stringify({
    ...current,
    ...payload
  }))
}

export const clearStoredUserInfo = () => {
  uni.removeStorageSync('user_info')
}

export const redirectToLogin = (reason?: string) => {
  clearStoredUserInfo()
  if (reason) {
    uni.showToast({ title: reason, icon: 'none' })
  }

  const pages = getCurrentPages()
  const currentRoute = pages[pages.length - 1]?.route || ''
  if (currentRoute === 'pages/login/index') return

  uni.navigateTo({ url: '/pages/login/index' })
}
