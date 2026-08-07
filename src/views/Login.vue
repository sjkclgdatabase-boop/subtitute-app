<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50">
    <div class="p-8 bg-white rounded-lg shadow-md w-96">
      <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">行政代课系统登录</h2>
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2">邮箱</label>
          <input v-model="email" type="email" required class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
        </div>
        <div class="mb-6">
          <label class="block text-gray-700 text-sm font-bold mb-2">密码</label>
          <input v-model="password" type="password" required class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
        </div>
        <button type="submit" class="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 font-semibold transition">登录</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../services/supabase'
import { useRouter } from 'vue-router'
import { useToast } from '../utils/toast'

const email = ref('')
const password = ref('')
const router = useRouter()
const toast = useToast()

const handleLogin = async () => {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })
  if (error) {
    toast.error("登录失败: " + error.message)
  } else {
    toast.success("登录成功！")
    router.push('/')
  }
}
</script>
