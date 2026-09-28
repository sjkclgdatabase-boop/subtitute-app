<template>
  <div class="p-8 max-w-7xl mx-auto min-h-screen space-y-8">
    
    <!-- 头部区域 -->
    <div class="bg-white rounded-3xl p-8 shadow-sm ring-1 ring-slate-900/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div class="space-y-2 max-w-3xl">
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-800 to-violet-800 flex items-center gap-3">
          <GraduationCap class="w-8 h-8 text-indigo-700 shrink-0" />
          MMI 教学干扰事件记录中心
        </h1>
        <p class="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">
          Melindungi Masa Instruksional · 记录教学干扰事件，保障教学时间。
        </p>
      </div>
    </div>

    <!-- 维度：依据班级记录干扰 -->
    <div class="bg-white rounded-3xl p-8 shadow-sm ring-1 ring-slate-900/5 mb-8">
      <h2 class="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
        班级干扰事件录入
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider flex items-center gap-1.5">
            <CalendarDays class="w-4 h-4 text-indigo-600" /> 干扰发生日期:
          </label>
          <input 
            type="date" 
            v-model="classForm.date" 
            class="w-full bg-slate-50 border border-slate-200 px-4 h-11 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle class="w-4 h-4 text-amber-500" /> 干扰类型 (系统将自动打上标签):
          </label>
          
          <div class="flex flex-wrap gap-2 mb-3">
            <label v-for="cat in ['[学术]', '[节庆]', '[讲座]', '[假期]', '[未分类]']" :key="cat" class="cursor-pointer">
              <input type="radio" v-model="classForm.category" :value="cat" class="hidden" />
              <span :class="classForm.category === cat ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'" class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all inline-block">
                {{ cat }}
              </span>
            </label>
          </div>

          <input 
            type="text" 
            v-model="classForm.eventName" 
            placeholder="请填写具体活动名称 (例如：反毒运动、年终考试)..." 
            class="w-full bg-white border border-slate-200 px-4 h-11 rounded-2xl text-xs font-bold text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </div>
      </div>

      <div class="mb-6 bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Target class="w-4 h-4 text-indigo-600" /> 选择受影响范围:
        </label>
        
        <div class="flex flex-wrap gap-4">
          <label class="inline-flex items-center gap-2 cursor-pointer">
            <input type="radio" v-model="classForm.scopeType" value="specific" class="text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
            <span class="text-xs font-bold text-slate-800">1. 指定班级</span>
          </label>
          <label class="inline-flex items-center gap-2 cursor-pointer">
            <input type="radio" v-model="classForm.scopeType" value="grade" class="text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
            <span class="text-xs font-bold text-slate-800">2. 整个年级</span>
          </label>
          <label class="inline-flex items-center gap-2 cursor-pointer">
            <input type="radio" v-model="classForm.scopeType" value="all" class="text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
            <span class="text-xs font-bold text-slate-800">3. 全校所有班级</span>
          </label>
        </div>

        <div v-if="classForm.scopeType === 'specific'" class="space-y-3 pt-2">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2 border-b border-slate-200/80 text-xs gap-2">
            <span class="font-bold text-slate-500">请勾选受影响的班级：</span>
            <div class="flex flex-wrap items-center gap-2">
              <button type="button" @click="selectAllMorningClasses" class="text-sky-600 hover:text-sky-800 font-bold bg-sky-50 px-2.5 py-1 rounded-lg cursor-pointer transition">
                ☀️ 全选上午班
              </button>
              <button type="button" @click="selectAllAfternoonClasses" class="text-amber-600 hover:text-amber-800 font-bold bg-amber-50 px-2.5 py-1 rounded-lg cursor-pointer transition">
                🌙 全选下午班
              </button>
              <span class="text-slate-300">|</span>
              <button type="button" @click="selectAllClasses" class="text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer">
                全选
              </button>
              <span class="text-slate-300">|</span>
              <button type="button" @click="clearAllClasses" class="text-slate-500 hover:text-slate-700 font-bold cursor-pointer">
                清空
              </button>
            </div>
          </div>

          <div v-for="(classes, grade) in groupedClasses" :key="grade" class="flex flex-col sm:flex-row sm:items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div class="w-28 shrink-0 flex items-center justify-between sm:justify-start gap-2">
              <span class="text-xs font-black text-slate-700 uppercase tracking-wider">Tahun {{ grade }}</span>
              <span class="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-extrabold">
                {{ classes.filter(c => classForm.selectedClasses.includes(c)).length }}/{{ classes.length }}
              </span>
            </div>

            <div class="flex flex-wrap gap-2 flex-1">
              <label 
                v-for="c in classes" 
                :key="c" 
                :class="classForm.selectedClasses.includes(c) ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs scale-105' : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30'"
                class="w-16 h-9 border rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-all select-none"
                :title="classSessionMap[c] === 'petang' ? '下午班' : '上午班'"
              >
                <input type="checkbox" :value="c" v-model="classForm.selectedClasses" class="hidden" />
                <span>{{ c }}</span>
                <span class="text-[8px] font-normal opacity-75">
                  {{ classSessionMap[c] === 'petang' ? '🌙' : '☀️' }}
                </span>
              </label>
            </div>
          </div>
        </div>

        <div v-if="classForm.scopeType === 'grade'" class="flex flex-wrap gap-2 pt-2">
          <button 
            v-for="g in [1, 2, 3, 4, 5, 6]" 
            :key="g"
            type="button"
            @click="classForm.selectedGrade = g"
            :class="classForm.selectedGrade === g ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-700 border-slate-200'"
            class="px-4 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Tahun {{ g }} ({{ g }}年级全级)
          </button>
        </div>

        <div v-if="classForm.scopeType === 'all'" class="text-xs text-indigo-700 font-bold pt-2">
          ✅ 影响全校所有一至六年级班级
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider flex items-center gap-1.5">
            <Clock class="w-4 h-4 text-indigo-600" /> 受影响起始节次:
          </label>
          <select v-model="classForm.startPeriod" class="w-full bg-slate-50 border border-slate-200 px-4 h-11 rounded-2xl text-xs font-bold text-slate-800 cursor-pointer">
            <option v-for="p in 11" :key="p" :value="p">第 {{ p }} 节</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider flex items-center gap-1.5">
            <Clock class="w-4 h-4 text-indigo-600" /> 受影响结束节次:
          </label>
          <select v-model="classForm.endPeriod" class="w-full bg-slate-50 border border-slate-200 px-4 h-11 rounded-2xl text-xs font-bold text-slate-800 cursor-pointer">
            <option v-for="p in 11" :key="p" :value="p">第 {{ p }} 节</option>
          </select>
        </div>
      </div>

      <div class="mb-6">
        <label class="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider flex items-center gap-1.5">
          <FileText class="w-4 h-4 text-indigo-600" /> 详细说明与补救措施:
        </label>
        <input 
          v-model="classForm.remarks" 
          type="text" 
          placeholder="示例：大礼堂举办防登革热讲座。" 
          class="w-full bg-slate-50 border border-slate-200 px-4 h-11 rounded-2xl text-xs font-semibold text-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <button 
        @click="submitClassInterruption" 
        class="bg-slate-900 hover:bg-slate-800 text-white px-6 h-11 rounded-2xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-2"
      >
        <Save class="w-4 h-4" /> 提交班级干扰记录
      </button>
    </div>

    <!-- 干扰日志历史记录表格区 -->
    <div class="bg-white rounded-3xl p-8 shadow-sm ring-1 ring-slate-900/5">
      
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4">
        <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
          <History class="w-5 h-5 text-indigo-600" />
          <span>MMI 干扰事件历史记录表</span>
          <span class="text-xs bg-slate-100 px-2.5 py-1 rounded-full text-slate-600 font-semibold">
            共 {{ filteredLogs.length }} 条记录
          </span>
        </h2>

        <button 
          @click="exportLogsToExcel" 
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 h-11 rounded-2xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <FileSpreadsheet class="w-4 h-4" /> 导出 Excel
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-3 mb-6">
        <select v-model="dateRangeFilter" class="bg-slate-50 border border-slate-200 px-3.5 h-11 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer">
          <option value="all">所有时间范围</option>
          <option value="week">📅 本周 (最近 7 天)</option>
          <option value="month">📅 本月 (当前月份)</option>
        </select>

        <select v-model="selectedMonth" class="bg-slate-50 border border-slate-200 px-3.5 h-11 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer">
          <option value="all">🗓️ 所有月份 (全年)</option>
          <option v-for="m in 12" :key="m" :value="String(m)">{{ m }} 月</option>
        </select>

        <div class="relative flex-1 min-w-[200px]">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="搜索班级/原因..." 
            class="w-full bg-slate-50 border border-slate-200 px-4 h-11 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs table-fixed">
          <thead>
            <tr class="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 select-none">
              <th @click="handleSort('interruption_date')" class="py-3 px-4 w-32 cursor-pointer hover:bg-slate-100 transition text-left">
                <div class="flex items-center gap-1">
                  <span>日期</span>
                  <span class="text-[10px] text-indigo-600 font-bold">
                    {{ sortField === 'interruption_date' ? (sortOrder === 'asc' ? '▲' : '▼') : '↕' }}
                  </span>
                </div>
              </th>

              <th @click="handleSort('type')" class="py-3 px-3 w-28 cursor-pointer hover:bg-slate-100 transition text-center">
                <div class="flex items-center justify-center gap-1">
                  <span>事件类型</span>
                  <span class="text-[10px] text-indigo-600 font-bold">
                    {{ sortField === 'type' ? (sortOrder === 'asc' ? '▲' : '▼') : '↕' }}
                  </span>
                </div>
              </th>

              <th @click="handleSort('target_display')" class="py-3 px-4 w-auto cursor-pointer hover:bg-slate-100 transition text-left">
                <div class="flex items-center gap-1">
                  <span>影响对象 / 范围</span>
                  <span class="text-[10px] text-indigo-600 font-bold">
                    {{ sortField === 'target_display' ? (sortOrder === 'asc' ? '▲' : '▼') : '↕' }}
                  </span>
                </div>
              </th>

              <th @click="handleSort('start_period')" class="py-3 px-3 w-32 cursor-pointer hover:bg-slate-100 transition text-center">
                <div class="flex items-center justify-center gap-1">
                  <span>受影响节次</span>
                  <span class="text-[10px] text-indigo-600 font-bold">
                    {{ sortField === 'start_period' ? (sortOrder === 'asc' ? '▲' : '▼') : '↕' }}
                  </span>
                </div>
              </th>

              <th @click="handleSort('reason')" class="py-3 px-3 w-36 cursor-pointer hover:bg-slate-100 transition text-center">
                <div class="flex items-center justify-center gap-1">
                  <span>干扰原因</span>
                  <span class="text-[10px] text-indigo-600 font-bold">
                    {{ sortField === 'reason' ? (sortOrder === 'asc' ? '▲' : '▼') : '↕' }}
                  </span>
                </div>
              </th>

              <th class="py-3 px-3 w-24 text-center">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium text-slate-800">
            <tr v-if="filteredLogs.length === 0">
              <td colspan="6" class="py-12 text-center text-slate-400 font-medium">
                没有找到符合条件的干扰事件记录
              </td>
            </tr>
            <tr v-for="log in filteredLogs" :key="log.id" class="hover:bg-slate-50/50 transition">
              <td class="py-3.5 px-4 font-bold text-slate-900 truncate text-left">{{ log.interruption_date }}</td>
              
              <td class="py-3.5 px-3 text-center truncate">
                <span class="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-bold inline-block">
                  班级干扰
                </span>
              </td>

              <td class="py-3.5 px-4 font-semibold text-slate-800 truncate text-left" :title="formatTargetDisplay(log.target_display)">
                {{ formatTargetDisplay(log.target_display) }}
              </td>

              <td class="py-3.5 px-3 text-center truncate">
                <span class="bg-slate-100 px-2.5 py-1 rounded-lg text-xs text-slate-700 font-bold inline-block">
                  第 {{ log.start_period }} - {{ log.end_period }} 节
                </span>
              </td>

              <td class="py-3.5 px-3 text-center truncate">
                <span v-if="!log.reason || log.reason === '-'">-</span>
                <button 
                  v-else 
                  @click="openDetailModal(log)" 
                  class="text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition inline-flex items-center justify-center gap-1 text-xs mx-auto cursor-pointer"
                >
                  <span>查看详情</span> 
                  <Eye class="w-3.5 h-3.5" />
                </button>
              </td>

              <td class="py-3.5 px-3 text-center truncate">
                <button @click="deleteLog(log)" class="text-xs text-red-600 hover:text-red-800 font-bold px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-xl cursor-pointer transition inline-flex items-center gap-1">
                  <Trash2 class="w-3.5 h-3.5" /> 删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 备注详情弹窗 -->
    <div v-if="showDetailModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl ring-1 ring-slate-900/10 animate-in fade-in zoom-in duration-200">
        <div class="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
          <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>📝 干扰事件详细说明</span>
          </h3>
          <button @click="showDetailModal = false" class="text-slate-400 hover:text-slate-600 font-bold text-sm bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="space-y-3 mb-6 text-xs text-slate-700">
          <div class="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span class="font-bold text-slate-400 block mb-1">📅 发生日期与对象：</span>
            <span class="font-semibold text-slate-900">{{ currentDetailLog?.interruption_date }} | {{ currentDetailLog?.target_display }}</span>
          </div>
          <div class="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span class="font-bold text-slate-400 block mb-1">⚠️ 干扰原因：</span>
            <span class="font-semibold text-slate-900">{{ currentDetailLog?.reason }}</span>
          </div>
          
          <div class="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
            <span class="font-bold text-indigo-900 block mb-1">📄 完整备注与自动同步课程内容：</span>
            
            <div class="text-slate-800 leading-relaxed font-medium whitespace-pre-wrap">
              <span v-if="currentDetailLog?.remarks">{{ currentDetailLog.remarks }}<br/><br/></span>
              
              <span v-if="loadingDetail" class="animate-pulse inline-flex items-center gap-1">
                <svg class="animate-spin h-3 w-3 text-slate-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                正在匹配当日排课表...
              </span>
              <span v-else>{{ currentDetailAffectedClasses || '暂无受影响的排课数据' }}</span>
            </div>
          </div>
        </div>

        <div class="flex justify-end">
          <button @click="showDetailModal = false" class="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-xs font-bold transition cursor-pointer">
            关闭窗口
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onActivated } from 'vue'
import { supabase } from '../services/supabase'
import { useToast } from '../utils/toast'
import { 
  GraduationCap, 
  School, 
  CalendarDays, 
  Clock, 
  Save, 
  FileSpreadsheet, 
  Eye, 
  Trash2, 
  X,
  Target,
  FileText,
  History,
  AlertTriangle
} from 'lucide-vue-next'

