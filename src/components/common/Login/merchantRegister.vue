<script lang="ts" setup>
import { ref } from 'vue'
import { NButton, NInput, NSelect, useMessage } from 'naive-ui'
import { useRouter } from 'vue-router'

import { useUserStore } from '@/store'
import { merchantLogin, merchantRegister } from '@/api/auth'

const router = useRouter()
const userStore = useUserStore()
const ms = useMessage()
const isLoading = ref(false)

// 商家注册信息
const merchantForm = ref({
  name: '',
  username: '',
  password: '',
  confirmPassword: '',
  phone: '',
  email: '',
  address: '',
  description: '',
  categories: [] as string[],
})

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

// 验证表单
const validateForm = (): boolean => {
  if (!merchantForm.value.name) {
    ms.error('请输入商家名称')
    return false
  }
  if (!merchantForm.value.username) {
    ms.error('请输入用户名')
    return false
  }
  if (!merchantForm.value.password) {
    ms.error('请输入密码')
    return false
  }
  if (merchantForm.value.password !== merchantForm.value.confirmPassword) {
    ms.error('两次密码不一致')
    return false
  }
  if (!merchantForm.value.phone) {
    ms.error('请输入联系电话')
    return false
  }
  if (!merchantForm.value.email) {
    ms.error('请输入邮箱')
    return false
  }
  if (!merchantForm.value.address) {
    ms.error('请输入地址')
    return false
  }
  if (merchantForm.value.categories.length === 0) {
    ms.error('请选择至少一个业务分类')
    return false
  }
  return true
}

// 处理注册
async function handleRegister() {
  if (!validateForm())
    return

  isLoading.value = true
  try {
    // 加密密码
    const encryptedPassword = merchantForm.value.password

    // 构建注册请求
    const registerReq = {
      name: merchantForm.value.name,
      username: merchantForm.value.username,
      password: encryptedPassword,
      phone: merchantForm.value.phone,
      email: merchantForm.value.email,
      address: merchantForm.value.address,
      description: merchantForm.value.description || `${merchantForm.value.name}的商家店铺`,
      categories: merchantForm.value.categories,
    }

    // 调用注册接口
    const response = await merchantRegister(registerReq)

    if (response && response.merchant_id) {
      ms.success('注册成功，即将自动登录...')

      // 注册成功后自动登录
      try {
        const loginReq = {
          username: merchantForm.value.username,
          password: encryptedPassword,
        }

        const loginResponse = await merchantLogin(loginReq)

        if (loginResponse) {
          // 存储用户信息
          userStore.updateUserInfo({
            token: loginResponse.access_token,
            refresh_token: loginResponse.refresh_token,
            isLogin: true,
            username: merchantForm.value.username,
            password: merchantForm.value.password,
            uid: response.merchant_id.toString(),
            name: merchantForm.value.name,
            nickname: loginResponse.merchant_name,
            phone: merchantForm.value.phone,
            email: merchantForm.value.email,
            // 使用description字段标识商家类型
            description: 'merchant',
            // 使用client_agent存储商家ID
            client_agent: loginResponse.merchant_id.toString(),
            // 使用user_agent存储商家地址
            user_agent: merchantForm.value.address,
            platform: 'merchant',
          })

          ms.success('登录成功')
          // 跳转到商家后台首页
          setTimeout(() => {
            router.push('/merchant/dashboard')
          }, 200)
        }
        else {
          ms.warning('自动登录失败，请手动登录')
          setTimeout(() => {
            router.push('/merchant/login')
          }, 1500)
        }
      }
      catch (loginError) {
        console.error('自动登录失败', loginError)
        ms.warning('自动登录失败，请手动登录')
        setTimeout(() => {
          router.push('/merchant/login')
        }, 1500)
      }
    }
    else {
      ms.error('注册失败')
    }
  }
  catch (error) {
    console.error('注册异常:', error)
    ms.error(`注册异常: ${error}`)
  }
  finally {
    isLoading.value = false
  }
}

// 返回登录页
function goToLogin() {
  router.push('/merchant/login')
}
</script>

<template>
  <div class="p-4 space-y-5">
    <h2 class="text-2xl font-bold text-center mb-6">
      商家注册
    </h2>

    <div class="space-y-4 max-w-xl mx-auto">
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[90px]">商家名称</span>
        <div class="flex-1">
          <NInput v-model:value="merchantForm.name" placeholder="请输入商家名称" />
        </div>
      </div>

      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[90px]">用户名</span>
        <div class="flex-1">
          <NInput v-model:value="merchantForm.username" placeholder="请输入登录用户名" />
        </div>
      </div>

      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[90px]">密码</span>
        <div class="flex-1">
          <NInput
            v-model:value="merchantForm.password"
            type="password"
            placeholder="请输入密码"
            show-password-on="click"
          />
        </div>
      </div>

      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[90px]">确认密码</span>
        <div class="flex-1">
          <NInput
            v-model:value="merchantForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password-on="click"
          />
        </div>
      </div>

      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[90px]">联系电话</span>
        <div class="flex-1">
          <NInput v-model:value="merchantForm.phone" placeholder="请输入联系电话" />
        </div>
      </div>

      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[90px]">邮箱</span>
        <div class="flex-1">
          <NInput v-model:value="merchantForm.email" placeholder="请输入邮箱地址" />
        </div>
      </div>

      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[90px]">店铺地址</span>
        <div class="flex-1">
          <NInput v-model:value="merchantForm.address" placeholder="请输入店铺地址" />
        </div>
      </div>

      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[90px]">店铺描述</span>
        <div class="flex-1">
          <NInput
            v-model:value="merchantForm.description"
            type="textarea"
            placeholder="请输入店铺描述"
          />
        </div>
      </div>

      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[90px]">业务分类</span>
        <div class="flex-1">
          <NSelect
            v-model:value="merchantForm.categories"
            :options="categoryOptions"
            multiple
            placeholder="请选择业务分类"
          />
        </div>
      </div>

      <div class="flex justify-center space-x-4 mt-6">
        <NButton @click="goToLogin">
          返回登录
        </NButton>
        <NButton
          type="primary"
          :loading="isLoading"
          @click="handleRegister"
        >
          提交注册
        </NButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.button-icon {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}
</style>
