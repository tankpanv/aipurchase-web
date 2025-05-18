import { fetchApi } from '../fetch'
import type { PageResponse } from './types'

export interface User {
  id: number
  username: string
  email: string
  role: string
  status: string
  createdAt: string
}

export interface UserListParams {
  page: number
  pageSize: number
  search?: string
  role?: string
  status?: string
}

export interface CreateUserParams {
  username: string
  email: string
  password: string
  role: string
}

export interface UpdateUserParams {
  id: number
  username?: string
  email?: string
  role?: string
  status?: string
}

export interface ChangePasswordParams {
  id: number
  newPassword: string
}

/**
 * 获取用户列表
 */
export function getUsers(params: UserListParams) {
  return fetchApi<PageResponse<User>>('/api/admin/user/list', {
    method: 'GET',
    params: {
      pageNum: params.page.toString(),
      pageSize: params.pageSize.toString(),
      search: params.search,
      role: params.role,
      status: params.status,
    },
  })
}

/**
 * 创建用户
 */
export function createUser(params: CreateUserParams) {
  return fetchApi<void>('/api/admin/user/create', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

/**
 * 更新用户
 */
export function updateUser(params: UpdateUserParams) {
  return fetchApi<void>('/api/admin/user/update', {
    method: 'PUT',
    body: JSON.stringify(params),
  })
}

/**
 * 删除用户
 */
export function deleteUser(id: number) {
  return fetchApi<void>(`/api/admin/user/${id}`, {
    method: 'DELETE',
  })
}

/**
 * 修改密码
 */
export function changeUserPassword(params: ChangePasswordParams) {
  return fetchApi<void>('/api/admin/user/change-password', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

/**
 * 注册用户
 */
export function register(params: CreateUserParams) {
  return fetchApi<void>('/api/admin/user/register', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}
