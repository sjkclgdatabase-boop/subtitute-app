<template>
  <div class="p-8 max-w-7xl mx-auto min-h-screen space-y-8">
    
    <!-- 🟢 头部区域：与 Teachers.vue 完全一致的卡片风格、排版规范与渐变大标题 -->
    <div class="bg-white rounded-3xl p-8 shadow-sm ring-1 ring-slate-900/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 print:hidden">
      <div class="space-y-2 max-w-3xl">
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-800 to-violet-800">
          班级课表预览
        </h1>
        <p class="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">
          支持智能合班识别、同科目多老师合并显示、分班上下分格，以及连堂课自动合并。
        </p>
      </div>

      <!-- 右侧操作区：打印按钮 -->
      <div class="flex flex-col sm:flex-row items-center gap-3 shrink-0">
        <button 
          @click="printTimetable"
          :disabled="!selectedClass || isLoading"
          class="w-full sm:w-auto whitespace-nowrap inline-flex items-center justify-center px-6 h-11 text-xs font-bold text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50 cursor-pointer"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
          打印课表
        </button>
      </div>
    </div>

    <!-- 🟢 顶部操作栏：与 Teachers.vue 一致的双班制胶囊切换器与班级选择卡片 -->
    <div class="bg-white p-6 rounded-3xl shadow-sm ring-1 ring-slate-900/5 flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
      <!-- 切换上下午班胶囊切换器 -->
      <div class="bg-slate-100 p-1.5 rounded-2xl flex items-center shadow-inner w-full md:w-auto">
        <button 
          @click="selectedSession = 'pagi'; selectedClass = ''; gridData = []" 
          :class="selectedSession === 'pagi' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'"
          class="flex-1 sm:flex-none py-2.5 px-6 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>☀️</span> 上午班
        </button>
        <button 
          @click="selectedSession = 'petang'; selectedClass = ''; gridData = []" 
          :class="selectedSession === 'petang' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'"
          class="flex-1 sm:flex-none py-2.5 px-6 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>🌙</span> 下午班
        </button>
      </div>

      <!-- 班级选择器 -->
      <div class="relative flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 h-11 shrink-0 w-full md:w-[320px] shadow-sm hover:border-slate-300 transition overflow-hidden">
        <div class="w-7 h-7 rounded-xl bg-white flex items-center justify-center text-base mr-3 shrink-0 shadow-xs">
          🏫
        </div>
        <select 
          v-model="selectedClass" 
          @change="fetchTimetable"
          class="w-full bg-transparent border-none text-slate-800 font-bold focus:ring-0 cursor-pointer text-xs appearance-none outline-none pr-8 truncate"
        >
          <option value="" disabled>-- 请选择班级 --</option>
          <option v-for="c in filteredClassList" :key="c.id" :value="c.class_name">
            {{ c.class_name }}
          </option>
        </select>
        <div class="absolute right-3 pointer-events-none text-slate-500 bg-slate-50 pl-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
    </div>

    <!-- 未选择班级时的状态提示 -->
    <div v-if="!selectedClass && !isLoading" class="bg-white rounded-3xl shadow-sm ring-1 ring-slate-900/5 p-16 text-center flex flex-col items-center justify-center print:hidden">
      <div class="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl mb-4 ring-1 ring-slate-100 shadow-inner">👆</div>
      <h3 class="text-base font-bold text-slate-900">请在上方选择一个班级</h3>
      <p class="text-slate-500 mt-1 text-xs font-medium">选择后即可在此查看和打印班级课表</p>
    </div>

    <!-- 🟢 A4 课表渲染区 (纯白无色差、连贯无断开、顶部适当留白) -->
    <div v-if="selectedClass" class="bg-white p-4 sm:p-8 rounded-3xl shadow-sm ring-1 ring-slate-200 overflow-x-auto print:overflow-visible print:border-none print:shadow-none print:p-0 print:m-0 print-safe-font print:pt-6 print:ring-0 print:rounded-none">
      
      <div class="min-w-[1050px] print:min-w-0 print:w-full mx-auto bg-white text-black relative space-y-3">
        
        <!-- 表头 (双语标准格式) -->
        <div class="flex items-center justify-between border-b-[3px] border-black pb-3 bg-white">
          <div class="w-20 h-20 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center">
            <img :src="schoolSettings.logo_url || '/logo.png'" alt="Logo" class="max-w-full max-h-full object-contain" />
          </div>

          <div class="flex-1 text-center flex flex-col justify-center px-4">
            <h2 class="text-xl sm:text-2xl font-black tracking-widest text-black">
                {{ schoolSettings.school_name || 'SJK (C) LADANG GRISEK' }}
            </h2>
            <h3 class="text-lg sm:text-xl font-black mt-1 text-black">{{ currentYearChinese }} {{ selectedSession === 'pagi' ? '上午班' : '下午班' }}班级课程时间表</h3>
            <h3 class="text-lg sm:text-xl font-black uppercase text-black">JADUAL WAKTU KELAS SESI {{ selectedSession === 'pagi' ? 'PAGI' : 'PETANG' }} TAHUN {{ currentYearNum }}</h3>
          </div>

          <div class="shrink-0 flex flex-col items-center justify-center mr-2 sm:mr-4">
            <div class="w-16 h-16 sm:w-20 sm:h-20 border-[3px] border-black rounded-[40%] flex items-center justify-center text-2xl sm:text-3xl font-black text-black">
              {{ selectedClass }}
            </div>
          </div>
        </div>

        <!-- 课表 Table (纯白底色，仅 REHAT 灰底) -->
        <table class="w-full border-collapse border-[2px] border-black text-center table-fixed print:text-[11px] bg-white">
          <thead>
            <tr>
              <th class="border border-black w-16 sm:w-24 py-1 bg-white"></th>
              <!-- 第 1-5 节 -->
              <th v-for="p in 5" :key="p" class="border border-black py-1 bg-white">
                <div class="text-xs sm:text-sm font-bold text-black">{{ p }}</div>
                <div class="text-[8px] sm:text-[10px] font-normal text-black">{{ currentTimeSlots[p-1] }}</div>
              </th>
              <!-- REHAT (保持灰底) -->
              <th class="border border-black w-8 sm:w-12 py-1 bg-slate-100 print-bg-gray">
                <div class="text-xs sm:text-sm font-bold text-black">R</div>
                <div class="text-[8px] sm:text-[10px] font-normal tracking-tighter text-black">{{ currentRehatTime }}</div>
              </th>
              <!-- 动态渲染 REHAT 之后的节数 -->
              <th v-for="p in (totalPeriods - 5)" :key="p+5" class="border border-black py-1 bg-white">
                <div class="text-xs sm:text-sm font-bold text-black">{{ p + 5 }}</div>
                <div class="text-[8px] sm:text-[10px] font-normal text-black">{{ currentTimeSlots[p+4] }}</div>
              </th>
            </tr>
          </thead>
          
          <tbody>
            <tr v-for="(dayData, dIndex) in gridData" :key="dayData.day">
              <!-- 星期 (纯白) -->
              <td class="border border-black font-bold text-sm sm:text-lg h-16 sm:h-20 text-black bg-white">
                {{ dayData.day }}
              </td>

              <template v-for="(cell, cIndex) in dayData.cells" :key="cIndex">
                
                <!-- REHAT 字母 (保持灰底) -->
                <td v-if="cIndex === 5" class="border border-black font-black text-sm sm:text-lg bg-slate-100 text-blue-900 w-8 sm:w-12 print-bg-gray">
                  {{ rehatLetters[dIndex] }}
                </td>

                <!-- 正常格子 (纯白底色) -->
                <td 
                    v-if="!cell.skip" 
                    :colspan="cell.colspan"
                    class="border border-black relative h-16 sm:h-20 p-0 overflow-hidden bg-white"
                    >
                    <!-- 空格子 -->
                    <div v-if="cell.lessons.length === 0" class="w-full h-full flex items-center justify-center text-slate-300 text-xs bg-white">
                        
                    </div>

                    <!-- 有课：自动上下分格 -->
                    <div v-else class="w-full h-full flex flex-col bg-white">
                        <div 
                        v-for="(lesson, lIndex) in cell.lessons" 
                        :key="lIndex" 
                        class="flex-1 flex flex-col justify-center items-center relative py-1 bg-white"
                        :class="{ 'border-t-[1px] border-black': lIndex > 0 }" 
                        >
                        <!-- 教师代号 -->
                        <div class="absolute top-0.5 left-1 text-[8px] sm:text-[9px] text-slate-600 font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[90%] text-left">
                            {{ lesson.teacherName }}
                        </div>
                        
                        <!-- 纯科目居中显示 -->
                        <div class="text-sm sm:text-base font-extrabold tracking-wide text-black leading-tight mt-2">
                            {{ lesson.subject }}
                        </div>
                        </div>
                    </div>
                </td>
              </template>
            </tr>
          </tbody>
        </table>

      </div>
    </div>

    <!-- 加载中提示 -->
    <div v-if="isLoading" class="mt-12 text-center text-indigo-500 font-bold print:hidden">
      正在分析合班与分格数据，请稍候...
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../services/supabase'

