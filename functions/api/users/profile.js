/**
 * 用户资料更新 API - 安全版本
 * 从环境变量读取配置
 * 支持更新：头像、照片墙、个人资料等
 */

import { getSupabaseConfig, corsHeaders, errorResponse, successResponse } from '../../lib/config.js'

// GET: 获取用户详细资料
export async function onRequestGet(context) {
  const { request, env } = context
  const config = getSupabaseConfig(env)
  
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    
    if (!userId) {
      return errorResponse('缺少 userId 参数', 400)
    }
    
    // 获取用户基本信息（不返回密码）
    const userResponse = await fetch(
      `${config.url}/rest/v1/users?id=eq.${userId}&select=id,email,nickname,avatar,gender,age,city,created_at`,
      {
        headers: {
          'apikey': config.anonKey,
          'Authorization': `Bearer ${config.anonKey}`
        }
      }
    )
    
    const users = await userResponse.json()
    if (!Array.isArray(users) || users.length === 0) {
      return errorResponse('用户不存在', 404)
    }
    
    const user = users[0]
    
    // 尝试获取用户 profile
    let profile = null
    try {
      const profileResponse = await fetch(
        `${config.url}/rest/v1/profiles?user_id=eq.${userId}&select=*`,
        {
          headers: {
            'apikey': config.anonKey,
            'Authorization': `Bearer ${config.anonKey}`
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
    
    return successResponse({
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
    })
    
  } catch (error) {
    console.error('Get profile error:', error)
    return errorResponse(error.message, 500)
  }
}

// POST: 更新用户资料
export async function onRequestPost(context) {
  const { request, env } = context
  const config = getSupabaseConfig(env)
  
  try {
    const body = await request.json()
    const { userId, updates } = body
    
    if (!userId) {
      return errorResponse('缺少 userId', 400)
    }
    
    // 检查是否有 service role key（用于写操作）
    if (!config.serviceRoleKey) {
      return errorResponse('服务端配置错误：缺少 service role key', 500)
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
        `${config.url}/rest/v1/users?id=eq.${userId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': config.serviceRoleKey,
            'Authorization': `Bearer ${config.serviceRoleKey}`,
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
      let profileExists = false
      try {
        const checkResponse = await fetch(
          `${config.url}/rest/v1/profiles?user_id=eq.${userId}&select=id`,
          {
            headers: {
              'apikey': config.anonKey,
              'Authorization': `Bearer ${config.anonKey}`
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
          `${config.url}/rest/v1/profiles?user_id=eq.${userId}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': config.serviceRoleKey,
              'Authorization': `Bearer ${config.serviceRoleKey}`,
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
          `${config.url}/rest/v1/profiles`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': config.serviceRoleKey,
              'Authorization': `Bearer ${config.serviceRoleKey}`,
              'Prefer': 'return=minimal'
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
    
    return successResponse({
      message: '资料更新成功'
    })
    
  } catch (error) {
    console.error('Update profile error:', error)
    return errorResponse(error.message, 500)
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  })
}
