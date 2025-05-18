<script lang="ts" setup>
import { h, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  NButton,
  NCard,
  NDataTable,
  NDatePicker,
  NForm,
  NFormItem,
  NGrid,
  NGridItem,
  NIcon,
  NInput,
  NSelect,
  NSpace,
  NTag,
} from 'naive-ui'
import { SearchOutline as SearchIcon } from '@vicons/ionicons5'
import { getOrderList } from '@/api/order'
import type { Order, OrderListParams } from '@/api/order'

const router = useRouter()

// 订单状态选项
const orderStatusOptions = [
  { label: '全部', value: '' },
  { label: '待付款', value: 'pending_payment' },
  { label: '待发货', value: 'pending_delivery' },
  { label: '待收货', value: 'pending_receipt' },
  { label: '待评价', value: 'pending_review' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
  { label: '退款中', value: 'refunding' },
  { label: '已退款', value: 'refunded' },
]

// 订单状态标签类型
const statusTagType = {
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
const statusText = {
  pending_payment: '待付款',
  pending_delivery: '待发货',
  pending_receipt: '待收货',
  pending_review: '待评价',
  completed: '已完成',
  cancelled: '已取消',
  refunding: '退款中',
  refunded: '已退款',
}

// 搜索表单
const searchForm = ref({
  page: 1,
  per_page: 10,
  status: '',
  keyword: '',
  start_date: '',
  end_date: '',
  daterange: null,
})

// 排序
const sortState = ref({
  columnKey: '',
  order: 'ascend', // or 'descend'
})

// 表格数据
const orders = ref<Order[]>([])
const loading = ref(false)
const totalCount = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 表格列
const columns = [
  {
    title: '订单编号',
    key: 'order_no',
    width: 140,
    sorter: 'default',
    sortOrder: sortState.value.columnKey === 'order_no' ? sortState.value.order : false,
  },
  {
    title: '客户',
    key: 'recipient_name',
    width: 100,
    render(row: Order) {
      return row.address ? row.address.recipient_name : '未知'
    },
  },
  {
    title: '金额',
    key: 'total_amount',
    width: 100,
    sorter: 'default',
    sortOrder: sortState.value.columnKey === 'total_amount' ? sortState.value.order : false,
    render(row: Order) {
      return `¥${row.total_amount.toFixed(2)}`
    },
  },
  {
    title: '商品',
    key: 'items',
    width: 150,
    render(row: Order) {
      if (!row.items || row.items.length === 0)
        return '无商品信息'

      const productName = row.items[0].product.name
      if (row.items.length === 1)
        return productName
      else
        return `${productName} 等${row.items.length}件商品`
    },
  },
  {
    title: '状态',
    key: 'status',
    width: 90,
    filters: orderStatusOptions.filter(item => item.value),
    filterOptionValue: searchForm.value.status,
    render(row: Order) {
      return h(
        NTag,
        {
          type: statusTagType[row.status] as any,
          size: 'small',
        },
        { default: () => statusText[row.status] },
      )
    },
  },
  {
    title: '创建时间',
    key: 'created_at',
    width: 160,
    sorter: 'default',
    sortOrder: sortState.value.columnKey === 'created_at' ? sortState.value.order : false,
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    render(row: Order) {
      return h(
        NSpace,
        { justify: 'center' },
        {
          default: () => [
            h(
              NButton,
              {
                size: 'small',
                tertiary: true,
                type: 'primary',
                onClick: () => handleViewOrder(row),
              },
              { default: () => '查看' },
            ),
            h(
              NButton,
              {
                size: 'small',
                tertiary: true,
                type: 'info',
                onClick: () => handleEditOrder(row),
              },
              { default: () => '编辑' },
            ),
          ],
        },
      )
    },
  },
]

// 处理分页
function handlePageChange(page: number) {
  currentPage.value = page
  searchForm.value.page = page
  fetchOrders()
}

// 处理每页数量变化
function handlePageSizeChange(pageSize: number) {
  currentPage.value = 1
  searchForm.value.page = 1
  searchForm.value.per_page = pageSize
  fetchOrders()
}

// 处理排序
function handleSorterChange(sorter: { columnKey: string; order: 'ascend' | 'descend' | false }) {
  if (!sorter || !sorter.columnKey) {
    sortState.value = { columnKey: '', order: 'ascend' }
  }
  else {
    sortState.value = {
      columnKey: sorter.columnKey,
      order: sorter.order as 'ascend' | 'descend',
    }
  }
  fetchOrders()
}

// 处理筛选
function handleFiltersChange(filters: { status: string[] }) {
  searchForm.value.status = filters.status?.[0] || ''
  fetchOrders()
}

// 搜索订单
function searchOrders() {
  searchForm.value.page = 1
  currentPage.value = 1
  fetchOrders()
}

// 重置搜索条件
function resetSearch() {
  searchForm.value = {
    page: 1,
    per_page: 10,
    status: '',
    keyword: '',
    start_date: '',
    end_date: '',
    daterange: null,
  }
  currentPage.value = 1
  fetchOrders()
}

// 查看订单详情
function handleViewOrder(row: Order) {
  router.push(`/merchant/orders/${row.order_no}`)
}

// 编辑订单
function handleEditOrder(row: Order) {
  router.push(`/merchant/orders/${row.order_no}/edit`)
}

// 获取订单列表
async function fetchOrders() {
  loading.value = true
  try {
    // 构建查询参数
    const params: OrderListParams = {
      page: searchForm.value.page,
      per_page: searchForm.value.per_page,
      status: searchForm.value.status,
      keyword: searchForm.value.keyword,
      start_date: searchForm.value.start_date,
      end_date: searchForm.value.end_date,
    }

    // 添加排序参数
    if (sortState.value.columnKey) {
      const sortField = sortState.value.columnKey
      const sortDirection = sortState.value.order === 'descend' ? 'desc' : 'asc';

      // 使用类型断言添加额外参数
      (params as any).sort_field = sortField;
      (params as any).sort_order = sortDirection
    }

    // 使用 getOrderList 函数获取数据
    const response = await getOrderList(params)

    if (response && response.code === 200 && response.data) {
      orders.value = response.data.items || []
      totalCount.value = response.data.total || 0
      currentPage.value = response.data.current_page || 1
      pageSize.value = searchForm.value.per_page
    }
  }
  catch (error) {
    console.error('获取订单列表失败:', error)
  }
  finally {
    loading.value = false
  }
}

watch(
  () => searchForm.value.daterange,
  (val) => {
    searchForm.value.start_date = val?.[0] || ''
    searchForm.value.end_date = val?.[1] || ''
  },
)

onMounted(() => {
  fetchOrders()
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">
      订单管理
    </h1>

    <!-- 搜索区域 -->
    <NCard class="mb-6">
      <NForm inline :model="searchForm">
        <NGrid :cols="24" :x-gap="16" :y-gap="16">
          <NGridItem :span="8">
            <NFormItem label="关键词搜索">
              <NInput
                v-model:value="searchForm.keyword"
                placeholder="订单号/客户名称/电话"
                clearable
              />
            </NFormItem>
          </NGridItem>

          <NGridItem :span="6">
            <NFormItem label="订单状态">
              <NSelect
                v-model:value="searchForm.status"
                :options="orderStatusOptions"
                placeholder="选择订单状态"
                clearable
              />
            </NFormItem>
          </NGridItem>

          <NGridItem :span="10">
            <NFormItem label="下单时间">
              <NDatePicker
                v-model:value="searchForm.daterange"
                type="daterange"
                clearable
              />
            </NFormItem>
          </NGridItem>

          <NGridItem :span="24" class="flex justify-end">
            <NSpace>
              <NButton type="primary" @click="searchOrders">
                <template #icon>
                  <NIcon>
                    <SearchIcon />
                  </NIcon>
                </template>
                搜索
              </NButton>
              <NButton @click="resetSearch">
                重置
              </NButton>
            </NSpace>
          </NGridItem>
        </NGrid>
      </NForm>
    </NCard>

    <!-- 订单列表 -->
    <NCard>
      <NDataTable
        :columns="columns"
        :data="orders"
        :loading="loading"
        :pagination="{
          page: currentPage,
          pageSize,
          itemCount: totalCount,
          onChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
          showSizePicker: true,
          pageSizes: [10, 20, 50],
        }"
        :row-key="(row: any) => row.id"
        :row-props="(row: any) => ({
          style: 'cursor: pointer',
          onClick: () => handleViewOrder(row),
        })"
        :bordered="false"
        @update:sorter="handleSorterChange"
        @update:filters="handleFiltersChange"
      />
    </NCard>
  </div>
</template>

<style scoped>
</style>
