<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="-translate-y-6 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="-translate-y-6 opacity-0"
  >
    <div 
      v-if="state.visible" 
      class="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl text-white font-semibold text-sm flex items-center gap-2.5 backdrop-blur-md"
      :class="state.type === 'error' ? 'bg-rose-600/95 shadow-rose-500/20' : 'bg-emerald-600/95 shadow-emerald-500/20'"
    >
      <!-- 成功提示图标 -->
      <svg v-if="state.type !== 'error'" class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
      </svg>
      
      <!-- 错误提示图标 -->
      <svg v-else class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>

      <span>{{ state.message }}</span>
    </div>
  </Transition>
</template>

<script setup>
import { useToast } from '../utils/toast'
const { state } = useToast()
</script>