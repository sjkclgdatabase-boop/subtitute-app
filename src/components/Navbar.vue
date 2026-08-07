<template>
  <nav class="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/70 border-b border-slate-200/50 supports-backdrop-blur:bg-white/60">
    <div class="max-w-7xl mx-auto px-6 flex justify-between h-16 items-center">
      
      <!-- Logo 区域 -->
      <div class="flex items-center gap-3 cursor-pointer" @click="router.push('/')">
        <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <span class="text-white text-sm font-bold">ED</span>
        </div>
        <span class="font-bold text-lg tracking-tight text-slate-900">智能代课系统</span>
      </div>
      
      <!-- 导航链接 -->
      <div class="hidden md:flex space-x-1">
        <router-link 
          v-for="(item, index) in navItems" 
          :key="index"
          :to="item.path" 
          class="px-4 py-2 rounded-full text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all duration-200"
          active-class="!text-indigo-700 bg-indigo-50/80"
        >
          {{ item.name }}
        </router-link>
      </div>

      <!-- 操作区 -->
      <button @click="logout" class="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        <span>退出</span>
        <svg class="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { supabase } from '../services/supabase'
import { useRouter } from 'vue-router'
import { useToast } from '../utils/toast'

const router = useRouter()
const toast = useToast()

// 修复了这里的逗号问题
const navItems = [
  { name: '总览', path: '/' },
  { name: '请假录入', path: '/leave-entry' },
  { name: '教师管理', path: '/teachers' },
  { name: '课表', path: '/timetable' },
  { name: '记录', path: '/records' },
  { name: '报表', path: '/statistics' },
  { name: '🛡️ MMI 干扰', path: '/mmi-interruption' }, 
  { name: '📈 科目目标分析', path: '/subject-analysis' },
  { name: '⚙️ 设置', path: '/settings' } 
]

const logout = async () => {
  await supabase.auth.signOut()
  toast.success("已安全退出")
  router.push('/login')
}
</script>
