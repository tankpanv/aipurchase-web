<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FormInst } from 'naive-ui'
import {
  NButton,
  NDatePicker,
  NForm,
  NFormItem,
  NGrid,
  NGridItem,
  NInput,
  NInputNumber,
  NSelect,
  NSpace,
  useMessage,
} from 'naive-ui'
import { createRace, getRaceDetail, updateRace } from '@/api/admin/race'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const formRef = ref<FormInst | null>(null)

// 表单数据
const formData = ref({
  name: '',
  description: '',
  location: '',
  startTime: null as number | null,
  endTime: null as number | null,
  registrationStart: null as number | null,
  registrationEnd: null as number | null,
  capacity: 100,
  status: 0,
  type: 1, // 默认为马拉松
  distance: null as number | null,
  currentParticipants: 0,
  fee: null as number | null,
  coverImage: null as string | null,
  rules: null as string | null,
  gisData: null as string | null,
  creatorId: 0,
  startCoordinate: {
    lat: null as number | null,
    lng: null as number | null,
    province: '',
    city: '',
    district: '',
    address: '',
  },
  endCoordinate: {
    lat: null as number | null,
    lng: null as number | null,
    province: '',
    city: '',
    district: '',
    address: '',
  },
})

// 状态选项
const statusOptions = [
  { label: '未开始', value: 0 },
  { label: '报名中', value: 1 },
  { label: '进行中', value: 2 },
  { label: '已结束', value: 3 },
]

// 比赛类型选项
const typeOptions = [
  { label: '马拉松', value: 1 },
  { label: '半程马拉松', value: 2 },
  { label: '迷你马拉松', value: 3 },
]

// 表单验证规则
const rules = {
  name: {
    required: true,
    message: '请输入比赛名称',
    trigger: 'blur',
  },
  location: {
    required: true,
    message: '请输入比赛地点',
    trigger: 'blur',
  },
  startTime: {
    required: true,
    type: 'number',
    message: '请选择开始时间',
    trigger: ['blur', 'change'],
  },
  endTime: {
    required: true,
    type: 'number',
    message: '请选择结束时间',
    trigger: ['blur', 'change'],
    validator: (rule: any, value: number) => {
      if (!value)
        return true
      if (!formData.value.startTime)
        return true
      return value > formData.value.startTime || '结束时间必须晚于开始时间'
    },
  },
  registrationStart: {
    required: true,
    type: 'number',
    message: '请选择报名开始时间',
    trigger: ['blur', 'change'],
  },
  registrationEnd: {
    required: true,
    type: 'number',
    message: '请选择报名截止时间',
    trigger: ['blur', 'change'],
    validator: (rule: any, value: number) => {
      if (!value)
        return true
      if (!formData.value.registrationStart)
        return true
      if (!formData.value.startTime)
        return true
      return (
        value > formData.value.registrationStart || '报名截止时间必须晚于报名开始时间'
      ) && (
        value < formData.value.startTime || '报名截止时间必须早于比赛开始时间'
      )
    },
  },
  capacity: {
    required: true,
    type: 'number',
    message: '请输入最大参与人数',
    trigger: ['blur', 'change'],
  },
  type: {
    required: true,
    type: 'number',
    message: '请选择比赛类型',
    trigger: ['blur', 'change'],
  },
}

// 是否为编辑模式
const isEdit = computed(() => route.params.id !== undefined)

// 提交状态
const submitting = ref(false)

// 返回上一页
const handleBack = () => {
  router.push('/admin/race')
}

// 添加地图实例的引用
const map = ref<any>(null)
const placeSearch = ref<any>(null)
const markers = ref<any[]>([]) // 存储标记点
const searchKeyword = ref('') // 搜索关键词
const selectedType = ref<'start' | 'end' | null>(null) // 当前选择的类型
const driving = ref<any>(null) // 路线规划实例
const routePath = ref<any[]>([]) // 存储路线坐标点

// 格式化坐标值为字符串
const formatCoordinate = (value: number | null) => {
  return value === null ? '' : String(value)
}

