<template>
  <div class="p-8 max-w-5xl mx-auto min-h-screen">
    
    <!-- 头部区域 -->
    <div class="mb-10">
      <h1 class="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-800 to-violet-800">
        教师请假登记
      </h1>
      <p class="text-slate-500 text-sm mt-2 font-medium">适配双班运行模式，选定班次与教师后，系统自动调取当日课表，生成代课任务</p>
    </div>

    <!-- 步骤一：基础信息选择 -->
    <div class="bg-white rounded-3xl shadow-sm ring-1 ring-slate-900/5 p-8 mb-8">
      <h2 class="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
        <span class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">1</span>
        请假基础信息
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        
        <!-- 左侧：班次选择 -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">班次选择</label>
          <div class="bg-slate-100 p-1.5 rounded-2xl flex items-center shadow-inner">
            <button 
              @click="currentSession = 'morning'; selectedTeacherId = ''; dailyClasses = []" 
              class="flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              :class="currentSession === 'morning' 
                ? 'bg-white text-indigo-600 shadow-sm ring-2 ring-blue-600' 
                : 'text-slate-500 hover:text-slate-900'"
            >
              <span>☀️</span> 上午班
            </button>
            <button 
              @click="currentSession = 'afternoon'; selectedTeacherId = ''; dailyClasses = []" 
              class="flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              :class="currentSession === 'afternoon' 
                ? 'bg-white text-orange-600 shadow-sm ring-2 ring-orange-500' 
                : 'text-slate-500 hover:text-slate-900'"
            >
              <span>🌙</span> 下午班
            </button>
          </div>
        </div>

        <!-- 右侧：教师选择器 -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">请假教师</label>
          <div class="relative flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm hover:border-slate-300 transition">
            <div class="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-base mr-3 shrink-0">
              👩‍🏫
            </div>
            <select 
              v-model="selectedTeacherId" 
              @change="fetchDailyTimetable"
              class="w-full bg-transparent border-none text-slate-700 font-semibold focus:ring-0 cursor-pointer text-sm appearance-none outline-none pr-8"
            >
              <option value="" disabled>请选择{{ currentSession === 'morning' ? '上午班' : '下午班' }}请假教师</option>
              <option v-for="teacher in filteredTeachersList" :key="teacher.id" :value="teacher.id">
                {{ teacher.name }}{{ teacher.subject ? ` (${teacher.subject})` : '' }}
              </option>
            </select>
            <div class="absolute right-4 pointer-events-none text-slate-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

      </div>

      <!-- 第二行：选择日期与请假原因 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">请假日期（系统自动推算星期）</label>
          <input 
            type="date" 
            v-model="leaveDate"
            @change="fetchDailyTimetable"
            class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium text-slate-700"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">请假原因 (选填)</label>
          <input 
            type="text" 
            v-model="leaveReason"
            placeholder="示例：病假、事假、公务外出参会"
            class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium text-slate-700"
          />
        </div>
      </div>

    </div>

    <!-- 步骤二：自动拉取的当天课表预览 -->
    <transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 translate-y-4" enter-to-class="opacity-100 translate-y-0">
      <div v-if="selectedTeacherId && leaveDate" class="bg-white rounded-3xl shadow-sm ring-1 ring-slate-900/5 p-8">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">2</span>
            系统自动提取当日课表
          </h2>
          <span class="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
            星期{{ computedWeekdayName }}
          </span>
        </div>

        <!-- 课表展示区 -->
        <div v-if="loading" class="py-12 text-center">
          <div class="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p class="text-slate-500 text-sm mt-4">正在从数据库检索课表...</p>
        </div>

        <div v-else-if="dailyClasses.length === 0" class="bg-slate-50 rounded-2xl p-8 text-center border border-slate-100">
          <div class="text-4xl mb-3">🎉</div>
          <p class="text-slate-800 font-bold">该名教师在这一天没有任何排课</p>
          <p class="text-slate-500 text-sm mt-1">无需安排代课，行政可以直接批准请假。</p>
        </div>

        <div v-else class="space-y-3">
          <div v-for="cls in dailyClasses" :key="cls.period" class="flex items-center justify-between p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-white text-indigo-700 flex flex-col items-center justify-center font-bold shadow-sm ring-1 ring-slate-900/5">
                <span class="text-[10px] text-slate-400">第</span>
                <span class="text-lg leading-none">{{ cls.period }}</span>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <p class="font-bold text-slate-900 text-lg">{{ cls.class_name }}</p>
                  <span v-if="cls.is_combined" class="px-2 py-0.5 bg-violet-100 text-violet-700 rounded text-[10px] font-bold">合班</span>
                </div>
                <p class="text-sm text-indigo-600 font-medium">{{ cls.subject }}</p>
              </div>
            </div>
            <div class="text-xs text-slate-400 font-medium px-3 py-1 bg-white rounded-full ring-1 ring-slate-200">
              待生成任务
            </div>
          </div>

          <!-- 提交按钮 -->
          <div class="mt-8 pt-6 border-t border-slate-100 flex justify-end">
            <button 
              @click="submitLeaveRequests" 
              :disabled="isSubmitting"
              class="group flex items-center justify-center px-8 py-3 text-sm font-semibold text-white bg-slate-900 rounded-full hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span v-if="!isSubmitting">生成 {{ dailyClasses.length }} 节代课任务</span>
              <span v-else>正在生成中...</span>
              <svg v-if="!isSubmitting" class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
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

