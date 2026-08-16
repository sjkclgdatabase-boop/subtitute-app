<template>
  <aside class="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 left-0 shrink-0 z-40 border-r border-slate-800 print:hidden shadow-xl">
    
    <!-- 顶部 Logo 与系统名称 -->
    <div class="p-5 border-b border-slate-800 flex items-center gap-3 cursor-pointer select-none" @click="router.push('/')">
      <img :src="currentLogo" alt="Logo" class="w-10 h-10 object-contain rounded-xl bg-slate-800 p-1 shadow-sm shrink-0" />
      <div class="flex flex-col justify-center overflow-hidden">
        <span class="font-extrabold text-xs tracking-tight text-white leading-tight truncate">{{ currentSchoolName }}</span>
        <span class="text-[9px] font-bold text-indigo-400 mt-0.5 uppercase tracking-wider">智能教务统筹系统</span>
      </div>
    </div>

    <!-- 导航菜单 -->
    <div class="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-700">
      <router-link 
        v-for="(item, index) in navItems" 
        :key="index"
        :to="item.path" 
        class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 text-slate-400 hover:text-white hover:bg-slate-800/80 group"
        exact-active-class="!text-white bg-indigo-600 shadow-md shadow-indigo-600/20"
      >
        <span class="text-base shrink-0 group-hover:scale-110 transition-transform">{{ item.icon }}</span>
        <span class="truncate">{{ item.name }}</span>
      </router-link>
    </div>

    <!-- 底部操作区 -->
    <div class="p-4 border-t border-slate-800 bg-slate-950/40 space-y-2">
      
      <!-- 切换到马来文版按钮 -->
      <button @click="switchToMalay" class="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300 transition-colors cursor-pointer">
        <span>🌐</span>
        <span>Bahasa Melayu</span>
      </button>

      <!-- 退出登录 -->
      <button @click="logout" class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer">
        <div class="flex items-center gap-2">
          <span>🚪</span>
          <span>退出登录</span>
        </div>
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
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

// 🚀 补充了与马来文版一致的 Icon 图标
const navItems = [
  { name: '调度总览', path: '/', icon: '📊' },
  { name: '教师请假登记', path: '/leave-entry', icon: '📝' },
  { name: '教师档案', path: '/teachers', icon: '👩‍🏫' },
  { name: '全校课表', path: '/timetable', icon: '📅' },
  { name: '代课记录', path: '/records', icon: '🔄' },
  { name: '统计报表', path: '/statistics', icon: '📈' },
  { name: 'MMI冲突干预', path: '/mmi-interruption', icon: '⚠️' }, 
  { name: '学科学情分析', path: '/subject-analysis', icon: '🎯' },
  { name: '系统设置', path: '/settings', icon: '⚙️' } 
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
    
    // 🚀 核心修改：使用原生 window.location 强制跳回登录页，彻底销毁旧界面！
    window.location.href = '/login'
    
  } catch (error) {
    toast.error("退出失败：" + error.message)
  }
}
</script>