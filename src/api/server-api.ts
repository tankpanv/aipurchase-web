import axios from 'axios'
import { useEnvStore, useUserStore } from '@/store'

const userStore = useUserStore()
const envStore = useEnvStore()
export const serverApiUrl = envStore.envInfo.env === 'prod' ? 'http://localhost:8080' : 'http://localhost:8080'
// 创建一个 Axios 实例
export const axiosInstance = axios.create({
  baseURL: serverApiUrl,
})

// 添加请求拦截器
axiosInstance.interceptors.request.use((config) => {
  const token = userStore.userInfo.token ?? ''
  if (token)
    config.headers.Authorization = `Bearer ${token}`

  if (envStore.envInfo.env)
    config.headers['x-env'] = `${envStore.envInfo.env}`
    // 对 OPTIONS 请求也添加 x-env 头部
  if (config.method === 'options' && envStore.envInfo.env)
    config.headers['x-env'] = `${envStore.envInfo.env}`

  return config
}, (error) => {
  return Promise.reject(error)
})

// 创建DefaultApi实例
