import { defineStore } from 'pinia'
import type { UserInfo, UserState } from './helper'
import { defaultSetting, getLocalState, setLocalState } from './helper'
import type { UserapiWUser } from '@/openapi-generated/dotaweb/userapi'

export const useUserStore = defineStore('user-store', {
  state: (): UserState => getLocalState(),
  actions: {
    updateUserInfo(userInfo: Partial<UserInfo>) {
      this.userInfo = { ...this.userInfo, ...userInfo }
      this.recordState()
    },

    updateWUserInfo(wuserInfo: Partial<UserapiWUser>) {
      this.wUserInfo = { ...this.wUserInfo, ...wuserInfo }
      this.recordState()
    },
    resetUserInfo() {
      this.userInfo = { ...defaultSetting().userInfo }
      this.recordState()
    },

    recordState() {
      setLocalState(this.$state)
    },
  },
})
export function DisableApiKey(disableApiKeyCode: string) {
  const userStore = useUserStore()
  // const userInfo = computed(() => userStore.userInfo)
  userStore.updateUserInfo({ UseApiKeyCache: false, DisableApiKeyCode: disableApiKeyCode })
  console.log('DisableApiKey', disableApiKeyCode)
}
export function ResetApiKeyUseCache() {
  const userStore = useUserStore()
  // const userInfo = computed(() => userStore.userInfo)
  userStore.updateUserInfo({ UseApiKeyCache: true, DisableApiKeyCode: '' })
}
