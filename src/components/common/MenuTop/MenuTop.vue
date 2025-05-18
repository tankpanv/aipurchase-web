<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue'
import { NAvatar, NText, NTooltip, useMessage } from 'naive-ui'
import { MainTabTypes } from './const'
import { SvgIcon } from '@/components/common'
import defaultAvatar from '@/assets/avatar.png'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useEnvStore, useUserStore } from '@/store'
import { router } from '@/router'
const User = defineAsyncComponent(() => import('@/components/common/User/index.vue'))
const BaseSetting = defineAsyncComponent(() => import('@/components/common/BaseSetting/index.vue'))
const Setting = defineAsyncComponent(() => import('@/components/common/Setting/index.vue'))
const Login = defineAsyncComponent(() => import('@/components/common/Login/index.vue'))

const { isMobile } = useBasicLayout()
const userStore = useUserStore()
const envStore = useEnvStore()
const message = useMessage()

const st = ref({ show: false, showImg: false, menu: [], active: 'chat' })
const loginItem = ref({ show: false, showImg: false, menu: [], active: 'chat' })
const loginInfoShow = ref({ show: false, showImg: false, menu: [], active: 'chat' })
const userInfo = computed(() => userStore.userInfo)
const envInfo = computed(() => envStore.envInfo)
const baseSettingShow = ref({ show: false })
const goHome = computed(() => router.currentRoute.value.name)

const options = [
  { label: '英雄榜', key: 'hero', disabled: false },
  { label: '贴吧', key: 'article' },
  { label: '奖金池', key: 'prize_pool' },
  { label: '赛事', key: 'event' },
]
const selectedMenu = computed(() => {
  const currentRoute = router.currentRoute.value
  if (
    currentRoute.path === '/info/main'

  )
    return 'home'
  // 检查路径和查询参数
  if (
    currentRoute.path === '/info/tabAllData'
    && currentRoute.query.source === '1'
    && currentRoute.query.tab === `${MainTabTypes.Tournaments.id}`
  )
    return 'Tournaments'
  if (
    currentRoute.path === '/info/tabAllData'
    && currentRoute.query.source === '1'
    && currentRoute.query.tab === `${MainTabTypes.Streamers.id}`
  )
    return 'Streamers'
  if (
    currentRoute.path === '/info/tabAllData'
    && currentRoute.query.source === '1'
    && currentRoute.query.tab === `${MainTabTypes.PIS.id}`
  )
    return 'PIS'
  return 'unknown'
})
const showDropdown = ref(false)

// const selectedMenu = ref<string | number>('') // 记录当前选中的菜单项

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
}
const handleClick = () => {
  showDropdown.value = !showDropdown.value
}
</script>

<template>
  <div class="background">
    <div class="header">
      <div class="flex items-center space-x-6">
        <div style="width: 100px;" />
        <!-- <a href="/info/main" class="flex flex-col items-center"> -->
        <div class="flex flex-col items-center">
          <div
            class="menu-item  menu-item-large"
            :class="{ 'menu-item-active': selectedMenu === 'home' }"
            @click="selectedMenu = 'home'; router.push('/info/main')"
          >
            首页
          </div>
        </div>
        <!-- </a> -->
        <div style="width: 100px;" />
        <!--
        <div class="flex flex-col items-center">
          <div
            class="menu-item  menu-item-large"
            :class="{ 'menu-item-active': selectedMenu === 'Tournaments' }"
            @click="selectedMenu = 'home'; router.push({ name: 'tabAllData', query: { source: '1', tab: MainTabTypes.Tournaments.id } })"
          >
            赛事资讯
          </div>
        </div>
        <div style="width: 100px;" />
        <div class="flex flex-col items-center">
          <div
            class="menu-item  menu-item-large"
            :class="{ 'menu-item-active': selectedMenu === 'Streamers' }"
            @click="selectedMenu = 'home'; router.push({ name: 'tabAllData', query: { source: '1', tab: MainTabTypes.Streamers.id } })"
          >
            明星主播
          </div>
        </div>
        <div style="width: 100px;" />
        <div class="flex flex-col items-center">
          <div
            class="menu-item  menu-item-large"
            :class="{ 'menu-item-active': selectedMenu === 'PIS' }"
            @click="selectedMenu = 'home'; router.push({ name: 'tabAllData', query: { source: '1', tab: MainTabTypes.PIS.id } })"
          >
            Pis第一视角
          </div>
        </div> -->
      </div>

      <div class="flex items-center space-x-6">
        <div
          class="flex flex-col items-center cursor-pointer"
          @click="userInfo.isLogin ? loginInfoShow.show = true : loginItem.show = true"
        >
          <div v-if="userInfo.isLogin">
            <a href="/mine/index" class="flex flex-col items-center">
              <NTooltip placement="bottom" trigger="hover">
                <template #trigger>
                  <div class="flex flex-col items-center">
                    <NAvatar
                      size="large"
                      round
                      :src="userInfo.avatar === '' ? defaultAvatar : userInfo.avatar"
                      :fallback-src="defaultAvatar"
                    />
                  </div>
                </template>
                <div>
                  <div> <NText type="text" style="color: #FFD700;">{{ userInfo.WUser?.nickname }}</NText></div>
                  <div> <NButton type="primary" @click="logout">退出登录</NButton></div>
                </div>
              </NTooltip>
            </a>
          </div>
          <div v-else>
            <NText class="dark:text-white" style="font-size:small;color: #FFD700;">
              登录
            </NText>
          </div>
        </div>
        <a v-if="userInfo.isLogin && userInfo.WUser?.admin_level && userInfo.WUser?.admin_level > 0" href="/mine/admin" class="flex flex-col items-center">
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
      <Login v-if="loginItem.show" v-model:visible="loginItem.show" />
      <User v-if="loginInfoShow.show" v-model:visible="loginInfoShow.show" />
      <BaseSetting v-if="baseSettingShow.show" v-model:visible="baseSettingShow.show" />
    </div>
  </div>
</template>

<style>
.background {
  background: linear-gradient(180deg, #0E151C, #1C2A35);
  background-size: cover;
  background-position: center;
}

.header {
 /*  background-color: rgba(50, 50, 50, 0.8);  */
  /* border-radius: 10px; */
  /* padding: 2px; */
  height: 100px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu-item {
  padding: 40px 40px;

  color: white;
  /* border-radius: 5px; */
  transition: background-color 0.3s;
  cursor: pointer; /* 设置为手形光标 */
}

.menu-item:hover {
    height: 100%; /* 选中状态的高度 */
  background-color: #47094BFF;
}
.menu-item-active {
    height: 100%; /* 选中状态的高度 */
  background-color:  #47094BFF;
}
.dark\:text-white {
  color: #47094BFF; /* 金色 */
}

.cursor-pointer {
  cursor: pointer; /* 设置为手形光标 */
}
.menu-item-large {
  font-size: 18px; /* 设置字体大小 */
  font-weight: bold; /* 可选：加粗字体 */
}
</style>
