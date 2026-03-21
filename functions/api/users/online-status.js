/**
 * 更新用户在线状态 API - Supabase
 */

const SUPABASE_URL = 'https://ntaqnyegiiwtzdyqjiwy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50YXFueWVnaWl3dHpkeXFqaXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTY4NzUsImV4cCI6MjA4OTQ5Mjg3NX0.4FEAb1Yd4xOwXz3LcfZ9iPG0ZZPbFd8dfry903c5lPc'

export async function onRequestPost(context) {
  const { request } = context
  
  try {
    const body = await request.json()
    const { userId, isOnline } = body
    
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing userId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // 更新用户在线状态
    const response = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        last_active: new Date().toISOString(),
        is_online: isOnline
      })
    })
    
    if (!response.ok) {
      // 如果更新失败，可能是因为字段不存在，尝试只更新last_active
      const fallbackResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          last_active: new Date().toISOString()
        })
      })
      
      if (!fallbackResponse.ok) {
        const error = await fallbackResponse.text()
        console.error('Supabase update error:', error)
        return new Response(JSON.stringify({ error }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
    
  } catch (error) {
    console.error('Update online status error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function onRequestGet(context) {
  const { request } = context
  
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing userId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // 获取用户信息
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=id,last_active,is_online,nickname,avatar,photos`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    )
    
    if (!response.ok) {
      const error = await response.text()
      return new Response(JSON.stringify({ error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    const data = await response.json()
    const user = Array.isArray(data) && data.length > 0 ? data[0] : null
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // 计算在线状态
    let isOnline = false
    let lastActiveText = '离线'
    
    if (user.last_active) {
      const lastActive = new Date(user.last_active)
      const now = new Date()
      const diffMs = now.getTime() - lastActive.getTime()
      const diffSecs = Math.floor(diffMs / 1000)
      
      // 60秒内视为在线
      if (diffSecs < 60) {
        isOnline = true
        lastActiveText = '在线'
      } else if (diffSecs < 3600) {
        lastActiveText = `${Math.floor(diffSecs / 60)}分钟前`
      } else if (diffSecs < 86400) {
        lastActiveText = `${Math.floor(diffSecs / 3600)}小时前`
      } else {
        lastActiveText = `${Math.floor(diffSecs / 86400)}天前`
      }
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar || (user.photos && user.photos[0]) || null,
        isOnline,
        lastActiveText,
        lastActive: user.last_active
      }
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
    
  } catch (error) {
    console.error('Get online status error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
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
