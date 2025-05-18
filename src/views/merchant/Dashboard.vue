<script lang="ts" setup>
import { computed, h, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import {
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  TransformComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import {
  NButton,
  NCard,
  NDataTable,
  NDatePicker,
  NDivider,
  NGrid,
  NGridItem,
  NIcon,
  NRate,
  NSelect,
  NSpin,
  NStatistic,
  NTabPane,
  NTabs,
  NTag,
} from 'naive-ui'
import {
  CartOutline as CartIcon,
  PeopleOutline as CustomerIcon,
  CashOutline as MoneyIcon,
  ArchiveOutline as ProductIcon,
  StarOutline as RatingIcon,
  ReloadOutline as RefreshIcon,
} from '@vicons/ionicons5'
import { useUserStore } from '@/store'
import { getMerchantStats, getOrderList } from '@/api/order'
import type { DailySales, MerchantStatsResponse, Order, PeriodSales, TopProduct, TopSellingProduct } from '@/api/order'

// 扩展订单统计接口以包含日销售数据
interface ExtendedOrderStatistics {
  order_count: number
  total_sales: number
  period_sales: PeriodSales[]
  daily_sales: DailySales[]
  top_products: TopProduct[]
  status_distribution: {
    pending_payment: number
    pending_delivery: number
    pending_receipt: number
    pending_review: number
    completed: number
    cancelled: number
    refunding: number
    refunded: number
  }
}

// 注册必要的ECharts组件
use([
  CanvasRenderer,
  LineChart,
  PieChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
])

// 用户信息
const userStore = useUserStore()
const router = useRouter()
const merchantName = computed(() => {
  return userStore.userInfo.nickname || 'Merchant'
})

// 加载状态
const loadingStats = ref(false)
const loadingOrders = ref(false)

// 订单状态标签类型
const statusTagType: Record<string, string> = {
  pending_payment: 'warning',
  pending_delivery: 'info',
  pending_receipt: 'primary',
  pending_review: 'default',
  completed: 'success',
  cancelled: 'error',
  refunding: 'warning',
  refunded: 'default',
}

// 订单状态标签文字
const statusText: Record<string, string> = {
  pending_payment: '待付款',
  pending_delivery: '待发货',
  pending_receipt: '待收货',
  pending_review: '待评价',
  completed: '已完成',
  cancelled: '已取消',
  refunding: '退款中',
  refunded: '已退款',
}

// 店铺概况数据
const shopSummary = ref({
  total_orders: 0,
  total_customers: 0,
  customer_repeat_rate: 0,
  shop_rating: 0,
})

// 商品统计数据
const productStatistics = ref({
  total_products: 0,
  published_products: 0,
  sold_out_products: 0,
  featured_products: 0,
  top_selling_products: [] as TopSellingProduct[],
})

// 订单统计数据
const orderStatistics = ref<ExtendedOrderStatistics>({
  order_count: 0,
  total_sales: 0,
  period_sales: [] as PeriodSales[],
  daily_sales: [] as DailySales[],
  top_products: [] as TopProduct[],
  status_distribution: {
    pending_payment: 0,
    pending_delivery: 0,
    pending_receipt: 0,
    pending_review: 0,
    completed: 0,
    cancelled: 0,
    refunding: 0,
    refunded: 0,
  },
})

// 日期范围
const dateRange = ref({
  start: '',
  end: '',
})

// 图表日期范围选择
const chartDateRange = ref<[number, number] | null>(null)

// 日期范围选项
const dateRangeOptions = [
  { label: '最近7天', value: '7days' },
  { label: '最近30天', value: '30days' },
  { label: '本月', value: 'this_month' },
  { label: '上月', value: 'last_month' },
  { label: '自定义', value: 'custom' },
]

// 选择的日期范围
const selectedDateRange = ref('7days')

// 处理日期范围变化
function handleDateRangeChange(value: string) {
  selectedDateRange.value = value
  const today = new Date()
  let start: Date | null = null
  let end: Date = today

  switch (value) {
    case '7days':
      start = new Date(today)
      start.setDate(today.getDate() - 6)
      break
    case '30days':
      start = new Date(today)
      start.setDate(today.getDate() - 29)
      break
    case 'this_month':
      start = new Date(today.getFullYear(), today.getMonth(), 1)
      break
    case 'last_month':
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      end = new Date(today.getFullYear(), today.getMonth(), 0)
      break
    case 'custom':
      // 使用自定义日期，不设置start和end
      return
  }

  if (start) {
    // 设置时间为00:00:00
    start.setHours(0, 0, 0, 0)
    // 设置结束时间为23:59:59
    end.setHours(23, 59, 59, 999)

    chartDateRange.value = [start.getTime(), end.getTime()]

    // 刷新统计数据
    fetchMerchantStats({
      start_date: formatDate(start),
      end_date: formatDate(end),
    })
  }
}

// 处理自定义日期变化
function handleCustomDateChange(value: [number, number] | null) {
  if (value && value.length === 2) {
    chartDateRange.value = value

    const start = new Date(value[0])
    const end = new Date(value[1])

    // 刷新统计数据
    fetchMerchantStats({
      start_date: formatDate(start),
      end_date: formatDate(end),
    })
  }
}

// 格式化日期为YYYY-MM-DD格式
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 最近订单数据
const recentOrders = ref<Order[]>([])

// 订单表格列
const orderColumns = [
  {
    title: '订单编号',
    key: 'order_no',
    width: 140,
  },
  {
    title: '金额',
    key: 'total_amount',
    width: 100,
    render(row: Order) {
      return `¥${row.total_amount.toFixed(2)}`
    },
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render(row: Order) {
      const type = statusTagType[row.status] || 'default'
      const text = statusText[row.status] || row.status
      return h(
        NTag,
        {
          type: type as any,
          size: 'small',
        },
        { default: () => text },
      )
    },
  },
  {
    title: '创建时间',
    key: 'created_at',
    width: 160,
  },
]

// 热销商品表格列
const topProductColumns = [
  {
    title: '商品名称',
    key: 'name',
    width: 180,
  },
  {
    title: '销量',
    key: 'quantity_sold',
    width: 80,
  },
  {
    title: '销售额',
    key: 'total_sales',
    width: 120,
    render(row: TopProduct) {
      return `¥${row.total_sales.toFixed(2)}`
    },
  },
]

// 销售趋势图表配置
const salesTrendOption = computed(() => {
  const dates: string[] = []
  const salesData: number[] = []

  if (orderStatistics.value.daily_sales && orderStatistics.value.daily_sales.length > 0) {
    orderStatistics.value.daily_sales.forEach((item) => {
      dates.push(item.date)
      salesData.push(item.sales)
    })
  }
  else if (orderStatistics.value.period_sales && orderStatistics.value.period_sales.length > 0) {
    orderStatistics.value.period_sales.forEach((item) => {
      const dateStr = `${item.year}-${String(item.month).padStart(2, '0')}`
      dates.push(dateStr)
      salesData.push(item.sales)
    })
  }

  return {
    title: {
      text: '销售趋势',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: ¥{c}',
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        rotate: 45,
        interval: 'auto',
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '¥{value}',
      },
    },
    series: [
      {
        name: '销售额',
        type: 'line',
        data: salesData,
        smooth: true,
        itemStyle: {
          color: '#1890ff',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(24,144,255,0.4)' },
              { offset: 1, color: 'rgba(24,144,255,0.1)' },
            ],
          },
        },
      },
    ],
  }
})

