<script lang="ts" setup>
import { h, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  NButton,
  NDataTable,
  NDatePicker,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NModal,
  NPopconfirm,
  NSelect,
  NSpace,
  NTag,
  useMessage,
} from 'naive-ui'
import type { DataTableColumns, FormInst } from 'naive-ui'
import { deleteRace, getRaceList } from '@/api/admin/race'
import type { Race } from '@/api/admin/race'
import { useRaceStore } from '@/store/modules/race'
import { createVolunteerTask } from '@/api/admin/volunteer'
import type { CreateVolunteerTaskRequest } from '@/api/admin/volunteer'

const router = useRouter()
const message = useMessage()
const raceStore = useRaceStore()
const formRef = ref<FormInst | null>(null)

// 搜索和筛选参数
const searchQuery = ref('')
const filterStatus = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 表格数据和加载状态
const races = ref<Race[]>([])
const loading = ref(false)

// 志愿者任务相关
const showVolunteerTaskModal = ref(false)
const submittingTask = ref(false)
const currentRaceId = ref<number | null>(null)
const currentRaceName = ref('')

// 由于Naive UI的日期选择器需要时间戳，而API需要字符串，使用任意类型来处理
const taskForm = ref<any>({
  raceId: 0,
  name: '',
  description: '',
  startTime: null,
  endTime: null,
  location: '',
  requiredNumber: 5,
  status: 1,
})

// 分页设置
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0,
})

// 添加原始数据保存变量
const originalRaces = ref<Race[]>([])
const filteredRaces = ref<Race[]>([])

// 状态选项应该和 statusMap 保持一致
const statusOptions = [
  { label: '全部', value: null },
  { label: '未开始', value: 0 },
  { label: '报名中', value: 1 },
  { label: '进行中', value: 2 },
  { label: '已结束', value: 3 },
  { label: '已取消', value: 4 },
]

// 状态映射
const statusMap = {
  0: { type: 'default', text: '未开始' },
  1: { type: 'info', text: '报名中' },
  2: { type: 'warning', text: '进行中' },
  3: { type: 'success', text: '已结束' },
  4: { type: 'error', text: '已取消' },
}

// 获取赛事状态文本
const getStatusText = (status: number | null) => {
  if (status === null)
    return ''
  return statusMap[status as keyof typeof statusMap]?.text || ''
}

// 应用前端筛选
const applyFilters = () => {
  // 确保原始数据有效
  if (!originalRaces.value || originalRaces.value.length === 0) {
    filteredRaces.value = []
    races.value = []
    total.value = 0
    return
  }

  // 如果没有设置筛选条件，显示全部数据
  if (!searchQuery.value && filterStatus.value === null) {
    filteredRaces.value = originalRaces.value
    races.value = originalRaces.value
    total.value = originalRaces.value.length
    return
  }

  try {
    // 应用筛选
    let filtered = [...originalRaces.value]

    // 按名称或地点搜索
    if (searchQuery.value) {
      const keyword = searchQuery.value.toLowerCase()
      filtered = filtered.filter((race) => {
        if (!race)
          return false

        // 检查赛事名称是否包含关键词
        const nameMatch = race.name ? race.name.toLowerCase().includes(keyword) : false
        // 检查地点是否包含关键词
        const locationMatch = race.location ? race.location.toLowerCase().includes(keyword) : false

        return nameMatch || locationMatch
      })
    }

    // 按状态筛选
    if (filterStatus.value !== null) {
      filtered = filtered.filter((race) => {
        if (!race)
          return false

        return race.status === filterStatus.value
      })
    }

    // 更新筛选后的数据
    filteredRaces.value = filtered
    races.value = filtered
    total.value = filtered.length

    // 更新分页信息
    pagination.value.total = filtered.length
  }
  catch (error) {
    console.error('筛选数据时发生错误:', error)
    message.error('筛选数据时发生错误')

    // 出错时重置为原始数据
    filteredRaces.value = originalRaces.value
    races.value = originalRaces.value
    total.value = originalRaces.value.length
    pagination.value.total = originalRaces.value.length
  }
}

