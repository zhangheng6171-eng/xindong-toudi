/**
 * 更新用户在线状态 API - 安全版本
 * 从环境变量读取配置
 */

import { getSupabaseConfig, corsHeaders, errorResponse, successResponse } from '../../lib/config.js'

export async function onRequestPost(context) {
  const { request, env } = context
  const config = getSupabaseConfig(env)
  
  try {
    const body = await request.json()
    const { userId, isOnline } = body
    
    if (!userId) {
      return errorResponse('Missing userId', 400)
    }
    
    // 更新用户在线状态
    const response = await fetch(`${config.url}/rest/v1/users?id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': config.anonKey,
        'Authorization': `Bearer ${config.anonKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        last_active: new Date().toISOString(),
        is_online: isOnline
      })
    })
    
    if (!response.ok) {
      // 如果更新失败，尝试只更新last_active
      const fallbackResponse = await fetch(`${config.url}/rest/v1/users?id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': config.anonKey,
          'Authorization': `Bearer ${config.anonKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          last_active: new Date().toISOString()
        })
      })
      
      if (!fallbackResponse.ok) {
        const error = await fallbackResponse.text()
        console.error('Supabase update error:', error)
        return errorResponse(error, 500)
      }
    }
    
    return successResponse({
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Update online status error:', error)
    return errorResponse(error.message, 500)
  }
}

export async function onRequestGet(context) {
  const { request, env } = context
  const config = getSupabaseConfig(env)
  
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    
    if (!userId) {
      return errorResponse('Missing userId', 400)
    }
    
    // 获取用户信息
    const response = await fetch(
      `${config.url}/rest/v1/users?id=eq.${userId}&select=id,last_active,is_online,nickname,avatar,photos`,
      {
        headers: {
          'apikey': config.anonKey,
          'Authorization': `Bearer ${config.anonKey}`
        }
      }
    )
    
    if (!response.ok) {
      const error = await response.text()
      return errorResponse(error, 500)
    }
    
    const data = await response.json()
    const user = Array.isArray(data) && data.length > 0 ? data[0] : null
    
    if (!user) {
      return errorResponse('User not found', 404)
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
    
    return successResponse({
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar || (user.photos && user.photos[0]) || null,
        isOnline,
        lastActiveText,
        lastActive: user.last_active
      }
    })
    
  } catch (error) {
    console.error('Get online status error:', error)
    return errorResponse(error.message, 500)
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  })
}
