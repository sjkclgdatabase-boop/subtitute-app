<template>
  <div class="p-6 max-w-7xl mx-auto">
    <h1 class="text-2xl font-bold mb-6 text-gray-800">教师档案管理</h1>
    
    <!-- 顶部操作栏：双班制胶囊切换器与功能区 -->
    <div class="bg-white p-4 rounded-3xl shadow-sm ring-1 ring-slate-900/5 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
      
      <div class="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
        <!-- 左侧：上午班 / 下午班胶囊切换器 -->
        <div class="bg-slate-100 p-1.5 rounded-2xl flex items-center shadow-inner w-full sm:w-auto">
          <button 
            @click="currentSession = 'morning'" 
            class="flex-1 sm:flex-none py-2.5 px-6 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            :class="currentSession === 'morning' 
              ? 'bg-white text-indigo-600 shadow-sm ring-2 ring-blue-600' 
              : 'text-slate-500 hover:text-slate-900'"
          >
            <span>☀️</span> 上午班
          </button>
          <button 
            @click="currentSession = 'afternoon'" 
            class="flex-1 sm:flex-none py-2.5 px-6 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            :class="currentSession === 'afternoon' 
              ? 'bg-white text-orange-600 shadow-sm ring-2 ring-orange-500' 
              : 'text-slate-500 hover:text-slate-900'"
          >
            <span>🌙</span> 下午班
          </button>
        </div>

        <!-- 批量导入与模版按钮组 -->
        <div class="flex gap-2 w-full sm:w-auto">
          <button @click="downloadTemplate" class="bg-emerald-600 text-white px-4 py-2.5 rounded-xl hover:bg-emerald-700 text-sm font-semibold shadow-sm transition cursor-pointer">
            下载导入模板
          </button>
          <label class="bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 cursor-pointer text-sm font-semibold shadow-sm transition flex items-center justify-center">
            批量导入
            <input type="file" accept=".csv" @change="handleCsvUpload" class="hidden" />
          </label>
        </div>
      </div>

      <button @click="showModal = true" class="w-full md:w-auto bg-purple-600 text-white px-6 py-2.5 rounded-xl hover:bg-purple-700 text-sm font-semibold shadow-md transition cursor-pointer">
        +  添加教师
      </button>
    </div>

    <!-- 教师列表表格 -->
    <div class="bg-white rounded-3xl shadow-sm ring-1 ring-slate-900/5 overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50 text-gray-700 select-none text-sm border-b border-slate-100">
            <th @click="sortBy('name')" class="p-4 cursor-pointer hover:bg-gray-100 transition">
              <div class="flex items-center gap-1 font-bold">
                教师姓名 <span class="text-xs text-slate-400">{{ getSortIcon('name') }}</span>
              </div>
            </th>
            <th @click="sortBy('subject')" class="p-4 cursor-pointer hover:bg-gray-100 transition">
              <div class="flex items-center gap-1 font-bold">
                科目 <span class="text-xs text-slate-400">{{ getSortIcon('subject') }}</span>
              </div>
            </th>
            <th @click="sortBy('session')" class="p-4 cursor-pointer hover:bg-gray-100 transition">
              <div class="flex items-center gap-1 font-bold">
                所属班次 <span class="text-xs text-slate-400">{{ getSortIcon('session') }}</span>
              </div>
            </th>
            <th @click="sortBy('max_substitute_per_week')" class="p-4 cursor-pointer hover:bg-gray-100 transition">
              <div class="flex items-center gap-1 font-bold">
                每周代课最大节数 <span class="text-xs text-slate-400">{{ getSortIcon('max_substitute_per_week') }}</span>
              </div>
            </th>
            <th @click="sortBy('is_active')" class="p-4 cursor-pointer hover:bg-gray-100 transition">
              <div class="flex items-center gap-1 font-bold">
                状态 <span class="text-xs text-slate-400">{{ getSortIcon('is_active') }}</span>
              </div>
            </th>
            <th class="p-4 font-bold">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredTeachers.length === 0">
            <td colspan="6" class="p-12 text-center text-slate-400 text-sm">
              当前{{ currentSession === 'morning' ? '上午班' : '下午班' }}暂无教师数据
            </td>
          </tr>
          <tr v-for="t in filteredTeachers" :key="t.id" class="hover:bg-slate-50/80 transition border-b border-slate-50 last:border-none">
            <td class="p-4 font-semibold text-slate-800">
              {{ t.name }}
              <!-- 行政人员标签 -->
              <span v-if="t.is_admin" class="ml-2 px-2 py-0.5 bg-rose-100 text-rose-700 rounded-md text-[10px] font-bold tracking-widest">
                行政
              </span>
              <!-- 新增：辅导老师标签 -->
              <span v-if="t.is_counselor" class="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold tracking-widest">
                辅导
              </span>
            </td>
            <td class="p-4 text-slate-600">{{ t.subject || '-' }}</td>
            <td class="p-4">
              <span :class="t.session === 'afternoon' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'" class="px-3 py-1 rounded-full text-xs font-bold">
                {{ t.session === 'afternoon' ? '下午班' : '上午班' }}
              </span>
            </td>
            <td class="p-4 text-slate-600">{{ t.max_substitute_per_week }} 节</td>
            <td class="p-4">
              <span :class="t.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="px-2.5 py-1 rounded-md text-xs font-semibold">
                {{ t.is_active ? '在职' : '离职' }}
              </span>
            </td>
            <td class="p-4">
              <button @click="deleteTeacher(t.id)" class="text-red-600 hover:text-red-800 text-sm font-medium transition cursor-pointer">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 新增模态框 -->
    <div v-if="showModal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white p-6 rounded-3xl w-full max-w-sm shadow-2xl ring-1 ring-slate-900/10 max-h-[90vh] overflow-y-auto">
        <h2 class="text-lg font-bold text-slate-900 mb-4">新增教师</h2>
        
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">姓名</label>
            <input v-model="form.name" placeholder="例如: 张三" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">科目</label>
            <input v-model="form.subject" placeholder="例如: 华文" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">分配班次</label>
            <select v-model="form.session" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer">
              <option value="morning">上午班 (Morning)</option>
              <option value="afternoon">下午班 (Afternoon)</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">每周代课上限 (节)</label>
            <input v-model.number="form.max_substitute_per_week" type="number" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
          </div>

          <!-- 行政人员开关 -->
          <div class="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl mt-2">
            <div>
              <label class="block text-sm font-semibold text-slate-700">设为行政人员</label>
              <p class="text-[10px] text-slate-500 mt-0.5">排课时将其优先权降至最低(沉底)</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="form.is_admin" class="sr-only peer">
              <div class="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
            </label>
          </div>

          <!-- 新增：辅导老师开关 -->
          <div class="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl mt-2">
            <div>
              <label class="block text-sm font-semibold text-slate-700">设为辅导老师</label>
              <p class="text-[10px] text-slate-500 mt-0.5">每日智能代课限制放宽至 4 节</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="form.is_counselor" class="sr-only peer">
              <div class="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

        </div>

        <div class="mt-6 flex gap-3">
          <button @click="showModal = false" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer">取消</button>
          <button @click="saveTeacher" class="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl text-sm font-semibold shadow-md transition cursor-pointer">保存</button>
        </div>
      </div>
    </div>

    <!-- 📊 动态数字百分比进度条弹窗 -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="uploadProgress.show" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 select-none">
        <div class="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-100 text-center space-y-6">
          
          <!-- 顶部状态图标 -->
          <div class="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl transition-all duration-300"
               :class="uploadProgress.percent === 100 ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-50 text-indigo-600 animate-bounce'">
            <span v-if="uploadProgress.percent < 100">👩‍🏫</span>
            <span v-else>🎉</span>
          </div>

          <!-- 标题与当前状态文字 -->
          <div>
            <h3 class="text-lg font-extrabold text-slate-900">
              {{ uploadProgress.percent === 100 ? '教师数据导入成功！' : '正在批量导入教师...' }}
            </h3>
            <p class="text-xs font-semibold text-slate-500 mt-1.5">
              {{ uploadProgress.statusText }}
            </p>
          </div>

          <!-- 数字百分比进度条主体 -->
          <div class="space-y-2">
            <!-- 填充条 -->
            <div class="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/80 shadow-inner">
              <div 
                class="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full transition-all duration-300 shadow-sm"
                :style="{ width: uploadProgress.percent + '%' }"
              ></div>
            </div>
            
            <!-- 数字百分比提示 -->
            <div class="flex justify-between items-center text-xs font-bold px-1">
              <span class="text-slate-400">处理进度</span>
              <span class="text-indigo-600 font-black text-sm">{{ uploadProgress.percent }}%</span>
            </div>
          </div>

        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../services/supabase'
