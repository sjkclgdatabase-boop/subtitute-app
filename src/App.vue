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
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import Toast from './components/Toast.vue' // 注意这里我帮你把路径改回 components 了

const route = useRoute()

// 🚀 核心加强：不管路由是 /login 还是 /Login，只要包含 login 就绝对隐藏侧边栏！
const showSidebar = computed(() => !route.path.toLowerCase().includes('/login'))
</script>