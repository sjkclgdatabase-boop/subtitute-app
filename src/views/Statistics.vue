<template>
  <div class="p-4 sm:p-8 mx-auto min-h-screen space-y-8 min-w-[1024px] print:p-0 print:max-w-none print:min-w-0">
    
    <!-- 顶部标题 -->
    <div class="no-print bg-white rounded-3xl p-6 sm:p-8 shadow-sm ring-1 ring-slate-900/5 space-y-2">
      <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-800 to-violet-800 flex items-center gap-3">
        <ChartNoAxesCombined class="w-8 h-8 text-indigo-700 shrink-0" />
        教务数据分析与 MMI 报表中心
      </h1>
      <p class="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">
        多维度监控教学干扰、科目影响及教师代课负荷。
      </p>
    </div>

    <!-- 🌐 全局日期范围筛选器 -->
    <div class="no-print bg-white p-6 rounded-3xl shadow-sm ring-1 ring-slate-900/5 flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
          <CalendarDays class="w-5 h-5" />
        </div>
        <div>
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">时间范围筛选</div>
          <div class="text-xs font-extrabold text-slate-800">全部报表、排行榜按所选时间段实时计算</div>
        </div>
      </div>
      
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 h-11 rounded-2xl">
          <span class="text-xs font-bold text-slate-500">从</span>
          <input 
            type="date" 
            v-model="startDate" 
            @change="loadAllData"
            class="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
          />
        </div>
        <span class="text-slate-400 font-bold">-</span>
        <div class="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 h-11 rounded-2xl">
          <span class="text-xs font-bold text-slate-500">至</span>
          <input 
            type="date" 
            v-model="endDate" 
            @change="loadAllData"
            class="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
          />
        </div>
        <button 
          @click="resetDateFilter" 
          class="px-5 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition cursor-pointer flex items-center gap-2"
        >
          <RefreshCw class="w-4 h-4" />
          重置
        </button>
      </div>
    </div>

    <!-- 顶栏：Tab -->
    <div class="no-print flex flex-wrap gap-2 bg-white p-3 rounded-3xl shadow-sm ring-1 ring-slate-900/5">
      <button 
        @click="currentTab = 'overview'" 
        :class="currentTab === 'overview' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'"
        class="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
      >
        <LayoutDashboard class="w-4 h-4" />
        综合概览・代课负荷
      </button>
      <button 
        @click="currentTab = 'reason'" 
        :class="currentTab === 'reason' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'"
        class="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
      >
        <TriangleAlert class="w-4 h-4" />
        教师缺课原因分析
      </button>
      <button 
        @click="currentTab = 'large-scale'" 
        :class="currentTab === 'large-scale' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'"
        class="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
      >
        <Building2 class="w-4 h-4" />
        班级干扰事件分析
      </button>
      <button 
        @click="currentTab = 'trend'" 
        :class="currentTab === 'trend' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'"
        class="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
      >
        <CalendarDays class="w-4 h-4" />
        干扰高峰日期
      </button>
      <button 
        @click="currentTab = 'class'" 
        :class="currentTab === 'class' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'"
        class="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
      >
        <School class="w-4 h-4" />
        班级干扰明细
      </button>
      <button 
        @click="currentTab = 'subject'" 
        :class="currentTab === 'subject' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'"
        class="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
      >
        <BookOpen class="w-4 h-4" />
        科目与班级影响矩阵
      </button>
      <button 
        @click="currentTab = 'teacher'" 
        :class="currentTab === 'teacher' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'"
        class="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
      >
        <UsersRound class="w-4 h-4" />
        教师干扰总表
      </button>
    </div>

    <!-- 打印报表抬头 -->
    <div class="print-header hidden mb-6 text-center">
      <h2 class="text-2xl font-extrabold text-slate-900">LAPORAN PENILAIAN MMI & ANALISIS DATA AKADEMIK</h2>
      <p class="text-xs text-slate-600 mt-1">
        TEMPOH: [{{ startDate || 'TIADA HAD' }} HINGGA {{ endDate || 'TIADA HAD' }}]
      </p>
    </div>

    <!-- TAB 1: 综合概览 -->
    <div v-if="currentTab === 'overview'" class="space-y-8 animate-fadeIn">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-3xl shadow-sm ring-1 ring-slate-900/5">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Clock3 class="w-4 h-4 text-slate-400" />
            本期总干扰节数
          </div>
          <div class="text-3xl font-black text-slate-900 mt-2">{{ totalInterruptionPeriods }} 节</div>
        </div>
        <div class="bg-white p-6 rounded-3xl shadow-sm ring-1 ring-slate-900/5">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <ArrowLeftRight class="w-4 h-4 text-indigo-600" />
            代课总人次
          </div>
          <div class="text-3xl font-black text-indigo-600 mt-2">{{ totalSubstituteCount }} 次</div>
        </div>
        <div class="bg-white p-6 rounded-3xl shadow-sm ring-1 ring-slate-900/5">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <FileText class="w-4 h-4 text-slate-400" />
            受干扰记录总数
          </div>
          <div class="text-3xl font-black text-slate-900 mt-2">{{ interruptionLogs.length }} 宗</div>
        </div>
      </div>

      <div class="bg-white p-8 rounded-3xl shadow-sm ring-1 ring-slate-900/5">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <Scale class="w-5 h-5 text-indigo-600" />
            高负荷教师排行 (前 5)
          </h2>
          <button @click="exportSinglePdf" class="no-print px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm">
            <Printer class="w-4 h-4" />
            下载 PDF
          </button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-5 gap-4">
          <div v-for="(t, idx) in sortedSubstituteStats.slice(0, 5)" :key="t.name" class="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between">
            <div class="text-xs font-bold text-slate-400">Rank #{{ idx + 1 }}</div>
            <div class="my-2">
              <div class="text-sm font-extrabold text-slate-900">{{ t.name }}</div>
              <div class="text-[11px] text-slate-500 font-medium">{{ t.subject || '通用科目' }}</div>
            </div>
            <div class="text-xs font-bold text-indigo-600 bg-white px-3 py-1.5 rounded-xl shadow-sm text-center border border-slate-200">
              {{ t.count }} 次代课
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: 教师缺课分析 -->
    <div v-if="currentTab === 'reason'" class="bg-white p-8 rounded-3xl shadow-sm ring-1 ring-slate-900/5 space-y-6 animate-fadeIn">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
            <TriangleAlert class="w-5 h-5 text-orange-600" />
            教师缺课原因统计
          </h2>
          <p class="text-xs text-slate-500 mt-1 font-medium">专门分析因个人请假、离校公干及校内任务导致的教师缺勤记录。</p>
        </div>
        <button @click="exportSinglePdf" class="no-print px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm">
          <Printer class="w-4 h-4" />
          下载 PDF
        </button>
      </div>
      
      <div v-if="categorizedReasons.teacher.length === 0" class="text-xs text-slate-400 py-12 text-center border border-dashed rounded-2xl font-medium">该时间段暂无教师缺课记录</div>
      
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div v-for="group in categorizedReasons.teacher" :key="group.title" class="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col hover:shadow-sm transition-shadow">
          <div class="flex justify-between items-center mb-5 pb-4 border-b border-slate-200/80">
            <h3 class="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <component :is="group.icon" class="w-4 h-4 text-slate-600" />
              {{ group.title }}
            </h3>
            <span class="text-[11px] font-bold px-3 py-1 rounded-full shadow-sm" :class="group.badge">
              累计 {{ group.total }} 节
            </span>
          </div>
          
          <div class="space-y-4 flex-1">
            <div v-for="item in group.items" :key="item.reason" class="space-y-1.5">
              <div class="flex justify-between text-xs font-bold text-slate-700">
                <span class="truncate pr-4" :title="item.reason">{{ item.reason }}</span>
                <span class="whitespace-nowrap">{{ item.count }} 节 (占 {{ item.percentage }}%)</span>
              </div>
              <div class="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-500" :class="group.bar" :style="{ width: item.percentage + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB: 班级活动/大型干扰分析 -->
    <div v-if="currentTab === 'large-scale'" class="bg-white p-8 rounded-3xl shadow-sm ring-1 ring-slate-900/5 space-y-8 animate-fadeIn">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building2 class="w-5 h-5 text-indigo-600" />
            班级干扰事件分析
          </h2>
          <p class="text-xs text-slate-500 mt-1 font-medium">专门分析学术、节庆、讲座及突发假期等各类活动对班级课时造成的损失。</p>
        </div>
        <button @click="exportSinglePdf" class="no-print px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm">
          <Printer class="w-4 h-4" />
          下载 PDF
        </button>
      </div>

      <!-- 四大分类卡片矩阵 -->
      <div v-if="categorizedReasons.events.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div v-for="group in categorizedReasons.events" :key="group.title" class="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col hover:shadow-sm transition-shadow">
          <div class="flex justify-between items-center mb-5 pb-4 border-b border-slate-200/80">
            <h3 class="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <component :is="group.icon" class="w-4 h-4 text-slate-600" />
              {{ group.title }}
            </h3>
            <span class="text-[11px] font-bold px-3 py-1 rounded-full shadow-sm" :class="group.badge">
              累计损失 {{ group.total }} 节
            </span>
          </div>
          
          <div class="space-y-4 flex-1">
            <div v-for="item in group.items" :key="item.reason" class="space-y-1.5">
              <div class="flex justify-between text-xs font-bold text-slate-700">
                <span class="truncate pr-4" :title="item.reason">{{ item.reason }}</span>
                <span class="whitespace-nowrap">{{ item.count }} 节 (占 {{ item.percentage }}%)</span>
              </div>
              <div class="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-500" :class="group.bar" :style="{ width: item.percentage + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-xs text-slate-400 py-12 text-center border border-dashed rounded-2xl font-medium">当前时间段暂无班级活动记录</div>

      <!-- 下半部分：活动明细排行榜 -->
      <div class="space-y-4">
        <h3 class="text-sm font-bold text-slate-800">班级 / 大型干扰活动排行榜 (明细)</h3>
        <div class="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-sm">
          <table class="w-full text-left text-xs border-collapse print-table">
            <thead>
              <tr class="bg-indigo-50/60 text-indigo-900 uppercase tracking-wider select-none font-bold border-b border-indigo-100">
                <th @click="sortLargeScaleTable('reason')" class="p-4 cursor-pointer hover:bg-indigo-100/50 transition">
                  活动名称 <span class="text-indigo-600">{{ largeScaleSortKey === 'reason' ? (largeScaleSortAsc ? '▲' : '▼') : '↕' }}</span>
                </th>
                <th @click="sortLargeScaleTable('scope')" class="p-4 cursor-pointer hover:bg-indigo-100/50 transition">
                  影响范围 <span class="text-indigo-600">{{ largeScaleSortKey === 'scope' ? (largeScaleSortAsc ? '▲' : '▼') : '↕' }}</span>
                </th>
                <th @click="sortLargeScaleTable('frequency')" class="p-4 cursor-pointer hover:bg-indigo-100/50 transition">
                  发生次数 <span class="text-indigo-600">{{ largeScaleSortKey === 'frequency' ? (largeScaleSortAsc ? '▲' : '▼') : '↕' }}</span>
                </th>
                <th @click="sortLargeScaleTable('totalPeriods')" class="p-4 cursor-pointer hover:bg-indigo-100/50 transition">
                  单班级损失节数 (均值) <span class="text-indigo-600">{{ largeScaleSortKey === 'totalPeriods' ? (largeScaleSortAsc ? '▲' : '▼') : '↕' }}</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium text-slate-800">
              <tr v-if="sortedLargeScaleStats.length === 0">
                <td colspan="4" class="p-8 text-center text-slate-400 font-medium">无大型活动明细数据</td>
              </tr>
              <tr v-for="(stat, index) in sortedLargeScaleStats" :key="index" class="hover:bg-slate-50/60">
                <td class="p-4 font-bold text-slate-900">{{ stat.reason }}</td>
                <td class="p-4">
                  <span :class="stat.type === 'school' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'" class="px-2 py-1 rounded-md text-[11px] font-bold">
                    {{ stat.scope }}
                  </span>
                </td>
                <td class="p-4 text-slate-600">{{ stat.frequency }} 次</td>
                <td class="p-4 font-bold text-amber-600">{{ stat.totalPeriods }} 节</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 3: 日期高峰 -->
    <div v-if="currentTab === 'trend'" class="bg-white p-8 rounded-3xl shadow-sm ring-1 ring-slate-900/5 space-y-6 animate-fadeIn">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays class="w-5 h-5 text-indigo-600" />
            教学干扰日期统计
          </h2>
          <p class="text-xs text-slate-500 mt-1 font-medium">统计每周各日发生教学中断的频次情况。</p>
        </div>
        <button @click="exportSinglePdf" class="no-print px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm">
          <Printer class="w-4 h-4" />
          下载 PDF
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

    <!-- TAB 4: 班级干扰分析 -->
    <div v-if="currentTab === 'class'" class="bg-white p-8 rounded-3xl shadow-sm ring-1 ring-slate-900/5 space-y-6 animate-fadeIn">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
            <School class="w-5 h-5 text-indigo-600" />
            班级教学干扰统计
          </h2>
          <p class="text-xs text-slate-500 mt-1 font-medium">按年级筛选并统计各班级受活动冲击的累计课时。</p>
        </div>
        <button @click="exportSinglePdf" class="no-print px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm">
          <Printer class="w-4 h-4" />
          下载 PDF
        </button>
      </div>

      <div class="no-print bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-wrap items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-slate-600 flex items-center gap-1.5">
            <Filter class="w-4 h-4" />
            年级筛选:
          </span>
          <select 
            v-model="selectedClassGradeFilter" 
            class="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none cursor-pointer"
          >
            <option value="">全部年级</option>
            <option v-for="g in availableClassGrades" :key="g" :value="g">{{ g }}</option>
          </select>
        </div>

        <button 
          v-if="selectedClassGradeFilter" 
          @click="selectedClassGradeFilter = ''" 
          class="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer ml-auto"
        >
          清除筛选
        </button>
      </div>

      <div class="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-sm">
        <table class="w-full text-left text-xs border-collapse print-table">
          <thead>
            <tr class="bg-indigo-50/60 text-indigo-900 uppercase tracking-wider select-none font-bold border-b border-indigo-100">
              <th @click="sortClassTable('className')" class="p-4 cursor-pointer hover:bg-indigo-100/50 transition">
                班级名称 <span class="text-indigo-600">{{ classSortKey === 'className' ? (classSortAsc ? '▲' : '▼') : '↕' }}</span>
              </th>
              <th @click="sortClassTable('totalPeriods')" class="p-4 cursor-pointer hover:bg-indigo-100/50 transition">
                受干扰累计节数 <span class="text-indigo-600">{{ classSortKey === 'totalPeriods' ? (classSortAsc ? '▲' : '▼') : '↕' }}</span>
              </th>
              <th @click="sortClassTable('percentage')" class="p-4 cursor-pointer hover:bg-indigo-100/50 transition">
                干扰占比 <span class="text-indigo-600">{{ classSortKey === 'percentage' ? (classSortAsc ? '▲' : '▼') : '↕' }}</span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium text-slate-800">
            <tr v-if="filteredClassStats.length === 0">
              <td colspan="3" class="p-8 text-center text-slate-400 font-medium">当前筛选条件下没有找到符合的班级干扰记录</td>
            </tr>
            <tr v-for="c in filteredClassStats" :key="c.className" class="hover:bg-slate-50/60">
              <td class="p-4 font-bold text-slate-900">{{ c.className }}</td>
              <td class="p-4 font-bold text-indigo-600">{{ c.totalPeriods }} 节</td>
              <td class="p-4 text-slate-600">{{ c.percentage }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 5: 被影响最多的科目与班级明细排行 -->
    <div v-if="currentTab === 'subject'" class="bg-white p-8 rounded-3xl shadow-sm ring-1 ring-slate-900/5 space-y-6 animate-fadeIn">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen class="w-5 h-5 text-indigo-600" />
            科目与班级细化干扰分析
          </h2>
          <p class="text-xs text-slate-500 mt-1 font-medium">按年级、班级多维度筛选科目受干扰详情。</p>
        </div>
        <button @click="exportSinglePdf" class="no-print px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm">
          <Printer class="w-4 h-4" />
          下载 PDF
        </button>
      </div>

      <div class="no-print bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-wrap items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-slate-600 flex items-center gap-1.5">
            <Filter class="w-4 h-4" />
            年级筛选:
          </span>
          <select 
            v-model="selectedGradeFilter" 
            @change="selectedClassFilter = ''"
            class="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none cursor-pointer"
          >
            <option value="">全部年级</option>
            <option v-for="g in availableGrades" :key="g" :value="g">{{ g }}</option>
          </select>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-slate-600 flex items-center gap-1.5">
            <Filter class="w-4 h-4" />
            班级筛选:
          </span>
          <select 
            v-model="selectedClassFilter" 
            class="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none cursor-pointer"
          >
            <option value="">全部班级</option>
            <option v-for="cls in availableClassesForFilter" :key="cls" :value="cls">{{ cls }}</option>
          </select>
        </div>

        <button 
          v-if="selectedGradeFilter || selectedClassFilter" 
          @click="selectedGradeFilter = ''; selectedClassFilter = ''" 
          class="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer ml-auto"
        >
          清除筛选
        </button>
      </div>

      <div class="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-sm">
        <table class="w-full text-left text-xs border-collapse print-table">
          <thead>
            <tr class="bg-indigo-50/60 text-indigo-900 uppercase tracking-wider select-none font-bold border-b border-indigo-100">
              <th @click="sortSubjectTable('grade')" class="p-4 cursor-pointer hover:bg-indigo-100/50 transition">
                年级 <span class="text-indigo-600">{{ subjectSortKey === 'grade' ? (subjectSortAsc ? '▲' : '▼') : '↕' }}</span>
              </th>
              <th @click="sortSubjectTable('className')" class="p-4 cursor-pointer hover:bg-indigo-100/50 transition">
                班级 <span class="text-indigo-600">{{ subjectSortKey === 'className' ? (subjectSortAsc ? '▲' : '▼') : '↕' }}</span>
              </th>
              <th @click="sortSubjectTable('subjectName')" class="p-4 cursor-pointer hover:bg-indigo-100/50 transition">
                受影响科目 <span class="text-indigo-600">{{ subjectSortKey === 'subjectName' ? (subjectSortAsc ? '▲' : '▼') : '↕' }}</span>
              </th>
              <th @click="sortSubjectTable('totalPeriods')" class="p-4 cursor-pointer hover:bg-indigo-100/50 transition">
                受干扰总节数 <span class="text-indigo-600">{{ subjectSortKey === 'totalPeriods' ? (subjectSortAsc ? '▲' : '▼') : '↕' }}</span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium text-slate-800">
            <tr v-if="filteredSubjectStats.length === 0">
              <td colspan="4" class="p-8 text-center text-slate-400 font-medium">当前筛选条件下没有找到符合的科目受干扰记录</td>
            </tr>
            <tr v-for="s in filteredSubjectStats" :key="s.id" class="hover:bg-slate-50/60">
              <td class="p-4 font-bold text-slate-600">{{ s.grade }}</td>
              <td class="p-4 font-bold text-slate-900">{{ s.className }}</td>
              <td class="p-4 font-bold text-indigo-600">{{ s.subjectName }}</td>
              <td class="p-4 font-bold text-amber-600">{{ s.totalPeriods }} 节</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 7: 老师干扰总表 -->
    <div v-if="currentTab === 'teacher'" class="bg-white p-8 rounded-3xl shadow-sm ring-1 ring-slate-900/5 space-y-6 animate-fadeIn">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UsersRound class="w-5 h-5 text-indigo-600" />
            全校教师代课及课堂干扰总览
          </h2>
          <p class="text-xs text-slate-500 mt-1 font-medium">展示全校登记教师，完整统计代课量及课堂受干扰数据。</p>
        </div>
        <button @click="exportSinglePdf" class="no-print px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm">
          <Printer class="w-4 h-4" />
          下载 PDF
        </button>
      </div>

      <div class="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-sm">
        <table class="w-full text-left text-xs border-collapse print-table">
          <thead>
            <tr class="bg-indigo-50/60 text-indigo-900 uppercase tracking-wider select-none font-bold border-b border-indigo-100">
              <th @click="sortTeacherTable('name')" class="p-4 cursor-pointer hover:bg-indigo-100/50 transition">
                教师姓名 <span class="text-indigo-600">{{ teacherSortKey === 'name' ? (teacherSortAsc ? '▲' : '▼') : '↕' }}</span>
              </th>
              <th @click="sortTeacherTable('subject')" class="p-4 cursor-pointer hover:bg-indigo-100/50 transition">
                任教科目 <span class="text-indigo-600">{{ teacherSortKey === 'subject' ? (teacherSortAsc ? '▲' : '▼') : '↕' }}</span>
              </th>
              <th @click="sortTeacherTable('count')" class="p-4 cursor-pointer hover:bg-indigo-100/50 transition">
                累计代课节数 <span class="text-indigo-600">{{ teacherSortKey === 'count' ? (teacherSortAsc ? '▲' : '▼') : '↕' }}</span>
              </th>
              <th @click="sortTeacherTable('interruptedCount')" class="p-4 cursor-pointer hover:bg-indigo-100/50 transition">
                受干扰总节数 <span class="text-indigo-600">{{ teacherSortKey === 'interruptedCount' ? (teacherSortAsc ? '▲' : '▼') : '↕' }}</span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium text-slate-800">
            <tr v-for="stat in sortedTeacherStats" :key="stat.name" class="hover:bg-slate-50/60">
              <td class="p-4 font-bold text-slate-900">{{ stat.name }}</td>
              <td class="p-4 text-slate-600">{{ stat.subject || '-' }}</td>
              <td class="p-4 font-bold text-indigo-600">{{ stat.count }} 节</td>
              <td class="p-4 font-bold text-amber-600">{{ stat.interruptedCount }} 节</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onActivated } from 'vue'