// 处理坐标输入更新
const handleCoordinateUpdate = (val: string, type: 'start' | 'end', coord: 'lat' | 'lng') => {
  if (type === 'start')
    formData.value.startCoordinate[coord] = val ? Number(val) : null
  else
    formData.value.endCoordinate[coord] = val ? Number(val) : null
}

// 清除所有标记和路线
const clearMap = () => {
  // 清除标记
  markers.value.forEach((marker) => {
    marker.setMap(null)
  })
  markers.value = []

  // 清除路线
  if (driving.value)
    driving.value.clear()

  // 清除路线路径
  routePath.value = []
}

// 获取地址名称
const getAddressName = async (lng: number, lat: number): Promise<{
  province: string
  city: string
  district: string
  address: string
}> => {
  return new Promise((resolve) => {
    const geocoder = new (window as any).AMap.Geocoder()
    geocoder.getAddress([lng, lat], (status: string, result: any) => {
      if (status === 'complete' && result.info === 'OK') {
        const regeocode = result.regeocode
        const addressComponent = regeocode.addressComponent
        resolve({
          province: addressComponent.province || '',
          city: addressComponent.city || '',
          district: addressComponent.district || '',
          address: regeocode.formattedAddress || '',
        })
      }
      else {
        resolve({
          province: '',
          city: '',
          district: '',
          address: '',
        })
      }
    })
  })
}

// 添加标记点
const addMarker = async (location: { lng: number; lat: number }, type: 'start' | 'end') => {
  // 清除同类型的标记
  const existingMarker = markers.value.find(m => m.getLabel().content === (type === 'start' ? '起点' : '终点'))
  if (existingMarker) {
    existingMarker.setMap(null)
    markers.value = markers.value.filter(m => m !== existingMarker)
  }

  // 获取地址名称
  const addressInfo = await getAddressName(location.lng, location.lat)

  const marker = new (window as any).AMap.Marker({
    position: [location.lng, location.lat],
    map: map.value,
    label: {
      content: type === 'start' ? '起点' : '终点',
      direction: 'top',
    },
  })

  markers.value.push(marker)

  // 更新表单数据
  if (type === 'start') {
    formData.value.startCoordinate = {
      lat: location.lat,
      lng: location.lng,
      ...addressInfo,
    }
  }
  else {
    formData.value.endCoordinate = {
      lat: location.lat,
      lng: location.lng,
      ...addressInfo,
    }
  }

  message.success(`已选择${type === 'start' ? '起点' : '终点'}坐标: 经度 ${location.lng}, 纬度 ${location.lat}`)

  // 如果起点和终点都已选择，规划路线
  if (formData.value.startCoordinate.lat && formData.value.endCoordinate.lat)
    planRoute()
}

// 规划路线
const planRoute = () => {
  if (!driving.value) {
    driving.value = new (window as any).AMap.Driving({
      map: map.value,
      panel: 'panel',
      policy: (window as any).AMap.DrivingPolicy.LEAST_TIME,
    })
  }

  const start = [formData.value.startCoordinate.lng, formData.value.startCoordinate.lat]
  const end = [formData.value.endCoordinate.lng, formData.value.endCoordinate.lat]

  driving.value.search(start, end, (status: string, result: any) => {
    if (status === 'complete') {
      // 获取路线坐标点
      const path = result.routes[0].steps.reduce((acc: any[], step: any) => {
        return acc.concat(step.path)
      }, [])

      // 保存路线坐标点
      routePath.value = path
      // 更新表单中的GIS数据
      formData.value.gisData = JSON.stringify({
        start: formData.value.startCoordinate,
        end: formData.value.endCoordinate,
        path: path.map((point: any) => ({
          lng: point.lat,
          lat: point.lng,
        })),
      })

      message.success('路线规划成功')
    }
    else {
      message.error('路线规划失败')
    }
  })
}