const isLoading = ref(false)
const classList = ref([])
const selectedClass = ref('')
const selectedSession = ref('pagi')
const schoolSettings = ref({})
const teachersMap = ref({})

// 动态年份处理
const currentYearNum = new Date().getFullYear()
const convertYearToChinese = (year) => {
  const chineseDigits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
  return String(year)
    .split('')
    .map(char => chineseDigits[Number(char)] || char)
    .join('') + '年'
}
const currentYearChinese = computed(() => convertYearToChinese(currentYearNum))

// 过滤后的班级列表
const filteredClassList = computed(() => {
  return classList.value.filter(c => {
    if (c.session) {
      return String(c.session).toLowerCase() === selectedSession.value.toLowerCase()
    }
    const grade = Number(c.grade)
    if (selectedSession.value === 'pagi') {
      return grade >= 3
    } else {
      return grade <= 2
    }
  })
})

const handleSessionChange = () => {
  selectedClass.value = ''
  gridData.value = []
}

const timeSlotsPagi = [
  '7:00-7:30', '7:30-8:00', '8:00-8:30', '8:30-9:00', '9:00-9:30',
  '10:00-10:30', '10:30-11:00', '11:00-11:30', '11:30-12:00', '12:00-12:30', '12:30-13:00'
]

const timeSlotsPetang = [
  '1:00-1:30', '1:30-2:00', '2:00-2:30', '2:30-3:00', '3:00-3:30',
  '3:50-4:20', '4:20-4:50', '4:50-5:20', '5:20-5:50', '5:50-6:20'
]