import { supabase } from '../services/supabase'
import jsPDF from 'jspdf'
import { 
  ChartNoAxesCombined, CalendarDays, RefreshCw, LayoutDashboard, TriangleAlert, 
  School, BookOpen, UsersRound, Clock3, ArrowLeftRight, FileText, Scale, Printer, 
  Filter, CalendarCheck, BriefcaseBusiness, Building2, FolderOpen,
  PartyPopper, Mic, Umbrella
} from 'lucide-vue-next'

const currentTab = ref('overview')
const schoolName = ref('SJK (C) LADANG GRISEK')
const schoolLogoUrl = ref('/logo.png')
const startDate = ref('')
const endDate = ref('')
const stats = ref([])
const interruptionLogs = ref([])
const dayOfWeekStats = ref([])
const classStats = ref([])
const subjectStats = ref([])
const selectedClassGradeFilter = ref('') 
const selectedGradeFilter = ref('')      
const selectedClassFilter = ref('')      

const gradeOrderMap = { 'YEAR 1': 1, 'YEAR 2': 2, 'YEAR 3': 3, 'YEAR 4': 4, 'YEAR 5': 5, 'YEAR 6': 6, 'TAHUN 1': 1, 'TAHUN 2': 2, 'TAHUN 3': 3, 'TAHUN 4': 4, 'TAHUN 5': 5, 'TAHUN 6': 6, '一年级': 1, '二年级': 2, '三年级': 3, '四年级': 4, '五年级': 5, '六年级': 6 };
const sortGrgradesHelper = (setObj) => Array.from(setObj).sort((a, b) => {
  const wA = gradeOrderMap[a] !== undefined ? gradeOrderMap[a] : 99;
  const wB = gradeOrderMap[b] !== undefined ? gradeOrderMap[b] : 99;
  return wA - wB;
});

