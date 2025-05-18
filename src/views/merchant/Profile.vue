<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import {
  NButton,
  NCard,
  NForm,
  NFormItem,
  NGrid,
  NGridItem,
  NInput,
  NSelect,
  NSpace,
  NUpload,
  useMessage,
} from 'naive-ui'
import type { UploadFileInfo } from 'naive-ui'
import axios from 'axios'
import type { MerchantProfileUpdateRequest } from '@/api/auth'
import { getMerchantProfile, updateMerchantProfile } from '@/api/auth'
import { useUserStore } from '@/store'

const message = useMessage()
const loading = ref(false)
const saving = ref(false)
const userStore = useUserStore()

// 从用户信息中提取商家信息
const merchantId = computed(() => userStore.userInfo.client_agent || '')
const merchantAddress = computed(() => userStore.userInfo.user_agent || '')

// 商家资料表单
const merchantForm = ref({
  name: userStore.userInfo.name || '',
  phone: userStore.userInfo.phone || '',
  email: userStore.userInfo.email || '',
  address: merchantAddress.value,
  description: '',
  logo_url: userStore.userInfo.avatar || '',
  banner_url: '',
  categories: [] as string[],
  // 新增坐标字段
  latitude: null as number | null,
  longitude: null as number | null,
  // 详细地址信息
  province: '',
  city: '',
  district: '',
})

// 原始资料（用于检测变更）
const originalForm = ref({})

// 地图相关
const map = ref<any>(null)
const placeSearch = ref<any>(null)
const markers = ref<any[]>([])
const searchKeyword = ref('')

// 业务分类选项
const categoryOptions = ref([
  { label: '餐饮', value: '餐饮' },
  { label: '咖啡', value: '咖啡' },
  { label: '甜品', value: '甜品' },
  { label: '饮品', value: '饮品' },
  { label: '快餐', value: '快餐' },
  { label: '中餐', value: '中餐' },
  { label: '西餐', value: '西餐' },
  { label: '日料', value: '日料' },
  { label: '韩餐', value: '韩餐' },
  { label: '零售', value: '零售' },
  { label: '服装', value: '服装' },
  { label: '数码', value: '数码' },
  { label: '家居', value: '家居' },
  { label: '美妆', value: '美妆' },
  { label: '其他', value: '其他' },
])

// 上传相关
const logoUploading = ref(false)
const bannerUploading = ref(false)
const logoFileList = ref<UploadFileInfo[]>([])
const bannerFileList = ref<UploadFileInfo[]>([])

// 图片上传事件处理类型
interface UploadChangeEvent {
  file: UploadFileInfo
  fileList: UploadFileInfo[]
}

// Logo上传事件处理
async function handleLogoChange(options: UploadChangeEvent) {
  const { fileList } = options
  // 只允许一张图片
  if (fileList.length === 0) {
    merchantForm.value.logo_url = ''
    logoFileList.value = []
    return
  }
  const fileInfo = fileList[0]
  if (fileInfo.status === 'pending' && fileInfo.file) {
    try {
      logoUploading.value = true
      const imageUrl = await uploadImage(fileInfo.file as File)
      // 更新表单数据
      merchantForm.value.logo_url = imageUrl
      // 更新预览
      logoFileList.value = [{
        id: fileInfo.id,
        name: fileInfo.name,
        status: 'finished',
        url: imageUrl,
      }]
      message.success('Logo上传成功')
    }
    catch (e) {
      message.error('Logo上传失败')
    }
    finally {
      logoUploading.value = false
    }
  }
}

// 横幅上传事件处理
async function handleBannerChange(options: UploadChangeEvent) {
  const { fileList } = options
  // 只允许一张图片
  if (fileList.length === 0) {
    merchantForm.value.banner_url = ''
    bannerFileList.value = []
    return
  }
  const fileInfo = fileList[0]
  if (fileInfo.status === 'pending' && fileInfo.file) {
    try {
      bannerUploading.value = true
      const imageUrl = await uploadImage(fileInfo.file as File)
      // 更新表单数据
      merchantForm.value.banner_url = imageUrl
      // 更新预览
      bannerFileList.value = [{
        id: fileInfo.id,
        name: fileInfo.name,
        status: 'finished',
        url: imageUrl,
      }]
      message.success('横幅上传成功')
    }
    catch (e) {
      message.error('横幅上传失败')
    }
    finally {
      bannerUploading.value = false
    }
  }
}

