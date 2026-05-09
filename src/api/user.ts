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

// 查询礼包领取状态
export const checkGiftStatusApi = (user_id: number, game_id: number | string) => {
  return request({
    url: `/api/gifts/check?user_id=${user_id}&game_id=${game_id}`,
    method: 'GET'
  })
}

// 获取游戏礼包配置
export const getGiftConfigApi = (game_id: number | string) => {
  return request({
    url: `/api/gifts/config?game_id=${game_id}`,
    method: 'GET'
  })
}
