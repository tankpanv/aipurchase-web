import axios from 'axios'
import { baseSeverUrl } from './server'
import { useUserStore } from '@/store'
import { handleTokenExpiration } from '@/utils/tokenValidator'

/**
 * 基础fetch API封装，用于调用接口
 * @param url 请求地址
 * @param options 请求配置
 * @returns Promise<T>
 */
export async function fetchApi<T>(
  url: string,
  options: RequestInit & { timeout?: number } = {},
): Promise<T> {
  const userStore = useUserStore()
  const token = userStore.userInfo?.token

  // 默认配置
  const defaultOptions: RequestInit = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }

  // 检查是否为FormData类型（文件上传）
  const isFormData = options.body instanceof FormData

  // 合并配置
  const mergedOptions: RequestInit = {
    ...defaultOptions,
    ...options,
    headers: {
      // 如果是FormData，不设置Content-Type，让浏览器自动设置
      ...(isFormData ? {} : defaultOptions.headers),
      // 合并自定义headers，但如果是FormData且设置了Content-Type，需要移除它
      ...(isFormData
        ? Object.entries(options.headers || {})
          .filter(([key]) => key.toLowerCase() !== 'content-type')
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
        : options.headers),
      // 如果有token，添加到请求头
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }

  // 构建完整URL
  const fullUrl = url.startsWith('http') ? url : `${baseSeverUrl}${url}`

  try {
    // 使用axios而非fetch，更好的兼容性和错误处理
    const response = await axios({
      url: fullUrl,
      method: mergedOptions.method,
      headers: mergedOptions.headers as Record<string, string>,
      data: isFormData ? options.body : mergedOptions.body,
      timeout: options.timeout || 30000, // 默认30秒超时
    })

    // 处理HTTP错误
    if (response.status >= 400)
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`)

    return response.data
  }
  catch (error: any) {
    // 处理HTTP错误、网络错误等
    if (error.response) {
      // 后端返回错误
      const response = error.response

      // 如果是401未授权，可能是token过期
      if (response.status === 401) {
        // 使用tokenValidator处理token过期
        handleTokenExpiration()
      }

      throw new Error(response.data?.message || response.statusText || '请求失败')
    }
    else if (error.request) {
      // 请求发送成功，但没有收到响应
      throw new Error('网络请求失败，服务器无响应')
    }
    else {
      // 请求设置过程中发生错误
      throw new Error(error.message || '请求错误')
    }
  }
}
