import { fetchApi } from './fetch'

/**
 * 订单管理相关API
 */

// 订单状态枚举
export type OrderStatus =
  'pending_payment' | // 待付款
  'pending_delivery' | // 待发货
  'pending_receipt' | // 待收货
  'pending_review' | // 待评价
  'completed' | // 已完成
  'cancelled' | // 已取消
  'refunding' | // 退款中
  'refunded' // 已退款

// 产品信息
export interface ProductInfo {
  id: number
  name: string
  description: string
  price: number
  original_price: number
  main_image_url: string
  stock: number
  sales_count: number
  product_type: string
  status: string
}

// 地址信息
export interface AddressInfo {
  id: number
  province: string
  city: string
  district: string
  detail: string
  recipient_name: string
  recipient_phone: string
}

// 订单项
export interface OrderItem {
  id: number
  order_id: number
  quantity: number
  price: number
  subtotal: number
  created_at: string
  updated_at: string
  product: ProductInfo
}

// 订单信息
export interface Order {
  id: number
  order_no: string // 订单编号
  user_id: number
  status: OrderStatus
  merchant_total: number // 商家实收金额
  total_amount: number // 订单总金额
  created_at: string
  updated_at: string
  payment_time: string | null
  shipping_time: string | null
  receipt_time: string | null
  items: OrderItem[] // 订单商品
  address: AddressInfo // 收货地址
}

// 订单列表请求参数
export interface OrderListParams {
  page?: number
  per_page?: number
  status?: string
  start_date?: string
  end_date?: string
  keyword?: string
}

// 订单列表响应类型
export interface OrderListResponse {
  code: number
  message: string
  data: {
    items: Order[]
    total: number
    pages: number
    current_page: number
  }
}

// 订单详情响应
export interface OrderDetailResponse {
  code: number
  message: string
  data: Order
}

// 通用响应
export interface CommonResponse {
  code: number
  message: string
  data?: any
}

// 订单状态分布
export interface StatusDistribution {
  pending_payment: number
  pending_delivery: number
  pending_receipt: number
  pending_review: number
  completed: number
  cancelled: number
  refunding: number
  refunded: number
}

// 店铺概况
export interface ShopSummary {
  total_orders: number
  total_customers: number
  customer_repeat_rate: number
  shop_rating: number
}

// 商品统计
export interface ProductStatistics {
  total_products: number
  published_products: number
  sold_out_products: number
  featured_products: number
  top_selling_products: TopSellingProduct[]
}

// 商品销售排行（取代浏览排行）
export interface TopSellingProduct {
  id: number
  name: string
  price: number
  image_url: string
  sold_count: number
}

// 销售周期数据
export interface PeriodSales {
  year: number
  month: number
  sales: number
}

// 日销售数据
export interface DailySales {
  date: string
  sales: number
}

// 热销商品
export interface TopProduct {
  id: number
  name: string
  quantity_sold: number
  total_sales: number
}

// 订单统计
export interface OrderStatistics {
  order_count: number
  total_sales: number
  period_sales: PeriodSales[]
  daily_sales?: DailySales[] // 日销售数据（可选）
  top_products: TopProduct[]
  status_distribution: StatusDistribution
}

// 订单统计响应类型
export interface OrderStatsResponse {
  code: number
  message: string
  data: {
    order_count: number
    total_sales: number
    period_sales: PeriodSales[]
    daily_sales?: DailySales[] // 日销售数据（可选）
    top_products: TopProduct[]
    status_distribution: StatusDistribution
    date_range: {
      start: string
      end: string
    }
  }
}

// 商家综合统计响应类型
export interface MerchantStatsResponse {
  code: number
  message: string
  data: {
    shop_summary: ShopSummary
    product_statistics: ProductStatistics
    order_statistics: OrderStatistics
    date_range: {
      start: string
      end: string
    }
  }
}

/**
 * 获取订单列表
 * @param params 查询参数
 * @returns 订单列表数据
 */
export function getOrderList(params: OrderListParams) {
  // 使用URLSearchParams构建查询参数
  const queryParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined)
      queryParams.append(key, String(value))
  }

  return fetchApi<OrderListResponse>(`/api/merchant/orders?${queryParams.toString()}`, {
    method: 'GET',
  })
}

/**
 * 获取订单详情
 * @param orderNo 订单编号
 * @returns 订单详情数据
 */
export function getOrderDetail(orderNo: string) {
  return fetchApi<OrderDetailResponse>(`/api/merchant/orders/${orderNo}`, {
    method: 'GET',
  })
}

/**
 * 更新订单状态
 * @param orderNo 订单编号
 * @param data 更新数据
 * @returns 更新结果
 */
export function updateOrderStatus(orderNo: string, data: { status: string; tracking_number?: string }) {
  return fetchApi<CommonResponse>(`/api/merchant/orders/${orderNo}/status`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * 更新物流信息
 * @param orderNo 订单编号
 * @param data 物流信息
 */
export function updateShipping(orderNo: string, data: {
  shipping_method: string
  tracking_number: string
}) {
  return fetchApi<CommonResponse>(`/api/merchant/orders/${orderNo}/shipping`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * 获取订单统计数据
 * @param params 统计参数
 * @returns 订单统计数据
 */
export function getOrderStats(params?: {
  period?: 'day' | 'week' | 'month' | 'year'
  start_date?: string
  end_date?: string
}) {
  // 使用URLSearchParams构建查询参数
  const queryParams = new URLSearchParams()

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined)
        queryParams.append(key, String(value))
    }
  }

  return fetchApi<OrderStatsResponse>(`/api/merchant/order/statistics?${queryParams.toString()}`, {
    method: 'GET',
  })
}

/**
 * 商家发货处理
 * @param orderNo 订单编号
 * @param data 发货信息
 * @returns 发货结果
 */
export function shipOrder(orderNo: string, data: {
  shipping_company: string
  tracking_number: string
}) {
  return fetchApi<CommonResponse>(`/api/merchant/orders/${orderNo}/ship`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * 商家处理退款申请
 * @param orderNo 订单编号
 * @param data 退款处理信息
 * @returns 退款处理结果
 */
export function handleRefund(orderNo: string, data: {
  action: 'approve' | 'reject'
  reason?: string
}) {
  return fetchApi<CommonResponse>(`/api/merchant/orders/${orderNo}/refund`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * 获取商家综合统计数据
 * @param params 统计参数
 * @returns 综合统计数据
 */
export function getMerchantStats(params?: {
  period?: 'day' | 'week' | 'month' | 'year'
  start_date?: string
  end_date?: string
}) {
  // 使用URLSearchParams构建查询参数
  const queryParams = new URLSearchParams()

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined)
        queryParams.append(key, String(value))
    }
  }

  return fetchApi<MerchantStatsResponse>(`/api/merchant/statistics?${queryParams.toString()}`, {
    method: 'GET',
  })
}
