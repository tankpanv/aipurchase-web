import { fetchApi } from './fetch'

// 上传图片响应
export interface UploadImageResponse {
  code: number
  message: string
  data: string[] // 返回图片URL数组
}

// 上传文件响应
export interface UploadFileResponse {
  success: boolean
  file_url: string
  file_name: string
  file_size: number
  content_type: string
}

// 删除文件响应
export interface DeleteFileResponse {
  success: boolean
  message: string
}

/**
 * 上传图片
 * @param files 图片文件数组
 * @returns 上传结果，包含图片URL数组
 */
export function uploadImages(files: File[]) {
  const formData = new FormData()
  
  files.forEach(file => {
    formData.append('images', file)
  })
  
  return fetchApi<UploadImageResponse>('/api/upload/image', {
    method: 'POST',
    body: formData,
    headers: {
      // 不要设置Content-Type，让浏览器自动设置
    },
  })
}

/**
 * 上传文件
 * @param file 文件
 * @param directory 目标目录
 * @returns 上传结果，包含文件URL和其他信息
 */
export function uploadFile(file: File, directory?: string) {
  const formData = new FormData()
  formData.append('file', file)
  
  if (directory) {
    formData.append('directory', directory)
  }
  
  return fetchApi<UploadFileResponse>('/api/upload/file', {
    method: 'POST',
    body: formData,
    headers: {
      // 不要设置Content-Type，让浏览器自动设置
    },
  })
}

/**
 * 删除已上传文件
 * @param fileUrl 文件URL路径
 * @returns 删除结果
 */
export function deleteFile(fileUrl: string) {
  // 提取文件路径，去掉域名部分
  const filePath = fileUrl.replace(/^https?:\/\/[^/]+\//, '')
  
  return fetchApi<DeleteFileResponse>(`/api/upload/file/${filePath}`, {
    method: 'DELETE',
  })
} 