const totalPeriods = computed(() => selectedSession.value === 'pagi' ? 11 : 10)

const currentTimeSlots = computed(() => selectedSession.value === 'pagi' ? timeSlotsPagi : timeSlotsPetang)
const currentRehatTime = computed(() => selectedSession.value === 'pagi' ? '9:30-10:00' : '3:30-3:50')

const rehatLetters = ['R', 'E', 'H', 'A', 'T']
const daysOrder = ['Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat']

const dayDictionary = {
  'isnin': ['isnin', 'monday', 'mon', '1', '星期一', '一'],
  'selasa': ['selasa', 'tuesday', 'tue', '2', '星期二', '二'],
  'rabu': ['rabu', 'wednesday', 'wed', '3', '星期三', '三'],
  'khamis': ['khamis', 'thursday', 'thu', '4', '星期四', '四'],
  'jumaat': ['jumaat', 'friday', 'fri', '5', '星期五', '五']
}

const gridData = ref([])

onMounted(async () => {
  await fetchInitialData()
})

const fetchInitialData = async () => {
  const { data: settingsData } = await supabase.from('school_settings').select('*').eq('id', 1).single()
  if (settingsData) schoolSettings.value = settingsData

  const { data: classesData } = await supabase.from('classes').select('*').order('grade').order('class_name')
  if (classesData) classList.value = classesData

  const { data: teachersData } = await supabase.from('teachers').select('id, name, short_name')
  if (teachersData) {
    teachersData.forEach(t => {
      teachersMap.value[t.id] = t.short_name || t.name
    })
  }
}

