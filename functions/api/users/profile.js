/**
 * 用户资料更新 API - 更新用户信息和 profile
 * 支持更新：头像、照片墙、个人资料等
 */

const SUPABASE_URL = 'https://ntaqnyegiiwtzdyqjiwy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50YXFueWVnaWl3dHpkeXFqaXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTY4NzUsImV4cCI6MjA4OTQ5Mjg3NX0.4FEAb1Yd4xOwXz3LcfZ9iPG0ZZPbFd8dfry903c5lPc'

// GET: 获取用户详细资料
export async function onRequestGet(context) {
  const { request } = context
  
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    
    if (!userId) {
      return new Response(JSON.stringify({ error: '缺少 userId 参数' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }
    
    // 获取用户基本信息
    const userResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    )
    
    const users = await userResponse.json()
    if (!Array.isArray(users) || users.length === 0) {
      return new Response(JSON.stringify({ error: '用户不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }
    
    const user = users[0]
    
    // 获取用户 profile
    const profileResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${userId}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    )
    
    const profiles = await profileResponse.json()
    const profile = Array.isArray(profiles) && profiles.length > 0 ? profiles[0] : null
    
    return new Response(JSON.stringify({ 
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        gender: user.gender,
        age: user.age,
        city: user.city,
        createdAt: user.created_at
      },
      profile: profile ? {
        bio: profile.bio,
        interests: profile.interests,
        occupation: profile.occupation,
        education: profile.education,
        height: profile.height,
        photos: profile.photos,
        lookingFor: profile.looking_for
      } : null
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
    
  } catch (error) {
    console.error('Get profile error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
}

// POST: 更新用户资料
export async function onRequestPost(context) {
  const { request } = context
  
  try {
    const body = await request.json()
    const { userId, updates } = body
    
    if (!userId) {
      return new Response(JSON.stringify({ error: '缺少 userId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }
    
    // 更新 users 表的字段（nickname, avatar, age, city, gender）
    const userFields = {}
    if (updates.nickname !== undefined) userFields.nickname = updates.nickname
    if (updates.avatar !== undefined) userFields.avatar = updates.avatar
    if (updates.age !== undefined) userFields.age = updates.age
    if (updates.city !== undefined) userFields.city = updates.city
    if (updates.gender !== undefined) userFields.gender = updates.gender
    
    if (Object.keys(userFields).length > 0) {
      userFields.updated_at = new Date().toISOString()
      
      const userUpdateResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/users?id=eq.${userId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(userFields)
        }
      )
      
      if (!userUpdateResponse.ok) {
        const error = await userUpdateResponse.text()
        console.error('Update user error:', error)
      }
    }
    
    // 更新 profiles 表的字段
    const profileFields = {}
    if (updates.bio !== undefined) profileFields.bio = updates.bio
    if (updates.interests !== undefined) profileFields.interests = updates.interests
    if (updates.occupation !== undefined) profileFields.occupation = updates.occupation
    if (updates.education !== undefined) profileFields.education = updates.education
    if (updates.height !== undefined) profileFields.height = updates.height
    if (updates.photos !== undefined) profileFields.photos = updates.photos
    if (updates.lookingFor !== undefined) profileFields.looking_for = updates.lookingFor
    
    if (Object.keys(profileFields).length > 0) {
      profileFields.updated_at = new Date().toISOString()
      
      // 先检查 profile 是否存在
      const checkResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${userId}&select=id`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        }
      )
      
      const existing = await checkResponse.json()
      
      if (Array.isArray(existing) && existing.length > 0) {
        // 更新现有 profile
        const profileUpdateResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${userId}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'Prefer': 'return=representation'
            },
            body: JSON.stringify(profileFields)
          }
        )
        
        if (!profileUpdateResponse.ok) {
          const error = await profileUpdateResponse.text()
          console.error('Update profile error:', error)
        }
      } else {
        // 创建新 profile
        profileFields.user_id = userId
        
        const profileCreateResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/profiles`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'Prefer': 'return=representation'
            },
            body: JSON.stringify(profileFields)
          }
        )
        
        if (!profileCreateResponse.ok) {
          const error = await profileCreateResponse.text()
          console.error('Create profile error:', error)
        }
      }
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      message: '资料更新成功'
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
    
  } catch (error) {
    console.error('Update profile error:', error)
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}
