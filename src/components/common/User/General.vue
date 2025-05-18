<script lang="ts" setup>
import { computed, defineEmits, ref } from 'vue'
import type { UploadFileInfo } from 'naive-ui'
import { NAvatar, NButton, NInput, NPopconfirm, NSelect, NSwitch, NUpload, useMessage } from 'naive-ui'
import type { Language, Theme } from '@/store/modules/app/helper'
import { SvgIcon } from '@/components/common'
import { useAppStore, useEnvStore, useUserStore } from '@/store'
import type { UserInfo } from '@/store/modules/user/helper'
import { getCurrentDate } from '@/utils/functions'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import defaultAvatar from '@/assets/avatar.jpg'
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
  // try {
  //   // 构造符合 UserapiWUser 接口定义的对象

  //   // 构造符合 UserapiWUserBaseInfo 接口定义的对象

  //   // 构造符合 UserapiRegisterWUserReq 接口定义的请求对象
  //   const wUserItem: UserapiWUser = {
  //     uid: userInfo.value.uid,
  //     avatar: avatarUrl,
  //   }
  //   const req: UserapiUpdateWUserReq = {
  //     update_fields: ['avatar'],

  //     w_user: wUserItem,
  //   }

  //   // 调用 uploadAuthFilesPost 方法
  //   // 调用 wuserRegisterPost 函数
  //   UserApiInstance.wuserAuthUpdateIdPost(req, {
  //     validateStatus(status) {
  //       // 返回 true 时，promise 将会 resolve；返回 false，则 promise 将会 reject
  //       // 这里允许所有的响应状态码，这样您就可以在之后自行处理
  //       return true // 或者您可以指定允许的状态码范围，例如： return status >= 200 && status < 500;
  //     },
  //   }).then((response) => {
  //     // 调用返回的函数

  //     // 读取 UserapiRegisterWUserResp 返回结果
  //     const userResp = response.data
  //     if (response.status === 200) {
  //       if (userResp.status === 0)
  //         userStore.updateUserInfo({ avatar: avatarUrl })
  //       ms.success('上传成功')
  //     }
  //     else {
  //       ms.error(`上传失败 ${userResp.msg}` ?? '上传失败')
  //     }
  //     // 处理返回的请求参
  //   })
  //     .catch((error) => {
  //       console.error(error)
  //       ms.error(`上传异常 ${error}` ?? '上传异常')
  //     })
  // }
  // catch (error) {
  //   // 处理错误
  //   console.error(error)
  //   ms.error(`上传异常 ${error}` ?? '上传异常')
  // }
  // finally {

  // }
}
</script>

<template>
  <div class="p-4 space-y-5 min-h-[200px]">
    <div class="space-y-6">
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">{{ $t('setting.avatarLink') }}</span>
        <div class="flex-1">
          <NAvatar
            size="large" round :src="userInfo.avatar === '' ? defaultAvatar : userInfo.avatar"
            :fallback-src="defaultAvatar"
          />
          <NUpload
            action="https://sqdftauejboz.sealoshzh.site/wuser/auth/upload/avatar"
            :headers="{ 'Authorization': `Bearer ${userInfo.token}`, 'x-env': envInfo.env }" :data="{
              uid: userInfo.uid,
            }" :default-upload="true" :show-file-list="true" accept="image/png, image/jpeg, image/jpg"
            @finish="handleUploadCover"
          >
            <NButton>上传文件</NButton>
          </NUpload>
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">{{ $t('setting.name') }}</span>
        <div class="w-[200px]">
          <NInput v-model:value="name" placeholder="" />
        </div>
        <NButton size="tiny" text type="primary" @click="updateUserInfo({ name })">
          {{ $t('common.save') }}
        </NButton>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">{{ $t('setting.description') }}</span>
        <div class="flex-1">
          <NInput v-model:value="description" placeholder="" />
        </div>
        <NButton size="tiny" text type="primary" @click="updateUserInfo({ description })">
          {{ $t('common.save') }}
        </NButton>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">是否流式回答</span>

        <NSwitch v-model:value="envInfo.is_use_sse" />
      </div>
      <div class="flex items-center space-x-4" :class="isMobile && 'items-start'">
        <span class="flex-shrink-0 w-[100px]">{{ $t('setting.chatHistory') }}</span>

        <div class="flex flex-wrap items-center gap-4">
          <NButton size="small" @click="exportData">
            <template #icon>
              <SvgIcon icon="ri:download-2-fill" />
            </template>
            {{ $t('common.export') }}
          </NButton>

          <input id="fileInput" type="file" style="display:none" @change="importData">
          <NButton size="small" @click="handleImportButtonClick">
            <template #icon>
              <SvgIcon icon="ri:upload-2-fill" />
            </template>
            {{ $t('common.import') }}
          </NButton>

          <NPopconfirm placement="bottom" @positive-click="clearData">
            <template #trigger>
              <NButton size="small">
                <template #icon>
                  <SvgIcon icon="ri:close-circle-line" />
                </template>
                {{ $t('common.clear') }}
              </NButton>
            </template>
            {{ $t('chat.clearHistoryConfirm') }}
          </NPopconfirm>
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">{{ $t('setting.theme') }}</span>
        <div class="flex flex-wrap items-center gap-4">
          <template v-for="item of themeOptions" :key="item.key">
            <NButton
              size="small" :type="item.key === theme ? 'primary' : undefined"
              @click="appStore.setTheme(item.key)"
            >
              <template #icon>
                <SvgIcon :icon="item.icon" />
              </template>
            </NButton>
          </template>
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">退出</span>
        <NButton size="small" type="primary" @click="logout">
          退出登录
        </NButton>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">{{ $t('setting.language') }}</span>
        <div class="flex flex-wrap items-center gap-4">
          <NSelect
            style="width: 140px" :value="language" :options="languageOptions"
            @update-value="value => appStore.setLanguage(value)"
          />
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">{{ $t('setting.resetUserInfo') }}</span>
        <NButton size="small" @click="handleReset">
          {{ $t('common.reset') }}
        </NButton>
      </div>

      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">保存</span>
        <NButton size="small" type="primary" @click="handleSaveAll">
          {{ $t('common.save') }}
        </NButton>
      </div>
    </div>
  </div>
</template>
