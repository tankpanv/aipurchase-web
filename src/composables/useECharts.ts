import { onMounted, onUnmounted, ref } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

export function useECharts() {
  const chartRef = ref<HTMLElement>()
  let chart: echarts.ECharts | null = null

  function initChart() {
    if (!chartRef.value) return null
    
    if (!chart) {
      chart = echarts.init(chartRef.value)
    }
    return chart
  }

  onMounted(() => {
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    chart?.dispose()
    chart = null
  })

  function handleResize() {
    chart?.resize()
  }

  return {
    chartRef,
    initChart,
  }
} 