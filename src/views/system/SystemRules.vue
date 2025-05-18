<script setup lang="ts">
import { h, onMounted, ref } from 'vue'
import {
  NButton,
  NDataTable,
  NForm,
  NFormItem,
  NInput,
  NModal,
  NSpace,
  NUpload,
  NUploadDragger,
  useMessage,
} from 'naive-ui'
import type { DataTableColumns, UploadFileInfo } from 'naive-ui'
import {
  type SystemDocument,
  deleteSystemDocument,
  getSystemDocuments,
  updateSystemDocument,
  uploadSystemDocument,
} from '@/api/system'
import AIAssistant from '@/components/AIAssistant.vue'

const message = useMessage()

// 表格数据
const tableData = ref<SystemDocument[]>([])
const loading = ref(false)

// 表格列定义
const columns: DataTableColumns<SystemDocument> = [
  {
    title: '序号',
    key: 'sequence',
    width: 80,
  },
  {
    title: '文件名',
    key: 'file_name',
    width: 300,
  },
  {
    title: '文件编号',
    key: 'file_code',
    width: 180,
  },
  {
    title: '文件下载',
    key: 'download',
    width: 100,
    render: row => h(
      NButton,
      {
        size: 'small',
        type: 'primary',
        onClick: () => handleDownload(row),
      },
      { default: () => '下载' },
    ),
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render: row => h(
      NSpace,
      { justify: 'center' },
      {
        default: () => [
          h(
            NButton,
            {
              text: true,
              type: 'primary',
              onClick: () => handleEdit(row),
            },
            { default: () => '修改' },
          ),
          h(
            NButton,
            {
              text: true,
              type: 'error',
              onClick: () => handleDelete(row),
            },
            { default: () => '删除' },
          ),
        ],
      },
    ),
  },
]

// 修改搜索参数
const searchParams = ref({
  page: 1,
  per_page: 10,
  keyword: '',
})

// 修改加载数据函数
async function loadData() {
  loading.value = true
  try {
    const res = await getSystemDocuments({
      page: searchParams.value.page,
      per_page: searchParams.value.per_page,
      keyword: searchParams.value.keyword || undefined,
    })

    if (res.code === 200) {
      tableData.value = res.data.items
      // 更新分页信息
      searchParams.value = {
        ...searchParams.value,
        page: res.data.page,
        per_page: res.data.per_page,
      }
    }
    else {
      throw new Error(res.message || '加载数据失败')
    }
  }
  catch (error: any) {
    message.error(error?.message || '加载数据失败')
    console.error('加载数据错误:', error)
    tableData.value = []
  }
  finally {
    loading.value = false
  }
}

// 文件上传相关的状态定义
const showUploadModal = ref(false)
const uploadForm = ref({
  file_name: '',
  file_code: '',
})
const uploadFiles = ref<UploadFileInfo[]>([])
const uploading = ref(false)

// 修改文件选择处理函数
function handleFileSelect(options: { file: UploadFileInfo }) {
  if (!options.file || !options.file.file)
    return

  uploadFiles.value = [options.file]

  // 自动填充文件名（如果未手动输入）
  if (!uploadForm.value.file_name) {
    const fileName = options.file.file.name
    uploadForm.value.file_name = fileName.substring(0, fileName.lastIndexOf('.')) || fileName
  }
}

// 处理文件移除
function handleFileRemove() {
  uploadFiles.value = []
}

// 修改上传提交处理函数
async function handleUploadSubmit() {
  const file = uploadFiles.value[0]?.file
  if (!file) {
    message.warning('请选择文件')
    return
  }

  if (!uploadForm.value.file_name || !uploadForm.value.file_code) {
    message.warning('请填写完整信息')
    return
  }

  uploading.value = true
  try {
    const res = await uploadSystemDocument(file, {
      file_name: uploadForm.value.file_name,
      file_code: uploadForm.value.file_code,
    })

    if (res.code === 200) {
      message.success('上传成功')
      resetUploadForm()
      showUploadModal.value = false
      await loadData() // 等待数据加载完成
    }
    else {
      throw new Error(res.message || '上传失败')
    }
  }
  catch (error) {
    console.error('上传失败:', error)
    message.error(error.message || '上传失败')
  }
  finally {
    uploading.value = false
  }
}

// 修改重置表单的函数
function resetUploadForm() {
  uploadForm.value.file_name = ''
  uploadForm.value.file_code = ''
  uploadFiles.value = []
  uploading.value = false
}

// 编辑相关
const showEditModal = ref(false)
const editForm = ref<Partial<SystemDocument>>({})

function handleEdit(row: SystemDocument) {
  editForm.value = { ...row }
  showEditModal.value = true
}

async function handleEditSubmit() {
  if (!editForm.value.id)
    return

  try {
    await updateSystemDocument(editForm.value.id, editForm.value)
    message.success('修改成功')
    showEditModal.value = false
    loadData()
  }
  catch (error) {
    message.error('修改失败')
  }
}

