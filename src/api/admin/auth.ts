import { fetchApi } from '../fetch'

// 管理员登录参数接口
export interface AdminLoginParam {
  username: string
  password: string
}

// 管理员注册参数接口
export interface AdminRegisterParam {
  username: string
  password: string
  realName?: string
  phone?: string
  email?: string
}

// JWT响应结果接口
export interface JwtResponse {
  token: string
  refreshToken: string
  tokenType: string
  expiresIn: number
}

// 管理员用户信息接口
export interface AdminUser {
  id: number
  username: string
  realName: string
  phone: string
  email: string
  avatar: string
  status: number
  lastLoginIp: string
  lastLoginTime: string
  createTime: string
  updateTime: string
}

/**
 * 管理员登录
 * @param data 登录参数
 */
export function adminLogin(data: AdminLoginParam) {
  return fetchApi<JwtResponse>('/api/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

/**
 * 管理员注册
 * @param data 注册参数
 */
export function adminRegister(data: AdminRegisterParam) {
  return fetchApi<AdminUser>('/api/admin/auth/register', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

/**
 * 刷新令牌
 * @param refreshToken 刷新令牌
 */
export function refreshToken(refreshToken: string) {
  return fetchApi<JwtResponse>('/api/admin/auth/refresh', {
    method: 'POST',
    params: { refreshToken }
  })
}

/**
 * 获取当前管理员信息
 */
export function getAdminInfo() {
  return fetchApi<AdminUser>('/api/admin/auth/info', {
    method: 'GET'
  })
}

/**
 * 管理员退出登录
 */
export function adminLogout() {
  return fetchApi('/api/admin/auth/logout', {
    method: 'POST'
  })
} 