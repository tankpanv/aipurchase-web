import type { Router } from 'vue-router'
import Fingerprint2 from 'fingerprintjs2'
import { useAuthStoreWithout } from '@/store/modules/auth'
import { useUserStore } from '@/store'
import { validateToken } from '@/utils/tokenValidator'

function checkIfUserIsLoggedIn() {
  const userStore = useUserStore()
  console.log('userStore.userInfo.token', userStore.userInfo.token)
  return userStore.userInfo.token === ''
}
function getDeviceInfo() {
  const userAgent = navigator.userAgent
  const userStore = useUserStore()

  let currentSystem = ''
  if (userAgent.match(/Android/i))
    currentSystem = 'android'
  else if (userAgent.match(/iPhone|iPad|iPod/i))
    currentSystem = 'iOS'
  else if (userAgent.match(/Macintosh/i))
    currentSystem = 'macOS'
  else if (userAgent.match(/Windows/i))
    currentSystem = 'windows'
  else
    currentSystem = userAgent
  console.log('currentSystem', userAgent, currentSystem)
  Fingerprint2.get((components) => {
    const values = components.map(component => component.value)
    const deviceId = Fingerprint2.x64hash128(values.join(''), 31)
    userStore.updateUserInfo({ device_id: deviceId })
    // console.log('Device ID:', deviceId)
  })
  const Idfa = window.deviceIdfa
  userStore.updateUserInfo({ Idfa, platform: currentSystem, user_agent: userAgent })
  // console.log('Idfa:', Idfa, currentSystem)
}
export function setupPageGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStoreWithout()
    getDeviceInfo()
    
    // 如果用户访问的不是登录页，验证token
    if (!to.path.includes('/login') && !to.path.includes('/register')) {
      // 仅在需要时静默验证token
      try {
        await validateToken()
      } catch (error) {
        console.error('Token验证失败:', error)
      }
    }
    
    const isLoggedIn = checkIfUserIsLoggedIn() // 检查用户是否已登录

    if (to.matched.some(record => record.meta.requiresAuth) && !isLoggedIn) {
      // next(false) // 阻止路由跳转
      console.log('阻止路由跳转')
    }
    else {
      next()
    }
    if (!authStore.session) {
      try {
        const data = await authStore.getSession()
        if (String(data.auth) === 'false' && authStore.token)
          authStore.removeToken()
        if (to.path === '/500')
          next({ name: 'Root' })
        else
          next()
      }
      catch (error) {
        if (to.path !== '/500')
          next({ name: '500' })
        else
          next()
      }
    }
    else {
      next()
    }
  })
}