// 删除处理
async function handleDelete(row: SystemDocument) {
  try {
    await deleteSystemDocument(row.id)
    message.success('删除成功')
    loadData()
  }
  catch (error) {
    message.error('删除失败')
  }
}

// 修改下载处理函数
async function handleDownload(row: SystemDocument) {
  try {
    if (row.file_url) {
      // 创建一个隐藏的 a 标签来触发下载
      const link = document.createElement('a')
      link.href = row.file_url
      link.target = '_blank' // 可选：在新窗口打开
      link.download = row.file_name || `文件_${row.id}` // 使用文件名或默认名称
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      message.success('开始下载')
    }
    else {
      throw new Error('文件链接不存在')
    }
  }
  catch (error: any) {
    console.error('下载失败:', error)
    message.error('下载失败')
  }
}

// 修改分页处理函数
function handlePageChange(currentPage: number) {
  searchParams.value.page = currentPage
  loadData()
}

// 修改每页条数变化处理函数
function handlePageSizeChange(pageSize: number) {
  searchParams.value.per_page = pageSize
  searchParams.value.page = 1 // 切换每页条数时重置为第一页
  loadData()
}

// 修改搜索处理函数
function handleSearch() {
  searchParams.value.page = 1 // 搜索时重置为第一页
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="system-rules">
    <div class="operation-bar">
      <NSpace>
        <NInput
          v-model:value="searchParams.keyword"
          placeholder="搜索文件名称或编号"
          @keyup.enter="handleSearch"
        />
        <NButton type="primary" @click="handleSearch">
          搜索
        </NButton>
        <NButton type="primary" @click="showUploadModal = true">
          上传文件
        </NButton>
      </NSpace>
    </div>

    <NDataTable
      :columns="columns"
      :data="tableData"
      :loading="loading"
      :pagination="searchParams"
      :bordered="false"
      :single-line="false"
      remote
      @update:page="handlePageChange"
      @update:page-size="handlePageSizeChange"
    />

    <!-- 添加智能体组件 -->
    <AIAssistant />

    <!-- 上传对话框 -->
    <NModal
      v-model:show="showUploadModal"
      title="上传制度文件"
      preset="dialog"
      :mask-closable="false"
    >
      <NForm>
        <NFormItem label="文件名称" required>
          <NInput v-model:value="uploadForm.file_name" placeholder="请输入文件名称" />
        </NFormItem>
        <NFormItem label="文件编号" required>
          <NInput v-model:value="uploadForm.file_code" placeholder="请输入文件编号" />
        </NFormItem>
        <NFormItem label="选择文件" required>
          <NUpload
            accept=".pdf,.doc,.docx"
            :max="1"
            :show-file-list="true"
            :default-upload="false"
            :file-list="uploadFiles"
            @change="handleFileSelect"
            @remove="handleFileRemove"
          >
            <NUploadDragger>
              <div style="padding: 20px">
                <div class="upload-icon">
                  <svg-icon icon="ri:upload-cloud-2-line" class="text-3xl text-primary" />
                </div>
                <div class="upload-text">
                  <p class="primary-text">
                    点击或者拖动文件到该区域来上传
                  </p>
                  <p class="secondary-text">
                    支持 PDF、Word 格式
                  </p>
                </div>
              </div>
            </NUploadDragger>
          </NUpload>
        </NFormItem>
      </NForm>

      <template #action>
        <NSpace justify="end">
          <NButton @click="() => { showUploadModal = false; resetUploadForm() }">
            取消
          </NButton>
          <NButton
            type="primary"
            :loading="uploading"
            :disabled="uploadFiles.length === 0 || !uploadForm.file_name || !uploadForm.file_code"
            @click="handleUploadSubmit"
          >
            确认上传
          </NButton>
        </NSpace>
      </template>
    </NModal>

    <!-- 编辑对话框 -->
    <NModal
      v-model:show="showEditModal"
      title="编辑文件信息"
      preset="dialog"
      positive-text="确认"
      negative-text="取消"
      @positive-click="handleEditSubmit"
    >
      <NForm>
        <NFormItem label="文件名称" required>
          <NInput v-model:value="editForm.file_name" placeholder="请输入文件名称" />
        </NFormItem>
        <NFormItem label="文件编号" required>
          <NInput v-model:value="editForm.file_code" placeholder="请输入文件编号" />
        </NFormItem>
      </NForm>
    </NModal>
  </div>
</template>

<style scoped>
.system-rules {
  padding: 20px;
}

.operation-bar {
  margin-bottom: 20px;
}

.upload-icon {
  font-size: 48px;
  color: #2080f0;
  margin-bottom: 16px;
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

/* 添加分页相关样式 */
:deep(.n-data-table-wrapper) {
  margin-bottom: 16px;
}

:deep(.n-pagination) {
  justify-content: flex-end;
}
</style>