import { parseCSV } from '../utils/importCsv'
import { useToast } from '../utils/toast'

const toast = useToast()
const teachers = ref([])
const showModal = ref(false)
const currentSession = ref('morning')

// 新增了 is_admin 和 is_counselor
const form = ref({ name: '', subject: '', max_substitute_per_week: 5, session: 'morning', is_active: true, is_admin: false, is_counselor: false })

// 📊 上传百分比进度条状态
const uploadProgress = ref({
  show: false,
  percent: 0,
  statusText: ''
})

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const startProgress = (initialText = '正在读取 CSV 教师模板...') => {
  uploadProgress.value = {
    show: true,
    percent: 10,
    statusText: initialText
  }
}

const updateProgress = (percent, text) => {
  uploadProgress.value.percent = percent
  if (text) uploadProgress.value.statusText = text
}

const finishProgress = async (successMsg = '导入完成') => {
  uploadProgress.value.percent = 100
  uploadProgress.value.statusText = successMsg
  await sleep(600)
  uploadProgress.value.show = false
}

// 排序状态管理
const sortKey = ref('name') 
const sortOrder = ref('asc') 

const sortBy = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

const getSortIcon = (key) => {
  if (sortKey.value !== key) return '↕'
  return sortOrder.value === 'asc' ? '▲' : '▼'
}

