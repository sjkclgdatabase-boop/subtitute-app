<template>
  <div class="p-8 max-w-7xl mx-auto min-h-screen">
    
    <!-- 头部区域 -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 class="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-800 to-violet-800">
          代课调度中心
        </h1>
        <p class="text-slate-500 text-sm mt-2 font-medium">实时监控教职工请假与智能代课指派进展</p>
      </div>
      <router-link to="/leave-entry" class="group relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 bg-slate-900 font-display rounded-full hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 hover:-translate-y-0.5">
        <span>录入新请假</span>
        <svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
      </router-link>
    </div>

    <!-- 核心指标统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-900/5 hover:shadow-md transition-all">
        <div class="flex items-center justify-between">
          <p class="text-slate-500 text-sm font-semibold uppercase tracking-wider">待指派任务</p>
          <div class="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center ring-1 ring-amber-500/20">⏳</div>
        </div>
        <p class="text-4xl font-bold text-slate-900 mt-4">{{ pendingCount }}</p>
      </div>
      
      <div class="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-900/5 hover:shadow-md transition-all">
        <div class="flex items-center justify-between">
          <p class="text-slate-500 text-sm font-semibold uppercase tracking-wider">已完成调度</p>
          <div class="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center ring-1 ring-emerald-500/20">✓</div>
        </div>
        <p class="text-4xl font-bold text-slate-900 mt-4">{{ assignedCount }}</p>
      </div>
      
      <div class="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-900/5 hover:shadow-md transition-all">
        <div class="flex items-center justify-between">
          <p class="text-slate-500 text-sm font-semibold uppercase tracking-wider">历史总计</p>
          <div class="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center ring-1 ring-indigo-500/20">📊</div>
        </div>
        <p class="text-4xl font-bold text-slate-900 mt-4">{{ leaveRequests.length }}</p>
      </div>
    </div>

    <!-- 过滤器与视图切换栏 -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 bg-white p-4 rounded-2xl shadow-sm ring-1 ring-slate-900/5">
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex bg-slate-100 p-1 rounded-xl">
          <button 
            @click="viewMode = 'today'"
            :class="viewMode === 'today' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'"
            class="px-4 py-2 rounded-lg text-xs font-bold transition-all"
          >
            📅 只看今天
          </button>
          <button 
            @click="viewMode = 'grouped'"
            :class="viewMode === 'grouped' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'"
            class="px-4 py-2 rounded-lg text-xs font-bold transition-all"
          >
            📂 按日期折叠归类
          </button>
        </div>

        <input 
          v-if="viewMode === 'today'"
          type="date" 
          v-model="targetDate"
          class="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div class="text-xs text-slate-400 font-medium">
        当前显示 <span class="font-bold text-slate-700">{{ displayedRequests.length }}</span> 条请假任务
      </div>
    </div>

    <!-- 数据表格区域 -->
    <div class="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 overflow-hidden">
      
      <!-- 模式一：只看今天 -->
      <div v-if="viewMode === 'today'" class="overflow-x-auto">
        <table class="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr class="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-widest font-semibold select-none">
              <!-- 请假老师表头 -->
              <th class="py-4 pl-6 pr-4 cursor-pointer hover:text-indigo-600 transition" @click="handleSort('teacher')">
                请假老师 <span v-if="sortKey === 'teacher'" class="text-indigo-600 font-bold ml-1">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
              </th>
              <!-- 班级 / 科目表头 -->
              <th class="p-4 cursor-pointer hover:text-indigo-600 transition" @click="handleSort('class')">
                班级 / 科目 <span v-if="sortKey === 'class'" class="text-indigo-600 font-bold ml-1">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
              </th>
              <!-- 节次表头 -->
              <th class="p-4 cursor-pointer hover:text-indigo-600 transition" @click="handleSort('period')">
                节次 <span v-if="sortKey === 'period'" class="text-indigo-600 font-bold ml-1">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
              </th>
              <!-- 状态表头 -->
              <th class="p-4 cursor-pointer hover:text-indigo-600 transition" @click="handleSort('status')">
                状态 <span v-if="sortKey === 'status'" class="text-indigo-600 font-bold ml-1">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
              </th>
              <!-- 代课安排表头 -->
              <th class="p-4 text-left cursor-pointer hover:text-indigo-600 transition" @click="handleSort('substitute')">
                代课安排 <span v-if="sortKey === 'substitute'" class="text-indigo-600 font-bold ml-1">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
              </th>
              <th class="py-4 pr-6 pl-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm">
            <tr v-if="displayedRequests.length === 0">
              <td colspan="6" class="py-12 text-center text-slate-400 font-medium">所选日期 ({{ targetDate }}) 没有任何请假记录，晴空万里！</td>
            </tr>
            <tr v-for="req in displayedRequests" :key="req.id" class="hover:bg-slate-50/50 transition-colors group">
              <td class="py-4 pl-6 pr-4 font-bold text-slate-900">
                {{ teachersMap[req.teacher_id]?.name || '加载中...' }}
              </td>
              <td class="p-4">
                <div class="flex items-center gap-2">
                  <span class="text-slate-900 font-medium">{{ req.class_name }}</span>
                  <span class="text-slate-400">·</span>
                  <span class="text-slate-500">{{ req.subject }}</span>
                </div>
              </td>
              <td class="p-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium text-xs">
                  第 {{ req.period }} 节
                </span>
              </td>
              <td class="p-4">
                <span :class="statusClass(req.status)" class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset">
                  {{ req.status === 'pending' ? '待指派' : '已指派' }}
                </span>
              </td>
              <td class="p-4 text-left">
                <span v-if="req.status === 'assigned'" class="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 inline-block">
                  {{ getSubstituteDisplay(req.id) }}
                </span>
                <span v-else class="text-xs text-slate-400 font-medium">-</span>
              </td>
              <td class="py-4 pr-6 pl-4 text-right">
                <button 
                  v-if="req.status === 'pending'"
                  @click="openRecommendModal(req)"
                  class="inline-flex items-center justify-center px-4 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-full hover:bg-indigo-100 transition-all"
                >
                  ✨ 智能与手动排课
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 模式二：按日期折叠归类 -->
      <div v-else class="p-6 space-y-4">
        <div v-if="Object.keys(groupedRequests).length === 0" class="py-12 text-center text-slate-400 font-medium">
          当前暂无任何请假记录
        </div>

        <div v-for="(requests, date) in groupedRequests" :key="date" class="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <button 
            @click="toggleDateFold(date)"
            class="w-full flex justify-between items-center px-6 py-4 bg-slate-50 hover:bg-slate-100 transition text-left"
          >
            <div class="flex items-center gap-3">
              <span class="font-bold text-slate-900 text-base">📅 {{ date }}</span>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold">
                {{ requests.length }} 节任务
              </span>
            </div>
            <span class="text-slate-400 text-sm font-semibold">
              {{ foldedDates[date] ? '展开 ▼' : '收起 ▲' }}
            </span>
          </button>

          <div v-show="!foldedDates[date]" class="overflow-x-auto bg-white">
            <table class="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr class="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-widest font-semibold select-none">
                  <th class="py-3 pl-6 pr-4 w-48 cursor-pointer hover:text-indigo-600 transition" @click="handleSort('teacher')">
                    请假老师 <span v-if="sortKey === 'teacher'" class="text-indigo-600 font-bold ml-1">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
                  </th>
                  <th class="p-3 cursor-pointer hover:text-indigo-600 transition" @click="handleSort('class')">
                    班级 / 科目 <span v-if="sortKey === 'class'" class="text-indigo-600 font-bold ml-1">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
                  </th>
                  <th class="p-3 cursor-pointer hover:text-indigo-600 transition" @click="handleSort('period')">
                    节次 <span v-if="sortKey === 'period'" class="text-indigo-600 font-bold ml-1">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
                  </th>
                  <th class="p-3 cursor-pointer hover:text-indigo-600 transition" @click="handleSort('status')">
                    状态 <span v-if="sortKey === 'status'" class="text-indigo-600 font-bold ml-1">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
                  </th>
                  <th class="p-3 text-left cursor-pointer hover:text-indigo-600 transition" @click="handleSort('substitute')">
                    代课安排 <span v-if="sortKey === 'substitute'" class="text-indigo-600 font-bold ml-1">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
                  </th>
                  <th class="py-3 pr-6 pl-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-sm">
                <tr v-for="req in requests" :key="req.id" class="hover:bg-slate-50/50 transition-colors group">
                  <td class="py-3 pl-6 pr-4 text-slate-900 font-bold w-48">
                    {{ teachersMap[req.teacher_id]?.name || '加载中...' }}
                  </td>
                  <td class="p-3">
                    <div class="flex items-center gap-2">
                      <span class="text-slate-900 font-medium">{{ req.class_name }}</span>
                      <span class="text-slate-400">·</span>
                      <span class="text-slate-500">{{ req.subject }}</span>
                    </div>
                  </td>
                  <td class="p-3">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium text-xs">
                      第 {{ req.period }} 节
                    </span>
                  </td>
                  <td class="p-3">
                    <span :class="statusClass(req.status)" class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset">
                      {{ req.status === 'pending' ? '待指派' : '已指派' }}
                    </span>
                  </td>
                  <td class="p-3 text-left">
                    <span v-if="req.status === 'assigned'" class="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 inline-block">
                      {{ getSubstituteDisplay(req.id) }}
                    </span>
                    <span v-else class="text-xs text-slate-400 font-medium">-</span>
                  </td>
                  <td class="py-3 pr-6 pl-3 text-right">
                    <button 
                      v-if="req.status === 'pending'"
                      @click="openRecommendModal(req)"
                      class="inline-flex items-center justify-center px-4 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-full hover:bg-indigo-100 transition-all"
                    >
                      ✨ 排课
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>

    <!-- 弹窗 -->
    <transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div class="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" @click="showModal = false"></div>
        <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden ring-1 ring-slate-900/10 max-h-[90vh] flex flex-col">
          
          <div class="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white/50 backdrop-blur-md shrink-0">
            <div>
              <h2 class="text-xl font-bold text-slate-900">代课指派中心</h2>
              <p class="text-sm text-slate-500 mt-1">支持智能推荐排序，或在下方直接手动选择任意同班次老师</p>
            </div>
            <button @click="showModal = false" class="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition">×</button>
          </div>
          
          <div class="p-8 bg-slate-50/50 space-y-6 overflow-y-auto">
            
            <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
              <span class="text-xs font-bold text-slate-700 whitespace-nowrap">📍 地点/特殊备注:</span>
              <input 
                v-model="assignmentRemark" 
                type="text" 
                placeholder="例如: Perpustakaan (若需带去图书馆或合并班级)" 
                class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div class="bg-indigo-50/60 p-5 rounded-2xl border border-indigo-100 shadow-sm">
              <h3 class="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-3 flex items-center gap-2">
                <span>🛠️ 手动直接指派（不通过智能推荐）</span>
              </h3>
              <div class="flex flex-col sm:flex-row items-center gap-3">
                <select 
                  v-model="manualSelectedTeacherId" 
                  class="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="" disabled>-- 请手动选择同班次教师 --</option>
                  <option v-for="t in allSameSessionTeachers" :key="t.id" :value="t.id">
                    {{ t.name }} (科目: {{ t.subject || '无' }})
                  </option>
                </select>
                <button 
                  @click="assignSubstitute(manualSelectedTeacherId)" 
                  :disabled="!manualSelectedTeacherId"
                  class="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all shrink-0"
                >
                  确认手动指派
                </button>
              </div>
            </div>

            <hr class="border-slate-200" />

            <div>
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">✨ 智能推荐候选列表（Top 3）</h3>
              
              <div v-if="loading" class="flex flex-col items-center justify-center py-6 space-y-3">
                <div class="w-6 h-6 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
                <p class="text-xs text-slate-500 font-medium">智能算法计算中...</p>
              </div>
              
              <div v-else-if="recommendations.length === 0" class="bg-white p-4 rounded-2xl border border-slate-200 text-xs text-slate-500 text-center">
                暂无自动推荐人选，请使用上方手动指派。
              </div>

              <div v-else class="space-y-3">
                <div v-for="(teacher, index) in recommendations" :key="teacher.id" class="group flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 hover:shadow-sm transition-all">
                  <div class="flex items-center gap-3 mb-3 sm:mb-0">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-700 font-extrabold flex items-center justify-center text-xs">
                      #{{ index + 1 }}
                    </div>
                    <div>
                      <div class="font-bold text-slate-900 text-sm flex items-center gap-2">
                        {{ teacher.name }} 
                        <span class="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">{{ teacher.subject }}</span>
                      </div>
                      <div class="text-[11px] text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                        <span>得分: <span class="font-bold text-indigo-600">{{ teacher.score }}</span></span>
                        <span>·</span>
                        <span>本身原排: <span class="font-bold text-slate-700">{{ teacher.originalClasses }}节</span></span>
                        <span>·</span>
                        <span>当天已代: <span class="font-bold text-orange-600">{{ teacher.todaySubCount }}节</span></span>
                        <span>·</span>
                        <span>本周代: <span class="font-bold text-slate-700">{{ teacher.currentSubCount }}/{{ teacher.max_substitute_per_week }}</span></span>
                      </div>
                    </div>
                  </div>
                  <button @click="assignSubstitute(teacher.id)" class="bg-slate-900 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all">
                    智能指派
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../services/supabase'
import { recommendSubstitute } from '../utils/algorithm'
import { useToast } from '../utils/toast'

