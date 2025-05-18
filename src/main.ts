import { createApp } from 'vue'

import App from './App.vue'
import { setupI18n } from './locales'
import { setupAssets, setupScrollbarStyle } from './plugins'
import { setupStore } from './store'
import { setupRouter } from './router'
async function bootstrap() {
  const app = createApp(App)
  setupAssets()

  setupScrollbarStyle()

  setupStore(app)

  setupI18n(app)

  await setupRouter(app)
  // 设置自定义元素
  app.config.compilerOptions.isCustomElement = tag => tag.includes('wx-open-launch-app')
  app.mount('#app')
}

bootstrap()
