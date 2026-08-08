<template>
  <div class="p-8 max-w-7xl mx-auto min-h-screen">
    
    <!-- 头部区域 -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-800 to-violet-800">
          MMI 教学干扰事件记录中心
        </h1>
        <p class="text-slate-500 text-sm mt-2 font-medium">
          Melindungi Masa Instruksional · 按班级、教师记录教学干扰事件，保障教学时间
        </p>
      </div>

      <!-- 模式切换标签 -->
      <div class="flex bg-white p-1 rounded-2xl shadow-sm ring-1 ring-slate-900/5">
        <button 
          @click="activeTab = 'class'" 
          :class="activeTab === 'class' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'"
          class="px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
        >
          <span>🏫 按班级记录 </span>
        </button>
        <button 
          @click="activeTab = 'teacher'" 
          :class="activeTab === 'teacher' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'"
          class="px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
        >
          <span>👩‍🏫 按教师记录</span>
        </button>
      </div>
    </div>

    <!-- 维度一：依据班级记录干扰 -->
    <div v-if="activeTab === 'class'" class="bg-white rounded-3xl p-8 shadow-sm ring-1 ring-slate-900/5 mb-8">
      <h2 class="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
        班级干扰事件录入
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <!-- 日期选择 -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-2">📅 干扰发生日期:</label>
          <input 
            type="date" 
            v-model="classForm.date" 
            class="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <!-- 干扰原因/类型 -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-2">⚠️ 干扰类型 / 原因:</label>
          <select 
            v-model="classForm.reason" 
            class="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
          >
            <option value="Perhimpunan / 集会">Perhimpunan / 特别集会</option>
            <option value="Program Sekolah / 学校活动">Program Sekolah / 全校活动</option>
            <option value="Ceramah / 讲座">Ceramah / 讲座/宣导会</option>
            <option value="Latihan Sukan / 运动会练习">Latihan Sukan / 运动会/表演练习</option>
            <option value="Pertandingan / 比赛">Pertandingan / 校内外比赛</option>
            <option value="Urusan Rasmi / 官方临时事务">Urusan Rasmi / 官方临时事务</option>
            <option value="Lain-lain / 其他干扰">Lain-lain / 其他干扰 (请自行填写)</option>
          </select>

          <!-- 当选择 Lain-lain 时，自动显示自定义输入框 -->
          <input 
            v-if="classForm.reason === 'Lain-lain / 其他干扰'"
            type="text" 
            v-model="classForm.customReason" 
            placeholder="请在此处自行填写具体的干扰原因..." 
            class="w-full bg-white border border-indigo-300 px-4 py-2 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </div>
      </div>

      <!-- 范围选择 (1-选几个班级, 2-整个年级, 3-全校) -->
      <div class="mb-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
        <label class="block text-xs font-bold text-slate-700 mb-3">🎯 选择受影响范围:</label>
        
        <div class="flex flex-wrap gap-4 mb-4">
          <label class="inline-flex items-center gap-2 cursor-pointer">
            <input type="radio" v-model="classForm.scopeType" value="specific" class="text-indigo-600 focus:ring-indigo-500" />
            <span class="text-xs font-bold text-slate-800">1. 指定班级</span>
          </label>
          <label class="inline-flex items-center gap-2 cursor-pointer">
            <input type="radio" v-model="classForm.scopeType" value="grade" class="text-indigo-600 focus:ring-indigo-500" />
            <span class="text-xs font-bold text-slate-800">2. 整个年级</span>
          </label>
          <label class="inline-flex items-center gap-2 cursor-pointer">
            <input type="radio" v-model="classForm.scopeType" value="all" class="text-indigo-600 focus:ring-indigo-500" />
            <span class="text-xs font-bold text-slate-800">3. 全校所有班级</span>
          </label>
        </div>

        <!-- 子选项：1-指定班级 (按年级分行整齐排列) -->
        <div v-if="classForm.scopeType === 'specific'" class="space-y-3 pt-2">
          <div v-for="(classes, grade) in groupedClasses" :key="grade" class="flex flex-wrap items-center gap-2">
            <!-- 年级标签 -->
            <span class="text-xs font-black text-slate-400 w-16 shrink-0">
              Tahun {{ grade }}:
            </span>
            <!-- 该年级下的所有班级按钮 -->
            <label 
              v-for="c in classes" 
              :key="c" 
              :class="classForm.selectedClasses.includes(c) ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'"
              class="px-3.5 py-1.5 border rounded-xl text-xs font-bold cursor-pointer transition-all select-none"
            >
              <input type="checkbox" :value="c" v-model="classForm.selectedClasses" class="hidden" />
              {{ c }}
            </label>
          </div>
        </div>

        <!-- 子选项：2-整个年级 -->
        <div v-if="classForm.scopeType === 'grade'" class="flex flex-wrap gap-2 pt-2">
          <button 
            v-for="g in [1, 2, 3, 4, 5, 6]" 
            :key="g"
            type="button"
            @click="classForm.selectedGrade = g"
            :class="classForm.selectedGrade === g ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 border-slate-200'"
            class="px-4 py-2 border rounded-xl text-xs font-bold transition-all"
          >
            Tahun {{ g }} ({{ g }}年级全班)
          </button>
        </div>

        <!-- 子选项：3-全校 -->
        <div v-if="classForm.scopeType === 'all'" class="text-xs text-indigo-700 font-bold pt-2">
          ✅ 影响全校所有一至六年级班级
        </div>
      </div>

      <!-- 节次范围选择 (第几节到第几节) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-2">⏰ 受影响起始节次:</label>
          <select v-model="classForm.startPeriod" class="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-800">
            <option v-for="p in 11" :key="p" :value="p">第 {{ p }} 节</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-2">⏰ 受影响结束节次:</label>
          <select v-model="classForm.endPeriod" class="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-800">
            <option v-for="p in 11" :key="p" :value="p">第 {{ p }} 节</option>
          </select>
        </div>
      </div>

      <!-- 备注 -->
      <div class="mb-6">
        <label class="block text-xs font-bold text-slate-700 mb-2">📝 详细说明与补救措施:</label>
        <input 
          v-model="classForm.remarks" 
          type="text" 
          placeholder="示例：大礼堂举办防登革热讲座。" 
          class="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <button 
        @click="submitClassInterruption" 
        class="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl text-xs font-bold shadow-md transition-all"
      >
        💾 提交班级干扰记录
      </button>
    </div>

    <!-- 维度二：依据老师记录干扰 -->
    <div v-if="activeTab === 'teacher'" class="bg-white rounded-3xl p-8 shadow-sm ring-1 ring-slate-900/5 mb-8">
      <h2 class="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-violet-600"></span>
        教师干扰事件录入
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <!-- 选择日期 -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-2">📅 干扰发生日期:</label>
          <input 
            type="date" 
            v-model="teacherForm.date" 
            @change="loadTeacherSubjects"
            class="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <!-- 选择教师 -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-2">👩‍🏫 选择受干扰/请假教师:</label>
          <select 
            v-model="teacherForm.teacherId" 
            @change="loadTeacherSubjects"
            class="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="" disabled>-- 请选择教师 --</option>
            <option v-for="t in teachersList" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
        </div>
      </div>

      <!-- 干扰原因 -->
      <div class="mb-6">
        <label class="block text-xs font-bold text-slate-700 mb-2">⚠️ 干扰原因 (如离校公干/带队/会议/病假):</label>
        <input 
          v-model="teacherForm.reason" 
          type="text" 
          placeholder="例如: 带队参加比赛、出席会议、出席工作坊、病假等" 
          class="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-800"
        />
      </div>

      <!-- 系统自动导出的课程预览区块 -->
      <div class="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 mb-6">
        <h3 class="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-3 flex items-center justify-between">
          <span>📚 自动加载：该教师当日原有课程及受影响班级</span>
          <span v-if="loadingSubjects" class="text-xs font-normal text-indigo-600 animate-pulse">正在提取课程...</span>
        </h3>

        <div v-if="exportedSubjects.length === 0" class="text-xs text-slate-400 py-4 text-center">
          请选择日期与教师，自动加载当日受影响科目与班级
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div 
            v-for="sub in exportedSubjects" 
            :key="sub.id"
            class="p-3 bg-white border border-indigo-100 rounded-xl shadow-sm flex items-center justify-between"
          >
            <div>
              <span class="text-xs font-extrabold text-slate-900">第 {{ sub.period }} 节</span>
              <span class="text-xs text-slate-500 ml-2">{{ sub.class_name }} · {{ sub.subject }}</span>
            </div>
            <span class="text-[10px] px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-bold">受干扰</span>
          </div>
        </div>
      </div>

      <button 
        @click="submitTeacherInterruption" 
        :disabled="exportedSubjects.length === 0"
        class="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-6 py-3 rounded-2xl text-xs font-bold shadow-md transition-all"
      >
        💾 确认并保存该教师干扰事件
      </button>
    </div>

    <!-- 干扰日志历史记录表格 -->
    <div class="bg-white rounded-3xl p-8 shadow-sm ring-1 ring-slate-900/5">
      <h2 class="text-lg font-bold text-slate-900 mb-6">📊 MMI 干扰事件历史记录表</h2>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse whitespace-nowrap text-sm">
          <thead>
            <tr class="bg-slate-50 text-slate-500 text-xs uppercase tracking-widest font-semibold border-b border-slate-100">
              <th class="py-3 px-4">日期</th>
              <th class="p-3">事件类型</th>
              <th class="p-3">影响对象 / 范围</th>
              <th class="p-3">受影响节次</th>
              <th class="p-3">干扰原因</th>
              <th class="p-3">说明 / 备注</th>
              <th class="p-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="interruptionLogs.length === 0">
              <td colspan="7" class="py-8 text-center text-slate-400 font-medium">暂无 MMI 干扰事件记录</td>
            </tr>
            <tr v-for="log in interruptionLogs" :key="log.id" class="hover:bg-slate-50/50 transition">
              <td class="py-3 px-4 font-bold text-slate-900">{{ log.interruption_date }}</td>
              <td class="p-3">
                <span :class="log.type === 'class' ? 'bg-indigo-50 text-indigo-700' : 'bg-violet-50 text-violet-700'" class="px-2.5 py-1 rounded-full text-xs font-bold">
                  {{ log.type === 'class' ? '班级干扰' : '教师干扰' }}
                </span>
              </td>
              <td class="p-3 font-semibold text-slate-800">{{ log.target_display }}</td>
              <td class="p-3">
                <span class="bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-600 font-medium">
                  第 {{ log.start_period }} - {{ log.end_period }} 节
                </span>
              </td>
              <td class="p-3 font-medium text-slate-700">{{ log.reason }}</td>
              <td class="p-3 text-slate-500 text-xs">{{ log.remarks || '-' }}</td>
              <td class="p-3 text-right">
                <button @click="deleteLog(log.id)" class="text-xs text-red-600 hover:text-red-800 font-semibold px-2 py-1 bg-red-50 rounded-lg">
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../services/supabase'
import { useToast } from '../utils/toast'

