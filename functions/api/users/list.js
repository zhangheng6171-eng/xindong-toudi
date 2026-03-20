/**
 * 获取所有用户列表 API - 使用 Supabase
 * 包含用户详细资料（头像、照片墙等）
 */

const SUPABASE_URL = 'https://ntaqnyegiiwtzdyqjiwy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50YXFueWVnaWl3dHpkeXFqaXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTY4NzUsImV4cCI6MjA4OTQ5Mjg3NX0.4FEAb1Yd4xOwXz3LcfZ9iPG0ZZPbFd8dfry903c5lPc'

export async function onRequestGet(context) {
  const { request } = context
  
  try {
    const url = new URL(request.url)
    const excludeUserId = url.searchParams.get('exclude')
    
    // 查询所有用户
    let query = `${SUPABASE_URL}/rest/v1/users?select=*`
    if (excludeUserId) {
      query += `&id=not.eq.${excludeUserId}`
    }
    
    const response = await fetch(query, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    })
    
    const users = await response.json()
    
    if (!Array.isArray(users)) {
      return new Response(JSON.stringify({ 
        success: true, 
        users: [] 
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }
    
    // 获取所有用户的 profiles
    const userIds = users.map(u => u.id)
    const profilesQuery = `${SUPABASE_URL}/rest/v1/profiles?select=*&user_id=in.(${userIds.join(',')})`
    
    const profilesResponse = await fetch(profilesQuery, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    })
    
    const profiles = await profilesResponse.json()
    
    // 创建 user_id -> profile 的映射
    const profileMap = {}
    if (Array.isArray(profiles)) {
      profiles.forEach(p => {
        profileMap[p.user_id] = p
      })
    }
    
    // 格式化用户数据，合并 users 和 profiles
    const formattedUsers = users.map(u => {
      const profile = profileMap[u.id] || {}
      return {
        id: u.id,
        email: u.email,
        nickname: u.nickname,
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
    })
    
    return new Response(JSON.stringify({ 
      success: true, 
      users: formattedUsers,
      count: formattedUsers.length
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
    
  } catch (error) {
    console.error('Get users error:', error)
    return new Response(JSON.stringify({ 
      success: true, 
      users: [],
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
