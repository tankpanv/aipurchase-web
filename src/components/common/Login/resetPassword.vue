<script lang="ts" setup>
import { defineEmits, ref } from 'vue'
import { NButton, NCheckbox, NInput, useMessage } from 'naive-ui'
import encryptString from './encodePasswd'
import { useUserStore } from '@/store'
import type { UserInfo } from '@/store/modules/user/helper'
import { serverApi } from '@/api/server-api'

import { t } from '@/locales'

const emit = defineEmits(['closeModal'])
const userStore = useUserStore()

const ms = useMessage()
// 创建一个ref来存储UserInfo类型的变量
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
  phone: '',
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

const countdown = ref(0)
const verificationCode = ref('')
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

async function resetPassword() {
  // try {
  //   isLoading.value = true
  //   // 构造符合 UserapiWUser 接口定义的对象
  //   const user: UserapiWUser = {
  //     // avatar: 'avatar_url_here',

  //   // 其他属性根据接口定义填充
  //   }
  //   const end = encryptString(userInfo.value.password)

  //   // 构造符合 UserapiWUserBaseInfo 接口定义的对象
  //   const bUserInfo: UserapiWUserBaseInfo = {
  //     phone: userInfo.value.phone,
  //     password: end,
  //     user_name: userInfo.value.phone,
  //   // 填充用户基本信息
  //   }
  //   console.log('reset password', end)
  //   // 构造符合 UserapiRegisterWUserReq 接口定义的请求对象
  //   const registerRequest: UserapiResetPasswordReq = {
  //     login_type: 2, // 填充登录类型
  //     phone_verification_code: verificationCode.value,
  //     user_info: bUserInfo,
  //     w_user: user,
  //   }

  //   // 调用 uploadAuthFilesPost 方法
  //   // 调用 wuserRegisterPost 函数
  //   const response = await UserApiInstance.wuserResetPasswordPost(registerRequest)

  //   // 读取 UserapiRegisterWUserResp 返回结果
  //   const userResp = response.data

  //   if (response.status === 200) {
  //     // 构造符合 UserapiRegisterWUserReq 接口定义的请求对象

  //     const loginReq: UserapiLoginReq = {
  //       login_type: 2, // 填充登录类型
  //       phone_verification_code: verificationCode.value,
  //       user_info: bUserInfo,
  //     }
  //     const loginResp = await UserApiInstance.wuserLoginPost(loginReq)
  //     // 调用返回的函数

  //     if (loginResp.status === 200) {
  //       if (saveLogin.value)
  //         userStore.updateUserInfo({ isLogin: true, token: loginResp.data.token, username: userInfo.value.phone, phone: userInfo.value.phone, uid: userResp.w_user?.uid, password: userInfo.value.password, WUser: userResp.w_user })
  //       else
  //         userStore.updateUserInfo({ isLogin: true, token: loginResp.data.token, username: userInfo.value.phone, phone: userInfo.value.phone, uid: userResp.w_user?.uid, WUser: userResp.w_user })
  //     }
  //     ms.success('修改成功')
  //     emit('closeModal')
  //   }
  //   else {
  //     ms.error(`修改失败 ${userResp.msg}` ?? '修改失败')
  //   }
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
        <span class="flex-shrink-0 w-[50px]">密码</span>
        <div class="flex-1">
          <NInput v-model:value="userInfo.password" type="password" placeholder="输入密码(6位以上数字或字符)" show-password-on="click" clearable />
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

      <section class=" text-right flex justify-center space-x-2">
        <NButton style="width: 200px;" type="primary" @click="resetPassword()">
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
