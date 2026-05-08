// src/api/game.ts
import { http } from '@/utils/request'

// 获取首页游戏列表
export const getGameListApi = () => {
  return http.get('/games')
}

// 获取某个游戏的详情
export const getGameDetailApi = (id: string) => {
  return http.get(`/games/${id}`)
}
