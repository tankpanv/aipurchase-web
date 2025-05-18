<script lang="ts" setup>
import { NButton } from 'naive-ui'
import { useRouter } from 'vue-router'


const router = useRouter()

function goUploadFile() {
  router.push('/upload/fileupload')
}
function goBatchUpload() {
  router.push('/upload/batchupload')
}
</script>

<template>
  <div class="flex h-full dark:bg-neutral-800">
    <div class="px-4 m-auto space-y-4 text-center max-[400px]">
      <header class="space-y-2">
        <h2 class="text-2xl font-bold text-center text-slate-800 dark:text-neutral-200">
          主页
        </h2>
        
        <div class="flex items-center justify-center text-center">
          <Icon500 class="w-[300px]" />
        </div>
      </header>
      <NButton type="primary" @click="goUploadFile">
        上传单个文件
      </NButton>
            <NButton type="primary" @click="goBatchUpload">
        批量上传
      </NButton>
      
    </div>
  </div>
</template>
