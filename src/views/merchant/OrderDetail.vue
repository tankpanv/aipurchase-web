<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NAlert,
  NButton,
  NCard,
  NDescriptions,
  NDescriptionsItem,
  NForm,
  NFormItem,
  NInput,
  NInputGroup,
  NModal,
  NSelect,
  NSpace,
  NStep,
  NSteps,
  NTable,
  NTag,
  NText,
  useMessage,
} from 'naive-ui'
import { getOrderDetail, handleRefund, shipOrder, updateOrderStatus } from '@/api/order'
import type { Order } from '@/api/order'

const route = useRoute()
const router = useRouter()
const message = useMessage()

// 订单编号
const orderNo = computed(() => route.params.id as string)

// 订单详情
const orderDetail = ref<Order | null>(null)
const loading = ref(false)

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

// 显示订单状态更新弹窗
const showStatusModal = ref(false)

// 订单状态更新表单
const statusForm = ref({
  status: '',
  tracking_number: '',
})

// 订单状态选项
const statusOptions = computed(() => {
  // 根据当前订单状态提供可切换的状态选项
  if (!orderDetail.value)
    return []

  const currentStatus = orderDetail.value.status

  switch (currentStatus) {
    case 'pending_payment':
      return [
        { label: '已付款', value: 'pending_delivery' },
        { label: '已取消', value: 'cancelled' },
      ]
    case 'pending_delivery':
      return [
        { label: '已发货', value: 'pending_receipt' },
        { label: '已取消', value: 'cancelled' },
        { label: '已退款', value: 'refunded' },
      ]
    case 'pending_receipt':
      return [
        { label: '已完成', value: 'completed' },
        { label: '已退款', value: 'refunded' },
      ]
    default:
      return []
  }
})

// 是否需要填写物流信息
const needTrackingNumber = computed(() => {
  return statusForm.value.status === 'pending_receipt'
})

// 订单进度步骤
const orderSteps = computed(() => {
  if (!orderDetail.value)
    return []

  const steps = [
    {
      title: '订单创建',
      description: orderDetail.value.created_at,
      status: 'finish',
    },
  ]

  // 根据订单状态添加进度步骤
  const status = orderDetail.value.status

  if (status === 'cancelled') {
    steps.push({
      title: '订单取消',
      description: orderDetail.value.updated_at,
      status: 'error',
    })
  }
  else {
    // 待付款之后的步骤
    if (['pending_delivery', 'pending_receipt', 'completed'].includes(status)) {
      steps.push({
        title: '付款完成',
        description: orderDetail.value.payment_time || '',
        status: 'finish',
      })
    }
    else if (status === 'pending_payment') {
      steps.push({
        title: '等待付款',
        description: '',
        status: 'process',
      })
    }

    // 发货步骤
    if (['pending_receipt', 'completed'].includes(status)) {
      steps.push({
        title: '已发货',
        description: orderDetail.value.updated_at,
        status: 'finish',
      })
    }
    else if (status === 'pending_delivery') {
      steps.push({
        title: '等待发货',
        description: '',
        status: 'process',
      })
    }

    // 完成步骤
    if (status === 'completed') {
      steps.push({
        title: '订单完成',
        description: orderDetail.value.updated_at,
        status: 'finish',
      })
    }
    else if (status === 'pending_receipt') {
      steps.push({
        title: '等待完成',
        description: '',
        status: 'process',
      })
    }

    // 退款步骤
    if (status === 'refunded') {
      steps.push({
        title: '订单退款',
        description: orderDetail.value.updated_at,
        status: 'warning',
      })
    }
  }

  return steps
})

// 获取当前进度步骤
const currentStep = computed(() => {
  if (!orderDetail.value)
    return 0

  const status = orderDetail.value.status

  switch (status) {
    case 'pending_payment':
      return 1
    case 'pending_delivery':
      return 2
    case 'pending_receipt':
      return 3
    case 'completed':
    case 'cancelled':
    case 'refunded':
      return 4
    default:
      return 0
  }
})

