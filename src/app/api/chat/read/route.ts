/**
 * 心动投递 - 标记已读 API
 * 
 * POST: 标记消息为已读
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
    const { conversationId } = body

    if (!conversationId) {
      return errorResponse('缺少会话ID')
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

    // 获取该会话中用户未读的所有消息
    const { data: unreadMessages, error: unreadError } = await supabase
      .from('messages')
      .select('id')
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .not('id', 'in', (
        supabase
          .from('message_reads')
          .select('message_id')
          .eq('user_id', userId)
      ))

    if (unreadError) {
      console.error('获取未读消息失败:', unreadError)
      return errorResponse('操作失败', 500)
    }

    if (!unreadMessages || unreadMessages.length === 0) {
      return successResponse({ markedAsRead: 0 })
    }

    // 创建已读记录
    const readRecords = unreadMessages.map((msg: any) => ({
      message_id: msg.id,
      user_id: userId,
    }))

    const { error: insertError } = await supabase
      .from('message_reads')
      .upsert(readRecords, { onConflict: 'message_id,user_id' })

    if (insertError) {
      console.error('标记已读失败:', insertError)
      return errorResponse('操作失败', 500)
    }

    // 更新消息状态为已读
    await supabase
      .from('messages')
      .update({ status: 'read', read_at: new Date().toISOString() })
      .in('id', unreadMessages.map((m: any) => m.id))

    return successResponse({ 
      markedAsRead: unreadMessages.length 
    })
  } catch (error) {
    console.error('标记已读API错误:', error)
    return errorResponse('服务器错误', 500)
  }
}
