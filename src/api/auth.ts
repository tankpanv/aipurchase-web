import { fetchApi } from './fetch'

// 用户登录请求接口
export interface LoginRequest {
  user_name: string
  password: string
}

// 用户登录响应接口
export interface LoginResponse {
  user: {
    id: number
    username: string
    name: string
    emergency_contact?: string
  }
  token: string
  refresh_token: string
}

// 用户注册请求接口
export interface RegisterRequest {
  user_name: string
  password: string
  name: string
  emergency_contact?: string
}

// 用户注册响应接口
export interface RegisterResponse {
  user: {
    id: number
    username: string
    name: string
    emergency_contact?: string
  }
  token: string
  refresh_token: string
}

export interface Response<T> {
  code: number
  message: string
  data: T
}

// 管理员登录请求接口
export interface AdminLoginRequest {
  username: string
  password: string
}

// 管理员登录响应接口
export interface AdminLoginResponse {
  code: number
  message: string
  data: {
    token: string
    refreshToken: string
    tokenType: string
    expiresIn: number
  }
}

// 管理员注册请求接口
export interface AdminRegisterRequest {
  username: string
  password: string
  phone: string
  realName: string
  email: string
  verifyCode: string
}

// 管理员注册响应接口
export interface AdminRegisterResponse {
  code: number
  message: string
  data: {
    id: number
    username: string
    realName: string
    email: string
    phone: string
    token: string
    refreshToken: string
  }
}

// 刷新令牌请求接口
export interface RefreshTokenRequest {
  refreshToken: string
}

// 刷新令牌响应接口
export interface RefreshTokenResponse {
  code: number
  message: string
  data: {
    token: string
    refreshToken: string
    expiresIn: number
  }
}

// 重置密码请求接口
export interface ResetPasswordRequest {
  phone: string
  verifyCode: string
  newPassword: string
  confirmPassword: string
}

// 重置密码响应接口
export interface ResetPasswordResponse {
  code: number
  message: string
  data: null
}

// 发送验证码请求接口
export interface SendVerifyCodeRequest {
  phone: string
  type: 'register' | 'reset' // 验证码类型：注册/重置密码
}

// 发送验证码响应接口
export interface SendVerifyCodeResponse {
  code: number
  message: string
  data: {
    expireTime: number // 验证码过期时间（秒）
  }
}

// 用户信息响应接口
export interface UserProfileResponse {
  id: number
  username: string
  name: string
  emergency_contact?: string
}
// 管理员用户信息接口
export interface AdminUserResponse {
  code: number
  message: string
  data: AdminUser
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
  createTime: string
  updateTime: string
}

// 商家注册请求接口
export interface MerchantRegisterRequest {
  name: string
  username: string
  password: string
  phone: string
  email: string
  address: string
  description: string
  categories: string[]
}

// 商家注册响应接口
export interface MerchantRegisterResponse {
  msg: string
  merchant_id: number
}

// 商家登录请求接口
export interface MerchantLoginRequest {
  username: string
  password: string
}

// 商家登录响应接口
export interface MerchantLoginResponse {
  access_token: string
  refresh_token: string
  merchant_id: number
  merchant_name: string
}

// 商家资料响应接口
export interface MerchantProfileResponse {
  id: number
  name: string
  username: string
  phone: string
  email: string
  address: string
  description: string
  logo_url: string
  banner_url: string
  business_license: string
  status: string
  rating: number
  categories: string[]
  created_at: string
  latitude?: number
  longitude?: number
}

// 更新商家资料请求接口
export interface MerchantProfileUpdateRequest {
  name?: string
  phone?: string
  email?: string
  address?: string
  description?: string
  logo_url?: string
  banner_url?: string
  categories?: string[]
  latitude?: number
  longitude?: number
}

// 商家刷新令牌响应接口
export interface MerchantRefreshTokenResponse {
  access_token: string
}

/**
 * 用户登录
 * @param data
 */
export function login(data: LoginRequest) {
  return fetchApi<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * 用户注册
 * @param data
 */
export function register(data: RegisterRequest) {
  return fetchApi<RegisterResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * 管理员登录
 * @param data
 */
export function adminLogin(data: AdminLoginRequest) {
  return fetchApi<AdminLoginResponse>('/api/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * 管理员注册
 * @param data
 */
export function adminRegister(data: AdminRegisterRequest) {
  return fetchApi<AdminUser>('/api/admin/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * 获取管理员信息
 */
export function getAdminInfo() {
  return fetchApi<AdminUserResponse>('/api/admin/auth/info', {
    method: 'GET',

  })
}

/**
 * 刷新令牌
 * @param refreshToken 刷新令牌
 */
export function refreshToken(refreshToken: string) {
  return fetchApi<AdminLoginResponse>('/api/admin/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  })
}

/**
 * 管理员登出
 */
export function adminLogout() {
  return fetchApi('/api/admin/auth/logout', {
    method: 'POST',
  })
}

/**
 * 重置密码
 * @param data 重置密码信息
 * @returns Promise<ResetPasswordResponse>
 */
export function resetPassword(data: ResetPasswordRequest) {
  return fetchApi<ResetPasswordResponse>('/api/admin/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * 发送验证码
 * @param data 发送验证码请求信息
 * @returns Promise<SendVerifyCodeResponse>
 */
export function sendVerifyCode(data: SendVerifyCodeRequest) {
  return fetchApi<SendVerifyCodeResponse>('/api/admin/auth/verify-code', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * 获取用户信息
 */
export function getUserProfile() {
  return fetchApi<UserProfileResponse>('/api/auth/profile', {
    method: 'GET',
  })
}

/**
 * 商家注册
 * @param data 商家注册信息
 */
export function merchantRegister(data: MerchantRegisterRequest) {
  return fetchApi<MerchantRegisterResponse>('/api/merchant/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * 商家登录
 * @param data 商家登录信息
 */
export function merchantLogin(data: MerchantLoginRequest) {
  return fetchApi<MerchantLoginResponse>('/api/merchant/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * 获取商家资料
 */
export function getMerchantProfile() {
  return fetchApi<MerchantProfileResponse>('/api/merchant/profile', {
    method: 'GET',
  })
}

/**
 * 更新商家资料
 * @param data 更新的商家资料
 */
export function updateMerchantProfile(data: MerchantProfileUpdateRequest) {
  return fetchApi<{ message: string }>('/api/merchant/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * 获取指定商家信息
 * @param id 商家ID
 */
export function getMerchantInfo(id: number) {
  return fetchApi<MerchantProfileResponse>(`/api/merchant/info/${id}`, {
    method: 'GET',
  })
}

/**
 * 更新指定商家信息
 * @param id 商家ID
 * @param data 更新的商家信息
 */
export function updateMerchantInfo(id: number, data: any) {
  return fetchApi<{ message: string }>(`/api/merchant/info/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * 刷新商家令牌
 * @param refreshToken 刷新令牌
 */
export function refreshMerchantToken(refreshToken: string) {
  return fetchApi<MerchantRefreshTokenResponse>('/api/merchant/refresh', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
  })
}
