// src/utils/request.ts

// 1. 定义基础URL：以后换服务器，只需要改这一个地方
// 这里填入你未来的真实后端地址，目前先用个占位符
const BASE_URL = 'https://api.yourdomain.com/v1'

// 定义请求参数的类型
interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: any
}

// 2. 核心请求函数封装
export const request = <T = any>(options: RequestOptions): Promise<T> => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + options.url,    // 自动拼接基础域名
      method: options.method || 'GET', // 默认使用 GET 请求
      data: options.data,
      header: {
        // 请求拦截：这里可以统一加上 Token（比如用户登录后的凭证）
        // 'Authorization': 'Bearer ' + uni.getStorageSync('token'),
        ...options.header
      },
      success: (res: any) => {
        // 响应拦截：这里假设后端的标准格式是 { code: 200, message: "成功", data: [...] }
        const { code, data, message } = res.data

        if (code === 200) {
          // 请求成功：直接把最核心的 data 扔给页面，剥离掉外壳
          resolve(data as T)
        } else {
          // 业务报错：统一在这里给用户弹窗提示
          uni.showToast({
            title: message || '请求失败，请稍后重试',
            icon: 'none'
          })
          reject(res.data)
        }
      },
      fail: (err) => {
        // 网络层面的报错（如断网、服务器崩溃）
        uni.showToast({
          title: '网络连接失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

// 3. 导出极其简单的快捷方法，供业务代码使用
export const http = {
  get: <T = any>(url: string, data?: any) => request<T>({ url, method: 'GET', data }),
  post: <T = any>(url: string, data?: any) => request<T>({ url, method: 'POST', data }),
}
