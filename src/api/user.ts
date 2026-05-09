import { request } from '@/utils/request'

// 用户登录/自动注册接口
export const loginApi = (data: { username: string; password: string }) => {
  return request({
    url: '/api/login',
    method: 'POST',
    data
  })
}

// 领取礼包
export const claimGiftApi = (data: { user_id: number; game_id: number | string }) => {
  return request({
    url: '/api/gifts/claim',
    method: 'POST',
    data
  })
}

// 获取我的礼包列表
export const getMyGiftsApi = (user_id: number) => {
  return request({
    url: `/api/my/gifts?user_id=${user_id}`,
    method: 'GET'
  })
}