// 商家发货弹窗状态
const showShipModal = ref(false)
// 商家退款处理弹窗状态
const showRefundModal = ref(false)

// 发货表单数据
const shipForm = ref({
  shipping_company: '',
  tracking_number: '',
})

// 退款处理表单数据
const refundForm = ref({
  action: 'approve' as 'approve' | 'reject',
  reason: '',
})

// 获取订单详情
async function fetchOrderDetail() {
  loading.value = true
  try {
    const response = await getOrderDetail(orderNo.value)

    if (response && response.code === 200 && response.data)
      orderDetail.value = response.data
    else
      message.error('获取订单详情失败')
  }
  catch (error) {
    console.error('获取订单详情失败:', error)
    message.error('获取订单详情失败')
  }
  finally {
    loading.value = false
  }
}

// 打开更新状态弹窗
function openStatusModal() {
  if (!orderDetail.value)
    return

  // 初始化表单
  statusForm.value = {
    status: '',
    tracking_number: '',
  }

  showStatusModal.value = true
}

// 更新订单状态
async function updateOrderStatusHandler() {
  if (!orderDetail.value || !statusForm.value.status)
    return

  try {
    const params: {
      status: string
      tracking_number?: string
    } = {
      status: statusForm.value.status,
    }

    // 如果需要物流单号，添加到参数中
    if (needTrackingNumber.value && statusForm.value.tracking_number)
      params.tracking_number = statusForm.value.tracking_number

    const response = await updateOrderStatus(orderDetail.value.order_no, params)

    if (response && response.code === 200) {
      message.success('订单状态更新成功')
      showStatusModal.value = false
      fetchOrderDetail() // 刷新数据
    }
    else {
      message.error('订单状态更新失败')
    }
  }
  catch (error) {
    console.error('更新订单状态失败:', error)
    message.error('更新订单状态失败')
  }
}

// 打开发货弹窗
function openShipModal() {
  if (!orderDetail.value)
    return

  // 初始化表单
  shipForm.value = {
    shipping_company: '',
    tracking_number: '',
  }

  showShipModal.value = true
}

// 打开退款处理弹窗
function openRefundModal() {
  if (!orderDetail.value)
    return

  // 初始化表单
  refundForm.value = {
    action: 'approve',
    reason: '',
  }

  showRefundModal.value = true
}

// 处理商家发货
async function handleShipOrder() {
  if (!orderDetail.value || !shipForm.value.shipping_company || !shipForm.value.tracking_number)
    return

  try {
    const response = await shipOrder(orderDetail.value.order_no, {
      shipping_company: shipForm.value.shipping_company,
      tracking_number: shipForm.value.tracking_number,
    })

    if (response && response.code === 200) {
      message.success('发货成功')
      showShipModal.value = false
      fetchOrderDetail() // 刷新数据
    }
    else {
      message.error(response?.message || '发货失败')
    }
  }
  catch (error) {
    console.error('发货失败:', error)
    message.error('发货失败，请重试')
  }
}

// 处理退款申请
async function handleRefundRequest() {
  if (!orderDetail.value)
    return

  // 如果是拒绝退款但没有填写原因
  if (refundForm.value.action === 'reject' && !refundForm.value.reason) {
    message.warning('请填写拒绝退款的原因')
    return
  }

  try {
    const data: {
      action: 'approve' | 'reject'
      reason?: string
    } = {
      action: refundForm.value.action,
    }

    // 如果是拒绝退款，需要提供原因
    if (refundForm.value.action === 'reject')
      data.reason = refundForm.value.reason

    const response = await handleRefund(orderDetail.value.order_no, data)

    if (response && response.code === 200) {
      message.success(refundForm.value.action === 'approve' ? '退款申请已同意' : '退款申请已拒绝')
      showRefundModal.value = false
      fetchOrderDetail() // 刷新数据
    }
    else {
      message.error(response?.message || '处理退款申请失败')
    }
  }
  catch (error) {
    console.error('处理退款申请失败:', error)
    message.error('处理退款申请失败，请重试')
  }
}

