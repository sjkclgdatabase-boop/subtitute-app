<template>
  <div class="p-4 sm:p-8 mx-auto min-h-screen space-y-8 min-w-[1024px] print:p-0 print:max-w-none print:min-w-0">
    
    <!-- 顶部标题：统一的卡片风格、排版规范与渐变大标题 -->
    <div class="no-print bg-white rounded-3xl p-6 sm:p-8 shadow-sm ring-1 ring-slate-900/5 space-y-2">
      <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-800 to-violet-800 flex items-center gap-3">
        <ChartNoAxesCombined class="w-8 h-8 text-indigo-700 shrink-0" />
        教务数据分析与 MMI 报表中心
      </h1>
      <p class="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">
        多维度监控教学干扰、科目影响及教师代课负荷（已完美统合请假勾选节次与全校/跨班级活动干扰损失）。
      </p>
    </div>

    <!-- 🌐 全局日期范围筛选器控制面板 -->
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

    <!-- 顶栏：分析视角切换按钮 (Tab) -->
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
        :class="currentTab === 'reason' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'"
        class="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
      >
        <TriangleAlert class="w-4 h-4" />
        项目干扰分析
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
        班级干扰分析
      </button>
      <button 
        @click="currentTab = 'subject'" 
        :class="currentTab === 'subject' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'"
        class="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
      >
        <BookOpen class="w-4 h-4" />
        科目与班级细化干扰分析
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

    <!-- ================= TAB 2: 项目分析 (四大分类卡片版) ================= -->
    <div v-if="currentTab === 'reason'" class="bg-white p-8 rounded-3xl shadow-sm ring-1 ring-slate-900/5 space-y-6 animate-fadeIn">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
            <TriangleAlert class="w-5 h-5 text-orange-600" />
            教学干扰分类统计
          </h2>
          <p class="text-xs text-slate-500 mt-1 font-medium">按个人请假、离校公干、校内任务及历史无标签数据分类展示。</p>
        </div>
        <button @click="exportSinglePdf" class="no-print px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm">
          <Printer class="w-4 h-4" />
          下载 PDF
        </button>
      </div>
      
      <div v-if="groupedReasonStats.length === 0" class="text-xs text-slate-400 py-12 text-center border border-dashed rounded-2xl font-medium">该时间段暂无干扰记录</div>
      
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div v-for="group in groupedReasonStats" :key="group.id" class="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col hover:shadow-sm transition-shadow">
          <div class="flex justify-between items-center mb-5 pb-4 border-b border-slate-200/80">
            <h3 class="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <component :is="group.iconComponent" class="w-4 h-4 text-slate-600" />
              {{ group.title }}
            </h3>
            <span class="text-[11px] font-bold px-3 py-1 rounded-full shadow-sm" :class="group.badgeClass">
              累计 {{ group.total }} 节
            </span>
          </div>
          
          <div class="space-y-4 flex-1">
            <div v-for="item in group.items" :key="item.reason" class="space-y-1.5">
              <div class="flex justify-between text-xs font-bold text-slate-700">
                <span class="truncate pr-4" :title="item.reason">{{ item.reason }}</span>
                <span class="whitespace-nowrap">{{ item.count }} 节 (占总数 {{ item.percentage }}%)</span>
              </div>
              <div class="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-500" :class="group.barClass" :style="{ width: item.percentage + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= TAB 3: 日期高峰 ================= -->
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

    <!-- ================= TAB 4: 班级干扰分析 (带年级筛选器) ================= -->
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

      <!-- 🌟 班级页面的年级筛选器面板 -->
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

    <!-- ================= TAB 5: 被影响最多的科目与班级明细排行 (带年级与班级筛选器) ================= -->
    <div v-if="currentTab === 'subject'" class="bg-white p-8 rounded-3xl shadow-sm ring-1 ring-slate-900/5 space-y-6 animate-fadeIn">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen class="w-5 h-5 text-indigo-600" />
            科目与班级细化干扰分析
          </h2>
          <p class="text-xs text-slate-500 mt-1 font-medium">按年级、班级多维度筛选科目受干扰详情（已完美整合请假勾选节次及全校/跨班级活动冲击，合班记录已自动独立拆分）。</p>
        </div>
        <button @click="exportSinglePdf" class="no-print px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm">
          <Printer class="w-4 h-4" />
          下载 PDF
        </button>
      </div>

      <!-- 🌟 年级与班级联动筛选器面板 -->
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

    <!-- ================= TAB 7: 老师干扰总表 ================= -->
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
  ChartNoAxesCombined, 
  CalendarDays, 
  RefreshCw, 
  LayoutDashboard, 
  TriangleAlert, 
  School, 
  BookOpen, 
  UsersRound, 
  Clock3, 
  ArrowLeftRight, 
  FileText, 
  Scale, 
  Printer, 
  Filter,
  CalendarCheck,
  BriefcaseBusiness,
  Building2,
  FolderOpen
} from 'lucide-vue-next'

