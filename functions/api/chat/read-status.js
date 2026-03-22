/**
 * 获取已读状态 API - 安全版本
 * 从环境变量读取配置
 */

import { getSupabaseConfig, corsHeaders, errorResponse, successResponse } from '../../lib/config.js'

export async function onRequestGet(context) {
  const { request, env } = context
  const config = getSupabaseConfig(env)
  
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    const otherUserId = url.searchParams.get('otherUserId')
    
    if (!userId || !otherUserId) {
      return errorResponse('Missing user IDs: userId and otherUserId are required', 400)
    }
    
    // 查询对方发送给我的已读消息中，最新的已读消息的创建时间
    const response = await fetch(
      `${config.url}/rest/v1/messages?sender_id=eq.${otherUserId}&receiver_id=eq.${userId}&status=eq.read&select=created_at&order=created_at.desc&limit=1`,
      {
        headers: {
          'apikey': config.anonKey,
          'Authorization': `Bearer ${config.anonKey}`
        }
      }
    )
    
    const messages = await response.json()
    
    let lastReadAt = null
    if (Array.isArray(messages) && messages.length > 0) {
      lastReadAt = messages[0].created_at
    }
    
    return successResponse({
      lastReadAt,
      userId,
      otherUserId
    })
    
  } catch (error) {
    console.error('Get read status error:', error)
    return errorResponse(error.message, 500)
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  })
}