// 移除Logo图片
function handleRemoveLogo() {
  merchantForm.value.logo_url = ''
  logoFileList.value = []
  return true
}

// 移除横幅图片
function handleRemoveBanner() {
  merchantForm.value.banner_url = ''
  bannerFileList.value = []
  return true
}

// 图片上传函数
async function uploadImage(file: File) {
  const formData = new FormData()
  formData.append('images', file)

  try {
    // 直接使用axios发送请求
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/upload/image`, formData, {
      headers: {
        Authorization: `Bearer ${userStore.userInfo.token}`,
        // 不要设置Content-Type，让浏览器自动设置
      },
    })

    if (response.data && response.data.code === 200 && response.data.data && response.data.data.length > 0)
      return response.data.data[0] // 返回图片URL
    else
      throw new Error(`上传图片失败: ${response.data?.message || '未知错误'}`)
  }
  catch (error) {
    throw error
  }
}

// 准备图片预览
function prepareImagePreviews() {
  // Logo预览
  logoFileList.value = []
  bannerFileList.value = []

  if (merchantForm.value.logo_url) {
    logoFileList.value.push({
      id: 'logo-image',
      name: '店铺Logo',
      status: 'finished',
      url: merchantForm.value.logo_url,
    })
  }

  // 横幅预览
  if (merchantForm.value.banner_url) {
    bannerFileList.value.push({
      id: 'banner-image',
      name: '店铺横幅',
      status: 'finished',
      url: merchantForm.value.banner_url,
    })
  }
}

// 格式化坐标值
const formatCoordinate = (value: number | null) => {
  return value === null ? '' : String(value)
}

// 处理坐标输入更新
const handleCoordinateUpdate = (val: string, coord: 'latitude' | 'longitude') => {
  merchantForm.value[coord] = val ? Number(val) : null
}

// 清除所有标记
const clearMap = () => {
  markers.value.forEach((marker) => {
    marker.setMap(null)
  })
  markers.value = []
}

// 获取地址名称
const getAddressInfo = async (lng: number, lat: number): Promise<{
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
const addMarker = async (location: { lng: number; lat: number }) => {
  // 清除现有标记
  clearMap()

  // 获取地址信息
  const addressInfo = await getAddressInfo(location.lng, location.lat)

  // 创建标记
  const marker = new (window as any).AMap.Marker({
    position: [location.lng, location.lat],
    map: map.value,
    label: {
      content: '商家位置',
      direction: 'top',
    },
  })

  markers.value.push(marker)

  // 更新表单数据
  merchantForm.value.latitude = location.lat
  merchantForm.value.longitude = location.lng
  merchantForm.value.province = addressInfo.province
  merchantForm.value.city = addressInfo.city
  merchantForm.value.district = addressInfo.district
  merchantForm.value.address = addressInfo.address

  message.success(`已选择坐标位置: 经度 ${location.lng}, 纬度 ${location.lat}`)
}

// 处理搜索
const handleSearch = () => {
  if (!searchKeyword.value) {
    message.warning('请输入位置关键词进行搜索')
    return
  }

  placeSearch.value.search(searchKeyword.value, (status: string, result: any) => {
    if (status === 'complete' && result.info === 'OK') {
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
            await addMarker(poi.location)
          })

          markers.value.push(marker)
        })

        // 调整地图视野以显示所有标记
        map.value.setFitView()
      }
    }
  })
}

// 获取商家资料
async function fetchMerchantProfile() {
  loading.value = true
  try {
    const response = await getMerchantProfile()
    if (response) {
      // 填充表单数据
      merchantForm.value = {
        name: response.name,
        phone: response.phone,
        email: response.email,
        address: response.address,
        description: response.description,
        logo_url: response.logo_url,
        banner_url: response.banner_url,
        categories: response.categories,
        latitude: response.latitude || null,
        longitude: response.longitude || null,
        province: '',
        city: '',
        district: '',
      }
      // 保存原始数据用于比较
      originalForm.value = { ...merchantForm.value }

      // 准备图片预览
      prepareImagePreviews()

      // 如果有经纬度信息，在地图上显示标记
      if (response.latitude && response.longitude) {
        // 等待地图初始化完成
        await new Promise(resolve => setTimeout(resolve, 1000))

        // 添加标记
        addMarker({
          lng: response.longitude,
          lat: response.latitude,
        })

        // 调整地图视野
        map.value.setZoom(15)
        map.value.setCenter([response.longitude, response.latitude])
      }
    }
  }
  catch (error) {
    console.error('获取商家资料失败:', error)
    message.error('获取商家资料失败')
  }
  finally {
    loading.value = false
  }
}

// 保存商家资料
async function saveProfile() {
  // 检查是否有修改
  const hasChanges = JSON.stringify(merchantForm.value) !== JSON.stringify(originalForm.value)
  if (!hasChanges) {
    message.info('资料未修改')
    return
  }

  saving.value = true
  try {
    // 转换为更新请求格式
    const updateData: MerchantProfileUpdateRequest = {
      name: merchantForm.value.name,
      phone: merchantForm.value.phone,
      email: merchantForm.value.email,
      address: merchantForm.value.address,
      description: merchantForm.value.description,
      logo_url: merchantForm.value.logo_url,
      banner_url: merchantForm.value.banner_url,
      categories: merchantForm.value.categories,
      // 只在有值时传递
      latitude: merchantForm.value.latitude || undefined,
      longitude: merchantForm.value.longitude || undefined,
    }

    const response = await updateMerchantProfile(updateData)
    if (response && response.message) {
      // 同时更新UserStore中的相关信息
      userStore.updateUserInfo({
        name: merchantForm.value.name,
        avatar: merchantForm.value.logo_url,
        phone: merchantForm.value.phone,
        email: merchantForm.value.email,
        user_agent: merchantForm.value.address, // 使用user_agent存储地址
      })

      message.success('资料更新成功')
      // 更新原始数据
      originalForm.value = { ...merchantForm.value }
    }
  }
  catch (error) {
    console.error('更新商家资料失败:', error)
    message.error('更新商家资料失败')
  }
  finally {
    saving.value = false
  }
}

// 初始化高德地图
async function initMap() {
  try {
    // 等待高德地图 API 加载完成
    await new Promise<void>((resolve) => {
      if ((window as any).AMap) {
        resolve()
      }
      else {
        const script = document.createElement('script')
        script.src = 'https://webapi.amap.com/maps?v=2.0&key=bb1a23f801a8bc898f90f1a3359926c5&plugin=AMap.PlaceSearch,AMap.Geocoder'
        script.onload = () => resolve()
        document.head.appendChild(script)
      }
    })

    // 加载必要的插件
    await new Promise<void>((resolve) => {
      (window as any).AMap.plugin(['AMap.PlaceSearch', 'AMap.Geocoder'], () => {
        resolve()
      })
    })

    // 初始化高德地图
    map.value = new (window as any).AMap.Map('mapContainer', {
      zoom: 13,
      center: [116.397428, 39.90923], // 默认北京中心
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
      const { lng, lat } = e.lnglat
      await addMarker({ lng, lat })
    })
  }
  catch (error) {
    console.error('高德地图初始化失败:', error)
    message.error('地图加载失败，请刷新页面重试')
  }
}

onMounted(() => {
  fetchMerchantProfile()
  initMap()
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
  <div>
    <h1 class="text-2xl font-bold mb-6">
      商家资料
    </h1>

    <NCard title="基本资料" :loading="loading">
      <NForm
        label-placement="left"
        label-width="100px"
        :model="merchantForm"
      >
        <NFormItem label="商家名称" path="name">
          <NInput v-model:value="merchantForm.name" placeholder="请输入商家名称" />
        </NFormItem>

        <NFormItem label="联系电话" path="phone">
          <NInput v-model:value="merchantForm.phone" placeholder="请输入联系电话" />
        </NFormItem>

        <NFormItem label="邮箱" path="email">
          <NInput v-model:value="merchantForm.email" placeholder="请输入邮箱" />
        </NFormItem>

        <NFormItem label="业务分类" path="categories">
          <NSelect
            v-model:value="merchantForm.categories"
            multiple
            :options="categoryOptions"
            placeholder="请选择业务分类"
          />
        </NFormItem>

        <NFormItem label="商家介绍" path="description">
          <NInput
            v-model:value="merchantForm.description"
            type="textarea"
            placeholder="请输入商家介绍"
          />
        </NFormItem>
      </NForm>
    </NCard>

    <NCard title="位置信息" class="mt-4" :loading="loading">
      <NForm label-placement="left" label-width="100px">
        <!-- 坐标输入 -->
        <NFormItem label="商家坐标">
          <NGrid :cols="2" :x-gap="12">
            <NGridItem>
              <NInput
                :value="formatCoordinate(merchantForm.latitude)"
                placeholder="纬度"
                @update:value="(val: string) => handleCoordinateUpdate(val, 'latitude')"
              />
            </NGridItem>
            <NGridItem>
              <NInput
                :value="formatCoordinate(merchantForm.longitude)"
                placeholder="经度"
                @update:value="(val: string) => handleCoordinateUpdate(val, 'longitude')"
              />
            </NGridItem>
          </NGrid>
        </NFormItem>

        <!-- 详细地址 -->
        <NFormItem label="详细地址">
          <NGrid :cols="3" :x-gap="12" class="mb-2">
            <NGridItem>
              <NInput v-model:value="merchantForm.province" placeholder="省份" readonly />
            </NGridItem>
            <NGridItem>
              <NInput v-model:value="merchantForm.city" placeholder="城市" readonly />
            </NGridItem>
            <NGridItem>
              <NInput v-model:value="merchantForm.district" placeholder="区县" readonly />
            </NGridItem>
          </NGrid>
          <NInput v-model:value="merchantForm.address" placeholder="请输入详细地址" />
        </NFormItem>

        <!-- 位置搜索 -->
        <NFormItem label="位置搜索">
          <NSpace>
            <NInput
              v-model:value="searchKeyword"
              placeholder="输入地址关键词搜索位置"
              style="width: 300px"
              @keyup.enter="handleSearch"
            />
            <NButton type="primary" @click="handleSearch">
              搜索
            </NButton>
          </NSpace>
        </NFormItem>

        <!-- 地图容器 -->
        <NFormItem label="地图选点">
          <div id="mapContainer" style="width: 100%; height: 400px;" />
          <div class="text-xs text-gray-500 mt-2">
            提示：点击地图可直接选取位置，或通过搜索选择位置
          </div>
        </NFormItem>
      </NForm>
    </NCard>

    <NCard title="店铺形象" class="mt-4" :loading="loading">
      <NForm label-placement="left" label-width="100px">
        <NFormItem label="店铺Logo" path="logo_url">
          <NUpload
            list-type="image-card"
            :max="1"
            :file-list="logoFileList"
            :on-remove="handleRemoveLogo"
            accept=".jpg,.jpeg,.png,.gif,.webp"
            :default-upload="true"
            :show-file-list="true"
            :show-preview-button="true"
            :show-download-button="false"
            @change="handleLogoChange"
          >
            <div class="flex flex-col items-center justify-center">
              <div class="text-gray-400">
                <div>点击或拖动文件到此处上传</div>
                <div class="text-xs mt-1">
                  建议尺寸：200x200px
                </div>
              </div>
            </div>
          </NUpload>
        </NFormItem>

        <NFormItem label="店铺横幅" path="banner_url">
          <NUpload
            list-type="image-card"
            :max="1"
            :file-list="bannerFileList"
            :on-remove="handleRemoveBanner"
            accept=".jpg,.jpeg,.png,.gif,.webp"
            :default-upload="true"
            :show-file-list="true"
            :show-preview-button="true"
            :show-download-button="false"
            @change="handleBannerChange"
          >
            <div class="flex flex-col items-center justify-center">
              <div class="text-gray-400">
                <div>点击或拖动文件到此处上传</div>
                <div class="text-xs mt-1">
                  建议尺寸：1200x300px
                </div>
              </div>
            </div>
          </NUpload>
        </NFormItem>
      </NForm>
    </NCard>

    <div class="flex justify-center mt-6">
      <NButton
        type="primary"
        size="large"
        :loading="saving"
        @click="saveProfile"
      >
        保存修改
      </NButton>
    </div>
  </div>
</template>

<style scoped>
</style>