// 处理搜索
const handleSearch = async () => {
  if (!searchKeyword.value || !selectedType.value) {
    message.warning('请先选择要设置的位置类型（起点/终点）')
    return
  }

  placeSearch.value.search(searchKeyword.value, async (status: string, result: any) => {
    if (status === 'complete' && result.info === 'OK') {
      // 处理搜索结果
      const pois = result.poiList.pois
      if (pois && pois.length > 0) {
        // 清除现有标记
        clearMap()

        // 在地图上显示所有搜索结果
        pois.forEach((poi: any) => {
          const marker = new (window as any).AMap.Marker({
            position: [poi.location.lng, poi.location.lat],
            map: map.value,
            label: {
              content: poi.name,
              direction: 'top',
            },
          })

          // 点击标记时选择位置
          marker.on('click', async () => {
            await addMarker(poi.location, selectedType.value!)
          })

          markers.value.push(marker)
        })

        // 调整地图视野以显示所有标记
        map.value.setFitView()
      }
    }
  })
}

// 选择位置类型
const selectLocationType = (type: 'start' | 'end') => {
  if (type === 'end' && !formData.value.startCoordinate.lat) {
    message.warning('请先选择起点位置')
    return
  }
  selectedType.value = type
  message.info(`请在地图上点击或搜索选择${type === 'start' ? '起点' : '终点'}位置`)
}

// 获取比赛详情
const fetchRaceDetail = async (id: number) => {
  submitting.value = true
  try {
    const response = await getRaceDetail(id)

    // 转换日期字符串为时间戳（北京时间）
    const convertDate = (dateStr: string | null) => {
      if (!dateStr)
        return null
      // 将UTC时间转换为北京时间
      const date = new Date(dateStr)
      const utcTime = date.getTime()
      return utcTime + (8 * 60 * 60 * 1000) // 加上8小时的毫秒数
    }

    // 解析GIS数据
    let gisData = null
    if (response.data.gisData) {
      try {
        gisData = JSON.parse(response.data.gisData)
      }
      catch (error) {
        console.error('解析GIS数据失败:', error)
      }
    }

    formData.value = {
      name: response.data.name,
      description: response.data.description || '',
      location: response.data.location,
      startTime: convertDate(response.data.startTime),
      endTime: convertDate(response.data.endTime),
      registrationStart: convertDate(response.data.registrationStart),
      registrationEnd: convertDate(response.data.registrationEnd),
      capacity: response.data.capacity,
      status: response.data.status,
      type: response.data.type,
      distance: response.data.distance,
      currentParticipants: response.data.currentParticipants,
      fee: response.data.fee,
      coverImage: response.data.coverImage,
      rules: response.data.rules,
      gisData: response.data.gisData,
      creatorId: response.data.creatorId,
      startCoordinate: {
        lat: gisData?.start?.lat || null,
        lng: gisData?.start?.lng || null,
        province: gisData?.start?.province || '',
        city: gisData?.start?.city || '',
        district: gisData?.start?.district || '',
        address: gisData?.start?.address || '',
      },
      endCoordinate: {
        lat: gisData?.end?.lat || null,
        lng: gisData?.end?.lng || null,
        province: gisData?.end?.province || '',
        city: gisData?.end?.city || '',
        district: gisData?.end?.district || '',
        address: gisData?.end?.address || '',
      },
    }

    // 如果有GIS数据，在地图上显示路线
    if (gisData) {
      // 等待地图初始化完成
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 清除现有标记和路线
      clearMap()

      // 添加起点和终点标记
      if (gisData.start) {
        addMarker({
          lng: gisData.start.lng,
          lat: gisData.start.lat,
          address: gisData.start.address,
        }, 'start')
      }
      if (gisData.end) {
        addMarker({
          lng: gisData.end.lng,
          lat: gisData.end.lat,
          address: gisData.end.address,
        }, 'end')
      }

      // 如果有路径数据，显示路线
      if (gisData.path && gisData.path.length > 0) {
        // 创建路线
        const path = gisData.path.map((point: any) => [point.lng, point.lat])
        const polyline = new (window as any).AMap.Polyline({
          path,
          strokeColor: '#409EFF',
          strokeWeight: 6,
          strokeStyle: 'solid',
          map: map.value,
        })

        // 调整地图视野以显示完整路线
        map.value.setFitView()
      }
    }
  }
  catch (error) {
    message.error('获取比赛详情失败')
    console.error('Error fetching race:', error)
  }
  finally {
    submitting.value = false
  }
}

