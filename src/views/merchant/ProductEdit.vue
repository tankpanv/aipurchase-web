<script lang="ts" setup>
/* eslint-disable no-console */
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NButton,
  NCard,
  NDynamicTags,
  NForm,
  NFormItem,
  NGrid,
  NGridItem,
  NInput,
  NInputNumber,
  NSelect,
  NSwitch,
  NUpload,
  useMessage,
} from 'naive-ui'
import type { UploadFileInfo } from 'naive-ui'
import axios from 'axios'
import { createProduct, getProductDetail, updateProduct } from '@/api/product'
import type { ProductCreateUpdateRequest, ProductDetail } from '@/api/product'
import { getProductCategories } from '@/api/category'
import { useUserStore } from '@/store'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const userStore = useUserStore()

// 判断是编辑还是新增
const productId = computed(() => {
  const id = route.params.id
  return id ? Number(id) : null
})
const isEdit = computed(() => productId.value !== null)
const pageTitle = computed(() => isEdit.value ? '编辑商品' : '添加商品')

// 商品表单数据
const formData = ref<ProductCreateUpdateRequest>({
  name: '',
  description: '',
  price: 0,
  original_price: 0,
  stock: 0,
  unit: '件',
  product_type: 'general',
  status: 'draft',
  is_featured: false,
  category_ids: [],
  tags: [],
  images: [],
  detail_images: [],
  flavor: [],
  spec: '',
  tag: [],
  discount: '',
})

// 原始商品数据（用于检测变更）
const originalData = ref<ProductDetail | null>(null)

// 状态选项
const statusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '在发布', value: 'published' },
  { label: '售罄', value: 'sold_out' },
  { label: '下架', value: 'archived' },
]

// 商品类型选项
const productTypeOptions = [
  { label: '全部类型', value: 'general' },
  { label: '外卖', value: 'takeout', icon: 'fastfood' },
  { label: '酒店民宿', value: 'hotel', icon: 'hotel' },
  { label: '看病买药', value: 'medicine', icon: 'medical_services' },
  { label: '电影演出', value: 'ticket', icon: 'movie' },
  { label: '免费水果', value: 'fresh', icon: 'apple' },
  { label: '团购', value: 'groupon', icon: 'local_offer' },
]

// 单位选项
const unitOptions = [
  { label: '件', value: '件' },
  { label: '个', value: '个' },
  { label: '箱', value: '箱' },
  { label: '套', value: '套' },
  { label: '瓶', value: '瓶' },
  { label: '袋', value: '袋' },
  { label: '包', value: '包' },
  { label: '盒', value: '盒' },
  { label: '杯', value: '杯' },
  { label: '份', value: '份' },
]

// 分类选项（从API获取）
const categoryOptions = ref<Array<{ label: string; value: number }>>([])

// 加载分类数据
async function loadCategories() {
  try {
    const response = await getProductCategories()

    if (response && response.code === 200 && response.data) {
      categoryOptions.value = response.data.list.map(category => ({
        label: category.name,
        value: category.id,
      }))
    }
  }
  catch (error) {
    console.error('获取分类列表失败:', error)
    message.error('获取分类列表失败')
  }
}

// 上传相关
const mainImageUploading = ref(false)
const detailImagesUploading = ref(false)

// 主图文件列表
const mainImageFileList = ref<UploadFileInfo[]>([])
const detailImageFileList = ref<UploadFileInfo[]>([])

// 图片上传事件处理类型
interface UploadChangeEvent {
  file: UploadFileInfo
  fileList: UploadFileInfo[]
}

// 主图上传事件处理
async function handleMainImageChange(options: UploadChangeEvent) {
  const { fileList } = options
  // 只允许一张主图
  if (fileList.length === 0) {
    formData.value.images = []
    mainImageFileList.value = []
    return
  }
  const fileInfo = fileList[0]
  if (fileInfo.status === 'pending' && fileInfo.file) {
    try {
      mainImageUploading.value = true
      const imageUrl = await uploadImage(fileInfo.file as File)
      // 更新formData
      formData.value.images = [{
        image_url: imageUrl,
        is_main: true,
        sort_order: 0,
      }]
      // 更新预览
      mainImageFileList.value = [{
        id: fileInfo.id,
        name: fileInfo.name,
        status: 'finished',
        url: imageUrl,
      }]
      message.success('主图上传成功')
    }
    catch (e) {
      message.error('主图上传失败')
    }
    finally {
      mainImageUploading.value = false
    }
  }
}

