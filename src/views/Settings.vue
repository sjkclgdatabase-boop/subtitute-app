<template>
  <div class="p-8 max-w-4xl mx-auto min-h-screen space-y-8">
    
    <!-- 头部区域 -->
    <div class="mb-2">
      <h1 class="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-800 to-violet-800">
        系统全局设置与维护
      </h1>
      <p class="text-slate-500 text-sm mt-2 font-medium">配置学校作息参数、管理基础班级、设置MMI目标，支持上线前数据清理与备份</p>
    </div>

    <!-- 卡片一：学校作息配置 -->
    <div class="bg-white rounded-3xl shadow-sm ring-1 ring-slate-900/5 p-8 transition-all duration-300 hover:shadow-md">
      <h2 class="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
        <span class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">🏫</span>
        学校作息配置
      </h2>
      
      <div class="space-y-6">
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">每周上课天数 (天)</label>
          <div class="flex items-center gap-4">
            <input 
              v-model.number="config.daysPerWeek" 
              type="number" min="1" max="7" 
              class="w-full sm:w-64 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
            <span class="text-sm text-slate-400">例如：5（代表周一至周五）</span>
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">每日总节数 (节)</label>
          <div class="flex items-center gap-4">
            <input 
              v-model.number="config.periodsPerDay" 
              type="number" min="1" max="15" 
              class="w-full sm:w-64 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
            <span class="text-sm text-slate-400">例如：11（上午班总节数）</span>
          </div>
        </div>
      </div>

      <div class="mt-10 pt-6 border-t border-slate-100 flex justify-end">
        <button 
          @click="saveConfig" 
          class="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
        >
          保存配置
        </button>
      </div>
    </div>

    <!-- 卡片二：学年上课周历与假期维护 -->
    <div class="bg-white rounded-3xl shadow-sm ring-1 ring-slate-900/5 p-8 transition-all duration-300 hover:shadow-md">
      <h2 class="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
        <span class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">📅</span>
        学年上课周历与假期配置
      </h2>
      <p class="text-slate-500 text-xs mb-6">录入全年上课周与假期周，系统自动剔除假期，精准计算科目「理论应达进度」。</p>

      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200 mb-6">
        <div>
          <h3 class="text-sm font-bold text-slate-900">批量导入/导出上课周历</h3>
          <p class="text-slate-500 text-xs mt-1">支持下载标准CSV模板，填写后批量上传，适配周历数据格式。</p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <button @click="downloadWeekTemplate" class="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2 cursor-pointer">
            📥 下载周历模板
          </button>
          
          <label class="relative cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2">
            <span>📂 选择周历文件</span>
            <input type="file" ref="weekFileInput" accept=".csv" @change="handleWeekFileUpload" class="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
          </label>
        </div>
      </div>

      <div class="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-6 grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">第几周</label>
          <input type="number" v-model.number="newWeek.week_number" placeholder="1" class="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-800" />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">开始日期 (YYYY-MM-DD)</label>
          <input type="date" v-model="newWeek.start_date" class="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-800" />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">结束日期 (YYYY-MM-DD)</label>
          <input type="date" v-model="newWeek.end_date" class="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-800" />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">类型属性</label>
          <select v-model="newWeek.is_school_week" class="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-800">
            <option :value="true">🟢 上课周</option>
            <option :value="false">🔴 假期周</option>
          </select>
        </div>
        <button @click="addSchoolWeek" class="bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer">
          ➕ 单条添加
        </button>
      </div>

      <div class="space-y-3">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">已录入的学年周历列表</h3>
          <span class="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-bold">共 {{ allSchoolWeeks.length }} 周</span>
        </div>

        <div class="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden max-h-64 overflow-y-auto">
          <div v-if="allSchoolWeeks.length === 0" class="p-8 text-center text-xs text-slate-400">
            还没有录入任何周历数据，请在上方添加或批量导入。
          </div>
          <div v-for="w in allSchoolWeeks" :key="w.id" class="p-3.5 flex items-center justify-between bg-white hover:bg-slate-50 transition">
            <div class="flex items-center gap-4 text-xs font-semibold text-slate-700">
              <span class="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-bold">第 {{ w.week_number }} 周</span>
              <span class="text-slate-600 font-medium">{{ w.start_date }} ~ {{ w.end_date }}</span>
              <span :class="w.is_school_week ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-red-700 bg-red-50 border-red-200'" class="px-2.5 py-0.5 rounded-full text-[10px] font-black border">
                {{ w.is_school_week ? '🟢 上课周' : '🔴 假期周' }}
              </span>
            </div>
            <button @click="deleteSchoolWeek(w.id)" class="text-slate-400 hover:text-red-600 text-xs font-bold px-3 py-1 rounded-lg transition hover:bg-red-50 cursor-pointer">
              🗑️ 删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 卡片三：学校班级基础管理 -->
    <div class="bg-white rounded-3xl shadow-sm ring-1 ring-slate-900/5 p-8 transition-all duration-300 hover:shadow-md">
      <h2 class="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
        <span class="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">📚</span>
        学校班级基础管理
      </h2>
      <p class="text-slate-500 text-xs mb-6">维护全校标准班级，供排课、请假与 MMI 干扰记录选用。</p>

      <div class="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-8 flex flex-col sm:flex-row gap-4 items-end">
        <div class="w-full sm:w-1/3">
          <label class="block text-xs font-bold text-slate-700 mb-2">年级 (Tahun):</label>
          <select v-model="newClassGrade" class="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-800">
            <option v-for="g in [1, 2, 3, 4, 5, 6]" :key="g" :value="g">Tahun {{ g }}</option>
          </select>
        </div>

        <div class="w-full sm:w-1/2">
          <label class="block text-xs font-bold text-slate-700 mb-2">班级名称 (例如: 1A, 4C):</label>
          <input 
            type="text" 
            v-model="newClassName" 
            placeholder="输入标准班级名称..." 
            class="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button 
          @click="addClass" 
          class="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all shrink-0 cursor-pointer"
        >
          ➕ 添加班级
        </button>
      </div>

      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">已录入的全校班级列表</h3>
          <button @click="toggleAllGrades" class="text-xs text-indigo-600 font-bold hover:underline cursor-pointer">
            {{ allExpanded ? '全部折叠' : '全部展开' }}
          </button>
        </div>
        
        <div v-if="classList.length === 0" class="text-xs text-slate-400 py-6 text-center border border-dashed border-slate-200 rounded-2xl">
          暂无班级数据，请在上方添加
        </div>

        <div v-else class="space-y-4">
          <div v-for="(classListGroup, gradeKey) in groupedClasses" :key="gradeKey" class="space-y-2">
            
            <div v-if="classListGroup.length > 0" 
                 @click="toggleGrade(gradeKey)"
                 class="flex items-center gap-3 cursor-pointer group select-none">
              <span class="px-3 py-1 bg-violet-50 text-violet-700 rounded-xl text-xs font-black tracking-wider group-hover:bg-violet-100 transition flex items-center gap-2">
                Tahun {{ gradeKey }} 
                <span class="text-[10px] text-violet-400">{{ expandedGrades[gradeKey] ? '▼' : '▶' }}</span>
              </span>
              <div class="h-px bg-slate-100 flex-1"></div>
            </div>

            <div v-show="expandedGrades[gradeKey]" class="flex flex-wrap gap-3 pt-1">
              <div 
                v-for="c in classListGroup" 
                :key="c.id"
                class="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between group hover:border-indigo-300 transition-all min-w-[120px]"
              >
                <div>
                  <div class="text-xs font-bold text-slate-900">{{ c.class_name }}</div>
                  <div class="text-[10px] text-slate-400">Tahun {{ c.grade }}</div>
                </div>
                <button 
                  @click.stop="deleteClass(c.id)" 
                  class="text-slate-300 hover:text-red-600 text-xs font-bold p-1 transition opacity-0 group-hover:opacity-100 ml-3 cursor-pointer"
                  title="删除"
                >
                  ✕
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- 卡片四：MMI 科目目标模板管理与批量导入 -->
    <div class="bg-white rounded-3xl shadow-sm ring-1 ring-slate-900/5 p-8 transition-all duration-300 hover:shadow-md">
      <h2 class="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
        <span class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">📊</span>
        MMI 科目目标 (Sasaran) 批量配置
      </h2>
      <p class="text-slate-500 text-xs mb-6">下载标准模板，填写各年级各科目计划目标课时与基准底线，批量导入系统。</p>

      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200">
        <div>
          <h3 class="text-sm font-bold text-slate-900">导入/导出科目目标</h3>
          <p class="text-slate-500 text-xs mt-1">支持 CSV 模板，上传后自动更新数据库目标配置。</p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <button @click="downloadTemplate" class="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2 cursor-pointer">
            📥 下载模板
          </button>
          
          <label class="relative cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2">
            <span>📂 选择科目文件</span>
            <input type="file" ref="fileInput" accept=".csv" @change="handleFileUpload" class="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
          </label>
        </div>
      </div>
    </div>

    <!-- 卡片五：正式上线数据清理、备份与维护面板 -->
    <div class="bg-white rounded-3xl shadow-sm ring-1 ring-slate-900/5 p-8 transition-all duration-300 hover:shadow-md">
      <h2 class="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
        <span class="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">🛠️</span>
        正式上线数据清理与维护
      </h2>
      <p class="text-slate-500 text-xs mb-6">用于测试结束、正式上线前清理历史测试数据，支持一键备份。</p>
      
      <div class="space-y-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-100 gap-4">
          <div>
            <h3 class="text-sm font-bold text-slate-900">清空所有请假与代课记录</h3>
            <p class="text-slate-500 text-xs mt-1">仅删除请假、代课历史测试数据，保留教师资料与排课表。</p>
          </div>
          <button @click="clearOnlyRecords" :disabled="loading" class="px-5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold text-xs rounded-xl transition shadow-sm border border-amber-200 disabled:opacity-50 shrink-0 cursor-pointer">
            清空请假记录
          </button>
        </div>

        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-100 gap-4">
          <div>
            <h3 class="text-sm font-bold text-slate-900">重置全校课表</h3>
            <p class="text-slate-500 text-xs mt-1">清空全部排课数据，便于批量导入新学年课表（保留教师名单）。</p>
          </div>
          <button @click="clearOnlyTimetable" :disabled="loading" class="px-5 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 font-semibold text-xs rounded-xl transition shadow-sm border border-orange-200 disabled:opacity-50 shrink-0 cursor-pointer">
            清空全校课表
          </button>
        </div>

        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-100 gap-4">
          <div>
            <h3 class="text-sm font-bold text-indigo-900">备份并清空 MMI 干扰历史数据</h3>
            <p class="text-slate-500 text-xs mt-1">自动下载 JSON 备份至本地，再安全清除全部 MMI 干扰日志。</p>
          </div>
          <button @click="backupAndClearMmi" :disabled="loading" class="px-5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-xl transition shadow-sm border border-indigo-200 disabled:opacity-50 shrink-0 cursor-pointer">
            📥 备份并清空 MMI 数据
          </button>
        </div>

        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 class="text-sm font-bold text-red-600">危险操作：初始化系统</h3>
            <p class="text-slate-500 text-xs mt-1">一键清空请假、代课、课表、教师名单，恢复系统至初始空白状态。</p>
          </div>
          <button @click="clearEverything" :disabled="loading" class="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl transition shadow-md disabled:opacity-50 shrink-0 cursor-pointer">
            彻底重置系统
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../services/supabase'
import { useToast } from '../utils/toast'