const currentTab = ref('overview')

const schoolName = ref('SJK (C) LADANG GRISEK')
const schoolLogoUrl = ref('/logo.png')

const startDate = ref('')
const endDate = ref('')

const stats = ref([])
const interruptionLogs = ref([])
const reasonStats = ref([])
const dayOfWeekStats = ref([])
const classStats = ref([])
const subjectStats = ref([])

const selectedClassGradeFilter = ref('') 
const selectedGradeFilter = ref('')      
const selectedClassFilter = ref('')      

const gradeOrderMap = {
  '一年级': 1,
  '二年级': 2,
  '三年级': 3,
  '四年级': 4,
  '五年级': 5,
  '六年级': 6
};

const sortGrgradesHelper = (setObj) => {
  return Array.from(setObj).sort((a, b) => {
    const wA = gradeOrderMap[a] !== undefined ? gradeOrderMap[a] : 99;
    const wB = gradeOrderMap[b] !== undefined ? gradeOrderMap[b] : 99;
    return wA - wB;
  });
};

const getGradeFromClass = (cName) => {
  if (!cName) return '其他年级';
  const match = cName.match(/^([0-9]+)/);
  if (match) {
    const gradeNum = match[1];
    const gradeMap = {
      '1': '一年级',
      '2': '二年级',
      '3': '三年级',
      '4': '四年级',
      '5': '五年级',
      '6': '六年级'
    };
    return gradeMap[gradeNum] || `${gradeNum}年级`;
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

  if (selectedGradeFilter.value) {
    list = list.filter(s => s.grade === selectedGradeFilter.value)
  }

  if (selectedClassFilter.value) {
    list = list.filter(s => s.className === selectedClassFilter.value)
  }

  return [...list].sort((a, b) => smartSort(a[subjectSortKey.value], b[subjectSortKey.value], subjectSortAsc.value))
})

