/**
 * 标记消息已读 API - 安全版本
 * 从环境变量读取配置
 */

import { getSupabaseConfig, corsHeaders, errorResponse, successResponse } from '../../lib/config.js'

export async function onRequestPost(context) {
  const { request, env } = context
  const config = getSupabaseConfig(env)
  
  try {
    const body = await request.json()
    const { userId, otherUserId, lastReadAt } = body
    
    if (!userId || !otherUserId || !lastReadAt) {
      return errorResponse('Missing required fields: userId, otherUserId, lastReadAt', 400)
    }
    
    // 检查是否有 service role key（用于写操作）
    if (!config.serviceRoleKey) {
      return errorResponse('服务端配置错误：缺少 service role key', 500)
    }
    
    // 更新所有由 otherUserId 发送给 userId 的消息状态为 'read'
    // 使用 Service Role Key 以便有权限更新
    const updateResponse = await fetch(
      `${config.url}/rest/v1/messages?sender_id=eq.${otherUserId}&receiver_id=eq.${userId}&status=eq.sent`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': config.serviceRoleKey,
          'Authorization': `Bearer ${config.serviceRoleKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          status: 'read'
        })
      }
    )
    
    if (!updateResponse.ok) {
      const error = await updateResponse.text()
      console.error('Supabase update error:', error)
    }
    
    const updated = await updateResponse.json()
    
    return successResponse({
      updatedCount: Array.isArray(updated) ? updated.length : 0,
      lastReadAt
    })
    
  } catch (error) {
    console.error('Mark read error:', error)
    return errorResponse(error.message, 500)
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  })
}
