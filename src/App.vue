<template>
  <div class="min-h-screen bg-slate-50 flex">
    <Sidebar v-if="showSidebar" />
    <main class="flex-1 overflow-y-auto">
      <router-view />
    </main>
    <Toast />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from './services/supabase'
import Sidebar from './components/Sidebar.vue'
import Toast from './utils/toast'

const route = useRoute()
const showSidebar = computed(() => route.path !== '/login')

// 🚀 核心：页面加载时拦截 URL 中的 Token，自动注入登录状态
onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const accessToken = urlParams.get('access_token')
  const refreshToken = urlParams.get('refresh_token')

  if (accessToken && refreshToken) {
    try {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      })

      if (!error) {
        // 注入成功后清除网址上的 Token 尾巴，保持干净
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    } catch (err) {
      console.error('Memulihkan sesi gagal:', err)
    }
  }
})
</script>