const groupedReasonStats = computed(() => {
  if (!reasonStats.value.length) return [];

  const groups = {
    personal: { id: 'personal', title: '个人请假', iconComponent: CalendarCheck, items: [], total: 0, badgeClass: 'bg-orange-100 text-orange-700', barClass: 'bg-orange-500' },
    official: { id: 'official', title: '离校公干', iconComponent: BriefcaseBusiness, items: [], total: 0, badgeClass: 'bg-blue-100 text-blue-700', barClass: 'bg-blue-500' },
    internal: { id: 'internal', title: '校内任务', iconComponent: Building2, items: [], total: 0, badgeClass: 'bg-emerald-100 text-emerald-700', barClass: 'bg-emerald-500' },
    others:   { id: 'others', title: '历史记录 / 其他杂项', iconComponent: FolderOpen, items: [], total: 0, badgeClass: 'bg-slate-200 text-slate-700', barClass: 'bg-slate-400' }
  };

  const totalPAll = reasonStats.value.reduce((acc, cur) => acc + cur.count, 0);

  reasonStats.value.forEach(item => {
    let cleanReason = item.reason.replace(/\[.*?\]\s*/, '');
    let targetGroup = 'others';

    if (item.reason.includes('[个人请假]')) targetGroup = 'personal';
    else if (item.reason.includes('[离校公干]')) targetGroup = 'official';
    else if (item.reason.includes('[校内任务]')) targetGroup = 'internal';

    groups[targetGroup].items.push({
      reason: cleanReason,
      count: item.count,
      percentage: totalPAll > 0 ? ((item.count / totalPAll) * 100).toFixed(1) : 0
    });
    groups[targetGroup].total += item.count;
  });

  Object.values(groups).forEach(g => {
    if (g.items.length > 8) {
      const top8 = g.items.slice(0, 8);
      const remaining = g.items.slice(8);
      const remainingCount = remaining.reduce((sum, r) => sum + r.count, 0);
      
      top8.push({
        reason: '其他碎项合并 (Lain-lain)',
        count: remainingCount,
        percentage: totalPAll > 0 ? ((remainingCount / totalPAll) * 100).toFixed(1) : 0
      });
      g.items = top8;
    }
  });

  return Object.values(groups)
    .filter(g => g.total > 0)
    .sort((a, b) => b.total - a.total);
});

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

const classSortKey = ref('totalPeriods')
const classSortAsc = ref(false)
const sortClassTable = (key) => {
  if (classSortKey.value === key) classSortAsc.value = !classSortAsc.value
  else { classSortKey.value = key; classSortAsc.value = true }
}

const subjectSortKey = ref('totalPeriods')
const subjectSortAsc = ref(false)
const sortSubjectTable = (key) => {
  if (subjectSortKey.value === key) subjectSortAsc.value = !subjectSortAsc.value
  else { subjectSortKey.value = key; subjectSortAsc.value = true }
}

const teacherSortKey = ref('count')
const teacherSortAsc = ref(false)
const sortTeacherTable = (key) => {
  if (teacherSortKey.value === key) teacherSortAsc.value = !teacherSortAsc.value
  else { teacherSortKey.value = key; teacherSortAsc.value = true }
}
const sortedTeacherStats = computed(() => [...stats.value].sort((a, b) => smartSort(a[teacherSortKey.value], b[teacherSortKey.value], teacherSortAsc.value)))

const totalSubstituteCount = computed(() => stats.value.reduce((acc, cur) => acc + (cur.count || 0), 0))
const totalInterruptionPeriods = computed(() => interruptionLogs.value.reduce((acc, cur) => acc + ((cur.end_period || 0) - (cur.start_period || 0) + 1), 0))
const sortedSubstituteStats = computed(() => [...stats.value].sort((a, b) => (b.count || 0) - (a.count || 0)))

const resetDateFilter = () => {
  startDate.value = ''
  endDate.value = ''
  selectedClassGradeFilter.value = ''
  selectedGradeFilter.value = ''
  selectedClassFilter.value = ''
  loadAllData()
}

const cleanClassName = (rawStr) => {
  if (!rawStr) return '';
  let cleaned = rawStr.replace(/^(班级|班級|KELAS|CLASS)\s*[:：]\s*/i, '').trim();
  cleaned = cleaned.replace(/^(班级|班級|KELAS|CLASS)\s*[:：]\s*/i, '').trim();
  if (!cleaned || /VIRTUAL_CLASS/i.test(cleaned)) return '';
  return cleaned.toUpperCase();
};

// 🌟 核心增强函数：自动将合班字符串（如 "6B/6C" 或 "5C, 5D"）拆分为独立的班级数组
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
      if (subClean && subClean !== 'VIRTUAL_CLASS') {
        results.push(subClean);
      }
    });
    return results;
  } else {
    const cName = cleanClassName(cleaned);
    return cName && cName !== 'VIRTUAL_CLASS' ? [cName] : [];
  }
};

