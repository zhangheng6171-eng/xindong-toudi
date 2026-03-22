/**
 * 获取消息 API - 使用 Supabase REST API
 * 安全版本：从环境变量读取配置
 */

import { getSupabaseConfig, corsHeaders, errorResponse, successResponse } from '../../lib/config.js'

export async function onRequestGet(context) {
  const { request, env } = context
  const config = getSupabaseConfig(env)
  
  try {
    const url = new URL(request.url)
    const userId1 = url.searchParams.get('userId1')
    const userId2 = url.searchParams.get('userId2')
    
    if (!userId1 || !userId2) {
      return errorResponse('Missing user IDs: userId1 and userId2 are required', 400)
    }
    
    // 使用 REST API 查询发送的消息
    const sentResponse = await fetch(
      `${config.url}/rest/v1/messages?sender_id=eq.${userId1}&receiver_id=eq.${userId2}&select=*&order=created_at.asc`,
      {
        headers: {
          'apikey': config.anonKey,
          'Authorization': `Bearer ${config.anonKey}`
        }
      }
    )
    
    const sentMessages = await sentResponse.json()
    
    // 查询接收的消息
    const receivedResponse = await fetch(
      `${config.url}/rest/v1/messages?sender_id=eq.${userId2}&receiver_id=eq.${userId1}&select=*&order=created_at.asc`,
      {
        headers: {
          'apikey': config.anonKey,
          'Authorization': `Bearer ${config.anonKey}`
        }
      }
    )
    
    const receivedMessages = await receivedResponse.json()
    
    // 合并并排序
    const allMessages = [
      ...(Array.isArray(sentMessages) ? sentMessages : []),
      ...(Array.isArray(receivedMessages) ? receivedMessages : [])
    ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    
    const messages = allMessages.map(m => ({
      id: m.id,
      senderId: m.sender_id,
      receiverId: m.receiver_id,
      text: m.content,
      type: m.type,
      timestamp: m.created_at,
      status: m.status
    }))
    
    return successResponse({
      messages,
      count: messages.length
    })
    
  } catch (error) {
    console.error('Get messages error:', error)
    return errorResponse(error.message, 500)
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  })
}