// 详情图上传事件处理
async function handleDetailImageChange(options: UploadChangeEvent) {
  const { fileList } = options
  // 只处理新添加的pending文件
  for (const fileInfo of fileList) {
    if (fileInfo.status === 'pending' && fileInfo.file) {
      try {
        detailImagesUploading.value = true
        const imageUrl = await uploadImage(fileInfo.file as File)
        // 更新formData
        if (!formData.value.detail_images)
          formData.value.detail_images = []

        formData.value.detail_images.push(imageUrl)
        // 更新预览
        detailImageFileList.value.push({
          id: fileInfo.id,
          name: fileInfo.name,
          status: 'finished',
          url: imageUrl,
        })
        message.success('详情图上传成功')
      }
      catch (e) {
        message.error('详情图上传失败')
      }
      finally {
        detailImagesUploading.value = false
      }
    }
  }
}

// 图片上传函数
async function uploadImage(file: File) {
  console.log('开始上传图片:', file.name)

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

    console.log('图片上传响应:', response.data)

    if (response.data && response.data.code === 200 && response.data.data && response.data.data.length > 0)
      return response.data.data[0] // 返回图片URL
    else
      throw new Error(`上传图片失败: ${response.data?.message || '未知错误'}`)
  }
  catch (error) {
    console.error('图片上传请求失败:', error)
    throw error
  }
}

// 加载商品详情
async function loadProductDetail() {
  if (!productId.value)
    return

  try {
    const response = await getProductDetail(productId.value)

    if (response && response.code === 200 && response.data) {
      // 保存原始数据
      originalData.value = response.data

      // 填充表单
      formData.value = {
        name: response.data.name,
        description: response.data.description,
        price: response.data.price,
        original_price: response.data.original_price,
        stock: response.data.stock,
        unit: response.data.unit,
        product_type: response.data.product_type,
        status: response.data.status,
        is_featured: response.data.is_featured,
        category_ids: response.data.categories.map(cat => cat.id),
        tags: response.data.tags || [],
        images: response.data.images || [],
        detail_images: response.data.detail_images || [],
        flavor: response.data.flavor || [],
        spec: response.data.spec || '',
        tag: response.data.tag || [],
        discount: response.data.discount || '',
      }

      // 准备图片预览
      prepareImagePreviews()
    }
  }
  catch (error) {
    console.error('获取商品详情失败:', error)
    message.error('获取商品详情失败')
  }
}

// 准备图片预览
function prepareImagePreviews() {
  // 主图预览
  mainImageFileList.value = []
  detailImageFileList.value = []

  const mainImage = formData.value.images?.find(img => img.is_main)
  if (mainImage) {
    mainImageFileList.value.push({
      id: 'main-image',
      name: '主图',
      status: 'finished',
      url: mainImage.image_url,
    })
  }

  // 详情图预览
  if (formData.value.detail_images && formData.value.detail_images.length > 0) {
    formData.value.detail_images.forEach((url, index) => {
      detailImageFileList.value.push({
        id: `detail-${index}`,
        name: `详情图${index + 1}`,
        status: 'finished',
        url,
      })
    })
  }
}

// 移除主图
function handleRemoveMainImage(file: UploadFileInfo) {
  // 从formData中移除主图
  if (formData.value.images)
    formData.value.images = formData.value.images.filter(img => img.is_main !== true)

  // 同步预览
  mainImageFileList.value = []
  return true
}

// 移除详情图
function handleRemoveDetailImage(file: UploadFileInfo) {
  const url = file.url || ''
  if (formData.value.detail_images)
    formData.value.detail_images = formData.value.detail_images.filter(img => img !== url)

  // 同步预览
  detailImageFileList.value = detailImageFileList.value.filter(f => f.url !== url)
  return true
}

