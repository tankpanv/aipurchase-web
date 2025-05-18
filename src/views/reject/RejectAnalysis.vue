<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import type { DataTableColumns, FormInst, FormRules, UploadFileInfo } from 'naive-ui'
import {
  NButton,
  NCard,
  NDataTable,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NModal,
  NSpace,
  NUpload,
  NUploadDragger,
  useDialog,
  useMessage,
} from 'naive-ui'
import { useECharts } from '@/composables/useECharts'
import {
  type RejectDocument,
  type RejectStats,
  deleteRejectDocument,
  downloadRejectTemplate,
  exportRejectData,
  getRejectDocuments,
  getRejectStats,
  updateRejectDocument,
  uploadRejectData,
} from '@/api/reject'
import { safeDownloadFile } from '@/utils/file'

const message = useMessage()
const dialog = useDialog()

// 搜索参数
const searchParams = ref({
  month: '',
  page: 1,
  per_page: 10,
})

// 表格数据
const tableData = ref<RejectDocument[]>([])
const loading = ref(false)
const pagination = ref({
  page: 1,
  pageSize: 10,
  itemCount: 0, // 总条数
  pageSizes: [10, 20, 30, 50], // 每页条数选项
  showSizePicker: true, // 显示每页条数选择器
  prefix({ itemCount }) {
    return `共 ${itemCount} 条`
  },
})

// 统计数据
const statsData = ref<RejectStats[]>([])

// 表格列定义
const columns = computed<DataTableColumns<RejectDocument>>(() => [
  { title: '单据月份', key: 'month' },
  { title: '单据号', key: 'doc_number' },
  { title: '单据摘要', key: 'summary' },
  {
    title: '单据金额',
    key: 'amount',
    render: row => `¥${row.amount.toFixed(2)}`,
  },
  { title: '凭证类别', key: 'voucher_type' },
  { title: '凭证月份', key: 'voucher_month' },
  { title: '凭证号', key: 'voucher_number' },
  { title: '驳回原因', key: 'reject_reason' },
  {
    title: '操作',
    key: 'actions',
    render: (row) => {
      return h(NSpace, null, {
        default: () => [
          h(
            NButton,
            {
              size: 'small',
              onClick: () => handleEdit(row),
            },
            { default: () => '修改' },
          ),
          h(
            NButton,
            {
              size: 'small',
              type: 'error',
              onClick: () => handleDelete(row),
            },
            { default: () => '删除' },
          ),
        ],
      })
    },
  },
])

// 加载数据
async function loadData() {
  loading.value = true
  try {
    const [docRes, statsRes] = await Promise.all([
      getRejectDocuments({
        page: pagination.value.page,
        per_page: pagination.value.pageSize,
        month: searchParams.value.month || undefined,
      }),
      getRejectStats(),
    ])

    if (docRes.code === 200) {
      tableData.value = docRes.data.items
      // 更新分页信息
      pagination.value = {
        ...pagination.value,
        page: docRes.data.page,
        pageSize: docRes.data.per_page,
        itemCount: docRes.data.total,
      }
    }
    else {
      throw new Error(docRes.message || '加载数据失败')
    }

    if (statsRes.code === 200) {
      statsData.value = statsRes.data.items
      updateChart()
    }
  }
  catch (error: any) {
    message.error(error?.message || '加载数据失败')
    console.error('加载数据错误:', error)
    // 确保在错误时也有空数据显示
    tableData.value = []
    statsData.value = []
  }
  finally {
    loading.value = false
  }
}

// 图表相关
const { chartRef, initChart } = useECharts()

function updateChart() {
  const chart = initChart()
  if (!chart)
    return

  const option = {
    title: {
      text: '驳回率分析柱状图',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}%',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: statsData.value.map(item => item.month),
      axisLabel: {
        interval: 0,
      },
    },
    yAxis: {
      type: 'value',
      name: '驳回率(%)',
      axisLabel: {
        formatter: '{value}%',
      },
    },
    series: [
      {
        name: '驳回率',
        type: 'bar',
        data: statsData.value.map(item => ({
          value: (item.reject_rate * 100).toFixed(2),
          itemStyle: {
            color: '#4B9EFF',
          },
        })),
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%',
        },
        barWidth: '30px',
        barMaxWidth: '30px',
        barMinWidth: '15px',
      },
    ],
  }
  chart.setOption(option)
}

