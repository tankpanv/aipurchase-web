<script setup lang='ts'>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { NTabPane, NTabs } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import loginPassword from '@/components/common/Login/loginPassword.vue'
import register from '@/components/common/Login/register.vue'
import resetPassword from '@/components/common/Login/resetPassword.vue'
import { useAuthStore, useUserStore } from '@/store'

const authStore = useAuthStore()
const userStore = useUserStore()
const router = useRouter()
const route = useRoute()
const isChatGPTAPI = computed<boolean>(() => !!authStore.isChatGPTAPI)
const active = ref('loginPassword')

// 组件挂载时检查登录状态
onMounted(() => {
  // 如果用户已登录，则直接跳转到首页
  if (userStore.userInfo.isLogin && userStore.userInfo.token) {
    const redirect = route.query.redirect as string || '/'
    router.push(redirect)
  }
})

// 在组件销毁时移除事件监听
onUnmounted(() => {
})
</script>

<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <h1>智能购物管理系统系统</h1>
        <p>欢迎使用智能购物管理系统系统</p>
      </div>

      <NTabs v-model:value="active" type="line" animated>
        <NTabPane name="loginPassword" tab="loginPassword">
          <template #tab>
            <span class="ml-2">密码登录</span>
          </template>
          <div class="min-h-[100px]">
            <loginPassword />
          </div>
        </NTabPane>

        <NTabPane name="register" tab="register">
          <template #tab>
            <span class="ml-2">注册</span>
          </template>
          <register />
        </NTabPane>
        <NTabPane name="reset" tab="reset">
          <template #tab>
            <span class="ml-2">重设密码</span>
          </template>
          <resetPassword />
        </NTabPane>
      </NTabs>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #2951B8 0%, #1a365d 100%);
}

.auth-container {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-header h1 {
  color: #2951B8;
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.auth-header p {
  color: #666;
  font-size: 1rem;
}

:deep(.n-tabs-nav) {
  margin-bottom: 1.5rem;
}
</style>
