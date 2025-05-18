<script lang="ts" setup>
import { h, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NButton,
  NCard,
  NDataTable,
  NDatePicker,
  NDescriptions,
  NDescriptionsItem,
  NForm,
  NFormItem,
  NInput,
  NModal,
  NPopconfirm,
  NSpace,
  NTag,
  useMessage,
} from 'naive-ui'
import {
  createRaceEvent,
  deleteRaceEvent,
  getRaceDetail,
  getRaceEventDetail,
  getRaceEventList,
  updateRaceEvent,
} from '@/api/admin/race'
import type { Race, RaceEvent } from '@/api/admin/race'
import { useRaceStore } from '@/store/modules/race'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const raceStore = useRaceStore()

const raceId = ref(parseInt(route.params.id as string))
const loading = ref(false)
const showModal = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const currentId = ref<number>()

const formRef = ref()
const formModel = ref({
  name: '',
  description: '',
  startTime: '',
  endTime: '',
  maxParticipants: 100,
  status: 0,
})

const events = ref<RaceEvent[]>([])
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0,
})

const rules = {
  name: {
    required: true,
    message: '请输入项目名称',
    trigger: 'blur',
  },
  startTime: {
    required: true,
    message: '请选择开始时间',
    trigger: 'blur',
  },
  endTime: {
    required: true,
    message: '请选择结束时间',
    trigger: 'blur',
  },
  maxParticipants: {
    required: true,
    message: '请输入最大参与人数',
    trigger: 'blur',
  },
}

// 工具函数
const formatDate = (date: string | undefined) => {
  if (!date)
    return ''
  return new Date(date).toLocaleString()
}

const getStatusType = (status: number | undefined) => {
  switch (status) {
    case 0:
      return 'default'
    case 1:
      return 'info'
    case 2:
      return 'warning'
    case 3:
      return 'success'
    default:
      return 'default'
  }
}

const getStatusText = (status: number | undefined) => {
  switch (status) {
    case 0:
      return '未开始'
    case 1:
      return '报名中'
    case 2:
      return '进行中'
    case 3:
      return '已结束'
    default:
      return '未知'
  }
}

const disableDateBefore = (date: string | undefined) => {
  if (!date)
    return () => false
  return (ts: number) => ts < new Date(date).getTime()
}

// API 调用函数
const fetchRaceDetail = async () => {
  try {
    const response = await getRaceDetail(raceId.value)
    if (response && response.code === 200 && response.data) {
      const raceData = response.data as Race
      raceStore.setCurrentRace(raceData)
    }
    else {
      message.error('获取比赛详情失败')
    }
  }
  catch (error) {
    console.error('Error fetching race detail:', error)
    message.error('获取比赛详情失败')
  }
}

const fetchEventDetail = async (id: number) => {
  try {
    const response = await getRaceEventDetail(raceId.value, id)
    if (response && response.code === 200 && response.data) {
      const eventData = response.data as unknown as RaceEvent
      formModel.value = {
        name: eventData.name,
        description: eventData.description,
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        maxParticipants: eventData.maxParticipants,
        status: eventData.status,
      }
    }
  }
  catch (error) {
    console.error('Error fetching event:', error)
    message.error('获取项目详情失败')
  }
}

const fetchEvents = async () => {
  
}

// 事件处理函数
const handleEdit = async (id: number) => {
  modalMode.value = 'edit'
  currentId.value = id
  await fetchEventDetail(id)
  showModal.value = true
}

const handleDelete = async (id: number) => {
  try {
    await deleteRaceEvent(raceId.value, id)
    message.success('删除成功')
    fetchEvents()
  }
  catch (error) {
    console.error('Error deleting event:', error)
    message.error('删除失败')
  }
}

const handleCreate = () => {
  modalMode.value = 'create'
  currentId.value = undefined
  formModel.value = {
    name: '',
    description: '',
    startTime: '',
    endTime: '',
    maxParticipants: 100,
    status: 0,
  }
  showModal.value = true
}

const handleBack = () => {
  router.push('/admin/race')
}

const handlePageChange = (page: number) => {
  pagination.value.page = page
  fetchEvents()
}

const handlePageSizeChange = (pageSize: number) => {
  pagination.value.pageSize = pageSize
  fetchEvents()
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    const data = { ...formModel.value }

    if (modalMode.value === 'edit' && currentId.value) {
      await updateRaceEvent(raceId.value, currentId.value, data)
      message.success('更新成功')
    }
    else {
      await createRaceEvent(raceId.value, data)
      message.success('创建成功')
    }

    showModal.value = false
    fetchEvents()
  }
  catch (error) {
    console.error('Error submitting form:', error)
    if (error instanceof Error)
      message.error(error.message)
    else
      message.error('提交失败')
  }
}