const toast = useToast()

const getLocalToday = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const classForm = ref({
  date: getLocalToday(),
  category: '[讲座]', 
  eventName: '',      
  scopeType: 'specific',
  selectedClasses: [],
  selectedGrade: 1,
  startPeriod: 1,
  endPeriod: 4,
  remarks: ''
})

const groupedClasses = ref({})

// 🏫 独立班级上下午属性映射表 (精确匹配 1A, 1B 等具体的 session)
const classSessionMap = ref({})

const selectAllClasses = () => {
  const all = []
  Object.values(groupedClasses.value).forEach(arr => all.push(...arr))
  classForm.value.selectedClasses = all
}

const clearAllClasses = () => {
  classForm.value.selectedClasses = []
}

// ☀️ 全选上午班班级 (精准匹配 Supabase 中的 'pagi')
const selectAllMorningClasses = () => {
  const classesToSelect = []
  Object.values(groupedClasses.value).forEach(classes => {
    classes.forEach(cName => {
      // 适配数据库中的 'pagi'，或者防空默认处理
      const session = classSessionMap.value[cName]
      if (session === 'pagi' || !session) {
        classesToSelect.push(cName)
      }
    })
  })
  classForm.value.selectedClasses = [...new Set([...classForm.value.selectedClasses, ...classesToSelect])]
  toast.success(`已成功勾选所有上午班班级（共 ${classesToSelect.length} 个）！`)
}

