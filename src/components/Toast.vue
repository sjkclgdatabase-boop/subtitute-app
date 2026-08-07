<template>
  <div 
    v-if="state.visible" 
    class="fixed top-5 right-5 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform translate-y-0"
    :class="state.type === 'error' ? 'bg-red-500' : 'bg-green-600'"
  >
    {{ state.message }}
  </div>
</template>

<script setup>
import { useToast } from '../utils/toast'
const { state } = useToast()
</script>
