<template>
  <div class="p-8 max-w-7xl mx-auto min-h-screen print:p-0 print:max-w-none">
    
    <!-- 屏幕显示的操作栏 (打印时自动隐藏) -->
    <div class="print:hidden flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-slate-900">
          每日代课统筹管理
        </h1>
        <p class="text-slate-500 text-sm mt-2 font-medium">点击表格单元格指派代课教师，支持一键智能生成当日代课排程</p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <!-- ⚡ 新增：一键智能自动排课按钮 -->
        <button 
          @click="handleAutoAssignAll"
          :disabled="isAutoAssigning"
          class="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md transition-all flex items-center gap-2 shrink-0"
        >
          <span v-if="isAutoAssigning" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          <span>⚡ 一键智能分配代课</span>
        </button>

        <!-- 班次切换标签 -->
        <div class="flex bg-white p-1 rounded-xl shadow-sm ring-1 ring-slate-900/5">
          <button 
            @click="currentSession = 'morning'" 
            :class="currentSession === 'morning' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:text-slate-900'"
            class="px-4 py-2 rounded-lg text-xs font-bold transition-all"
          >
            ☀️ 上午班
          </button>
          <button 
            @click="currentSession = 'afternoon'" 
            :class="currentSession === 'afternoon' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:text-slate-900'"
            class="px-4 py-2 rounded-lg text-xs font-bold transition-all"
          >
            🌙 下午班
          </button>
        </div>

        <!-- 选择日期 -->
        <div class="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl shadow-sm ring-1 ring-slate-900/5">
          <span class="text-xs font-bold text-slate-500">选择日期：</span>
          <input 
            type="date" 
            v-model="targetDate" 
            class="bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>

        <button 
          @click="handlePrint"
          class="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-md transition-all hover:shadow-lg flex items-center gap-2 shrink-0"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
          打印代课统筹表
        </button>
      </div>
    </div>

    <!-- 预览/打印专属区域：完美还原官方 JADUAL GURU GANTI 表格版式 -->
    <div class="bg-white rounded-3xl shadow-sm ring-1 ring-slate-900/5 p-8 print:shadow-none print:ring-0 print:p-0 print:rounded-none">
      
      <!-- 表头区域 -->
      <div class="text-center mb-6">
        <h2 class="text-xl font-black tracking-wider text-black font-serif">SJK (C) LADANG GRISEK</h2>
        <h3 class="text-lg font-bold tracking-widest text-black mt-1 font-serif underline">
          JADUAL GURU GANTI ({{ currentSession === 'morning' ? 'SESI PAGI' : 'SESI PETANG' }})
        </h3>
      </div>

      <!-- 日期与星期栏 -->
      <div class="flex justify-between items-center mb-4 font-bold text-sm font-serif border-b-2 border-black pb-2">
        <div>
          <span class="underline underline-offset-4">TARIKH :</span> <span class="ml-2 border-b border-black px-4">{{ formattedDate }}</span>
        </div>
        <div>
          <span class="underline underline-offset-4">HARI :</span> <span class="ml-2 border-b border-black px-4 uppercase">{{ formattedDayName }}</span>
        </div>
      </div>

      <!-- 核心矩阵表格 -->
      <div class="overflow-x-auto">
        <table class="w-full border-collapse border-2 border-black text-center text-xs font-serif table-fixed">
          <thead>
            <tr class="bg-slate-100 print:bg-white">
              <th class="border border-black p-1 w-28 font-bold" colspan="2">MASA</th>
              <th v-for="(time, index) in currentPeriodTimes" :key="index" class="border border-black p-1">
                <div class="font-bold">{{ index + 1 }}</div>
                <div class="text-[7px] font-normal mt-0.5 truncate">{{ time }}</div>
              </th>
            </tr>
          </thead>
          <tbody>
            <!-- 固定渲染 5 个教师槽位行（不足 5 人自动用空白行补满整页） -->
            <template v-for="slotIndex in 5" :key="slotIndex">
              
              <!-- 若该槽位有实际请假老师 -->
              <template v-if="displayTeachersList[slotIndex - 1]">
                <!-- 第一行：KELAS -->
                <tr>
                  <td class="border border-black p-1 font-bold bg-slate-50 print:bg-white align-middle text-center" rowspan="3" style="width: 120px;">
                    <div class="text-[10px] uppercase leading-tight whitespace-normal break-words font-bold px-0.5">
                      {{ displayTeachersList[slotIndex - 1].name }}
                    </div>
                    <div v-if="displayTeachersList[slotIndex - 1].reason" class="mt-0.5 flex flex-col items-center text-slate-500 font-normal w-full px-0.5">
                      <span 
                        v-for="(word, wIndex) in displayTeachersList[slotIndex - 1].reason.trim().split(/\s+/)" 
                        :key="wIndex" 
                        class="text-[6.5px] leading-none tracking-tighter text-center max-w-full break-words"
                      >
                        {{ wIndex === 0 ? '(' : '' }}{{ word }}{{ wIndex === displayTeachersList[slotIndex - 1].reason.trim().split(/\s+/).length - 1 ? ')' : '' }}
                      </span>
                    </div>
                  </td>
                  <td class="border border-black p-1 font-bold bg-slate-50 print:bg-white text-[10px]" style="width: 80px;">KELAS</td>
                  <td v-for="p in currentPeriodTimes.length" :key="p" class="border border-black p-1 font-semibold align-middle h-8 overflow-hidden text-[11px]">
                    {{ getTeacherPeriodData(displayTeachersList[slotIndex - 1].id, p, 'class_subject') }}
                  </td>
                </tr>
                <!-- 第二行：GURU GANTI (已修改：无课格子不显示编辑状态) -->
                <tr>
                  <td class="border border-black p-1 font-bold bg-slate-50 print:bg-white text-[10px]">GURU GANTI</td>
                  <td v-for="p in currentPeriodTimes.length" :key="p" 
                      @click="hasLeavePeriod(displayTeachersList[slotIndex - 1].id, p) ? handleCellClick(displayTeachersList[slotIndex - 1].id, p) : null"
                      :class="hasLeavePeriod(displayTeachersList[slotIndex - 1].id, p) ? 'cursor-pointer hover:bg-indigo-50 group' : ''"
                      class="print:hover:bg-transparent border border-black p-1 font-bold text-indigo-900 align-middle h-8 overflow-hidden text-[11px] transition relative">
                    <div class="w-full h-full flex items-center justify-center">
                      <!-- 此处会渲染老师姓名，并自动判断是否显示(换课)字眼 -->
                      <span>{{ getTeacherPeriodData(displayTeachersList[slotIndex - 1].id, p, 'substitute_name') }}</span>
                      <span v-if="hasLeavePeriod(displayTeachersList[slotIndex - 1].id, p)" class="print:hidden hidden group-hover:inline-block text-[9px] text-indigo-500 ml-1">✏️</span>
                    </div>
                  </td>
                </tr>
                <!-- 第三行：T/TANGAN -->
                <tr>
                  <td class="border border-black p-1 font-bold bg-slate-50 print:bg-white text-[8px] whitespace-nowrap">T/TANGAN</td>
                  <td v-for="p in currentPeriodTimes.length" :key="p" class="border border-black p-1 align-middle h-8"></td>
                </tr>
              </template>

              <!-- 若该槽位没有请假老师，渲染完全空白的占位行（支持云端草稿本记忆功能） -->
              <template v-else>
                <tr>
                  <!-- 左侧缺席老师名字框 -->
                  <td contenteditable="true" 
                      @blur="saveManualEntry(slotIndex, 'name', 0, $event)" 
                      v-text="getManualEntry(slotIndex, 'name', 0)" 
                      class="border border-black p-1 font-bold bg-slate-50 print:bg-white align-middle text-center h-8 outline-none focus:bg-indigo-50/50 hover:bg-slate-100 cursor-text transition-colors" rowspan="3" style="width: 120px;"></td>
                  <td class="border border-black p-1 font-bold bg-slate-50 print:bg-white text-[10px]" style="width: 80px;">KELAS</td>
                  <!-- KELAS 格子 -->
                  <td v-for="p in currentPeriodTimes.length" :key="'kelas-'+p" 
                      contenteditable="true" 
                      @blur="saveManualEntry(slotIndex, 'kelas', p, $event)" 
                      v-text="getManualEntry(slotIndex, 'kelas', p)" 
                      class="border border-black p-1 align-middle h-8 outline-none focus:bg-indigo-50/50 hover:bg-slate-100 cursor-text transition-colors text-[11px] font-semibold"></td>
                </tr>
                <tr>
                  <td class="border border-black p-1 font-bold bg-slate-50 print:bg-white text-[10px]">GURU GANTI</td>
                  <!-- GURU GANTI 格子 -->
                  <td v-for="p in currentPeriodTimes.length" :key="'ganti-'+p" 
                      contenteditable="true" 
                      @blur="saveManualEntry(slotIndex, 'ganti', p, $event)" 
                      v-text="getManualEntry(slotIndex, 'ganti', p)" 
                      class="border border-black p-1 align-middle h-8 outline-none focus:bg-indigo-50/50 hover:bg-slate-100 cursor-text transition-colors text-[11px] font-bold text-indigo-900"></td>
                </tr>
                <tr>
                  <td class="border border-black p-1 font-bold bg-slate-50 print:bg-white text-[8px] whitespace-nowrap">T/TANGAN</td>
                  <!-- T/TANGAN 格子 -->
                  <td v-for="p in currentPeriodTimes.length" :key="'ttangan-'+p" 
                      contenteditable="true" 
                      @blur="saveManualEntry(slotIndex, 'ttangan', p, $event)" 
                      v-text="getManualEntry(slotIndex, 'ttangan', p)" 
                      class="border border-black p-1 align-middle h-8 outline-none focus:bg-indigo-50/50 hover:bg-slate-100 cursor-text transition-colors"></td>
                </tr>
              </template>

            </template>
          </tbody>
        </table>
      </div>

    </div>

    <!-- 弹窗：代课指派中心 -->
    <transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
      <div v-if="showModal" class="print:hidden fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
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

            <!-- ⭐️ 新增：任务指派性质选择 -->
            <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <h3 class="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">🏷️ 指派性质:</h3>
              <div class="flex flex-col sm:flex-row gap-4">
                <label class="flex items-center gap-2 cursor-pointer bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 hover:bg-indigo-50 transition">
                  <input type="radio" v-model="assignmentType" value="substitute" class="text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                  <span class="text-sm font-semibold text-slate-800">正式代课 <span class="text-xs text-slate-400 font-normal ml-1">(计入负荷统计)</span></span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 hover:bg-indigo-50 transition">
                  <input type="radio" v-model="assignmentType" value="swap" class="text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                  <span class="text-sm font-semibold text-slate-800">对调换课 <span class="text-xs text-slate-400 font-normal ml-1">(不计入统计)</span></span>
                </label>
              </div>
            </div>
            
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
                    {{ t.name }} <span v-if="t.subject">(科目: {{ t.subject }})</span>
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
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">✨ 智能推荐候选列表（Top 6）</h3>
              
              <div v-if="loadingRecs" class="flex flex-col items-center justify-center py-6 space-y-3">
                <div class="w-6 h-6 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
                <p class="text-xs text-slate-500 font-medium">智能算法计算中...</p>
              </div>
              
              <div v-else-if="recommendations.length === 0" class="bg-white p-4 rounded-2xl border border-slate-200 text-xs text-slate-500 text-center">
                暂无自动推荐人选，请使用上方手动指派。
              </div>

              <div v-else class="space-y-3">
                <div v-for="(teacher, index) in recommendations" 
                    :key="teacher.id" 
                    :class="[
                      'group flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 hover:shadow-sm transition-all',
                      { 'force-page-break': (index + 1) % 5 === 0 }
                    ]">
                  <div class="flex items-center gap-3 mb-3 sm:mb-0">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-700 font-extrabold flex items-center justify-center text-xs">
                      #{{ index + 1 }}
                    </div>
                    <div>
                      <div class="font-bold text-slate-900 text-sm flex items-center gap-2">
                        {{ teacher.name }} 
                      </div>
                      <div class="text-[11px] text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                        <span>原有节数: <span class="font-bold text-slate-700">{{ teacher.originalClasses }}节</span></span>
                        <span>·</span>
                        <span>当天已代: <span class="font-bold text-orange-600">{{ teacher.todaySubCount }}节</span></span>
                        <span>·</span>
                        <span>本周已代: <span class="font-bold text-slate-700">{{ teacher.currentSubCount }}/{{ teacher.max_substitute_per_week }}</span></span>
                      </div>
                    </div>
                  </div>
                  <button @click="assignSubstitute(teacher.id)" class="bg-slate-900 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all">
                    智能指派
                  </button>
                </div>
              </div>
            </div>

            <div v-if="currentLeaveItem && substituteAssignmentsMap[currentLeaveItem.id]" class="pt-2 border-t border-slate-100 flex justify-between items-center">
              <span class="text-xs text-red-500 font-medium">当前格子已有代课/换课安排</span>
              <button @click="removeAssignment" class="text-xs text-red-600 hover:text-red-800 font-bold px-3 py-1 bg-red-50 rounded-lg">
                取消当前指派
              </button>
            </div>

          </div>
        </div>
      </div>
    </transition>

    <!-- ========================================== -->