// 搜索处理
function handleSearch() {
  pagination.value.page = 1 // 搜索时重置为第一页
  loadData()
}

// 分页处理
function handlePageChange(currentPage: number) {
  pagination.value.page = currentPage
  loadData()
}

// 添加每页条数变化处理函数
function handlePageSizeChange(pageSize: number) {
  pagination.value.pageSize = pageSize
  pagination.value.page = 1 // 切换每页条数时重置为第一页
  loadData()
}

// 文件上传相关
const showUploadModal = ref(false)
const uploadFiles = ref<UploadFileInfo[]>([])
const uploading = ref(false)

// 处理文件选择
function handleFileSelect(options: { file: UploadFileInfo; fileList: UploadFileInfo[] }) {
  uploadFiles.value = [options.file]
}

// 处理文件移除
function handleFileRemove(options: { file: UploadFileInfo; fileList: UploadFileInfo[] }) {
  uploadFiles.value = options.fileList
}

// 确认上传
async function confirmUpload() {
  if (uploadFiles.value.length === 0) {
    message.warning('请先选择文件')
    return
  }

  try {
    uploading.value = true
    const file = uploadFiles.value[0].file as File

    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      message.error('请上传Excel文件（.xlsx或.xls格式）')
      return
    }

    const response = await uploadRejectData(file)

    if (response.data.failed > 0)
      message.warning(`导入完成，成功：${response.data.success}条，失败：${response.data.failed}条`)

    else
      message.success(`成功导入${response.data.success}条数据`)

    showUploadModal.value = false
    uploadFiles.value = []
    loadData() // 刷新数据
  }
  catch (error: any) {
    message.error(error.message || '上传失败')
  }
  finally {
    uploading.value = false
  }
}

// 取消上传
function cancelUpload() {
  uploadFiles.value = []
  showUploadModal.value = false
}

// 下载模板
async function handleDownloadTemplate() {
  try {
    const blob = await downloadRejectTemplate()
    const success = safeDownloadFile(blob, '驳回单据导入模板.xlsx')

    if (success)
      message.success('模板下载成功')
    else
      throw new Error('下载失败')
  }
  catch (error) {
    message.error('下载模板失败')
  }
}

// 导出Excel
async function handleExport() {
  try {
    loading.value = true
    // 获取所有数据（使用较大的每页数量）
    const res = await getRejectDocuments({
      page: 1,
      per_page: 1000, // 设置较大的数值以获取所有数据
      month: searchParams.value.month || undefined,
    })

    if (res.code === 200) {
      const blob = await exportRejectData(res.data.items)
      const filename = `驳回单据数据_${new Date().toLocaleDateString()}.xlsx`
      const success = safeDownloadFile(blob, filename)

      if (success)
        message.success('导出成功')
      else
        throw new Error('导出失败')
    }
    else {
      throw new Error(res.message || '获取数据失败')
    }
  }
  catch (error: any) {
    message.error(error.message || '导出失败')
  }
  finally {
    loading.value = false
  }
}

// 处理文件上传按钮点击
function handleUploadClick() {
  showUploadModal.value = true
}

// 修改类型定义
interface RejectFormData {
  id?: number
  month: string
  doc_number: string
  summary: string
  amount: number
  voucher_type: string
  voucher_month: string
  voucher_number: string
  reject_reason: string
}

// 编辑相关
const showEditModal = ref(false)
const editForm = ref<RejectFormData>({
  month: '',
  doc_number: '',
  summary: '',
  amount: 0,
  voucher_type: '',
  voucher_month: '',
  voucher_number: '',
  reject_reason: '',
})
const editLoading = ref(false)

// 添加表单引用
const formRef = ref<FormInst | null>(null)

// 添加表单验证规则
const rules: FormRules = {
  month: {
    required: true,
    message: '请输入单据月份',
    trigger: ['blur', 'input'],
  },
  doc_number: {
    required: true,
    message: '请输入单据号',
    trigger: ['blur', 'input'],
  },
  summary: {
    required: true,
    message: '请输入单据摘要',
    trigger: ['blur', 'input'],
  },
  amount: {
    required: true,
    type: 'number',
    message: '请输入单据金额',
    trigger: ['blur', 'input'],
  },
  voucher_type: {
    required: true,
    message: '请输入凭证类别',
    trigger: ['blur', 'input'],
  },
  voucher_month: {
    required: true,
    message: '请输入凭证月份',
    trigger: ['blur', 'input'],
  },
  voucher_number: {
    required: true,
    message: '请输入凭证号',
    trigger: ['blur', 'input'],
  },
  reject_reason: {
    required: true,
    message: '请输入驳回原因',
    trigger: ['blur', 'input'],
  },
}