// 保存表单
async function handleSubmit() {
  try {
    // 处理主图 - 从mainImageFileList中获取主图URL
    const mainImage = mainImageFileList.value[0]
    if (mainImage && mainImage.url) {
      // 更新formData中的main_image_url
      if (!formData.value.images)
        formData.value.images = []

      // 检查是否已有主图，有则更新，没有则添加
      const existingMainImage = formData.value.images.find(img => img.is_main)
      if (existingMainImage) {
        existingMainImage.image_url = mainImage.url
      }
      else {
        formData.value.images.push({
          image_url: mainImage.url,
          is_main: true,
          sort_order: 0,
        })
      }
    }

    // 准备提交数据
    const submitData = {
      ...formData.value,
      main_image_url: formData.value.images?.find(img => img.is_main)?.image_url || '',
    }

    console.log('提交的数据:', submitData)

    if (isEdit.value && productId.value) {
      // 编辑商品
      const response = await updateProduct(productId.value, submitData)

      if (response && response.code === 200) {
        // 根据状态显示对应的成功信息
        const statusText: Record<string, string> = {
          published: '在发布',
          draft: '草稿',
          sold_out: '售罄',
          archived: '下架',
        }
        const status = submitData.status || 'draft'
        message.success(`商品已更新为${statusText[status]}状态`)
        router.push('/merchant/products')
      }
    }
    else {
      // 创建新商品
      const response = await createProduct(submitData)

      if (response && response.code === 200) {
        // 根据状态显示对应的成功信息
        const statusText: Record<string, string> = {
          published: '在发布',
          draft: '草稿',
          sold_out: '售罄',
          archived: '下架',
        }
        const status = submitData.status || 'draft'
        message.success(`商品已创建为${statusText[status]}状态`)
        router.push('/merchant/products')
      }
    }
  }
  catch (error) {
    console.error('保存商品失败:', error)
    message.error('保存失败，请检查表单并重试')
  }
}

// 取消
function handleCancel() {
  router.push('/merchant/products')
}

