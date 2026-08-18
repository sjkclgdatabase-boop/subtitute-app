<template>
  <!-- 锁死整个屏幕，只允许在 main 区域内部出现大滚动条 -->
  <div class="h-screen w-screen flex bg-slate-50 overflow-hidden print:bg-white">
    
    <!-- 侧边栏固定不动 -->
    <Sidebar v-if="showSidebar" class="shrink-0 h-full z-20" />
    
    <!-- 右侧内容区：开启 overflow-auto，只要里面的内容超过宽度，底部立刻出现大横向滚动条 -->
    <main class="flex-1 h-full overflow-auto">
      <router-view />
    </main>

    <Toast />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import Toast from './components/Toast.vue'

const route = useRoute()
const showSidebar = computed(() => !route.path.toLowerCase().includes('/login'))
</script>