// 获取比赛列表
const fetchRaces = async () => {
  loading.value = true
  try {
    const response = await getRaceList({
      pageNum: pagination.value.page,
      pageSize: pagination.value.pageSize,
    })
    if (response.code === 200) {
      // 保存原始数据
      originalRaces.value = response.data.list
      filteredRaces.value = response.data.list
      races.value = response.data.list
      total.value = response.data.total
      pagination.value.total = response.data.total
    }
    else {
      message.error(response.message || '获取比赛列表失败')
    }
  }
  catch (error) {
    console.error('Error fetching races:', error)
    message.error('获取比赛列表失败')
  }
  finally {
    loading.value = false
  }
}

// 删除比赛
const handleDelete = async (id: number) => {
  try {
    await deleteRace(id)
    message.success('删除成功')
    fetchRaces()
  }
  catch (error) {
    console.error('Error deleting race:', error)
    message.error('删除失败')
  }
}

// 打开创建志愿者任务模态框
const openVolunteerTaskModal = (race: Race) => {
  currentRaceId.value = race.id
  currentRaceName.value = race.name

  // 初始化表单
  taskForm.value = {
    raceId: race.id,
    name: `${race.name}志愿者任务`,
    description: '',
    // 尝试转换为时间戳给日期选择器使用
    startTime: new Date(race.startTime).getTime() || null,
    endTime: new Date(race.endTime).getTime() || null,
    location: race.location,
    requiredNumber: 5,
    status: 1,
  }

  showVolunteerTaskModal.value = true
}

