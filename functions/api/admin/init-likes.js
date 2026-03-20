/**
 * 自动初始化 likes 字段的管理 API
 * 访问 /api/admin/init-likes 会尝试添加 likes 字段
 */

const SUPABASE_URL = 'https://ntaqnyegiiwtzdyqjiwy.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50YXFueWVnaWl3dHpkeXFqaXd5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkxNjg3NSwiZXhwIjoyMDg5NDkyODc1fQ.z8LPpoJoa9_DEJvBmNvSF0Q1I4FA3FNnFRU0PgKcF2A'

export async function onRequestGet(context) {
  try {
    // 尝试更新一个用户来检测 likes 字段是否存在
    const testResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/users?id=eq.user_1773966789326`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ likes: ['test'] })
      }
    )
    
    if (testResponse.ok) {
      // 成功！字段已存在
      // 回滚测试数据
      await fetch(
        `${SUPABASE_URL}/rest/v1/users?id=eq.user_1773966789326`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ likes: [] })
        }
      )
      
      return new Response(JSON.stringify({
        success: true,
        message: '✅ likes 字段已存在并可用！',
        status: 'ready'
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }
    
    const error = await testResponse.text()
    
    if (error.includes('likes') || error.includes('column')) {
      return new Response(JSON.stringify({
        success: false,
        message: '❌ likes 字段不存在',
        error: error,
        instructions: '请在 Supabase Dashboard 中执行以下 SQL：',
        sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS likes JSONB DEFAULT \'[]\'::jsonb;',
        dashboardUrl: 'https://supabase.com/dashboard/project/ntaqnyegiiwtzdyqjiwy/sql/new'
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }
    
    return new Response(JSON.stringify({
      success: false,
      message: '未知错误',
      error: error
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}
