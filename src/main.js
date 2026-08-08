import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import i18n from './locales' // 引入上一步配好的 i18n
import './style.css' // 你的 Tailwind CSS

const app = createApp(App)

app.use(router)
app.use(i18n) // 挂载 i18n

app.mount('#app')