// 处理编辑
function handleEdit(row: RejectDocument) {
  // 确保所有字段都被正确复制
  editForm.value = {
    id: row.id,
    month: row.month,
    doc_number: row.doc_number,
    summary: row.summary,
    amount: row.amount,
    voucher_type: row.voucher_type,
    voucher_month: row.voucher_month,
    voucher_number: row.voucher_number,
    reject_reason: row.reject_reason,
  }
  showEditModal.value = true
}

// 处理编辑提交
async function handleEditSubmit(e: MouseEvent) {
  e.preventDefault()
  if (!editForm.value.id) {
    message.warning('无效的记录ID')
    return false
  }

  try {
    await formRef.value?.validate()
  }
  catch (errors) {
    return false
  }

  editLoading.value = true
  try {
    const res = await updateRejectDocument(editForm.value.id, {
      month: editForm.value.month,
      doc_number: editForm.value.doc_number,
      summary: editForm.value.summary,
      amount: editForm.value.amount,
      voucher_type: editForm.value.voucher_type,
      voucher_month: editForm.value.voucher_month,
      voucher_number: editForm.value.voucher_number,
      reject_reason: editForm.value.reject_reason,
    })

    if (res.code === 200) {
      message.success('修改成功')
      await loadData() // 刷新列表
      return true
    }
    else {
      throw new Error(res.message)
    }
  }
  catch (error: any) {
    console.error('修改失败:', error)
    message.error(error.message || '修改失败')
    return false
  }
  finally {
    editLoading.value = false
  }
}

function handleEditCancel() {
  showEditModal.value = false
  formRef.value?.restoreValidation()
  editForm.value = {
    month: '',
    doc_number: '',
    summary: '',
    amount: 0,
    voucher_type: '',
    voucher_month: '',
    voucher_number: '',
    reject_reason: '',
  }
}

