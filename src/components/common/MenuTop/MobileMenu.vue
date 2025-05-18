<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { SvgIcon } from '@/components/common'
import { homeStore, useEnvStore } from '@/store'
import { router } from '@/router'

const st = ref({ show: true })

const goHome = computed(() => {
  // router.push('/')
  return router.currentRoute.value.name
})
function drawSent(e: any) {
  st.value.show = false
  // $emit('drawSent', e)
  homeStore.setMyData({ act: 'draw', actData: e })
}
const envStore = useEnvStore()
const envInfo = computed(() => envStore.envInfo)
watch(() => homeStore.myData.act, (n: string) => {
  if (n == 'showChat')
    router.push('/chat')

  if (n == 'showDraw') {
    router.push('/draw')
    st.value.show = true
  }
  if (n == 'draw')
    st.value.show = false
  if (n == 'showInfo')
    router.push('/info')
  if (n == 'showMine')
    router.push('/mine/index')
  if (n == 'showTestPage')
    router.push('/testPage/index')
  if (n == 'showAssistant')
    router.push('/assistant/index')
})
</script>

<template>
  <div class=" bg-gray-100 dark:bg-[#282832] h-[55px] flex  justify-around  items-center dark:text-white/70 ">
    <!-- <div class="flex items-center justify-center flex-col" :class="[goHome == 'Chat' ? 'active' : '']"
      @click="homeStore.setMyData({ act: 'showChat' }) ">
      <SvgIcon icon="ri:wechat-line" class="text-3xl" />
      <div class="text-[13px]">
        {{ $t('mjtab.chat') }}
      </div>
    </div>
    <div class="flex items-center justify-center flex-col " @click="homeStore.setMyData({ act: 'showgpts' }) ">
      <SvgIcon icon="ri:apps-fill" class="text-3xl" />
      <div class="text-[13px]">
        GPTs
      </div>
    </div>
    <div class="flex items-center justify-center flex-col " :class="[goHome == 'assistant' ? 'active' : '']"
      @click="homeStore.setMyData({ act: 'showAssistant' })">
      <SvgIcon icon="ri-chat-1-line" class="text-3xl" />
      <div class="text-[13px]">
        助手
      </div>
    </div> -->
    <div
      class="flex items-center justify-center flex-col " :class="[goHome == 'info' ? 'active' : '']"
      @click="homeStore.setMyData({ act: 'showInfo' }) "
    >
      <SvgIcon icon="ri-chat-1-line" class="text-3xl" />
      <div class="text-[13px]">
        主页
      </div>
    </div>
    <!-- <div class="flex items-center justify-center flex-col " :class="[goHome == 'draw' ? 'active' : '']"
      @click="homeStore.setMyData({ act: 'showDraw' }) ">
      <SvgIcon icon="ic:outline-palette" class="text-3xl" />
      <div class="text-[13px]">
        {{ $t('mjtab.draw') }}
      </div>
    </div> -->
    <!-- <div class="flex items-center justify-center flex-col " @click="homeStore.setMyData({ act: 'gallery' })">
      <SvgIcon icon="material-symbols:imagesmode-outline" class="text-3xl" />
      <div class="text-[13px]">
        {{ $t('mjtab.gallery') }}
      </div>
    </div> -->

    <!-- <a v-if="envInfo.env === 'ppe'" href="/testPage/index"
      class="router-link-exact-active h-12 w-12 cursor-pointer rounded-xl bg-white duration-300 dark:bg-[#34373c] hover:bg-[#bbb] dark:hover:bg-[#555]"
      @click="st.active = 'testPage'">
      <NTooltip placement="right" trigger="hover">
        <template #trigger>
          <div class="flex h-full justify-center items-center py-1 flex-col"
            :class="[goHome == 'testPage' ? 'active' : '']">
            <SvgIcon icon="ic:outline-palette" class="text-3xl flex-1" />
            <span class="text-[10px]">开发</span>
          </div>
        </template>
        开发
      </NTooltip>
    </a> -->
    <div
      v-if="envInfo.env === 'ppe'" class="flex items-center justify-center flex-col "
      :class="[goHome == 'testPage' ? 'active' : '']" @click="homeStore.setMyData({ act: 'showTestPage' })"
    >
      <SvgIcon icon="ri-home-line" class="text-3xl" />
      <div class="text-[13px]">
        开发
      </div>
    </div>
    <div
      class="flex items-center justify-center flex-col " :class="[goHome == 'minePage' ? 'active' : '']"
      @click="homeStore.setMyData({ act: 'showMine' })"
    >
      <SvgIcon icon="ri-home-line" class="text-3xl" />
      <div class="text-[13px]">
        我的
      </div>
    </div>
  </div>
</template>