// 订单状态分布饼图配置
const orderStatusPieOption = computed(() => {
  const statusData = [
    { name: '待付款', value: orderStatistics.value.status_distribution.pending_payment },
    { name: '待发货', value: orderStatistics.value.status_distribution.pending_delivery },
    { name: '待收货', value: orderStatistics.value.status_distribution.pending_receipt },
    { name: '待评价', value: orderStatistics.value.status_distribution.pending_review },
    { name: '已完成', value: orderStatistics.value.status_distribution.completed },
    { name: '退款中', value: orderStatistics.value.status_distribution.refunding },
    { name: '已取消/退款', value: orderStatistics.value.status_distribution.cancelled + orderStatistics.value.status_distribution.refunded },
  ]

  // 过滤掉数量为0的状态
  const filteredData = statusData.filter(item => item.value > 0)

  return {
    title: {
      text: '订单状态分布',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'horizontal',
      bottom: 10,
      data: filteredData.map(item => item.name),
    },
    series: [
      {
        name: '订单状态',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: filteredData,
      },
    ],
  }
})

// 热销商品排行柱状图配置
const topProductsBarOption = computed(() => {
  const productNames: string[] = []
  const salesData: number[] = []

  if (orderStatistics.value.top_products && orderStatistics.value.top_products.length > 0) {
    // 只显示前5个产品，并倒序排列以便从高到低显示
    const products = [...orderStatistics.value.top_products].slice(0, 5).reverse()

    products.forEach((product) => {
      productNames.push(product.name)
      salesData.push(product.total_sales)
    })
  }

  return {
    title: {
      text: '热销商品排行',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: '{b}: ¥{c}',
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        formatter: '¥{value}',
      },
    },
    yAxis: {
      type: 'category',
      data: productNames,
      axisTick: {
        alignWithLabel: true,
      },
    },
    series: [
      {
        name: '销售额',
        type: 'bar',
        data: salesData,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: '#52c41a' },
              { offset: 1, color: '#1677ff' },
            ],
          },
          borderRadius: [0, 4, 4, 0],
        },
      },
    ],
  }
})

