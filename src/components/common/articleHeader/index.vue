<script lang="ts">
import { defineComponent } from 'vue'
import { useMessage } from 'naive-ui'

export default defineComponent({
  setup() {
    const message = useMessage()
    return {
      handleBack() {
        message.info('[onBack]')
      },
      options: [
        {
          label: '催更',
          key: '1',
        },
        {
          label: '催更',
          key: '2',
        },
        {
          label: '催更',
          key: '3',
        },
      ],
    }
  },
})
</script>

<template>
  <NPageHeader subtitle="让你的听觉更懂视觉" @back="handleBack">
    <template #title>
      <a href="https://anyway.fm/" style="text-decoration: none; color: inherit">Anyway.FM</a>
    </template>

    <template #avatar>
      <n-avatar src="https://cdnimg103.lizhi.fm/user/2017/02/04/2583325032200238082_160x160.jpg" />
    </template>
    <template #extra>
      <n-space>
        <n-button>我的</n-button>
        <n-dropdown :options="options" placement="bottom-start">
          <n-button :bordered="false" style="padding: 0 4px">
            ···
          </n-button>
        </n-dropdown>
      </n-space>
    </template>
    <template #footer>
      截止到 2021 年 4 月 3 日
    </template>
  </NPageHeader>
</template>
