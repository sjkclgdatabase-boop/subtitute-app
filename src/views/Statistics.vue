<template>
  <div class="p-8 max-w-7xl mx-auto min-h-screen space-y-8 bg-slate-50">
    
    <!-- 顶部标题 -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 no-print">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-slate-900">教务数据分析与 MMI 报表中心</h1>
        <p class="text-slate-500 text-sm mt-1">多维度监控教学干扰、科目影响及教师代课负荷</p>
      </div>
    </div>

    <!-- 🌐 全局日期范围筛选器控制面板 -->
    <div class="no-print bg-white p-5 rounded-3xl shadow-sm ring-1 ring-slate-900/5 flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
          📅
        </div>
        <div>
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">时间范围筛选</div>
          <div class="text-sm font-extrabold text-slate-800">全部报表、排行榜按所选时间段实时计算</div>
        </div>
      </div>
      
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-2xl">
          <span class="text-xs font-bold text-slate-500">从</span>
          <input 
            type="date" 
            v-model="startDate" 
            @change="loadAllData"
            class="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
          />
        </div>
        <span class="text-slate-400 font-bold">-</span>
        <div class="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-2xl">
          <span class="text-xs font-bold text-slate-500">至</span>
          <input 
            type="date" 
            v-model="endDate" 
            @change="loadAllData"
            class="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
          />
        </div>
        <button 
          @click="resetDateFilter" 
          class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-xs font-bold transition"
        >
          重置
        </button>
      </div>
    </div>

    <!-- 顶栏：分析视角切换按钮 (Tab) -->
    <div class="no-print flex flex-wrap gap-2 bg-white p-2 rounded-2xl shadow-sm ring-1 ring-slate-900/5">
      <button 
        @click="currentTab = 'overview'" 
        :class="currentTab === 'overview' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'"
        class="px-4 py-2 rounded-xl text-xs font-bold transition-all"
      >
        📊 综合概览・代课负荷
      </button>
      <button 
        @click="currentTab = 'reason'" 
        :class="currentTab === 'reason' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'"
        class="px-4 py-2 rounded-xl text-xs font-bold transition-all"
      >
        ⚠️ 项目干扰分析
      </button>
      <button 
        @click="currentTab = 'trend'" 
        :class="currentTab === 'trend' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'"
        class="px-4 py-2 rounded-xl text-xs font-bold transition-all"
      >
        📅 干扰高峰日期
      </button>
      <button 
        @click="currentTab = 'class'" 
        :class="currentTab === 'class' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'"
        class="px-4 py-2 rounded-xl text-xs font-bold transition-all"
      >
        🏫 班级干扰分析
      </button>
      <button 
        @click="currentTab = 'subject'" 
        :class="currentTab === 'subject' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'"
        class="px-4 py-2 rounded-xl text-xs font-bold transition-all"
      >
        📚 受影响科目排行
      </button>
      <button 
        @click="currentTab = 'affectedTeacher'" 
        :class="currentTab === 'affectedTeacher' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'"
        class="px-4 py-2 rounded-xl text-xs font-bold transition-all"
      >
        📉 高负荷教师排行  (前 5)
      </button>
      <button 
        @click="currentTab = 'teacher'" 
        :class="currentTab === 'teacher' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'"
        class="px-4 py-2 rounded-xl text-xs font-bold transition-all"
      >
        👨‍🏫 教师干扰总表
      </button>
    </div>

    <!-- 打印专用报表标题抬头 -->
    <div class="print-header hidden mb-6 text-center">
      <h2 class="text-2xl font-extrabold text-slate-900">教务数据分析与 MMI 评估报告</h2>
      <p class="text-xs text-slate-600 mt-1">
        统计时间段：[{{ startDate || '不限' }} 至 {{ endDate || '不限' }}]
      </p>
    </div>

    <!-- ================= TAB 1: 综合概览 ================= -->
    <div v-if="currentTab === 'overview'" class="space-y-8 animate-fadeIn">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-3xl shadow-sm ring-1 ring-slate-900/5">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">本期总干扰节数</div>
          <div class="text-3xl font-black text-slate-900 mt-2">{{ totalInterruptionPeriods }} 节</div>
        </div>
        <div class="bg-white p-6 rounded-3xl shadow-sm ring-1 ring-slate-900/5">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">代课总人次</div>
          <div class="text-3xl font-black text-indigo-600 mt-2">{{ totalSubstituteCount }} 次</div>
        </div>
        <div class="bg-white p-6 rounded-3xl shadow-sm ring-1 ring-slate-900/5">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">受干扰记录总数</div>
          <div class="text-3xl font-black text-slate-900 mt-2">{{ interruptionLogs.length }} 宗</div>
        </div>
      </div>

      <div class="bg-white p-8 rounded-3xl shadow-sm ring-1 ring-slate-900/5">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-base font-bold text-slate-900">⚖️ 高负荷教师排行 (前 5)</h2>
          <button @click="exportSinglePdf" class="no-print px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1">
            📥 打印 / 另存为 PDF 报告
          </button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-5 gap-4">
          <div v-for="(t, idx) in sortedSubstituteStats.slice(0, 5)" :key="t.name" class="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between">
            <div class="text-xs font-bold text-slate-400">Rank #{{ idx + 1 }}</div>
            <div class="my-2">
              <div class="text-sm font-extrabold text-slate-900">{{ t.name }}</div>
              <div class="text-[11px] text-slate-500">{{ t.subject || '通用科目' }}</div>
            </div>
            <div class="text-xs font-bold text-indigo-600 bg-white px-3 py-1 rounded-xl shadow-sm text-center border border-slate-200">
              {{ t.count }} 次代课
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= TAB 2: 项目分析 ================= -->
    <div v-if="currentTab === 'reason'" class="bg-white p-8 rounded-3xl shadow-sm ring-1 ring-slate-900/5 space-y-6 animate-fadeIn">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-lg font-bold text-slate-900">⚠️ 教学干扰项目统计</h2>
          <p class="text-xs text-slate-500 mt-1">统计各项活动占用教学课时的节数与占比。</p>
        </div>
        <button @click="exportSinglePdf" class="no-print px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1">
          📥 打印 / 另存为 PDF 报告
        </button>
      </div>
      <div v-if="reasonStats.length === 0" class="text-xs text-slate-400 py-12 text-center border border-dashed rounded-2xl">该时间段暂无干扰记录</div>
      <div v-else class="space-y-4">
        <div v-for="item in reasonStats" :key="item.reason" class="space-y-1.5 p-4 bg-slate-50 rounded-2xl">
          <div class="flex justify-between text-xs font-bold text-slate-800">
            <span>{{ item.reason }}</span>
            <span class="text-indigo-600">{{ item.count }} 节 (占 {{ item.percentage }}%)</span>
          </div>
          <div class="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
            <div class="h-full bg-indigo-600 rounded-full" :style="{ width: item.percentage + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= TAB 3: 日期高峰 ================= -->
    <div v-if="currentTab === 'trend'" class="bg-white p-8 rounded-3xl shadow-sm ring-1 ring-slate-900/5 space-y-6 animate-fadeIn">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-lg font-bold text-slate-900">📅 教学干扰日期统计</h2>
          <p class="text-xs text-slate-500 mt-1">统计每周各日发生教学中断的频次情况。</p>
        </div>
        <button @click="exportSinglePdf" class="no-print px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1">
          📥 打印 / 另存为 PDF 报告
        </button>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <div v-for="dayData in dayOfWeekStats" :key="dayData.day" class="p-5 bg-slate-50 border border-slate-100 rounded-2xl text-center space-y-2">
          <div class="text-xs font-bold text-slate-500 uppercase">{{ dayData.day }}</div>
          <div class="text-2xl font-black text-slate-900">{{ dayData.count }} <span class="text-xs font-normal text-slate-400">节</span></div>
          <div class="text-[11px] text-indigo-600 font-semibold bg-indigo-50 py-1 rounded-lg">占总干扰 {{ dayData.percentage }}%</div>
        </div>
      </div>
    </div>

    <!-- ================= TAB 4: 班级干扰分析 ================= -->
    <div v-if="currentTab === 'class'" class="bg-white p-8 rounded-3xl shadow-sm ring-1 ring-slate-900/5 space-y-6 animate-fadeIn">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-lg font-bold text-slate-900">🏫 班级教学干扰统计</h2>
          <p class="text-xs text-slate-500 mt-1">仅统计各班级受活动冲击的累计课时。</p>
        </div>
        <button @click="exportSinglePdf" class="no-print px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1">
          📥 打印 / 另存为 PDF 报告
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm border-collapse print-table">
          <thead>
            <tr class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider select-none">
              <th @click="sortClassTable('className')" class="p-4 border-b font-bold rounded-l-xl cursor-pointer hover:bg-slate-100 transition">
                班级名称 {{ classSortKey === 'className' ? (classSortAsc ? '▲' : '▼') : '↕' }}
              </th>
              <th @click="sortClassTable('totalPeriods')" class="p-4 border-b font-bold cursor-pointer hover:bg-slate-100 transition">
                受干扰累计节数 {{ classSortKey === 'totalPeriods' ? (classSortAsc ? '▲' : '▼') : '↕' }}
              </th>
              <th @click="sortClassTable('percentage')" class="p-4 border-b font-bold rounded-r-xl cursor-pointer hover:bg-slate-100 transition">
                干扰占比 {{ classSortKey === 'percentage' ? (classSortAsc ? '▲' : '▼') : '↕' }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="c in sortedClassStats" :key="c.className" class="hover:bg-slate-50">
              <td class="p-4 font-bold text-slate-800">{{ c.className }}</td>
              <td class="p-4 font-extrabold text-indigo-600">{{ c.totalPeriods }} 节</td>
              <td class="p-4 text-slate-600">{{ c.percentage }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ================= TAB 5: 被影响最多的科目排行 ================= -->
    <div v-if="currentTab === 'subject'" class="bg-white p-8 rounded-3xl shadow-sm ring-1 ring-slate-900/5 space-y-6 animate-fadeIn">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-lg font-bold text-slate-900">📚 科目教学干扰统计</h2>
          <p class="text-xs text-slate-500 mt-1">统计各类请假及活动造成各学科课程中断的累计课时。</p>
        </div>
        <button @click="exportSinglePdf" class="no-print px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1">
          📥 打印 / 另存为 PDF 报告
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm border-collapse print-table">
          <thead>
            <tr class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider select-none">
              <th @click="sortSubjectTable('subjectName')" class="p-4 border-b font-bold rounded-l-xl cursor-pointer hover:bg-slate-100 transition">
                科目名称 {{ subjectSortKey === 'subjectName' ? (subjectSortAsc ? '▲' : '▼') : '↕' }}
              </th>
              <th @click="sortSubjectTable('totalPeriods')" class="p-4 border-b font-bold rounded-r-xl cursor-pointer hover:bg-slate-100 transition">
                受干扰总节数 {{ subjectSortKey === 'totalPeriods' ? (subjectSortAsc ? '▲' : '▼') : '↕' }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="s in sortedSubjectStats" :key="s.subjectName" class="hover:bg-slate-50">
              <td class="p-4 font-bold text-slate-800">{{ s.subjectName }}</td>
              <td class="p-4 font-extrabold text-indigo-600">{{ s.totalPeriods }} 节</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ================= TAB 6: 受影响最大老师排行榜 (Top 5) ================= -->
    <div v-if="currentTab === 'affectedTeacher'" class="bg-white p-8 rounded-3xl shadow-sm ring-1 ring-slate-900/5 space-y-6 animate-fadeIn">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-lg font-bold text-slate-900">📉 教师课堂干扰统计（前 5）</h2>
          <p class="text-xs text-slate-500 mt-1">统计教师课堂受中断情况，展示受影响最高的前 5 位教师。</p>
        </div>
        <button @click="exportSinglePdf" class="no-print px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1">
          📥 打印 / 另存为 PDF 报告
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm border-collapse print-table">
          <thead>
            <tr class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider select-none">
              <th @click="sortAffectedTeacherTable('teacherName')" class="p-4 border-b font-bold rounded-l-xl cursor-pointer hover:bg-slate-100 transition">
                教师姓名 {{ affectedTeacherSortKey === 'teacherName' ? (affectedTeacherSortAsc ? '▲' : '▼') : '↕' }}
              </th>
              <th @click="sortAffectedTeacherTable('totalPeriods')" class="p-4 border-b font-bold rounded-r-xl cursor-pointer hover:bg-slate-100 transition">
                受干扰总节数 {{ affectedTeacherSortKey === 'totalPeriods' ? (affectedTeacherSortAsc ? '▲' : '▼') : '↕' }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="(t, index) in sortedAffectedTeacherStats.slice(0, 5)" :key="t.teacherName" class="hover:bg-slate-50">
              <td class="p-4 font-bold text-slate-800">{{ t.teacherName }}</td>
              <td class="p-4 font-extrabold text-amber-600">{{ t.totalPeriods }} 节</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ================= TAB 7: 老师干扰总表 ================= -->
    <div v-if="currentTab === 'teacher'" class="bg-white p-8 rounded-3xl shadow-sm ring-1 ring-slate-900/5 space-y-6 animate-fadeIn">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-lg font-bold text-slate-900">👨‍🏫 全校教师代课及课堂干扰总览</h2>
          <p class="text-xs text-slate-500 mt-1">展示全校登记教师，完整统计代课量及课堂受干扰数据。</p>
        </div>
        <button @click="exportSinglePdf" class="no-print px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1">
          📥 打印 / 另存为 PDF 报告
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm border-collapse print-table">
          <thead>
            <tr class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider select-none">
              <th @click="sortTeacherTable('name')" class="p-4 border-b font-bold rounded-l-xl cursor-pointer hover:bg-slate-100 transition">
                教师姓名 {{ teacherSortKey === 'name' ? (teacherSortAsc ? '▲' : '▼') : '↕' }}
              </th>
              <th @click="sortTeacherTable('subject')" class="p-4 border-b font-bold cursor-pointer hover:bg-slate-100 transition">
                任教科目 {{ teacherSortKey === 'subject' ? (teacherSortAsc ? '▲' : '▼') : '↕' }}
              </th>
              <th @click="sortTeacherTable('count')" class="p-4 border-b font-bold cursor-pointer hover:bg-slate-100 transition">
                累计代课节数 {{ teacherSortKey === 'count' ? (teacherSortAsc ? '▲' : '▼') : '↕' }}
              </th>
              <th @click="sortTeacherTable('interruptedCount')" class="p-4 border-b font-bold rounded-r-xl cursor-pointer hover:bg-slate-100 transition">
                受干扰总节数 {{ teacherSortKey === 'interruptedCount' ? (teacherSortAsc ? '▲' : '▼') : '↕' }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="stat in sortedTeacherStats" :key="stat.name" class="hover:bg-slate-50">
              <td class="p-4 font-bold text-slate-800">{{ stat.name }}</td>
              <td class="p-4 text-slate-600">{{ stat.subject || '-' }}</td>
              <td class="p-4 font-extrabold text-indigo-600">{{ stat.count }} 节</td>
              <td class="p-4 font-extrabold text-amber-600">{{ stat.interruptedCount }} 节</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../services/supabase'

const currentTab = ref('overview')

// 🌐 全局日期范围状态
const startDate = ref('')
const endDate = ref('')

const stats = ref([])
const interruptionLogs = ref([])
const reasonStats = ref([])
const dayOfWeekStats = ref([])
const classStats = ref([])
const subjectStats = ref([])
const affectedTeacherStats = ref([])

// 通用安全排序方法
const smartSort = (valA, valB, asc) => {
  const a = valA ?? '';
  const b = valB ?? '';
  
  if (typeof a === 'number' && typeof b === 'number') {
    return asc ? a - b : b - a
  }
  const strA = String(a).toLowerCase();
  const strB = String(b).toLowerCase();
  return asc ? strA.localeCompare(strB) : strB.localeCompare(strA)
}

// 排序状态与方法
const classSortKey = ref('totalPeriods')
const classSortAsc = ref(false)
const sortClassTable = (key) => {
  if (classSortKey.value === key) classSortAsc.value = !classSortAsc.value
  else { classSortKey.value = key; classSortAsc.value = true }
}
const sortedClassStats = computed(() => [...classStats.value].sort((a, b) => smartSort(a[classSortKey.value], b[classSortKey.value], classSortAsc.value)))

const subjectSortKey = ref('totalPeriods')
const subjectSortAsc = ref(false)
const sortSubjectTable = (key) => {
  if (subjectSortKey.value === key) subjectSortAsc.value = !subjectSortAsc.value
  else { subjectSortKey.value = key; subjectSortAsc.value = true }
}
const sortedSubjectStats = computed(() => [...subjectStats.value].sort((a, b) => smartSort(a[subjectSortKey.value], b[subjectSortKey.value], subjectSortAsc.value)))

const affectedTeacherSortKey = ref('totalPeriods')
const affectedTeacherSortAsc = ref(false)
const sortAffectedTeacherTable = (key) => {
  if (affectedTeacherSortKey.value === key) affectedTeacherSortAsc.value = !affectedTeacherSortAsc.value
  else { affectedTeacherSortKey.value = key; affectedTeacherSortAsc.value = true }
}
const sortedAffectedTeacherStats = computed(() => [...affectedTeacherStats.value].sort((a, b) => smartSort(a[affectedTeacherSortKey.value], b[affectedTeacherSortKey.value], affectedTeacherSortAsc.value)))

const teacherSortKey = ref('count')
const teacherSortAsc = ref(false)
const sortTeacherTable = (key) => {
  if (teacherSortKey.value === key) teacherSortAsc.value = !teacherSortAsc.value
  else { teacherSortKey.value = key; teacherSortAsc.value = true }
}
const sortedTeacherStats = computed(() => [...stats.value].sort((a, b) => smartSort(a[teacherSortKey.value], b[teacherSortKey.value], teacherSortAsc.value)))

// 其他常规统计
const totalSubstituteCount = computed(() => stats.value.reduce((acc, cur) => acc + (cur.count || 0), 0))
const totalInterruptionPeriods = computed(() => interruptionLogs.value.reduce((acc, cur) => acc + ((cur.end_period || 0) - (cur.start_period || 0) + 1), 0))
const sortedSubstituteStats = computed(() => [...stats.value].sort((a, b) => (b.count || 0) - (a.count || 0)))

// 重置日期选择
const resetDateFilter = () => {
  startDate.value = ''
  endDate.value = ''
  loadAllData()
}

// 🔄 数据加载函数
const loadAllData = async () => {
  const { data: teachers } = await supabase.from('teachers').select('*')
  const { data: assignments } = await supabase.from('substitute_assignments').select('sub_teacher_id')

  let mmiQuery = supabase.from('mmi_interruptions').select('*')
  if (startDate.value) mmiQuery = mmiQuery.gte('interruption_date', startDate.value)
  if (endDate.value) mmiQuery = mmiQuery.lte('interruption_date', endDate.value)
  const { data: mmiData } = await mmiQuery

  if (mmiData) interruptionLogs.value = mmiData

  const teacherMap = {}
  const teacherNameSet = new Set()
  
  teachers?.forEach(t => {
    teacherMap[t.id] = { name: t.name, subject: t.subject, count: 0, interruptedCount: 0 }
    teacherNameSet.add(t.name.trim().toUpperCase())
  })

  assignments?.forEach(a => {
    if (teacherMap[a.sub_teacher_id]) teacherMap[a.sub_teacher_id].count++
  })

  const teacherInterruptionMap = {}
  mmiData?.forEach(l => {
    let rawTarget = (l.target_display || '').trim()
    let tName = ''
    if (rawTarget.includes('教师:')) tName = rawTarget.replace('教师:', '').trim()
    else if (teacherNameSet.has(rawTarget.toUpperCase())) tName = rawTarget

    if (tName) {
      const pCount = (l.end_period || 0) - (l.start_period || 0) + 1
      teacherInterruptionMap[tName.toUpperCase()] = (teacherInterruptionMap[tName.toUpperCase()] || 0) + pCount
    }
  })

  stats.value = Object.values(teacherMap).map(t => ({
    ...t,
    interruptedCount: teacherInterruptionMap[t.name.trim().toUpperCase()] || 0
  }))

  if (mmiData) {
    const totalPAll = interruptionLogs.value.reduce((acc, cur) => acc + ((cur.end_period || 0) - (cur.start_period || 0) + 1), 0)
    
    const reasons = {}
    mmiData.forEach(l => { const pCount = (l.end_period || 0) - (l.start_period || 0) + 1; reasons[l.reason] = (reasons[l.reason] || 0) + pCount })
    reasonStats.value = Object.entries(reasons).map(([reason, count]) => ({ reason, count, percentage: totalPAll > 0 ? ((count / totalPAll) * 100).toFixed(1) : 0 })).sort((a, b) => b.count - a.count)

    const dayNames = { 1: '星期一', 2: '星期二', 3: '星期三', 4: '星期四', 5: '星期五', 6: '星期六', 7: '星期日' }
    const daysCount = {}
    mmiData.forEach(l => { const dIndex = new Date(l.interruption_date).getDay() || 7; const dName = dayNames[dIndex] || '其他'; const pCount = (l.end_period || 0) - (l.start_period || 0) + 1; daysCount[dName] = (daysCount[dName] || 0) + pCount })
    dayOfWeekStats.value = ['星期一', '星期二', '星期三', '星期四', '星期五'].map(day => ({ day, count: daysCount[day] || 0, percentage: totalPAll > 0 ? (((daysCount[day] || 0) / totalPAll) * 100).toFixed(1) : 0 }))

    const classMap = {}
    mmiData.forEach(l => { let rawTarget = (l.target_display || '').trim(); if (rawTarget.includes('教师') || teacherNameSet.has(rawTarget.toUpperCase())) return; const cName = rawTarget || '全校/未指定'; const pCount = (l.end_period || 0) - (l.start_period || 0) + 1; classMap[cName] = (classMap[cName] || 0) + pCount })
    classStats.value = Object.entries(classMap).map(([className, totalPeriods]) => ({ className, totalPeriods, percentage: totalPAll > 0 ? ((totalPeriods / totalPAll) * 100).toFixed(1) : 0 })).sort((a, b) => b.totalPeriods - a.totalPeriods)

    const subjectMap = {}
    mmiData.forEach(l => { const remarks = l.remarks || ''; const matches = remarks.match(/\((.*?)\)/g); if (matches) { matches.forEach(m => { let sub = m.replace(/[()]/g, '').trim(); if (sub && !sub.includes('涉及节次') && !sub.includes('自动同步') && !sub.includes('请假')) subjectMap[sub] = (subjectMap[sub] || 0) + 1 }) } })
    subjectStats.value = Object.entries(subjectMap).map(([subjectName, totalPeriods]) => ({ subjectName, totalPeriods })).sort((a, b) => b.totalPeriods - a.totalPeriods)
    
    affectedTeacherStats.value = stats.value.filter(t => t.interruptedCount > 0).map(t => ({ teacherName: t.name, totalPeriods: t.interruptedCount })).sort((a, b) => b.totalPeriods - a.totalPeriods)
  }
}

onMounted(loadAllData)

// 🖨️ 默认强制 A4 纵向 (Portrait) 打印
const exportSinglePdf = () => {
  window.print()
}
</script>

<style scoped>
.print-header {
  display: none;
}

@media print {
  @page {
    size: portrait; /* 强制锁定为竖版纵向 */
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