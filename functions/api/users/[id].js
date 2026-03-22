/**
 * 获取单个用户详情 API - 安全版本
 * 路由: /api/users/{userId}
 * 从环境变量读取配置
 */

import { getSupabaseConfig, corsHeaders, errorResponse, successResponse } from '../../lib/config.js'

export async function onRequestGet(context) {
  const { request, env, params } = context
  const config = getSupabaseConfig(env)
  const userId = params.id
  
  if (!userId) {
    return errorResponse('缺少用户ID', 400)
  }
  
  try {
    // 查询单个用户（不返回密码）
    const userQuery = `${config.url}/rest/v1/users?id=eq.${userId}&select=id,email,nickname,avatar,gender,age,city,created_at`
    
    const userResponse = await fetch(userQuery, {
      headers: {
        'apikey': config.anonKey,
        'Authorization': `Bearer ${config.anonKey}`
      }
    })
    
    const users = await userResponse.json()
    
    if (!Array.isArray(users) || users.length === 0) {
      return errorResponse('用户不存在', 404)
    }
    
    const u = users[0]
    
    // 尝试获取 profile 数据（如果表存在）
    let profile = {}
    try {
      const profileQuery = `${config.url}/rest/v1/profiles?user_id=eq.${userId}&select=*`
      
      const profileResponse = await fetch(profileQuery, {
        headers: {
          'apikey': config.anonKey,
          'Authorization': `Bearer ${config.anonKey}`
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
    
    return successResponse({
      user: formattedUser
    })
    
  } catch (error) {
    console.error('Get user detail error:', error)
    return errorResponse(error.message, 500)
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  })
}