const toast = useToast()
const config = ref({ daysPerWeek: 5, periodsPerDay: 8 })
const loading = ref(false)
const fileInput = ref(null)
const weekFileInput = ref(null)

// 班级管理状态
const classList = ref([])
const newClassGrade = ref(1)
const newClassName = ref('')

const expandedGrades = ref({ 1: true, 2: true, 3: true, 4: true, 5: true, 6: true })
const allExpanded = computed(() => Object.values(expandedGrades.value).every(v => v))

// 上课周历状态
const allSchoolWeeks = ref([])
const newWeek = ref({ week_number: 1, start_date: '', end_date: '', is_school_week: true })

const toggleGrade = (grade) => {
  expandedGrades.value[grade] = !expandedGrades.value[grade]
}

const toggleAllGrades = () => {
  const target = !allExpanded.value
  Object.keys(expandedGrades.value).forEach(k => {
    expandedGrades.value[k] = target
  })
}

const groupedClasses = computed(() => {
  const groups = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }
  classList.value.forEach(c => {
    const g = c.grade || Number(c.class_name[0]) || 1
    if (groups[g]) {
      groups[g].push(c)
    } else {
      if (!groups['Other']) groups['Other'] = []
      groups['Other'].push(c)
    }
  })
  return groups
})

onMounted(() => {
  const saved = localStorage.getItem('school_config')
  if (saved) {
    config.value = JSON.parse(saved)
  }
  fetchClasses()
  fetchSchoolWeeks()
})

