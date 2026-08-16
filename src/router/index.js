import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../services/supabase'

const routes = [
  { path: '/login', component: () => import('../views/Login.vue') },
  { path: '/', component: () => import('../views/Overview.vue'), meta: { requiresAuth: true } },
  { path: '/leave-entry', component: () => import('../views/LeaveEntry.vue'), meta: { requiresAuth: true } },
  { path: '/teachers', component: () => import('../views/Teachers.vue'), meta: { requiresAuth: true } },
  { path: '/timetable', component: () => import('../views/Timetable.vue'), meta: { requiresAuth: true } },
  { path: '/records', component: () => import('../views/Records.vue'), meta: { requiresAuth: true } },
  { path: '/statistics', component: () => import('../views/Statistics.vue'), meta: { requiresAuth: true } },
  { path: '/settings', component: () => import('../views/Settings.vue'), meta: { requiresAuth: true } },
  // 🛡️ MMI 干扰记录路由
  { path: '/mmi-interruption', component: () => import('../views/MmiInterruption.vue'), meta: { requiresAuth: true } },
  // 📈 新增科目目标分析独立页面路由
  { path: '/subject-analysis', component: () => import('../views/SubjectAnalysis.vue'), meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to) => {
  // 1. 优先拦截 URL 中的 Token（专门处理从马来文版跳回来的情况）
  if (to.query.access_token && to.query.refresh_token) {
    // 注入 Token
    await supabase.auth.setSession({
      access_token: to.query.access_token,
      refresh_token: to.query.refresh_token
    })
    
    // 🚀 核心修复：不管原来要跳去哪，只要带了 Token，一律强制押送回主页 '/'！绝不让它停在 /login
    return { path: '/', replace: true }
  }

  // 2. 常规的登录状态检查
  const { data: { session } } = await supabase.auth.getSession()
  
  // 如果没登录，且要去的地方需要权限，踢回 /login
  if (to.meta.requiresAuth && !session) {
    return { path: '/login' }
  }
  
  // 如果已经登录了，还在试图访问登录页，强制拉回首页 /
  if (to.path.toLowerCase().includes('/login') && session) {
    return { path: '/' }
  }
})

export default router