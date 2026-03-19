/**
 * 心动投递 - 消息历史 API
 * 
 * GET: 获取指定会话的消息历史
 */

import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, successResponse, errorResponse, unauthorizedResponse } from '@/app/api/utils'


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    // 获取当前用户
    const userId = await getCurrentUser(request)
    if (!userId) {
      return unauthorizedResponse()
    }

    const { conversationId } = await params

    // 获取查询参数
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const before = searchParams.get('before') // 用于分页

    // 验证会话存在且用户是参与者
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select(`
        *,
        match:matches(
          *,
          user1:users!user1_id(id, nickname, avatar, age, city),
          user2:users!user2_id(id, nickname, avatar, age, city)
        )
      `)
      .eq('id', conversationId)
      .contains('participant_ids', [userId])
      .single()

    if (convError || !conversation) {
      return errorResponse('会话不存在或您没有权限', 403)
    }

    // 构建查询
    let query = supabase
      .from('messages')
      .select(`
        *,
        sender:users!sender_id(id, nickname, avatar)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit)

    // 如果有before参数，加载更早的消息
    if (before) {
      query = query.lt('created_at', before)
    }

    const { data: messages, error: messagesError } = await query

    if (messagesError) {
      console.error('获取消息失败:', messagesError)
      return errorResponse('获取消息失败', 500)
    }

    // 获取已读状态
    const messageIds = messages?.map((m: any) => m.id) || []
    const { data: readStatus } = await supabase
      .from('message_reads')
      .select('message_id, user_id, read_at')
      .in('message_id', messageIds)

    // 创建已读映射
    const readMap = new Map<string, { read: boolean; readAt?: string }>()
    messageIds.forEach((id: string) => {
      const reads = readStatus?.filter((r: any) => r.message_id === id) || []
      readMap.set(id, {
        read: reads.length > 0,
        readAt: reads[0]?.read_at,
      })
    })

    // 确定对方用户
    const match = conversation.match
    const otherUser = match.user1_id === userId ? match.user2 : match.user1

    // 格式化响应
    const formattedMessages = messages?.reverse().map((msg: any) => ({
      id: msg.id,
      conversationId: msg.conversation_id,
      senderId: msg.sender_id,
      sender: msg.sender,
      content: msg.content,
      type: msg.type,
      status: msg.status,
      createdAt: msg.created_at,
      metadata: msg.metadata,
      read: readMap.get(msg.id)?.read || false,
      readAt: readMap.get(msg.id)?.readAt,
    })) || []

    return successResponse({
      conversation: {
        id: conversation.id,
        matchId: conversation.match_id,
        matchScore: match.score,
        otherUser: {
          id: otherUser.id,
          nickname: otherUser.nickname,
          avatar: otherUser.avatar,
          age: otherUser.age,
          city: otherUser.city,
        },
        createdAt: conversation.created_at,
      },
      messages: formattedMessages,
      hasMore: messages?.length === limit,
    })
  } catch (error) {
    console.error('消息历史API错误:', error)
    return errorResponse('服务器错误', 500)
  }
}