// 提交表单
const handleSubmit = () => {
  formRef.value?.validate(async (errors: any) => {
    if (errors) {
      message.error('表单验证失败，请检查填写内容')
      return
    }

    submitting.value = true
    try {
      // 转换时间戳为ISO字符串，确保不为null（转换为UTC时间）
      const convertToISOString = (timestamp: number | null) => {
        if (!timestamp)
          return undefined
        // 将北京时间转换回UTC时间
        const beijingTime = new Date(timestamp)
        const utcTime = new Date(beijingTime.getTime() - (8 * 60 * 60 * 1000))
        return utcTime.toISOString()
      }

      const submitData = {
        name: formData.value.name,
        description: formData.value.description,
        location: formData.value.location,
        startTime: convertToISOString(formData.value.startTime) || '',
        endTime: convertToISOString(formData.value.endTime) || '',
        registrationStart: convertToISOString(formData.value.registrationStart) || '',
        registrationEnd: convertToISOString(formData.value.registrationEnd) || '',
        capacity: formData.value.capacity,
        status: formData.value.status,
        type: formData.value.type,
        distance: formData.value.distance,
        fee: formData.value.fee,
        coverImage: formData.value.coverImage,
        rules: formData.value.rules,
        gisData: formData.value.gisData,
        creatorId: formData.value.creatorId,
        startCoordinate: formData.value.startCoordinate,
        endCoordinate: formData.value.endCoordinate,
      }

      if (isEdit.value) {
        await updateRace(Number(route.params.id), submitData)
        message.success('比赛更新成功')
      }
      else {
        await createRace(submitData)
        message.success('比赛创建成功')
      }
      router.push('/admin/race')
    }
    catch (error) {
      message.error(isEdit.value ? '更新比赛失败' : '创建比赛失败')
      console.error('Error submitting race:', error)
    }
    finally {
      submitting.value = false
    }
  })
}

// 初始化
onMounted(async () => {
  if (isEdit.value)
    fetchRaceDetail(Number(route.params.id))

  try {
    // 等待高德地图 API 加载完成
    await new Promise<void>((resolve) => {
      if ((window as any).AMap) {
        resolve()
      }
      else {
        const script = document.createElement('script')
        script.src = 'https://webapi.amap.com/maps?v=2.0&key=bb1a23f801a8bc898f90f1a3359926c5&plugin=AMap.PlaceSearch,AMap.Driving,AMap.Geocoder'
        script.onload = () => resolve()
        document.head.appendChild(script)
      }
    })

    // 加载必要的插件
    await new Promise<void>((resolve) => {
      (window as any).AMap.plugin(['AMap.PlaceSearch', 'AMap.Driving', 'AMap.Geocoder'], () => {
        resolve()
      })
    })

    // 初始化高德地图
    map.value = new (window as any).AMap.Map('mapContainer', {
      zoom: 13,
      center: [120.15507, 30.27415], // 默认中心点
      viewMode: '2D',
      resizeEnable: true,
      lang: 'zh_cn',
    })

    // 初始化搜索服务
    placeSearch.value = new (window as any).AMap.PlaceSearch({
      map: map.value,
      pageSize: 10,
      pageIndex: 1,
      city: '全国',
      lang: 'zh_cn',
    })

    // 添加点击事件获取坐标
    map.value.on('click', async (e: any) => {
      if (!selectedType.value) {
        message.warning('请先选择要设置的位置类型（起点/终点）')
        return
      }
      const { lng, lat } = e.lnglat
      await addMarker({ lng, lat }, selectedType.value)
    })
  }
  catch (error) {
    console.error('高德地图初始化失败:', error)
    message.error('地图加载失败，请刷新页面重试')
  }
})