const toast = useToast()
const leaveRequests = ref([])
const substituteAssignments = ref({})
const teachersMap = ref({})

const showModal = ref(false)
const loading = ref(false)
const recommendations = ref([])
const currentRequest = ref(null)
const assignmentRemark = ref('')

const viewMode = ref('today')
const targetDate = ref(new Date().toISOString().split('T')[0])
const foldedDates = ref({})

// 全局多字段排序状态
const sortKey = ref('period') // 默认按节次排序
const sortOrder = ref('asc')  // 'asc' 升序，'desc' 降序

const handleSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

// 统一的排序比对函数
const sortFunction = (a, b) => {
  let valA, valB

  if (sortKey.value === 'teacher') {
    valA = teachersMap.value[a.teacher_id]?.name || ''
    valB = teachersMap.value[b.teacher_id]?.name || ''
  } else if (sortKey.value === 'class') {
    valA = `${a.class_name} ${a.subject}`
    valB = `${b.class_name} ${b.subject}`
  } else if (sortKey.value === 'period') {
    valA = Number(a.period)
    valB = Number(b.period)
  } else if (sortKey.value === 'status') {
    valA = a.status
    valB = b.status
  } else if (sortKey.value === 'substitute') {
    valA = getSubstituteDisplay(a.id)
    valB = getSubstituteDisplay(b.id)
  }

  if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
  if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
  return 0
}