const loadAllData = async () => {
  try {
    const { data: schoolData } = await supabase
      .from('school_settings')
      .select('*')
      .limit(1)
      .single()

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
    } catch (err) {
      console.warn('学校品牌资料读取失败，PDF 将使用默认学校资料。', err)
    }
  }

  const { data: teachers } = await supabase.from('teachers').select('*')
  
  let assignQuery = supabase
    .from('substitute_assignments')
    .select('sub_teacher_id, assignment_type, leave_request_id, leave_requests!inner(leave_date)')

  if (startDate.value) assignQuery = assignQuery.gte('leave_requests.leave_date', startDate.value)
  if (endDate.value) assignQuery = assignQuery.lte('leave_requests.leave_date', endDate.value)

  const { data: assignments } = await assignQuery

  const swapLeaveIds = new Set()
  assignments?.forEach(a => {
    if (a.assignment_type === 'swap' && a.leave_request_id) {
      swapLeaveIds.add(a.leave_request_id)
    }
  })

  let mmiQuery = supabase.from('mmi_interruptions').select('*')
  if (startDate.value) mmiQuery = mmiQuery.gte('interruption_date', startDate.value)
  if (endDate.value) mmiQuery = mmiQuery.lte('interruption_date', endDate.value)
  const { data: mmiData } = await mmiQuery

  if (mmiData) interruptionLogs.value = mmiData

  let leaveQuery = supabase.from('leave_requests').select('*')
  if (startDate.value) leaveQuery = leaveQuery.gte('leave_date', startDate.value)
  if (endDate.value) leaveQuery = leaveQuery.lte('leave_date', endDate.value)
  const { data: leaveData } = await leaveQuery

  const { data: timetables } = await supabase.from('timetable').select('*')

  const teacherMap = {}
  const teacherNameSet = new Set()
  
  teachers?.forEach(t => {
    teacherMap[t.id] = { name: t.name, subject: t.subject, count: 0, interruptedCount: 0 }
    teacherNameSet.add(t.name.trim().toUpperCase())
  })

  assignments?.forEach(a => {
    if (a.assignment_type !== 'swap' && a.sub_teacher_id && teacherMap[a.sub_teacher_id]) {
      teacherMap[a.sub_teacher_id].count++
    }
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
    const totalPAll = mmiData.reduce((acc, cur) => acc + ((cur.end_period || 0) - (cur.start_period || 0) + 1), 0)
    const reasons = {}
    mmiData.forEach(l => { 
      const pCount = (l.end_period || 0) - (l.start_period || 0) + 1; 
      let rawReason = (l.reason || '未填写').trim().toUpperCase();
      rawReason = rawReason.replace(/^(教师请假:\s*|CUTI GURU:\s*)/i, ''); 
      reasons[rawReason] = (reasons[rawReason] || 0) + pCount;
    })
    
    reasonStats.value = Object.entries(reasons)
      .map(([reason, count]) => ({ reason, count, percentage: totalPAll > 0 ? ((count / totalPAll) * 100).toFixed(1) : 0 }))
      .sort((a, b) => b.count - a.count)

    const dayNames = { 1: '星期一', 2: '星期二', 3: '星期三', 4: '星期四', 5: '星期五', 6: '星期六', 7: '星期日' }
    const daysCount = {}
    mmiData.forEach(l => { const dIndex = new Date(l.interruption_date).getDay() || 7; const dName = dayNames[dIndex] || '其他'; const pCount = (l.end_period || 0) - (l.start_period || 0) + 1; daysCount[dName] = (daysCount[dName] || 0) + pCount })
    dayOfWeekStats.value = ['星期一', '星期二', '星期三', '星期四', '星期五'].map(day => ({ day, count: daysCount[day] || 0, percentage: totalPAll > 0 ? (((daysCount[day] || 0) / totalPAll) * 100).toFixed(1) : 0 }))
  }

  const classMap = {}
  const subjectDetailMap = {} 
  let totalClassPeriods = 0

  mmiData?.forEach(l => { 
    let rawTarget = (l.target_display || '').trim(); 
    if (/^GURU:/i.test(rawTarget) || rawTarget.includes('教师') || teacherNameSet.has(rawTarget.toUpperCase()) || /VIRTUAL_CLASS/i.test(rawTarget)) return; 
    const pCount = (l.end_period || 0) - (l.start_period || 0) + 1; 
    
    // 🌟 运用 expandClassNames 将合班拆解
    const splitClasses = expandClassNames(rawTarget);
    splitClasses.forEach(cName => {
      classMap[cName] = (classMap[cName] || 0) + pCount;
      totalClassPeriods += pCount;
    });
  })

  leaveData?.forEach(req => {
    if (swapLeaveIds.has(req.id)) return;

    // 🌟 运用 expandClassNames 将合班拆解
    const splitClasses = expandClassNames(req.class_name);
    splitClasses.forEach(cName => {
      classMap[cName] = (classMap[cName] || 0) + 1;
      totalClassPeriods += 1;
    });

    const sub = req.subject ? req.subject.trim().toUpperCase() : 'UNKNOWN';
    if (sub && sub !== 'UNKNOWN' && !sub.includes('VIRTUAL_SUB')) {
      splitClasses.forEach(cleanC => {
        const grade = getGradeFromClass(cleanC);
        const compositeKey = `${grade}_${cleanC}_${sub}`;
        if (!subjectDetailMap[compositeKey]) {
          subjectDetailMap[compositeKey] = {
            id: compositeKey,
            grade: grade,
            className: cleanC,
            subjectName: sub,
            totalPeriods: 0
          };
        }
        subjectDetailMap[compositeKey].totalPeriods += 1;
      });
    }
  })

  mmiData?.forEach(int => {
    if (int.type === 'class' && timetables && timetables.length > 0) {
      const startP = Number(int.start_period) || 1;
      const endP = Number(int.end_period) || 1;
      const targetDisp = (int.target_display || '').trim();

      const intDate = new Date(int.interruption_date);
      const wd = intDate.getDay();
      const weekdayNum = wd === 0 ? 7 : wd;

      timetables.forEach(t => {
        if (Number(t.weekday) !== weekdayNum) return;
        const p = Number(t.period);
        if (p < startP || p > endP) return;

        // 🌟 运用 expandClassNames 将课表中的合班拆解
        const splitClasses = expandClassNames(t.class_name);
        if (splitClasses.length === 0) return;

        let isAffected = false;
        if (targetDisp.includes('全校')) {
          isAffected = true;
        } else if (targetDisp.includes('全年级') || targetDisp.includes('Tahun')) {
          const match = targetDisp.match(/Tahun\s*(\d)/i) || targetDisp.match(/(\d)\s*年级/);
          const gradeNum = match ? match[1] : null;
          if (gradeNum) {
            isAffected = splitClasses.some(cName => cName.startsWith(gradeNum) || getGradeFromClass(cName).includes(gradeNum));
          } else {
            isAffected = true;
          }
        } else {
          const targetList = targetDisp.split(/,|、|\//).map(s => cleanClassName(s));
          isAffected = targetList.some(tc => tc && splitClasses.some(cName => cName === tc || cName.includes(tc) || tc.includes(cName)));
        }

        if (isAffected) {
          const sub = t.subject ? t.subject.trim().toUpperCase() : 'UNKNOWN';
          if (sub && sub !== 'UNKNOWN' && !sub.includes('VIRTUAL_SUB')) {
            splitClasses.forEach(cName => {
              const grade = getGradeFromClass(cName);
              const compositeKey = `${grade}_${cName}_${sub}`;
              if (!subjectDetailMap[compositeKey]) {
                subjectDetailMap[compositeKey] = {
                  id: compositeKey,
                  grade: grade,
                  className: cName,
                  subjectName: sub,
                  totalPeriods: 0
                };
              }
              subjectDetailMap[compositeKey].totalPeriods += 1;
            });
          }
        }
      });
    }
  });

  classStats.value = Object.entries(classMap)
    .map(([className, totalPeriods]) => ({ 
      className, 
      totalPeriods, 
      percentage: totalClassPeriods > 0 ? ((totalPeriods / totalClassPeriods) * 100).toFixed(1) : 0 
    }))
    .sort((a, b) => b.totalPeriods - a.totalPeriods)

  subjectStats.value = Object.values(subjectDetailMap)
    .sort((a, b) => b.totalPeriods - a.totalPeriods)
}

onMounted(loadAllData)

onActivated(() => {
  loadAllData()
})

const exportSinglePdf = async () => {
  const REPORT_TITLES = {
    overview: 'RINGKASAN OPERASI & BEBAN GURU GANTI',
    reason: 'ANALISIS PUNCA KETIDAKHADIRAN & GANGGUAN PDPC',
    trend: 'STATISTIK TREND & PUNCAK GANGGUAN KELAS',
    class: 'ANALISIS GANGGUAN MENGIKUT KELAS',
    subject: 'ANALISIS GANGGUAN MENGIKUT SUBJEK & KELAS',
    teacher: 'PROFIL PENUGASAN GURU GANTI & GANGGUAN'
  }

  const title = REPORT_TITLES[currentTab.value] || REPORT_TITLES.overview
  const safeFileName = title
    .replace(/[^A-Z0-9À-ÿ _-]/gi, '')
    .replace(/\s+/g, '_')
    .slice(0, 120)

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

    setFont(22, 800)
    ctx.fillStyle = '#1e1b4b' 
    ctx.textAlign = 'center'
    const titleLines = wrapText(title, CONTENT_W - 40, 22, 800)
    
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
    const period = startDate.value && endDate.value
      ? `${startDate.value} - ${endDate.value}`
      : 'KESELURUHAN TEMPOH DATA'
    ctx.fillText(`TEMPOH ANALISIS: ${period}`, PAGE_W / 2, currentY)

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

  const drawKpiCard = (x, width, label, value, accent = '#0f172a') => {
    ctx.fillStyle = '#f8fafc'
    ctx.strokeStyle = '#cbd5e1'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(x, y, width, 112, 16)
    ctx.fill()
    ctx.stroke()
    setFont(12, 700)
    ctx.fillStyle = '#64748b'
    ctx.fillText(label, x + 18, y + 18)
    setFont(31, 800)
    ctx.fillStyle = accent
    ctx.fillText(String(value), x + 18, y + 51)
  }

  const drawTable = (headers, rows, widths) => {
    const tableW = CONTENT_W
    const normalized = widths || headers.map(() => tableW / headers.length)
    ensureSpace(ROW_H * 2)

    const drawRow = (cells, header = false) => {
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
        setFont(header ? 13 : 12, header ? 700 : 500)
        ctx.fillStyle = header ? '#312e81' : '#0f172a'
        
        const totalTextH = linesForCell.length * 20
        const startY = y + (height - totalTextH) / 2

        linesForCell.forEach((line, li) => {
          if (!header && (i >= 2)) {
            ctx.textAlign = 'center'
            ctx.fillText(line, x + normalized[i] / 2, startY + li * 20)
            ctx.textAlign = 'left'
          } else {
            ctx.fillText(line, x + 12, startY + li * 20)
          }
        })

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
    rows.forEach(row => drawRow(row.map(v => String(v ?? '-'))))
    y += 14
  }

  const drawReasonGroups = () => {
    drawSectionTitle('ANALISIS PUNCA UTAMA GANGGUAN')
    groupedReasonStats.value.forEach(group => {
      ensureSpace(90)
      setFont(15, 800)
      ctx.fillStyle = '#1e1b4b'
      ctx.fillText(group.title.toUpperCase(), MARGIN, y)
      setFont(13, 700)
      ctx.fillStyle = '#475569'
      ctx.textAlign = 'right'
      ctx.fillText(`JUMLAH: ${group.total} SLOT`, PAGE_W - MARGIN, y)
      ctx.textAlign = 'left'
      y += 30

      group.items.forEach(item => {
        ensureSpace(42)
        setFont(12, 600)
        ctx.fillStyle = '#334155'
        ctx.fillText(`${item.reason} — ${item.count} (${item.percentage}%)`, MARGIN, y)
        const barX = MARGIN
        const barY = y + 21
        const barW = CONTENT_W
        ctx.fillStyle = '#e2e8f0'
        ctx.fillRect(barX, barY, barW, 10)
        ctx.fillStyle = '#4f46e5' 
        ctx.fillRect(barX, barY, Math.max(2, barW * Number(item.percentage) / 100), 10)
        y += 39
      })
      y += 10
    })
  }

  const drawOverview = () => {
    drawSectionTitle('RINGKASAN OPERASI & BEBAN TUGAS')
    const gap = 18
    const cardW = (CONTENT_W - gap * 2) / 3
    drawKpiCard(MARGIN, cardW, 'JUMLAH GANGGUAN', `${totalInterruptionPeriods.value}`, '#0f172a')
    drawKpiCard(MARGIN + cardW + gap, cardW, 'JUMLAH GURU GANTI', `${totalSubstituteCount.value}`, '#4f46e5')
    drawKpiCard(MARGIN + (cardW + gap) * 2, cardW, 'REKOD GANGGUAN', `${interruptionLogs.value.length}`, '#0f172a')
    y += 138

    drawSectionTitle('GURU DENGAN BEBAN GURU GANTI TERTINGGI')
    const rows = sortedSubstituteStats.value.slice(0, 5).map((t, i) => [
      `#${i + 1}`, t.name || '-', t.subject || '-', `${t.count || 0}`
    ])
    drawTable(['KEDUDUKAN', 'NAMA GURU', 'SUBJEK', 'JUMLAH GURU GANTI'], rows, [140, 480, 280, 240])
  }

  const drawTrend = () => {
    drawSectionTitle('TREND & PUNCAK HARI GANGGUAN')
    const gap = 18
    const cardW = (CONTENT_W - gap * 4) / 5
    dayOfWeekStats.value.forEach((d, i) => {
      drawKpiCard(MARGIN + i * (cardW + gap), cardW, d.day.toUpperCase(), `${d.count}`, '#4f46e5')
    })
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
    const rows = sortedTeacherStats.value.map(t => [
      t.name || '-', t.subject || '-', `${t.count || 0}`, `${t.interruptedCount || 0}`
    ])
    drawTable(['NAMA GURU', 'SUBJEK', 'GURU GANTI', 'GANGGUAN'], rows, [440, 340, 180, 180])
  }

  try {
    clearPage()
    drawHeader()
    y = MARGIN + HEADER_H + 10

    if (currentTab.value === 'overview') drawOverview()
    else if (currentTab.value === 'reason') drawReasonGroups()
    else if (currentTab.value === 'trend') drawTrend()
    else if (currentTab.value === 'class') drawClass()
    else if (currentTab.value === 'subject') drawSubject()
    else if (currentTab.value === 'teacher') drawTeacher()

    commitCurrentPage()

    pdf.save(`MMI_${safeFileName}.pdf`)
  } catch (error) {
    console.error('PDF 生成失败:', error)
    alert('PDF 生成失败，请查看浏览器控制台。')
  }
}
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