const toast = useToast()
const activeTab = ref('class') // 'class' 或 'teacher'

// 班级干扰表单
const classForm = ref({
  date: new Date().toISOString().split('T')[0],
  reason: 'Perhimpunan / 集会',
  customReason: '', // 👈 新增自定义原因字段
  scopeType: 'specific', // 'specific', 'grade', 'all'
  selectedClasses: [],
  selectedGrade: 1,
  startPeriod: 1,
  endPeriod: 4,
  remarks: ''
})

// 可选班级列表（按年级结构分组）
const groupedClasses = ref({})

// 获取班级列表函数（自动按年级归类）
const fetchClasses = async () => {
  const { data } = await supabase
    .from('classes')
    .select('class_name, grade')
    .order('grade', { ascending: true })
    .order('class_name', { ascending: true })
  
  if (data) {
    // 自动按年级（如 1, 2, 3...）分组
    const groups = {}
    data.forEach(c => {
      const g = c.grade || c.class_name[0] // 优先取 grade 字段，没有则取首字母
      if (!groups[g]) groups[g] = []
      groups[g].push(c.class_name)
    })
    groupedClasses.value = groups
  }
}

// 教师干扰表单
const teacherForm = ref({
  date: new Date().toISOString().split('T')[0],
  teacherId: '',
  reason: ''
})