<!-- ⭐️ 动态附加的空白可编辑附页区域（支持无限新增，打印时自动换页） -->
<!-- ========================================== -->
<div v-for="(sheet, sIndex) in extraCustomSheets" :key="sheet.id" class="print-custom-sheet mt-12 pt-8 border-t-4 border-dashed border-slate-300">
  
  <!-- 网页端专属操作栏：打印时自动隐藏 -->
  <div class="print:hidden flex justify-between items-center mb-4 bg-amber-50 p-3 rounded-2xl border border-amber-200">
    <span class="text-xs font-bold text-amber-900">📄 附加自定义手写/编辑备用表 #{{ sIndex + 1 }}</span>
    <button @click="removeCustomSheet(sheet.id)" class="text-xs text-red-600 bg-white hover:bg-red-50 px-3 py-1.5 rounded-xl font-bold shadow-sm transition">
      删除此附页
    </button>
  </div>

  <!-- 预览/打印专属区域：完美复刻官方 JADUAL GURU GANTI 表格版式 -->
  <div class="bg-white rounded-3xl shadow-sm ring-1 ring-slate-900/5 p-8 print:shadow-none print:ring-0 print:p-0 print:rounded-none">
    
    <!-- 表头区域 -->
    <div class="text-center mb-6">
      <h2 class="text-xl font-black tracking-wider text-black font-serif">SJK (C) LADANG GRISEK</h2>
      <h3 class="text-lg font-bold tracking-widest text-black mt-1 font-serif underline">
        JADUAL GURU GANTI ({{ currentSession === 'morning' ? 'SESI PAGI' : 'SESI PETANG' }})
      </h3>
    </div>

    <!-- 日期与星期栏（可直接点击编辑或打印手写） -->
    <div class="flex justify-between items-center mb-4 font-bold text-sm font-serif border-b-2 border-black pb-2">
      <div>
        <span class="underline underline-offset-4">TARIKH :</span> 
        <input v-model="sheet.date" type="text" placeholder="输入日期" class="ml-2 border-b border-black px-2 py-0.5 text-sm font-normal w-32 focus:outline-none" />
      </div>
      <div>
        <span class="underline underline-offset-4">HARI :</span> 
        <input v-model="sheet.day" type="text" placeholder="输入星期" class="ml-2 border-b border-black px-2 py-0.5 text-sm font-normal w-28 uppercase focus:outline-none" />
      </div>
    </div>

    <!-- 核心矩阵表格（1:1 克隆你官方表的 5 行槽位和 11 节次结构） -->
    <div class="overflow-x-auto">
      <table class="w-full border-collapse border-2 border-black text-center text-xs font-serif table-fixed">
        <thead>
          <tr class="bg-slate-100 print:bg-white">
            <th class="border border-black p-1 w-28 font-bold" colspan="2">MASA</th>
            <th v-for="(time, index) in currentPeriodTimes" :key="index" class="border border-black p-1">
              <div class="font-bold">{{ index + 1 }}</div>
              <div class="text-[7px] font-normal mt-0.5 truncate">{{ time }}</div>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="slotIndex in 5" :key="slotIndex">
            <tr>
              <!-- 左侧缺席老师名字框（可直接在线编辑） -->
              <td contenteditable="true" 
                  class="border border-black p-1 font-bold bg-slate-50 print:bg-white align-middle text-center h-8 outline-none focus:bg-indigo-50/50 hover:bg-slate-100 cursor-text transition-colors" 
                  rowspan="3" style="width: 120px;"></td>
              <td class="border border-black p-1 font-bold bg-slate-50 print:bg-white text-[10px]" style="width: 80px;">KELAS</td>
              <!-- KELAS 格子 -->
              <td v-for="p in currentPeriodTimes.length" :key="'kelas-'+p" 
                  contenteditable="true" 
                  class="border border-black p-1 align-middle h-8 outline-none focus:bg-indigo-50/50 hover:bg-slate-100 cursor-text transition-colors text-[11px] font-semibold"></td>
            </tr>
            <tr>
              <td class="border border-black p-1 font-bold bg-slate-50 print:bg-white text-[10px]">GURU GANTI</td>
              <!-- GURU GANTI 格子 -->
              <td v-for="p in currentPeriodTimes.length" :key="'ganti-'+p" 
                  contenteditable="true" 
                  class="border border-black p-1 align-middle h-8 outline-none focus:bg-indigo-50/50 hover:bg-slate-100 cursor-text transition-colors text-[11px] font-bold text-indigo-900"></td>
            </tr>
            <tr>
              <td class="border border-black p-1 font-bold bg-slate-50 print:bg-white text-[8px] whitespace-nowrap">T/TANGAN</td>
              <!-- T/TANGAN 格子 -->
              <td v-for="p in currentPeriodTimes.length" :key="'ttangan-'+p" 
                  contenteditable="true" 
                  class="border border-black p-1 align-middle h-8 outline-none focus:bg-indigo-50/50 hover:bg-slate-100 cursor-text transition-colors"></td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

  </div>
