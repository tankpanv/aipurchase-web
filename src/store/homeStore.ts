import { reactive } from 'vue'
import { ss } from '@/utils/storage'

export const homeStore = reactive({
  myData: {
    act: '', // 动作
    actData: {}, // 动作类别
    local: '', // 当前所处的版本
    session: {
      theme: 'light', // 默认亮色主题
    },
    isLoader: false,
  },

  setMyData(v: object) {
    this.myData = { ...this.myData, ...v }
    if (Object.keys(v).includes('act')) {
      setTimeout(() => {
        this.myData.act = ''
        this.myData.actData = ''
      }, 2000)
    }
  },
})
