/**
 * 用户喜欢列表管理 API - 安全版本
 * 从环境变量读取配置
 */

import { getSupabaseConfig, corsHeaders, errorResponse, successResponse } from '../../lib/config.js'

export async function onRequestGet(context) {
  const { request, env } = context
  const config = getSupabaseConfig(env)
  
  try {
    const url = new URL(request.url)
    const action = url.searchParams.get('action')
    
    if (action === 'all') {
      // 获取所有用户的喜欢关系
      const response = await fetch(
        `${config.url}/rest/v1/users?select=id,likes`,
        {
          headers: {
            'apikey': config.anonKey,
            'Authorization': `Bearer ${config.anonKey}`
          }
        }
      )
      
      if (!response.ok) {
        return successResponse({
          likes: [],
          message: '数据库连接失败，请检查 likes 字段是否存在'
        })
      }
      
      const users = await response.json()
      const likes = []
      
      users.forEach(user => {
        if (user.likes && Array.isArray(user.likes)) {
          user.likes.forEach(targetId => {
            likes.push({ from_user_id: user.id, to_user_id: targetId })
          })
        }
      })
      
      return successResponse({
        likes: likes,
        count: likes.length
      })
    }
    
    // 获取指定用户的喜欢列表
    const userId = url.searchParams.get('userId')
    
    if (!userId) {
      return errorResponse('缺少参数: userId', 400)
    }
    
    const response = await fetch(
      `${config.url}/rest/v1/users?id=eq.${userId}&select=likes`,
      {
        headers: {
          'apikey': config.anonKey,
          'Authorization': `Bearer ${config.anonKey}`
        }
      }
    )
    
    if (response.ok) {
      const data = await response.json()
      if (data && data[0]) {
        return successResponse({
          likedUsers: data[0].likes || []
        })
      }
    }
    
    return successResponse({
      likedUsers: []
    })
    
  } catch (error) {
    return successResponse({
      likes: [],
      error: error.message
    })
  }
}

export async function onRequestPost(context) {
  const { request, env } = context
  const config = getSupabaseConfig(env)
  
  try {
    const body = await request.json()
    const { fromUserId, toUserId, action } = body
    
    if (!fromUserId || !toUserId) {
      return errorResponse('缺少参数: fromUserId, toUserId', 400)
    }
    
    // 检查是否有 service role key（用于写操作）
    if (!config.serviceRoleKey) {
      return errorResponse('服务端配置错误：缺少 service role key', 500)
    }
    
    // 获取当前用户的喜欢列表（使用 service role key 进行写操作）
    const getResponse = await fetch(
      `${config.url}/rest/v1/users?id=eq.${fromUserId}&select=likes`,
      {
        headers: {
          'apikey': config.serviceRoleKey,
          'Authorization': `Bearer ${config.serviceRoleKey}`
        }
      }
    )
    
    if (!getResponse.ok) {
      return successResponse({
        success: false,
        error: '获取用户数据失败，请确保 users 表有 likes 字段'
      })
    }
    
    const userData = await getResponse.json()
    let currentLikes = []
    
    if (userData && userData[0] && userData[0].likes) {
      currentLikes = userData[0].likes
    }
    
    // 更新喜欢列表
    if (action === 'like') {
      if (!currentLikes.includes(toUserId)) {
        currentLikes.push(toUserId)
      }
    } else {
      currentLikes = currentLikes.filter(id => id !== toUserId)
    }
    
    // 保存到数据库（使用 service role key）
    const updateResponse = await fetch(
      `${config.url}/rest/v1/users?id=eq.${fromUserId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': config.serviceRoleKey,
          'Authorization': `Bearer ${config.serviceRoleKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ likes: currentLikes })
      }
    )
    
    if (!updateResponse.ok) {
      const error = await updateResponse.text()
      return successResponse({
        success: false,
        error: '更新失败，请确保 users 表有 likes 字段',
        details: error
      })
    }
    
    return successResponse({
      success: true,
      message: action === 'like' ? '喜欢成功' : '取消喜欢成功',
      likes: currentLikes
    })
    
  } catch (error) {
    return successResponse({
      success: false,
      error: error.message
    })
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  })
}
