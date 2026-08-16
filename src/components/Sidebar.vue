<template>
  <aside class="w-64 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col shrink-0 z-40 print:hidden">
    
    <!-- 顶部 Logo 与系统名称 -->
    <div class="p-6 border-b border-slate-100 cursor-pointer" @click="router.push('/')">
      <div class="flex items-center gap-3">
        <img :src="currentLogo" alt="Logo" class="w-12 h-12 object-contain rounded-xl shadow-sm" />
        <div class="flex flex-col">
          <span class="font-extrabold text-sm text-slate-900 leading-tight truncate">{{ currentSchoolName }}</span>
          <span class="text-[10px] font-bold text-indigo-600 mt-0.5 uppercase tracking-wider">智能教务统筹系统</span>
        </div>
      </div>
    </div>

    <!-- 导航菜单 -->
    <div class="flex-1 overflow-y-auto p-4 space-y-1">
      <router-link 
        v-for="(item, index) in navItems" 
        :key="index"
        :to="item.path" 
        class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
        exact-active-class="!text-indigo-700 bg-indigo-50"
      >
        {{ item.name }}
      </router-link>
    </div>

    <!-- 底部操作区 -->
    <div class="p-4 border-t border-slate-100 space-y-2">
      
      <!-- 切换到马来文版按钮 -->
      <button @click="switchToMalay" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer">
        <span>🌐</span>
        Bahasa Melayu
      </button>

      <!-- 退出登录 -->
      <button @click="logout" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        退出登录
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../services/supabase'
import { useToast } from '../utils/toast'

const router = useRouter()
const toast = useToast()

const currentLogo = ref('/logo.png')
const currentSchoolName = ref('智能教务统筹系统')

const loadIdentity = async () => {
  const cachedLogo = localStorage.getItem('school_logo')
  const cachedName = localStorage.getItem('school_name')
  if (cachedLogo) currentLogo.value = cachedLogo
  if (cachedName) currentSchoolName.value = cachedName

  try {
    const { data } = await supabase.from('school_settings').select('*').eq('id', 1).single()
    if (data) {
      if (data.logo_url) { currentLogo.value = data.logo_url; localStorage.setItem('school_logo', data.logo_url) }
      if (data.school_name) { currentSchoolName.value = data.school_name; localStorage.setItem('school_name', data.school_name) }
    }
  } catch (err) { console.error(err) }
}

onMounted(loadIdentity)

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

// 🚀 核心跳转逻辑：带上 Token 跳去马来文版
const switchToMalay = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    // 👇 加上这行弹窗或打印
    console.log("当前检查到的 Session:", session)

    const malayAppUrl = 'https://subtitute-app-bm.vercel.app' 

    if (session) {
      window.location.href = `${malayAppUrl}/?access_token=${session.access_token}&refresh_token=${session.refresh_token}`
    } else {
      alert("⚠️ 严重提示：当前代码没有检测到登录 Session，所以没带 Token！")
      window.location.href = malayAppUrl
    }
  } catch (error) {
    toast.error("跳转失败：" + error.message)
  }
}

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