// 🌙 全选下午班班级 (精准匹配 Supabase 中的 'petang')
const selectAllAfternoonClasses = () => {
  const classesToSelect = []
  Object.values(groupedClasses.value).forEach(classes => {
    classes.forEach(cName => {
      if (classSessionMap.value[cName] === 'petang') {
        classesToSelect.push(cName)
      }
    })
  })
  if (classesToSelect.length === 0) {
    toast.error("系统中未检测到任何被标记为下午班（petang）的班级！")
    return
  }
  classForm.value.selectedClasses = [...new Set([...classForm.value.selectedClasses, ...classesToSelect])]
  toast.success(`已成功勾选所有下午班班级（共 ${classesToSelect.length} 个）！`)
}

const fetchClasses = async () => {
  // 读取 classes 表中的 class_name, grade 以及 session 字段
  const { data } = await supabase
    .from('classes')
    .select('class_name, grade, session')
    .order('grade', { ascending: true })
    .order('class_name', { ascending: true })
  
  if (data) {
    const groups = {}
    const sessionMap = {}
    
    data.forEach(c => {
      const g = c.grade || c.class_name[0]
      if (!groups[g]) groups[g] = []
      groups[g].push(c.class_name)
      
      // 记录每个班级独立的上下午属性（若未单独设置则默认按 morning 处理）
      sessionMap[c.class_name] = c.session || 'morning'
    })
    
    groupedClasses.value = groups
    classSessionMap.value = sessionMap
  }
}

