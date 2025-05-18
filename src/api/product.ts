import { fetchApi } from './fetch'

// 商品类型
export interface Product {
  id: number
  name: string
  description: string
  price: number
  original_price: number
  stock: number
  unit: string
  product_type: string
  status: string
  is_featured: boolean
  main_image_url: string
  merchant_id: number
  merchant_name: string
  merchant_address: string
  merchant_latitude: number
  merchant_longitude: number
  discount?: string
  tags?: string[]
  created_at: string
  published_at?: string
}

// 商品详情
export interface ProductDetail extends Product {
  merchant_info: {
    id: number
    name: string
    address: string
    latitude: number
    longitude: number
    phone: string
    logo_url: string
  }
  categories: {
    id: number
    name: string
    description: string
    icon_url: string
  }[]
  images: {
    id: number
    image_url: string
    is_main: boolean
    sort_order: number
  }[]
  detail_images: string[]
  flavor?: string[]
  spec?: string
  tag?: string[]
}

// 商品列表响应
export interface ProductListResponse {
  code: number
  message: string
  data: {
    items: Product[]
    total: number
    pages: number
    current_page: number
  }
}

// 商品详情响应
export interface ProductDetailResponse {
  code: number
  message: string
  data: ProductDetail
}

// 商品创建/更新请求
export interface ProductCreateUpdateRequest {
  name: string
  description: string
  price: number
  original_price?: number
  stock: number
  unit: string
  product_type: string
  status: string
  is_featured?: boolean
  category_ids?: number[]
  tags?: string[]
  images?: {
    image_url: string
    is_main: boolean
    sort_order: number
  }[]
  detail_images?: string[]
  flavor?: string[]
  spec?: string
  tag?: string[]
  discount?: string
}

// 通用响应
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// 获取商品列表
export function getProductList(params: {
  merchant_id?: number
  page?: number
  per_page?: number
  category_id?: number
  status?: string
  is_featured?: boolean
  query?: string
  product_type?: string
}) {
  const queryParams = new URLSearchParams()
  
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      queryParams.append(key, String(value))
    }
  }
  
  return fetchApi<ProductListResponse>(`/api/product/?${queryParams.toString()}`, {
    method: 'GET',
  })
}

// 获取商品详情
export function getProductDetail(id: number) {
  return fetchApi<ProductDetailResponse>(`/api/product/${id}`, {
    method: 'GET',
  })
}

// 创建商品
export function createProduct(data: ProductCreateUpdateRequest) {
  return fetchApi<ApiResponse<{ product_id: number }>>('/api/product/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// 更新商品
export function updateProduct(id: number, data: ProductCreateUpdateRequest) {
  return fetchApi<ApiResponse<{ product_id: number }>>(`/api/product/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

// 删除商品
export function deleteProduct(id: number) {
  return fetchApi<ApiResponse<null>>(`/api/product/${id}`, {
    method: 'DELETE',
  })
}

// 更新商品状态
export function updateProductStatus(id: number, status: string) {
  return fetchApi<ApiResponse<{ status: string }>>(`/api/product/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })
}

// 添加商品图片
export function addProductImages(id: number, images: { image_url: string; is_main: boolean; sort_order: number }[]) {
  return fetchApi<ApiResponse<{ id: number; image_url: string; is_main: boolean; sort_order: number }[]>>(
    `/api/product/${id}/images`,
    {
      method: 'POST',
      body: JSON.stringify({ images }),
    }
  )
} 