const allSameSessionTeachers = ref([])
const manualSelectedTeacherId = ref('')

const pendingCount = computed(() => leaveRequests.value.filter(r => r.status === 'pending').length)
const assignedCount = computed(() => leaveRequests.value.filter(r => r.status === 'assigned').length)

// 1. “只看今天”模式下的列表（支持多表头排序）
const displayedRequests = computed(() => {
  const filtered = leaveRequests.value.filter(r => r.leave_date === targetDate.value)
  return filtered.sort(sortFunction)
})

// 2. “按日期折叠归类”模式下的分组列表（每组内部支持多表头排序）
const groupedRequests = computed(() => {
  const groups = {}
  leaveRequests.value.forEach(req => {
    if (!groups[req.leave_date]) {
      groups[req.leave_date] = []
    }
    groups[req.leave_date].push(req)
  })

  Object.keys(groups).forEach(date => {
    groups[date].sort(sortFunction)
  })

  return groups
})

const toggleDateFold = (date) => {
  foldedDates.value[date] = !foldedDates.value[date]
}

const fetchRequests = async () => {
  const { data: tData } = await supabase.from('teachers').select('id, name')
  if (tData) {
    tData.forEach(t => {
      teachersMap.value[t.id] = t
    })
  }

  const { data: lData, error } = await supabase
    .from('leave_requests')
    .select('*')
    .order('leave_date', { ascending: false })
  
  if (!error) {
    leaveRequests.value = lData || []

    const leaveIds = leaveRequests.value.map(l => l.id)
    if (leaveIds.length > 0) {
      const { data: sData } = await supabase
        .from('substitute_assignments')
        .select('*')
        .in('leave_request_id', leaveIds)
      
      if (sData) {
        const map = {}
        sData.forEach(sub => {
          map[sub.leave_request_id] = sub
        })
        substituteAssignments.value = map
      }
    }
  }
}

