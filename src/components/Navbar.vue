<template>
  <nav class="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/70 border-b border-slate-200/50 supports-backdrop-blur:bg-white/60">
    <div class="max-w-7xl mx-auto px-6 flex justify-between h-16 items-center">
      
      <!-- Logo 区域：绑定动态 currentLogo 和 currentSchoolName -->
      <div class="flex items-center gap-3 cursor-pointer" @click="router.push('/')">
        <img 
          :src="currentLogo" 
          alt="Logo" 
          class="w-14 h-14 object-contain rounded-xl"
        />
        <span class="font-bold text-lg tracking-tight text-slate-900">{{ currentSchoolName }}</span>
      </div>
      
      <!-- PC 端导航链接 -->
      <div class="hidden md:flex space-x-1">
        <router-link 
          v-for="(item, index) in navItems" 
          :key="index"
          :to="item.path" 
          class="px-4 py-2 rounded-full text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all duration-200"
          exact-active-class="!text-indigo-700 bg-indigo-50/80"
        >
          {{ item.name }}
        </router-link>
      </div>

      <!-- 右侧操作区：仅保留退出按钮 -->
      <div class="hidden md:flex items-center gap-4">
        <button @click="logout" class="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer">
          <span>退出</span>
          <svg class="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>

      <!-- 移动端汉堡菜单按钮 -->
      <button @click="isMenuOpen = !isMenuOpen" class="md:hidden p-2 text-slate-600 hover:text-slate-900 cursor-pointer">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path v-if="!isMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- 移动端下拉菜单 -->
    <div v-if="isMenuOpen" class="md:hidden px-4 pt-2 pb-4 space-y-2 bg-white/95 border-b border-slate-200 shadow-lg absolute w-full left-0">
      <router-link 
        v-for="(item, index) in navItems" 
        :key="index"
        :to="item.path" 
        @click="isMenuOpen = false"
        class="block px-4 py-2 rounded-lg text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100"
        exact-active-class="!text-indigo-700 bg-indigo-50"
      >
        {{ item.name }}
      </router-link>
      
      <button @click="logout" class="w-full text-left px-4 py-2 rounded-lg text-base font-medium text-rose-600 hover:bg-rose-50 flex items-center justify-between cursor-pointer">
        <span>退出登录</span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../services/supabase'
import { useToast } from '../utils/toast'

const router = useRouter()
const toast = useToast()
const isMenuOpen = ref(false)

const currentLogo = ref('/logo.png')
const currentSchoolName = ref('智能教务统筹系统')

// 🚀 核心：加载时先读本地缓存，再从 Supabase 云端同步最新的 Logo 和 校名
const loadNavbarIdentity = async () => {
  // 1. 先读缓存（防闪烁）
  const cachedLogo = localStorage.getItem('school_logo')
  const cachedName = localStorage.getItem('school_name')
  
  if (cachedLogo && cachedLogo.trim() !== '') {
    currentLogo.value = cachedLogo
  }
  if (cachedName && cachedName.trim() !== '') {
    currentSchoolName.value = cachedName
  }

  // 2. 从 Supabase 拉取最新配置
  try {
    const { data, error } = await supabase.from('school_settings').select('*').eq('id', 1).single()
    
    if (data) {
      if (data.logo_url && data.logo_url.trim() !== '') {
        currentLogo.value = data.logo_url
        localStorage.setItem('school_logo', data.logo_url)
      }
      if (data.school_name && data.school_name.trim() !== '') {
        currentSchoolName.value = data.school_name
        localStorage.setItem('school_name', data.school_name)
      }
    }
  } catch (err) {
    console.error('加载 Navbar 设置失败:', err)
  }
}

onMounted(() => {
  loadNavbarIdentity()
})

const navItems = [
  { name: '调度总览', path: '/' },
  { name: '教师请假登记', path: '/leave-entry' },
  { name: '教师档案', path: '/teachers' },
  { name: '全校课表', path: '/timetable' },
  { name: '代课记录', path: '/records' },
  { name: '统计报表', path: '/statistics' },
  { name: 'MMI冲突干预', path: '/mmi-interruption' }, 
  { name: '学科学情分析', path: '/subject-analysis' },
  { name: '⚙️ 系统设置', path: '/settings' } 
]

const logout = async () => {
  try {
    await supabase.auth.signOut()
    toast.success("已安全退出")
    router.push('/login')
  } catch (error) {
    toast.error("退出失败：" + error.message)
  }
}
</script>