</div>

<!-- ⭐️ 放置在最底部的增加按钮（网页可见，打印时自动隐藏） -->
<div class="print:hidden mt-8 mb-12 flex justify-center">
  <button @click="addBlankSheet" class="flex items-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white px-6 py-3 rounded-2xl text-xs font-bold shadow-md transition-all">
    <span class="text-base font-extrabold">+</span> 增加一张官方版空白代课备用表
  </button>
</div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { supabase } from '../services/supabase'
import { recommendSubstitute } from '../utils/algorithm'
import { useToast } from '../utils/toast'

const toast = useToast()
const targetDate = ref(new Date().toISOString().split('T')[0])
const currentSession = ref('morning')

const morningTimes = [
  '7.00-7.30', '7.30-8.00', '8.00-8.30', '8.30-9.00', '9.00-9.30',
  '10.00-10.30', '10.30-11.00', '11.00-11.30', '11.30-12.00', '12.00-12.30', '12.30-1.00'
]
const afternoonTimes = [
  '1.00-1.30', '1.30-2.00', '2.00-2.30', '2.30-3.00', '3.00-3.30',
  '3.50-4.20', '4.20-4.50', '4.50-5.20', '5.20-5.50', '5.50-6.20'
]

const currentPeriodTimes = computed(() => currentSession.value === 'morning' ? morningTimes : afternoonTimes)
const dayNames = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu']

