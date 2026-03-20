/**
 * 数据库初始化 API - 创建 profiles 表
 * 只需要调用一次
 */

const SUPABASE_URL = 'https://ntaqnyegiiwtzdyqjiwy.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50YXFueWVnaWl3dHpkeXFqaXd5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkxNjg3NSwiZXhwIjoyMDg5NDkyODc1fQ.z8LPpoJoa9_DEJvBmNvSF0Q1I4FA3FNnFRU0PgKcF2A'

export async function onRequestPost(context) {
  try {
    // 检查 profiles 表是否已存在
    const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id&limit=1`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    })
    
    if (checkResponse.ok) {
      return new Response(JSON.stringify({ 
        success: true,
        message: 'profiles 表已存在'
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }
    
    // profiles 表不存在，尝试创建
    // 使用 Supabase 的 SQL RPC 端点
    const createTableSql = `
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        bio TEXT,
        interests TEXT[],
        looking_for JSONB,
        occupation VARCHAR(200),
        education VARCHAR(200),
        height INTEGER,
        photos TEXT[],
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      -- 启用 RLS
      ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
      
      -- 创建策略：允许所有人读取
      CREATE POLICY "Allow public read" ON profiles FOR SELECT USING (true);
      
      -- 创建策略：允许服务角色写入
      CREATE POLICY "Allow service role write" ON profiles FOR ALL USING (true);
    `
    
    // 由于无法直接执行 SQL，我们尝试通过插入一条记录来触发表创建
    // 这需要数据库有适当的触发器或扩展
    
    return new Response(JSON.stringify({ 
      success: false,
      error: 'profiles 表不存在，请在 Supabase Dashboard 中手动创建',
      sql: createTableSql,
      instructions: [
        '1. 登录 Supabase Dashboard: https://supabase.com/dashboard',
        '2. 选择项目: ntaqnyegiiwtzdyqjiwy',
        '3. 进入 SQL Editor',
        '4. 执行上面的 SQL 语句'
      ]
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
    
  } catch (error) {
    console.error('Init DB error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}
