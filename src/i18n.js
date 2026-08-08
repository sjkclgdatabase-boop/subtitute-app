import { createI18n } from 'vue-i18n'

// 1. 导入 JSON 语言包
import zh from './locales/zh.json'
import ms from './locales/ms.json'
import en from './locales/en.json'

// 2. 自动检测与读取保存的语言
function getAutoLanguage() {
  const savedLang = localStorage.getItem('locale')
  if (savedLang) return savedLang

  const browserLang = (navigator.language || '').toLowerCase()
  if (browserLang.startsWith('zh')) return 'zh'
  if (browserLang.startsWith('ms') || browserLang.startsWith('id')) return 'ms'
  if (browserLang.startsWith('en')) return 'en'
  return 'zh'
}

// 3. 创建 i18n 实例
const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: getAutoLanguage(), // 初始语言
  fallbackLocale: 'zh',
  messages: {
    zh,
    ms,
    en
  }
})

export default i18n