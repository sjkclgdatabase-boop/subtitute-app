<template>
  <!-- 🌟 核心：给最外层一个定死的最小宽度 (min-w-[1024px]) -->
  <div class="p-4 sm:p-8 mx-auto min-h-screen space-y-8 min-w-[1024px]">
    
    <!-- Header Section -->
    <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-sm ring-1 ring-slate-900/5 space-y-2">
      <h1 class="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-800 to-violet-800 flex items-center gap-3">
        <CalendarCheck2 class="w-8 h-8 text-indigo-700 shrink-0" />
        教师缺席与代课任务登记
      </h1>
      <p class="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">
        适配双班运行模式，选择班次、教师及请假类型后，点选节次即可自动生成代课任务。
      </p>
    </div>

    <!-- 步骤一：基础信息选择 -->
    <div class="bg-white rounded-3xl shadow-sm ring-1 ring-slate-900/5 p-6 sm:p-8">
      <h2 class="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
        <span class="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">1</span>
        <span>缺席基础信息</span>
      </h2>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        
        <!-- 1. 班次选择 -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">班次选择</label>
          <div class="bg-slate-100 p-1.5 rounded-2xl flex items-center shadow-inner h-14">
            <button 
              @click="currentSession = 'morning'; selectedTeacherId = ''; dailyClasses = []" 
              class="flex-1 h-full rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              :class="currentSession === 'morning' 
                ? 'bg-white text-indigo-600 shadow-sm ring-2 ring-indigo-600' 
                : 'text-slate-500 hover:text-slate-900'"
            >
              <Sun class="w-4 h-4 shrink-0 text-amber-500" /> <span class="truncate">上午班</span>
            </button>
            <button 
              @click="currentSession = 'afternoon'; selectedTeacherId = ''; dailyClasses = []" 
              class="flex-1 h-full rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              :class="currentSession === 'afternoon' 
                ? 'bg-white text-orange-600 shadow-sm ring-2 ring-orange-500' 
                : 'text-slate-500 hover:text-slate-900'"
            >
              <Moon class="w-4 h-4 shrink-0 text-indigo-400" /> <span class="truncate">下午班</span>
            </button>
          </div>
        </div>

        <!-- 2. 教师选择器 -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">缺席/请假教师</label>
          <div class="relative flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 h-14 shadow-sm hover:border-slate-300 transition w-full">
            <div class="w-8 h-8 rounded-xl bg-white flex items-center justify-center mr-3 shrink-0 shadow-xs text-indigo-600">
              <GraduationCap class="w-4 h-4" />
            </div>
            <select 
              v-model="selectedTeacherId" 
              @change="fetchDailyTimetable"
              class="w-full h-full bg-transparent border-none text-slate-800 font-semibold focus:ring-0 cursor-pointer text-xs appearance-none outline-none pr-8 truncate"
            >
              <option value="" disabled>请选择{{ currentSession === 'morning' ? '上午班' : '下午班' }}教师</option>
              <option v-for="teacher in filteredTeachersList" :key="teacher.id" :value="teacher.id">
                {{ teacher.name }}{{ teacher.subject ? ` (${teacher.subject})` : '' }}
              </option>
            </select>
            <div class="absolute right-4 pointer-events-none text-slate-400 shrink-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        <!-- 3. 日期选择 -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">缺席日期</label>
          <div 
            class="relative flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 h-14 shadow-sm hover:border-slate-300 transition w-full cursor-pointer group"
            @click="openDatePicker"
          >
            <div class="w-8 h-8 rounded-xl bg-white flex items-center justify-center mr-3 shrink-0 shadow-xs text-indigo-600 group-hover:scale-105 transition">
              <CalendarDays class="w-4 h-4" />
            </div>
            <input 
              ref="dateInputRef"
              type="date" 
              v-model="leaveDate"
              @change="fetchDailyTimetable"
              class="w-full h-full bg-transparent border-none text-xs focus:outline-none focus:ring-0 font-semibold text-slate-800 cursor-pointer appearance-none outline-none"
            />
          </div>
        </div>

      </div>

      <!-- 任务大类选项卡 -->
      <div class="mt-8">
        <label class="block text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">缺席类型 / 任务性质 (必选)</label>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label v-for="cat in leaveCategories" :key="cat.value" class="cursor-pointer relative">
            <input type="radio" v-model="leaveCategory" :value="cat.value" class="peer sr-only" />
            <div class="p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 hover:bg-slate-100 transition-all peer-checked:border-indigo-600 peer-checked:bg-indigo-50 flex flex-col gap-1.5 shadow-sm">
              <div class="flex items-center gap-2.5">
                <component :is="cat.iconComponent" class="w-5 h-5 text-indigo-600 shrink-0" />
                <span class="text-sm font-bold text-slate-800">{{ cat.label }}</span>
              </div>
              <span class="text-[11px] text-slate-500 font-medium ml-7">{{ cat.desc }}</span>
            </div>
          </label>
        </div>
      </div>

      <!-- 具体原因 -->
      <div class="mt-6">
        <label class="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">具体原因说明 (选填)</label>
        <input 
          type="text" 
          v-model="leaveReason"
          :placeholder="currentPlaceholder"
          class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-semibold text-slate-800 uppercase"
        />
        <p class="text-[10px] text-slate-400 mt-2 ml-1">提交后，报表会自动分类为：<strong class="text-indigo-600">[{{ leaveCategory }}] {{ leaveReason ? leaveReason.toUpperCase() : '未填写' }}</strong></p>
      </div>

    </div>

    <!-- 步骤二：勾选代课节次 -->
    <transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 translate-y-4" enter-to-class="opacity-100 translate-y-0">
      <div v-if="selectedTeacherId && leaveDate" class="bg-white rounded-3xl shadow-sm ring-1 ring-slate-900/5 p-6 sm:p-8">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">2</span>
              确认代课节次与缺席影响
            </h2>
            <p class="text-xs text-slate-500 mt-1 font-medium">若需安排代课请勾选卡片；若内部消化无需代课，可取消全选并纯记录缺席。</p>
          </div>

          <div class="flex flex-wrap items-center gap-3 shrink-0">
            <button @click="selectAll(true)" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer transition shrink-0">
              全选
            </button>
            <button @click="selectAll(false)" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer transition shrink-0">
              取消全选
            </button>
            <span class="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold shrink-0 flex items-center gap-1">
              <CalendarDays class="w-3.5 h-3.5" />
              星期{{ computedWeekdayName }}
            </span>
          </div>
        </div>

        <!-- 课表展示区 -->
        <div v-if="loading" class="py-12 text-center">
          <div class="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p class="text-slate-500 text-xs font-bold mt-4">正在从数据库检索课表...</p>
        </div>

        <!-- 🌟 无课表时的展示 (移除了手动选节次的下拉框，更简洁) -->
        <div v-else-if="dailyClasses.length === 0" class="bg-slate-50 rounded-2xl p-8 border border-slate-100 flex flex-col items-center text-center space-y-4">
          <div class="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <CheckCircle2 class="w-6 h-6" />
          </div>
          <div>
            <p class="text-slate-900 font-bold text-sm">该名教师在这一天没有任何排课</p>
            <p class="text-slate-500 text-xs font-medium mt-1">无需安排代课。您可以直接将此缺席记录同步至报表。</p>
          </div>
          
          <button 
            @click="submitAbsenceOnly" 
            :disabled="isSubmitting"
            class="mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
          >
            <span v-if="!isSubmitting">仅记录缺席 (同步至报表)</span>
            <span v-else>记录中...</span>
          </button>
        </div>

        <!-- 🌟 有课表时的展示 -->
        <div v-else class="space-y-3">
          <!-- 卡片列表 -->
          <div 
            v-for="cls in dailyClasses" 
            :key="cls.period"
            @click="toggleClassSelection(cls)"
            :class="cls.selected 
              ? 'border-indigo-600 bg-indigo-50/40 shadow-sm' 
              : 'border-slate-200 bg-slate-50/50 opacity-60 hover:opacity-100'"
            class="p-4 border-2 rounded-2xl transition-all cursor-pointer flex items-center justify-between select-none gap-4"
          >
            <div class="flex items-center gap-4">
              <input 
                type="checkbox" 
                :checked="cls.selected"
                @click.stop="toggleClassSelection(cls)"
                class="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer shrink-0"
              />

              <div class="w-16 h-14 rounded-2xl bg-white text-indigo-700 flex flex-col items-center justify-center font-bold shadow-sm ring-1 ring-slate-900/5 shrink-0 px-1">
                <span class="text-[9px] text-slate-400 font-bold uppercase">第</span>
                <span class="text-base leading-none">{{ cls.period }}</span>
              </div>

              <div>
                <div class="flex items-center gap-2">
                  <p class="font-bold text-slate-900 text-sm truncate">{{ cls.class_name }}</p>
                  <span v-if="cls.is_combined" class="px-2 py-0.5 bg-violet-100 text-violet-700 rounded text-[10px] font-bold shrink-0">合班</span>
                </div>
                <p class="text-xs text-indigo-600 font-semibold mt-0.5 truncate">{{ cls.subject }}</p>
              </div>
            </div>

            <div class="shrink-0">
              <span 
                :class="cls.selected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'" 
                class="text-xs font-bold px-3 py-1.5 rounded-full transition whitespace-nowrap block"
              >
                {{ cls.selected ? '已选择代课' : '不安排代课' }}
              </span>
            </div>
          </div>

          <!-- 提交按钮区 -->
          <div class="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div class="text-xs text-slate-500 font-bold truncate">
              已选中 <strong class="text-indigo-600 text-sm font-black">{{ selectedClassesCount }}</strong> 节代课任务
            </div>

            <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <!-- 🌟 只有选中数量为 0 时，纯记录按钮才会出现 -->
              <button 
                v-if="selectedClassesCount === 0"
                @click="submitAbsenceOnly" 
                :disabled="isSubmitting"
                class="px-6 py-3 text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-2xl transition-all shadow-sm cursor-pointer w-full sm:w-auto"
              >
                仅记录缺席
              </button>

              <button 
                @click="submitLeaveRequests" 
                :disabled="isSubmitting || selectedClassesCount === 0"
                class="group flex items-center justify-center px-6 py-3 text-xs font-bold text-white bg-slate-900 rounded-2xl hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0 w-full sm:w-auto"
              >
                <span v-if="!isSubmitting" class="truncate">生成代课任务 ({{ selectedClassesCount }})</span>
                <span v-else>正在处理...</span>
                <ArrowRight v-if="!isSubmitting" class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../services/supabase'