// 返回列表页
function handleBack() {
  router.push('/merchant/orders')
}

onMounted(() => {
  fetchOrderDetail()
})
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">
        订单详情
      </h1>
      <NSpace>
        <NButton @click="handleBack">
          返回列表
        </NButton>
        <NButton
          v-if="orderDetail && orderDetail.status === 'pending_delivery'"
          type="primary"
          @click="openShipModal"
        >
          发货
        </NButton>
        <NButton
          v-if="orderDetail && orderDetail.status === 'refunding'"
          type="warning"
          @click="openRefundModal"
        >
          处理退款
        </NButton>
        <NButton
          v-if="orderDetail && ['pending_payment', 'pending_delivery', 'pending_receipt'].includes(orderDetail.status)"
          type="info"
          @click="openStatusModal"
        >
          更新状态
        </NButton>
      </NSpace>
    </div>

    <!-- 加载中提示 -->
    <div v-if="loading" class="py-10 text-center">
      <p>加载订单信息中...</p>
    </div>

    <div v-else-if="!orderDetail" class="py-10 text-center">
      <NAlert title="未找到订单" type="error">
        找不到ID为 {{ orderNo }} 的订单信息
      </NAlert>
    </div>

    <template v-else>
      <!-- 订单状态进度条 -->
      <NCard title="订单进度" class="mb-6">
        <NSteps :current="currentStep" :status="orderDetail.status === 'cancelled' ? 'error' : undefined">
          <NStep
            v-for="(step, index) in orderSteps"
            :key="index"
            :title="step.title"
            :description="step.description"
            :status="step.status"
          />
        </NSteps>
      </NCard>

      <!-- 订单基本信息 -->
      <NCard title="订单信息" class="mb-6">
        <NDescriptions bordered :column="3">
          <NDescriptionsItem label="订单编号">
            {{ orderDetail.order_no }}
          </NDescriptionsItem>
          <NDescriptionsItem label="下单时间">
            {{ orderDetail.created_at }}
          </NDescriptionsItem>
          <NDescriptionsItem label="订单状态">
            <NTag :type="statusTagType[orderDetail.status]" size="small">
              {{ statusText[orderDetail.status] }}
            </NTag>
          </NDescriptionsItem>

          <NDescriptionsItem label="支付时间" :span="2">
            {{ orderDetail.payment_time || '未支付' }}
          </NDescriptionsItem>
          <NDescriptionsItem label="订单金额">
            ¥{{ orderDetail.total_amount.toFixed(2) }}
          </NDescriptionsItem>

          <NDescriptionsItem v-if="orderDetail.address" label="收货地址" :span="3">
            {{ orderDetail.address.province }}{{ orderDetail.address.city }}{{ orderDetail.address.district }}{{ orderDetail.address.detail }}
          </NDescriptionsItem>

          <NDescriptionsItem label="收货人" :span="2">
            {{ orderDetail.address?.recipient_name || '未提供' }}
          </NDescriptionsItem>
          <NDescriptionsItem label="联系电话">
            {{ orderDetail.address?.recipient_phone || '未提供' }}
          </NDescriptionsItem>
        </NDescriptions>
      </NCard>

      <!-- 客户信息 -->
      <NCard title="客户信息" class="mb-6">
        <NDescriptions bordered :column="2">
          <NDescriptionsItem label="收货人">
            {{ orderDetail.address?.recipient_name || '未提供' }}
          </NDescriptionsItem>
          <NDescriptionsItem label="联系电话">
            {{ orderDetail.address?.recipient_phone || '未提供' }}
          </NDescriptionsItem>
          <NDescriptionsItem label="收货地址" :span="2">
            {{ orderDetail.address ? `${orderDetail.address.province}${orderDetail.address.city}${orderDetail.address.district}${orderDetail.address.detail}` : '未提供' }}
          </NDescriptionsItem>
          <NDescriptionsItem v-if="orderDetail.address?.detail" label="详细地址" :span="2">
            {{ orderDetail.address.detail }}
          </NDescriptionsItem>
        </NDescriptions>
      </NCard>

      <!-- 订单商品 -->
      <NCard title="订单商品" class="mb-6">
        <NTable :bordered="false" :single-line="false">
          <thead>
            <tr>
              <th>商品信息</th>
              <th style="width: 100px">
                单价
              </th>
              <th style="width: 100px">
                数量
              </th>
              <th style="width: 120px">
                小计
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in orderDetail.items" :key="item.id">
              <td>
                <div class="flex items-center">
                  <div v-if="item.product?.main_image_url" class="mr-3">
                    <img :src="item.product.main_image_url" alt="" class="w-16 h-16 object-cover rounded">
                  </div>
                  <div>
                    <p>{{ item.product?.name || '商品信息不可用' }}</p>
                  </div>
                </div>
              </td>
              <td>¥{{ item.price.toFixed(2) }}</td>
              <td>{{ item.quantity }}</td>
              <td>¥{{ item.subtotal.toFixed(2) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" class="text-right">
                总计：
              </td>
              <td>¥{{ orderDetail.total_amount.toFixed(2) }}</td>
            </tr>
          </tfoot>
        </NTable>
      </NCard>
    </template>

    <!-- 更新状态弹窗 -->
    <NModal
      v-model:show="showStatusModal"
      preset="dialog"
      title="更新订单状态"
      positive-text="确认"
      negative-text="取消"
      :on-positive-click="updateOrderStatusHandler"
    >
      <NForm :model="statusForm" label-placement="left" label-width="100px">
        <NFormItem label="新状态" required>
          <NSelect
            v-model:value="statusForm.status"
            :options="statusOptions"
            placeholder="选择要更新的状态"
          />
        </NFormItem>

        <NFormItem v-if="needTrackingNumber" label="物流单号" required>
          <NInput
            v-model:value="statusForm.tracking_number"
            placeholder="请输入物流单号"
          />
        </NFormItem>
      </NForm>
    </NModal>

    <!-- 发货弹窗 -->
    <NModal
      v-model:show="showShipModal"
      preset="dialog"
      title="商品发货"
      positive-text="确认发货"
      negative-text="取消"
      :on-positive-click="handleShipOrder"
    >
      <NForm :model="shipForm" label-placement="left" label-width="100px">
        <NFormItem label="物流公司" required>
          <NInput
            v-model:value="shipForm.shipping_company"
            placeholder="请输入物流公司名称"
          />
        </NFormItem>
        <NFormItem label="物流单号" required>
          <NInput
            v-model:value="shipForm.tracking_number"
            placeholder="请输入物流单号"
          />
        </NFormItem>
      </NForm>
    </NModal>

    <!-- 退款处理弹窗 -->
    <NModal
      v-model:show="showRefundModal"
      preset="dialog"
      title="处理退款申请"
      positive-text="确认"
      negative-text="取消"
      :on-positive-click="handleRefundRequest"
    >
      <NForm :model="refundForm" label-placement="left" label-width="120px">
        <NFormItem label="退款处理" required>
          <NInputGroup>
            <NButton
              :type="refundForm.action === 'approve' ? 'primary' : 'default'"
              @click="refundForm.action = 'approve'"
            >
              同意退款
            </NButton>
            <NButton
              :type="refundForm.action === 'reject' ? 'error' : 'default'"
              @click="refundForm.action = 'reject'"
            >
              拒绝退款
            </NButton>
          </NInputGroup>
        </NFormItem>

        <NFormItem v-if="refundForm.action === 'reject'" label="拒绝原因" required>
          <NInput
            v-model:value="refundForm.reason"
            type="textarea"
            placeholder="请输入拒绝退款的原因"
            :rows="3"
          />
        </NFormItem>

        <NText v-if="refundForm.action === 'approve'" depth="3">
          同意退款后，系统将自动为客户退款，订单状态将变更为"已退款"。
        </NText>
      </NForm>
    </NModal>
  </div>
</template>

<style scoped>
</style>