const leaveRequests = ref([])
const substituteAssignmentsMap = ref({})
const teachersMap = ref({})
const allSameSessionTeachers = ref([])

// 弹窗状态
const showModal = ref(false)
const loadingRecs = ref(false)
const recommendations = ref([])
const currentLeaveItem = ref(null)
const assignmentRemark = ref('')
const assignmentType = ref('substitute') // ⭐️ 新增：默认是正式代课
const manualSelectedTeacherId = ref('')

// ⚡ 自动排课加载状态
const isAutoAssigning = ref(false)

const formattedDate = computed(() => {
  if (!targetDate.value) return ''
  const [y, m, d] = targetDate.value.split('-')
  return `${d}.${m}.${y}`
})

const formattedDayName = computed(() => {
  if (!targetDate.value) return ''
  const dateObj = new Date(targetDate.value)
  return dayNames[dateObj.getDay()]
})

const displayTeachersList = computed(() => {
  const map = {}
  leaveRequests.value.forEach(req => {
    const teacher = teachersMap.value[req.teacher_id]
    if (teacher) {
      if ((teacher.session || 'morning') === currentSession.value) {
        map[req.teacher_id] = { id: req.teacher_id, name: teacher.name, reason: req.reason }
      }
    }
  })
  return Object.values(map)
})

