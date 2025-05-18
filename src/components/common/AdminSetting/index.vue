<script setup lang='ts'>
import { computed, ref } from 'vue'
import { NModal, NTabPane, NTabs } from 'naive-ui'
import General from './General.vue'
import { useAuthStore } from '@/store'

interface Props {
  visible: boolean
}

interface Emit {
  (e: 'update:visible', visible: boolean): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emit>()

const authStore = useAuthStore()

const isChatGPTAPI = computed<boolean>(() => !!authStore.isChatGPTAPI)

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
  <NModal v-model:show="show" :auto-focus="false" preset="card" style="width: 95%; max-width: 640px;border-radius: 8px;">
    <div>
      <NTabs v-model:value="active" type="line" animated>
        <NTabPane name="General" tab="General">
          <template #tab>
            <span class="ml-2">管理员设置</span>
          </template>
          <div class="min-h-[100px]">
            <General @close-modal="show = false" />
          </div>
        </NTabPane>

        <!-- <NTabPane  name="server" tab="server">
          <template #tab>
            <span class="ml-2">{{ $t('mjset.server') }}</span>
          </template>
          <aiSetServer />
        </NTabPane> -->
      </NTabs>
    </div>
  </NModal>
</template>
