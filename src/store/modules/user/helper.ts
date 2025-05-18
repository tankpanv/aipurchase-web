import { ss } from '@/utils/storage'
import { t } from '@/locales'
import type { UserapiWUser } from '@/openapi-generated/dotaweb/userapi/api'

const LOCAL_NAME = 'userStorage'

export interface UserInfo {
  avatar: string
  name: string
  description: string
  isLogin: boolean
  token: string
  expireTime: string
  uid: string
  device_id: string
  username: string
  password: string
  phone: string
  realName: string
  email: string
  refresh_token: string
  nickname: string
  // IDFA（广告标识符）是由苹果分配给设备用于广告目的的唯一标识符。与 IDFV 不同，IDFA 是与设备本身相关联的，而不是与供应商相关联的。
  Idfa: string
  platform: string
  user_agent: string
  client_agent: string
  vip_level: number
  coins: number
  UseApiKeyCache: boolean
  DisableApiKeyCode: string
  WUser: UserapiWUser
  role: string
}

export interface UserState {
  userInfo: UserInfo

  wUserInfo: UserapiWUser
}

export function defaultSetting(): UserState {
  return {
    userInfo: {
      avatar: 'https://raw.githubusercontent.com/Dooy/chatgpt-web-midjourney-proxy/main/src/assets/avatar.jpg',
      name: t('mjset.sysname'), // 'AI绘图',

      // description: 'Star on <a href="https://github.com/Dooy/chatgpt-web-midjourney-proxy" class="text-blue-500" target="_blank" >GitHub</a>',
      description: '开心每一天',
      isLogin: false,
      token: '',
      expireTime: '',
      uid: '',
      device_id: '',
      username: '',
      password: '',
      phone: '',
      UseApiKeyCache: true,
      DisableApiKeyCode: '',
      role: '',
    },

    wUserInfo: {},
  }
}

export function getLocalState(): UserState {
  const localSetting: UserState | undefined = ss.get(LOCAL_NAME)
  return { ...defaultSetting(), ...localSetting }
}

export function setLocalState(setting: UserState): void {
  ss.set(LOCAL_NAME, setting)
}