// 表格列定义
const columns = [
  {
    title: '序号',
    key: 'id',
    width: 80,
    align: 'center',
  },
  {
    title: '项目名称',
    key: 'name',
    align: 'left',
    width: 200,
  },
  {
    title: '项目描述',
    key: 'description',
    align: 'left',
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '开始时间',
    key: 'startTime',
    align: 'center',
    width: 180,
    render: (row: RaceEvent) => formatDate(row.startTime),
  },
  {
    title: '结束时间',
    key: 'endTime',
    align: 'center',
    width: 180,
    render: (row: RaceEvent) => formatDate(row.endTime),
  },
  {
    title: '参与人数',
    key: 'participants',
    align: 'center',
    width: 120,
    render: (row: RaceEvent) => {
      const currentParticipants = row.currentParticipants || 0
      const maxParticipants = row.maxParticipants || 0
      const isFull = maxParticipants !== 0 && currentParticipants >= maxParticipants
      return h(
        NTag,
        {
          type: isFull ? 'error' : 'success',
          style: { width: '80px', textAlign: 'center' },
        },
        { default: () => `${currentParticipants}/${maxParticipants}` },
      )
    },
  },
  {
    title: '状态',
    key: 'status',
    align: 'center',
    width: 100,
    render: (row: RaceEvent) => {
      const status = {
        0: { type: 'default', text: '未开始' },
        1: { type: 'info', text: '报名中' },
        2: { type: 'warning', text: '进行中' },
        3: { type: 'success', text: '已结束' },
      }
      const currentStatus = status[row.status as keyof typeof status]
      return h(
        NTag,
        { type: currentStatus.type as 'default' | 'info' | 'warning' | 'success' },
        { default: () => currentStatus.text },
      )
    },
  },
  {
    title: '操作',
    key: 'actions',
    align: 'center',
    width: 160,
    fixed: 'right',
    render: (row: RaceEvent) => {
      return h(NSpace, { justify: 'center' }, {
        default: () => [
          h(
            NButton,
            {
              size: 'small',
              type: 'primary',
              onClick: () => handleEdit(row.id),
              style: 'margin-right: 8px',
            },
            { default: () => '编辑' },
          ),
          h(
            NPopconfirm,
            {
              onPositiveClick: () => handleDelete(row.id),
            },
            {
              default: () => '确认删除该项目？',
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

onMounted(async () => {
  await fetchRaceDetail()
  fetchEvents()
})

onUnmounted(() => {
  raceStore.clearCurrentRace()
})
</script>

<template>
  <div class="schedule-container">
    <div class="page-header">
      <h1>赛事日程管理</h1>
      <NSpace>
        <NButton @click="handleBack">
          返回
        </NButton>
        <NButton type="primary" @click="handleCreate">
          添加日程
        </NButton>
      </NSpace>
    </div>

    <NCard title="赛事信息" class="event-info">
      <NDescriptions bordered>
        <NDescriptionsItem label="赛事名称">
          {{ raceStore.currentRace?.name }}
        </NDescriptionsItem>
        <NDescriptionsItem label="地点">
          {{ raceStore.currentRace?.location }}
        </NDescriptionsItem>
        <NDescriptionsItem label="开始日期">
          {{ formatDate(raceStore.currentRace?.startTime) }}
        </NDescriptionsItem>
        <NDescriptionsItem label="结束日期">
          {{ formatDate(raceStore.currentRace?.endTime) }}
        </NDescriptionsItem>
        <NDescriptionsItem label="状态">
          <NTag :type="getStatusType(raceStore.currentRace?.status)">
            {{ getStatusText(raceStore.currentRace?.status) }}
          </NTag>
        </NDescriptionsItem>
      </NDescriptions>
    </NCard>

   

    <NModal
      v-model:show="showModal"
      :title="modalMode === 'edit' ? '编辑日程' : '添加日程'"
      preset="card"
      style="width: 600px"
    >
      <NForm
        ref="formRef"
        :model="formModel"
        :rules="rules"
        label-placement="left"
        label-width="100px"
      >
        <NFormItem label="项目名称" path="name">
          <NInput v-model:value="formModel.name" placeholder="请输入项目名称" />
        </NFormItem>

        <NFormItem label="项目描述" path="description">
          <NInput
            v-model:value="formModel.description"
            type="textarea"
            placeholder="请输入项目描述"
            :autosize="{ minRows: 3, maxRows: 6 }"
          />
        </NFormItem>

        <NFormItem label="开始时间" path="startTime">
          <NDatePicker
            v-model:value="formModel.startTime"
            type="datetime"
            clearable
            :is-date-disabled="disableDateBefore(raceStore.currentRace?.startTime)"
          />
        </NFormItem>

        <NFormItem label="结束时间" path="endTime">
          <NDatePicker
            v-model:value="formModel.endTime"
            type="datetime"
            clearable
            :is-date-disabled="disableDateBefore(formModel.startTime)"
          />
        </NFormItem>

        <NFormItem label="最大参与人数" path="maxParticipants">
          <NInput
            v-model:value="formModel.maxParticipants"
            type="number"
            placeholder="请输入最大参与人数"
          />
        </NFormItem>
      </NForm>

      <template #footer>
        <NSpace justify="end">
          <NButton @click="showModal = false">
            取消
          </NButton>
          <NButton type="primary" :loading="loading" @click="handleSubmit">
            确定
          </NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>

<style scoped>
.schedule-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.event-info {
  margin-bottom: 24px;
}

.schedule-table {
  background-color: #fff;
  border-radius: 4px;
  padding: 8px;
}
</style>
