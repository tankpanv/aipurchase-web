import type { GlobalThemeOverrides } from 'naive-ui'
import { computed, watch } from 'vue'
import { darkTheme, useOsTheme } from 'naive-ui'
import { useAppStore } from '@/store'

export function useTheme() {
  const appStore = useAppStore()

  const OsTheme = useOsTheme()

  const isDark = computed(() => {
    if (!appStore || typeof appStore.theme === 'undefined')
      return false

    if (appStore.theme === 'auto')
      return OsTheme.value === 'dark'
    else
      return appStore.theme === 'dark'
  })

  const theme = computed(() => {
    return isDark.value ? darkTheme : undefined
  })

  // 亮色主题的颜色定制
  const lightThemeOverrides: GlobalThemeOverrides = {
    common: {
      // 主色调 - 明亮紫色
      primaryColor: '#9333EA',
      primaryColorHover: '#A855F7',
      primaryColorPressed: '#7E22CE',
      primaryColorSuppl: '#C084FC',

      // 功能色
      infoColor: '#9333EA',
      successColor: '#10B981',
      warningColor: '#F59E0B',
      errorColor: '#EF4444',

      // 文本颜色
      textColorBase: '#1F1F1F',
      textColor1: '#1F1F1F',
      textColor2: '#525252',
      textColor3: '#737373',

      // 背景色
      bodyColor: '#FAF5FF',
      cardColor: 'rgba(255, 255, 255, 0.9)',
      modalColor: 'rgba(255, 255, 255, 0.95)',
      popoverColor: 'rgba(255, 255, 255, 0.95)',
    },
    Card: {
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(147, 51, 234, 0.1)',
      color: 'rgba(255, 255, 255, 0.9)',
      colorModal: 'rgba(255, 255, 255, 0.95)',
    },
    Tag: {
      borderRadius: '8px',
    },
    Button: {
      borderRadiusMedium: '12px',
      borderRadiusSmall: '8px',
      colorPrimary: '#9333EA',
      colorHoverPrimary: '#A855F7',
      colorPressedPrimary: '#7E22CE',
      colorFocusPrimary: '#C084FC',
      textColorPrimary: 'white',
      fontWeight: '600',
    },
  }

  // 暗色主题的颜色定制
  const darkThemeOverrides: GlobalThemeOverrides = {
    common: {
      // 主色调 - 深夜紫色
      primaryColor: '#A855F7',
      primaryColorHover: '#C084FC',
      primaryColorPressed: '#9333EA',
      primaryColorSuppl: '#D8B4FE',

      // 功能色
      infoColor: '#A855F7',
      successColor: '#34D399',
      warningColor: '#FBBF24',
      errorColor: '#F87171',

      // 文本颜色
      textColorBase: '#FAFAFA',
      textColor1: '#FAFAFA',
      textColor2: '#E5E5E5',
      textColor3: '#A3A3A3',

      // 背景色
      bodyColor: '#0F0F0F',
      cardColor: 'rgba(23, 23, 23, 0.95)',
      modalColor: 'rgba(23, 23, 23, 0.98)',
      popoverColor: 'rgba(23, 23, 23, 0.95)',
    },
    Card: {
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      color: 'rgba(23, 23, 23, 0.95)',
      colorModal: 'rgba(23, 23, 23, 0.98)',
    },
    Tag: {
      borderRadius: '8px',
    },
    Button: {
      borderRadiusMedium: '12px',
      borderRadiusSmall: '8px',
      colorPrimary: '#A855F7',
      colorHoverPrimary: '#C084FC',
      colorPressedPrimary: '#9333EA',
      colorFocusPrimary: '#D8B4FE',
      textColorPrimary: 'white',
      fontWeight: '600',
    },
  }

  const themeOverrides = computed<GlobalThemeOverrides>(() => {
    if (isDark.value)
      return darkThemeOverrides
    return lightThemeOverrides
  })

  // 添加背景渐变
  const applyBackgroundGradient = (dark: boolean) => {
    const body = document.body
    if (dark)
      body.style.background = 'linear-gradient(135deg, #0F0F0F 0%, #1A1A1A 100%)'
    else
      body.style.background = 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)'
    body.style.minHeight = '100vh'
  }

  watch(
    () => isDark.value,
    (dark) => {
      if (dark)
        document.documentElement.classList.add('dark')
      else
        document.documentElement.classList.remove('dark')
      applyBackgroundGradient(dark)
    },
    { immediate: true },
  )

  // 监听主题变化，设置 HTML 属性
  watch(
    () => theme.value,
    (newTheme) => {
      if (newTheme)
        document.documentElement.setAttribute('data-theme', 'dark')
      else
        document.documentElement.setAttribute('data-theme', 'light')
    },
    { immediate: true },
  )

  return { theme, themeOverrides, isDark }
}
