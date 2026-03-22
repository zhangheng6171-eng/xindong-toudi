/**
 * 获取所有用户列表 API - 安全版本
 * 从环境变量读取配置
 */

import { getSupabaseConfig, corsHeaders, errorResponse, successResponse } from '../../lib/config.js'

export async function onRequestGet(context) {
  const { request, env } = context
  const config = getSupabaseConfig(env)
  
  try {
    const url = new URL(request.url)
    const excludeUserId = url.searchParams.get('exclude')
    
    // 查询所有用户（排除敏感字段 - 不返回密码）
    let query = `${config.url}/rest/v1/users?select=id,email,nickname,avatar,gender,age,city,created_at`
    if (excludeUserId) {
      query += `&id=not.eq.${excludeUserId}`
    }
    
    const response = await fetch(query, {
      headers: {
        'apikey': config.anonKey,
        'Authorization': `Bearer ${config.anonKey}`
      }
    })
    
    const users = await response.json()
    
    if (!Array.isArray(users)) {
      return successResponse({ users: [] })
    }
    
    // 尝试获取 profiles 数据（如果表存在）
    let profileMap = {}
    try {
      const userIds = users.map(u => u.id)
      const profilesQuery = `${config.url}/rest/v1/profiles?select=*&user_id=in.(${userIds.join(',')})`
      
      const profilesResponse = await fetch(profilesQuery, {
        headers: {
          'apikey': config.anonKey,
          'Authorization': `Bearer ${config.anonKey}`
        }
      })
      
      if (profilesResponse.ok) {
        const profiles = await profilesResponse.json()
        if (Array.isArray(profiles)) {
          profiles.forEach(p => {
            profileMap[p.user_id] = p
          })
        }
      }
    } catch (e) {
      console.log('Profiles table not found, using users table only')
    }
    
    // 格式化用户数据（不返回敏感信息）
    const formattedUsers = users.map(u => {
      const profile = profileMap[u.id] || {}
      return {
        id: u.id,
        email: u.email, // 可以根据需要决定是否返回
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
    })
    
    return successResponse({
      users: formattedUsers,
      count: formattedUsers.length
    })
    
  } catch (error) {
    console.error('Get users error:', error)
    return successResponse({ users: [], error: error.message })
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  })
}
