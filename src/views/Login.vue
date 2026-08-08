<template>
  <div class="min-h-screen bg-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
    
    <!-- 背景微光特效，增加柔和的科技纵深感 -->
    <div class="absolute w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -translate-x-32 translate-y-32"></div>

    <div class="w-full max-w-md bg-white/90 backdrop-blur-2xl border border-slate-100 px-10 py-12 rounded-3xl shadow-2xl shadow-indigo-100/60 flex flex-col items-center relative z-10">
      
      <!-- 霸气专属定制 SVG Logo (内置高能能量核心) -->
      <div class="w-24 h-24 mb-4 flex items-center justify-center relative">
        <!-- 徽标背后的发光晕染 -->
        <div class="absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-3xl blur-md opacity-20"></div>
        
        <svg viewBox="0 0 200 200" class="w-full h-full relative z-10 drop-shadow-md" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cyberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#38bdf8" />
              <stop offset="50%" stop-color="#6366f1" />
              <stop offset="100%" stop-color="#4f46e5" />
            </linearGradient>
            <linearGradient id="coreGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#ffffff" />
              <stop offset="100%" stop-color="#93c5fd" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <!-- 外围雷达/能量环 -->
          <circle cx="100" cy="100" r="82" fill="none" stroke="#f1f5f9" stroke-width="2" />
          <circle cx="100" cy="100" r="82" fill="none" stroke="url(#cyberGrad)" stroke-width="3" stroke-dasharray="50 120" stroke-linecap="round" filter="url(#glow)" />
          
          <!-- 中层几何八边形/盾牌轮廓 -->
          <polygon points="100,25 165,60 165,140 100,175 35,140 35,60" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2" />
          <polygon points="100,32 158,65 158,135 100,168 42,135 42,65" fill="none" stroke="url(#cyberGrad)" stroke-width="2.5" />

          <!-- 核心高效十字星轨/教务统筹交叉线 -->
          <line x1="100" y1="25" x2="100" y2="175" stroke="#38bdf8" stroke-width="1.5" opacity="0.4" />
          <line x1="35" y1="100" x2="165" y2="100" stroke="#38bdf8" stroke-width="1.5" opacity="0.4" />

          <!-- 中心锐利能量三角与核心圆 -->
          <path d="M100 55 L135 125 L65 125 Z" fill="url(#cyberGrad)" opacity="0.9" />
          <polygon points="100,70 122,112 78,112" fill="#ffffff" />
          <circle cx="100" cy="98" r="10" fill="url(#coreGrad)" filter="url(#glow)" />

          <!-- 顶部与四周霸气高亮科技节点 -->
          <circle cx="100" cy="25" r="4" fill="#38bdf8" filter="url(#glow)" />
          <circle cx="165" cy="60" r="3" fill="#6366f1" />
          <circle cx="35" cy="140" r="3" fill="#6366f1" />
          <circle cx="100" cy="175" r="4" fill="#38bdf8" filter="url(#glow)" />
        </svg>
      </div>

      <!-- 系统大标题 -->
      <h1 class="text-xl font-black tracking-widest text-slate-900 text-center uppercase leading-tight font-serif drop-shadow-sm">
        智能教务统筹系统
      </h1>
      
      <!-- 学校副标题 -->
      <p class="text-xs font-extrabold tracking-[0.25em] text-slate-500 mt-2 uppercase mb-8">
        SJKC LADANG GRISEK
      </p>

      <!-- 登录表单 -->
      <form @submit.prevent="handleLogin" class="w-full space-y-4">
        
        <!-- 邮箱输入框 -->
        <div class="relative flex items-center">
          <span class="absolute left-4 text-cyan-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
          </span>
          <input 
            v-model="email" 
            type="email" 
            required
            placeholder="请输入邮箱" 
            class="w-full bg-slate-50 border border-slate-200 py-3.5 pl-12 pr-4 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition shadow-inner"
          />
        </div>

        <!-- 密码输入框 -->
        <div class="relative flex items-center">
          <span class="absolute left-4 text-cyan-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </span>
          <input 
            v-model="password" 
            type="password" 
            required
            placeholder="请输入密码" 
            class="w-full bg-slate-50 border border-slate-200 py-3.5 pl-12 pr-4 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition shadow-inner"
          />
        </div>

        <!-- 忘记密码链接 -->
        <div class="text-right pt-1 pb-2">
          <a href="#" @click.prevent="handleForgotPassword" class="text-[11px] font-bold text-slate-500 hover:text-cyan-600 transition">
            忘记密码？
          </a>
        </div>

        <!-- 登录按钮 -->
        <button 
          type="submit" 
          :disabled="loading"
          class="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 text-xs tracking-widest uppercase disabled:opacity-50"
        >
          <span v-if="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          <span>登 录 系 统</span>
        </button>

      </form>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../services/supabase'
import { useToast } from '../utils/toast'

const email = ref('')
const password = ref('')
const router = useRouter()
const toast = useToast()
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value.trim(),
    password: password.value
  })
  loading.value = false

  if (error) {
    toast.error("登录失败: " + error.message)
  } else {
    toast.success("登录成功！")
    router.push('/')
  }
}

const handleForgotPassword = () => {
  toast.error("请联系系统管理员以重置密码。")
}
</script>