const saveConfig = () => {
  if (config.value.daysPerWeek < 1 || config.value.daysPerWeek > 7) return toast.error("天数必须在1-7之间")
  if (config.value.periodsPerDay < 1 || config.value.periodsPerDay > 15) return toast.error("节次必须在1-15之间")
  
  localStorage.setItem('school_config', JSON.stringify(config.value))
  toast.success("系统配置已保存生效！")
}

const fetchClasses = async () => {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .order('grade', { ascending: true })
    .order('class_name', { ascending: true })
  
  if (data) classList.value = data
  if (error) console.error(error)
}

const fetchSchoolWeeks = async () => {
  const { data, error } = await supabase
    .from('school_weeks')
    .select('*')
    .order('week_number', { ascending: true })
  
  if (data) allSchoolWeeks.value = data
  if (error) console.error(error)
}

const addClass = async () => {
  if (!newClassName.value.trim()) {
    return toast.error("请输入班级名称！")
  }

  try {
    const { error } = await supabase.from('classes').insert({
      grade: newClassGrade.value,
      class_name: newClassName.value.trim().toUpperCase()
    })

    if (error) throw error

    toast.success("班级添加成功！")
    newClassName.value = ''
    fetchClasses()
  } catch (err) {
    toast.error("添加失败（可能班级名称已存在）: " + err.message)
  }
}