onMounted(() => {
  if (isEdit.value)
    loadProductDetail()

  loadCategories()
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">
      {{ pageTitle }}
    </h1>

    <NForm
      label-placement="left"
      label-width="120px"
      :model="formData"
      class="mt-4"
    >
      <NCard title="基本信息" class="mb-6">
        <NGrid cols="1 s:1 m:2" :x-gap="24" :y-gap="16">
          <NGridItem>
            <NFormItem label="商品名称" path="name" required>
              <NInput v-model:value="formData.name" placeholder="请输入商品名称" />
            </NFormItem>
          </NGridItem>

          <NGridItem>
            <NFormItem label="商品状态" path="status">
              <NSelect
                v-model:value="formData.status"
                :options="statusOptions"
                placeholder="请选择商品状态"
              />
            </NFormItem>
          </NGridItem>

          <NGridItem>
            <NFormItem label="商品价格" path="price" required>
              <NInputNumber
                v-model:value="formData.price"
                placeholder="请输入商品价格"
                :min="0"
                :precision="2"
                style="width: 100%"
              />
            </NFormItem>
          </NGridItem>

          <NGridItem>
            <NFormItem label="原价" path="original_price">
              <NInputNumber
                v-model:value="formData.original_price"
                placeholder="请输入商品原价"
                :min="0"
                :precision="2"
                style="width: 100%"
              />
            </NFormItem>
          </NGridItem>

          <NGridItem>
            <NFormItem label="库存" path="stock" required>
              <NInputNumber
                v-model:value="formData.stock"
                placeholder="请输入商品库存"
                :min="0"
                :precision="0"
                style="width: 100%"
              />
            </NFormItem>
          </NGridItem>

          <NGridItem>
            <NFormItem label="单位" path="unit">
              <NSelect
                v-model:value="formData.unit"
                :options="unitOptions"
                placeholder="请选择商品单位"
              />
            </NFormItem>
          </NGridItem>

          <NGridItem>
            <NFormItem label="商品类型" path="product_type">
              <NSelect
                v-model:value="formData.product_type"
                :options="productTypeOptions"
                placeholder="请选择商品类型"
              />
            </NFormItem>
          </NGridItem>

          <NGridItem>
            <NFormItem label="是否推荐" path="is_featured">
              <NSwitch v-model:value="formData.is_featured" />
            </NFormItem>
          </NGridItem>

          <NGridItem span="1 s:1 m:2">
            <NFormItem label="商品分类" path="category_ids">
              <NSelect
                v-model:value="formData.category_ids"
                :options="categoryOptions"
                placeholder="请选择商品分类"
                multiple
              />
            </NFormItem>
          </NGridItem>

          <NGridItem span="1 s:1 m:2">
            <NFormItem label="商品标签" path="tags">
              <NDynamicTags
                v-model:value="formData.tags"
                :max="10"
                :input-style="{ width: '100px' }"
              />
            </NFormItem>
          </NGridItem>

          <NGridItem span="1 s:1 m:2">
            <NFormItem label="商品描述" path="description">
              <NInput
                v-model:value="formData.description"
                type="textarea"
                placeholder="请输入商品描述"
                :rows="4"
              />
            </NFormItem>
          </NGridItem>
        </NGrid>
      </NCard>

      <NCard title="商品图片" class="mb-6">
        <NGrid cols="1 s:1 m:2" :x-gap="24" :y-gap="16">
          <NGridItem>
            <NFormItem label="主图" path="images">
              <NUpload
                :custom-request="handleMainImageChange"
                list-type="image-card"
                :max="1"
                :file-list="mainImageFileList"
                :on-remove="handleRemoveMainImage"
                accept=".jpg,.jpeg,.png,.gif,.webp"
                :default-upload="true"
                :show-file-list="true"
                :show-preview-button="true"
                :show-download-button="false"
                @change="handleMainImageChange"
              >
                <div class="flex flex-col items-center justify-center">
                  <div class="text-gray-400">
                    <div>点击或拖动文件到此处上传</div>
                    <div class="text-xs mt-1">
                      建议尺寸：800x800px
                    </div>
                  </div>
                </div>
              </NUpload>
            </NFormItem>
          </NGridItem>

          <NGridItem>
            <NFormItem label="详情图片" path="detail_images">
              <NUpload
                :custom-request="handleDetailImageChange"
                list-type="image-card"
                :on-remove="handleRemoveDetailImage"
                :file-list="detailImageFileList"
                accept=".jpg,.jpeg,.png,.gif,.webp"
                multiple
                :default-upload="true"
                :show-file-list="true"
                :show-preview-button="true"
                :show-download-button="false"
                @change="handleDetailImageChange"
              >
                <div class="flex flex-col items-center justify-center">
                  <div class="text-gray-400">
                    <div>点击或拖动文件到此处上传</div>
                    <div class="text-xs mt-1">
                      建议尺寸：800x1200px
                    </div>
                  </div>
                </div>
              </NUpload>
            </NFormItem>
          </NGridItem>
        </NGrid>
      </NCard>

      <NCard title="商品详情" class="mb-6">
        <NGrid cols="1 s:1 m:2" :x-gap="24" :y-gap="16">
          <NGridItem>
            <NFormItem label="规格" path="spec">
              <NInput
                v-model:value="formData.spec"
                type="textarea"
                placeholder="请输入商品规格信息"
                :rows="3"
              />
            </NFormItem>
          </NGridItem>

          <NGridItem>
            <NFormItem label="口味选项" path="flavor">
              <NDynamicTags
                v-model:value="formData.flavor"
                :max="10"
                :input-style="{ width: '100px' }"
              />
            </NFormItem>
          </NGridItem>

          <NGridItem>
            <NFormItem label="商品标签" path="tag">
              <NDynamicTags
                v-model:value="formData.tag"
                :max="10"
                :input-style="{ width: '100px' }"
              />
            </NFormItem>
          </NGridItem>

          <NGridItem>
            <NFormItem label="优惠信息" path="discount">
              <NInput
                v-model:value="formData.discount"
                placeholder="请输入优惠信息，例如：满100减20"
              />
            </NFormItem>
          </NGridItem>
        </NGrid>
      </NCard>

      <div class="flex justify-center gap-4 mt-8">
        <NButton
          type="default"
          size="large"
          @click="handleCancel"
        >
          取消
        </NButton>
        <NButton
          type="primary"
          size="large"
          @click="handleSubmit"
        >
          保存
        </NButton>
      </div>
    </NForm>
  </div>
</template>

<style scoped>
</style>