// ================= 新增：草稿本逻辑 =================
const manualEntries = ref({})

const fetchManualDrafts = async () => {
  manualEntries.value = {} 
  try {
    const { data, error } = await supabase
      .from('jadual_manual_drafts')
      .select('draft_data')
      .eq('target_date', targetDate.value)
      .eq('session', currentSession.value)
      .maybeSingle() 
    
    if (data && data.draft_data) {
      manualEntries.value = data.draft_data
    }
  } catch (err) {
    console.error("读取草稿失败:", err)
  }
}

const saveManualEntry = async (slotIndex, type, period, event) => {
  const text = event.target.innerText.trim()
  const key = `${slotIndex}-${type}-${period}`
  
  if (manualEntries.value[key] === text) return;
  
  manualEntries.value[key] = text

  try {
    const { error } = await supabase
      .from('jadual_manual_drafts')
      .upsert({ 
        target_date: targetDate.value,
        session: currentSession.value,
        draft_data: manualEntries.value
      }, { onConflict: 'target_date,session' }) 
      
    if (error) throw error
  } catch (err) {
    console.error("保存临时草稿失败:", err)
  }
}

const getManualEntry = (slotIndex, type, period) => {
  const key = `${slotIndex}-${type}-${period}`
  return manualEntries.value[key] || ''
}
// ==================================================