// 获取综合统计数据
async function fetchMerchantStats(params?: {
  period?: 'day' | 'week' | 'month' | 'year'
  start_date?: string
  end_date?: string
}) {
  loadingStats.value = true
  try {
    const response = await getMerchantStats(params) as MerchantStatsResponse

    if (response && response.code === 200 && response.data) {
      shopSummary.value = response.data.shop_summary
      productStatistics.value = response.data.product_statistics

      // 创建扩展的订单统计数据
      const extendedStats: ExtendedOrderStatistics = {
        ...response.data.order_statistics,
        daily_sales: [],
      }

      // 如果后端返回了日销售数据，直接使用
      if (response.data.order_statistics.daily_sales)
        extendedStats.daily_sales = response.data.order_statistics.daily_sales

      // 设置扩展后的订单统计数据
      orderStatistics.value = extendedStats

      dateRange.value = response.data.date_range
    }
  }
  catch (error) {
    console.error('获取综合统计数据失败:', error)
  }
  finally {
    loadingStats.value = false
  }
}

// 获取最近订单
async function fetchRecentOrders() {
  loadingOrders.value = true
  try {
    const response = await getOrderList({
      page: 1,
      per_page: 5,
    })

    if (response && response.code === 200 && response.data)
      recentOrders.value = response.data.items || []
  }
  catch (error) {
    console.error('获取最近订单失败:', error)
  }
  finally {
    loadingOrders.value = false
  }
}

// 刷新所有数据
function refreshAllData() {
  fetchMerchantStats()
  fetchRecentOrders()
}

// 为window.difyChatbotConfig声明全局类型
declare global {
  interface Window {
    difyChatbotConfig: {
      token: string
      systemVariables: Record<string, any>
    }
    deviceIdfa?: any // 已在项目中使用但没声明类型
  }
}