const getGradeFromClass = (cName) => {
  if (!cName) return '其他年级';
  const match = cName.match(/^([0-9]+)/);
  if (match) {
    const gradeNum = match[1];
    return `${gradeNum}年级`;
  }
  return '全校/其他';
};

const availableClassGrades = computed(() => {
  const grades = new Set()
  classStats.value.forEach(c => {
    const g = getGradeFromClass(c.className)
    if (g && g !== '全校/其他') grades.add(g)
  })
  return sortGrgradesHelper(grades)
})

const filteredClassStats = computed(() => {
  let list = classStats.value
  if (selectedClassGradeFilter.value) {
    list = list.filter(c => getGradeFromClass(c.className) === selectedClassGradeFilter.value)
  }
  return [...list].sort((a, b) => smartSort(a[classSortKey.value], b[classSortKey.value], classSortAsc.value))
})

const availableGrades = computed(() => {
  const grades = new Set()
  subjectStats.value.forEach(s => {
    if (s.grade && s.grade !== '全校/其他') grades.add(s.grade)
  })
  return sortGrgradesHelper(grades)
})

const availableClassesForFilter = computed(() => {
  const classes = new Set()
  subjectStats.value.forEach(s => {
    if (!selectedGradeFilter.value || s.grade === selectedGradeFilter.value) {
      if (s.className && s.className !== 'UNKNOWN') classes.add(s.className)
    }
  })
  return Array.from(classes).sort()
})

