import { request } from '@/utils/request'

export const getGameList = (params?: { page: number; limit?: number }) => {
  return request({
    url: '/api/games',
    method: 'GET',
    data: params
  })
}