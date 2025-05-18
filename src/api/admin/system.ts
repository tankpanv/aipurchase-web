import { fetchApi } from '../fetch'

// 系统配置接口
export interface SystemConfig {
  id: number
  configKey: string
  configValue: string
  description: string
  createTime: string
  updateTime: string
}

// 系统日志接口
export interface SystemLog {
  id: number
  userId: number
  username: string
  operation: string
  method: string
  params: string
  ip: string
  createTime: string
}

// 分页响应接口
export interface PageResponse<T> {
  code: number
  message: string
  data: {
    pageNum: number
    pageSize: number
    totalPage: number
    total: number
    list: T[]
  }
}

/**
 * 获取系统配置列表
 * @param params 分页参数
 */
export function getSystemConfigs(params: { pageNum: number; pageSize: number }) {
  return fetchApi<PageResponse<SystemConfig>>('/api/admin/system/config/list', {
    method: 'GET',
    params: {
      pageNum: params.pageNum.toString(),
      pageSize: params.pageSize.toString(),
    },
  })
}

// 为了保持向后兼容，保留原有的getSystemConfigList函数
export const getSystemConfigList = getSystemConfigs

/**
 * 更新系统配置
 * @param id 配置ID
 * @param data 配置信息
 */
export function updateSystemConfig(id: number, data: Partial<SystemConfig>) {
  return fetchApi<SystemConfig>(`/api/admin/system/config/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * 获取系统日志列表
 * @param params 分页参数
 */
export function getSystemLogs(params: { pageNum: number; pageSize: number }) {
  return fetchApi<PageResponse<SystemLog>>('/api/admin/system/log/list', {
    method: 'GET',
    params: {
      pageNum: params.pageNum.toString(),
      pageSize: params.pageSize.toString(),
    },
  })
}

// 为了保持向后兼容，保留原有的getSystemLogList函数
export const getSystemLogList = getSystemLogs

/**
 * 清除系统日志
 */
export function clearSystemLogs() {
  return fetchApi('/api/admin/system/log/clear', {
    method: 'POST',
  })
}

/**
 * 获取系统状态
 */
export function getSystemStatus() {
  return fetchApi('/api/admin/system/status', {
    method: 'GET',
  })
}

/**
 * 获取系统资源使用情况
 */
export function getSystemResources() {
  return fetchApi('/api/admin/system/resources', {
    method: 'GET',
  })
}
