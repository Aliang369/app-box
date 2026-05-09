import { request } from '@/utils/request'

// 用户登录/自动注册接口
export const loginApi = (data: { username: string; password: string }) => {
  return request({
    url: '/api/login',
    method: 'POST',
    data
  })
}
