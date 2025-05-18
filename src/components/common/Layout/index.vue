<script setup lang='ts'>
import { computed } from 'vue'
import { NLayout, NLayoutContent, NMessageProvider } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { homeStore, useAppStore} from '@/store'
import menuTop from '@/components/common/MenuTop/MenuTop.vue'
import MobileMenu from '@/components/common/MenuTop/MobileMenu.vue'

const route = useRoute()

const currentUri = computed(() => route.path)
const appStore = useAppStore()

const targetPaths = ['/feedback']

const matchRouter = (path: string, target: string) => {
  const regex = new RegExp(`^${target.replace(/:[^\s/]+/g, '([^\\s/]+)')}`)
  return regex.test(path)
}

const isNoShowMenu = computed(() => {
  return targetPaths.some(target => matchRouter(currentUri.value, target))
})

homeStore.setMyData({ local: 'info' })
const { isMobile } = useBasicLayout()

const collapsed = computed(() => appStore.siderCollapsed)


const getMobileClass = computed(() => {
  if (isMobile.value)
    return ['rounded-none', 'shadow-none']
  return ['shadow-md', 'dark:border-neutral-800']
})

const getContainerClass = computed(() => {
  return [
    'h-full',
    { abc: !isMobile.value && !collapsed.value },
  ]
})
</script>

<template>
  <!-- <div class="dark:bg-[#24272e] transition-all p-0" :class="[isMobile ? 'h55' : 'h-full']"> -->
  <NMessageProvider>
    <div style="background-color: #5B79BDFF">
      <NLayout class="z-40 transition" :class="getContainerClass">
        <menuTop />
        <NLayoutContent class="h-full overflow-hidden" :class="getMobileClass">
          <RouterView v-slot="{ Component, route }">
            <component :is="Component" :key="route.fullPath" />
          </RouterView>
        </NLayoutContent>
      </NLayout>

      <!-- 移动设备时放在底部 -->
      <MobileMenu v-if="isMobile && !isNoShowMenu" />
    </div>
  </NMessageProvider>
</template>

<style>
.h55 {
  height: calc(100% - 55px);
}
</style>
