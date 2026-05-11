const BASE_URL = 'http://localhost:3000'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: any
}

export const request = <T = any>(options: RequestOptions): Promise<T> => {
  return new Promise((resolve, reject) => {
    const userInfoStr = uni.getStorageSync('user_info')
    const token = userInfoStr ? JSON.parse(userInfoStr).token : ''

    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
      },
      success: (res: any) => {
        const { statusCode, data } = res
        if (statusCode >= 200 && statusCode < 300) {
          if (data.code === 0) {
            resolve(data.data)
          } else {
            uni.showToast({ title: data.message || '业务请求失败', icon: 'none' })
            reject(data)
          }
        } else {
          uni.showToast({ title: `服务器错误: ${statusCode}`, icon: 'none' })
          reject(res)
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络请求失败，请检查后端是否启动', icon: 'none' })
        reject(err)
      }
    })
  })
}