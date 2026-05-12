import { clearStoredUserInfo, getStoredUserInfo, setStoredUserInfo, redirectToLogin } from './auth'

const BASE_URL = 'http://localhost:3000'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: any
  _skipAuthRefresh?: boolean
}

let refreshingPromise: Promise<any> | null = null

const refreshTokenRequest = async () => {
  const userInfo = getStoredUserInfo()
  if (!userInfo.refreshToken) throw new Error('missing refresh token')

  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + '/api/auth/refresh',
      method: 'POST',
      data: { refreshToken: userInfo.refreshToken },
      header: {
        'Content-Type': 'application/json'
      },
      success: (res: any) => {
        const { statusCode, data } = res
        if (statusCode >= 200 && statusCode < 300 && data.code === 0) {
          const payload = {
            token: data.data.token,
            refreshToken: data.data.refreshToken,
            ...data.data.userInfo
          }
          setStoredUserInfo(payload)
          resolve(payload)
          return
        }
        reject(data)
      },
      fail: reject
    })
  })
}

const ensureRefreshedToken = async () => {
  if (!refreshingPromise) {
    refreshingPromise = refreshTokenRequest().finally(() => {
      refreshingPromise = null
    })
  }
  return refreshingPromise
}

export const request = <T = any>(options: RequestOptions): Promise<T> => {
  return new Promise((resolve, reject) => {
    const userInfo = getStoredUserInfo()
    const token = userInfo.token || ''
    const isAuthFormRequest = options.url === '/api/login' || options.url === '/api/register'

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
          } else if ((statusCode === 403 || data.code === 403) && data.forceLogout) {
            clearStoredUserInfo()
            redirectToLogin(data.message || '账号状态异常，请重新登录')
            reject(data)
          } else if (statusCode === 401 || data.code === 401) {
            if (isAuthFormRequest) {
              uni.showToast({ title: '当前输入账号或密码错误', icon: 'none' })
              reject(data)
              return
            }

            if (!options._skipAuthRefresh) {
              ensureRefreshedToken()
                .then(() => request<T>({ ...options, _skipAuthRefresh: true }).then(resolve).catch(reject))
                .catch(() => {
                  clearStoredUserInfo()
                  redirectToLogin('登录状态已失效，请重新登录')
                  reject(data)
                })
              return
            }

            clearStoredUserInfo()
            redirectToLogin('登录状态已失效，请重新登录')
            reject(data)
          } else {
            uni.showToast({ title: data.message || '业务请求失败', icon: 'none' })
            reject(data)
          }
        } else if (statusCode === 401 && !options._skipAuthRefresh) {
          ensureRefreshedToken()
            .then(() => request<T>({ ...options, _skipAuthRefresh: true }).then(resolve).catch(reject))
            .catch(() => {
              clearStoredUserInfo()
              redirectToLogin('登录状态已失效，请重新登录')
              reject(res)
            })
        } else if (statusCode === 401) {
          if (isAuthFormRequest) {
            uni.showToast({ title: '当前输入账号或密码错误', icon: 'none' })
            reject(res)
            return
          }
          clearStoredUserInfo()
          redirectToLogin('登录状态已失效，请重新登录')
          reject(res)
        } else if (statusCode === 403 && data?.forceLogout) {
          clearStoredUserInfo()
          redirectToLogin(data?.message || '账号状态异常，请重新登录')
          reject(res)
        } else if (statusCode === 403) {
          uni.showToast({ title: data?.message || '当前操作不可用', icon: 'none' })
          reject(res)
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