const interruptionLogs = ref([])

const searchQuery = ref('')
const dateRangeFilter = ref('all')    
const selectedMonth = ref('all')      

const sortField = ref('interruption_date')
const sortOrder = ref('desc')             

const handleSort = (field) => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortOrder.value = 'desc'
  }
}

const showDetailModal = ref(false)
const currentDetailLog = ref(null)
const currentDetailAffectedClasses = ref('')
const loadingDetail = ref(false)

const openDetailModal = async (log) => {
  currentDetailLog.value = log
  showDetailModal.value = true
  currentDetailAffectedClasses.value = ''

  loadingDetail.value = true
  try {
    const logDate = new Date(log.interruption_date)
    const weekdayNum = logDate.getDay() 
    const queryWeekday = weekdayNum === 0 ? 7 : weekdayNum

    const { data: timetables, error } = await supabase
      .from('timetable')
      .select('*')
      .eq('weekday', queryWeekday)

    if (error) throw error

    if (timetables && timetables.length > 0) {
      const startP = Number(log.start_period)
      const endP = Number(log.end_period)
      const targetDisp = log.target_display || ''

      const matched = timetables.filter(t => {
        const itemWeekday = Number(t.weekday)
        const matchWd = itemWeekday === weekdayNum || itemWeekday === (weekdayNum === 0 ? 7 : weekdayNum)
        if (!matchWd) return false

        const p = Number(t.period)
        if (p < startP || p > endP) return false

        if (targetDisp.includes('SEMUA') || targetDisp.includes('ALL') || targetDisp.includes('全校') || targetDisp.includes('WHOLE SCHOOL')) return true

        if (targetDisp.includes('TAHUN') || targetDisp.includes('GRADE') || targetDisp.includes('全年级') || targetDisp.includes('Tahun') || targetDisp.includes('YEAR') || targetDisp.includes('年级')) {
          const match = targetDisp.match(/(?:TAHUN|Grade|Tahun|YEAR|Year)\s*(\d)/i) || targetDisp.match(/(\d)\s*年级/)
          const grade = match ? match[1] : null
          return grade && String(t.class_name).startsWith(grade)
        }

        const cleanTarget = targetDisp.replace(/^(?:KELAS|CLASS|班级)[:：]\s*/i, '').trim()
        const classList = cleanTarget.split(',').map(c => c.trim())
        
        return classList.some(c => 
          t.class_name === c || 
          t.class_name.toLowerCase() === c.toLowerCase() || 
          t.class_name.includes(c) || 
          c.includes(t.class_name)
        )
      })

      if (matched.length > 0) {
        matched.sort((a, b) => Number(a.period) - Number(b.period))
        const periods = [...new Set(matched.map(m => m.period))].sort((a, b) => a - b).join(', ')
        const classes = matched.map(m => `${m.class_name}(${m.subject || m.subject_name})`).join(', ')
        
        currentDetailAffectedClasses.value = `(涉及节次: 第 ${periods} 节 | 课程: ${classes})`
      } else {
        currentDetailAffectedClasses.value = '该时段未排课或无受影响记录'
      }
    }
  } catch (err) {
    console.error("加载详情失败:", err)
    currentDetailAffectedClasses.value = '加载受影响课程失败'
  } finally {
    loadingDetail.value = false
  }
}