const deleteClass = async (id) => {
  try {
    const { error } = await supabase.from('classes').delete().eq('id', id)
    if (error) throw error
    toast.success("班级已删除")
    fetchClasses()
  } catch (err) {
    toast.error("删除失败: " + err.message)
  }
}

const addSchoolWeek = async () => {
  if (!newWeek.value.start_date || !newWeek.value.end_date) {
    return toast.error("请完整填写开始和结束日期！")
  }
  try {
    const { error } = await supabase.from('school_weeks').insert([newWeek.value])
    if (error) throw error
    toast.success("上课周历添加成功！")
    newWeek.value.week_number += 1 
    newWeek.value.start_date = ''
    newWeek.value.end_date = ''
    fetchSchoolWeeks()
  } catch (err) {
    toast.error("添加失败: " + err.message)
  }
}

const deleteSchoolWeek = async (id) => {
  try {
    const { error } = await supabase.from('school_weeks').delete().eq('id', id)
    if (error) throw error
    toast.success("已删除该周记录")
    fetchSchoolWeeks()
  } catch (err) {
    toast.error("删除失败: " + err.message)
  }
}

const downloadWeekTemplate = () => {
  const csvContent = "week_number,start_date,end_date,is_school_week\n" +
                     "1,12/01/2026,16/01/2026,TRUE\n" +
                     "2,19/01/2026,23/01/2026,TRUE\n" +
                     "3,26/01/2026,30/01/2026,FALSE"
  
  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', '学年上课周历_模板.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  toast.success("周历模板下载成功！")
}

const handleWeekFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const text = e.target.result
      const lines = text.split('\n')
      const rows = []

      const parseDate = (dateStr) => {
        dateStr = dateStr.trim()
        if (dateStr.includes('/')) {
          const parts = dateStr.split('/')
          if (parts.length === 3) {
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
          }
        }
        return dateStr
      }

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue
        const cols = line.split(',')
        if (cols.length >= 4) {
          const rawBool = cols[3].trim().toUpperCase()
          rows.push({
            week_number: Number(cols[0].trim()),
            start_date: parseDate(cols[1]),
            end_date: parseDate(cols[2]),
            is_school_week: rawBool === 'TRUE' || rawBool === '1' || rawBool === 'YES'
          })
        }
      }

      if (rows.length === 0) {
        toast.error("文件内容为空或格式错误！")
        return
      }

      const { error } = await supabase.from('school_weeks').insert(rows)
      if (error) throw error

      toast.success(`成功批量导入 ${rows.length} 条周历数据！`)
      if (weekFileInput.value) weekFileInput.value.value = ''
      fetchSchoolWeeks()
    } catch (err) {
      toast.error("导入周历失败: " + err.message)
    }
  }
  reader.readAsText(file)
}

