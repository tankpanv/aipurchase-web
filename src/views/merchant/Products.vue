<script lang="ts" setup>
import { h, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  NButton,
  NCard,
  NDataTable,
  NInput,
  NPopconfirm,
  NPopover,
  NSelect,
  NSpace,
  NTag,
  useMessage,
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { deleteProduct, getProductList, updateProduct, updateProductStatus } from '@/api/product'
import type { Product } from '@/api/product'
import { useUserStore } from '@/store'

const router = useRouter()
const message = useMessage()
const userStore = useUserStore()

// 商品列表数据
const loading = ref(false)
const products = ref<Product[]>([])
const total = ref(0)
const pagination = ref({
  page: 1,
  current: 1,
  pageSize: 10,
  total: 0,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 30, 50],
})

// 筛选条件
const searchText = ref('')
const selectedStatus = ref<string | null>(null)
const selectedProductType = ref<string | null>(null)

// 查询参数
const queryParams = ref({
  status: null as string | null,
  query: null as string | null,
  product_type: null as string | null,
})

// 状态选项
const statusOptions = [
  { label: '全部状态', value: null },
  { label: '已发布', value: 'published' },
  { label: '草稿', value: 'draft' },
  { label: '已售罄', value: 'sold_out' },
  { label: '已归档', value: 'archived' },
]

// 商品类型选项
const productTypeOptions = [
  { label: '全部类型', value: null },
  { label: '外卖', value: 'takeout', icon: 'fastfood' },
  { label: '酒店民宿', value: 'hotel', icon: 'hotel' },
  { label: '看病买药', value: 'medicine', icon: 'medical_services' },
  { label: '电影演出', value: 'ticket', icon: 'movie' },
  { label: '免费水果', value: 'fresh', icon: 'apple' },
  { label: '团购', value: 'groupon', icon: 'local_offer' },
]

// 编辑商品类型
async function updateProductType(id: number, productType: string) {
  try {
    // 查找当前商品数据
    const product = products.value.find(p => p.id === id)
    if (!product)
      return

    // 发送更新请求，仅更新product_type字段
    const response = await updateProduct(id, {
      name: product.name,
      description: product.description,
      price: product.price,
      original_price: product.original_price,
      stock: product.stock,
      unit: product.unit,
      product_type: productType,
      status: product.status,
      is_featured: product.is_featured,
      tags: product.tags,
    })

    if (response && response.code === 200) {
      message.success('商品类型更新成功')
      // 重新获取列表数据
      fetchProducts()
    }
  }
  catch (error) {
    console.error('更新商品类型失败:', error)
    message.error('更新商品类型失败，请重试')
  }
}