const filteredLogs = computed(() => {
  const result = interruptionLogs.value.filter(log => {
    const query = searchQuery.value.toLowerCase().trim()
    const matchesSearch = !query || 
      log.target_display?.toLowerCase().includes(query) ||
      log.reason?.toLowerCase().includes(query) ||
      log.remarks?.toLowerCase().includes(query) ||
      log.interruption_date?.includes(query)

    let matchesDateRange = true
    if (dateRangeFilter.value !== 'all' && log.interruption_date) {
      const logDate = new Date(log.interruption_date)
      const now = new Date()

      if (dateRangeFilter.value === 'week') {
        const weekAgo = new Date()
        weekAgo.setDate(now.getDate() - 7)
        matchesDateRange = logDate >= weekAgo && logDate <= now
      } else if (dateRangeFilter.value === 'month') {
        matchesDateRange = logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear()
      }
    }

    let matchesMonth = true
    if (selectedMonth.value !== 'all' && log.interruption_date) {
      const logDate = new Date(log.interruption_date)
      const logMonth = logDate.getMonth() + 1
      const currentYear = new Date().getFullYear()
      matchesMonth = (logDate.getFullYear() === currentYear) && (logMonth === Number(selectedMonth.value))
    }

    return matchesSearch && matchesDateRange && matchesMonth
  })

  return result.sort((a, b) => {
    let valA = a[sortField.value] || ''
    let valB = b[sortField.value] || ''

    if (sortField.value === 'start_period') {
      valA = Number(valA)
      valB = Number(valB)
    }

    if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
    if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })
})

