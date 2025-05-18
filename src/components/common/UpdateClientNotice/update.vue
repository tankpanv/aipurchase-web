<script>
import axios from 'axios'
import { NButton } from 'naive-ui'
export default {
    components: {
        NButton,
    }
  methods: {
    checkForUpdates() {
      axios.get('https://your-update-server.com/checkForUpdates')
        .then((response) => {
          // 处理从服务器返回的更新信息
          const updateAvailable = response.data.updateAvailable
          if (updateAvailable)
            this.downloadUpdate()
        })
        .catch((error) => {
          console.error('Error checking for updates:', error)
        })
    },
    downloadUpdate() {
      axios({
        url: 'https://your-update-server.com/update.zip',
        method: 'GET',
        responseType: 'blob',
      })
        .then((response) => {
          // 下载更新文件
          const url = window.URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', 'update.zip')
          document.body.appendChild(link)
          link.click()
        })
        .catch((error) => {
          console.error('Error downloading update:', error)
        })
    },
  },
}
</script>

<template>
    <div>
        <NButton @click="checkForUpdates">
            Check for Updates
        </NButton>
    </div>
</template>