// 处理删除
function handleDelete(row: RejectDocument) {
  if (!row.id)
    return

  dialog.warning({
    title: '确认删除',
    content: '确定要删除这条记录吗？此操作不可恢复。',
    positiveText: '确认删除',
    negativeText: '取消',
    type: 'warning',
    onPositiveClick: async () => {
      try {
        const res = await deleteRejectDocument(row.id!)
        if (res.code === 200) {
          message.success('删除成功')
          await loadData() // 刷新列表
        }
        else {
          throw new Error(res.message)
        }
      }
      catch (error: any) {
        console.error('删除失败:', error)
        message.error(error.message || '删除失败')
      }
    },
  })
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="reject-analysis">
    <div class="operation-bar">
      <NSpace>
        <NInput
          v-model:value="searchParams.month"
          placeholder="搜索单据月份"
          @keyup.enter="handleSearch"
        />
        <NButton type="primary" @click="handleSearch">
          搜索
        </NButton>
        <NButton @click="handleUploadClick">
          文件上传
        </NButton>
        <NButton @click="handleDownloadTemplate">
          模版下载
        </NButton>
        <NButton @click="handleExport">
          导出Excel
        </NButton>
      </NSpace>
    </div>

    <NSpace vertical size="large">
      <!-- 驳回单据列表 -->
      <NDataTable
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        remote
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />

      <!-- 驳回率柱状图 -->
      <NCard title="驳回率分析" class="chart-card">
        <div ref="chartRef" class="chart-container" />
      </NCard>

      <!-- 驳回统计表 -->
      <NCard title="单据驳回统计表">
        <NDataTable
          :columns="[
            { title: '月份', key: 'month' },
            { title: '录入单据数', key: 'total_docs' },
            { title: '驳回单据数', key: 'rejected_docs' },
            {
              title: '月度驳回率',
              key: 'reject_rate',
              render: (row) => `${(row.reject_rate * 100).toFixed(2)}%`,
            },
          ]"
          :data="statsData"
          :pagination="false"
        />
      </NCard>
    </NSpace>

    <!-- 上传对话框 -->
    <NModal
      v-model:show="showUploadModal"
      title="上传驳回单据数据"
      :show-icon="false"
      style="width: 500px"
      preset="dialog"
      :mask-closable="false"
    >
      <div class="upload-modal-content">
        <NUpload
          accept=".xlsx,.xls"
          :default-upload="false"
          :max="1"
          :file-list="uploadFiles"
          @change="handleFileSelect"
          @remove="handleFileRemove"
        >
          <NUploadDragger>
            <div class="upload-dragger-content">
              <div class="upload-icon">
                <svg-icon icon="ri:file-excel-2-line" class="text-3xl text-primary" />
              </div>
              <div class="upload-text">
                <p class="primary-text">
                  点击或拖动Excel文件到此区域
                </p>
                <p class="secondary-text">
                  支持 .xlsx、.xls 格式的文件
                </p>
              </div>
            </div>
          </NUploadDragger>
        </NUpload>

        <div class="upload-tips">
          <div class="tip-item">
            <svg-icon icon="ri:information-line" class="text-warning" />
            <span>请先下载模板，按照模板格式填写数据</span>
          </div>
          <div class="tip-item">
            <svg-icon icon="ri:error-warning-line" class="text-warning" />
            <span>上传文件会覆盖原有数据，请谨慎操作</span>
          </div>
        </div>
      </div>

      <template #action>
        <NSpace justify="end">
          <NButton :disabled="uploading" @click="cancelUpload">
            取消
          </NButton>
          <NButton
            type="primary"
            :loading="uploading"
            :disabled="uploadFiles.length === 0"
            @click="confirmUpload"
          >
            确认上传
          </NButton>
        </NSpace>
      </template>
    </NModal>

    <!-- 添加编辑对话框 -->
    <NModal
      v-model:show="showEditModal"
      title="编辑驳回单据"
      :show-icon="false"
      style="width: 600px"
      preset="dialog"
      :mask-closable="false"
      positive-text="确认"
      negative-text="取消"
      @positive-click="handleEditSubmit"
      @negative-click="handleEditCancel"
    >
      <NForm
        ref="formRef"
        :model="editForm"
        :rules="rules"
      >
        <NFormItem label="单据月份" required>
          <NInput v-model:value="editForm.month" placeholder="请输入单据月份" />
        </NFormItem>
        <NFormItem label="单据号" required>
          <NInput v-model:value="editForm.doc_number" placeholder="请输入单据号" />
        </NFormItem>
        <NFormItem label="单据摘要" required>
          <NInput v-model:value="editForm.summary" placeholder="请输入单据摘要" />
        </NFormItem>
        <NFormItem label="单据金额" required>
          <NInputNumber
            v-model:value="editForm.amount"
            :min="0"
            :precision="2"
            placeholder="请输入单据金额"
          />
        </NFormItem>
        <NFormItem label="凭证类别" required>
          <NInput v-model:value="editForm.voucher_type" placeholder="请输入凭证类别" />
        </NFormItem>
        <NFormItem label="凭证月份" required>
          <NInput v-model:value="editForm.voucher_month" placeholder="请输入凭证月份" />
        </NFormItem>
        <NFormItem label="凭证号" required>
          <NInput v-model:value="editForm.voucher_number" placeholder="请输入凭证号" />
        </NFormItem>
        <NFormItem label="驳回原因" required>
          <NInput
            v-model:value="editForm.reject_reason"
            type="textarea"
            placeholder="请输入驳回原因"
          />
        </NFormItem>
      </NForm>
    </NModal>
  </div>
</template>

<style scoped>
.reject-analysis {
  padding: 20px;
}

.operation-bar {
  margin-bottom: 20px;
}

.chart-card {
  margin-top: 20px;
}

.chart-container {
  width: 100%;
  height: 400px;
  margin: 0 auto;
}

.upload-modal-content {
  padding: 20px 0;
}

.upload-dragger-content {
  padding: 32px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.upload-icon {
  font-size: 48px;
  color: #2951B8;
}

.upload-text {
  text-align: center;
}

.upload-text .primary-text {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
}

.upload-text .secondary-text {
  font-size: 14px;
  color: #666;
}

.upload-tips {
  margin-top: 20px;
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
}

.tip-item:last-child {
  margin-bottom: 0;
}
</style>
