<script lang="ts" setup>
import { defineEmits, ref } from 'vue'
import { NButton, NCheckbox, NInput, useMessage } from 'naive-ui'
import { useAppStore, useUserStore } from '@/store'
import type { UserInfo } from '@/store/modules/user/helper'
import { t } from '@/locales'
// import { serverApi } from '@/api/server-api'

const emit = defineEmits(['closeModal'])
const appStore = useAppStore()
const userStore = useUserStore()
const saveLogin = ref(true)

const countdown = ref(0)
const verificationCode = ref('')
const isLoading = ref(false)
const userInfo = ref<UserInfo >({
  avatar: '',
  name: '',
  description: '',
  isLogin: false,
  token: '',
  expireTime: '',
  uid: '',
  device_id: '',
  username: '',
  password: '',
  phone: userStore.userInfo.phone,
})
const ms = useMessage()

function updateUserInfo(options: Partial<UserInfo>) {
  userStore.updateUserInfo(options)
  ms.success(t('common.success'))
}
const loginCountdown = ref(0)
async function login() {
  // isLoading.value = true

  // loginCountdown.value = 10

  // // 启动倒计时
  // const timer = setInterval(() => {
  //   if (loginCountdown.value > 0) {
  //     loginCountdown.value--
  //     if (!isLoading.value)
  //       clearInterval(timer)
  //   }
  //   else {
  //     isLoading.value = false
  //     ms.error('登录超时')
  //     clearInterval(timer) // 倒计时结束，清除定时器
  //   }
  // }, 1000)
  // try {
  //   // 构造符合 UserapiWUser 接口定义的对象

  //   // 构造符合 UserapiWUserBaseInfo 接口定义的对象
  //   const bUserInfo: UserapiWUserBaseInfo = {
  //     phone: userInfo.value.phone,
  //     password: userInfo.value.password,
  //     user_name: userInfo.value.username,
  //   // 填充用户基本信息
  //   }

  //   // 构造符合 UserapiRegisterWUserReq 接口定义的请求对象

  //   const loginReq: UserapiLoginReq = {
  //     login_type: 1,
  //     phone_verification_code: verificationCode.value,
  //     user_info: bUserInfo,
  //   }

  //   // 调用 uploadAuthFilesPost 方法
  //   // 调用 wuserRegisterPost 函数
  //   UserApiInstance.wuserLoginPost(loginReq, {
  //     validateStatus(status) {
  //       // 返回 true 时，promise 将会 resolve；返回 false，则 promise 将会 reject
  //       // 这里允许所有的响应状态码，这样您就可以在之后自行处理
  //       return true // 或者您可以指定允许的状态码范围，例如： return status >= 200 && status < 500;
  //     },
  //   }).then((response) => {
  //   // 调用返回的函数

  //     // 读取 UserapiRegisterWUserResp 返回结果
  //     const userResp = response.data
  //     if (response.status === 200) {
  //       if (saveLogin.value)
  //         userStore.updateUserInfo({ isLogin: true, token: userResp.token, username: userInfo.value.phone, phone: userInfo.value.phone, uid: userResp.w_user?.uid, avatar: userResp.w_user?.avatar, nickname: userResp.w_user?.nickname, vip_level: userResp.w_user?.vip_level, WUser: userResp.w_user })
  //       else
  //         userStore.updateUserInfo({ isLogin: true, token: userResp.token, username: userInfo.value.phone, phone: userInfo.value.phone, uid: userResp.w_user?.uid, avatar: userResp.w_user?.avatar, nickname: userResp.w_user?.nickname, vip_level: userResp.w_user?.vip_level, WUser: userResp.w_user })
  //       ms.success('登录成功')
  //       emit('closeModal')
  //     }
  //     else {
  //       ms.error(`登录失败 ${userResp.msg}` ?? '登录失败')
  //     }
  //   // 处理返回的请求参
  //   })
  //     .catch((error) => {
  //       console.error(error)
  //       ms.error(`登录异常 ${error}` ?? '登录异常')
  //     })
  // }
  // catch (error) {
  //   // 处理错误
  //   console.error(error)
  //   ms.error(`登录异常 ${error}` ?? '登录异常')
  // }
  // finally {
  //   isLoading.value = false
  // }
}
async function sendVerificationCode(): Promise<void> {
  // // 发送验证码的逻辑
  // // ...
  // const phone = userInfo?.value?.phone || ''
  // const phonePattern = /^1[0-9]{10}$/ // 手机号的正则表达式，这里简单地假设手机号是以1开头的11位数字
  // if (!phonePattern.test(phone)) {
  //   ms.error('请输入正确的手机号')
  //   return
  // }

  // // 设置倒计时为60秒
  // countdown.value = 60

  // // 启动倒计时
  // const timer = setInterval(() => {
  //   if (countdown.value > 0)
  //     countdown.value--
  //   else
  //     clearInterval(timer) // 倒计时结束，清除定时器
  // }, 1000)

  // // 构造符合 UserapiWUser 接口定义的对象

  // try {
  //   // 构造符合 UserapiRegisterWUserReq 接口定义的请求对象
  //   const registerRequest: UserapiSendPhoneCodeReq = {
  //     phone,
  //   }

  //   // 调用 uploadAuthFilesPost 方法
  //   // 调用 wuserRegisterPost 函数
  //   const response = await UserApiInstance.wuserPhoneSendPost(registerRequest)

  //   // 调用返回的函数

  //   // 读取 UserapiRegisterWUserResp 返回结果
  //   const userResp = response.data
  //   if (response.status === 200 && userResp.status === 0)
  //     ms.success('发送成功')
  //   else
  //     ms.error(userResp.msg ?? '发送失败')

  //   // 处理返回的请求参
  // }
  // catch (error) {
  //   // 处理错误
  //   console.error(error)
  // }
  // finally {
  //   isLoading.value = false
  // }
}
function loginWeixin(event: Event): void {
  const redirectUri = encodeURIComponent(window.location.origin)
  const url = `https://open.weixin.qq.com/connect/qrconnect?appid=${import.meta.env.VITE_APP_ID}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_login&state=STATE#wechat_redirect`
  window.location.href = url
}
</script>

<template>
  <div class="p-4 space-y-5 min-h-[200px]">
    <div class="space-y-6">
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[50px]">手机</span>
        <div class="flex-1">
          <NInput v-model:value="userInfo.phone" placeholder="" />
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[50px]">验证码</span>
        <div class="flex-1">
          <NInput v-model:value="verificationCode" placeholder="输入验证码" show-password-on="click" clearable />
        </div>
        <div class="flex items-center">
          <NButton type="primary" style="width: 100px;" :disabled="countdown > 0" @click="sendVerificationCode">
            <template v-if="countdown === 0">
              发送
            </template>
            <template v-else>
              {{ countdown }}s
            </template>
          </NButton>
        </div>
      </div>

      <!-- <NButton type="primary" style="width: 200px;" @click="login()">
            登录
          </NButton>
          <NCheckbox v-model:checked="saveLogin" style="margin-left: 12px">
            保存
          </NCheckbox> -->
      <section class=" text-right flex justify-center space-x-2">
        <NButton style="width: 200px;" type="primary" @click="login()">
          登录
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
