import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. 填入你的 Supabase URL
const SUPABASE_URL = 'https://odsxsepcurikfvpkbcde.supabase.co';

// 2. 填入你的 Service Role Key (在 Supabase 后台 Settings > API 复制 secret 那串)
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kc3hzZXBjdXJpa2Z2cGtiY2RlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjA0NzY4OCwiZXhwIjoyMTAxNjIzNjg4fQ.5u8pqff6_ljmhwUFBEecQU8sXJ4kEcpM6eYuaZgRoOo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

async function runBackup() {
  console.log('🚀 开始备份 Supabase 资料...');

  // 3. 填入你资料库实际的表格名称 (例如: ['users', 'posts'])
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
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }

  for (const table of tables) {
    try {
      console.log(`正在备份表格: ${table}...`);
      const { data, error } = await supabase.from(table).select('*');

      if (error) {
        console.error(`❌ 备份表格 [${table}] 失败:`, error.message);
      } else {
        const filePath = path.join(backupDir, `${table}.json`);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`✅ 表格 [${table}] 备份成功！已存至 json-backups/${table}.json`);
      }
    } catch (err) {
      console.error(`❌ 发生错误:`, err.message);
    }
  }
  console.log('✨ 备份流程结束！');
}

runBackup();