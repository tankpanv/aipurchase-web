<script setup lang="ts">
import { computed, defineAsyncComponent, inject, onMounted, ref } from 'vue'
import { NAvatar, NButton, NText, NTooltip } from 'naive-ui'
import { useRouter } from 'vue-router'
import Sidebar from './Sidebar.vue'
import { useEnvStore, useUserStore } from '@/store'
import defaultAvatarImg from '@/assets/avatar.png'
import { useTheme } from '@/hooks/useTheme'
import SvgIcon from '@/components/common/SvgIcon/index.vue'

const router = useRouter()
const { themeOverrides } = useTheme()

const User = defineAsyncComponent(() => import('@/components/common/User/index.vue'))
const BaseSetting = defineAsyncComponent(() => import('@/components/common/BaseSetting/index.vue'))

const loginInfoShow = ref({
  show: false,
})

const baseSettingShow = ref({
  show: false,
})

const userStore = useUserStore()
const envStore = useEnvStore()
const userInfo = computed(() => userStore.userInfo)
const envInfo = computed(() => envStore.envInfo)

const defaultAvatar = defaultAvatarImg

function logout() {
  userStore.updateUserInfo({
    name: '',
    avatar: '',
    description: '',
    isLogin: false,
    expireTime: '0',
    token: '',
    uid: '',
  })
  router.push('/login')
}
const eventBus = inject('eventBus')

onMounted(() => {
  // if (!userInfo.value.isLogin || !userInfo.value.token)
  //   router.push('/login')
})

function toLogin() {
  // router.push('/login')
  if (!userInfo.value.isLogin)
    eventBus.showLogin()
}
</script>

<template>
  <div class="main-layout">
    <div class="layout-header">
      <div class="header-left">
        <div class="logo-container">
          <SvgIcon icon="ri:file-list-line" class="text-2xl" />
          <h2>智能购物管理系统系统</h2>
        </div>
        <div class="date-display">
          {{ new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }) }}
        </div>
      </div>
      <div class="header-right">
        <div class="flex items-center space-x-6">
          <div
            class="user-info-container"
            @click="userInfo.isLogin ? loginInfoShow.show = true : toLogin()"
          >
            <div v-if="userInfo.isLogin">
              <a class="user-link">
                <NTooltip placement="bottom" trigger="hover">
                  <template #trigger>
                    <div class="user-avatar">
                      <NAvatar
                        size="small"
                        round
                        :src="userInfo.avatar === '' ? defaultAvatar : userInfo.avatar"
                        :fallback-src="defaultAvatar"
                      />
                      <span class="user-name">{{ userInfo.WUser?.nickname || '用户' }}</span>
                    </div>
                  </template>
                  <div class="user-tooltip">
                    <div><NText>{{ userInfo.WUser?.nickname }}</NText></div>
                    <div><NButton text type="error" @click="logout">退出登录</NButton></div>
                  </div>
                </NTooltip>
              </a>
            </div>
            <div v-else class="login-text cursor-pointer">
              <NText>登录</NText>
            </div>
          </div>
          <a
            v-if="userInfo.isLogin && userInfo.WUser?.admin_level && userInfo.WUser?.admin_level > 0"
            href="/mine/admin"
            class="flex flex-col items-center"
          >
            <NTooltip placement="bottom" trigger="hover">
              <template #trigger>
                <div class="flex flex-col items-center">
                  <NText>管理员</NText>
                </div>
              </template>
              管理员
            </NTooltip>
          </a>
          <div class="flex flex-col items-center cursor-pointer" @click="baseSettingShow.show = true">
            <SvgIcon icon="ri:settings-4-line" class="text-3xl" />
          </div>
          <div style="width: 2px;" />
        </div>
        <User v-if="loginInfoShow.show" v-model:visible="loginInfoShow.show" />
        <BaseSetting v-if="baseSettingShow.show" v-model:visible="baseSettingShow.show" />
      </div>
    </div>
    <div class="layout-content">
      <Sidebar class="sidebar" />
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: v-bind('themeOverrides?.value?.common?.bodyColor || "#ffffff"');
}

.layout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 88px;
  background-color: v-bind('themeOverrides?.value?.common?.primaryColor || "#333333"');
  color: white;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-container h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: white;
}

.date-display {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info-container {
  cursor: pointer;
  padding: 0 8px;
}

.user-link {
  text-decoration: none;
  color: white;
}

.user-avatar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  font-size: 14px;
  color: white;
}

.login-text {
  color: white;
  font-size: 14px;
}

.layout-content {
  flex: 1;
  display: flex;
  background-color: v-bind('themeOverrides?.value?.common?.bodyColor || "#f5f5f5"');
}

.sidebar {
  background-color: v-bind('themeOverrides?.value?.common?.cardColor || "#ffffff"');
  border-right: 1px solid v-bind('themeOverrides?.value?.common?.textColor3 || "#e5e5e5"');
}

.content {
  flex: 1;
  padding: 16px;
  background-color: v-bind('themeOverrides?.value?.common?.bodyColor || "#f5f5f5"');
}

.user-tooltip {
  padding: 8px;
  color: v-bind('themeOverrides?.value?.common?.textColorBase || "#1f1f1f"');
}
</style>
