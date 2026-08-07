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
  const { data: { session } } = await supabase.auth.getSession()
  if (to.meta.requiresAuth && !session) {
    return '/login'
  }
})

export default router