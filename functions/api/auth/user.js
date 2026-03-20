/**
 * 用户注册/登录 API - 使用 Supabase
 */

const SUPABASE_URL = 'https://ntaqnyegiiwtzdyqjiwy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50YXFueWVnaWl3dHpkeXFqaXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTY4NzUsImV4cCI6MjA4OTQ5Mjg3NX0.4FEAb1Yd4xOwXz3LcfZ9iPG0ZZPbFd8dfry903c5lPc'

// 注册
export async function onRequestPost(context) {
  const { request } = context
  
  try {
    const body = await request.json()
    const { email, password, nickname, gender, age, city } = body
    
    if (!email || !password || !nickname) {
      return new Response(JSON.stringify({ error: '缺少必填字段' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // 检查邮箱是否已注册
    const checkResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    )
    
    const existingUsers = await checkResponse.json()
    
    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return new Response(JSON.stringify({ error: '该邮箱已被注册' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // 创建新用户
    const userId = `user_${Date.now()}`
    
    const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        id: userId,
        email,
        password, // 实际应用中应该加密
        nickname,
        gender: gender || null,
        age: age || null,
        city: city || null,
        created_at: new Date().toISOString()
      })
    })
    
    if (!insertResponse.ok) {
      const error = await insertResponse.text()
      console.error('Insert user error:', error)
      return new Response(JSON.stringify({ error: '注册失败，请重试' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    const data = await insertResponse.json()
    const user = Array.isArray(data) ? data[0] : data
    
    return new Response(JSON.stringify({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar || null,
        gender: user.gender,
        age: user.age,
        city: user.city,
        createdAt: user.created_at
      }
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
    
  } catch (error) {
    console.error('Register error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// 登录
export async function onRequestGet(context) {
  const { request } = context
  
  try {
    const url = new URL(request.url)
    const email = url.searchParams.get('email')
    const password = url.searchParams.get('password')
    
    if (!email || !password) {
      return new Response(JSON.stringify({ error: '缺少邮箱或密码' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // 查询用户
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    )
    
    const users = await response.json()
    
    if (!Array.isArray(users) || users.length === 0) {
      return new Response(JSON.stringify({ error: '该邮箱未注册，请先注册账号' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    const user = users[0]
    
    if (user.password !== password) {
      return new Response(JSON.stringify({ error: '密码错误，请重试' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar || null,
        gender: user.gender,
        age: user.age,
        city: user.city,
        createdAt: user.created_at
      }
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
    
  } catch (error) {
    console.error('Login error:', error)
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
