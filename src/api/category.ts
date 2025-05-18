import { fetchApi } from './fetch'

/**
 * 商品分类接口
 */

// 分类接口
export interface Category {
  id: number
  name: string
  description?: string
  icon_url?: string
  parent_id?: number
  sort_order?: number
  created_at: string
  updated_at: string
}

// 分类树节点接口
export interface CategoryTreeNode extends Category {
  children?: CategoryTreeNode[]
}

// 分类列表响应
export interface CategoryListResponse {
  code: number
  message: string
  data: {
    list: Category[]
    total: number
  }
}

// 分类树响应
export interface CategoryTreeResponse {
  code: number
  message: string
  data: CategoryTreeNode[]
}

// 通用响应
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// 创建/更新分类请求
export interface CategoryCreateUpdateRequest {
  name: string
  description?: string
  icon_url?: string
  parent_id?: number
  sort_order?: number
}

/**
 * 获取所有商家分类
 * @returns 分类列表
 */
export function getAllMerchantCategories() {
  return fetchApi<CategoryListResponse>('/api/merchant/categories/all', {
    method: 'GET',
  })
}

/**
 * 获取分类树
 * @returns 分类树结构
 */
export function getCategoryTree() {
  return fetchApi<CategoryTreeResponse>('/api/merchant/categories/tree', {
    method: 'GET',
  })
}

/**
 * 获取分类详情
 * @param id 分类ID
 * @returns 分类详情
 */
export function getCategoryDetail(id: number) {
  return fetchApi<ApiResponse<Category>>(`/api/merchant/categories/${id}`, {
    method: 'GET',
  })
}

/**
 * 创建分类
 * @param data 分类数据
 * @returns 创建结果
 */
export function createCategory(data: CategoryCreateUpdateRequest) {
  return fetchApi<ApiResponse<{ category_id: number }>>('/api/merchant/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * 更新分类
 * @param id 分类ID
 * @param data 分类数据
 * @returns 更新结果
 */
export function updateCategory(id: number, data: CategoryCreateUpdateRequest) {
  return fetchApi<ApiResponse<{ category_id: number }>>(`/api/merchant/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * 删除分类
 * @param id 分类ID
 * @returns 删除结果
 */
export function deleteCategory(id: number) {
  return fetchApi<ApiResponse<null>>(`/api/merchant/categories/${id}`, {
    method: 'DELETE',
  })
}

/**
 * 获取商品可用分类
 * @returns 商品可用分类列表
 */
export function getProductCategories() {
  return fetchApi<CategoryListResponse>('/api/merchant/product-categories', {
    method: 'GET',
  })
}