const teachersList = ref([])
const exportedSubjects = ref([])
const loadingSubjects = ref(false)

// 历史日志列表
const interruptionLogs = ref([])

// 加载教师数据
const loadTeachers = async () => {
  const { data } = await supabase.from('teachers').select('id, name').eq('is_active', true)
  if (data) teachersList.value = data
}

// 自动导出该教师当天的科目/班级
const loadTeacherSubjects = async () => {
  if (!teacherForm.value.teacherId || !teacherForm.value.date) {
    exportedSubjects.value = []
    return
  }
  loadingSubjects.value = true
  try {
    const { data } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('teacher_id', teacherForm.value.teacherId)
      .eq('leave_date', teacherForm.value.date)

    exportedSubjects.value = data || []
  } catch (err) {
    toast.error("课程提取失败: " + err.message)
  } finally {
    loadingSubjects.value = false
  }
}

// 提交班级干扰记录
const submitClassInterruption = async () => {
  let targetDisplay = ''
  if (classForm.value.scopeType === 'specific') {
    if (classForm.value.selectedClasses.length === 0) return toast.error("请至少选择一个班级！")
    targetDisplay = `班级: ${classForm.value.selectedClasses.join(', ')}`
  } else if (classForm.value.scopeType === 'grade') {
    targetDisplay = `Tahun ${classForm.value.selectedGrade} (全年级)`
  } else {
    targetDisplay = '全校所有班级'
  }

  // 最终的原因：如果选了 Lain-lain 则使用自定义输入的文本
  const finalReason = classForm.value.reason === 'Lain-lain / 其他干扰' 
    ? (classForm.value.customReason ? classForm.value.customReason.trim() : '其他干扰')
    : classForm.value.reason

  if (classForm.value.reason === 'Lain-lain / 其他干扰' && !classForm.value.customReason) {
    return toast.error("请自行填写具体的干扰原因！")
  }

  try {
    const { error } = await supabase.from('mmi_interruptions').insert({
      interruption_date: classForm.value.date,
      type: 'class',
      target_display: targetDisplay,
      start_period: classForm.value.startPeriod,
      end_period: classForm.value.endPeriod,
      reason: finalReason,
      remarks: classForm.value.remarks
    })

    if (error) throw error

    toast.success("班级干扰事件记录成功！")
    fetchLogs()
    // 清空自定义输入
    classForm.value.customReason = ''
  } catch (err) {
    toast.error("保存失败: " + err.message)
  }
}