const fetchTimetable = async () => {
  if (!selectedClass.value) {
    gridData.value = []
    return
  }

  isLoading.value = true
  try {
    const selectedClassObj = classList.value.find(c => c.class_name === selectedClass.value)
    const classId = selectedClassObj ? selectedClassObj.id : null

    let allTtData = []
    let fetchMore = true
    let from = 0
    const step = 1000

    while (fetchMore) {
      const { data, error } = await supabase
        .from('timetable')
        .select('*')
        .range(from, from + step - 1)
      
      if (error) throw error
      
      if (data && data.length > 0) {
        allTtData.push(...data)
        from += step
        if (data.length < step) {
          fetchMore = false
        }
      } else {
        fetchMore = false
      }
    }

    const targetClassName = String(selectedClass.value).toUpperCase().trim()
    
    const ttData = allTtData.filter(tt => {
      const cName = String(tt.class_name || '').toUpperCase()
      const isNameMatch = cName.includes(targetClassName)
      const isIdMatch = classId && tt.class_id === classId
      return isNameMatch || isIdMatch
    })

    gridData.value = generateMatrix(ttData, totalPeriods.value)
  } catch (error) {
    console.error("加载课表失败:", error)
  } finally {
    isLoading.value = false
  }
}

const generateMatrix = (data, periodsCount) => {
  const result = []

  daysOrder.forEach(day => {
    const row = []
    for (let p = 1; p <= periodsCount; p++) {
      
      const rawLessons = data.filter(item => {
        const dbDay = String(item.weekday || item.day_of_week || '').trim().toLowerCase()
        const validDays = dayDictionary[day.toLowerCase()] || []
        const isDayMatch = validDays.includes(dbDay)
        
        const periodStr = String(item.period || item.period_number || '')
        let dbPeriods = []
        
        const matches = periodStr.match(/\d+/g)
        if (matches) {
          if (matches.length === 2 && /[-~至到]/.test(periodStr)) {
            const start = parseInt(matches[0], 10)
            const end = parseInt(matches[1], 10)
            for(let k = start; k <= end; k++) dbPeriods.push(k)
          } else {
            dbPeriods = matches.map(Number)
          }
        }
        
        return isDayMatch && dbPeriods.includes(p)
      })
      
      const subjectMap = {}
      rawLessons.forEach(l => {
        const subj = String(l.subject || l.subject_name || '').trim()
        const tName = String(teachersMap.value[l.teacher_id] || l.teacher_id || '').trim()
        
        if (subj && subj !== 'undefined' && subj !== 'null') {
          if (!subjectMap[subj]) {
            subjectMap[subj] = { subject: subj, teachers: new Set(tName ? [tName] : []) }
          } else {
            if (tName) subjectMap[subj].teachers.add(tName)
          }
        }
      })
      
      const mergedLessons = Object.values(subjectMap).map(item => ({
        subject: item.subject,
        teacherName: Array.from(item.teachers).sort().join(' / ')
      }))
      
      mergedLessons.sort((a, b) => a.subject.localeCompare(b.subject))
      
      row.push({
        period: p,
        lessons: mergedLessons,
        colspan: 1,  
        skip: false  
      })
    }

    for (let i = 0; i < row.length; i++) {
      if (row[i].skip) continue;
      
      const currentLessons = row[i].lessons;
      
      if (currentLessons.length > 0) {
        let span = 1;
        
        for (let j = i + 1; j < row.length; j++) {
           if (i < 5 && j >= 5) break;

           const nextLessons = row[j].lessons;
           
           if (currentLessons.length === nextLessons.length) {
              const allMatch = currentLessons.every((cL, idx) => {
                 const nL = nextLessons[idx];
                 return cL.subject === nL.subject; 
              });

              if (allMatch) {
                 span++;
                 row[j].skip = true;
              } else {
                 break;
              }
           } else {
              break;
           }
        }
        row[i].colspan = span;
      }
    }
    
    result.push({ day, cells: row })
  })

  return result
}

const printTimetable = () => {
  window.print()
}
</script>

<style>
.print-safe-font {
  font-family: 'Times New Roman', Times, 'SimSun', '宋体', serif !important;
}

.text-black {
  color: #000000 !important;
}

.border-black {
  border-color: #000000 !important;
}

@media print {
  @page {
    size: A4 landscape;
    margin: 8mm;
  }
  
  body, html {
    background-color: white !important;
    width: 100% !important;
    height: 100% !important;
  }
  
  table {
    page-break-inside: avoid;
    width: 100% !important;
  }

  .print-bg-gray {
    background-color: #f1f5f9 !important;
  }

  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color: #000000 !important; 
  }
}
</style>