const router = useRouter()
const toast = useToast()

const teachersList = ref([])
const currentSession = ref('morning')
const selectedTeacherId = ref('')
const leaveDate = ref('')
const leaveReason = ref('')

const dailyClasses = ref([])
const loading = ref(false)
const isSubmitting = ref(false)

const dayNames = ['日', '一', '二', '三', '四', '五', '六']

onMounted(async () => {
  const { data } = await supabase.from('teachers').select('id, name, subject, session')
  if (data) teachersList.value = data
})

const filteredTeachersList = computed(() => {
  return teachersList.value.filter(t => (t.session || 'morning') === currentSession.value)
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

// 🚀 核心优化：抓取并自动按【节次 period】合并合班课
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

    // 智能合并算法：如果同一个 period 有多条课表，自动将班级名称用 '/' 连接
    const periodMap = new Map()

    ;(data || []).forEach(cls => {
      if (!periodMap.has(cls.period)) {
        periodMap.set(cls.period, {
          ...cls,
          is_combined: false
        })
      } else {
        const existing = periodMap.get(cls.period)
        // 判断班级名称是否已经包含（防止重复拼接）
        if (!existing.class_name.includes(cls.class_name)) {
          existing.class_name = `${existing.class_name}/${cls.class_name}`
        }
        existing.is_combined = true
      }
    })

    dailyClasses.value = Array.from(periodMap.values())
  } catch (error) {
    toast.error("抓取课表失败: " + error.message)
  } finally {
    loading.value = false
  }
}

// 提交代课任务并同步至 MMI
const submitLeaveRequests = async () => {
  isSubmitting.value = true
  try {
    const currentTeacher = teachersList.value.find(t => t.id === selectedTeacherId.value)
    const teacherName = currentTeacher ? currentTeacher.name : '未知老师'

    await supabase
      .from('leave_requests')
      .delete()
      .eq('teacher_id', selectedTeacherId.value)
      .eq('leave_date', leaveDate.value)
      .eq('status', 'pending')

    const requests = dailyClasses.value.map(cls => ({
      teacher_id: selectedTeacherId.value,
      leave_date: leaveDate.value,
      weekday: cls.weekday,
      period: cls.period,
      class_name: cls.class_name,
      subject: cls.subject,
      reason: leaveReason.value || '未填写',
      status: 'pending'
    }))

    const { error: leaveError } = await supabase.from('leave_requests').insert(requests)
    if (leaveError) throw leaveError

    if (dailyClasses.value.length > 0) {
      const minPeriod = Math.min(...dailyClasses.value.map(c => c.period))
      const maxPeriod = Math.max(...dailyClasses.value.map(c => c.period))

      const mmiLogPayload = {
        interruption_date: leaveDate.value,
        type: 'teacher',
        start_period: minPeriod,
        end_period: maxPeriod,
        reason: `教师请假: ${leaveReason.value || '未填写'}`,
        target_display: `教师: ${teacherName}`,
        remarks: `自动同步自请假录入 (涉及节次: ${dailyClasses.value.map(c => `${c.class_name}(${c.subject})`).join(', ')})`
      }

      const { error: mmiError } = await supabase.from('mmi_interruptions').insert([mmiLogPayload])
      if (mmiError) {
        console.error("同步 MMI 历史记录失败:", mmiError.message)
      }
    }

    toast.success(`成功生成 ${requests.length} 节代课任务，并已写入 MMI 干扰历史！`)
    router.push('/')
  } catch (error) {
    toast.error("生成失败: " + error.message)
  } finally {
    isSubmitting.value = false
  }
}
</script>