// 初始化聊天机器人相关代码已移至index.html
onMounted(() => {
  // 默认选择最近7天
  handleDateRangeChange('7days')
  fetchRecentOrders()
})
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">
        欢迎回来，{{ merchantName }}
      </h1>
      <NButton :loading="loadingStats || loadingOrders" @click="refreshAllData">
        <template #icon>
          <NIcon>
            <RefreshIcon />
          </NIcon>
        </template>
        刷新数据
      </NButton>
    </div>

    <NSpin :show="loadingStats">
      <!-- 店铺概况 -->
      <NCard title="店铺概况" class="mb-6">
        <NGrid :cols="4" :x-gap="12" :y-gap="12">
          <NGridItem>
            <NStatistic label="总订单数">
              <template #prefix>
                <NIcon size="24">
                  <CartIcon />
                </NIcon>
              </template>
              <template #default>
                {{ shopSummary.total_orders }}
              </template>
            </NStatistic>
          </NGridItem>

          <NGridItem>
            <NStatistic label="购买顾客数">
              <template #prefix>
                <NIcon size="24">
                  <CustomerIcon />
                </NIcon>
              </template>
              <template #default>
                {{ shopSummary.total_customers }}
              </template>
            </NStatistic>
          </NGridItem>

          <NGridItem>
            <NStatistic label="顾客复购率">
              <template #prefix>
                <NIcon size="24">
                  <CustomerIcon />
                </NIcon>
              </template>
              <template #default>
                {{ shopSummary.customer_repeat_rate }}%
              </template>
            </NStatistic>
          </NGridItem>

          <NGridItem>
            <NStatistic label="店铺评分">
              <template #prefix>
                <NIcon size="24">
                  <RatingIcon />
                </NIcon>
              </template>
              <template #default>
                <div class="flex items-center">
                  {{ shopSummary.shop_rating }}
                  <NRate v-model:value="shopSummary.shop_rating" readonly allow-half size="small" class="ml-2" />
                </div>
              </template>
            </NStatistic>
          </NGridItem>
        </NGrid>
      </NCard>

      <!-- 销售统计 -->
      <NCard title="销售统计" class="mb-6">
        <NGrid :cols="4" :x-gap="12" :y-gap="12">
          <NGridItem span="2">
            <NStatistic label="销售总额">
              <template #prefix>
                <NIcon size="24">
                  <MoneyIcon />
                </NIcon>
              </template>
              <template #default>
                {{ `¥${orderStatistics.total_sales.toFixed(2)}` }}
              </template>
            </NStatistic>
          </NGridItem>

          <NGridItem>
            <NStatistic label="订单总数">
              <template #prefix>
                <NIcon size="24">
                  <CartIcon />
                </NIcon>
              </template>
              <template #default>
                {{ orderStatistics.order_count }}
              </template>
            </NStatistic>
          </NGridItem>

          <NGridItem>
            <NStatistic label="商品总数">
              <template #prefix>
                <NIcon size="24">
                  <ProductIcon />
                </NIcon>
              </template>
              <template #default>
                {{ productStatistics.total_products }}
              </template>
            </NStatistic>
          </NGridItem>
        </NGrid>

        <NDivider />

        <h3 class="text-lg font-bold mb-4">
          订单状态分布
        </h3>
        <NGrid :cols="7" :x-gap="12">
          <NGridItem>
            <div class="text-center p-2">
              <div class="text-yellow-500 text-lg font-bold mb-2">
                {{ orderStatistics.status_distribution.pending_payment }}
              </div>
              <div class="text-gray-500 text-sm">
                待付款
              </div>
            </div>
          </NGridItem>

          <NGridItem>
            <div class="text-center p-2">
              <div class="text-blue-500 text-lg font-bold mb-2">
                {{ orderStatistics.status_distribution.pending_delivery }}
              </div>
              <div class="text-gray-500 text-sm">
                待发货
              </div>
            </div>
          </NGridItem>

          <NGridItem>
            <div class="text-center p-2">
              <div class="text-green-500 text-lg font-bold mb-2">
                {{ orderStatistics.status_distribution.pending_receipt }}
              </div>
              <div class="text-gray-500 text-sm">
                待收货
              </div>
            </div>
          </NGridItem>

          <NGridItem>
            <div class="text-center p-2">
              <div class="text-purple-500 text-lg font-bold mb-2">
                {{ orderStatistics.status_distribution.pending_review }}
              </div>
              <div class="text-gray-500 text-sm">
                待评价
              </div>
            </div>
          </NGridItem>

          <NGridItem>
            <div class="text-center p-2">
              <div class="text-emerald-500 text-lg font-bold mb-2">
                {{ orderStatistics.status_distribution.completed }}
              </div>
              <div class="text-gray-500 text-sm">
                已完成
              </div>
            </div>
          </NGridItem>

          <NGridItem>
            <div class="text-center p-2">
              <div class="text-orange-500 text-lg font-bold mb-2">
                {{ orderStatistics.status_distribution.refunding }}
              </div>
              <div class="text-gray-500 text-sm">
                退款中
              </div>
            </div>
          </NGridItem>

          <NGridItem>
            <div class="text-center p-2">
              <div class="text-red-500 text-lg font-bold mb-2">
                {{ orderStatistics.status_distribution.cancelled + orderStatistics.status_distribution.refunded }}
              </div>
              <div class="text-gray-500 text-sm">
                已取消/退款
              </div>
            </div>
          </NGridItem>
        </NGrid>
      </NCard>

      <!-- 图表统计区域 -->
      <NCard title="数据分析" class="mb-6">
        <NTabs type="line" animated>
          <NTabPane name="sales-trend" tab="日销售趋势">
            <div class="flex justify-between items-center mb-4">
              <NSelect
                v-model:value="selectedDateRange"
                :options="dateRangeOptions"
                size="small"
                style="width: 120px"
                @update:value="handleDateRangeChange"
              />
              <NDatePicker
                v-if="selectedDateRange === 'custom'"
                v-model:value="chartDateRange"
                type="daterange"
                size="small"
                clearable
                style="width: 240px"
                @update:value="handleCustomDateChange"
              />
            </div>
            <div style="height: 400px">
              <VChart :option="salesTrendOption" autoresize />
            </div>
          </NTabPane>

          <NTabPane name="order-status" tab="订单状态分布">
            <div style="height: 400px">
              <VChart :option="orderStatusPieOption" autoresize />
            </div>
          </NTabPane>

          <NTabPane name="top-products" tab="热销商品排行">
            <div style="height: 400px">
              <VChart :option="topProductsBarOption" autoresize />
            </div>
          </NTabPane>
        </NTabs>
      </NCard>

      <!-- 统计数据区域 -->
      <NGrid :cols="1" :x-gap="12" :y-gap="12" class="mb-6">
        <!-- 热销商品 -->
        <NGridItem>
          <NCard title="热销商品" class="h-full">
            <NDataTable
              :columns="topProductColumns"
              :data="orderStatistics.top_products.slice(0, 5)"
              :bordered="false"
              :pagination="false"
              :row-props="(row: TopProduct) => ({
                style: 'cursor: pointer',
                onClick: () => router.push(`/merchant/product/edit/${row.id}`),
              })"
            />
          </NCard>
        </NGridItem>
      </NGrid>
    </NSpin>

    <!-- 最近订单 -->
    <NCard title="最近订单" class="mb-6">
      <NDataTable
        :columns="orderColumns"
        :data="recentOrders"
        :loading="loadingOrders"
        :bordered="false"
        :pagination="false"
        :row-props="(row: Order) => ({
          style: 'cursor: pointer',
          onClick: () => router.push(`/merchant/orders/${row.order_no}`),
        })"
      />
      <div class="flex justify-end mt-4">
        <NButton text @click="router.push('/merchant/orders')">
          查看全部订单
        </NButton>
      </div>
    </NCard>
  </div>
</template>

<style scoped>
#dify-chatbot-bubble-button {
  background-color: #1C64F2 !important;
}
#dify-chatbot-bubble-window {
  width: 24rem !important;
  height: 40rem !important;
}
</style>
