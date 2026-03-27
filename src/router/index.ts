import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/performance',
    name: 'Performance',
    component: () => import('@/components/PerformanceAnalyzer.vue')
  },
  {
    path: '/auth',
    name: 'Auth',
    component: () => import('@/views/AuthView.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/create',
    name: 'CreateArticle',
    component: () => import('@/views/CreateArticleView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/edit/:id',
    name: 'EditArticle',
    component: () => import('@/views/CreateArticleView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('@/views/FavoritesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/article/:id',
    name: 'Article',
    component: () => import('@/views/ArticleView.vue')
  },
  {
    path: '/messages',
    name: 'Messages',
    component: () => import('@/views/MessagesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/category/:category',
    name: 'Category',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/tag/:tag',
    name: 'Tag',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from) {
    // 默认不滚动，由具体业务逻辑控制
  }
})

// 路由守卫：检查需要登录的页面
router.beforeEach(async (to, _from, next) => {
  // 直接从 localStorage 检查 token
  const hasToken = !!localStorage.getItem('token')

  // 如果已登录且访问 /auth，跳转到首页
  if (to.path === '/auth' && hasToken) {
    return next('/')
  }

  // 如果未登录且访问 /auth，放行
  if (to.path === '/auth') {
    return next()
  }

  const userStore = useUserStore()

  // 初始化用户状态（仅当有 token 但没有 user 时）
  if (hasToken && !userStore.user) {
    await userStore.init()
  }

  // 如果有 token，直接放行
  if (hasToken) {
    return next()
  }

  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    // 跳转到登录页，携带当前页面路径
    next({ path: '/auth', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
