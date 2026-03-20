/**
 * 用户喜欢列表管理 API
 * 支持跨设备同步喜欢状态
 * 
 * GET: 获取所有喜欢关系 (?action=all)
 * POST: 添加/删除喜欢 {fromUserId, toUserId, action: 'like'|'unlike'}
 */

const SUPABASE_URL = 'https://ntaqnyegiiwtzdyqjiwy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50YXFueWVnaWl3dHpkeXFqaXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTY4NzUsImV4cCI6MjA4OTQ5Mjg3NX0.4FEAb1Yd4xOwXz3LcfZ9iPG0ZZPbFd8dfry903c5lPc'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50YXFueWVnaWl3dHpkeXFqaXd5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkxNjg3NSwiZXhwIjoyMDg5NDkyODc1fQ.z8LPpoJoa9_DEJvBmNvSF0Q1I4FA3FNnFRU0PgKcF2A'

export async function onRequestGet(context) {
  const { request } = context
  
  try {
    const url = new URL(request.url)
    const action = url.searchParams.get('action')
    
    if (action === 'all') {
      // 获取所有喜欢关系
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/likes?select=from_user_id,to_user_id`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        }
      )
      
      if (!response.ok) {
        // 表可能不存在，返回空数组
        return new Response(JSON.stringify({ 
          success: true,
          likes: [],
          tableExists: false
        }), {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        })
      }
      
      const likes = await response.json()
      
      return new Response(JSON.stringify({ 
        success: true,
        likes: Array.isArray(likes) ? likes : [],
        tableExists: true
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }
    
    // 获取指定用户的喜欢列表
    const userId = url.searchParams.get('userId')
    
    if (!userId) {
      return new Response(JSON.stringify({ error: '缺少 userId 参数或 action 参数' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }
    
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/likes?from_user_id=eq.${userId}&select=to_user_id`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    )
    
    const likes = await response.json()
    const likedUsers = Array.isArray(likes) ? likes.map(l => l.to_user_id) : []
    
    return new Response(JSON.stringify({ 
      success: true,
      likedUsers: likedUsers
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
    
  } catch (error) {
    console.error('Get likes error:', error)
    return new Response(JSON.stringify({ 
      success: true,
      likes: [],
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

export async function onRequestPost(context) {
  const { request } = context
  
  try {
    const body = await request.json()
    const { fromUserId, toUserId, action } = body
    
    if (!fromUserId || !toUserId) {
      return new Response(JSON.stringify({ error: '缺少必要参数' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }
    
    if (action === 'like') {
      // 添加喜欢记录
      const insertResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/likes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            from_user_id: fromUserId,
            to_user_id: toUserId,
            created_at: new Date().toISOString()
          })
        }
      )
      
      if (!insertResponse.ok) {
        const error = await insertResponse.text()
        // 如果是重复记录或表不存在，忽略错误
        if (!error.includes('duplicate') && !error.includes('relation')) {
          console.error('Insert like error:', error)
        }
      }
    } else if (action === 'unlike') {
      // 删除喜欢记录
      const deleteResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/likes?from_user_id=eq.${fromUserId}&to_user_id=eq.${toUserId}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Prefer': 'return=minimal'
          }
        }
      )
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      message: action === 'like' ? '喜欢成功' : '取消喜欢成功'
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
    
  } catch (error) {
    console.error('Update like error:', error)
    return new Response(JSON.stringify({ 
      success: true,
      error: error.message 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}
