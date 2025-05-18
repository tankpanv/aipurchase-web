import { refreshMerchantToken } from '@/api/auth'
import { useUserStore } from '@/store'
import { useMessage } from 'naive-ui'
import router from '@/router'

// 获取当前时间戳（秒）
function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000)
}

// 解析JWT令牌并返回负载
function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    console.error('Token解析失败:', e)
    return null
  }
}

// 检查令牌是否即将过期
function isTokenExpiringSoon(token: string, expiryThreshold = 300): boolean {
  if (!token) return true

  try {
    const payload = parseJwt(token)
    if (!payload || !payload.exp) return true

    const expiryTime = payload.exp
    const currentTime = getCurrentTimestamp()
    
    // 如果令牌在5分钟内过期，返回true
    return expiryTime - currentTime < expiryThreshold
  } catch (e) {
    console.error('检查令牌失败:', e)
    return true
  }
}

// 检查令牌是否已经过期
export function isTokenExpired(token: string): boolean {
  if (!token) return true

  try {
    const payload = parseJwt(token)
    if (!payload || !payload.exp) return true

    const expiryTime = payload.exp
    const currentTime = getCurrentTimestamp()
    
    return currentTime >= expiryTime
  } catch (e) {
    console.error('检查令牌失败:', e)
    return true
  }
}

// 验证令牌并处理过期情况
export async function validateToken(): Promise<boolean> {
  const userStore = useUserStore()
  const token = userStore.userInfo.token
  const refreshToken = userStore.userInfo.refresh_token
  
  // 如果没有令牌，认为未登录
  if (!token || !refreshToken) {
    return false
  }
  
  // 如果令牌已过期
  if (isTokenExpired(token)) {
    try {
      // 尝试使用刷新令牌获取新令牌
      const response = await refreshMerchantToken(refreshToken)
      
      if (response && response.access_token) {
        // 更新令牌
        userStore.updateUserInfo({ 
          token: response.access_token 
        })
        return true
      } else {
        // 刷新失败，需要重新登录
        handleTokenExpiration()
        return false
      }
    } catch (error) {
      // 刷新令牌请求失败
      handleTokenExpiration()
      return false
    }
  }
  
  // 如果令牌即将过期，静默刷新
  if (isTokenExpiringSoon(token)) {
    try {
      const response = await refreshMerchantToken(refreshToken)
      
      if (response && response.access_token) {
        userStore.updateUserInfo({ 
          token: response.access_token 
        })
      }
    } catch (error) {
      console.error('静默刷新令牌失败:', error)
    }
  }
  
  return true
}

// 处理令牌过期情况
export function handleTokenExpiration(): void {
  const userStore = useUserStore()
  
  // 清除用户信息
  userStore.resetUserInfo()
  
  // 使用全局消息通知用户（如果可用）
  if (window.$message) {
    window.$message.warning('您的登录状态已过期，请重新登录')
  }
  
  // 重定向到登录页面
  if (router.currentRoute.value.path !== '/merchant/login') {
    router.push({
      path: '/merchant/login',
      query: { redirect: router.currentRoute.value.fullPath }
    })
  }
}

// 创建一个全局变量，用于保存全局消息实例
declare global {
  interface Window {
    $message: ReturnType<typeof useMessage> | null
    $dialog: any
    $notification: any
    $loadingBar: any
  }
}

// 不需要在这里初始化window.$message，因为已经在NaiveProvider中处理了
// window.$message = null 