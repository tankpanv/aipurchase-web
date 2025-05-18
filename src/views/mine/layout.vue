<script setup lang='ts'>
import { computed } from 'vue'
import { NLayout, NLayoutContent, NMessageProvider } from 'naive-ui'
import { useRouter } from 'vue-router'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { homeStore, useAppStore, useAuthStore } from '@/store'
import MobileMenu from '@/components/common/MenuTop/MobileMenu.vue'

const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()


homeStore.setMyData({ local: 'minePage' })
const { isMobile } = useBasicLayout()

const collapsed = computed(() => appStore.siderCollapsed)


const getMobileClass = computed(() => {
  if (isMobile.value)
    return ['rounded-none', 'shadow-none']
  return ['shadow-md', 'dark:border-neutral-800'] // 'border', 'rounded-md',
})

const getContainerClass = computed(() => {
  return [
    'h-full',
    { abc: !isMobile.value && !collapsed.value },
  ]
})
</script>

<template>
  <NMessageProvider>
    <div class="dark:bg-[#24272e] transition-all p-0" :class="[isMobile ? 'h55' : 'h-full']">
      <div class="h-full overflow-hidden" :class="getMobileClass">
        <NLayout
          class="z-40 transition" :class="getContainerClass"
        >
          <menuTop v-if="!isMobile" />
          <NLayoutContent class="h-full">
            <RouterView v-slot="{ Component, route }">
              <component :is="Component" :key="route.fullPath" />
            </RouterView>
          </NLayoutContent>
        <!-- <Sider /> -->
        </NLayout>
      </div>
    </div>
    <MobileMenu v-if="isMobile" />
  </NMessageProvider>
</template>

<style>
.h55 {
    height: calc(100% - 55px);
}
</style>
