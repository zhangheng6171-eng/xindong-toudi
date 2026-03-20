/**
 * 获取单个用户详情 API - 使用 Supabase
 * 路由: /api/users/{userId}
 */

const SUPABASE_URL = 'https://ntaqnyegiiwtzdyqjiwy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50YXFueWVnaWl3dHpkeXFqaXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTY4NzUsImV4cCI6MjA4OTQ5Mjg3NX0.4FEAb1Yd4xOwXz3LcfZ9iPG0ZZPbFd8dfry903c5lPc'

export async function onRequestGet(context) {
  const { request, params } = context
  const userId = params.id
  
  if (!userId) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: '缺少用户ID' 
    }), {
      status: 400,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
  
  try {
    // 查询单个用户
    const userQuery = `${SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=*`
    
    const userResponse = await fetch(userQuery, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    })
    
    const users = await userResponse.json()
    
    if (!Array.isArray(users) || users.length === 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: '用户不存在' 
      }), {
        status: 404,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }
    
    const u = users[0]
    
    // 尝试获取 profile 数据（如果表存在）
    let profile = {}
    try {
      const profileQuery = `${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${userId}&select=*`
      
      const profileResponse = await fetch(profileQuery, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      })
      
      if (profileResponse.ok) {
        const profiles = await profileResponse.json()
        if (Array.isArray(profiles) && profiles.length > 0) {
          profile = profiles[0]
        }
      }
    } catch (e) {
      console.log('Profiles table not found, using users table only')
    }
    
    // 格式化用户数据
    const formattedUser = {
      id: u.id,
      email: u.email,
      nickname: u.nickname || u.email?.split('@')[0] || '用户',
      avatar: u.avatar || null,
      gender: u.gender || 'male',
      age: u.age || 25,
      city: u.city || '未知',
      occupation: profile.occupation || '',
      education: profile.education || '',
      height: profile.height || 0,
      bio: profile.bio || '',
      interests: profile.interests || [],
      photos: profile.photos || [],
      createdAt: u.created_at
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      user: formattedUser
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
    
  } catch (error) {
    console.error('Get user detail error:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
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
