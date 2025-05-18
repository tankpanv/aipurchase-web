import { defineStore } from 'pinia'
import type { EnvInfo, EnvState } from './helper'
import { defaultSetting, getLocalState } from './helper'

export const useEnvStore = defineStore('env-store', {
  state: (): EnvState => getLocalState(),
  actions: {
    updateEnvInfo(envInfo: Partial<EnvInfo>) {
      this.envInfo = { ...this.envInfo, ...envInfo }
    },

    resetEnvInfo() {
      this.envInfo = { ...defaultSetting().envInfo }
    },

  },
})
