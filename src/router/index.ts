import type { App } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router' // 修改这里
import { setupPageGuard } from './permission'
import defaultLayout from '@/components/layout/MainLayout.vue'
import { useUserStore } from '@/store'
import { validateToken } from '@/utils/tokenValidator'

// 导入新的登录和注册页面
import Register from '@/views/Register.vue'

// 导入商家相关页面
import MerchantLoginPage from '@/views/merchant/MerchantLogin.vue'
import MerchantRegisterPage from '@/views/merchant/MerchantRegister.vue'
import MerchantLayout from '@/components/layout/MerchantLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Root',
    component: defaultLayout,
    redirect: '/merchant/profile',
    children: [

    ],
  },

  {
    path: '/mine',
    name: 'Rootmin',
    component: defaultLayout,
    redirect: '/mine/index',
    children: [
      {
        path: 'index',
        name: 'minePage',
        component: () => import('@/views/mine/mine.vue'),
      }, {
        path: 'admin',
        name: 'adminPage',
        component: () => import('@/views/mine/admin.vue'),
      },

    ],
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/exception/404/index.vue'),
  },
  {
    path: '/500',
    name: '500',
    component: () => import('@/views/exception/500/index.vue'),
  },

  // 添加登录和注册路由
  {
    path: '/login',
    name: 'Login',
    component: MerchantLoginPage,
    meta: {
      title: '登录',
      requiresAuth: false,
    },
  },
  {
    path: '/auth/login',
    name: 'AuthLogin',
    component: MerchantLoginPage,
    meta: {
      title: '登录',
      requiresAuth: false,
    },
  },

  // 商家相关路由
  {
    path: '/merchant/login',
    name: 'MerchantLogin',
    component: MerchantLoginPage,
    meta: {
      title: '商家登录',
      requiresAuth: false,
    },
  },
  {
    path: '/merchant/register',
    name: 'MerchantRegister',
    component: MerchantRegisterPage,
    meta: {
      title: '商家注册',
      requiresAuth: false,
    },
  },
  {
    path: '/merchant',
    name: 'MerchantRoot',
    component: MerchantLayout,
    redirect: '/merchant/dashboard',
    meta: {
      requiresAuth: true,
      merchantOnly: true,
    },
    children: [
      {
        path: 'dashboard',
        name: 'MerchantDashboard',
        component: () => import('@/views/merchant/Dashboard.vue'),
        meta: {
          title: '商家后台首页',
        },
      },
      {
        path: 'profile',
        name: 'MerchantProfile',
        component: () => import('@/views/merchant/Profile.vue'),
        meta: {
          title: '商家资料',
        },
      },
      {
        path: 'products',
        name: 'MerchantProducts',
        component: () => import('@/views/merchant/Products.vue'),
        meta: {
          title: '商品管理',
        },
      },
      {
        path: 'product/create',
        name: 'CreateProduct',
        component: () => import('@/views/merchant/ProductEdit.vue'),
        meta: {
          title: '添加商品',
        },
      },
      {
        path: 'product/edit/:id',
        name: 'EditProduct',
        component: () => import('@/views/merchant/ProductEdit.vue'),
        meta: {
          title: '编辑商品',
        },
      },
      {
        path: 'orders',
        name: 'MerchantOrders',
        component: () => import('@/views/merchant/Orders.vue'),
        meta: {
          title: '订单管理',
        },
      },
      {
        path: 'orders/:id',
        name: 'OrderDetail',
        component: () => import('@/views/merchant/OrderDetail.vue'),
        meta: {
          title: '订单详情',
        },
      },
    ],
  },

  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: {
      title: '注册',
      requiresAuth: false,
    },
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    redirect: '/404',
  },
]

const router = createRouter({
  history: createWebHistory(), // 修改这里
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
})

// 添加全局路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  // 对于需要认证的路由，验证token是否有效
  if (to.meta.requiresAuth === true) {
    // 验证token是否有效
    const isValid = await validateToken()

    // 如果token无效且用户尝试访问需要认证的路由
    if (!isValid) {
      next({
        path: '/merchant/login',
        query: { redirect: to.fullPath },
      })
      return
    }
  }

  const isAuthenticated = userStore.userInfo.isLogin && userStore.userInfo.token
  const isAdmin = userStore.userInfo.role === 'admin'

  // 处理需要管理员权限的路由
  if (to.meta.adminOnly && !isAdmin) {
    next({ path: '/404' })
    return
  }

  // 如果路由需要认证且用户未登录
  if (to.meta.requiresAuth === true && !isAuthenticated)
    next({ path: '/login', query: { redirect: to.fullPath } })
  else
    next()
})

setupPageGuard(router)

export async function setupRouter(app: App) {
  app.use(router)
  await router.isReady()
}

export default router
