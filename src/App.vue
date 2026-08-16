<template>
  <!-- 加上 class="print:hidden" 即可 -->
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
import Toast from './components/Toast.vue'

const route = useRoute()
const showSidebar = computed(() => route.path !== '/login')
</script>