const fetchData = async () => {
  await fetchManualDrafts()

  const { data: tData } = await supabase.from('teachers').select('*')
  if (tData) {
    tData.forEach(t => { teachersMap.value[t.id] = t })
  }

  const { data: lData } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('leave_date', targetDate.value)
  
  if (lData) {
    leaveRequests.value = lData
    const leaveIds = lData.map(l => l.id)
    if (leaveIds.length > 0) {
      const { data: sData } = await supabase
        .from('substitute_assignments')
        .select('*')
        .in('leave_request_id', leaveIds)
      
      if (sData) {
        const map = {}
        sData.forEach(s => { map[s.leave_request_id] = s })
        substituteAssignmentsMap.value = map
      } else {
        substituteAssignmentsMap.value = {}
      }
    } else {
      substituteAssignmentsMap.value = {}
    }
  }
}

const hasLeavePeriod = (teacherId, periodNum) => {
  return leaveRequests.value.some(r => r.teacher_id === teacherId && Number(r.period) === Number(periodNum))
}

const getTeacherPeriodData = (teacherId, periodNum, type) => {
  const leaveItem = leaveRequests.value.find(r => r.teacher_id === teacherId && Number(r.period) === Number(periodNum))
  if (!leaveItem) return ''

  if (type === 'class_subject') {
    return `${leaveItem.class_name} ${leaveItem.subject}`
  }

  if (type === 'substitute_name') {
    const subItem = substituteAssignmentsMap.value[leaveItem.id]
    if (!subItem || !subItem.sub_teacher_id) return ''
    
    const subTeacher = teachersMap.value[subItem.sub_teacher_id]
    let name = subTeacher ? subTeacher.name : ''
    
    // ⭐️ 视觉提示：如果是换课，自动加上标记，方便打印识别
    if (subItem.assignment_type === 'swap') {
      name += ' (换课)'
    }
    
    return subItem.remark ? `${name} (${subItem.remark})` : name
  }
  return ''
}

