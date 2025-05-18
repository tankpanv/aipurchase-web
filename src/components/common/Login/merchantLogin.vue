<script lang="ts" setup>
import { ref } from 'vue'
import { NButton, NCheckbox, NInput, useMessage } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'

import { useUserStore } from '@/store'
import { getMerchantProfile, merchantLogin } from '@/api/auth'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const saveLogin = ref(true)
const isLoading = ref(false)
const loginCountdown = ref(0)
const ms = useMessage()

// 商家登录信息
const merchantInfo = ref({
  username: '',
  password: '',
})

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
    // 加密密码
    const encryptedPassword = merchantInfo.value.password

    const loginReq = {
      username: merchantInfo.value.username,
      password: encryptedPassword,
    }

    const response = await merchantLogin(loginReq)

    if (response) {
      // 保存基本登录信息
      userStore.updateUserInfo({
        token: response.access_token,
        refresh_token: response.refresh_token,
        isLogin: true,
        // 使用description字段存储用户类型
        description: 'merchant',
      })

      // 获取商家详细资料
      try {
        const profileRes = await getMerchantProfile()
        if (profileRes) {
          if (saveLogin.value) {
            // 如果选择了记住密码，则保存用户名和密码
            userStore.updateUserInfo({
              username: merchantInfo.value.username,
              password: merchantInfo.value.password,
              uid: profileRes.id.toString(),
              name: profileRes.name, // 商家名称
              nickname: response.merchant_name, // 商家昵称
              phone: profileRes.phone,
              email: profileRes.email,
              avatar: profileRes.logo_url, // 商家logo作为头像
              // 使用client_agent存储商家ID
              client_agent: response.merchant_id.toString(),
              // 使用user_agent存储商家地址
              user_agent: profileRes.address,
              // 其他数据可以序列化为JSON存储在其他字段中
              platform: 'merchant', // 用于区分用户类型
            })
          }
          else {
            // 不保存密码
            userStore.updateUserInfo({
              username: merchantInfo.value.username,
              uid: profileRes.id.toString(),
              name: profileRes.name,
              nickname: response.merchant_name,
              phone: profileRes.phone,
              email: profileRes.email,
              avatar: profileRes.logo_url,
              // 使用client_agent存储商家ID
              client_agent: response.merchant_id.toString(),
              // 使用user_agent存储商家地址
              user_agent: profileRes.address,
              platform: 'merchant', // 用于区分用户类型
            })
          }
        }
      }
      catch (profileError) {
        console.error('获取商家资料失败', profileError)
      }

      ms.success('登录成功')

      // 获取重定向地址或默认跳转到商家后台首页
      const redirect = route.query.redirect as string
      // 添加短暂延迟确保模态框关闭后再跳转
      setTimeout(() => {
        router.push(redirect || '/merchant/dashboard')
      }, 200)
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
    clearInterval(timer)
  }
}

function goToRegister() {
  router.push('/merchant/register')
}
</script>

<template>
  <div class="p-4 space-y-5 min-h-[200px]">
    <div class="space-y-6">
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[70px]">用户名</span>
        <div class="flex-1">
          <NInput v-model:value="merchantInfo.username" placeholder="请输入商家用户名" />
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[70px]">密码</span>
        <div class="flex-1">
          <NInput
            v-model:value="merchantInfo.password"
            type="password"
            placeholder="请输入密码"
            show-password-on="click"
            clearable
          />
        </div>
      </div>

      <div class="flex items-center space-x-4">
        <NCheckbox v-model:checked="saveLogin">
          记住密码
        </NCheckbox>
      </div>

      <section class="flex justify-center space-x-4">
        <NButton style="width: 200px;" type="primary" :loading="isLoading" @click="handleLogin()">
          商家登录
        </NButton>
      </section>

      <div class="flex justify-center mt-4">
        <span class="text-gray-500">还没有账号？</span>
        <a class="text-blue-500 ml-2 cursor-pointer" @click="goToRegister">立即注册</a>
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