const filteredSubjectStats = computed(() => {
  let list = subjectStats.value
  if (selectedGradeFilter.value) list = list.filter(s => s.grade === selectedGradeFilter.value)
  if (selectedClassFilter.value) list = list.filter(s => s.className === selectedClassFilter.value)
  return [...list].sort((a, b) => smartSort(a[subjectSortKey.value], b[subjectSortKey.value], subjectSortAsc.value))
})

// --- 🌟 三语兼容核心引擎：教师缺课 vs 班级活动 ---
const categorizedReasons = computed(() => {
  const teacher = {
    personal: { title: '个人请假', icon: CalendarCheck, items: {}, total: 0, badge: 'bg-orange-100 text-orange-700', bar: 'bg-orange-500' },
    official: { title: '离校公干', icon: BriefcaseBusiness, items: {}, total: 0, badge: 'bg-blue-100 text-blue-700', bar: 'bg-blue-500' },
    internal: { title: '校内任务', icon: Building2, items: {}, total: 0, badge: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500' },
    others:   { title: '未分类 / 教师其他', icon: FolderOpen, items: {}, total: 0, badge: 'bg-slate-200 text-slate-700', bar: 'bg-slate-400' }
  }
  
  const events = {
    academic: { title: '学术与考试', icon: BookOpen, items: {}, total: 0, badge: 'bg-indigo-100 text-indigo-700', bar: 'bg-indigo-500' },
    festival: { title: '节庆与活动', icon: PartyPopper, items: {}, total: 0, badge: 'bg-pink-100 text-pink-700', bar: 'bg-pink-500' },
    seminar:  { title: '讲座与集会', icon: Mic, items: {}, total: 0, badge: 'bg-purple-100 text-purple-700', bar: 'bg-purple-500' },
    holiday:  { title: '假期与突发', icon: Umbrella, items: {}, total: 0, badge: 'bg-teal-100 text-teal-700', bar: 'bg-teal-500' },
    others:   { title: '未分类 / 其他活动', icon: FolderOpen, items: {}, total: 0, badge: 'bg-slate-200 text-slate-700', bar: 'bg-slate-400' }
  }

  let teacherTotalAll = 0
  let eventTotalAll = 0

  interruptionLogs.value.forEach(log => {
    const pCount = (log.end_period || 0) - (log.start_period || 0) + 1
    const rawReason = (log.reason || '未填写').trim().toUpperCase().replace(/^(教师请假:\s*|CUTI GURU:\s*|TEACHER LEAVE:\s*)/i, '')
    const cleanReason = rawReason.replace(/\[.*?\]\s*/, '').trim() || rawReason

    const intScope = log.scope ? log.scope.trim() : ''
    const targetDisp = log.target_display ? log.target_display.trim() : ''
    
    const isSchoolLevel = intScope === 'all' || targetDisp.includes('全校') || targetDisp.includes('SEMUA') || targetDisp.includes('WHOLE SCHOOL')
    const isGradeLevel = intScope === 'grade' || /TAHUN/i.test(targetDisp) || /YEAR/i.test(targetDisp)
    const hasEventTag = rawReason.includes('[学术]') || rawReason.includes('[AKADEMIK]') || rawReason.includes('[ACADEMIC]') ||
                        rawReason.includes('[节庆]') || rawReason.includes('[ACARA]') || rawReason.includes('[EVENT]') ||
                        rawReason.includes('[讲座]') || rawReason.includes('[CERAMAH]') || rawReason.includes('[SEMINAR]') ||
                        rawReason.includes('[假期]') || rawReason.includes('[CUTI KHAS]') || rawReason.includes('[HOLIDAY]')
    const isLikelyEvent = isSchoolLevel || isGradeLevel || hasEventTag || log.type === 'class'
    
    // 1. 三语标签智能匹配
    if (rawReason.includes('[个人请假]') || rawReason.includes('[CUTI PERIBADI]') || rawReason.includes('[PERSONAL LEAVE]')) {
      teacher.personal.items[cleanReason] = (teacher.personal.items[cleanReason] || 0) + pCount
      teacher.personal.total += pCount; teacherTotalAll += pCount
    } else if (rawReason.includes('[离校公干]') || rawReason.includes('[URUSAN RASMI]') || rawReason.includes('[OFFICIAL DUTY]')) {
      teacher.official.items[cleanReason] = (teacher.official.items[cleanReason] || 0) + pCount
      teacher.official.total += pCount; teacherTotalAll += pCount
    } else if (rawReason.includes('[校内任务]') || rawReason.includes('[TUGAS DALAMAN]') || rawReason.includes('[INTERNAL TASK]')) {
      teacher.internal.items[cleanReason] = (teacher.internal.items[cleanReason] || 0) + pCount
      teacher.internal.total += pCount; teacherTotalAll += pCount
    } else if (rawReason.includes('[学术]') || rawReason.includes('[AKADEMIK]') || rawReason.includes('[ACADEMIC]')) {
      events.academic.items[cleanReason] = (events.academic.items[cleanReason] || 0) + pCount
      events.academic.total += pCount; eventTotalAll += pCount
    } else if (rawReason.includes('[节庆]') || rawReason.includes('[ACARA]') || rawReason.includes('[EVENT]')) {
      events.festival.items[cleanReason] = (events.festival.items[cleanReason] || 0) + pCount
      events.festival.total += pCount; eventTotalAll += pCount
    } else if (rawReason.includes('[讲座]') || rawReason.includes('[CERAMAH]') || rawReason.includes('[SEMINAR]')) {
      events.seminar.items[cleanReason] = (events.seminar.items[cleanReason] || 0) + pCount
      events.seminar.total += pCount; eventTotalAll += pCount
    } else if (rawReason.includes('[假期]') || rawReason.includes('[CUTI KHAS]') || rawReason.includes('[HOLIDAY]')) {
      events.holiday.items[cleanReason] = (events.holiday.items[cleanReason] || 0) + pCount
      events.holiday.total += pCount; eventTotalAll += pCount
    } else {
      // 2. 兜底无标签数据
      if (isLikelyEvent && !log.target_display?.includes('教师:') && !log.target_display?.includes('GURU:') && !log.target_display?.includes('TEACHER:')) {
        events.others.items[cleanReason] = (events.others.items[cleanReason] || 0) + pCount
        events.others.total += pCount; eventTotalAll += pCount
      } else {
        teacher.others.items[cleanReason] = (teacher.others.items[cleanReason] || 0) + pCount
        teacher.others.total += pCount; teacherTotalAll += pCount
      }
    }
  })

  const formatGroup = (groupObj, totalAll) => {
    return Object.values(groupObj).map(g => {
      let sortedItems = Object.entries(g.items)
        .map(([reason, count]) => ({ reason, count, percentage: totalAll > 0 ? ((count / totalAll) * 100).toFixed(1) : 0 }))
        .sort((a, b) => b.count - a.count)
      
      if (sortedItems.length > 8) {
        const top8 = sortedItems.slice(0, 8)
        const remaining = sortedItems.slice(8)
        const remainingCount = remaining.reduce((sum, r) => sum + r.count, 0)
        top8.push({
          reason: '其他碎项合并 (Lain-lain)',
          count: remainingCount,
          percentage: totalAll > 0 ? ((remainingCount / totalAll) * 100).toFixed(1) : 0
        })
        sortedItems = top8
      }
      return { ...g, items: sortedItems }
    }).filter(g => g.total > 0).sort((a, b) => b.total - a.total)
  }

  return {
    teacher: formatGroup(teacher, teacherTotalAll),
    events: formatGroup(events, eventTotalAll)
  }
})

// --- 班级/大型活动 明细排行榜逻辑 ---
const largeScaleStats = computed(() => {
  const statsMap = {}

  interruptionLogs.value.forEach(log => {
    const intScope = log.scope ? log.scope.trim() : ''
    const targetDisp = log.target_display ? log.target_display.trim() : ''
    const rawReason = (log.reason || '未填写名称').toUpperCase()

    const isSchoolLevel = intScope === 'all' || targetDisp.includes('全校') || targetDisp.includes('SEMUA') || targetDisp.includes('WHOLE SCHOOL')
    const isGradeLevel = intScope === 'grade' || /TAHUN/i.test(targetDisp) || /YEAR/i.test(targetDisp)
    const hasEventTag = rawReason.includes('[学术]') || rawReason.includes('[AKADEMIK]') || rawReason.includes('[ACADEMIC]') ||
                        rawReason.includes('[节庆]') || rawReason.includes('[ACARA]') || rawReason.includes('[EVENT]') ||
                        rawReason.includes('[讲座]') || rawReason.includes('[CERAMAH]') || rawReason.includes('[SEMINAR]') ||
                        rawReason.includes('[假期]') || rawReason.includes('[CUTI KHAS]') || rawReason.includes('[HOLIDAY]')

    if (isSchoolLevel || isGradeLevel || hasEventTag || log.type === 'class') {
      const reasonClean = (log.reason || '未填写名称').replace(/\[.*?\]\s*/, '').trim() || (log.reason || '未填写名称')
      const scopeText = isSchoolLevel ? '全校' : (isGradeLevel ? (log.grade ? `${log.grade} 年级` : '全级') : '特定班级/多班')
      const key = `${reasonClean}_${scopeText}`
      const pCount = (log.end_period || 0) - (log.start_period || 0) + 1

      if (!statsMap[key]) {
        statsMap[key] = {
          reason: reasonClean,
          scope: scopeText,
          totalPeriods: 0,
          frequency: 0,
          type: isSchoolLevel ? 'school' : 'grade'
        }
      }
      statsMap[key].totalPeriods += pCount
      statsMap[key].frequency += 1
    }
  })
  return Object.values(statsMap)
})

const smartSort = (valA, valB, asc) => {
  const a = valA ?? ''; const b = valB ?? '';
  if (typeof a === 'number' && typeof b === 'number') return asc ? a - b : b - a
  return asc ? String(a).toLowerCase().localeCompare(String(b).toLowerCase()) : String(b).toLowerCase().localeCompare(String(a).toLowerCase())
}

const classSortKey = ref('totalPeriods'); const classSortAsc = ref(false)
const sortClassTable = (key) => { if (classSortKey.value === key) classSortAsc.value = !classSortAsc.value; else { classSortKey.value = key; classSortAsc.value = true } }

const subjectSortKey = ref('totalPeriods'); const subjectSortAsc = ref(false)
const sortSubjectTable = (key) => { if (subjectSortKey.value === key) subjectSortAsc.value = !subjectSortAsc.value; else { subjectSortKey.value = key; subjectSortAsc.value = true } }

const teacherSortKey = ref('count'); const teacherSortAsc = ref(false)
const sortTeacherTable = (key) => { if (teacherSortKey.value === key) teacherSortAsc.value = !teacherSortAsc.value; else { teacherSortKey.value = key; teacherSortAsc.value = true } }
const sortedTeacherStats = computed(() => [...stats.value].sort((a, b) => smartSort(a[teacherSortKey.value], b[teacherSortKey.value], teacherSortAsc.value)))

const largeScaleSortKey = ref('totalPeriods'); const largeScaleSortAsc = ref(false)
const sortLargeScaleTable = (key) => { if (largeScaleSortKey.value === key) largeScaleSortAsc.value = !largeScaleSortAsc.value; else { largeScaleSortKey.value = key; largeScaleSortAsc.value = true } }
const sortedLargeScaleStats = computed(() => [...largeScaleStats.value].sort((a, b) => smartSort(a[largeScaleSortKey.value], b[largeScaleSortKey.value], largeScaleSortAsc.value)))

const totalSubstituteCount = computed(() => stats.value.reduce((acc, cur) => acc + (cur.count || 0), 0))
const totalInterruptionPeriods = computed(() => interruptionLogs.value.reduce((acc, cur) => acc + ((cur.end_period || 0) - (cur.start_period || 0) + 1), 0))
const sortedSubstituteStats = computed(() => [...stats.value].sort((a, b) => (b.count || 0) - (a.count || 0)))

const resetDateFilter = () => {
  startDate.value = ''; endDate.value = ''
  selectedClassGradeFilter.value = ''; selectedGradeFilter.value = ''; selectedClassFilter.value = ''
  loadAllData()
}

const cleanClassName = (rawStr) => {
  if (!rawStr) return '';
  let cleaned = rawStr.replace(/^(班级|班級|KELAS|CLASS)\s*[:：]\s*/i, '').trim();
  cleaned = cleaned.replace(/^(班级|班級|KELAS|CLASS)\s*[:：]\s*/i, '').trim();
  if (!cleaned || /VIRTUAL_CLASS/i.test(cleaned)) return '';
  return cleaned.toUpperCase();
};

const expandClassNames = (rawStr) => {
  if (!rawStr) return [];
  let cleaned = rawStr.replace(/^(班级|班級|KELAS|CLASS)\s*[:：]\s*/i, '').trim();
  if (!cleaned || /VIRTUAL_CLASS/i.test(cleaned)) return [];
  const separators = /,|、|\//;
  if (separators.test(cleaned)) {
    const parts = cleaned.split(separators);
    const results = [];
    parts.forEach(p => {
      let subClean = cleanClassName(p);
      if (subClean && subClean !== 'VIRTUAL_CLASS') results.push(subClean);
    });
    return results;
  } else {
    const cName = cleanClassName(cleaned);
    return cName && cName !== 'VIRTUAL_CLASS' ? [cName] : [];
  }
};

const fetchAllRows = async (tableName, queryBuilder = null) => {
  let allData = []; let from = 0; const limit = 1000 
  while (true) {
    let query = supabase.from(tableName).select('*').range(from, from + limit - 1)
    if (queryBuilder) query = queryBuilder(query) 
    const { data, error } = await query
    if (error) throw error
    if (data) allData.push(...data)
    if (!data || data.length < limit) break
    from += limit
  }
  return allData
}

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
  const stdA = standardizeSubjectName(subjA); const stdB = standardizeSubjectName(subjB)
  if (stdA && stdB && stdA === stdB) return true
  const cA = cleanString(subjA); const cB = cleanString(subjB)
  return cA === cB || cA.includes(cB) || cB.includes(cA)
}