const handleCellClick = async (teacherId, periodNum) => {
  const leaveItem = leaveRequests.value.find(r => r.teacher_id === teacherId && Number(r.period) === Number(periodNum))
  if (!leaveItem) {
    toast.error("该节课该老师没有请假记录！")
    return
  }

  currentLeaveItem.value = leaveItem
  assignmentRemark.value = ''
  manualSelectedTeacherId.value = ''
  assignmentType.value = 'substitute' // 每次点开默认是代课

  const existingSub = substituteAssignmentsMap.value[leaveItem.id]
  if (existingSub) {
    assignmentRemark.value = existingSub.remark || ''
    manualSelectedTeacherId.value = existingSub.sub_teacher_id || ''
    assignmentType.value = existingSub.assignment_type || 'substitute' // ⭐️ 读取之前选择的类型
  }

  showModal.value = true
  loadingRecs.value = true

  try {
    recommendations.value = await recommendSubstitute(leaveItem)

    const absentTeacher = teachersMap.value[leaveItem.teacher_id]
    const session = absentTeacher?.session || currentSession.value

    const { data: teachersData } = await supabase
      .from('teachers')
      .select('*')
      .eq('is_active', true)
      .eq('session', session)
      .neq('id', leaveItem.teacher_id)

    allSameSessionTeachers.value = teachersData || []

  } catch (err) {
    toast.error("加载排课数据失败: " + err.message)
    recommendations.value = []
  } finally {
    loadingRecs.value = false
  }
}

const assignSubstitute = async (teacherId) => {
  if (!teacherId || !currentLeaveItem.value) return
  try {
    const leaveId = currentLeaveItem.value.id
    const existing = substituteAssignmentsMap.value[leaveId]

    // ⭐️ 保存时带上 assignment_type
    const payload = {
      sub_teacher_id: teacherId, 
      remark: assignmentRemark.value ? assignmentRemark.value.trim() : null,
      assignment_type: assignmentType.value 
    }

    if (existing) {
      const { error } = await supabase
        .from('substitute_assignments')
        .update(payload)
        .eq('id', existing.id)
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('substitute_assignments')
        .insert({
          leave_request_id: leaveId,
          ...payload
        })
      if (error) throw error
    }

    await supabase.from('leave_requests').update({ status: 'assigned' }).eq('id', leaveId)

    toast.success(assignmentType.value === 'swap' ? "换课指派成功！" : "代课指派成功！")
    showModal.value = false
    fetchData()
  } catch (err) {
    toast.error("指派失败: " + err.message)
  }
}

