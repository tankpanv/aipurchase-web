import { ref, onUnmounted } from 'vue'

/**
 * 倒计时钩子
 * @param initialSeconds 初始秒数
 * @param onEnd 倒计时结束回调函数
 * @returns { current, start, stop, reset } 倒计时状态和控制函数
 */
export default function useCountdown(initialSeconds: number = 60, onEnd?: () => void) {
  const current = ref(0)
  const isRunning = ref(false)
  let timer: number | null = null

  // 开始倒计时
  const start = () => {
    if (isRunning.value) return
    
    isRunning.value = true
    current.value = initialSeconds
    
    timer = window.setInterval(() => {
      if (current.value <= 0) {
        stop()
        if (onEnd) onEnd()
        return
      }
      current.value--
    }, 1000)
  }

  // 停止倒计时
  const stop = () => {
    if (timer !== null) {
      clearInterval(timer)
      timer = null
    }
    isRunning.value = false
  }

  // 重置倒计时
  const reset = () => {
    stop()
    current.value = initialSeconds
  }

  // 组件卸载时清除定时器
  onUnmounted(() => {
    stop()
  })

  return {
    current,
    isRunning,
    start,
    stop,
    reset
  }
} 