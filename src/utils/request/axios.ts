import axios, { type AxiosResponse } from 'axios'
import { useAuthStore } from '@/store'

const service = axios.create({
  baseURL: 'http://localhost:8080:/api',
})

// service.interceptors.request.use(
//   (config) => {
//     const token = useAuthStore().token
//     if (token)
//       config.headers.Authorization = `Bearer ${token}`
//     return config
//   },
//   (error) => {
//     return Promise.reject(error.response)
//   },
// )
service.interceptors.request.use(
  (config) => {
    config.url = config.url.replace(/^(https?:\/\/[^/]+)?\/(api|mjapi|uploads|openapi)(\/.*)?/, 'http://localhost:8080/api$3') // 统一替换路由并重定向到目标域名

    const token = useAuthStore().token
    if (token)
      config.headers.Authorization = `Bearer ${token}`

    return config
  },
  (error) => {
    return Promise.reject(error.response)
  },
)

service.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    if (response.status === 200)
      return response

    throw new Error(response.status.toString())
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default service
