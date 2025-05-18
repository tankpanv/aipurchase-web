<script setup lang='ts'>
import { computed, onMounted, ref } from 'vue'
import { NSpin } from 'naive-ui'
import pkg from '../../../../package.json'
import { useAuthStore } from '@/store'

interface ConfigState {
  timeoutMs?: number
  reverseProxy?: string
  apiModel?: string
  socksProxy?: string
  httpsProxy?: string
  usage?: string
  remaining?: string
  hard_limit_usd?: string
}

const authStore = useAuthStore()

const loading = ref(false)

const config = ref<ConfigState>()
const st = ref({ lastVersion: '' })

const isChatGPTAPI = computed<boolean>(() => !!authStore.isChatGPTAPI)

onMounted(() => {
 
})
const isShow = computed(() => {
  return st.value.lastVersion && st.value.lastVersion != `v${pkg.version}`
})
</script>

<template>
  <NSpin :show="loading">
    <div class="p-4 space-y-4">
      <h2 class="text-xl font-bold">
        Version - {{ pkg.version }}
        <!-- <a class="text-red-500" href="https://github.com/Dooy/chatgpt-web-midjourney-proxy" target="_blank" v-if=" isShow  "> ({{ $t('mj.findVersion') }} {{ st.lastVersion }})</a>
        <a class="text-gray-500" href="https://github.com/Dooy/chatgpt-web-midjourney-proxy" target="_blank" v-else-if="st.lastVersion"> ({{ $t('mj.yesLastVersion') }})</a> -->
      </h2>
      <div class="p-2 space-y-2 rounded-md bg-neutral-100 dark:bg-neutral-700">
        <p>本系统后端连接最先进的人工智能ai</p>
      </div>
      <p>{{ $t("setting.api") }}：{{ config?.apiModel ?? '-' }}</p>
      <div v-if="isChatGPTAPI" class=" flex items-center justify-between">
        <div>
          {{ $t("setting.monthlyUsage") }}：{{ config?.usage ?? '-' }}
        </div>
        <div>
          {{ $t("mj.totalUsage") }}：{{ config?.hard_limit_usd ?? '-' }}
        </div>
        <div>
          {{ $t("setting.balance") }}：{{ config?.remaining ?? '-' }}
        </div>
      </div>
      <p v-if="!isChatGPTAPI">
        {{ $t("setting.reverseProxy") }}：{{ config?.reverseProxy ?? '-' }}
      </p>

      <!-- <p>{{ $t("setting.timeout") }}：{{ config?.timeoutMs ?? '-' }}</p>  -->
      <!-- <p>{{ $t("setting.socks") }}：{{ config?.socksProxy ?? '-' }}</p>
      <p>{{ $t("setting.httpsProxy") }}：{{ config?.httpsProxy ?? '-' }}</p> -->
    </div>
  </NSpin>
</template>