const removeAssignment = async () => {
  if (!currentLeaveItem.value) return
  try {
    const leaveId = currentLeaveItem.value.id
    const existing = substituteAssignmentsMap.value[leaveId]
    if (existing) {
      await supabase.from('substitute_assignments').delete().eq('id', existing.id)
      await supabase.from('leave_requests').update({ status: 'pending' }).eq('id', leaveId)
      toast.success("已取消指派")
      showModal.value = false
      fetchData()
    }
  } catch (err) {
    toast.error("操作失败: " + err.message)
  }
}

// ⚡ 核心功能：一键智能自动排课
const handleAutoAssignAll = async () => {
  const pendingRequests = leaveRequests.value.filter(req => {
    const teacher = teachersMap.value[req.teacher_id]
    const inCurrentSession = teacher && (teacher.session || 'morning') === currentSession.value
    const notAssigned = !substituteAssignmentsMap.value[req.id] || !substituteAssignmentsMap.value[req.id].sub_teacher_id
    return inCurrentSession && notAssigned
  })

  if (pendingRequests.length === 0) {
    toast.success("当前班次没有需要自动指派的待办课程！")
    return
  }

  isAutoAssigning.value = true
  let successCount = 0

  try {
    for (const req of pendingRequests) {
      const recs = await recommendSubstitute(req)
      if (recs && recs.length > 0) {
        const bestTeacherId = recs[0].id

        const { error: insertErr } = await supabase
          .from('substitute_assignments')
          .insert({
            leave_request_id: req.id,
            sub_teacher_id: bestTeacherId,
            remark: null,
            assignment_type: 'substitute' // 自动排课永远按“正式代课”算
          })
        
        if (!insertErr) {
          await supabase.from('leave_requests').update({ status: 'assigned' }).eq('id', req.id)
          successCount++
        }
      }
    }

    toast.success(`自动排课完成！成功为您智能指派了 ${successCount} 节课。`)
    fetchData()
  } catch (err) {
    toast.error("一键自动排课过程中出错: " + err.message)
  } finally {
    isAutoAssigning.value = false
  }
}

watch([targetDate, currentSession], () => {
  fetchData()
})

onMounted(() => {
  fetchData()
})

const handlePrint = () => {
  window.print()
}

// ⭐️ 改用一个对象来分别记录上午班和下午班各自的附页列表
const sessionCustomSheets = ref({
  morning: [],
  afternoon: []
})

// 当前显示的附页列表（根据当前 session 自动切换）
const extraCustomSheets = computed(() => {
  return sessionCustomSheets.value[currentSession.value] || []
})

// 添加空白表（自动区分当前是 morning 还是 afternoon）
const addBlankSheet = () => {
  sessionCustomSheets.value[currentSession.value].push({
    id: Date.now(),
    date: '',
    day: '',
  })
}

// 删除对应班次的某张附页
const removeCustomSheet = (id) => {
  const list = sessionCustomSheets.value[currentSession.value]
  const index = list.findIndex(sheet => sheet.id === id)
  if (index !== -1) {
    list.splice(index, 1)
  }
}

</script>

<!-- 在你的 .vue 文件中，直接这样写： -->

<style scoped>
/* 你的组件内部私有样式保留在这里 */
/* 例如: .my-table { width: 100%; } */
</style>

<style>
@media print {
  @page {
    size: A4 landscape !important;
    margin: 5mm !important;
  }
  
  body {
    background: white !important;
    -webkit-print-color-adjust: exact;
  }

  /* 1. 之前设定的：每满 5 个老师自动切新页 */
  .force-page-break {
    break-after: page !important;
    page-break-after: always !important;
  }

  /* 2. 新增的：让每一张动态新增的自定义附页强制在新的一页打印 */
  .print-custom-sheet {
    break-before: page !important;
    page-break-before: always !important;
  }
}
</style>