import { request } from '@/utils/request'

export const getGameList = (params?: { page: number; limit?: number }) => {
  return request({
    url: '/api/games',
    method: 'GET',
    data: params
  })
}

export const getBannerList = () => {
  return request({
    url: '/api/banners',
    method: 'GET'
  })
}

// 获取游戏详情 API
export const getGameDetail = (id: string) => {
  return request({
    url: `/api/games/${id}`,
    method: 'GET'
  })
}

// 搜索游戏 API
export const searchGames = (params: { keyword: string; page?: number; limit?: number }) => {
  return request({
    url: '/api/search',
    method: 'GET',
    data: params
  })
}