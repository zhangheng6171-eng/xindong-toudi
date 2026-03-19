/**
 * 心动投递 - 发送消息 API
 * 
 * POST: 发送新消息
 */

import { NextRequest } from 'next/server'

import { supabase } from '@/lib/supabase'

import { getCurrentUser, successResponse, errorResponse, unauthorizedResponse } from '@/app/api/utils'


export async function POST(request: NextRequest) {
  try {
    // 获取当前用户
    const userId = await getCurrentUser(request)
    if (!userId) {
      return unauthorizedResponse()
    }

    // 解析请求体
    const body = await request.json()
    const { conversationId, content, type = 'text', metadata = {} } = body

    // 验证必需字段
    if (!conversationId) {
      return errorResponse('缺少会话ID')
    }
    if (!content || content.trim() === '') {
      return errorResponse('消息内容不能为空')
    }

    // 验证会话存在且用户是参与者
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .contains('participant_ids', [userId])
      .single()

    if (convError || !conversation) {
      return errorResponse('会话不存在或您没有权限', 403)
    }

    // 创建消息
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        content: content.trim(),
        type,
        status: 'sent',
        metadata,
      })
      .select(`
        *,
        sender:users!sender_id(id, nickname, avatar)
      `)
      .single()

    if (messageError) {
      console.error('发送消息失败:', messageError)
      return errorResponse('发送消息失败', 500)
    }

    // 更新会话的最后消息
    await supabase
      .from('conversations')
      .update({
        last_message: content.trim(),
        last_message_at: new Date().toISOString(),
      })
      .eq('id', conversationId)

    return successResponse({ 
      message: {
        id: message.id,
        conversationId: message.conversation_id,
        senderId: message.sender_id,
        sender: message.sender,
        content: message.content,
        type: message.type,
        status: message.status,
        createdAt: message.created_at,
        metadata: message.metadata,
      }
    })
  } catch (error) {
    console.error('发送消息API错误:', error)
    return errorResponse('服务器错误', 500)
  }
}
