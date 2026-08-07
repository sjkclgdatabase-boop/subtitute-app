<template>
  <!-- 加上 class="print:hidden" 即可 -->
  <Navbar v-if="showNavbar" class="print:hidden" />
  <router-view />
  <Toast />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from './components/Navbar.vue'
import Toast from './components/Toast.vue'

const route = useRoute()
const showNavbar = computed(() => route.path !== '/login')
</script>