// 组件卸载时销毁地图实例
onUnmounted(() => {
  if (map.value) {
    map.value.destroy()
    map.value = null
  }
})
</script>

<template>
  <div class="event-form-container">
    <div class="page-header">
      <h1>{{ isEdit ? '编辑比赛' : '创建比赛' }}</h1>
      <NSpace>
        <NButton @click="handleBack">
          返回
        </NButton>
        <NButton type="primary" :loading="submitting" @click="handleSubmit">
          保存
        </NButton>
      </NSpace>
    </div>

    <div class="form-content">
      <NForm
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-placement="left"
        label-width="120px"
        require-mark-placement="right-hanging"
      >
        <NGrid :cols="24" :x-gap="24">
          <NGridItem :span="12">
            <NFormItem label="比赛名称" path="name">
              <NInput v-model:value="formData.name" placeholder="请输入比赛名称" />
            </NFormItem>
          </NGridItem>

          <NGridItem :span="12">
            <NFormItem label="比赛地点" path="location">
              <NInput v-model:value="formData.location" placeholder="请输入比赛地点" />
            </NFormItem>
          </NGridItem>

          <NGridItem :span="12">
            <NFormItem label="开始时间" path="startTime">
              <NDatePicker
                v-model:value="formData.startTime"
                type="datetime"
                clearable
                style="width: 100%"
              />
            </NFormItem>
          </NGridItem>

          <NGridItem :span="12">
            <NFormItem label="结束时间" path="endTime">
              <NDatePicker
                v-model:value="formData.endTime"
                type="datetime"
                clearable
                style="width: 100%"
              />
            </NFormItem>
          </NGridItem>

          <NGridItem :span="12">
            <NFormItem label="报名开始时间" path="registrationStart">
              <NDatePicker
                v-model:value="formData.registrationStart"
                type="datetime"
                clearable
                style="width: 100%"
              />
            </NFormItem>
          </NGridItem>

          <NGridItem :span="12">
            <NFormItem label="报名截止时间" path="registrationEnd">
              <NDatePicker
                v-model:value="formData.registrationEnd"
                type="datetime"
                clearable
                style="width: 100%"
              />
            </NFormItem>
          </NGridItem>

          <NGridItem :span="12">
            <NFormItem label="最大参与人数" path="capacity">
              <NInputNumber
                v-model:value="formData.capacity"
                :min="1"
                style="width: 100%"
              />
            </NFormItem>
          </NGridItem>

          <NGridItem :span="12">
            <NFormItem label="状态" path="status">
              <NSelect
                v-model:value="formData.status"
                :options="statusOptions"
                style="width: 100%"
              />
            </NFormItem>
          </NGridItem>

          <NGridItem :span="12">
            <NFormItem label="比赛类型" path="type">
              <NSelect
                v-model:value="formData.type"
                :options="typeOptions"
                style="width: 100%"
              />
            </NFormItem>
          </NGridItem>

          <NGridItem :span="24">
            <NFormItem label="比赛描述" path="description">
              <NInput
                v-model:value="formData.description"
                type="textarea"
                placeholder="请输入比赛详细描述"
                :autosize="{ minRows: 4, maxRows: 10 }"
              />
            </NFormItem>
          </NGridItem>

          <!-- 坐标和地址信息 -->
          <NGridItem :span="24">
            <NGrid :cols="2" :x-gap="24">
              <!-- 起点信息 -->
              <NGridItem>
                <NFormItem label="开始坐标" path="startCoordinate">
                  <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                    <NInput
                      :value="formatCoordinate(formData.startCoordinate.lat)"
                      placeholder="纬度"
                      style="width: 50%"
                      @update:value="(val: string) => handleCoordinateUpdate(val, 'start', 'lat')"
                    />
                    <NInput
                      :value="formatCoordinate(formData.startCoordinate.lng)"
                      placeholder="经度"
                      style="width: 50%"
                      @update:value="(val: string) => handleCoordinateUpdate(val, 'start', 'lng')"
                    />
                  </div>
                </NFormItem>
                <NFormItem label="开始地址">
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; gap: 8px;">
                      <NInput
                        v-model:value="formData.startCoordinate.province"
                        placeholder="省份"
                        style="width: 33%"
                        readonly
                      />
                      <NInput
                        v-model:value="formData.startCoordinate.city"
                        placeholder="城市"
                        style="width: 33%"
                        readonly
                      />
                      <NInput
                        v-model:value="formData.startCoordinate.district"
                        placeholder="区县"
                        style="width: 33%"
                        readonly
                      />
                    </div>
                    <NInput
                      v-model:value="formData.startCoordinate.address"
                      placeholder="详细地址"
                      readonly
                    />
                  </div>
                </NFormItem>
              </NGridItem>

              <!-- 终点信息 -->
              <NGridItem>
                <NFormItem label="结束坐标" path="endCoordinate">
                  <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                    <NInput
                      :value="formatCoordinate(formData.endCoordinate.lat)"
                      placeholder="纬度"
                      style="width: 50%"
                      @update:value="(val: string) => handleCoordinateUpdate(val, 'end', 'lat')"
                    />
                    <NInput
                      :value="formatCoordinate(formData.endCoordinate.lng)"
                      placeholder="经度"
                      style="width: 50%"
                      @update:value="(val: string) => handleCoordinateUpdate(val, 'end', 'lng')"
                    />
                  </div>
                </NFormItem>
                <NFormItem label="结束地址">
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; gap: 8px;">
                      <NInput
                        v-model:value="formData.endCoordinate.province"
                        placeholder="省份"
                        style="width: 33%"
                        readonly
                      />
                      <NInput
                        v-model:value="formData.endCoordinate.city"
                        placeholder="城市"
                        style="width: 33%"
                        readonly
                      />
                      <NInput
                        v-model:value="formData.endCoordinate.district"
                        placeholder="区县"
                        style="width: 33%"
                        readonly
                      />
                    </div>
                    <NInput
                      v-model:value="formData.endCoordinate.address"
                      placeholder="详细地址"
                      readonly
                    />
                  </div>
                </NFormItem>
              </NGridItem>
            </NGrid>
          </NGridItem>

          <!-- 位置选择按钮 -->
          <NGridItem :span="24">
            <NFormItem label="位置选择">
              <NSpace>
                <NButton
                  :type="selectedType === 'start' ? 'primary' : 'default'"
                  @click="selectLocationType('start')"
                >
                  选择起点
                </NButton>
                <NButton
                  :type="selectedType === 'end' ? 'primary' : 'default'"
                  @click="selectLocationType('end')"
                >
                  选择终点
                </NButton>
              </NSpace>
            </NFormItem>
          </NGridItem>

          <!-- 搜索框 -->
          <NGridItem :span="24">
            <NFormItem label="位置搜索">
              <NSpace style="width: 100%">
                <NInput
                  v-model:value="searchKeyword"
                  placeholder="输入位置进行搜索"
                  style="width: 100%"
                  @keyup.enter="handleSearch"
                />
                <NButton type="primary" @click="handleSearch">
                  搜索
                </NButton>
              </NSpace>
            </NFormItem>
          </NGridItem>

          <!-- 高德地图容器 -->
          <NGridItem :span="24">
            <div id="mapContainer" style="width: 100%; height: 400px;" />
          </NGridItem>

          <!-- 路线规划面板 -->
          <NGridItem v-if="formData.startCoordinate.lat && formData.endCoordinate.lat" :span="24">
            <NFormItem label="路线规划">
              <div id="panel" style="width: 100%; height: 200px; overflow-y: auto;" />
            </NFormItem>
          </NGridItem>
        </NGrid>
      </NForm>
    </div>
  </div>
</template>

<style scoped>
.event-form-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.form-content {
  background-color: #fff;
  padding: 24px;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
