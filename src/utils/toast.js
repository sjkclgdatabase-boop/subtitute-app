import { reactive } from 'vue'

const state = reactive({
  message: '',
  type: 'success', // 'success' | 'error'
  visible: false
})

export function useToast() {
  const show = (msg, type = 'success') => {
    state.message = msg
    state.type = type
    state.visible = true
    setTimeout(() => {
      state.visible = false
    }, 3000)
  }

  return {
    state,
    success: (msg) => show(msg, 'success'),
    error: (msg) => show(msg, 'error')
  }
}
