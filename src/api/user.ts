import { request } from '@/utils/request'

export const loginApi = (data: { username: string; password: string }) => {
  return request({ url: '/api/login', method: 'POST', data })
}

export const claimGiftApi = (data: { user_id: number; game_id: number | string }) => {
  return request({ url: '/api/gifts/claim', method: 'POST', data })
}

export const getMyGiftsApi = (user_id: number) => {
  return request({ url: `/api/my/gifts?user_id=${user_id}`, method: 'GET' })
}

export const toggleFavoriteApi = (data: { user_id: number; game_id: number | string }) => {
  return request({ url: '/api/favorites/toggle', method: 'POST', data })
}

export const checkFavoriteApi = (user_id: number, game_id: number | string) => {
  return request({ url: `/api/favorites/check?user_id=${user_id}&game_id=${game_id}`, method: 'GET' })
}

// 记录足迹
export const addFootprintApi = (data: { user_id: number; game_id: number | string }) => {
  return request({ url: '/api/footprints/add', method: 'POST', data })
}

// 获取统计数据 (收藏、足迹数)
export const getUserStatsApi = (user_id: number) => {
  return request({ url: `/api/my/stats?user_id=${user_id}`, method: 'GET' })
}

// 获取收藏列表
export const getMyFavoritesApi = (user_id: number) => {
  return request({ url: `/api/my/favorites?user_id=${user_id}`, method: 'GET' })
}

// 获取足迹列表
export const getMyFootprintsApi = (user_id: number) => {
  return request({ url: `/api/my/footprints?user_id=${user_id}`, method: 'GET' })
}
