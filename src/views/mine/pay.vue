<script setup lang='ts'>
import { computed, ref } from 'vue'
import { NImage, NModal, NTabPane, NTabs } from 'naive-ui'
import { useAuthStore } from '@/store'
import Qiyeweixinzhifu from '@/assets/WechatIMG60.jpeg'

interface Props {
  visible: boolean
}

interface Emit {
  (e: 'update:visible', visible: boolean): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emit>()

const authStore = useAuthStore()

const active = ref('General')

const show = computed({
  get() {
    return props.visible
  },
  set(visible: boolean) {
    emit('update:visible', visible)
  },
})
</script>

<template>
  <NModal
    v-model:show="show" :auto-focus="false" preset="card"
    style="width: 95%; max-width: 640px;border-radius: 8px;"
  >
    <div>
      <NTabs v-model:value="active" type="line" animated>
        <NTabPane name="General" tab="General" class="flex flex-col items-center">
          <template #tab>
            <span class="ml-2">微信扫码支付</span>
          </template>

          <NImage
            :src="Qiyeweixinzhifu"
            style="max-width: 200px; min-width: 200px; display: block; margin: 0 auto;"
          />
        </NTabPane>
      </NTabs>
    </div>
  </NModal>
</template>