// 提交教师干扰记录
const submitTeacherInterruption = async () => {
  if (exportedSubjects.value.length === 0) return

  const teacher = teachersList.value.find(t => t.id === teacherForm.value.teacherId)
  const periods = exportedSubjects.value.map(s => Number(s.period)).sort((a,b) => a-b)
  const startP = periods[0] || 1
  const endP = periods[periods.length - 1] || 1

  const subjectSummary = exportedSubjects.value.map(s => `${s.class_name}(${s.subject})`).join(', ')

  try {
    const { error } = await supabase.from('mmi_interruptions').insert({
      interruption_date: teacherForm.value.date,
      type: 'teacher',
      target_display: `教师: ${teacher?.name || ''}`,
      start_period: startP,
      end_period: endP,
      reason: teacherForm.value.reason || '教师离校/受干扰',
      remarks: `受影响课程: ${subjectSummary}`
    })

    if (error) throw error

    toast.success("教师干扰事件统一记录成功！")
    fetchLogs()
  } catch (err) {
    toast.error("保存失败: " + err.message)
  }
}

// 获取历史干扰日志
const fetchLogs = async () => {
  const { data } = await supabase
    .from('mmi_interruptions')
    .select('*')
    .order('interruption_date', { ascending: false })
  
  interruptionLogs.value = data || []
}

// 删除日志
const deleteLog = async (id) => {
  try {
    await supabase.from('mmi_interruptions').delete().eq('id', id)
    toast.success("日志已删除")
    fetchLogs()
  } catch (err) {
    toast.error("删除失败: " + err.message)
  }
}

onMounted(() => {
  loadTeachers()
  fetchLogs()
  fetchClasses()
})
</script>