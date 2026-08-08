import { createI18n } from 'vue-i18n'

// 定义语言词条
const messages = {
  zh: {
    login: {
      title: "智能教务统筹系统",
      school: "SJKC LADANG GRISEK",
      emailPlaceholder: "请输入邮箱",
      passwordPlaceholder: "请输入密码",
      forgotPassword: "忘记密码？",
      loginBtn: "登 录 系 统",
      success: "登录成功！",
      fail: "登录失败: "
    }
  },
  en: {
    login: {
      title: "Smart Educational Coordination System",
      school: "SJKC LADANG GRISEK",
      emailPlaceholder: "Enter your email",
      passwordPlaceholder: "Enter your password",
      forgotPassword: "Forgot password?",
      loginBtn: "LOGIN",
      success: "Login successful!",
      fail: "Login failed: "
    }
  },
  ms: {
    login: {
      title: "Sistem Koordinasi Pendidikan Pintar",
      school: "SJKC LADANG GRISEK",
      emailPlaceholder: "Masukkan e-mel anda",
      passwordPlaceholder: "Masukkan kata laluan",
      forgotPassword: "Lupa kata laluan?",
      loginBtn: "LOG MASUK",
      success: "Log masuk berjaya!",
      fail: "Log masuk gagal: "
    }
  }
}

/**
 * 自动获取并判断语言
 */
function getAutoLanguage() {
  // 1. 优先读取用户手动选择的历史记录
  const savedLang = localStorage.getItem('locale') || localStorage.getItem('app_lang')
  if (savedLang) {
    return savedLang
  }

  // 2. 读取浏览器语言 (如 "zh-CN", "zh-TW", "en-US", "ms-MY")
  const browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase()

  // 3. 匹配系统支持的三语
  if (browserLang.startsWith('zh')) {
    return 'zh' // 中文 / 华文
  } 
  if (browserLang.startsWith('ms') || browserLang.startsWith('id')) {
    return 'ms' // 马来文 / 印尼文
  } 
  if (browserLang.startsWith('en')) {
    return 'en' // 英文
  }

  // 4. 默认回退语言
  return 'zh'
}

const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: getAutoLanguage(), // 自动加载检测到的语言
  fallbackLocale: 'zh',
  messages
})

export default i18n