const submitClassInterruption = async () => {
  if (!classForm.value.eventName.trim()) {
    return toast.error("请填写具体的活动名称！")
  }

  let targetDisplay = ''
  if (classForm.value.scopeType === 'specific') {
    if (classForm.value.selectedClasses.length === 0) return toast.error("请至少选择一个班级！")
    targetDisplay = classForm.value.selectedClasses.join(', ')
  } else if (classForm.value.scopeType === 'grade') {
    targetDisplay = `Tahun ${classForm.value.selectedGrade} (全年级)`
  } else {
    targetDisplay = '全校所有班级'
  }

  let finalCategory = classForm.value.category
  if (finalCategory === '[未分类]') finalCategory = '' 
  
  const finalReason = `${finalCategory} ${classForm.value.eventName.trim()}`.trim().toUpperCase()

  try {
    const { error } = await supabase.from('mmi_interruptions').insert({
      interruption_date: classForm.value.date,
      type: 'class',
      target_display: targetDisplay,
      start_period: classForm.value.startPeriod,
      end_period: classForm.value.endPeriod,
      reason: finalReason,
      remarks: classForm.value.remarks ? classForm.value.remarks.toUpperCase() : ''
    })

    if (error) throw error

    toast.success("班级干扰事件记录成功！")
    fetchLogs()
    classForm.value.eventName = ''
  } catch (err) {
    toast.error("保存失败: " + err.message)
  }
}