const loadAllData = async () => {
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
        settingsData?.forEach(setting => {
          if (setting.key === 'school_name' && setting.value) schoolName.value = setting.value
          if (setting.key === 'school_logo' && setting.value) schoolLogoUrl.value = setting.value
        })
      } catch (err) {}
    }

    const { data: dbClasses } = await supabase.from('classes').select('*')
    const { data: dbTargets } = await supabase.from('subject_targets').select('*')
    const { data: teachers } = await supabase.from('teachers').select('*')
    const timetables = await fetchAllRows('timetable')
    
    const mmiData = await fetchAllRows('mmi_interruptions', (query) => {
      if (startDate.value) query = query.gte('interruption_date', startDate.value)
      if (endDate.value) query = query.lte('interruption_date', endDate.value)
      return query
    })
    
    const leaveData = await fetchAllRows('leave_requests', (query) => {
      if (startDate.value) query = query.gte('leave_date', startDate.value)
      if (endDate.value) query = query.lte('leave_date', endDate.value)
      return query
    })

    let assignQuery = supabase.from('substitute_assignments').select('sub_teacher_id, assignment_type, leave_request_id, leave_requests!inner(leave_date)')
    if (startDate.value) assignQuery = assignQuery.gte('leave_requests.leave_date', startDate.value)
    if (endDate.value) assignQuery = assignQuery.lte('leave_requests.leave_date', endDate.value)
    const { data: assignments } = await assignQuery

    interruptionLogs.value = mmiData || []

    const teacherMap = {}; const teacherNameSet = new Set()
    teachers?.forEach(t => { teacherMap[t.id] = { name: t.name, subject: t.subject, count: 0, interruptedCount: 0 }; teacherNameSet.add(t.name.trim().toUpperCase()) })

    assignments?.forEach(a => { if (a.assignment_type !== 'swap' && a.sub_teacher_id && teacherMap[a.sub_teacher_id]) teacherMap[a.sub_teacher_id].count++ })

    const teacherInterruptionMap = {}
    mmiData?.forEach(l => {
      let rawTarget = (l.target_display || '').trim(); let tName = ''
      if (rawTarget.includes('教师:')) tName = rawTarget.replace('教师:', '').trim()
      else if (rawTarget.includes('GURU:')) tName = rawTarget.replace('GURU:', '').trim()
      else if (rawTarget.includes('TEACHER:')) tName = rawTarget.replace('TEACHER:', '').trim()
      else if (teacherNameSet.has(rawTarget.toUpperCase())) tName = rawTarget
      if (tName) {
        const pCount = (l.end_period || 0) - (l.start_period || 0) + 1
        teacherInterruptionMap[tName.toUpperCase()] = (teacherInterruptionMap[tName.toUpperCase()] || 0) + pCount
      }
    })

    stats.value = Object.values(teacherMap).map(t => ({ ...t, interruptedCount: teacherInterruptionMap[t.name.trim().toUpperCase()] || 0 }))

    if (mmiData) {
      const totalPAll = mmiData.reduce((acc, cur) => acc + ((cur.end_period || 0) - (cur.start_period || 0) + 1), 0)
      const dayNames = { 1: '星期一', 2: '星期二', 3: '星期三', 4: '星期四', 5: '星期五', 6: '星期六', 7: '星期日' }
      const daysCount = {}
      mmiData.forEach(l => { const dIndex = new Date(l.interruption_date).getDay() || 7; const dName = dayNames[dIndex] || '其他'; const pCount = (l.end_period || 0) - (l.start_period || 0) + 1; daysCount[dName] = (daysCount[dName] || 0) + pCount })
      dayOfWeekStats.value = ['星期一', '星期二', '星期三', '星期四', '星期五'].map(day => ({ day, count: daysCount[day] || 0, percentage: totalPAll > 0 ? (((daysCount[day] || 0) / totalPAll) * 100).toFixed(1) : 0 }))
    }

    const teacherMapForMatch = {}
    teachers?.forEach(tch => { if (tch.id) teacherMapForMatch[String(tch.id)] = tch; if (tch.name) teacherMapForMatch[cleanString(tch.name)] = tch })

    const enrichedTimetables = (timetables || []).map(item => {
      const tIdKey = item.teacher_id ? String(item.teacher_id) : ''
      const tNameKey = item.teacher_name ? cleanString(item.teacher_name) : ''
      const teacherObj = teacherMapForMatch[tIdKey] || teacherMapForMatch[tNameKey] || {}
      return { ...item, teacher_info: teacherObj, resolved_teacher_name: teacherObj.name || item.teacher_name || item.teacher || '' }
    })

    const classLostSets = {}; const tempSubjectStats = []
    for (const cls of (dbClasses || [])) {
      const clsName = cleanString(cls.class_name)
      if (!classLostSets[cls.class_name]) classLostSets[cls.class_name] = new Set()
      const gradeTargets = (dbTargets || []).filter(t => Number(t.grade) === Number(cls.grade))

      for (const t of gradeTargets) {
        const standardizedTargetSubject = standardizeSubjectName(t.subject_name)
        const lostSlotSet = new Set()
        const matchedEntries = enrichedTimetables.filter(item => {
          const itemClass = cleanString(item.class_name)
          const isClassMatched = itemClass === clsName || itemClass.includes(clsName) || clsName.includes(itemClass)
          if (!isClassMatched) return false
          const rawSubj = item.subject || item.subject_name || item.teacher_info?.subject_name || ''
          return isSubjectMatch(rawSubj, standardizedTargetSubject)
        })
        const assignedTeacherNames = [...new Set(matchedEntries.map(e => e.resolved_teacher_name).filter(Boolean))]
        const assignedTeacherIds = [...new Set(matchedEntries.map(e => e.teacher_id || e.teacher_info?.id).filter(Boolean))]

        leaveData?.forEach(req => {
          const reqClass = cleanString(req.class_name)
          const isClassMatched = reqClass === clsName || reqClass.includes(clsName) || clsName.includes(reqClass)
          const isSubjMatched = isSubjectMatch(req.subject, standardizedTargetSubject)
          const reqTeacherNameClean = cleanString(req.teacher_name)
          const isTeacherMatched = assignedTeacherIds.some(id => req.teacher_id && String(req.teacher_id) === String(id)) || assignedTeacherNames.some(name => reqTeacherNameClean && cleanString(name) === reqTeacherNameClean)
          if (isTeacherMatched && isClassMatched && isSubjMatched) {
            if (req.leave_date) {
              const leaveWeekday = new Date(req.leave_date).getDay()
              enrichedTimetables.forEach(item => {
                const itemClass = cleanString(item.class_name)
                const itemSubj = item.subject || item.subject_name || item.teacher_info?.subject_name || ''
                const itemWeekday = Number(item.weekday)
                const matchCls = itemClass === clsName || itemClass.includes(clsName) || clsName.includes(itemClass)
                const matchSubj = isSubjectMatch(itemSubj, standardizedTargetSubject)
                const matchWd = itemWeekday === leaveWeekday || itemWeekday === (leaveWeekday === 0 ? 7 : leaveWeekday)
                const matchPeriod = Number(item.period) === Number(req.period)
                if (matchCls && matchSubj && matchWd && matchPeriod) {
                  const slotKey = `${req.leave_date}-P${item.period}`; lostSlotSet.add(slotKey); classLostSets[cls.class_name].add(slotKey)
                }
              })
            } else {
              const randomSlot = `NODATE-${Math.random()}`; lostSlotSet.add(randomSlot); classLostSets[cls.class_name].add(randomSlot)
            }
          }
        })

        mmiData?.forEach(int => {
          if (int.type === 'class') {
            const startP = Number(int.start_period) || 1; const endP = Number(int.end_period) || 1
            const intScope = int.scope ? int.scope.trim() : ''; const targetDisp = int.target_display ? int.target_display.trim() : ''
            const intGrade = Number(int.grade); const intClass = cleanString(int.class_name)
            const intWeekday = new Date(int.interruption_date).getDay()
            const isClassAffected = intScope === 'all' || targetDisp.includes('全校') || targetDisp.includes('SEMUA') || targetDisp.includes('WHOLE SCHOOL') || (intScope === 'grade' && intGrade === Number(cls.grade)) || targetDisp.includes(`Tahun ${cls.grade}`) || targetDisp.includes(`TAHUN ${cls.grade}`) || targetDisp.includes(`${cls.grade} 年级`) || targetDisp.includes(`YEAR ${cls.grade}`) || targetDisp.includes(`Year ${cls.grade}`) || (intScope === 'class' && (intClass.includes(clsName) || clsName.includes(intClass || ''))) || targetDisp.includes(clsName)
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
                  const slotKey = `${int.interruption_date}-P${item.period}`; lostSlotSet.add(slotKey); classLostSets[cls.class_name].add(slotKey)
                }
              })
            }
          }
        })

        if (lostSlotSet.size > 0) {
          tempSubjectStats.push({
            id: `${cls.grade}_${cls.class_name}_${t.subject_name}`,
            grade: String(cls.grade), className: cls.class_name, subjectName: t.subject_name, totalPeriods: lostSlotSet.size
          })
        }
      }
    }

    let totalClassPeriods = Object.values(classLostSets).reduce((sum, set) => sum + set.size, 0)
    classStats.value = Object.keys(classLostSets)
      .map(cName => { const count = classLostSets[cName].size; return { className: cName, totalPeriods: count, percentage: totalClassPeriods > 0 ? ((count / totalClassPeriods) * 100).toFixed(1) : 0 } })
      .filter(c => c.totalPeriods > 0).sort((a, b) => b.totalPeriods - a.totalPeriods)

    subjectStats.value = tempSubjectStats.sort((a, b) => b.totalPeriods - a.totalPeriods)

  } catch (err) {
    console.error('加载分析数据异常:', err)
  }
}

