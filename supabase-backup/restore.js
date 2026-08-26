import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. 填入你的 Supabase URL
const SUPABASE_URL = 'https://odsxsepcurikfvpkbcde.supabase.co';

// 2. 填入你的 Service Role Key (超级管理员权限，确保能写入数据)
const SUPABASE_SERVICE_ROLE_KEY = '你的_service_role_key';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

async function runRestore() {
  console.log('🔄 开始还原 Supabase 资料...');

  // 对应你那 10 个表格的名称
  const tables = [
    'classes',
    'jadual_manual_drafts',
    'leave_requests',
    'mmi_interruptions',
    'school_settings',
    'school_weeks',
    'subject_targets',
    'substitute_assignments',
    'substitutions',
    'teachers',
    'timetable'
  ];

  const backupDir = path.join(__dirname, 'json-backups');

  for (const table of tables) {
    const filePath = path.join(backupDir, `${table}.json`);

    // 检查对应的 json 档案是否存在
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ 找不到档案 ${filePath}，跳过此表格。`);
      continue;
    }

    try {
      console.log(`正在还原表格: ${table}...`);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const jsonData = JSON.parse(fileContent);

      if (jsonData.length === 0) {
        console.log(`ℹ️ 表格 [${table}] 的备份档中没有资料，跳过。`);
        continue;
      }

      // 批量写入数据到 Supabase
      const { error } = await supabase.from(table).insert(jsonData);

      if (error) {
        console.error(`❌ 还原表格 [${table}] 失败:`, error.message);
      } else {
        console.log(`✅ 表格 [${table}] 还原成功！`);
      }
    } catch (err) {
      console.error(`❌ 处理表格 [${table}] 时发生错误:`, err.message);
    }
  }
  console.log('✨ 还原流程全部结束！');
}

runRestore();