import { useRouter } from 'vue-router'
import { useToast } from '../utils/toast'
import { 
  CalendarCheck2, 
  Sun, 
  Moon, 
  GraduationCap, 
  CalendarDays, 
  UserCheck, 
  BriefcaseBusiness, 
  Building2, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-vue-next'

const router = useRouter()
const toast = useToast()

const teachersList = ref([])
const currentSession = ref('morning')
const selectedTeacherId = ref('')
const leaveDate = ref('')
const leaveReason = ref('')
const dateInputRef = ref(null)

// 🌟 辅助函数：允许点击日期区块任意地方唤起日历
const openDatePicker = () => {
  if (dateInputRef.value) {
    if (typeof dateInputRef.value.showPicker === 'function') {
      dateInputRef.value.showPicker()
    } else {
      dateInputRef.value.focus()
    }
  }
}

// 分类数据 (中文版)
const leaveCategory = ref('个人请假')
const leaveCategories = [
  { value: '个人请假', iconComponent: UserCheck, label: '个人请假', desc: '病假、事假、产假等', placeholder: '示例：MC, CRK, 产假等' },
  { value: '离校公干', iconComponent: BriefcaseBusiness, label: '离校公干', desc: '外出开会、课程、带队', placeholder: '示例：PPD会议, 课程, 带队等' },
  { value: '校内任务', iconComponent: Building2, label: '校内任务', desc: '校内讲座、活动、监考等', placeholder: '示例：校内会议, 维持秩序等' }
]

const currentPlaceholder = computed(() => {
  const cat = leaveCategories.find(c => c.value === leaveCategory.value)
  return cat ? cat.placeholder : '请输入具体原因...'
})

const dailyClasses = ref([])
const loading = ref(false)
const isSubmitting = ref(false)

// 用于纯记录时的内部节次变量
const manualStartPeriod = ref(1)
const manualEndPeriod = ref(10)

const dayNames = ['日', '一', '二', '三', '四', '五', '六']

onMounted(async () => {
  const { data } = await supabase.from('teachers').select('id, name, subject, session')
  if (data) {
    teachersList.value = data.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  }
})

const filteredTeachersList = computed(() => {
  return teachersList.value
    .filter(t => (t.session || 'morning') === currentSession.value)
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
})

const computedWeekdayNumber = computed(() => {
  if (!leaveDate.value) return null
  const dateObj = new Date(leaveDate.value)
  let day = dateObj.getDay()
  return day === 0 ? 7 : day
})

const computedWeekdayName = computed(() => {
  if (!leaveDate.value) return ''
  const dateObj = new Date(leaveDate.value)
  return dayNames[dateObj.getDay()]
})

const selectedClassesCount = computed(() => {
  return dailyClasses.value.filter(cls => cls.selected).length
})

const toggleClassSelection = (cls) => {
  cls.selected = !cls.selected
}

const selectAll = (status) => {
  dailyClasses.value.forEach(cls => {
    cls.selected = status
  })
}

const fetchDailyTimetable = async () => {
  if (!selectedTeacherId.value || !leaveDate.value) {
    dailyClasses.value = []
    return
  }

  loading.value = true
  try {
    const { data, error } = await supabase
      .from('timetable')
      .select('*')
      .eq('teacher_id', selectedTeacherId.value)
      .eq('weekday', computedWeekdayNumber.value)
      .order('period', { ascending: true })

    if (error) throw error

    const periodMap = new Map()

    ;(data || []).forEach(cls => {
      if (!periodMap.has(cls.period)) {
        periodMap.set(cls.period, {
          ...cls,
          is_combined: false,
          selected: true
        })
      } else {
        const existing = periodMap.get(cls.period)
        if (!existing.class_name.includes(cls.class_name)) {
          existing.class_name = `${existing.class_name}/${cls.class_name}`
          existing.is_combined = true 
        }
      }
    })

    dailyClasses.value = Array.from(periodMap.values())
    
    // 🌟 在后台悄悄计算出其实和结束节次，无需用户手动干预
    if (dailyClasses.value.length > 0) {
      const sortedPeriods = dailyClasses.value.map(c => Number(c.period)).sort((a, b) => a - b)
      manualStartPeriod.value = sortedPeriods[0]
      manualEndPeriod.value = sortedPeriods[sortedPeriods.length - 1]
    } else {
      manualStartPeriod.value = 1
      manualEndPeriod.value = 10
    }

  } catch (error) {
    toast.error("获取课表失败: " + error.message)
  } finally {
    loading.value = false
  }
}

// 🌟 纯记录缺席逻辑 (无论是无课表，还是取消全选，都跑这个)
const submitAbsenceOnly = async () => {
  isSubmitting.value = true
  try {
    const currentTeacher = teachersList.value.find(t => t.id === selectedTeacherId.value)
    const teacherName = currentTeacher ? currentTeacher.name : '未知教师'

    const rawReason = leaveReason.value.trim()
    const formattedReason = rawReason 
      ? `[${leaveCategory.value}] ${rawReason.toUpperCase()}`
      : `[${leaveCategory.value}] 未填写具体说明`

    // 直接写入 MMI 记录表
    const mmiLogPayload = {
      interruption_date: leaveDate.value,
      type: 'teacher',
      start_period: manualStartPeriod.value,
      end_period: manualEndPeriod.value,
      reason: formattedReason,
      target_display: `教师: ${teacherName}`,
      remarks: '(当日无排课或无需代课)'
    }

    const { error: mmiError } = await supabase.from('mmi_interruptions').insert([mmiLogPayload])
    if (mmiError) throw mmiError

    toast.success("缺勤记录已成功同步至 MMI 报表！")
    router.push('/')
  } catch (error) {
    toast.error("记录失败: " + error.message)
  } finally {
    isSubmitting.value = false
  }
}

// 原有的代课排程与 MMI 同步提交逻辑
const submitLeaveRequests = async () => {
  const selectedList = dailyClasses.value.filter(cls => cls.selected)
  if (selectedList.length === 0) {
    return toast.error("请至少选择一个代课科目！")
  }

  isSubmitting.value = true
  try {
    const currentTeacher = teachersList.value.find(t => t.id === selectedTeacherId.value)
    const teacherName = currentTeacher ? currentTeacher.name : '未知教师'

    const rawReason = leaveReason.value.trim()
    const formattedReason = rawReason 
      ? `[${leaveCategory.value}] ${rawReason.toUpperCase()}`
      : `[${leaveCategory.value}] 未填写具体说明`

    const { data: existingLeaves } = await supabase
      .from('leave_requests')
      .select('period, status')
      .eq('teacher_id', selectedTeacherId.value)
      .eq('leave_date', leaveDate.value)

    const existingPeriodsMap = new Map()
    if (existingLeaves) {
      existingLeaves.forEach(req => {
        existingPeriodsMap.set(Number(req.period), req.status)
      })
    }

    await supabase
      .from('leave_requests')
      .delete()
      .eq('teacher_id', selectedTeacherId.value)
      .eq('leave_date', leaveDate.value)
      .eq('status', 'pending')

    const requests = []
    const periodsForMMI = []

    selectedList.forEach(cls => {
      const p = Number(cls.period)
      
      if (existingPeriodsMap.get(p) === 'assigned') {
        return
      }

      requests.push({
        teacher_id: selectedTeacherId.value,
        leave_date: leaveDate.value,
        weekday: cls.weekday,
        period: cls.period,
        class_name: cls.class_name, 
        subject: cls.subject,
        reason: formattedReason,
        status: 'pending'
      })
      periodsForMMI.push(p)
    })

    if (requests.length === 0) {
      toast.info("所选节次此前均已安排代课，无需重新生成。")
      isSubmitting.value = false
      return
    }

    const { error: leaveError } = await supabase.from('leave_requests').insert(requests)
    if (leaveError) throw leaveError

    if (periodsForMMI.length > 0) {
      periodsForMMI.sort((a, b) => a - b)
      
      const startP = periodsForMMI[0]
      const endP = periodsForMMI.length === 1 ? periodsForMMI[0] : periodsForMMI[periodsForMMI.length - 1]

      const mmiLogPayload = {
        interruption_date: leaveDate.value,
        type: 'teacher',
        start_period: startP,
        end_period: endP,
        reason: formattedReason,
        target_display: `教师: ${teacherName}`,
        remarks: `(涉及节次: 第 ${periodsForMMI.join(', ')} 节 | 科目: ${requests.map(c => `${c.class_name}(${c.subject})`).join(', ')})`
      }

      const { error: mmiError } = await supabase.from('mmi_interruptions').insert([mmiLogPayload])
      if (mmiError) {
        console.error("同步 MMI 记录失败:", mmiError.message)
      }
    }

    toast.success(`成功生成 ${requests.length} 节代课任务！`)
    router.push('/')
  } catch (error) {
    toast.error("生成失败: " + error.message)
  } finally {
    isSubmitting.value = false
  }
}
</script>