onMounted(loadAllData); onActivated(() => { loadAllData() })

const exportSinglePdf = async () => {
  const REPORT_TITLES = {
    overview: 'RINGKASAN OPERASI & BEBAN GURU GANTI',
    reason: 'ANALISIS PUNCA KETIDAKHADIRAN GURU',
    'large-scale': 'ANALISIS GANGGUAN ACARA & AKTIVITI KELAS',
    trend: 'STATISTIK TREND & PUNCAK GANGGUAN KELAS',
    class: 'ANALISIS GANGGUAN MENGIKUT KELAS',
    subject: 'ANALISIS GANGGUAN MENGIKUT SUBJEK & KELAS',
    teacher: 'PROFIL PENUGASAN GURU GANTI & GANGGUAN'
  }

  const title = REPORT_TITLES[currentTab.value] || REPORT_TITLES.overview
  const safeFileName = title.replace(/[^A-Z0-9À-ÿ _-]/gi, '').replace(/\s+/g, '_').slice(0, 120)

  const PAGE_W = 1240; const PAGE_H = 1754; const MARGIN = 50; const CONTENT_W = PAGE_W - MARGIN * 2
  const HEADER_H = 340; const FOOTER_H = 58; const ROW_H = 56        

  const canvas = document.createElement('canvas'); canvas.width = PAGE_W; canvas.height = PAGE_H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context is unavailable.')

  const loadLogo = async () => {
    if (!schoolLogoUrl.value) return null
    try {
      const response = await fetch(schoolLogoUrl.value, { mode: 'cors' })
      if (!response.ok) return null
      const blob = await response.blob()
      const dataUrl = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(blob) })
      const img = new Image(); img.crossOrigin = 'anonymous'; img.src = dataUrl
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject })
      return img
    } catch (e) { return null }
  }

  const logo = await loadLogo()
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true })
  let pageNumber = 1

  const clearPage = () => { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, PAGE_W, PAGE_H); ctx.textBaseline = 'top' }
  const setFont = (size, weight = 400) => { ctx.font = `${weight} ${size}px Arial, "Noto Sans", "Noto Sans CJK SC", sans-serif` }
  const wrapText = (text, maxWidth, fontSize = 20, weight = 400) => {
    const value = String(text ?? ''); setFont(fontSize, weight); const lines = []; let line = ''
    for (const char of value) {
      const test = line + char
      if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = char } else { line = test }
    }
    if (line) lines.push(line); return lines.length ? lines : ['']
  }

  const drawHeader = () => {
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, PAGE_W, HEADER_H + MARGIN)
    let currentY = MARGIN + 10
    if (logo) { const size = 110; const x = (PAGE_W - size) / 2; ctx.drawImage(logo, x, currentY, size, size); currentY += size + 18 }
    setFont(22, 800); ctx.fillStyle = '#1e1b4b'; ctx.textAlign = 'center'
    const titleLines = wrapText(title, CONTENT_W - 40, 22, 800)
    titleLines.forEach((line, index) => { ctx.fillText(line, PAGE_W / 2, currentY + index * 30) })
    currentY += titleLines.length * 30 + 10
    setFont(20, 700); ctx.fillStyle = '#334155'; ctx.fillText(schoolName.value || 'SJK (C) LADANG GRISEK', PAGE_W / 2, currentY)
    currentY += 31
    setFont(14, 600); ctx.fillStyle = '#64748b'
    const period = startDate.value && endDate.value ? `${startDate.value} - ${endDate.value}` : 'KESELURUHAN TEMPOH DATA'
    ctx.fillText(`TEMPOH ANALISIS: ${period}`, PAGE_W / 2, currentY)
    currentY += 25
    ctx.strokeStyle = '#c7d2fe'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(MARGIN, currentY); ctx.lineTo(PAGE_W - MARGIN, currentY); ctx.stroke(); ctx.textAlign = 'left'
  }

  const drawFooter = () => {
    ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(MARGIN, PAGE_H - 48); ctx.lineTo(PAGE_W - MARGIN, PAGE_H - 48); ctx.stroke()
    setFont(11, 500); ctx.fillStyle = '#94a3b8'; ctx.fillText(`LAPORAN RASMI DIJANA SECARA SISTEM • ${schoolName.value || ''}`, MARGIN, PAGE_H - 34)
    ctx.textAlign = 'right'; ctx.fillText(`HALAMAN ${pageNumber}`, PAGE_W - MARGIN, PAGE_H - 34); ctx.textAlign = 'left'
  }

  let y = MARGIN + HEADER_H + 10

  const commitCurrentPage = () => {
    drawFooter(); const image = canvas.toDataURL('image/jpeg', 0.94)
    if (pageNumber === 1) pdf.addImage(image, 'JPEG', 0, 0, 210, 297, undefined, 'FAST')
    else { pdf.addPage(); pdf.addImage(image, 'JPEG', 0, 0, 210, 297, undefined, 'FAST') }
  }

  const startNewPage = () => {
    commitCurrentPage(); pageNumber++; clearPage()
    if (pageNumber === 1) { drawHeader(); y = MARGIN + HEADER_H + 10 } else { y = MARGIN + 20 }
  }

  const ensureSpace = (height) => { if (y + height > PAGE_H - FOOTER_H) startNewPage() }

  const drawSectionTitle = (text) => {
    ensureSpace(54); setFont(20, 800); ctx.fillStyle = '#1e1b4b'; ctx.fillText(text, MARGIN, y); y += 34
    ctx.strokeStyle = '#c7d2fe'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(MARGIN, y); ctx.lineTo(PAGE_W - MARGIN, y); ctx.stroke(); y += 16
  }

  const drawKpiCard = (x, width, label, value, accent = '#0f172a') => {
    ctx.fillStyle = '#f8fafc'; ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(x, y, width, 112, 16); ctx.fill(); ctx.stroke()
    setFont(12, 700); ctx.fillStyle = '#64748b'; ctx.fillText(label, x + 18, y + 18)
    setFont(31, 800); ctx.fillStyle = accent; ctx.fillText(String(value), x + 18, y + 51)
  }

  const drawTable = (headers, rows, widths) => {
    const tableW = CONTENT_W; const normalized = widths || headers.map(() => tableW / headers.length); ensureSpace(ROW_H * 2)
    const drawRow = (cells, header = false) => {
      let x = MARGIN; const rowLines = cells.map((cell, i) => wrapText(cell, normalized[i] - 24, header ? 13 : 12, header ? 700 : 500))
      const maxLines = Math.max(...rowLines.map(a => a.length), 1); const height = Math.max(ROW_H, maxLines * 22 + 20); ensureSpace(height + 4)
      if (header) { ctx.fillStyle = '#e0e7ff'; ctx.strokeStyle = '#c7d2fe' } else { ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#e2e8f0' }
      ctx.lineWidth = 1; ctx.fillRect(MARGIN, y, tableW, height); ctx.strokeRect(MARGIN, y, tableW, height)
      rowLines.forEach((linesForCell, i) => {
        setFont(header ? 13 : 12, header ? 700 : 500); ctx.fillStyle = header ? '#312e81' : '#0f172a'
        const totalTextH = linesForCell.length * 20; const startY = y + (height - totalTextH) / 2
        linesForCell.forEach((line, li) => {
          if (!header && (i >= 2)) { ctx.textAlign = 'center'; ctx.fillText(line, x + normalized[i] / 2, startY + li * 20); ctx.textAlign = 'left' }
          else { ctx.fillText(line, x + 12, startY + li * 20) }
        }); x += normalized[i]
        if (i < cells.length - 1) { ctx.strokeStyle = '#cbd5e1'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + height); ctx.stroke() }
      }); y += height
    }
    drawRow(headers, true); rows.forEach(row => drawRow(row.map(v => String(v ?? '-')))); y += 14
  }

  const drawGroupBlocks = (groups, sectionTitle) => {
    drawSectionTitle(sectionTitle)
    groups.forEach(group => {
      ensureSpace(90); setFont(15, 800); ctx.fillStyle = '#1e1b4b'; ctx.fillText(group.title.toUpperCase(), MARGIN, y)
      setFont(13, 700); ctx.fillStyle = '#475569'; ctx.textAlign = 'right'; ctx.fillText(`JUMLAH: ${group.total} SLOT`, PAGE_W - MARGIN, y); ctx.textAlign = 'left'; y += 30
      group.items.forEach(item => {
        ensureSpace(42); setFont(12, 600); ctx.fillStyle = '#334155'; ctx.fillText(`${item.reason} — ${item.count} (${item.percentage}%)`, MARGIN, y)
        const barX = MARGIN; const barY = y + 21; const barW = CONTENT_W
        ctx.fillStyle = '#e2e8f0'; ctx.fillRect(barX, barY, barW, 10)
        ctx.fillStyle = '#4f46e5'; ctx.fillRect(barX, barY, Math.max(2, barW * Number(item.percentage) / 100), 10); y += 39
      }); y += 10
    })
  }

  const drawTeacherReasons = () => drawGroupBlocks(categorizedReasons.value.teacher, 'ANALISIS PUNCA KETIDAKHADIRAN GURU (KATEGORI)')
  
  const drawLargeScale = () => {
    drawGroupBlocks(categorizedReasons.value.events, 'ANALISIS PUNCA GANGGUAN ACARA (KATEGORI)')
    drawSectionTitle('SENARAI AKTIVITI BERSKALA BESAR (SEKOLAH & TAHUN)')
    const rows = sortedLargeScaleStats.value.map(s => [s.reason, s.scope, `${s.frequency}`, `${s.totalPeriods}`])
    drawTable(['NAMA AKTIVITI', 'SKOP IMPAK', 'KEKERAPAN', 'JUMLAH GANGGUAN'], rows, [460, 240, 200, 240])
  }

  const drawOverview = () => {
    drawSectionTitle('RINGKASAN OPERASI & BEBAN TUGAS')
    const gap = 18; const cardW = (CONTENT_W - gap * 2) / 3
    drawKpiCard(MARGIN, cardW, 'JUMLAH GANGGUAN', `${totalInterruptionPeriods.value}`, '#0f172a')
    drawKpiCard(MARGIN + cardW + gap, cardW, 'JUMLAH GURU GANTI', `${totalSubstituteCount.value}`, '#4f46e5')
    drawKpiCard(MARGIN + (cardW + gap) * 2, cardW, 'REKOD GANGGUAN', `${interruptionLogs.value.length}`, '#0f172a')
    y += 138
    drawSectionTitle('GURU DENGAN BEBAN GURU GANTI TERTINGGI')
    const rows = sortedSubstituteStats.value.slice(0, 5).map((t, i) => [`#${i + 1}`, t.name || '-', t.subject || '-', `${t.count || 0}`])
    drawTable(['KEDUDUKAN', 'NAMA GURU', 'SUBJEK', 'JUMLAH GURU GANTI'], rows, [140, 480, 280, 240])
  }

  const drawTrend = () => {
    drawSectionTitle('TREND & PUNCAK HARI GANGGUAN')
    const gap = 18; const cardW = (CONTENT_W - gap * 4) / 5
    dayOfWeekStats.value.forEach((d, i) => drawKpiCard(MARGIN + i * (cardW + gap), cardW, d.day.toUpperCase(), `${d.count}`, '#4f46e5'))
    y += 138
    drawTable(['HARI', 'JUMLAH GANGGUAN', 'PERATUS'], dayOfWeekStats.value.map(d => [d.day, `${d.count}`, `${d.percentage}%`]), [380, 380, 380])
  }

  const drawClass = () => {
    drawSectionTitle('TABURAN GANGGUAN MENGIKUT KELAS')
    const rows = filteredClassStats.value.map(c => [c.className, `${c.totalPeriods}`, `${c.percentage}%`])
    drawTable(['KELAS', 'JUMLAH GANGGUAN', 'PERATUS'], rows, [480, 380, 280])
  }

  const drawSubject = () => {
    drawSectionTitle('IMPAK GANGGUAN MENGIKUT SUBJEK & KELAS')
    const rows = filteredSubjectStats.value.map(s => [s.grade, s.className, s.subjectName, `${s.totalPeriods}`])
    drawTable(['TAHUN', 'KELAS', 'SUBJEK', 'JUMLAH GANGGUAN'], rows, [180, 300, 460, 200])
  }

  const drawTeacher = () => {
    drawSectionTitle('PROFIL KESELURUHAN PENUGASAN GURU GANTI')
    const rows = sortedTeacherStats.value.map(t => [t.name || '-', t.subject || '-', `${t.count || 0}`, `${t.interruptedCount || 0}`])
    drawTable(['NAMA GURU', 'SUBJEK', 'GURU GANTI', 'GANGGUAN'], rows, [440, 340, 180, 180])
  }

  try {
    clearPage(); drawHeader(); y = MARGIN + HEADER_H + 10

    if (currentTab.value === 'overview') drawOverview()
    else if (currentTab.value === 'reason') drawTeacherReasons()
    else if (currentTab.value === 'large-scale') drawLargeScale()
    else if (currentTab.value === 'trend') drawTrend()
    else if (currentTab.value === 'class') drawClass()
    else if (currentTab.value === 'subject') drawSubject()
    else if (currentTab.value === 'teacher') drawTeacher()

    commitCurrentPage(); pdf.save(`MMI_${safeFileName}.pdf`)
  } catch (error) { console.error('PDF 生成失败:', error); alert('PDF 生成失败，请查看浏览器控制台。') }
}
</script>

<style scoped>
.print-header { display: none; }
@media print {
  @page { size: portrait; margin: 10mm; }
  .no-print { display: none !important; }
  .print-header { display: block !important; margin-bottom: 20px; }
  body, * { font-family: "Microsoft YaHei", "PingFang SC", "Heiti SC", Arial, sans-serif !important; background: white !important; color: black !important; print-color-adjust: exact; }
  .print-table { width: 100% !important; border-collapse: collapse !important; font-size: 11px !important; }
  .print-table th, .print-table td { border: 1px solid #cbd5e1 !important; padding: 8px 10px !important; }
  .print-table th { background-color: #f1f5f9 !important; color: #0f172a !important; }
}
</style>