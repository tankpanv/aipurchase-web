<script lang="ts" setup>
import { computed, h, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  NAvatar,
  NDropdown,
  NIcon,
  NLayout,
  NLayoutContent,
  NLayoutHeader,
  NLayoutSider,
  NMenu,
  useMessage,
} from 'naive-ui'
import {
  HomeOutline as HomeIcon,
  LogOutOutline as LogoutIcon,
  MenuOutline as MenuIcon,
  NotificationsOutline as NotificationIcon,
  CartOutline as OrderIcon,
  PricetagsOutline as ProductsIcon,
  PersonOutline as ProfileIcon,
  SettingsOutline as SettingsIcon,
  StorefrontOutline as StoreIcon,
} from '@vicons/ionicons5'
import { useUserStore } from '@/store'

const router = useRouter()
const userStore = useUserStore()
const message = useMessage()
const collapsed = ref(false)

// 计算商家信息
const merchantInfo = computed(() => {
  const userInfo = userStore.userInfo
  return {
    id: userInfo.client_agent || '',
    name: userInfo.name || '',
    merchantName: userInfo.nickname || userInfo.name || '商家',
    avatar: userInfo.avatar || '',
    address: userInfo.user_agent || '',
  }
})

// 渲染图标
function renderIcon(icon) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

// 商家菜单项
const menuOptions = [
  {
    label: '商家首页',
    key: 'dashboard',
    icon: renderIcon(HomeIcon),
    onClick: () => router.push('/merchant/dashboard'),
  },
  {
    label: '商家资料',
    key: 'profile',
    icon: renderIcon(ProfileIcon),
    onClick: () => router.push('/merchant/profile'),
  },
  {
    label: '商品管理',
    key: 'products',
    icon: renderIcon(ProductsIcon),
    children: [
      {
        label: '商品列表',
        key: 'product-list',
        onClick: () => router.push('/merchant/products'),
      },
      {
        label: '添加商品',
        key: 'add-product',
        onClick: () => router.push('/merchant/product/create'),
      },
    ],
  },
  {
    label: '订单管理',
    key: 'orders',
    icon: renderIcon(OrderIcon),
    onClick: () => router.push('/merchant/orders'),
  },
]

// 用户下拉菜单选项
const userOptions = [
  {
    label: '商家资料',
    key: 'profile',
    icon: renderIcon(ProfileIcon),
  },
  {
    label: '系统设置',
    key: 'settings',
    icon: renderIcon(SettingsIcon),
  },
  {
    type: 'divider',
    key: 'd1',
  },
  {
    label: '退出登录',
    key: 'logout',
    icon: renderIcon(LogoutIcon),
  },
]

// 处理用户菜单选择
function handleUserSelect(key) {
  if (key === 'logout') {
    userStore.logout ? userStore.logout() : userStore.resetUserInfo()
    message.success('退出登录成功')
    router.push('/merchant/login')
  }
  else if (key === 'profile') {
    router.push('/merchant/profile')
  }
}
</script>

<template>
  <NLayout class="h-screen" has-sider>
    <!-- 侧边栏 -->
    <NLayoutSider
      bordered
      collapse-mode="width"
      :collapsed="collapsed"
      :collapsed-width="64"
      :width="240"
      show-trigger
      @update:collapsed="(v) => { collapsed = v }"
    >
      <div class="p-4 flex items-center justify-center">
        <div v-if="!collapsed" class="text-lg font-bold flex items-center">
          <NIcon size="24" class="mr-2">
            <StoreIcon />
          </NIcon>
          商家管理系统
        </div>
        <NIcon v-else size="24">
          <StoreIcon />
        </NIcon>
      </div>
      <NMenu
        :collapsed="collapsed"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="menuOptions"
      />
    </NLayoutSider>

    <!-- 主内容区 -->
    <NLayout>
      <!-- 顶栏 -->
      <NLayoutHeader bordered class="h-16 px-4 flex justify-between items-center">
        <div class="flex items-center">
          <NIcon size="24" class="cursor-pointer" @click="collapsed = !collapsed">
            <MenuIcon />
          </NIcon>
          <div class="ml-4 text-lg font-bold">
            {{ merchantInfo.merchantName }}
          </div>
        </div>

        <div class="flex items-center">
          <!-- 通知图标 -->
          <NIcon size="20" class="mr-4 cursor-pointer">
            <NotificationIcon />
          </NIcon>

          <!-- 用户信息下拉菜单 -->
          <NDropdown
            trigger="click"
            :options="userOptions"
            @select="handleUserSelect"
          >
            <div class="flex items-center cursor-pointer">
              <NAvatar
                round
                size="small"
                :src="merchantInfo.avatar"
                class="mr-2"
              />
              <span>{{ merchantInfo.merchantName }}</span>
            </div>
          </NDropdown>
        </div>
      </NLayoutHeader>

      <!-- 内容区 -->
      <NLayoutContent class="p-6 overflow-auto">
        <router-view />
      </NLayoutContent>
    </NLayout>
  </NLayout>
</template>

<style scoped>
</style>
