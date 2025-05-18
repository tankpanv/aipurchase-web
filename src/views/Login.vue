<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { NButton, NCheckbox, NInput, useMessage } from 'naive-ui'
import encryptString from '@/components/common/Login/encodePasswd'
import { useUserStore } from '@/store'
import { useRouter } from 'vue-router'
import { login as authLogin } from '@/api/auth'
import { useRoute } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()
const saveLogin = ref(true)
const isLoading = ref(false)
const userInfo = ref({
  avatar: '',
  name: '',
  description: '',
  isLogin: false,
  token: '',
  expireTime: '',
  uid: '',
  device_id: '',
  username: userStore.userInfo.username,
  password: userStore.userInfo.password,
  phone: userStore.userInfo.phone,
})
const ms = useMessage()
const route = useRoute()

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
      clearInterval(timer)
    }
  }, 10000)
  
  try {
    const end = encryptString(userInfo.value.password)

    const loginReq = {
      user_name: userInfo.value.username, // 这里使用username作为登录账号
      password: end,
    }

    const response = await authLogin(loginReq)
    if (response.code === 200) {
      if (saveLogin.value) {
        userStore.updateUserInfo({
          isLogin: true,
          token: response.data.token,
          username: userInfo.value.username,
          phone: userInfo.value.phone,
          password: userInfo.value.password,
          role: 'admin',
        })
      }
      else {
        userStore.updateUserInfo({
          isLogin: true,
          token: response.data.token,
          username: userInfo.value.username,
          phone: userInfo.value.phone,
          password: '',
          role: 'admin',
        })
      }

      ms.success('登录成功')
      
      // 获取重定向地址或默认跳转到首页
      const redirect = route.query.redirect as string
      router.push(redirect || '/')
    }
    else {
      ms.error(response.message || '登录失败')
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

function toRegister() {
  router.push('/register')
}

onMounted(() => {
  // 检查是否已登录
  if (userStore.userInfo.isLogin && userStore.userInfo.token) {
    router.push('/')
  }
})
</script>

<template>
  <div class="login-container">
    <div class="login-form">
      <h1 class="login-title">报销分析系统</h1>
      <p class="login-subtitle">请输入您的用户名和密码登录</p>
      
      <div class="form-group">
        <label>用户名</label>
        <NInput v-model:value="userInfo.username" placeholder="请输入用户名" />
      </div>
      
      <div class="form-group">
        <label>密码</label>
        <NInput 
          v-model:value="userInfo.password" 
          type="password" 
          placeholder="请输入密码"
          show-password-on="click" 
          clearable 
        />
      </div>
      
      <NButton 
        class="login-button" 
        type="primary" 
        :loading="isLoading"
        @click="handleLogin"
      >
        登录
      </NButton>
      
      <div class="form-footer">
        <NCheckbox v-model:checked="saveLogin">保存登录信息</NCheckbox>
        <a class="register-link" @click="toRegister">注册新账号</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #2951B8; /* 蓝色背景，与图片匹配 */
}

.login-form {
  width: 450px;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.login-title {
  color: #2951B8;
  font-size: 24px;
  text-align: center;
  margin-bottom: 8px;
}

.login-subtitle {
  color: #666;
  text-align: center;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.login-button {
  width: 100%;
  margin-top: 24px;
  height: 40px;
  font-size: 16px;
  background-color: #2951B8; /* 按钮颜色与背景一致 */
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}

.register-link {
  color: #2951B8;
  cursor: pointer;
}

.register-link:hover {
  text-decoration: underline;
}
</style> 