const filteredTeachers = computed(() => {
  const list = teachers.value.filter(t => (t.session || 'morning') === currentSession.value)
  
  return [...list].sort((a, b) => {
    let valA = a[sortKey.value] ? String(a[sortKey.value]).trim().toUpperCase() : ''
    let valB = b[sortKey.value] ? String(b[sortKey.value]).trim().toUpperCase() : ''

    const res = valA.localeCompare(valB, 'en', { numeric: true })
    return sortOrder.value === 'asc' ? res : -res
  })
})

const fetchTeachers = async () => {
  const { data } = await supabase.from('teachers').select('*')
  if (data) teachers.value = data
}

// 模板更新：增加 is_admin 和 is_counselor
const downloadTemplate = () => {
  const csvContent = "name,subject,max_substitute_per_week,session,is_admin,is_counselor\n张三,华文,5,morning,false,false\n李四(副校长),数学,8,afternoon,true,false\n王五(辅导),B&K,10,morning,false,true"
  const blob = new Blob(['\ufeff', csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", "教师信息导入模版.csv")
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  toast.success("教师模版下载成功！")
}

const saveTeacher = async () => {
  const { error } = await supabase.from('teachers').insert([form.value])
  if (error) toast.error("保存失败: " + error.message)
  else {
    toast.success("添加成功")
    showModal.value = false
    // 保存后重置所有字段，包含 is_admin 和 is_counselor
    form.value = { name: '', subject: '', max_substitute_per_week: 5, session: 'morning', is_active: true, is_admin: false, is_counselor: false }
    fetchTeachers()
  }
}

const deleteTeacher = async (id) => {
  const { error } = await supabase.from('teachers').delete().eq('id', id)
  if (!error) { toast.success("删除成功"); fetchTeachers(); }
}

// 📂 完美集成数字百分比进度条的批量导入逻辑
const handleCsvUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  
  startProgress('正在读取教师 CSV 文件...')

  try {
    await sleep(200)
    updateProgress(30, '正在解析与校验教师名单数据...')

    const data = await parseCSV(file)
    if (!data || data.length === 0) {
      uploadProgress.value.show = false
      toast.error("CSV 文件为空或格式错误")
      return
    }

    let updateCount = 0
    let insertCount = 0
    const totalRows = data.length

    await sleep(200)
    updateProgress(50, `准备处理 ${totalRows} 条教师记录...`)

    for (let index = 0; index < totalRows; index++) {
      const row = data[index]
      if (!row.name) continue
      const trimmedName = String(row.name).trim()

      let rawSession = row.session ? String(row.session).trim().toLowerCase() : 'morning'
      if (rawSession.includes('afternoon') || rawSession.includes('下') || rawSession.includes('petang')) {
        rawSession = 'afternoon'
      } else {
        rawSession = 'morning'
      }

      // 新增解析 is_admin 和 is_counselor
      const teacherPayload = {
        name: trimmedName,
        subject: row.subject ? String(row.subject).trim() : '',
        max_substitute_per_week: parseInt(row.max_substitute_per_week || 5),
        session: rawSession,
        is_active: true,
        is_admin: row.is_admin ? (String(row.is_admin).trim().toLowerCase() === 'true' || String(row.is_admin).trim() === '1' || row.is_admin === '是') : false,
        is_counselor: row.is_counselor ? (String(row.is_counselor).trim().toLowerCase() === 'true' || String(row.is_counselor).trim() === '1' || row.is_counselor === '是') : false
      }

      const existingTeacher = teachers.value.find(t => t.name.trim() === trimmedName)

      if (existingTeacher) {
        const { error } = await supabase
          .from('teachers')
          .update(teacherPayload)
          .eq('id', existingTeacher.id)
        
        if (error) throw error
        updateCount++
      } else {
        const { error } = await supabase
          .from('teachers')
          .insert([teacherPayload])
        
        if (error) throw error
        insertCount++
      }

      // 动态推算写入进度 (50% ~ 90%)
      const currentPercent = 50 + Math.floor(((index + 1) / totalRows) * 40)
      updateProgress(currentPercent, `正在写入数据库 (${index + 1}/${totalRows})...`)
    }

    await finishProgress(`处理完成：新增 ${insertCount} 位，更新 ${updateCount} 位教师`)
    toast.success(`导入完成！已更新 ${updateCount} 位，新增 ${insertCount} 位教师资料。`)
    fetchTeachers()
  } catch (err) {
    uploadProgress.value.show = false
    toast.error("导入失败: " + err.message)
  } finally {
    e.target.value = ''
  }
}

onMounted(fetchTeachers)
</script>