const downloadTemplate = () => {
  const csvContent = "grade,subject_name,planned_periods,kpm_min_hours\n" +
                     "3,BAHASA MELAYU,80,60\n" +
                     "3,MATEMATIK,75,60\n" +
                     "4,SAINS,40,40"
  
  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', '科目目标_Sasaran_模板.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  toast.success("目标模板下载成功！")
}

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const text = e.target.result
      const lines = text.split('\n')
      const rows = []

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue
        const cols = line.split(',')
        if (cols.length >= 4) {
          rows.push({
            grade: Number(cols[0].trim()),
            subject_name: cols[1].trim(),
            planned_periods: Number(cols[2].trim()),
            kpm_min_hours: Number(cols[3].trim())
          })
        }
      }

      if (rows.length === 0) {
        toast.error("文件内容为空或格式错误！")
        return
      }

      const { error } = await supabase.from('subject_targets').insert(rows)
      if (error) throw error

      toast.success(`成功导入 ${rows.length} 条科目目标数据！`)
      if (fileInput.value) fileInput.value.value = ''
    } catch (err) {
      toast.error("导入失败: " + err.message)
    }
  }
  reader.readAsText(file)
}

// 🟢 修复点 1：使用通用语法清空数据表
const clearOnlyRecords = async () => {
  if (!confirm("⚠️ 确定要清空所有的请假与代课记录吗？此操作不可逆！")) return

  loading.value = true
  try {
    const { error: err1 } = await supabase.from('substitute_assignments').delete().not('id', 'is', null)
    if (err1) throw err1

    const { error: err2 } = await supabase.from('leave_requests').delete().not('id', 'is', null)
    if (err2) throw err2

    toast.success("所有请假与代课记录已成功清除！")
  } catch (error) {
    toast.error("清除失败: " + error.message)
  } finally {
    loading.value = false
  }
}

// 🟢 修复点 2：清空课表语法修复
const clearOnlyTimetable = async () => {
  if (!confirm("⚠️ 确定要清空全校课表吗？老师名单会保留。")) return

  loading.value = true
  try {
    const { error } = await supabase.from('timetable').delete().not('id', 'is', null)
    if (error) throw error

    toast.success("全校课表已全部重置！")
  } catch (error) {
    toast.error("清空课表失败: " + error.message)
  } finally {
    loading.value = false
  }
}

// 🟢 修复点 3：MMI 备份与清空语法修复
const backupAndClearMmi = async () => {
  if (!confirm("📥 确定要先备份并清空所有 MMI 教学干扰历史数据吗？")) return

  loading.value = true
  try {
    const { data: mmiData, error: fetchErr } = await supabase.from('mmi_interruptions').select('*')
    if (fetchErr) throw fetchErr

    if (mmiData && mmiData.length > 0) {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mmiData, null, 2))
      const downloadAnchor = document.createElement('a')
      downloadAnchor.setAttribute("href", dataStr)
      downloadAnchor.setAttribute("download", `MMI_Backup_${new Date().toISOString().slice(0, 10)}.json`)
      document.body.appendChild(downloadAnchor)
      downloadAnchor.click()
      downloadAnchor.remove()
    } else {
      toast.success("当前没有 MMI 干扰数据需要备份，即将直接执行清空。")
    }

    const { error: deleteErr } = await supabase.from('mmi_interruptions').delete().not('id', 'is', null)
    if (deleteErr) throw deleteErr

    toast.success("MMI 干扰数据已成功备份并从数据库清空！")
  } catch (error) {
    toast.error("备份或清空 MMI 数据失败: " + error.message)
  } finally {
    loading.value = false
  }
}

// 🟢 修复点 4：初始化系统彻底清理语法修复
const clearEverything = async () => {
  if (!confirm("🚨 警告：这将删除系统中所有的教师、课表、班级和请假数据！确定要让系统彻底恢复出厂设置吗？")) return

  loading.value = true
  try {
    await supabase.from('substitute_assignments').delete().not('id', 'is', null)
    await supabase.from('leave_requests').delete().not('id', 'is', null)
    await supabase.from('timetable').delete().not('id', 'is', null)
    await supabase.from('mmi_interruptions').delete().not('id', 'is', null)
    const { error } = await supabase.from('teachers').delete().not('id', 'is', null)
    if (error) throw error

    toast.success("系统已完全重置为初始状态！")
    fetchClasses()
    fetchSchoolWeeks()
  } catch (error) {
    toast.error("重置失败: " + error.message)
  } finally {
    loading.value = false
  }
}
</script>