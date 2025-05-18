import { useUserStore } from '@/store'

// 获取认证头
export const getAuthHeaders = () => {
  const userStore = useUserStore()
  const token = userStore.userInfo.token || localStorage.getItem('token')
  
  const headers = {
    'Content-Type': 'application/json'
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return headers
} 