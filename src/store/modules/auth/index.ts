import { defineStore } from 'pinia'
import { getToken, removeToken, setToken } from './helper'
import { store } from '@/store/helper'

import {  homeStore } from '@/store/homeStore'
import { useAppStore, useAppStoreWithOut } from '@/store'
const appStore = useAppStoreWithOut()
interface SessionResponse {
  theme?: string
  auth: boolean
  model: 'ChatGPTAPI' | 'ChatGPTUnofficialProxyAPI'
}

export interface AuthState {
  token: string | undefined
  session: SessionResponse | null
}

export const useAuthStore = defineStore('auth-store', {
  state: (): AuthState => ({
    token: getToken(),
    session: null,
  }),

  getters: {
    isChatGPTAPI(state): boolean {
      return state.session?.model === 'ChatGPTAPI'
    },
  },

  actions: {
    async getSession() {
      try {
        const data = {
          "disableGpt4": "",
          "isWsrv": "",
          "uploadImgSize": "1",
          "theme": "dark",
          "isCloseMdPreview": false,
          "uploadType": "",
          "notify": "",
          "baiduId": "",
          "googleId": "",
          "isHideServer": false,
          "isUpload": true,
          "auth": false,
          "model": "ChatGPTAPI",
          "amodel": "",
          "isApiGallery": false,
          "cmodels": "",
          "isUploadR2": false,
          "gptUrl": ""
        }
        this.session = { ...data }
        homeStore.setMyData({session: data });
        appStore.setTheme('light')
        // if(appStore.$state.theme=='auto' ){
        //     appStore.setTheme(  data.theme && data.theme=='light' ?'light':'dark')
            
        // }

     
        return Promise.resolve(data)
      }
      catch (error) {
        return Promise.reject(error)
      }
    },

    setToken(token: string) {
      this.token = token
      setToken(token)
    },

    removeToken() {
      this.token = undefined
      removeToken()
    },
  },
})

export function useAuthStoreWithout() {
  return useAuthStore(store)
}
