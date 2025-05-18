登录弹窗
```
import { inject} from 'vue'
const eventBus = inject('eventBus')
const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)
      // 入口处判断是否登录，否则弹窗让登录
      if (!userInfo.isLogin)
        eventBus.showLogin()
```
# 智能购物管理系统系统
