<script lang="ts" setup>
import { ref } from 'vue'
import { NButton, NCheckbox, NInput, useMessage } from 'naive-ui'
import encryptString from '@/components/common/Login/encodePasswd'
import { useUserStore } from '@/store'
import { useRouter } from 'vue-router'
import { login as authLogin, register as authRegister } from '@/api/auth'

const router = useRouter()
const userStore = useUserStore()
const ms = useMessage()

const userInfo = ref({
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
  confirmPassword: '', // 添加确认密码字段
  phone: '',
})

const saveLogin = ref(true)
const isLoading = ref(false)

async function handleRegister() {
  // 基本验证
  if (!userInfo.value.username) {
    ms.error('请输入用户名')
    return
  }
  
  if (!userInfo.value.password) {
    ms.error('请输入密码')
    return
  }
  
  if (userInfo.value.password.length < 6) {
    ms.error('密码长度至少为6位')
    return
  }
  
  if (userInfo.value.password !== userInfo.value.confirmPassword) {
    ms.error('两次输入的密码不一致')
    return
  }
  
  try {
    isLoading.value = true
    const end = encryptString(userInfo.value.password)

    const registerRequest = {
      user_name: userInfo.value.username,
      password: end,
      name: userInfo.value.username,
    }

    const response = await authRegister(registerRequest)

    if (response.code === 201) {
      ms.success('注册成功，开始登录中...')

      const loginReq = {
        user_name: userInfo.value.username,
        password: end,
      }

      try {
        const loginResp = await authLogin(loginReq)
        if (loginResp.code === 200) {
          if (saveLogin.value) {
            userStore.updateUserInfo({
              isLogin: true,
              token: loginResp.data.access_token || loginResp.data.token,
              username: userInfo.value.username,
              phone: userInfo.value.phone,
              password: userInfo.value.password,
            })
          }
          else {
            userStore.updateUserInfo({
              isLogin: true,
              token: loginResp.data.access_token || loginResp.data.token,
              username: userInfo.value.username,
              phone: userInfo.value.phone,
              password: '',
            })
          }

          ms.success('登录成功')
          router.push('/') // 注册并登录成功后跳转到主页
        }
        else {
          ms.error('登录失败，请手动登录')
          router.push('/login')
        }
      }
      catch (error) {
        ms.error(`登录异常 ${error}`)
        router.push('/login')
      }
    }
    else {
      ms.error(response.message || '注册失败')
    }
  }
  catch (error) {
    console.error(error)
    ms.error(`注册异常 ${error}`)
  }
  finally {
    isLoading.value = false
  }
}

function toLogin() {
  router.push('/login')
}
</script>

<template>
  <div class="register-container">
    <div class="register-form">
      <h1 class="register-title"></h1>
      <p class="register-subtitle">创建新账号</p>
      
      <div class="form-group">
        <label>用户名</label>
        <NInput v-model:value="userInfo.username" placeholder="请输入用户名" />
      </div>
      
      <div class="form-group">
        <label>密码</label>
        <NInput 
          v-model:value="userInfo.password" 
          type="password" 
          placeholder="输入密码(6位以上数字或字符)"
          show-password-on="click" 
          clearable 
        />
      </div>
      
      <div class="form-group">
        <label>确认密码</label>
        <NInput 
          v-model:value="userInfo.confirmPassword" 
          type="password" 
          placeholder="再次输入密码"
          show-password-on="click" 
          clearable 
        />
      </div>
      
      <NButton 
        class="register-button" 
        type="primary" 
        :loading="isLoading"
        @click="handleRegister"
      >
        注册
      </NButton>
      
      <div class="form-footer">
        <NCheckbox v-model:checked="saveLogin">保存登录信息</NCheckbox>
        <a class="login-link" @click="toLogin">已有账号？去登录</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #2951B8; /* 蓝色背景，与图片匹配 */
}

.register-form {
  width: 450px;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.register-title {
  color: #2951B8;
  font-size: 24px;
  text-align: center;
  margin-bottom: 8px;
}

.register-subtitle {
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

.register-button {
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

.login-link {
  color: #2951B8;
  cursor: pointer;
}

.login-link:hover {
  text-decoration: underline;
}
</style> 