<template>
  <div class="p-8 max-w-7xl mx-auto min-h-screen">
    
    <!-- 头部区域 -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-slate-900">
          教师课表调度
        </h1>
        <p class="text-slate-500 text-sm mt-2 font-medium">支持网格快速编辑，可批量导入全校教师课表</p>
      </div>
      
      <!-- 右侧操作区：上传下载 -->
      <div class="flex flex-wrap items-center gap-3">
        <!-- 下载模板按钮 -->
        <button @click="downloadTemplate" class="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-100 transition-all shadow-sm cursor-pointer">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          下载导入模板
        </button>
        
        <!-- 上传CSV按钮 -->
        <label class="cursor-pointer inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 hover:shadow-md transition-all shadow-sm">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
          批量导入课表
          <input type="file" accept=".csv" class="hidden" @change="handleCsvUpload" />
        </label>
      </div>
    </div>

    <!-- 班次切换标签栏 & 教师选择器 -->
    <div class="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-white p-4 rounded-2xl shadow-sm ring-1 ring-slate-900/5 mb-6 gap-4">
      <!-- 切换标签 -->
      <div class="flex bg-slate-100 p-1.5 rounded-xl">
        <button 
          @click="currentSession = 'morning'; selectedTeacherId = ''; currentTimetable = []" 
          :class="currentSession === 'morning' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
          class="flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer"
        >
          ☀️ 上午班
        </button>
        <button 
          @click="currentSession = 'afternoon'; selectedTeacherId = ''; currentTimetable = []" 
          :class="currentSession === 'afternoon' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
          class="flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer"
        >
          🌙 下午班
        </button>
      </div>

      <!-- 教师选择器 -->
      <div class="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
        <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
          👩‍🏫
        </div>
        <select 
          v-model="selectedTeacherId" 
          @change="fetchTeacherTimetable"
          class="bg-transparent border-none text-slate-700 font-semibold focus:ring-0 cursor-pointer pr-6 text-sm w-full sm:w-64"
        >
          <option value="" disabled>选择{{ currentSession === 'morning' ? '上午班' : '下午班' }}教师</option>
          <option v-for="teacher in filteredTeachersList" :key="teacher.id" :value="teacher.id">
            {{ teacher.name }}{{ teacher.subject ? ` (${teacher.subject})` : '' }}
          </option>
        </select>
      </div>
    </div>

    <!-- 提示状态 -->
    <div v-if="!selectedTeacherId" class="bg-white rounded-3xl shadow-sm ring-1 ring-slate-900/5 p-16 text-center flex flex-col items-center justify-center mt-6">
      <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-4xl mb-4 ring-1 ring-slate-100">👆</div>
      <h3 class="text-lg font-bold text-slate-800">请在上方的 {{ currentSession === 'morning' ? '上午班' : '下午班' }} 列表选择一位教师</h3>
      <p class="text-slate-500 mt-2 text-sm">选定后查看、编辑该教师课表</p>
    </div>

    <!-- 可视化二维网格 (选中教师后显示) -->
    <div v-else class="bg-white rounded-3xl shadow-sm ring-1 ring-slate-900/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 mt-6">
      <div class="overflow-x-auto p-6">
        <table class="w-full text-center border-collapse">
          <thead>
            <tr>
              <th class="p-4 text-slate-400 font-medium text-sm w-32 border-b-2 border-slate-100">节次 \ 星期</th>
              <th v-for="day in config.daysPerWeek" :key="day" class="p-4 text-slate-700 font-bold text-sm w-40 border-b-2 border-slate-100">
                星期{{ dayNames[day - 1] }}
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(row, index) in tableRows" :key="index">
              <!-- 正常上课节次行 -->
              <tr v-if="row.type === 'period'" class="group">
                <td class="p-3 text-slate-600 font-bold border-r-2 border-slate-50 bg-slate-50/30 group-hover:bg-slate-50 transition-colors">
                  <div class="text-xs text-indigo-900 font-extrabold">第 {{ row.period }} 节</div>
                  <div class="text-[10px] text-slate-400 font-medium mt-0.5">{{ row.time }}</div>
                </td>
                
                <td v-for="day in config.daysPerWeek" :key="day" class="p-2 border border-slate-50">
                  <div 
                    @click="openEditModal(day, row.period)"
                    class="h-20 w-full rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 border-2 relative"
                    :class="getCell(day, row.period) 
                      ? 'bg-indigo-50 border-indigo-100 hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5' 
                      : 'bg-transparent border-dashed border-slate-200 hover:border-indigo-300 hover:bg-slate-50'"
                  >
                    <template v-if="getCell(day, row.period)">
                      <!-- 合班卡片顶角提示标签 -->
                      <span v-if="getCell(day, row.period).class_name.includes('/')" class="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-violet-100 text-violet-700 rounded text-[9px] font-bold">
                        合班
                      </span>
                      <span class="font-bold text-indigo-900 text-sm">{{ getCell(day, row.period).class_name }}</span>
                      <span class="text-xs text-indigo-500 font-medium mt-1">{{ getCell(day, row.period).subject }}</span>
                    </template>
                    <template v-else>
                      <span class="text-slate-300 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        + 点击排课
                      </span>
                    </template>
                  </div>
                </td>
              </tr>

              <!-- 休息时间插入行 (Rehat) -->
              <tr v-else-if="row.type === 'break'" class="bg-amber-50/75">
                <td class="p-3 text-amber-800 font-bold border-r-2 border-slate-100 bg-amber-100/60 text-xs">
                  ☕ 休息
                </td>
                <td :colspan="config.daysPerWeek" class="p-3 text-center text-amber-900 font-bold text-xs tracking-wider uppercase">
                  {{ row.title }} <span class="ml-2 font-normal text-amber-700">({{ row.time }})</span>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 高级编辑弹窗 -->
    <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" @click="closeModal"></div>
        <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden ring-1 ring-slate-900/10 p-6">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h2 class="text-lg font-bold text-slate-900">编辑排课</h2>
              <p class="text-xs text-slate-500 mt-1 font-medium">星期{{ dayNames[editingData.weekday - 1] }} · 第 {{ editingData.period }} 节 ({{ getPeriodTime(editingData.period) }})</p>
            </div>
            <button @click="closeModal" class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer">×</button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">班级 (合班可用斜杠如: 3A/3B)</label>
              <input v-model="editingData.class_name" type="text" placeholder="例如: 3C 或 3A/3B" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">科目</label>
              <input v-model="editingData.subject" type="text" placeholder="例如: 英文 或 PM" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all">
            </div>
          </div>

          <div class="mt-8 flex gap-3">
            <button v-if="editingData.id" @click="deleteClass" class="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2.5 rounded-xl text-sm transition-colors cursor-pointer">
              清空此节
            </button>
            <button @click="saveClass" class="flex-[2] bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-xl text-sm shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer">
              保存修改
            </button>
          </div>
        </div>
      </div>
    </transition>

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
            <span v-if="uploadProgress.percent < 100">📅</span>
            <span v-else>🎉</span>
          </div>

          <!-- 标题与当前状态文字 -->
          <div>
            <h3 class="text-lg font-extrabold text-slate-900">
              {{ uploadProgress.percent === 100 ? '全校课表导入成功！' : '正在批量导入课表...' }}
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
                class="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-600 rounded-full transition-all duration-300 shadow-sm"
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
import { useToast } from '../utils/toast'
import { parseCSV } from '../utils/importCsv'

