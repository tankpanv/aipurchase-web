import { useUserStore } from '@/store'

export const baseSeverUrl = import.meta.env.VITE_API_BASE_URL || ''

// 获取认证头
export const getAuthHeaders = () => {
  const userStore = useUserStore()
  const token = userStore.token || localStorage.getItem('token')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token)
    headers.Authorization = `Bearer ${token}`

  return headers
}