const getSubstituteDisplay = (leaveRequestId) => {
  const sub = substituteAssignments.value[leaveRequestId]
  if (!sub || !sub.sub_teacher_id) return ''
  
  const subTeacher = teachersMap.value[sub.sub_teacher_id]
  const name = subTeacher ? subTeacher.name : '未知老师'

  if (sub.remark) {
    return `${name} (${sub.remark})`
  }
  return name
}

const statusClass = (status) => {
  if (status === 'pending') return 'bg-amber-50 text-amber-700 ring-amber-600/20'
  return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
}

const openRecommendModal = async (req) => {
  currentRequest.value = req
  assignmentRemark.value = ''
  manualSelectedTeacherId.value = ''
  showModal.value = true
  loading.value = true

  try {
    recommendations.value = await recommendSubstitute(req)

    const { data: absentTeacher } = await supabase
      .from('teachers')
      .select('session')
      .eq('id', req.teacher_id)
      .single()
    
    const session = absentTeacher?.session || 'morning'

    const { data: teachersData } = await supabase
      .from('teachers')
      .select('*')
      .eq('is_active', true)
      .eq('session', session)
      .neq('id', req.teacher_id)

    allSameSessionTeachers.value = teachersData || []
  } catch (error) {
    toast.error("加载排课数据失败: " + error.message)
  } finally {
    loading.value = false
  }
}

const assignSubstitute = async (teacherId) => {
  if (!teacherId) return
  try {
    const { error: insertErr } = await supabase.from('substitute_assignments').insert({
      leave_request_id: currentRequest.value.id,
      sub_teacher_id: teacherId,
      remark: assignmentRemark.value ? assignmentRemark.value.trim() : null
    })
    if (insertErr) throw insertErr

    const { error: updateErr } = await supabase.from('leave_requests')
      .update({ status: 'assigned' })
      .eq('id', currentRequest.value.id)
    if (updateErr) throw updateErr

    toast.success("代课指派成功！")
    showModal.value = false
    fetchRequests()
  } catch (error) {
    toast.error("指派失败: " + error.message)
  }
}

onMounted(() => {
  fetchRequests()
})
</script>