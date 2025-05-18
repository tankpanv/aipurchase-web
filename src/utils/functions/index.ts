export function getCurrentDate() {
  const date = new Date()
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  return `${year}-${month}-${day}`
}
export function convertGoTimeToJsDate(goTime) {
  return new Date(goTime * 1000) // Go 时间戳是秒级的，JavaScript 时间戳是毫秒级的，需要乘以1000
}
export function formatTime(createTime) {
  if (!createTime)
    return ''

  let commentTime

  // 检查 createTime 是否为字符串类型
  if (typeof createTime === 'string') {
    // 解析字符串格式的日期
    commentTime = new Date(createTime)
  }
  else {
    // 如果不是字符串，则调用 convertGoTimeToJsDate
    commentTime = convertGoTimeToJsDate(createTime)
  }

  const currentTime = new Date()
  const timeDiff = currentTime - commentTime
  const seconds = Math.floor(timeDiff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)

  if (months >= 6)
    return '半年前' // 大于等于6个月，展示半年前
  else if (days > 7)
    return commentTime.toLocaleDateString() // 大于7天，展示真实日期
  else if (days >= 1)
    return `${days} 天前` // 大于等于1天小于7天，展示几天前
  else if (hours >= 1)
    return `${hours} 小时前` // 大于等于1小时小于1天，展示几小时前
  else
    return `${minutes} 分钟前` // 小于1小时，展示几分钟前
}
