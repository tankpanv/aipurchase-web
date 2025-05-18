export function safeDownloadFile(blob: Blob, filename: string): boolean {
  try {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    return true
  }
  catch (error) {
    console.error('文件下载失败:', error)
    return false
  }
} 