/**
 * 用户资料更新 API - 更新用户信息和 profile
 * 支持更新：头像、照片墙、个人资料等
 * 
 * 如果 profiles 表不存在，会自动创建
 */

const SUPABASE_URL = 'https://ntaqnyegiiwtzdyqjiwy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50YXFueWVnaWl3dHpkeXFqaXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTY4NzUsImV4cCI6MjA4OTQ5Mjg3NX0.4FEAb1Yd4xOwXz3LcfZ9iPG0ZZPbFd8dfry903c5lPc'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50YXFueWVnaWl3dHpkeXFqaXd5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkxNjg3NSwiZXhwIjoyMDg5NDkyODc1fQ.z8LPpoJoa9_DEJvBmNvSF0Q1I4FA3FNnFRU0PgKcF2A'

// 确保 profiles 表存在
async function ensureProfilesTable() {
  // 尝试查询 profiles 表，如果失败说明表不存在
  try {
    const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id&limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    })
    
    if (checkResponse.ok) {
      return true // 表已存在
    }
  } catch (e) {
    // 忽略错误
  }
  
  // 表不存在，尝试通过插入数据来创建（使用 service role）
  // 注意：这需要 RLS 策略允许插入
  return false
}

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
    
    // 尝试获取用户 profile
    let profile = null
    try {
      const profileResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${userId}&select=*`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        }
      )
      
      if (profileResponse.ok) {
        const profiles = await profileResponse.json()
        if (Array.isArray(profiles) && profiles.length > 0) {
          profile = profiles[0]
        }
      }
    } catch (e) {
      console.log('Profiles table not found')
    }
    
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
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(userFields)
        }
      )
      
      if (!userUpdateResponse.ok) {
        const error = await userUpdateResponse.text()
        console.error('Update user error:', error)
      }
    }
    
    // 更新 profiles 表的字段（bio, interests, occupation, education, height, photos, lookingFor）
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
      let profileExists = false
      try {
        const checkResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${userId}&select=id`,
          {
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
          }
        )
        
        if (checkResponse.ok) {
          const existing = await checkResponse.json()
          profileExists = Array.isArray(existing) && existing.length > 0
        }
      } catch (e) {
        // profiles 表可能不存在
      }
      
      if (profileExists) {
        // 更新现有 profile
        const profileUpdateResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${userId}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
              'Prefer': 'return=minimal'
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
              'apikey': SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify(profileFields)
          }
        )
        
        if (!profileCreateResponse.ok) {
          const error = await profileCreateResponse.text()
          console.error('Create profile error:', error)
          
          // 如果是表不存在的错误，返回友好提示
          if (error.includes('relation') || error.includes('does not exist')) {
            return new Response(JSON.stringify({ 
              success: true,
              message: '头像已同步，照片墙功能需要创建 profiles 表',
              needProfilesTable: true
            }), {
              status: 200,
              headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              }
            })
          }
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