const fetchLogs = async () => {
  const { data } = await supabase
    .from('mmi_interruptions')
    .select('*')
    .order('interruption_date', { ascending: false })
  
  interruptionLogs.value = data || []
}

const exportLogsToExcel = () => {
  if (filteredLogs.value.length === 0) {
    return toast.error("当前没有可导出的数据！")
  }

  let csvContent = "\uFEFF日期,事件类型,影响对象,受影响节次,干扰原因,说明备注\n"
  filteredLogs.value.forEach(item => {
    const typeStr = '班级干扰'
    const row = [
      item.interruption_date,
      typeStr,
      `"${(item.target_display || '').replace(/"/g, '""')}"`,
      `"第 ${item.start_period}-${item.end_period} 节"`,
      `"${(item.reason || '').replace(/"/g, '""')}"`,
      `"${(item.remarks || '').replace(/"/g, '""')}"`
    ]
    csvContent += row.join(",") + "\n"
  })

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `MMI_干扰事件历史记录_${getLocalToday()}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  toast.success("导出报表成功！")
}

const formatTargetDisplay = (text) => {
  if (!text) return ''
  return text.replace(/^(KELAS|CLASS|班级)[:：]\s*/i, '').trim()
}

const deleteLog = async (log) => {
  if (!confirm(`确定要删除 ${log.interruption_date} 的这条 MMI 干扰记录吗？关联的代课记录也将同步清除。`)) return

  try {
    const { data: relatedLeaves, error: fetchErr } = await supabase
      .from('leave_requests')
      .select('id')
      .eq('leave_date', log.interruption_date)
      .eq('reason', log.reason)
      .gte('period', log.start_period)
      .lte('period', log.end_period)

    if (fetchErr) throw fetchErr

    const leaveIds = (relatedLeaves || []).map(l => l.id)

    if (leaveIds.length > 0) {
      const { error: subErr } = await supabase
        .from('substitute_assignments')
        .delete()
        .in('leave_request_id', leaveIds)

      if (subErr) throw subErr

      const { error: leaveErr } = await supabase
        .from('leave_requests')
        .delete()
        .in('id', leaveIds)

      if (leaveErr) throw leaveErr
    }

    const { error: mmiErr } = await supabase
      .from('mmi_interruptions')
      .delete()
      .eq('id', log.id)

    if (mmiErr) throw mmiErr

    toast.success("干扰记录及关联的代课排程已成功删除！")
    fetchLogs()
  } catch (err) {
    toast.error("删除失败: " + err.message)
  }
}

onMounted(() => {
  const today = getLocalToday()
  classForm.value.date = today

  fetchLogs()
  fetchClasses()
})

onActivated(() => {
  const today = getLocalToday()
  classForm.value.date = today
})
</script>