import { fetchApi } from './fetch'
import type { UploadFileInfo } from 'naive-ui'

// 修改接口返回类型定义
interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// 制度文件类型定义
export interface SystemDocument {
  id: number
  sequence: number      // 序号
  file_name: string    // 文件名称
  file_code: string    // 文件编号
  file_url: string     // 文件下载地址
  created_at: string   // 创建时间
  updated_at: string   // 更新时间
}

interface SystemDocumentsResponse {
  items: SystemDocument[]
  total: number
  current_page: number
  per_page: number
}

// 上传参数类型
export interface UploadParams {
  file_name: string
  file_code: string
}

// 修改获取系统文档列表的接口参数类型
interface SystemDocumentsParams {
  page?: number
  per_page?: number
  keyword?: string
}

// 获取制度文件列表
export function getSystemDocuments(params?: SystemDocumentsParams) {
  return fetchApi('/api/system/documents', {
    method: 'GET',
    params,
  })
}

// 上传制度文件
export async function uploadSystemDocument(file: File, params: {
  file_name: string
  file_code: string
}) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('file_name', params.file_name)
  formData.append('file_code', params.file_code)

  return fetchApi<ApiResponse<SystemDocument>>('/api/system/documents', {
    method: 'POST',
    body: formData,
  })
}

// 更新制度文件信息
export async function updateSystemDocument(id: number, params: Partial<SystemDocument>) {
  return fetchApi<{
    code: number
    message: string
    data: SystemDocument
  }>(`/api/system/documents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(params),
  })
}

// 删除制度文件
export async function deleteSystemDocument(id: number) {
  return fetchApi<{
    code: number
    message: string
  }>(`/api/system/documents/${id}`, {
    method: 'DELETE',
  })
}

// 下载制度文件
export async function downloadSystemDocument(id: number) {
  return fetchApi<Blob>(`/api/system/documents/${id}/download`, {
    method: 'GET',
    responseType: 'blob',
  })
} 