import { request } from '@/utils/request'

export const loginApi = (data: { username: string; password: string }) => {
  return request({ url: '/api/login', method: 'POST', data, _skipAuthRefresh: true })
}

export const registerApi = (data: { username: string; password: string; confirmPassword: string }) => {
  return request({ url: '/api/register', method: 'POST', data, _skipAuthRefresh: true })
}

export const getUserProfileApi = () => {
  return request({ url: '/api/user/profile', method: 'GET' })
}

export const getAgreementMetaApi = () => {
  return request({ url: '/api/agreements/meta', method: 'GET' })
}

export const confirmAgreementApi = (data: { userVersion: string; privacyVersion: string }) => {
  return request({ url: '/api/user/agreement/confirm', method: 'POST', data })
}

export const updateNicknameApi = (data: { nickname: string }) => {
  return request({ url: '/api/user/profile/nickname', method: 'PUT', data })
}

export const updatePasswordApi = (data: { oldPassword: string; newPassword: string; confirmPassword: string }) => {
  return request({ url: '/api/user/profile/password', method: 'PUT', data })
}

export const claimGiftApi = (data: { game_id: number | string }) => {
  return request({ url: '/api/gifts/claim', method: 'POST', data })
}

export const getMyGiftsApi = () => {
  return request({ url: '/api/my/gifts', method: 'GET' })
}

export const toggleFavoriteApi = (data: { game_id: number | string }) => {
  return request({ url: '/api/favorites/toggle', method: 'POST', data })
}

export const checkFavoriteApi = (game_id: number | string) => {
  return request({ url: `/api/favorites/check?game_id=${game_id}`, method: 'GET' })
}

// 记录足迹
export const addFootprintApi = (data: { game_id: number | string }) => {
  return request({ url: '/api/footprints/add', method: 'POST', data })
}

// 获取统计数据 (收藏、足迹数)
export const getUserStatsApi = () => {
  return request({ url: '/api/my/stats', method: 'GET' })
}

// 获取收藏列表
export const getMyFavoritesApi = () => {
  return request({ url: '/api/my/favorites', method: 'GET' })
}

// 获取足迹列表
export const getMyFootprintsApi = () => {
  return request({ url: '/api/my/footprints', method: 'GET' })
}