const toast = useToast()
const dayNames = ['一', '二', '三', '四', '五', '六', '日']
const config = ref({ daysPerWeek: 5, periodsPerDay: 11 })
const teachersList = ref([])
const currentSession = ref('morning')
const selectedTeacherId = ref('')
const currentTimetable = ref([])
const showModal = ref(false)
const editingData = ref({ id: null, weekday: 1, period: 1, class_name: '', subject: '' })

// 📊 上传百分比进度条状态
const uploadProgress = ref({
  show: false,
  percent: 0,
  statusText: ''
})

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const startProgress = (initialText = '正在读取 CSV 课表模板...') => {
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

const tableRows = computed(() => {
  if (currentSession.value === 'morning') {
    return [
      { type: 'period', period: 1, time: '7.00-7.30' },
      { type: 'period', period: 2, time: '7.30-8.00' },
      { type: 'period', period: 3, time: '8.00-8.30' },
      { type: 'period', period: 4, time: '8.30-9.00' },
      { type: 'period', period: 5, time: '9.00-9.30' },
      { type: 'break', title: 'REHAT / 休息时间', time: '9.30 - 10.00' },
      { type: 'period', period: 6, time: '10.00-10.30' },
      { type: 'period', period: 7, time: '10.30-11.00' },
      { type: 'period', period: 8, time: '11.00-11.30' },
      { type: 'period', period: 9, time: '11.30-12.00' },
      { type: 'period', period: 10, time: '12.00-12.30' },
      { type: 'period', period: 11, time: '12.30-1.00' }
    ]
  } else {
    return [
      { type: 'period', period: 1, time: '1.00-1.30' },
      { type: 'period', period: 2, time: '1.30-2.00' },
      { type: 'period', period: 3, time: '2.00-2.30' },
      { type: 'period', period: 4, time: '2.30-3.00' },
      { type: 'period', period: 5, time: '3.00-3.30' },
      { type: 'break', title: 'REHAT / 休息时间', time: '3.30 - 3.50' },
      { type: 'period', period: 6, time: '3.50-4.20' },
      { type: 'period', period: 7, time: '4.20-4.50' },
      { type: 'period', period: 8, time: '4.50-5.20' },
      { type: 'period', period: 9, time: '5.20-5.50' },
      { type: 'period', period: 10, time: '5.50-6.20' }
    ]
  }
})

const getPeriodTime = (periodNum) => {
  const found = tableRows.value.find(r => r.type === 'period' && r.period === periodNum)
  return found ? found.time : ''
}

const filteredTeachersList = computed(() => {
  const list = teachersList.value.filter(t => (t.session || 'morning') === currentSession.value)
  return [...list].sort((a, b) => {
    let valA = a.name ? a.name.trim().toUpperCase() : ''
    let valB = b.name ? b.name.trim().toUpperCase() : ''
    return valA.localeCompare(valB, 'en', { numeric: true })
  })
})

onMounted(async () => {
  const savedConfig = localStorage.getItem('school_config')
  if (savedConfig) config.value = JSON.parse(savedConfig)

  const { data } = await supabase.from('teachers').select('id, name, subject, session')
  if (data) teachersList.value = data
})

const fetchTeacherTimetable = async () => {
  if (!selectedTeacherId.value) return
  const { data } = await supabase
    .from('timetable')
    .select('*')
    .eq('teacher_id', selectedTeacherId.value)
  if (data) currentTimetable.value = data
}

const getCell = (weekday, period) => {
  return currentTimetable.value.find(c => c.weekday === weekday && c.period === period)
}

const openEditModal = (weekday, period) => {
  const existingClass = getCell(weekday, period)
  if (existingClass) {
    editingData.value = { ...existingClass }
  } else {
    editingData.value = { id: null, weekday, period, class_name: '', subject: '' }
  }
  showModal.value = true
}

const closeModal = () => showModal.value = false

const saveClass = async () => {
  if (!editingData.value.class_name || !editingData.value.subject) return toast.error('班级和科目不能为空')
  const payload = {
    teacher_id: selectedTeacherId.value,
    weekday: editingData.value.weekday,
    period: editingData.value.period,
    class_name: editingData.value.class_name.trim().toUpperCase(),
    subject: editingData.value.subject.trim().toUpperCase()
  }
  const res = editingData.value.id 
    ? await supabase.from('timetable').update(payload).eq('id', editingData.value.id)
    : await supabase.from('timetable').insert(payload)
  
  if (res.error) return toast.error('保存失败: ' + res.error.message)
  toast.success('课表已更新')
  fetchTeacherTimetable()
  closeModal()
}

const deleteClass = async () => {
  const { error } = await supabase.from('timetable').delete().eq('id', editingData.value.id)
  if (error) return toast.error('删除失败: ' + error.message)
  toast.success('已清空该节排课')
  fetchTeacherTimetable()
  closeModal()
}

const downloadTemplate = () => {
  const csvContent = "\uFEFFteacher_name,weekday,period,class_name,subject\n(示例)张三,1,3,3A/3B,PM\n(示例)李四,2,4,4A,BM";
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "全校课表导入模板.csv";
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  toast.success("模板下载成功！");
}

// 📂 集成数字百分比进度条：批量导入课表逻辑
const handleCsvUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  
  startProgress('正在读取课表 CSV 文件...')

  try {
    await sleep(200)
    updateProgress(25, '正在解析与校验课表合法性...')

    const data = await parseCSV(file)
    const filteredData = data.filter(row => row.teacher_name && !row.teacher_name.includes('示例'))
    
    if (filteredData.length === 0) {
      uploadProgress.value.show = false
      throw new Error("没有读取到有效数据，请检查格式。")
    }

    let successCount = 0
    const totalRows = filteredData.length

    await sleep(200)
    updateProgress(40, `读取成功！准备导入 ${totalRows} 条课表数据...`)

    for (let index = 0; index < totalRows; index++) {
      const row = filteredData[index]
      const inputName = row.teacher_name.trim()
      const matchedTeacher = teachersList.value.find(t => t.name.trim() === inputName)
      
      if (!matchedTeacher) {
        uploadProgress.value.show = false
        throw new Error(`第 ${index + 2} 行出错：系统教师库中找不到名为 "${inputName}" 的老师，请先在教师档案中添加！`)
      }

      const weekdayNum = parseInt(row.weekday)
      const periodNum = parseInt(row.period)

      // 1. 删除旧记录 (覆盖模式)
      await supabase
        .from('timetable')
        .delete()
        .eq('teacher_id', matchedTeacher.id)
        .eq('weekday', weekdayNum)
        .eq('period', periodNum)

      // 2. 写入最新记录
      const { error: insertErr } = await supabase.from('timetable').insert({
        teacher_id: matchedTeacher.id,
        weekday: weekdayNum,
        period: periodNum,
        class_name: row.class_name.trim().toUpperCase(),
        subject: row.subject.trim().toUpperCase()
      })

      if (insertErr) throw insertErr
      successCount++

      // 动态推算写入进度 (40% ~ 90%)
      const currentPercent = 40 + Math.floor(((index + 1) / totalRows) * 50)
      updateProgress(currentPercent, `正在同步向数据库写入课表 (${index + 1}/${totalRows})...`)
    }

    await finishProgress(`成功导入并更新 ${successCount} 条课表数据！`)
    toast.success(`成功导入并更新 ${successCount} 条课表数据！`)
    
    if (selectedTeacherId.value) {
      fetchTeacherTimetable()
    }
    
  } catch (err) {
    uploadProgress.value.show = false
    toast.error("导入失败: " + err.message)
  } finally {
    e.target.value = ''
  }
}
</script>