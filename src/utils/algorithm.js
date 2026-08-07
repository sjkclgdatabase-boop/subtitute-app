import { supabase } from '../services/supabase'

export async function recommendSubstitute(leaveRequest) {
  const { teacher_id, leave_date, period, subject } = leaveRequest;

  // 0. 根据请假日期精准计算星期几（适配柔佛州学制：0=周日->1, 1=周一->2 ...）
  const dateObj = new Date(leave_date);
  const weekday = dateObj.getDay() + 1;

  // 1. 获取当前请假老师的班次（morning 或 afternoon）
  const { data: absentTeacher, error: absentErr } = await supabase
    .from('teachers')
    .select('session')
    .eq('id', teacher_id)
    .single();
  
  if (absentErr || !absentTeacher) throw new Error("获取请假教师信息失败");
  const absentSession = absentTeacher.session || 'morning';

  // 2. 获取所有在职教师，且【严格限定必须属于同一班次】
  const { data: allTeachers, error: tErr } = await supabase
    .from('teachers')
    .select('*')
    .eq('is_active', true)
    .eq('session', absentSession);
  if (tErr) throw tErr;

  // 3. 检查目标节次（当前 period）原本有课的老师（避开本体有课的人）
  const { data: busyTimetable, error: ttErr } = await supabase
    .from('timetable')
    .select('teacher_id')
    .eq('weekday', weekday)
    .eq('period', period);
  if (ttErr) throw ttErr;
  const busyTeacherIds = new Set(busyTimetable.map(t => t.teacher_id));

  // 4. 检查目标节次，该老师【是否已经被指派去代其他人的课了】
  const { data: existingAssignments, error: eaErr } = await supabase
    .from('substitute_assignments')
    .select('sub_teacher_id, leave_requests!inner(leave_date, period)')
    .eq('leave_requests.leave_date', leave_date)
    .eq('leave_requests.period', period);
  if (!eaErr && existingAssignments) {
    existingAssignments.forEach(item => {
      busyTeacherIds.add(item.sub_teacher_id);
    });
  }

  // 5. 获取当天请假的老师
  const { data: onLeaveToday, error: lErr } = await supabase
    .from('leave_requests')
    .select('teacher_id')
    .eq('leave_date', leave_date);
  if (lErr) throw lErr;
  const onLeaveTeacherIds = new Set(onLeaveToday.map(t => t.teacher_id));

  // 6. 计算本周已安排代课总次数（用于每周代课上限判断）
  const day = dateObj.getDay() || 7; 
  const monday = new Date(dateObj);
  monday.setDate(dateObj.getDate() - day + 1);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const { data: weeklySubs, error: subErr } = await supabase
    .from('substitute_assignments')
    .select('sub_teacher_id, leave_requests!inner(leave_date)')
    .gte('leave_requests.leave_date', monday.toISOString().split('T')[0])
    .lte('leave_requests.leave_date', sunday.toISOString().split('T')[0]);
  if (subErr) throw subErr;

  const weeklySubCountMap = {};
  weeklySubs.forEach(sub => {
    weeklySubCountMap[sub.sub_teacher_id] = (weeklySubCountMap[sub.sub_teacher_id] || 0) + 1;
  });

  // 7. 统计每位老师当天（计算出的 weekday）的原本课表总数
  const { data: dayTimetable } = await supabase
    .from('timetable')
    .select('teacher_id')
    .eq('weekday', weekday);

  const dayClassCountMap = {};
  if (dayTimetable) {
    dayTimetable.forEach(t => {
      dayClassCountMap[t.teacher_id] = (dayClassCountMap[t.teacher_id] || 0) + 1;
    });
  }

  // 8. 统计每位老师【在当天（leave_date）已经帮别人代了多少节课】
  const { data: todayAssignedSubs } = await supabase
    .from('substitute_assignments')
    .select('sub_teacher_id, leave_requests!inner(leave_date)')
    .eq('leave_requests.leave_date', leave_date);

  const todaySubCountMap = {};
  if (todayAssignedSubs) {
    todayAssignedSubs.forEach(item => {
      todaySubCountMap[item.sub_teacher_id] = (todaySubCountMap[item.sub_teacher_id] || 0) + 1;
    });
  }

  // 9. 过滤与打分
  let candidates = [];
  for (let teacher of allTeachers) {
    if (busyTeacherIds.has(teacher.id)) continue;
    if (onLeaveTeacherIds.has(teacher.id)) continue;
    if (teacher.id === teacher_id) continue;
    
    const currentWeeklySubCount = weeklySubCountMap[teacher.id] || 0;
    if (currentWeeklySubCount >= teacher.max_substitute_per_week) continue;

    // 本身原排课数
    const originalClasses = dayClassCountMap[teacher.id] || 0;
    // 当天已代课数
    const todaySubCount = todaySubCountMap[teacher.id] || 0;
    // 今日总负荷
    const totalClassesToday = originalClasses + todaySubCount;

    let score = 0;
    if (teacher.subject === subject) score += 10;
    score += (5 - currentWeeklySubCount);
    score -= totalClassesToday * 2; // 根据今日总工作量进行负载均衡打分

    candidates.push({ 
      ...teacher, 
      currentSubCount: currentWeeklySubCount, 
      originalClasses,    // 本身原排课数
      todaySubCount,      // 当天已代课数
      totalClassesToday,  // 今日总节数
      score 
    });
  }

  candidates.sort((a, b) => b.score - a.score || a.originalClasses - b.originalClasses);
  return candidates.slice(0, 3);
}