// 格式化时间为北京时间
const formatDateTime = (dateStr: string) => {
  if (!dateStr)
    return ''

  const date = new Date(dateStr)
  // 转换为北京时间
  const beijingTime = new Date(date.getTime() + (8 * 60 * 60 * 1000))
  return beijingTime.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

// 创建志愿者任务
const submitVolunteerTask = async () => {
  if (!formRef.value)
    return

  formRef.value.validate(async (errors) => {
    if (errors) {
      message.error('请完善表单信息')
      return
    }

    // 准备提交的数据
    const submitData: CreateVolunteerTaskRequest = {
      raceId: taskForm.value.raceId,
      name: taskForm.value.name,
      description: taskForm.value.description || '',
      // 转换时间戳为UTC时间字符串
      startTime: new Date(taskForm.value.startTime - (8 * 60 * 60 * 1000)).toISOString().slice(0, 19).replace('T', ' '),
      endTime: new Date(taskForm.value.endTime - (8 * 60 * 60 * 1000)).toISOString().slice(0, 19).replace('T', ' '),
      location: taskForm.value.location,
      requiredNumber: taskForm.value.requiredNumber,
      status: taskForm.value.status,
    }

    submittingTask.value = true
    try {
      const response = await createVolunteerTask(submitData)
      if (response.code === 200) {
        message.success('创建志愿者任务成功')
        showVolunteerTaskModal.value = false
      }
      else {
        message.error(response.message || '创建志愿者任务失败')
      }
    }
    catch (error) {
      console.error('Error creating volunteer task:', error)
      message.error('创建志愿者任务失败')
    }
    finally {
      submittingTask.value = false
    }
  })
}

// 搜索赛事
const handleSearch = () => {
  try {
    // 重置分页到第一页
    pagination.value.page = 1

    // 应用筛选
    applyFilters()

    // 显示提示信息
    if (searchQuery.value || filterStatus.value !== null)
      message.info('已在前端筛选数据')
  }
  catch (error) {
    console.error('搜索处理错误:', error)
    message.error('搜索处理出错')
  }
}

// 重置筛选条件
const handleReset = () => {
  try {
    // 重置筛选条件
    searchQuery.value = ''
    filterStatus.value = null

    // 如果已经从服务器获取过数据，直接使用
    if (originalRaces.value.length > 0) {
      races.value = originalRaces.value
      filteredRaces.value = originalRaces.value
      total.value = originalRaces.value.length
      pagination.value.total = originalRaces.value.length
      pagination.value.page = 1
    }
    else {
      // 否则重新从服务器获取
      fetchRaces()
    }

    // 显示提示信息
    message.success('已重置筛选条件')
  }
  catch (error) {
    console.error('重置筛选错误:', error)
    message.error('重置筛选出错')
    // 出错时也尝试从服务器获取
    fetchRaces()
  }
}

// 页码改变
const handlePageChange = (page: number) => {
  pagination.value.page = page

  // 如果有筛选条件，使用前端分页
  if (searchQuery.value || filterStatus.value !== null) {
    // 计算当前页的数据
    const startIdx = (page - 1) * pagination.value.pageSize
    const endIdx = startIdx + pagination.value.pageSize
    races.value = filteredRaces.value.slice(startIdx, Math.min(endIdx, filteredRaces.value.length))
  }
  else {
    // 如果没有筛选，则请求后端
    fetchRaces()
  }
}

// 每页条数改变
const handlePageSizeChange = (pageSize: number) => {
  pagination.value.pageSize = pageSize
  pagination.value.page = 1

  // 如果有筛选条件，使用前端分页
  if (searchQuery.value || filterStatus.value !== null) {
    // 获取第一页的数据
    races.value = filteredRaces.value.slice(0, Math.min(pageSize, filteredRaces.value.length))
  }
  else {
    // 如果没有筛选，则请求后端
    fetchRaces()
  }
}

// 创建比赛
const handleCreate = () => {
  router.push('/admin/race/create')
}

// 表格列定义
const columns: DataTableColumns<Race> = [
  { title: 'ID', key: 'id', width: 80 },
  { title: '比赛名称', key: 'name' },
  { title: '地点', key: 'location' },
  {
    title: '开始时间',
    key: 'startTime',
    render(row) {
      return formatDateTime(row.startTime)
    },
  },
  {
    title: '结束时间',
    key: 'endTime',
    render(row) {
      return formatDateTime(row.endTime)
    },
  },
  {
    title: '状态',
    key: 'status',
    render(row) {
      const status = statusMap[row.status as keyof typeof statusMap]
      return h(NTag, { type: status.type as 'default' | 'info' | 'warning' | 'success' }, { default: () => status.text })
    },
  },
  {
    title: '操作',
    key: 'actions',
    render(row) {
      return h(NSpace, {}, {
        default: () => [
          h(
            NButton,
            {
              size: 'small',
              onClick: () => {
                raceStore.setCurrentRace(row)
                router.push({
                  name: 'EditRace',
                  params: { id: row.id },
                })
              },
            },
            { default: () => '编辑' },
          ),
          h(
            NButton,
            {
              size: 'small',
              onClick: () => {
                router.push({
                  name: 'RaceSchedule',
                  params: { id: row.id },
                })
              },
            },
            { default: () => '日程' },
          ),
          h(
            NButton,
            {
              size: 'small',
              type: 'success',
              onClick: () => openVolunteerTaskModal(row),
            },
            { default: () => '创建志愿任务' },
          ),
          h(
            NPopconfirm,
            {
              onPositiveClick: () => handleDelete(row.id),
            },
            {
              default: () => '确认删除？',
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
      })
    },
  },
]

// 组件挂载时获取数据
onMounted(() => {
  fetchRaces()
})
</script>

<template>
  <div class="event-list-container">
    <div class="page-header">
      <h1>赛事管理</h1>
      <NButton type="primary" @click="handleCreate">
        创建新赛事
      </NButton>
    </div>

    <div class="search-filter">
      <NForm inline>
        <NFormItem label="赛事状态">
          <NSelect
            v-model:value="filterStatus"
            style="width: 160px"
            :options="statusOptions"
            clearable
            placeholder="全部状态"
          />
        </NFormItem>
        <NFormItem label="搜索关键词">
          <NInput
            v-model:value="searchQuery"
            style="width: 240px"
            placeholder="输入赛事名称或地点"
            clearable
          />
        </NFormItem>
        <NFormItem>
          <NButton type="primary" @click="handleSearch">
            搜索
          </NButton>
          <NButton style="margin-left: 12px" @click="handleReset">
            重置
          </NButton>
        </NFormItem>
      </NForm>

      <!-- 显示当前筛选条件 -->
      <div v-if="searchQuery || filterStatus !== null" style="margin-top: 10px; color: #409EFF;">
        当前筛选:
        {{ searchQuery ? `关键词 "${searchQuery}"` : '' }}
        {{ (searchQuery && filterStatus !== null) ? ' 和 ' : '' }}
        {{ filterStatus !== null ? `状态 "${getStatusText(filterStatus)}"` : '' }}
      </div>
    </div>

    <div class="event-table">
      <NDataTable
        :columns="columns"
        :data="races"
        :loading="loading"
        :pagination="pagination"
        :bordered="false"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
    </div>

    <!-- 创建志愿者任务模态框 -->
    <NModal
      v-model:show="showVolunteerTaskModal"
      title="创建志愿者任务"
      preset="card"
      style="width: 600px;"
      :mask-closable="false"
    >
      <NForm
        ref="formRef"
        :model="taskForm"
        label-placement="left"
        label-width="auto"
        require-mark-placement="right-hanging"
      >
        <NFormItem label="赛事名称" path="raceId">
          <div>{{ currentRaceName }}</div>
        </NFormItem>

        <NFormItem label="任务名称" path="name" required>
          <NInput v-model:value="taskForm.name" placeholder="请输入任务名称" />
        </NFormItem>

        <NFormItem label="任务描述" path="description">
          <NInput
            v-model:value="taskForm.description"
            type="textarea"
            placeholder="请输入任务描述（可选）"
            :rows="3"
          />
        </NFormItem>

        <NFormItem label="开始时间" path="startTime" required>
          <NDatePicker
            v-model:value="taskForm.startTime"
            type="datetime"
            clearable
            style="width: 100%"
          />
        </NFormItem>

        <NFormItem label="结束时间" path="endTime" required>
          <NDatePicker
            v-model:value="taskForm.endTime"
            type="datetime"
            clearable
            style="width: 100%"
          />
        </NFormItem>

        <NFormItem label="任务地点" path="location" required>
          <NInput v-model:value="taskForm.location" placeholder="请输入任务地点" />
        </NFormItem>

        <NFormItem label="需要人数" path="requiredNumber" required>
          <NInputNumber
            v-model:value="taskForm.requiredNumber"
            :min="1"
            :max="100"
            style="width: 100%"
          />
        </NFormItem>

        <NFormItem label="任务状态" path="status">
          <NSelect
            v-model:value="taskForm.status"
            :options="[
              { label: '开放报名', value: 1 },
              { label: '关闭报名', value: 0 },
            ]"
          />
        </NFormItem>
      </NForm>

      <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
        <NButton style="margin-right: 12px;" @click="showVolunteerTaskModal = false">
          取消
        </NButton>
        <NButton type="primary" :loading="submittingTask" @click="submitVolunteerTask">
          创建
        </NButton>
      </div>
    </NModal>
  </div>
</template>

<style scoped>
.event-list-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.search-filter {
  margin-bottom: 20px;
  background-color: #f8f8f8;
  padding: 16px;
  border-radius: 4px;
}

.event-table {
  background-color: #fff;
  border-radius: 4px;
  padding: 8px;
}
</style>
