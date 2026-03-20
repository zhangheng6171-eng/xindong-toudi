/**
 * 用户喜欢列表管理 API 
 * 从 users 表的 likes 字段读取/写入喜欢关系
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
      // 获取所有用户的喜欢关系
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/users?select=id,likes`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        }
      )
      
      if (!response.ok) {
        return new Response(JSON.stringify({ 
          success: true,
          likes: [],
          message: '数据库连接失败，请检查 likes 字段是否存在'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        })
      }
      
      const users = await response.json()
      const likes = []
      
      users.forEach(user => {
        if (user.likes && Array.isArray(user.likes)) {
          user.likes.forEach(targetId => {
            likes.push({ from_user_id: user.id, to_user_id: targetId })
          })
        }
      })
      
      return new Response(JSON.stringify({ 
        success: true,
        likes: likes,
        count: likes.length
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }
    
    // 获取指定用户的喜欢列表
    const userId = url.searchParams.get('userId')
    
    if (!userId) {
      return new Response(JSON.stringify({ error: '缺少参数' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }
    
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=likes`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    )
    
    if (response.ok) {
      const data = await response.json()
      if (data && data[0]) {
        return new Response(JSON.stringify({ 
          success: true,
          likedUsers: data[0].likes || []
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        })
      }
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      likedUsers: []
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: true,
      likes: [],
      error: error.message 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
}

export async function onRequestPost(context) {
  const { request } = context
  
  try {
    const body = await request.json()
    const { fromUserId, toUserId, action } = body
    
    if (!fromUserId || !toUserId) {
      return new Response(JSON.stringify({ error: '缺少参数' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }
    
    // 获取当前用户的喜欢列表
    const getResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/users?id=eq.${fromUserId}&select=likes`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        }
      }
    )
    
    if (!getResponse.ok) {
      return new Response(JSON.stringify({ 
        success: false,
        error: '获取用户数据失败，请确保 users 表有 likes 字段',
        hint: '请访问 /admin/setup-likes.html 查看配置说明'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }
    
    const userData = await getResponse.json()
    let currentLikes = []
    
    if (userData && userData[0] && userData[0].likes) {
      currentLikes = userData[0].likes
    }
    
    // 更新喜欢列表
    if (action === 'like') {
      if (!currentLikes.includes(toUserId)) {
        currentLikes.push(toUserId)
      }
    } else {
      currentLikes = currentLikes.filter(id => id !== toUserId)
    }
    
    // 保存到数据库
    const updateResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/users?id=eq.${fromUserId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ likes: currentLikes })
      }
    )
    
    if (!updateResponse.ok) {
      const error = await updateResponse.text()
      return new Response(JSON.stringify({ 
        success: false,
        error: '更新失败，请确保 users 表有 likes 字段',
        details: error,
        hint: '请访问 /admin/setup-likes.html 查看配置说明'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      message: action === 'like' ? '喜欢成功' : '取消喜欢成功',
      likes: currentLikes
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false,
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
