<template>
  <div class="min-h-screen bg-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">

    <!-- 背景微光特效 -->
    <div class="absolute w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -translate-x-32 translate-y-32"></div>

    <div class="w-full max-w-md bg-white/90 backdrop-blur-2xl border border-slate-100 px-10 py-12 rounded-3xl shadow-2xl shadow-indigo-100/60 flex flex-col items-center relative z-10">
      
      <!-- Logo 动态展示 -->
      <div class="w-36 h-36 mb-4 flex items-center justify-center relative">
        <img 
          :src="currentLogo || '/logo.png'" 
          :alt="currentSchoolName" 
          class="w-full h-full object-contain relative z-10 rounded-2xl"
        />
      </div>

      <!-- 系统大标题 -->
      <h1 class="text-xl font-black tracking-widest text-slate-900 text-center uppercase leading-tight font-serif drop-shadow-sm">
        智能教务统筹系统
      </h1>
      
      <!-- 动态学校副标题 -->
      <p class="text-xs font-extrabold tracking-[0.25em] text-slate-500 mt-2 uppercase mb-8 text-center">
        {{ currentSchoolName }}
      </p>

      <!-- 登录表单 -->
      <form @submit.prevent="handleLogin" class="w-full space-y-4">
        
        <!-- 邮箱输入框 -->
        <div class="relative flex items-center">
          <label for="email" class="sr-only">请输入邮箱</label>
          <span class="absolute left-4 text-cyan-600 flex items-center justify-center">
            <Mail class="w-5 h-5" />
          </span>
          <input 
            id="email"
            v-model="email" 
            type="email" 
            required
            autocomplete="email"
            placeholder="请输入邮箱" 
            class="w-full bg-slate-50 border border-slate-200 py-3.5 pl-12 pr-4 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition shadow-inner"
          />
        </div>

        <!-- 密码输入框 -->
        <div class="relative flex items-center">
          <label for="password" class="sr-only">请输入密码</label>
          <span class="absolute left-4 text-cyan-600 flex items-center justify-center">
            <Lock class="w-5 h-5" />
          </span>
          <input 
            id="password"
            v-model="password" 
            type="password" 
            required
            autocomplete="current-password"
            placeholder="请输入密码" 
            class="w-full bg-slate-50 border border-slate-200 py-3.5 pl-12 pr-4 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition shadow-inner"
          />
        </div>

        <!-- 忘记密码链接 -->
        <div class="text-right pt-1 pb-2">
          <button type="button" @click="handleForgotPassword" class="text-[11px] font-bold text-slate-500 hover:text-cyan-600 transition bg-transparent border-0 cursor-pointer">
            忘记密码？
          </button>
        </div>

        <!-- 登录按钮 -->
        <button 
          type="submit" 
          :disabled="loading"
          class="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 text-xs tracking-widest uppercase disabled:opacity-50 cursor-pointer"
        >
          <span v-if="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          <span>登 录 系 统</span>
        </button>

      </form>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../services/supabase'
import { useToast } from '../utils/toast'
import { Mail, Lock } from 'lucide-vue-next'

const router = useRouter()
const toast = useToast()

const email = ref('')
const password = ref('')
const loading = ref(false)

// 动态学校名称与 Logo 状态
const currentSchoolName = ref('SJKC LADANG GRISEK')
const currentLogo = ref('/logo.png')

// 页面加载时从本地缓存及 Supabase 云端同步最新校名与 Logo
onMounted(async () => {
  // 1. 优先读取本地缓存秒显
  const cachedLogo = localStorage.getItem('school_logo')
  const cachedName = localStorage.getItem('school_name')
  if (cachedLogo && cachedLogo.trim() !== '') currentLogo.value = cachedLogo
  if (cachedName && cachedName.trim() !== '') currentSchoolName.value = cachedName

  // 2. 从 Supabase 实时拉取最新配置
  try {
    const { data, error } = await supabase.from('school_settings').select('*').eq('id', 1).single()
    if (data) {
      if (data.school_name) {
        currentSchoolName.value = data.school_name
        localStorage.setItem('school_name', data.school_name)
      }
      if (data.logo_url && data.logo_url.trim() !== '') {
        currentLogo.value = data.logo_url
        localStorage.setItem('school_logo', data.logo_url)
      }
    }
  } catch (err) {
    console.error('❌ 登录页同步学校信息失败:', err)
  }
})

const handleLogin = async () => {
  loading.value = true
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value.trim(),
      password: password.value
    })

    if (error) {
      toast.error(`登录失败: ${error.message}`)
    } else {
      toast.success("登录成功！")
      router.push('/')
    }
  } catch (err) {
    toast.error("发生未知错误，请重试")
  } finally {
    loading.value = false
  }
}

const handleForgotPassword = () => {
  toast.error("请联系系统管理员以重置密码。")
}
</script>