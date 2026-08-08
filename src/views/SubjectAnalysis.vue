<template>
  <div class="p-8 max-w-7xl mx-auto min-h-screen space-y-8">
    
    <!-- 头部区域 -->
    <div class="mb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-800 to-violet-800">
          科目目标与达成率分析中心
        </h1>
        <p class="text-slate-500 text-sm mt-2 font-medium">
          多维度追踪教学目标、MMI 教学干扰与达成情况，支持数据报表、可视化看板及 PDF 报告导出。
        </p>
      </div>

      <!-- 顶部操作栏 -->
      <div class="flex items-center gap-3">
        <button @click="exportPdfReport" class="no-print bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-md flex items-center gap-2 cursor-pointer">
          <span>📥 打印 / 另存为 PDF 报告</span>
        </button>
        <button @click="showManageModal = true" class="no-print bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer">
          ⚙️ 管理目标
        </button>
        <button @click="loadAnalyticsData" :disabled="loading" class="no-print bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-md cursor-pointer">
          {{ loading ? '计算中...' : '🔄 刷新数据' }}
        </button>
      </div>
    </div>

    <!-- 🗂️ 视图切换 Tab -->
    <div class="no-print flex border-b border-slate-200 gap-8">
      <button 
        @click="activeTab = 'table'" 
        class="pb-4 text-sm font-bold transition-all relative flex items-center gap-2 cursor-pointer"
        :class="activeTab === 'table' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-700'"
      >
        <span>📊 详细数据报表</span>
      </button>
      <button 
        @click="activeTab = 'chart'" 
        class="pb-4 text-sm font-bold transition-all relative flex items-center gap-2 cursor-pointer"
        :class="activeTab === 'chart' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-700'"
      >
        <span>📈 可视化图表看板</span>
      </button>
    </div>

    <!-- 🔍 多维度高级筛选面板 -->
    <div class="no-print bg-white p-6 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div>
        <label class="block text-xs font-bold text-slate-500 mb-2">按年级筛选</label>
        <select v-model="filterGrade" @change="onGradeChange" class="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
          <option value="all">全校所有年级</option>
          <option v-for="g in [1,2,3,4,5,6]" :key="g" :value="g">{{ g }} 年级</option>
        </select>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-500 mb-2">按班级筛选</label>
        <select v-model="filterClass" class="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
          <option value="all">该年级所有班级</option>
          <option v-for="c in availableClasses" :key="c.id" :value="c.class_name">{{ c.class_name }}</option>
        </select>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-500 mb-2">按科目筛选</label>
        <select v-model="filterSubject" class="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
          <option value="all">所有科目</option>
          <option v-for="s in uniqueSubjects" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>

      <div>
        <label class="block text-xs font-bold text-indigo-600 mb-2">👨‍🏫 按任课老师筛选</label>
        <select v-model="filterTeacher" class="w-full bg-indigo-50/50 border border-indigo-200 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
          <option value="all">全校所有教师</option>
          <option v-for="tch in allTeachers" :key="tch.id" :value="tch.name">{{ tch.name }}</option>
        </select>
      </div>
    </div>

    <!-- 🎯 核心统计指标卡片容器 -->
    <div id="pdfContentContainer" class="space-y-8 bg-white p-4 rounded-3xl">
      
      <!-- 打印专属标题抬头 -->
      <div class="print-header bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-4 text-center">
        <h2 class="text-xl font-extrabold text-slate-950">学校教学目标与 MMI 干扰评估报告</h2>
        <p class="text-xs text-slate-600 mt-1">
          筛选条件：年级 [{{ filterGrade === 'all' ? '全部' : filterGrade }}] | 班级 [{{ filterClass === 'all' ? '全部' : filterClass }}] | 科目 [{{ filterSubject === 'all' ? '全部' : filterSubject }}] | 老师 [{{ filterTeacher === 'all' ? '全部' : filterTeacher }}]
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 print-summary">
        <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div class="text-xs font-bold text-slate-500 uppercase tracking-wider">筛选结果总数</div>
          <div class="text-3xl font-black text-slate-900 mt-2">{{ analysisSummary.total }}</div>
        </div>
        <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div class="text-xs font-bold text-emerald-600 uppercase tracking-wider">达成目标 (达标)</div>
          <div class="text-3xl font-black text-emerald-700 mt-2">{{ analysisSummary.met }}</div>
        </div>
        <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div class="text-xs font-bold text-red-600 uppercase tracking-wider">⚠️ 未达成 (警告)</div>
          <div class="text-3xl font-black text-red-700 mt-2">{{ analysisSummary.unmet }}</div>
        </div>
      </div>

      <!-- ================= TAB 1: 详细数据报表视图 ================= -->
      <div v-if="activeTab === 'table'" class="bg-white rounded-3xl shadow-sm ring-1 ring-slate-900/5 overflow-hidden">
        <div class="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">细化分析报表 (班级、科目与任课老师对照)</h3>
          <span class="text-[11px] text-slate-500">有效上课周历比例: {{ (progressRatio * 100).toFixed(1) }}%</span>
        </div>

        <div>
          <table class="w-full text-left border-collapse print-table">
            <thead>
              <tr class="bg-slate-100 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-300">
                <th class="py-3 px-4">年级 / 班级</th>
                <th class="py-3 px-4">科目名称</th>
                <th class="py-3 px-4">任课老师</th>
                <th class="py-3 px-4 text-center">学年计划目标</th>
                <th class="py-3 px-4 text-center">理论应到进度</th>
                <th class="py-3 px-4 text-center">受干扰损失</th>
                <th class="py-3 px-4 text-center">实际执行</th>
                <th class="py-3 px-4 text-center">差距</th>
                <th class="py-3 px-4 text-center">状态</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 text-xs font-medium text-slate-800">
              <tr v-if="filteredAnalysisList.length === 0">
                <td colspan="9" class="py-12 text-center text-slate-500">
                  没有找到符合该筛选条件的分析记录，请调整筛选条件。
                </td>
              </tr>
              <tr v-for="(item, idx) in filteredAnalysisList" :key="idx" class="hover:bg-slate-50">
                <td class="py-3 px-4 font-bold text-slate-900">
                  Tahun {{ item.grade }} - {{ item.class_name }}
                </td>
                <td class="py-3 px-4 font-bold text-slate-900">{{ item.subject_name }}</td>
                <td class="py-3 px-4 font-bold text-indigo-900">{{ item.teacher_name || '未指派' }}</td>
                <td class="py-3 px-4 text-center font-bold">{{ item.target }} 节</td>
                <td class="py-3 px-4 text-center font-bold text-indigo-700">{{ item.expected }} 节</td>
                <td class="py-3 px-4 text-center text-amber-700 font-bold">-{{ item.lostCount }} 节</td>
                <td class="py-3 px-4 text-center font-bold text-slate-900">{{ item.actual }} 节</td>
                <td class="py-3 px-4 text-center font-bold" :class="item.gap >= 0 ? 'text-emerald-700' : 'text-red-700'">
                  {{ item.gap >= 0 ? '+' + item.gap : item.gap }} 节
                </td>
                <td class="py-3 px-4 text-center font-bold">
                  {{ item.status }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ================= TAB 2: 📈 视觉图表分析看板 ================= -->
      <div v-if="activeTab === 'chart'" class="space-y-6">
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- 图表 1 -->
          <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div class="flex justify-between items-center">
              <h3 class="text-sm font-bold text-slate-800">🎯 全校科目总体达标健康率</h3>
              <span class="text-xs text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-lg">实时计算</span>
            </div>
            
            <div class="py-4 flex flex-col items-center justify-center space-y-4">
              <div class="relative w-36 h-36 rounded-full flex items-center justify-center border-8 border-slate-100 shadow-inner"
                   :style="{ borderColor: completionRate >= 80 ? '#10b981' : '#f59e0b' }">
                <div class="text-center">
                  <span class="text-3xl font-black text-slate-900">{{ completionRate }}%</span>
                  <div class="text-[10px] text-slate-400 font-bold uppercase mt-1">达成率</div>
                </div>
              </div>
              <p class="text-xs text-slate-500 font-medium">当前筛选条件下，共有 <strong class="text-slate-800">{{ analysisSummary.met }}</strong> 项科目达标，<strong class="text-red-600">{{ analysisSummary.unmet }}</strong> 项未达标。</p>
            </div>
          </div>

          <!-- 图表 2 -->
          <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div class="flex justify-between items-center">
              <h3 class="text-sm font-bold text-slate-800">📊 各年级达标分布概况</h3>
              <span class="text-xs text-slate-400">达标 vs 未达标</span>
            </div>

            <div class="space-y-3 pt-2">
              <div v-for="g in [1,2,3,4,5,6]" :key="g" class="space-y-1">
                <div class="flex justify-between text-xs font-bold">
                  <span class="text-slate-700">Tahun {{ g }} 年级</span>
                  <span class="text-slate-500">达标: {{ getGradeStats(g).met }} / 未达标: {{ getGradeStats(g).unmet }}</span>
                </div>
                <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                  <div class="bg-emerald-500 h-full transition-all duration-500" :style="{ width: getGradeStats(g).total > 0 ? (getGradeStats(g).met / getGradeStats(g).total) * 100 + '%' : '0%' }"></div>
                  <div class="bg-red-400 h-full transition-all duration-500" :style="{ width: getGradeStats(g).total > 0 ? (getGradeStats(g).unmet / getGradeStats(g).total) * 100 + '%' : '0%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 图表 3 -->
        <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="text-sm font-bold text-slate-800">⚠️ MMI 干扰损失课时最多科目排行</h3>
              <p class="text-xs text-slate-400 mt-0.5">直观展示各科目因请假、公务活动损失的教学课时</p>
            </div>
            <span class="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-bold">干扰警示</span>
          </div>

          <div class="space-y-4">
            <div v-if="subjectLossRanking.length === 0" class="text-xs text-slate-400 text-center py-6">
              当前筛选条件下暂无干扰损失记录。
            </div>
            <div v-for="(item, index) in subjectLossRanking.slice(0, 5)" :key="index" class="space-y-1.5">
              <div class="flex justify-between items-center text-xs font-bold">
                <span class="text-slate-800 flex items-center gap-2">
                  <span class="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-black">{{ index + 1 }}</span>
                  {{ item.subject }}
                </span>
                <span class="text-amber-600 font-black">-{{ item.lost }} 节总损失</span>
              </div>
              <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div class="bg-amber-500 h-full rounded-full transition-all duration-500" 
                     :style="{ width: Math.min(100, (item.lost / maxSubjectLoss) * 100) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- 弹窗：管理目标 -->
    <div v-if="showManageModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div class="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center border-b border-slate-100 pb-4">
          <h3 class="text-base font-bold text-slate-800">⚙️ 科目目标在线维护</h3>
          <button @click="showManageModal = false" class="text-slate-400 hover:text-slate-700 font-bold text-sm cursor-pointer">✕ 关闭</button>
        </div>

        <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label class="block text-[11px] font-bold text-slate-600 mb-1">年级</label>
            <select v-model="newTarget.grade" class="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer">
              <option v-for="g in [1,2,3,4,5,6]" :key="g" :value="g">{{ g }} 年级</option>
            </select>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-600 mb-1">科目名称</label>
            <input type="text" v-model="newTarget.subject_name" placeholder="例: MATEMATIK" class="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold" />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-600 mb-1">计划总节数</label>
            <input type="number" v-model.number="newTarget.planned_periods" placeholder="例: 215" class="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold" />
          </div>
          <button @click="addTarget" class="bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-xs font-bold shadow-sm transition cursor-pointer">
            ➕ 新增目标
          </button>
        </div>

        <div class="space-y-3">
          <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider">已设定的科目目标列表</h4>
          <div class="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
            <div v-for="t in allTargets" :key="t.id" class="p-3 flex items-center justify-between bg-white hover:bg-slate-50 transition">
              <div class="flex items-center gap-4 text-xs font-semibold text-slate-700">
                <span class="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-bold">{{ t.grade }}年级</span>
                <span class="text-slate-900 font-bold">{{ t.subject_name }}</span>
                <span class="text-slate-500">目标: <strong>{{ t.planned_periods }}</strong> 节</span>
              </div>
              <button @click="deleteTarget(t.id)" class="text-slate-400 hover:text-red-600 text-xs font-bold px-2 py-1 transition cursor-pointer">
                🗑️ 删除
              </button>
            </div>
          </div>
        </div>

        <div class="flex justify-end pt-2">
          <button @click="loadAnalyticsData(); showManageModal = false" class="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm cursor-pointer">
            完成并刷新报表
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
const loading = ref(false)
const activeTab = ref('table')

const filterGrade = ref('all')
const filterClass = ref('all')
const filterSubject = ref('all')
const filterTeacher = ref('all')

const analysisList = ref([])
const allClasses = ref([])
const allTargets = ref([])
const allSchoolWeeks = ref([])
const allTeachers = ref([])

const showManageModal = ref(false)
const newTarget = ref({ grade: 1, subject_name: '', planned_periods: 215, kpm_min_hours: 180 })

const progressRatio = computed(() => {
  if (!allSchoolWeeks.value || allSchoolWeeks.value.length === 0) return 0.5
  const totalSchoolWeeks = allSchoolWeeks.value.filter(w => w.is_school_week).length
  if (totalSchoolWeeks === 0) return 0.5
  const today = new Date().toISOString().split('T')[0]
  const passedSchoolWeeks = allSchoolWeeks.value.filter(w => {
    return w.is_school_week && w.end_date <= today
  }).length
  const ratio = passedSchoolWeeks / totalSchoolWeeks
  return Math.min(1, Math.max(0, ratio))
})

const standardizeSubjectName = (name) => {
  if (!name) return ''
  const upper = name.trim().toUpperCase()
  
  if (['BI', 'ENGLISH', 'BAHASA INGGERIS'].includes(upper)) return 'BAHASA INGGERIS'
  if (['BM', 'MELAYU', 'BAHASA MELAYU'].includes(upper)) return 'BAHASA MELAYU'
  if (['BC', 'CINA', 'BAHASA CINA', 'CHINESE'].includes(upper)) return 'BAHASA CINA'
  
  if (['MATEMATIK', 'MATH', 'MT'].includes(upper)) return 'MATEMATIK'
  if (['SN', 'SAINS', 'SCIENCE'].includes(upper)) return 'SAINS'
  
  if (['PJ', 'PENDIDIKAN JASMANI'].includes(upper)) return 'PENDIDIKAN JASMANI'
  if (['PM', 'PENDIDIKAN MORAL'].includes(upper)) return 'PENDIDIKAN MORAL'
  if (['PI', 'PENDIDIKAN ISLAM'].includes(upper)) return 'PENDIDIKAN ISLAM'
  if (['PSV', 'PENDIDIKAN SENI VISUAL'].includes(upper)) return 'PENDIDIKAN SENI VISUAL'
  if (['MZ', 'PMUZIK', 'PENDIDIKAN MUZIK'].includes(upper)) return 'PENDIDIKAN MUZIK'
  if (['PK', 'PENDIDIKAN KESIHATAN'].includes(upper)) return 'PENDIDIKAN KESIHATAN'
  if (['SEJARAH', 'SEJ'].includes(upper)) return 'SEJARAH'
  if (['RBT', 'REKA BENTUK DAN TEKNOLOGI'].includes(upper)) return 'REKA BENTUK DAN TEKNOLOGI'
  
  return upper
}

const onGradeChange = () => {
  filterClass.value = 'all'
}

const availableClasses = computed(() => {
  if (filterGrade.value === 'all') return allClasses.value
  return allClasses.value.filter(c => Number(c.grade) === Number(filterGrade.value))
})

const uniqueSubjects = computed(() => {
  const subs = new Set(allTargets.value.map(t => standardizeSubjectName(t.subject_name)))
  return Array.from(subs)
})

const loadAnalyticsData = async () => {
  loading.value = true
  try {
    const { data: targets, error: targetErr } = await supabase.from('subject_targets').select('*').order('grade', { ascending: true })
    if (targetErr) throw targetErr
    allTargets.value = targets || []

    const { data: classes, error: classErr } = await supabase.from('classes').select('*')
    if (classErr) throw classErr
    allClasses.value = classes || []

    const { data: interruptions, error: intErr } = await supabase.from('mmi_interruptions').select('*')
    if (intErr) throw intErr

    const { data: timetables, error: timeErr } = await supabase.from('timetable').select('*')
    if (timeErr) throw timeErr

    const { data: teachers, error: teachErr } = await supabase.from('teachers').select('*')
    if (teachErr) throw teachErr
    allTeachers.value = teachers || []

    const { data: weeks, error: weekErr } = await supabase.from('school_weeks').select('*').order('week_number', { ascending: true })
    if (!weekErr) allSchoolWeeks.value = weeks || []

    const teacherMap = {}
    if (teachers) {
      teachers.forEach(tch => {
        teacherMap[tch.id] = tch
      })
    }

    const enrichedTimetables = (timetables || []).map(item => ({
      ...item,
      teacher_info: teacherMap[item.teacher_id] || {}
    }))

    let results = []
    const currentRatio = progressRatio.value
    
    for (const cls of (classes || [])) {
      const gradeTargets = (targets || []).filter(t => Number(t.grade) === Number(cls.grade))

      for (const t of gradeTargets) {
        const totalTarget = t.planned_periods || 215 
        const expected = Number((totalTarget * currentRatio).toFixed(1))
        const standardizedTargetSubject = standardizeSubjectName(t.subject_name)

        let assignedTeacherName = ''

        // 🚀 核心优化 1：智能支持合班课匹配任课教师（如 3A/3B 也能被 3A 和 3B 匹配到）
        const matchedTimetableEntry = enrichedTimetables.find(item => {
          const itemClass = (item.class_name || '').trim().toUpperCase()
          const clsName = (cls.class_name || '').trim().toUpperCase()
          const itemSubj = standardizeSubjectName(item.teacher_info?.subject_name || item.subject_name || item.subject || '')

          const isClassMatched = itemClass === clsName || itemClass.includes(clsName) || clsName.includes(itemClass)
          return isClassMatched && itemSubj === standardizedTargetSubject
        })

        if (matchedTimetableEntry && matchedTimetableEntry.teacher_info) {
          assignedTeacherName = matchedTimetableEntry.teacher_info.name || ''
        }

        let lostCount = 0
        if (interruptions && interruptions.length > 0) {
          interruptions.forEach(int => {
            const intScope = int.scope ? int.scope.trim() : 'all'
            const intGrade = Number(int.grade)
            const intClass = int.class_name ? int.class_name.trim().toUpperCase() : ''
            const clsName = cls.class_name ? cls.class_name.trim().toUpperCase() : ''
            
            const startP = Number(int.start_period) || 1
            const endP = Number(int.end_period) || 1

            const isClassAffected = 
              intScope === 'all' || 
              (intScope === 'grade' && intGrade === Number(cls.grade)) ||
              (intScope === 'class' && (intClass.includes(clsName) || clsName.includes(intClass)))

            if (isClassAffected) {
              // 🚀 核心优化 2：计算合班受影响课时节数
              const affectedPeriodsInTimetable = enrichedTimetables.filter(item => {
                const itemClass = (item.class_name || '').trim().toUpperCase()
                const itemPeriod = Number(item.period)
                const teacherObj = item.teacher_info || {}
                const itemSubject = standardizeSubjectName(teacherObj.subject_name || item.subject_name || item.subject || '')

                const matchClass = itemClass === clsName || itemClass.includes(clsName) || clsName.includes(itemClass)
                const matchPeriod = itemPeriod >= startP && itemPeriod <= endP
                const matchSubject = itemSubject === standardizedTargetSubject

                return matchClass && matchPeriod && matchSubject
              })

              lostCount += affectedPeriodsInTimetable.length
            } 
          })
        }

        const actual = Math.max(0, Number((expected - lostCount).toFixed(1)))
        const gap = Number((actual - expected).toFixed(1))
        const status = actual >= (expected * 0.8) ? '达标' : '未达标'

        results.push({
          grade: cls.grade,
          class_name: cls.class_name,
          subject_name: t.subject_name,
          teacher_name: assignedTeacherName,
          target: totalTarget,
          expected: expected,
          lostCount: lostCount,
          actual: actual,
          gap: gap,
          status: status
        })
      }
    }

    analysisList.value = results
    toast.success("分析中心数据已刷新！")
  } catch (err) {
    console.error("加载分析数据异常:", err)
    toast.error("加载数据失败: " + err.message)
  } finally {
    loading.value = false
  }
}

const filteredAnalysisList = computed(() => {
  return analysisList.value.filter(item => {
    const matchGrade = filterGrade.value === 'all' || Number(item.grade) === Number(filterGrade.value)
    const matchClass = filterClass.value === 'all' || item.class_name === filterClass.value
    const matchSubject = filterSubject.value === 'all' || standardizeSubjectName(filterSubject.value) === standardizeSubjectName(item.subject_name)
    const matchTeacher = filterTeacher.value === 'all' || (item.teacher_name && item.teacher_name.trim().toUpperCase() === filterTeacher.value.trim().toUpperCase())
    return matchGrade && matchClass && matchSubject && matchTeacher
  })
})

const analysisSummary = computed(() => {
  const total = filteredAnalysisList.value.length
  const met = filteredAnalysisList.value.filter(i => i.status === '达标').length
  const unmet = total - met
  return { total, met, unmet }
})

const completionRate = computed(() => {
  if (analysisSummary.value.total === 0) return 0
  return Math.round((analysisSummary.value.met / analysisSummary.value.total) * 100)
})

const getGradeStats = (g) => {
  const list = filteredAnalysisList.value.filter(i => Number(i.grade) === Number(g))
  const met = list.filter(i => i.status === '达标').length
  const unmet = list.length - met
  return { met, unmet, total: list.length }
}

const subjectLossRanking = computed(() => {
  const map = {}
  filteredAnalysisList.value.forEach(i => {
    if (!map[i.subject_name]) map[i.subject_name] = 0
    map[i.subject_name] += i.lostCount
  })
  return Object.keys(map).map(subj => ({
    subject: subj,
    lost: map[subj]
  })).sort((a, b) => b.lost - a.lost)
})

const maxSubjectLoss = computed(() => {
  if (subjectLossRanking.value.length === 0) return 1
  return Math.max(...subjectLossRanking.value.map(i => i.lost), 1)
})

const exportPdfReport = () => {
  window.print()
}

const addTarget = async () => {
  if (!newTarget.value.subject_name.trim()) return toast.error("请输入科目名称！")
  try {
    const { error } = await supabase.from('subject_targets').insert([{
      grade: newTarget.value.grade,
      subject_name: newTarget.value.subject_name.trim().toUpperCase(),
      planned_periods: newTarget.value.planned_periods,
      kpm_min_hours: newTarget.value.kpm_min_hours
    }])
    if (error) throw error
    toast.success("目标添加成功！")
    newTarget.value.subject_name = ''
    loadAnalyticsData()
  } catch (err) {
    toast.error("添加失败: " + err.message)
  }
}

const deleteTarget = async (id) => {
  try {
    const { error } = await supabase.from('subject_targets').delete().eq('id', id)
    if (error) throw error
    toast.success("目标已删除")
    loadAnalyticsData()
  } catch (err) {
    toast.error("删除失败: " + err.message)
  }
}

onMounted(() => {
  loadAnalyticsData()
})
</script>

<style scoped>
.print-header {
  display: none;
}

@media print {
  @page {
    size: portrait;
    margin: 10mm;
  }
  .no-print {
    display: none !important;
  }
  .print-header {
    display: block !important;
    margin-bottom: 20px;
  }
  body, * {
    font-family: "Microsoft YaHei", "PingFang SC", "Heiti SC", "WenQuanYi Micro Hei", Arial, sans-serif !important;
    background: white !important;
    color: black !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  #pdfContentContainer {
    box-shadow: none !important;
    padding: 0 !important;
  }
  .print-summary {
    display: grid !important;
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 15px !important;
    margin-bottom: 20px;
  }
  .print-summary > div {
    border: 1px solid #94a3b8 !important;
    padding: 15px !important;
    border-radius: 12px !important;
  }
  .print-table {
    width: 100% !important;
    border-collapse: collapse !important;
    font-size: 11px !important;
  }
  .print-table th, .print-table td {
    border: 1px solid #cbd5e1 !important;
    padding: 8px 10px !important;
  }
  .print-table th {
    background-color: #f1f5f9 !important;
    color: #0f172a !important;
  }
}
</style>