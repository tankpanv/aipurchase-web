<script setup lang="ts">
import { NConfigProvider, NMessageProvider } from 'naive-ui'
import { provide, ref } from 'vue'
import { NaiveProvider } from '@/components/common'
import { useTheme } from '@/hooks/useTheme'
import { useLanguage } from '@/hooks/useLanguage'
import Login from '@/components/common/Login/index.vue'
import { useEnvStore } from '@/store/modules/env/index'
// import { useEnvStore } from '@/store'

const { theme, themeOverrides } = useTheme()
const { language } = useLanguage()
const showLogin = ref(false)
provide('eventBus', {
  showLogin: () => {
    showLogin.value = true
  },
})

// 初始化环境变量
const envStore = useEnvStore()

// 初始化并赋值给envInfo
envStore.updateEnvInfo({
  app_id: import.meta.env.VITE_APP_ID,
  env: import.meta.env.VITE_ENV,
  version_code: import.meta.env.VITE_VERSION_CODECode,
  env_debug_log: import.meta.env.VITE_DEBUG_LOG,
})
</script>

<template>
  <NConfigProvider
    class="h-full" style="padding-bottom: 10px;"
    :theme="theme" :theme-overrides="themeOverrides" :locale="language"
  >
    <NaiveProvider>
      <NMessageProvider>
        <RouterView />
        <!-- 注册全局login组件 -->
        <Login v-if="showLogin" ref="GlobalLogin" v-model:visible="showLogin" />
      </NMessageProvider>
    </NaiveProvider>
  </NConfigProvider>
</template>
