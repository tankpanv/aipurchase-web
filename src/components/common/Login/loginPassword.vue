<script lang="ts" setup>
import { defineEmits, ref } from 'vue'
import { NButton, NCheckbox, NInput, useMessage } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import encryptString from './encodePasswd'
import { useUserStore } from '@/store'
import { t } from '@/locales'
import { adminLogin, getAdminInfo } from '@/api/auth'
import type { UserInfo } from '@/store/modules/user/helper'

const emit = defineEmits(['closeModal'])
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const saveLogin = ref(true)
const verificationCode = ref('')
const isLoading = ref(false)
const userInfo = ref<Partial<UserInfo>>({
  avatar: '',
  name: '',
  description: '',
  isLogin: false,
  token: '',
  expireTime: '',
  uid: '',
  device_id: '',
  username: userStore.userInfo.username || '',
  password: userStore.userInfo.password || '',
  phone: userStore.userInfo.phone || '',
})
const ms = useMessage()

function updateUserInfo(options: Partial<UserInfo>) {
  userStore.updateUserInfo(options)
  ms.success(t('common.success'))
}

const loginCountdown = ref(0)
async function handleLogin() {
  isLoading.value = true

  loginCountdown.value = 10

  // 启动倒计时
  const timer = setInterval(() => {
    if (loginCountdown.value > 0) {
      loginCountdown.value--
      if (!isLoading.value)
        clearInterval(timer)
    }
    else {
      isLoading.value = false
      ms.error('登录超时')
      clearInterval(timer) // 倒计时结束，清除定时器
    }
  }, 10000)
  try {
    const end = encryptString(userInfo.value.password || '')

    const loginReq = {
      username: userInfo.value.phone || '',
      password: end,
    }

    const response = await adminLogin(loginReq)

    if (response) {
      // 获取用户信息
      userStore.updateUserInfo({
        token: response.data.token,
        refresh_token: response.data.refreshToken,
      })
      const userInfoResponse = await getAdminInfo()
      if (userInfoResponse) {
        if (saveLogin.value) {
          userStore.updateUserInfo({
            isLogin: true,
            token: response.data.token,
            refresh_token: response.data.refreshToken,
            username: userInfo.value.username,
            phone: userInfo.value.phone,
            password: userInfo.value.password,
            uid: userInfoResponse.data.id.toString(),
            realName: userInfoResponse.data.realName,
            email: userInfoResponse.data.email,
            avatar: userInfoResponse.data.avatar,
          })
        }
        else {
          userStore.updateUserInfo({
            isLogin: true,
            token: response.data.token,
            refresh_token: response.data.refreshToken,
            username: userInfo.value.username,
            phone: userInfo.value.phone,
            uid: userInfoResponse.data.id.toString(),
            realName: userInfoResponse.data.realName,
            email: userInfoResponse.data.email,
            avatar: userInfoResponse.data.avatar,
          })
        }

        ms.success('登录成功')

        // 获取重定向地址或默认跳转到首页
        const redirect = route.query.redirect as string
        // 添加短暂延迟确保模态框关闭后再跳转
        console.log('route', redirect)

        setTimeout(() => {
          router.push(redirect || '/')
        }, 200)
      }
      else {
        ms.error('获取用户信息失败')
      }
    }
    else {
      ms.error('登录失败')
    }
  }
  catch (error) {
    console.error(error)
    ms.error(`登录异常 ${error}`)
  }
  finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="p-4 space-y-5 min-h-[200px]">
    <div class="space-y-6">
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[50px]">用户</span>
        <div class="flex-1">
          <NInput v-model:value="userInfo.phone" placeholder="用户" />
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[50px]">密码</span>
        <div class="flex-1">
          <NInput v-model:value="userInfo.password" type="password" placeholder="输入密码" show-password-on="click" clearable />
        </div>
      </div>
      <section class=" text-right flex justify-center space-x-2">
        <NButton style="width: 200px;" type="primary" @click="handleLogin()">
          登录
        </NButton>
      </section>

      <div class="flex items-center space-x-4">
        <NCheckbox v-model:checked="saveLogin">
          保存
        </NCheckbox>
      </div>
    </div>
  </div>
</template>

<style>
.button-icon {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 保持图片比例并填充整个区域 */
  border-radius: 4px; /* 可选：添加圆角效果 */
}
</style>
