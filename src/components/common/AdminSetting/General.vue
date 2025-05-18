<script lang="ts" setup>
import { computed, defineEmits, ref } from 'vue'
import type { UploadFileInfo } from 'naive-ui'
import { NButton, NInput, useMessage } from 'naive-ui'
import type { Language, Theme } from '@/store/modules/app/helper'
import { useAppStore, useEnvStore, useUserStore } from '@/store'
import type { UserInfo } from '@/store/modules/user/helper'
import { getCurrentDate } from '@/utils/functions'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { t } from '@/locales'
import type { EnvInfo } from '@/store/modules/env/helper'

const emit = defineEmits(['closeModal'])
const appStore = useAppStore()
const userStore = useUserStore()
const envStore = useEnvStore()
const { isMobile } = useBasicLayout()

const ms = useMessage()

const theme = computed(() => appStore.theme)

const userInfo = computed(() => userStore.userInfo)
const envInfo = computed(() => envStore.envInfo)
const avatar = ref(userInfo.value.avatar ?? '')

const name = ref(userInfo.value.name ?? '')

const description = ref(userInfo.value.description ?? '')

const language = computed({
  get() {
    return appStore.language
  },
  set(value: Language) {
    appStore.setLanguage(value)
  },
})
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
  userStore.updateWUserInfo({

  })
  emit('closeModal')
}
const themeOptions: { label: string; key: Theme; icon: string }[] = [
  {
    label: 'Auto',
    key: 'auto',
    icon: 'ri:contrast-line',
  },
  {
    label: 'Light',
    key: 'light',
    icon: 'ri:sun-foggy-line',
  },
  {
    label: 'Dark',
    key: 'dark',
    icon: 'ri:moon-foggy-line',
  },
]

const languageOptions: { label: string; key: Language; value: Language }[] = [
  { label: '简体中文', key: 'zh-CN', value: 'zh-CN' },
  { label: '繁體中文', key: 'zh-TW', value: 'zh-TW' },
  { label: 'English', key: 'en-US', value: 'en-US' },
  { label: '한국어', key: 'ko-KR', value: 'ko-KR' },
  { label: 'Русский язык', key: 'ru-RU', value: 'ru-RU' },
  { label: 'Tiếng Việt', key: 'vi-VN', value: 'vi-VN' },
  { label: 'Français', key: 'fr-FR', value: 'fr-FR' },
  { label: 'Türkçe', key: 'tr-TR', value: 'tr-TR' },
]

function updateUserInfo(options: Partial<UserInfo>) {
  userStore.updateUserInfo(options)
  ms.success(t('common.success'))
}
function updateEnvInfo(options: Partial<EnvInfo>) {
  envStore.updateEnvInfo(options)
  ms.success(t('common.success'))
}
function handleReset() {
  userStore.resetUserInfo()
  ms.success(t('common.success'))
  window.location.reload()
}
const prizePool = ref('0')
GetPrizePoolInfo()

async function GetPrizePoolInfo() {
  
}
async function updatePrizePoolInfo() {
 
}
function exportData(): void {
  const date = getCurrentDate()
  const data: string = localStorage.getItem('chatStorage') || '{}'
  const jsonString: string = JSON.stringify(JSON.parse(data), null, 2)
  const blob: Blob = new Blob([jsonString], { type: 'application/json' })
  const url: string = URL.createObjectURL(blob)
  const link: HTMLAnchorElement = document.createElement('a')
  link.href = url
  link.download = `chat-store_${date}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function importData(event: Event): void {
  const target = event.target as HTMLInputElement
  if (!target || !target.files)
    return

  const file: File = target.files[0]
  if (!file)
    return

  const reader: FileReader = new FileReader()
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result as string)
      localStorage.setItem('chatStorage', JSON.stringify(data))
      ms.success(t('common.success'))
      location.reload()
    }
    catch (error) {
      ms.error(t('common.invalidFileFormat'))
    }
  }
  reader.readAsText(file)
}

function clearData(): void {
  localStorage.removeItem('chatStorage')
  location.reload()
}

function handleImportButtonClick(): void {
  const fileInput = document.getElementById('fileInput') as HTMLElement
  if (fileInput)
    fileInput.click()
}
function handleSaveAll() {

}
function handleUploadCover({
  file,
  event,
}: {
  file: UploadFileInfo
  event?: ProgressEvent
}) {
  // ms.success((event?.target as XMLHttpRequest).response)
  const resp = (event?.target as XMLHttpRequest).response
  const jsonObject = JSON.parse(resp)
  console.log('upload avatar', resp, jsonObject)

  if (jsonObject.file_info.url !== '') {
    // ms.success(`上传成功 ${jsonObject.file_info.url}`)
    updateAvatar(jsonObject.file_info.url)
  }

  // ms.success('上传成功', file.url)
  return file
}
async function updateAvatar(avatarUrl: string) {
 
}
</script>

<template>
  <div class="p-4 space-y-5 min-h-[200px]">
    <div class="space-y-6">
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">奖金池</span>
        <div class="w-[200px]">
          <NInput v-model:value="prizePool" placeholder="" />
        </div>
        <NButton size="tiny" text type="primary" @click="updatePrizePoolInfo">
          {{ $t('common.save') }}
        </NButton>
      </div>
    </div>
  </div>
</template>
