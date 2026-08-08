<template>
  <div class="min-h-screen bg-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">

    <!-- 背景微光特效 -->
    <div class="absolute w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -translate-x-32 translate-y-32"></div>

    <div class="w-full max-w-md bg-white/90 backdrop-blur-2xl border border-slate-100 px-10 py-12 rounded-3xl shadow-2xl shadow-indigo-100/60 flex flex-col items-center relative z-10">
      
      <!-- Logo 展示 -->
      <div class="w-36 h-36 mb-4 flex items-center justify-center relative">
        <img 
          src="/logo.png" 
          alt="SJKC LADANG GRISEK" 
          class="w-full h-full object-contain relative z-10 rounded-2xl"
        />
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
          <label for="email" class="sr-only">请输入邮箱</label>
          <span class="absolute left-4 text-cyan-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
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
          <span class="absolute left-4 text-cyan-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../services/supabase'
import { useToast } from '../utils/toast'

const router = useRouter()
const toast = useToast()

const email = ref('')
const password = ref('')
const loading = ref(false)

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