// 表格列定义
const createColumns = (): DataTableColumns<Product> => {
  return [
    {
      title: '商品图片',
      key: 'main_image_url',
      width: 100,
      render(row) {
        return h('img', {
          src: row.main_image_url || '/images/default-product.png',
          style: {
            width: '60px',
            height: '60px',
            objectFit: 'cover',
            borderRadius: '4px',
          },
        })
      },
    },
    {
      title: '商品名称',
      key: 'name',
      width: 200,
    },
    {
      title: '商品类型',
      key: 'product_type',
      width: 150,
      render(row: Product) {
        const productType = productTypeOptions.find(type => type.value === row.product_type)
                          || { label: row.product_type || '未设置', value: row.product_type || null, icon: 'help_outline' }

        return h(
          NPopover,
          {
            trigger: 'click',
            placement: 'bottom',
          },
          {
            trigger: () => h(
              NTag,
              {
                style: { cursor: 'pointer' },
                type: row.product_type ? 'success' : 'default',
              },
              { default: () => productType.label },
            ),
            default: () => h(
              NSelect,
              {
                value: row.product_type,
                options: productTypeOptions.filter(opt => opt.value !== null),
                style: { width: '150px' },
                placeholder: '选择商品类型',
                onUpdateValue: (value: string | null) => {
                  if (value !== row.product_type)
                    updateProductType(row.id, value as string)
                },
              },
            ),
          },
        )
      },
    },
    {
      title: '价格',
      key: 'price',
      width: 120,
      render(row) {
        return h('div', [
          h('div', { style: { fontWeight: 'bold' } }, `¥${row.price.toFixed(2)}`),
          row.original_price
            ? h(
              'div',
              { style: { fontSize: '12px', color: '#999', textDecoration: 'line-through' } },
                `¥${row.original_price.toFixed(2)}`,
            )
            : null,
        ])
      },
    },
    {
      title: '库存',
      key: 'stock',
      width: 80,
    },
    {
      title: '单位',
      key: 'unit',
      width: 60,
    },
    {
      title: '状态',
      key: 'status',
      width: 120,
      render(row) {
        const statusMap = {
          published: { type: 'success', text: '已发布' },
          draft: { type: 'default', text: '草稿' },
          sold_out: { type: 'warning', text: '已售罄' },
          archived: { type: 'info', text: '已归档' },
        }
        const status = statusMap[row.status as keyof typeof statusMap] || {
          type: 'default',
          text: row.status,
        }
        return h(NTag, { type: status.type as any }, { default: () => status.text })
      },
    },
    {
      title: '标签',
      key: 'tags',
      width: 200,
      render(row) {
        if (!row.tags || !row.tags.length)
          return '无'
        return h(
          NSpace,
          { wrap: true, size: 'small' },
          {
            default: () =>
              row.tags!.map((tag, index) =>
                h(
                  NTag,
                  {
                    key: index,
                    size: 'small',
                    color: { borderColor: '#d9d9d9', color: '#999' },
                  },
                  { default: () => tag },
                ),
              ),
          },
        )
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render(row) {
        return h(
          NSpace,
          { align: 'center' },
          {
            default: () => [
              h(
                NButton,
                {
                  size: 'small',
                  onClick: () => handleStatusToggle(row),
                },
                {
                  default: () => {
                    switch (row.status) {
                      case 'draft':
                        return '在发布'
                      case 'published':
                        return '已上架'
                      case 'sold_out':
                        return '售罄'
                      case 'archived':
                        return '下架'
                      default:
                        return '已发布'
                    }
                  },
                },
              ),
              h(
                NButton,
                {
                  size: 'small',
                  type: 'primary',
                  onClick: () => handleEdit(row),
                },
                { default: () => '编辑' },
              ),
              h(
                NPopconfirm,
                {
                  onPositiveClick: () => handleDelete(row.id),
                },
                {
                  default: () => '确定要删除该商品吗？',
                  trigger: () =>
                    h(
                      NButton,
                      {
                        size: 'small',
                        type: 'error',
                      },
                      { default: () => '删除' },
                    ),
                },
              ),
            ],
          },
        )
      },
    },
  ]
}

const columns = createColumns()

// 获取商品列表数据
async function fetchProducts() {
  loading.value = true
  try {
    const params = {
      merchant_id: userStore.userInfo.client_agent ? Number(userStore.userInfo.client_agent) : undefined,
      page: pagination.value.current,
      per_page: pagination.value.pageSize,
      status: queryParams.value.status || undefined,
      query: queryParams.value.query || undefined,
      product_type: queryParams.value.product_type || undefined,
    }
    const response = await getProductList(params)

    if (response && response.data) {
      products.value = response.data.items
      total.value = response.data.total
      pagination.value.total = response.data.total
      pagination.value.itemCount = response.data.total
    }
  }
  catch (error) {
    console.error('获取商品列表失败:', error)
    message.error('获取商品列表失败')
  }
  finally {
    loading.value = false
  }
}

// 处理分页变化
function handlePageChange(page: number) {
  pagination.value.page = page
  pagination.value.current = page
  fetchProducts()
}

// 处理每页条数变化
function handlePageSizeChange(pageSize: number) {
  pagination.value.pageSize = pageSize
  pagination.value.page = 1
  fetchProducts()
}

// 处理搜索
function handleSearch() {
  pagination.value.page = 1
  pagination.value.current = 1
  queryParams.value.query = searchText.value || null
  fetchProducts()
}

// 处理状态筛选
function handleStatusFilter(value: string | null) {
  selectedStatus.value = value
  queryParams.value.status = value
  pagination.value.page = 1
  pagination.value.current = 1
  fetchProducts()
}

// 处理商品类型筛选
function handleProductTypeFilter(value: string | null) {
  selectedProductType.value = value
  queryParams.value.product_type = value
  pagination.value.page = 1
  pagination.value.current = 1
  fetchProducts()
}

// 处理商品状态切换
async function handleStatusToggle(product: Product) {
  let newStatus: string

  // 根据当前状态及按钮文本决定切换后的状态
  switch (product.status) {
    case 'draft':
      // 按钮文本为"在发布"，点击后变为已发布状态
      newStatus = 'published'
      break
    case 'published':
      // 按钮文本为"已上架"，点击后变为售罄状态
      newStatus = 'sold_out'
      break
    case 'sold_out':
      // 按钮文本为"售罄"，点击后变为已发布状态
      newStatus = 'published'
      break
    case 'archived':
      // 按钮文本为"下架"，点击后变为已发布状态
      newStatus = 'published'
      break
    default:
      newStatus = 'published'
  }

  try {
    const response = await updateProductStatus(product.id, newStatus)
    if (response && response.code === 200) {
      const statusText: Record<string, string> = {
        published: '已发布',
        draft: '草稿',
        sold_out: '已售罄',
        archived: '已归档',
      }
      message.success(`商品状态已更新为${statusText[newStatus]}`)
      // 重新获取列表数据
      fetchProducts()
    }
  }
  catch (error) {
    console.error('更新商品状态失败:', error)
    message.error('操作失败，请重试')
  }
}

// 处理编辑商品
function handleEdit(row: Product) {
  router.push(`/merchant/product/edit/${row.id}`)
}

// 处理添加商品
function handleAdd() {
  router.push('/merchant/product/create')
}

// 处理删除商品
async function handleDelete(id: number) {
  try {
    const response = await deleteProduct(id)
    if (response && response.code === 200) {
      message.success('商品删除成功')
      // 重新获取列表数据
      fetchProducts()
    }
  }
  catch (error) {
    console.error('删除商品失败:', error)
    message.error('删除失败，请重试')
  }
}

// 格式化金额
function formatMoney(value: number): string {
  return `¥${value.toFixed(2)}`
}

// 格式化库存
function formatStock(row: Product): string {
  return `${row.stock} ${row.unit || '件'}`
}

onMounted(() => {
  fetchProducts()
})
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">
        商品管理
      </h1>
      <NButton type="primary" @click="router.push('/merchant/product/create')">
        新增商品
      </NButton>
    </div>

    <!-- 筛选和操作栏 -->
    <NCard class="mb-4">
      <div class="flex flex-wrap justify-between items-center">
        <div class="flex flex-wrap items-center gap-4">
          <NInput
            v-model:value="searchText"
            placeholder="搜索商品名称"
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
          <NSelect
            v-model:value="selectedStatus"
            :options="statusOptions"
            placeholder="商品状态"
            style="width: 140px"
            clearable
            @update:value="handleStatusFilter"
          />
          <NSelect
            v-model:value="selectedProductType"
            :options="productTypeOptions"
            placeholder="商品类型"
            style="width: 140px"
            clearable
            @update:value="handleProductTypeFilter"
          />
          <NButton type="primary" @click="handleSearch">
            搜索
          </NButton>
        </div>
        <div>
          <NButton type="primary" @click="handleAdd">
            添加商品
          </NButton>
        </div>
      </div>
    </NCard>

    <!-- 商品列表 -->
    <NCard>
      <NDataTable
        :loading="loading"
        :columns="columns"
        :data="products"
        :pagination="pagination"
        :row-key="(row: Product) => row.id"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
    </NCard>
  </div>
</template>

<style scoped>
</style>
