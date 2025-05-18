<script lang="ts" setup>
import { defineEmits, ref } from 'vue'
import { NButton, NCheckbox, NInput, useMessage } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import encryptString from './encodePasswd'
import { useUserStore } from '@/store'
import type { UserInfo } from '@/store/modules/user/helper'
import { adminLogin, adminRegister, getAdminInfo } from '@/api/auth'
import useCountdown from '@/hooks/useCountdown'

const emit = defineEmits(['closeModal'])
const userStore = useUserStore()
const router = useRouter()
const route = useRoute()
const ms = useMessage()
const { t } = useI18n()

// 修改为管理员注册字段
interface FormState {
  username: string
  password: string
  password2: string
  phone: string
  realName: string
  email: string
  verifyCode: string
}

const formState = ref<FormState>({
  username: '',
  password: '',
  password2: '',
  phone: '',
  realName: '',
  email: '',
  verifyCode: '',
})

const saveLogin = ref(true)

function updateUserInfo(options: Partial<UserInfo>) {
  userStore.updateUserInfo(options)
  ms.success(t('common.success'))
}

function loginWeixin(event: Event): void {
  const redirectUri = encodeURIComponent(window.location.origin)
  const url = `https://open.weixin.qq.com/connect/qrconnect?appid=${import.meta.env.VITE_APP_ID}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_login&state=STATE#wechat_redirect`
  window.location.href = url
}

const isLoading = ref(false)
const { current, start } = useCountdown(60)

// 验证函数
const validateForm = (): boolean => {
  if (!formState.value.username) {
    ms.error('请输入用户名')
    return false
  }
  if (!formState.value.password) {
    ms.error('请输入密码')
    return false
  }
  if (formState.value.password !== formState.value.password2) {
    ms.error('两次密码不一致')
    return false
  }
  if (!formState.value.phone) {
    ms.error('请输入手机号')
    return false
  }

  return true
}

async function handleRegister() {
  try {
    if (!validateForm())
      return

    isLoading.value = true

    // 使用加密密码
    const encryptedPassword = encryptString(formState.value.password)

    // 构建注册请求参数
    const registerReq = {
      username: formState.value.username,
      password: encryptedPassword,
      phone: formState.value.phone,
      realName: formState.value.realName,
      email: formState.value.email,
      verifyCode: formState.value.verifyCode,
    }

    // 调用管理员注册接口
    const registerRes = await adminRegister(registerReq)
    if (registerRes.code === 200 && registerRes.data && registerRes.data.id) {
      ms.success('注册成功，正在自动登录...')

      // 注册成功后自动登录
      try {
        const loginReq = {
          username: formState.value.username,
          password: encryptedPassword,
        }

        const loginRes = await adminLogin(loginReq)

        if (loginRes && loginRes.data && loginRes.data.token !== '') {
          // 获取用户信息
          userStore.updateUserInfo({
            token: loginRes.data.token,
            refresh_token: loginRes.data.refreshToken,
          })
          const userInfoResponse = await getAdminInfo()
          if (userInfoResponse && userInfoResponse.data) {
            userStore.updateUserInfo({
              isLogin: true,
              token: loginRes.data.token,
              refresh_token: loginRes.data.refreshToken,
              username: formState.value.username,
              phone: formState.value.phone,
              uid: userInfoResponse.data.id.toString(),
              realName: userInfoResponse.data.realName,
              email: userInfoResponse.data.email,
              avatar: userInfoResponse.data.avatar,
            })

            ms.success('登录成功')
            // 关闭对话框
            emit('closeModal')

            // 获取重定向地址或默认跳转到首页
            const redirect = route.query.redirect as string
            // 添加短暂延迟确保模态框关闭后再跳转
            setTimeout(() => {
              router.push(redirect || '/')
            }, 200)
          }
        }
        else {
          ms.warning('自动登录失败，请手动登录')
        }
      }
      catch (error) {
        console.error('自动登录异常:', error)
        ms.warning('自动登录异常，请手动登录')
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

// 发送验证码到手机号
const sendSms = async () => {
  if (!formState.value.phone) {
    ms.error('请先输入手机号')
    return
  }
  try {
    // 这里调用发送验证码的接口
    // await sendSmsCode(formState.value.phone)
    ms.success('验证码发送成功')
    start()
  }
  catch (error) {
    ms.error(`发送验证码失败: ${error}`)
  }
}
</script>

<template>
  <div class="p-4 space-y-5 min-h-[200px]">
    <div class="space-y-6">
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[50px]">用户名</span>
        <div class="flex-1">
          <NInput v-model:value="formState.username" placeholder="" />
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[50px]">密码</span>
        <div class="flex-1">
          <NInput v-model:value="formState.password" type="password" placeholder="输入密码(6位以上数字或字符)" show-password-on="click" clearable />
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[50px]">确认密码</span>
        <div class="flex-1">
          <NInput v-model:value="formState.password2" type="password" placeholder="再次输入密码" show-password-on="click" clearable />
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[50px]">手机号</span>
        <div class="flex-1">
          <NInput v-model:value="formState.phone" placeholder="输入手机号" />
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[50px]">邮箱</span>
        <div class="flex-1">
          <NInput v-model:value="formState.email" placeholder="输入邮箱" />
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[50px]">真实姓名</span>
        <div class="flex-1">
          <NInput v-model:value="formState.realName" placeholder="输入真实姓名" />
        </div>
      </div>

      <section class=" text-right flex justify-center space-x-2">
        <NButton style="width: 200px;" type="primary" @click="handleRegister()">
          注册
        </NButton>
      </section>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[200px]" style="font-size: 16;">其他登录</span>
        <NButton size="large" text type="primary" @click="updateUserInfo(userStore.userInfo)">
          <template #icon>
            <img class="button-icon" src="@/assets/WechatIMG60.jpeg" alt="icon">
            <!-- <SvgIcon :icon=" assets/icons/WechatIMG60.jpeg" /> -->
          </template>
        </NButton>
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
