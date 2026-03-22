/**
 * 发送消息 API - 安全版本
 * 从环境变量读取配置
 */

import { getSupabaseConfig, corsHeaders, errorResponse, successResponse } from '../../lib/config.js'

export async function onRequestPost(context) {
  const { request, env } = context
  const config = getSupabaseConfig(env)
  
  try {
    const body = await request.json()
    const { senderId, receiverId, text, type = 'text' } = body
    
    if (!senderId || !receiverId || !text) {
      return errorResponse('Missing required fields: senderId, receiverId, text', 400)
    }
    
    // 使用 REST API 插入消息
    const response = await fetch(`${config.url}/rest/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': config.anonKey,
        'Authorization': `Bearer ${config.anonKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        sender_id: senderId,
        receiver_id: receiverId,
        content: text,
        type,
        status: 'sent'
      })
    })
    
    if (!response.ok) {
      const error = await response.text()
      console.error('Supabase insert error:', error)
      return errorResponse(error, 500)
    }
    
    const data = await response.json()
    const message = Array.isArray(data) ? data[0] : data
    
    return successResponse({
      message: {
        id: message.id,
        senderId: message.sender_id,
        receiverId: message.receiver_id,
        text: message.content,
        type: message.type,
        timestamp: message.created_at,
        status: message.status
      }
    })
    
  } catch (error) {
    console.error('Send message error:', error)
    return errorResponse(error.message, 500)
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  })
}
