<script setup lang="ts">
import { computed, h, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NIcon, NMenu } from 'naive-ui'
import type { MenuOption } from 'naive-ui'
import {
  CalendarOutline,
  ChevronBack,
  ChevronForward,
  HomeOutline,
  PeopleOutline,
  SettingsOutline,
  StatsChartOutline,
} from '@vicons/ionicons5'
import avatarImage from '@/assets/avatar.png' // 导入头像图片
import { useTheme } from '@/hooks/useTheme'
import { useUserStore } from '@/store'

const router = useRouter()
const { themeOverrides, isDark } = useTheme()
const defaultActive = ref(router.currentRoute.value.path)
const collapsed = ref(false)
const userStore = useUserStore()

// 默认头像
const defaultAvatar = avatarImage

function renderIcon(icon: any) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const handleMenuClick = (key: string) => {
  if (key && typeof key === 'string')
    router.push(key)
}

const toggleCollapse = () => {
  collapsed.value = !collapsed.value
}

// 管理员菜单
const baseMenuOptions: MenuOption[] = [{
  label: '首页',
  key: '/',
  icon: renderIcon(HomeOutline),
},
{
  label: '比赛管理',
  key: '/admin/race',
  icon: renderIcon(CalendarOutline),
  children: [
    {
      label: '比赛列表',
      key: '/admin/race',
    },
    {
      label: '创建比赛',
      key: '/admin/race/create',
    },
    {
      label: '志愿者任务',
      key: '/admin/volunteer-tasks',
    },
  ],
},
{
  label: '人员管理',
  key: 'person-management',
  icon: renderIcon(PeopleOutline),
  children: [
    {
      label: '运动员管理',
      key: '/admin/athletes',
    },
    {
      label: '志愿者管理',
      key: '/admin/volunteers',
    },
  ],
},
// {
//   label: '设备管理',
//   key: '/admin/devices',
//   icon: renderIcon(WatchOutline),
// },
{
  label: '数据中心',
  key: 'data-center',
  icon: renderIcon(StatsChartOutline),
  children: [
    {
      label: '实时监控',
      key: '/admin/monitoring',
    },
    {
      label: '赛事统计',
      key: '/admin/statistics',
    },
  ],
},
{
  label: '系统管理',
  key: 'system-management',
  icon: renderIcon(SettingsOutline),
  children: [
   
    {
      label: '用户权限',
      key: '/admin/users',
    },
    // {
    //   label: '系统日志',
    //   key: '/admin/logs',
    // },
  ],
},
]

// 根据用户角色动态生成菜单
const menuOptions = computed(() => {
  // 目前不做角色判断，所有用户都返回相同菜单
  return [...baseMenuOptions]
})
</script>

<template>
  <div class="sidebar-container" :class="{ 'sidebar-collapsed': collapsed }">
    <NMenu
      v-model:value="defaultActive"
      :options="menuOptions"
      :collapsed="collapsed"
      :collapsed-width="64"
      :collapsed-icon-size="22"
      class="sidebar-menu"
      :indent="24"
      @update:value="handleMenuClick"
    />
    <div class="collapse-trigger" @click="toggleCollapse">
      <NIcon size="16">
        <ChevronBack v-if="!collapsed" />
        <ChevronForward v-else />
      </NIcon>
    </div>
  </div>
</template>

<style scoped>
.sidebar-container {
  position: relative;
  width: 240px;
  height: calc(100vh - 48px);
  transition: all 0.3s ease;
  background-color: v-bind('themeOverrides?.common?.cardColor || "#ffffff"');
}

.sidebar-collapsed {
  width: 64px;
}

.sidebar-menu {
  height: 100%;
  border-right: none;
}

.collapse-trigger {
  position: absolute;
  right: -11px;
  top: 50%;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  background-color: v-bind('themeOverrides?.common?.cardColor || "#ffffff"');
  border: 1px solid v-bind('themeOverrides?.common?.textColor3 || "#e5e5e5"');
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
}

.collapse-trigger:hover {
  background-color: v-bind('themeOverrides?.common?.bodyColor || "#f5f5f5"');
}

:deep(.n-menu) {
  background-color: v-bind('themeOverrides?.common?.cardColor || "#ffffff"');
}

:deep(.n-menu-item) {
  height: 40px;
  line-height: 40px;
  padding: 0 16px !important;
  color: v-bind('isDark ? "#FAFAFA" : "#1f1f1f"');
}

:deep(.n-menu-item-content) {
  padding: 0 8px !important;
}

:deep(.n-menu-item-content__icon) {
  margin-right: 8px;
}

:deep(.n-submenu) {
  min-height: 40px;
  color: v-bind('isDark ? "#FAFAFA" : "#1f1f1f"');
}

:deep(.n-submenu-children) {
  padding-left: 16px !important;
}

:deep(.n-menu-item:not(.n-menu-item--disabled):hover),
:deep(.n-submenu:not(.n-submenu--disabled):hover) {
  color: v-bind('themeOverrides?.common?.primaryColor || "#9333ea"');
}

:deep(.n-menu-item--selected) {
  color: v-bind('themeOverrides?.common?.primaryColor || "#9333ea"') !important;
  background-color: rgba(192, 132, 252, 0.1) !important;
}

:deep(.n-menu-item--selected::before) {
  background-color: v-bind('themeOverrides?.common?.primaryColor || "#9333ea"') !important;
  width: 3px !important;
}
</style>
