<template>
  <div class="p-8 max-w-7xl mx-auto min-h-screen space-y-8">
    
    <!-- 头部区域：统一的卡片风格、排版规范与渐变大标题 -->
    <div class="no-print bg-white rounded-3xl p-8 shadow-sm ring-1 ring-slate-900/5 space-y-6">
      
      <!-- 第一部分：大标题与副标题 -->
      <div class="space-y-2 max-w-4xl">
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-800 to-violet-800 flex items-center gap-3">
          <GraduationCap class="w-8 h-8 text-indigo-700 shrink-0" />
          科目目标与达成率分析中心
        </h1>
        <p class="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">
          多维度追踪教学目标、MMI 教学干扰与达成情况，支持数据报表、可视化看板及高品质 PDF 报告导出。
        </p>
      </div>

      <!-- 第二部分：底部同行对齐（左侧是 Tab 切换，右侧是三个操作按钮） -->
      <div class="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 pt-4 border-t border-slate-100">
        
        <!-- 左侧：视图切换 Tab -->
        <div class="flex flex-wrap gap-3">
          <button 
            @click="activeTab = 'table'" 
            class="px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            :class="activeTab === 'table' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'"
          >
            <BarChart3 class="w-4 h-4" /> 详细数据报表
          </button>
          <button 
            @click="activeTab = 'chart'" 
            class="px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            :class="activeTab === 'chart' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'"
          >
            <PieChart class="w-4 h-4" /> 可视化图表看板
          </button>
        </div>

        <!-- 右侧：三个操作按钮 -->
        <div class="flex flex-wrap items-center gap-3">
          <button @click="exportPdfReport" class="no-print bg-indigo-600 hover:bg-indigo-700 text-white px-5 h-11 rounded-2xl text-xs font-bold transition shadow-sm flex items-center gap-2 cursor-pointer">
            <Download class="w-4 h-4" /> 下载 PDF 报告
          </button>
          <button @click="showManageModal = true" class="no-print bg-slate-900 hover:bg-slate-800 text-white px-4 h-11 rounded-2xl text-xs font-bold transition shadow-sm cursor-pointer flex items-center gap-2">
            <Settings class="w-4 h-4" /> 管理目标
          </button>
          <button @click="loadAnalyticsData" :disabled="loading" class="no-print bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 h-11 rounded-2xl text-xs font-bold transition shadow-sm cursor-pointer flex items-center gap-2">
            <span v-if="loading" class="w-3.5 h-3.5 border-2 border-slate-400/30 border-t-slate-700 rounded-full animate-spin"></span>
            <RotateCw v-else class="w-4 h-4" />
            <span>{{ loading ? '计算中...' : '刷新数据' }}</span>
          </button>
        </div>

      </div>

    </div>

    <!-- 🔍 多维度高级筛选面板 -->
    <div class="no-print bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div>
        <label class="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">按年级筛选</label>
        <select v-model="filterGrade" @change="onGradeChange" class="w-full bg-slate-50 border border-slate-200 px-4 h-11 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
          <option value="all">全校所有年级</option>
          <option v-for="g in [1,2,3,4,5,6]" :key="g" :value="g">{{ g }} 年级</option>
        </select>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">按班级筛选</label>
        <select v-model="filterClass" class="w-full bg-slate-50 border border-slate-200 px-4 h-11 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
          <option value="all">该年级所有班级</option>
          <option v-for="c in availableClasses" :key="c.id" :value="c.class_name">{{ c.class_name }}</option>
        </select>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">按科目筛选</label>
        <select v-model="filterSubject" class="w-full bg-slate-50 border border-slate-200 px-4 h-11 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
          <option value="all">所有科目</option>
          <option v-for="s in uniqueSubjects" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>

      <div>
        <label class="block text-xs font-bold text-indigo-600 mb-2 uppercase tracking-wider flex items-center gap-1.5">
          <Users class="w-4 h-4 text-indigo-600" /> 按任课老师筛选
        </label>
        <select v-model="filterTeacher" class="w-full bg-indigo-50/50 border border-indigo-200 px-4 h-11 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
          <option value="all">全校所有教师</option>
          <option v-for="tch in allTeachers" :key="tch.id" :value="tch.name">{{ tch.name }}</option>
        </select>
      </div>
    </div>

    <!-- 🎯 核心统计指标卡片容器 -->
    <div id="pdfContentContainer" class="space-y-8 bg-white p-8 rounded-3xl shadow-sm ring-1 ring-slate-900/5">
      
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
        <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <div class="text-xs font-bold text-red-600 uppercase tracking-wider">未达成 (警告)</div>
            <div class="text-3xl font-black text-red-700 mt-2">{{ analysisSummary.unmet }}</div>
          </div>
          <AlertTriangle class="w-8 h-8 text-red-500/80 shrink-0" />
        </div>
      </div>

      <!-- ================= TAB 1: 详细数据报表视图 ================= -->
      <div v-if="activeTab === 'table'" class="bg-white rounded-3xl shadow-sm ring-1 ring-slate-900/5 overflow-hidden">
        <div class="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">细化分析报表 (班级、科目与任课老师对照)</h3>
          <span class="text-[11px] text-slate-500 font-bold">有效上课周历比例: {{ (progressRatio * 100).toFixed(1) }}%</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse print-table">
            <thead>
              <tr class="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                <th @click="toggleSort('class_name')" class="py-3 px-4 cursor-pointer hover:bg-slate-100 transition select-none">
                  年级 / 班级 <span class="text-indigo-600">{{ getSortIcon('class_name') }}</span>
                </th>
                <th @click="toggleSort('subject_name')" class="py-3 px-4 cursor-pointer hover:bg-slate-100 transition select-none">
                  科目名称 <span class="text-indigo-600">{{ getSortIcon('subject_name') }}</span>
                </th>
                <!-- 🌟 教师列：限制最大宽度并允许自动换行 -->
                <th @click="toggleSort('teacher_name')" class="py-3 px-4 cursor-pointer hover:bg-slate-100 transition select-none max-w-[280px]">
                  任课老师 <span class="text-indigo-600">{{ getSortIcon('teacher_name') }}</span>
                </th>
                <th @click="toggleSort('target')" class="py-3 px-4 text-center cursor-pointer hover:bg-slate-100 transition select-none">
                  计划目标 <span class="text-indigo-600">{{ getSortIcon('target') }}</span>
                </th>
                <th @click="toggleSort('expected')" class="py-3 px-4 text-center cursor-pointer hover:bg-slate-100 transition select-none">
                  应到进度 <span class="text-indigo-600">{{ getSortIcon('expected') }}</span>
                </th>
                <th @click="toggleSort('lostCount')" class="py-3 px-4 text-center cursor-pointer hover:bg-slate-100 transition select-none">
                  干扰损失 <span class="text-indigo-600">{{ getSortIcon('lostCount') }}</span>
                </th>
                <th @click="toggleSort('actual')" class="py-3 px-4 text-center cursor-pointer hover:bg-slate-100 transition select-none">
                  实际执行 <span class="text-indigo-600">{{ getSortIcon('actual') }}</span>
                </th>
                <th @click="toggleSort('gap')" class="py-3 px-4 text-center cursor-pointer hover:bg-slate-100 transition select-none">
                  差距 <span class="text-indigo-600">{{ getSortIcon('gap') }}</span>
                </th>
                <th @click="toggleSort('status')" class="py-3 px-4 text-center cursor-pointer hover:bg-slate-100 transition select-none">
                  状态 <span class="text-indigo-600">{{ getSortIcon('status') }}</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs font-medium text-slate-800">
              <tr v-if="filteredAnalysisList.length === 0">
                <td colspan="9" class="py-12 text-center text-slate-400 font-medium">
                  没有找到符合该筛选条件的分析记录，请调整筛选条件。
                </td>
              </tr>
              <tr v-for="(item, idx) in filteredAnalysisList" :key="idx" class="hover:bg-slate-50/50 transition">
                <td class="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                  Tahun {{ item.grade }} - {{ item.class_name }}
                </td>
                <td class="py-3 px-4 font-bold text-slate-900">{{ item.subject_name }}</td>
                <!-- 🌟 网页端名字栏防溢出：设置 max-w-[280px] 与 break-words -->
                <td class="py-3 px-4 font-bold text-indigo-900 max-w-[280px] break-words">
                  {{ item.teacher_name || '未指派' }}
                </td>
                <td class="py-3 px-4 text-center font-bold">{{ item.target }} 节</td>
                <td class="py-3 px-4 text-center font-bold text-indigo-700">{{ item.expected }} 节</td>
                <td class="py-3 px-4 text-center text-amber-700 font-bold">-{{ item.lostCount }} 节</td>
                <td class="py-3 px-4 text-center font-bold text-slate-900">{{ item.actual }} 节</td>
                <td class="py-3 px-4 text-center font-bold" :class="item.gap >= 0 ? 'text-emerald-700' : 'text-red-700'">
                  {{ item.gap >= 0 ? '+' + item.gap : item.gap }} 节
                </td>
                <td class="py-3 px-4 text-center font-bold">
                  <span 
                    class="px-2.5 py-1 rounded-lg text-xs inline-block"
                    :class="{
                      'bg-red-50 text-red-700': item.status === '未达目标',
                      'bg-emerald-50 text-emerald-700': item.status === '超过目标',
                      'bg-slate-100 text-slate-700': item.status === '已达目标'
                    }"
                  >
                    {{ item.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ================= TAB 2: 📈 视觉图表分析看板 ================= -->
      <div v-if="activeTab === 'chart'" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div class="flex justify-between items-center">
              <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Target class="w-4 h-4 text-indigo-600" /> 全校科目总体达标健康率
              </h3>
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

          <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div class="flex justify-between items-center">
              <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
                <BarChart3 class="w-4 h-4 text-indigo-600" /> 各年级达标分布概况
              </h3>
              <span class="text-xs text-slate-400 font-semibold">达标 vs 未达标</span>
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

        <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
                <AlertTriangle class="w-4 h-4 text-amber-500" /> MMI 干扰损失课时最多科目排行
              </h3>
              <p class="text-xs text-slate-400 mt-0.5 font-medium">直观展示各科目因请假、公务活动损失的教学课时</p>
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
          <h3 class="text-base font-bold text-slate-800 flex items-center gap-2">
            <Settings class="w-4 h-4 text-indigo-600" /> 科目目标在线维护
          </h3>
          <button @click="showManageModal = false" class="text-slate-400 hover:text-slate-700 font-bold text-sm cursor-pointer flex items-center gap-1">
            <X class="w-4 h-4" /> 关闭
          </button>
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
          <button @click="addTarget" class="bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-xs font-bold shadow-sm transition cursor-pointer flex items-center justify-center gap-1.5">
            <Plus class="w-3.5 h-3.5" /> 新增目标
          </button>
        </div>

        <div class="space-y-3">
          <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider">已设定的科目目标列表</h4>
          <div class="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
            <div v-for="t in allTargets" :key="t.id" class="p-3 flex items-center justify-between bg-white hover:bg-slate-50 transition">
              <div class="flex items-center gap-4 text-xs font-semibold text-slate-700">
                <span class="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-xl font-bold">{{ t.grade }}年级</span>
                <span class="text-slate-900 font-bold">{{ t.subject_name }}</span>
                <span class="text-slate-500">目标: <strong>{{ t.planned_periods }}</strong> 节</span>
              </div>
              <button @click="deleteTarget(t.id)" class="text-slate-400 hover:text-red-600 text-xs font-bold px-2 py-1 transition cursor-pointer flex items-center gap-1">
                <Trash2 class="w-3.5 h-3.5" /> 删除
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
import { ref, computed, onMounted, onActivated } from 'vue'
import { supabase } from '../services/supabase'
import jsPDF from 'jspdf'
import { useToast } from '../utils/toast'
import { 
  GraduationCap, 
  BarChart3, 
  PieChart, 
  Download, 
  Settings, 
  RotateCw, 
  Users, 
  AlertTriangle, 
  Target, 
  X, 
  Plus, 
  Trash2 
} from 'lucide-vue-next'

const toast = useToast()
const loading = ref(false)
const activeTab = ref('table')

const schoolName = ref('SJK (C) LADANG GRISEK')
const schoolLogoUrl = ref('/logo.png')

const filterGrade = ref('all')
const filterClass = ref('all')
const filterSubject = ref('all')
const filterTeacher = ref('all')

const sortKey = ref('grade')
const sortOrder = ref('asc')

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

const cleanString = (str) => {
  if (!str) return ''
  return String(str).trim().toUpperCase().replace(/[^A-Z0-9\u4e00-\u9fa5]/g, '')
}

const standardizeSubjectName = (name) => {
  const clean = cleanString(name)
  if (!clean) return ''
  
  if (['BI', 'ENGLISH', 'BAHASAINGGERIS', 'ENG', '英文'].includes(clean)) return 'BAHASA INGGERIS'
  if (['BM', 'MELAYU', 'BAHASAMELAYU', 'MALAY', '国文', '马来文'].includes(clean)) return 'BAHASA MELAYU'
  if (['BC', 'CINA', 'BAHASACINA', 'CHINESE', '华文', '华语'].includes(clean)) return 'BAHASA CINA'
  
  if (['MATEMATIK', 'MATH', 'MT', 'MM', '数学'].includes(clean)) return 'MATEMATIK'
  if (['SN', 'SAINS', 'SCIENCE', 'SC', '科学'].includes(clean)) return 'SAINS'
  
  if (['PJ', 'PENDIDIKANJASMANI', 'JASMANI', 'PE', '体育'].includes(clean)) return 'PENDIDIKAN JASMANI'
  if (['PM', 'PENDIDIKANMORAL', 'MORAL', '道德'].includes(clean)) return 'PENDIDIKAN MORAL'
  if (['PI', 'PENDIDIKANISLAM', 'ISLAM', '宗教'].includes(clean)) return 'PENDIDIKAN ISLAM'
  if (['PSV', 'PENDIDIKANSENIVISUAL', 'SENI', 'VISUAL', 'ART', '美术'].includes(clean)) return 'PENDIDIKAN SENI VISUAL'
  if (['MZ', 'PMUZIK', 'PENDIDIKANMUZIK', 'MUZIK', 'MUSIC', '音乐'].includes(clean)) return 'PENDIDIKAN MUZIK'
  if (['PK', 'PENDIDIKANKESIHATAN', 'KESIHATAN', 'HEALTH', '健教', '健康教育'].includes(clean)) return 'PENDIDIKAN KESIHATAN'
  if (['SEJARAH', 'SEJ', 'HIST', '历史'].includes(clean)) return 'SEJARAH'
  if (['RBT', 'REKABENTUKDANTEKNOLOGI', 'REKABENTUK', '设计与工艺'].includes(clean)) return 'REKA BENTUK DAN TEKNOLOGI'
  
  return clean
}

const isSubjectMatch = (subjA, subjB) => {
  if (!subjA || !subjB) return false
  const stdA = standardizeSubjectName(subjA)
  const stdB = standardizeSubjectName(subjB)
  if (stdA && stdB && stdA === stdB) return true
  
  const cA = cleanString(subjA)
  const cB = cleanString(subjB)
  return cA === cB || cA.includes(cB) || cB.includes(cA)
}

const toggleSort = (key) => {
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

const fetchAllRows = async (tableName) => {
  let allData = []
  let from = 0
  const limit = 1000 
  
  while (true) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .range(from, from + limit - 1)
      
    if (error) throw error
    if (data) allData.push(...data)
    
    if (!data || data.length < limit) break
    from += limit
  }
  return allData
}

const loadAnalyticsData = async () => {
  loading.value = true
  try {
    try {
      const { data: schoolData } = await supabase.from('school_settings').select('*').limit(1).single()
      if (schoolData) {
        if (schoolData.school_name) schoolName.value = schoolData.school_name
        if (schoolData.logo_url) schoolLogoUrl.value = schoolData.logo_url
      }
    } catch (e) {
      try {
        const { data: settingsData } = await supabase.from('settings').select('*')
        settingsData?.forEach(s => {
          if (s.key === 'school_name' && s.value) schoolName.value = s.value
          if (s.key === 'school_logo' && s.value) schoolLogoUrl.value = s.value
        })
      } catch (err) {}
    }

    const { data: targets } = await supabase.from('subject_targets').select('*').order('grade', { ascending: true })
    allTargets.value = targets || []

    const { data: classes } = await supabase.from('classes').select('*')
    allClasses.value = classes || []

    const { data: teachers } = await supabase.from('teachers').select('*')
    allTeachers.value = teachers || []

    const { data: weeks } = await supabase.from('school_weeks').select('*').order('week_number', { ascending: true })
    allSchoolWeeks.value = weeks || []

    const timetables = await fetchAllRows('timetable')
    const interruptions = await fetchAllRows('mmi_interruptions')
    const leaveRequests = await fetchAllRows('leave_requests')

    const teacherMap = {}
    if (teachers) {
      teachers.forEach(tch => {
        if (tch.id) teacherMap[String(tch.id)] = tch
        if (tch.name) teacherMap[cleanString(tch.name)] = tch
      })
    }

    const enrichedTimetables = (timetables || []).map(item => {
      const tIdKey = item.teacher_id ? String(item.teacher_id) : ''
      const tNameKey = item.teacher_name ? cleanString(item.teacher_name) : ''
      const teacherObj = teacherMap[tIdKey] || teacherMap[tNameKey] || {}
      return {
        ...item,
        teacher_info: teacherObj,
        resolved_teacher_name: teacherObj.name || item.teacher_name || item.teacher || ''
      }
    })

    const today = new Date().toISOString().split('T')[0]
    const currentWeek = (weeks || []).filter(w => w.is_school_week && w.end_date <= today).length || 27
    const validWeeksCount = (weeks || []).filter(w => w.is_school_week).length
    const totalSchoolWeeks = validWeeksCount > 0 ? validWeeksCount : 42
    let results = []
    
    for (const cls of (classes || [])) {
      const gradeTargets = (targets || []).filter(t => Number(t.grade) === Number(cls.grade))

      for (const t of gradeTargets) {
        const totalTarget = t.planned_periods || 215 
        const standardizedTargetSubject = standardizeSubjectName(t.subject_name)

        const matchedEntries = enrichedTimetables.filter(item => {
          const itemClass = cleanString(item.class_name)
          const clsName = cleanString(cls.class_name)
          const isClassMatched = itemClass === clsName || itemClass.includes(clsName) || clsName.includes(itemClass)
          if (!isClassMatched) return false

          const rawSubj = item.subject || item.subject_name || item.teacher_info?.subject_name || ''
          return isSubjectMatch(rawSubj, standardizedTargetSubject)
        })

        const assignedTeacherNames = [...new Set(matchedEntries.map(e => e.resolved_teacher_name).filter(Boolean))]
        const assignedTeacherIds = [...new Set(matchedEntries.map(e => e.teacher_id || e.teacher_info?.id).filter(Boolean))]
        const assignedTeacherName = assignedTeacherNames.length > 0 ? assignedTeacherNames.join(' / ') : '未指派'

        const uniquePeriods = new Set(matchedEntries.map(e => `${e.weekday}-${e.period}`))
        const weeklyPeriods = uniquePeriods.size

        const lostSlotSet = new Set()

        if (leaveRequests && leaveRequests.length > 0) {
          leaveRequests.forEach(req => {
            const reqClass = cleanString(req.class_name)
            const clsName = cleanString(cls.class_name)
            const isClassMatched = reqClass === clsName || reqClass.includes(clsName) || clsName.includes(reqClass)
            const isSubjMatched = isSubjectMatch(req.subject, standardizedTargetSubject)

            const reqTeacherNameClean = cleanString(req.teacher_name)
            const isTeacherMatched = 
              assignedTeacherIds.some(id => req.teacher_id && String(req.teacher_id) === String(id)) ||
              assignedTeacherNames.some(name => reqTeacherNameClean && cleanString(name) === reqTeacherNameClean)

            if (isTeacherMatched && isClassMatched && isSubjMatched) {
              if (req.leave_date) {
                const leaveDateObj = new Date(req.leave_date)
                const leaveWeekday = leaveDateObj.getDay()
                
                enrichedTimetables.forEach(item => {
                  const itemClass = cleanString(item.class_name)
                  const itemSubj = item.subject || item.subject_name || item.teacher_info?.subject_name || ''
                  const itemWeekday = Number(item.weekday)
                  
                  const matchCls = itemClass === clsName || itemClass.includes(clsName) || clsName.includes(itemClass)
                  const matchSubj = isSubjectMatch(itemSubj, standardizedTargetSubject)
                  const matchWd = itemWeekday === leaveWeekday || itemWeekday === (leaveWeekday === 0 ? 7 : leaveWeekday)
                  const matchPeriod = Number(item.period) === Number(req.period) 
                  
                  if (matchCls && matchSubj && matchWd && matchPeriod) {
                    lostSlotSet.add(`${req.leave_date}-P${item.period}`)
                  }
                })
              } else {
                lostSlotSet.add(`NODATE-${Math.random()}`)
              }
            }
          })
        }

        if (interruptions && interruptions.length > 0) {
          interruptions.forEach(int => {
            if (int.type === 'class') {
              const startP = Number(int.start_period) || 1
              const endP = Number(int.end_period) || 1
              const intScope = int.scope ? int.scope.trim() : ''
              const targetDisp = int.target_display ? int.target_display.trim() : ''
              const intGrade = Number(int.grade)
              const intClass = cleanString(int.class_name)
              const clsName = cleanString(cls.class_name)

              const intDate = new Date(int.interruption_date)
              const intWeekday = intDate.getDay()

              const isClassAffected = 
                intScope === 'all' || 
                targetDisp.includes('全校') ||
                (intScope === 'grade' && intGrade === Number(cls.grade)) ||
                targetDisp.includes(`Tahun ${cls.grade}`) || targetDisp.includes(`TAHUN ${cls.grade}`) ||
                (intScope === 'class' && (intClass.includes(clsName) || clsName.includes(intClass || ''))) ||
                targetDisp.includes(clsName)

              if (isClassAffected) {
                enrichedTimetables.forEach(item => {
                  const itemClass = cleanString(item.class_name)
                  const itemPeriod = Number(item.period)
                  const rawSubj = item.subject || item.subject_name || item.teacher_info?.subject_name || ''
                  const itemWeekday = Number(item.weekday)

                  const matchClass = itemClass === clsName || itemClass.includes(clsName) || clsName.includes(itemClass)
                  const matchPeriod = itemPeriod >= startP && itemPeriod <= endP
                  const matchSubject = isSubjectMatch(rawSubj, standardizedTargetSubject)
                  const matchWeekday = itemWeekday === intWeekday || itemWeekday === (intWeekday === 0 ? 7 : intWeekday)

                  if (matchClass && matchPeriod && matchSubject && matchWeekday) {
                    lostSlotSet.add(`${int.interruption_date}-P${item.period}`)
                  }
                })
              }
            }
          })
        }

        let lostCount = lostSlotSet.size

        const plannedAccumulated = currentWeek * weeklyPeriods
        const actual = Math.max(0, Number((plannedAccumulated - lostCount).toFixed(1)))
        const moeTarget = t.kpm_min_hours || 160
        const theoryProgress = Math.round(moeTarget * (currentWeek / totalSchoolWeeks))
        const gap = Number((actual - theoryProgress).toFixed(1))
        
        let status = '已达目标'
        if (gap < 0) {
          status = '未达目标'
        } else if (gap > 0) {
          status = '超过目标'
        } else {
          status = '已达目标'
        }

        results.push({
          grade: cls.grade,
          class_name: cls.class_name,
          subject_name: t.subject_name,
          teacher_name: assignedTeacherName,
          target: totalTarget,
          expected: theoryProgress,
          lostCount: lostCount,
          actual: actual,
          gap: gap,
          status: status
        })
      }
    }

    analysisList.value = results
    toast.success("数据分析已精准刷新！")
  } catch (err) {
    console.error("加载分析数据异常:", err)
    toast.error("加载数据失败: " + err.message)
  } finally {
    loading.value = false
  }
}

const filteredAnalysisList = computed(() => {
  let list = analysisList.value.filter(item => {
    const matchGrade = filterGrade.value === 'all' || Number(item.grade) === Number(filterGrade.value)
    const matchClass = filterClass.value === 'all' || item.class_name === filterClass.value
    const matchSubject = filterSubject.value === 'all' || standardizeSubjectName(filterSubject.value) === standardizeSubjectName(item.subject_name)
    const matchTeacher = filterTeacher.value === 'all' || (item.teacher_name && cleanString(item.teacher_name) === cleanString(filterTeacher.value))
    return matchGrade && matchClass && matchSubject && matchTeacher
  })

  return list.sort((a, b) => {
    let valA = a[sortKey.value]
    let valB = b[sortKey.value]

    if (valA === undefined || valA === null) valA = ''
    if (valB === undefined || valB === null) valB = ''

    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortOrder.value === 'asc' ? valA - valB : valB - valA
    } else {
      const strA = String(valA)
      const strB = String(valB)
      return sortOrder.value === 'asc' 
        ? strA.localeCompare(strB, 'zh-CN') 
        : strB.localeCompare(strA, 'zh-CN')
    }
  })
})

const analysisSummary = computed(() => {
  const total = filteredAnalysisList.value.length
  const met = filteredAnalysisList.value.filter(i => i.status === '已达目标' || i.status === '超过目标').length
  const unmet = filteredAnalysisList.value.filter(i => i.status === '未达目标').length
  return { total, met, unmet }
})

const completionRate = computed(() => {
  if (analysisSummary.value.total === 0) return 0
  return Math.round((analysisSummary.value.met / analysisSummary.value.total) * 100)
})

const getGradeStats = (g) => {
  const list = filteredAnalysisList.value.filter(i => Number(i.grade) === Number(g))
  const met = list.filter(i => i.status === '已达目标' || i.status === '超过目标').length
  const unmet = list.filter(i => i.status === '未达目标').length
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

// 📄 原生 Canvas 高品质彩色 PDF 报告下载引擎
const exportPdfReport = async () => {
  const title = 'LAPORAN ANALISIS SASARAN & PENCAPAIAN SUBJEK'
  const safeFileName = 'Laporan_Analisis_Sasaran_Subjek'

  const PAGE_W = 1240
  const PAGE_H = 1754
  const MARGIN = 50       
  const CONTENT_W = PAGE_W - MARGIN * 2  
  const HEADER_H = 340    
  const FOOTER_H = 58
  const ROW_H = 56        

  const canvas = document.createElement('canvas')
  canvas.width = PAGE_W
  canvas.height = PAGE_H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context is unavailable.')

  const loadLogo = async () => {
    if (!schoolLogoUrl.value) return null
    try {
      const response = await fetch(schoolLogoUrl.value, { mode: 'cors' })
      if (!response.ok) return null
      const blob = await response.blob()
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = dataUrl
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })
      return img
    } catch (e) {
      console.warn('PDF Logo 无法载入，将继续生成报告。', e)
      return null
    }
  }

  const logo = await loadLogo()
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true })
  let pageNumber = 1

  const clearPage = () => {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, PAGE_W, PAGE_H)
    ctx.textBaseline = 'top'
  }

  const setFont = (size, weight = 400) => {
    ctx.font = `${weight} ${size}px Arial, "Noto Sans", "Noto Sans CJK SC", sans-serif`
  }

  const wrapText = (text, maxWidth, fontSize = 20, weight = 400) => {
    const value = String(text ?? '')
    setFont(fontSize, weight)
    const lines = []
    let line = ''
    for (const char of value) {
      const test = line + char
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line)
        line = char
      } else {
        line = test
      }
    }
    if (line) lines.push(line)
    return lines.length ? lines : ['']
  }

  const drawHeader = () => {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, PAGE_W, HEADER_H + MARGIN)

    let currentY = MARGIN + 10

    if (logo) {
      const size = 110  
      const x = (PAGE_W - size) / 2
      ctx.drawImage(logo, x, currentY, size, size)
      currentY += size + 18 
    }

    setFont(23, 800)
    ctx.fillStyle = '#1e1b4b'
    ctx.textAlign = 'center'
    const titleLines = wrapText(title, CONTENT_W - 40, 23, 800)
    
    titleLines.forEach((line, index) => {
      ctx.fillText(line, PAGE_W / 2, currentY + index * 30)
    })

    currentY += titleLines.length * 30 + 10

    setFont(20, 700)
    ctx.fillStyle = '#334155'
    ctx.fillText(schoolName.value || 'SJK (C) LADANG GRISEK', PAGE_W / 2, currentY)

    currentY += 31

    setFont(14, 600)
    ctx.fillStyle = '#64748b'
    const filterText = `Gred: [${filterGrade.value === 'all' ? 'Semua' : filterGrade.value}] | Kelas: [${filterClass.value === 'all' ? 'Semua' : filterClass.value}] | Subjek: [${filterSubject.value === 'all' ? 'Semua' : filterSubject.value}] | Guru: [${filterTeacher.value === 'all' ? 'Semua' : filterTeacher.value}]`
    ctx.fillText(filterText, PAGE_W / 2, currentY)

    currentY += 25
    ctx.strokeStyle = '#c7d2fe'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(MARGIN, currentY)
    ctx.lineTo(PAGE_W - MARGIN, currentY)
    ctx.stroke()
    ctx.textAlign = 'left'
  }

  const drawFooter = () => {
    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(MARGIN, PAGE_H - 48)
    ctx.lineTo(PAGE_W - MARGIN, PAGE_H - 48)
    ctx.stroke()
    setFont(11, 500)
    ctx.fillStyle = '#94a3b8'
    ctx.fillText(`LAPORAN RASMI DIJANA SECARA SISTEM • ${schoolName.value || ''}`, MARGIN, PAGE_H - 34)
    ctx.textAlign = 'right'
    ctx.fillText(`HALAMAN ${pageNumber}`, PAGE_W - MARGIN, PAGE_H - 34)
    ctx.textAlign = 'left'
  }

  let y = MARGIN + HEADER_H + 10

  const commitCurrentPage = () => {
    drawFooter()
    const image = canvas.toDataURL('image/jpeg', 0.94)
    if (pageNumber === 1) {
      pdf.addImage(image, 'JPEG', 0, 0, 210, 297, undefined, 'FAST')
    } else {
      pdf.addPage()
      pdf.addImage(image, 'JPEG', 0, 0, 210, 297, undefined, 'FAST')
    }
  }

  const startNewPage = () => {
    commitCurrentPage()
    pageNumber++
    clearPage()
    if (pageNumber === 1) {
      drawHeader()
      y = MARGIN + HEADER_H + 10
    } else {
      y = MARGIN + 20 
    }
  }

  const ensureSpace = (height) => {
    if (y + height > PAGE_H - FOOTER_H) startNewPage()
  }

  const drawSectionTitle = (text) => {
    ensureSpace(54)
    setFont(20, 800)
    ctx.fillStyle = '#1e1b4b'
    ctx.fillText(text, MARGIN, y)
    y += 34
    ctx.strokeStyle = '#c7d2fe'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(MARGIN, y)
    ctx.lineTo(PAGE_W - MARGIN, y)
    ctx.stroke()
    y += 16
  }

  const drawColorfulKpiCard = (x, width, label, value, borderColor, textColor) => {
    ctx.fillStyle = '#f8fafc'
    ctx.strokeStyle = borderColor
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(x, y, width, 112, 16)
    ctx.fill()
    ctx.stroke()
    
    setFont(12, 700)
    ctx.fillStyle = '#64748b'
    ctx.fillText(label, x + 18, y + 18)
    
    setFont(31, 800)
    ctx.fillStyle = textColor
    ctx.fillText(String(value), x + 18, y + 51)
  }

  const drawColorfulTable = (headers, rows, widths) => {
    const tableW = CONTENT_W
    const normalized = widths || headers.map(() => tableW / headers.length)
    ensureSpace(ROW_H * 2)

    const drawRow = (cells, header = false, statusVal = '') => {
      let x = MARGIN
      const rowLines = cells.map((cell, i) => wrapText(cell, normalized[i] - 24, header ? 13 : 12, header ? 700 : 500))
      const maxLines = Math.max(...rowLines.map(a => a.length), 1)
      const height = Math.max(ROW_H, maxLines * 22 + 20)
      ensureSpace(height + 4)

      if (header) {
        ctx.fillStyle = '#e0e7ff' 
        ctx.strokeStyle = '#c7d2fe'
      } else {
        ctx.fillStyle = '#ffffff'
        ctx.strokeStyle = '#e2e8f0'
      }

      ctx.lineWidth = 1
      ctx.fillRect(MARGIN, y, tableW, height)
      ctx.strokeRect(MARGIN, y, tableW, height)

      rowLines.forEach((linesForCell, i) => {
        if (!header && i === cells.length - 1) {
          const badgeW = normalized[i] - 16
          const badgeH = height - 12
          const badgeX = x + (normalized[i] - badgeW) / 2 
          const badgeY = y + 6

          ctx.fillStyle = statusVal === '未达目标' ? '#fee2e2' : '#d1fae5' 
          ctx.beginPath()
          ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 10)
          ctx.fill()

          setFont(12, 700)
          ctx.fillStyle = statusVal === '未达目标' ? '#991b1b' : '#065f46' 
          ctx.textAlign = 'center'
          const totalTextH = linesForCell.length * 16
          const startY = badgeY + (badgeH - totalTextH) / 2
          linesForCell.forEach((line, li) => {
            ctx.fillText(line, badgeX + badgeW / 2, startY + li * 16)
          })
          ctx.textAlign = 'left'
        } else {
          setFont(header ? 13 : 12, header ? 700 : 500)
          ctx.fillStyle = header ? '#312e81' : '#0f172a'
          
          const totalTextH = linesForCell.length * 20
          const startY = y + (height - totalTextH) / 2

          linesForCell.forEach((line, li) => {
            if (i >= 3 && i <= 8) {
              ctx.textAlign = 'center'
              ctx.fillText(line, x + normalized[i] / 2, startY + li * 20)
              ctx.textAlign = 'left'
            } else {
              ctx.fillText(line, x + 12, startY + li * 20) 
            }
          })
        }

        x += normalized[i]
        if (i < cells.length - 1) {
          ctx.strokeStyle = '#cbd5e1'
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(x, y + height)
          ctx.stroke()
        }
      })
      y += height
    }

    drawRow(headers, true)
    rows.forEach(row => {
      const statusValue = row[row.length - 1] 
      drawRow(row.map(v => String(v ?? '-')), false, statusValue)
    })
    y += 14
  }

  try {
    clearPage()
    drawHeader()
    y = MARGIN + HEADER_H + 10

    drawSectionTitle('RINGKASAN ANALISIS PENCAPAIAN')
    const gap = 18
    const cardW = (CONTENT_W - gap * 2) / 3
    drawColorfulKpiCard(MARGIN, cardW, 'JUMLAH KEPUTUSAN', `${analysisSummary.value.total}`, '#cbd5e1', '#0f172a')
    drawColorfulKpiCard(MARGIN + cardW + gap, cardW, 'SASARAN DICAPAI', `${analysisSummary.value.met}`, '#34d399', '#059669')
    drawColorfulKpiCard(MARGIN + (cardW + gap) * 2, cardW, 'BELUM DICAPAI', `${analysisSummary.value.unmet}`, '#f87171', '#dc2626')
    y += 138

    drawSectionTitle('SENARAI TERPERINCI PRESTASI SUBJEK')
    const rows = filteredAnalysisList.value.map(item => [
      `Tahun ${item.grade} - ${item.class_name}`,
      item.subject_name,
      item.teacher_name || '未指派',
      `${item.target}`,
      `${item.expected}`,
      `-${item.lostCount}`,
      `${item.actual}`,
      `${item.gap >= 0 ? '+' + item.gap : item.gap}`,
      item.status
    ])
    
    drawColorfulTable(
      ['KELAS', 'SUBJEK', 'GURU', 'SASARAN', 'JANGKAAN', 'HILANG', 'SEBENAR', 'BEZA', 'STATUS'], 
      rows, 
      [95, 200, 310, 85, 95, 75, 90, 70, 120] 
    )

    commitCurrentPage()
    pdf.save(`${safeFileName}.pdf`)
  } catch (error) {
    console.error('PDF Generation Failed:', error)
    alert('PDF Generation Failed, please check console.')
  }
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

onActivated(() => {
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