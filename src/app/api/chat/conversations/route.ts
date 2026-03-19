/**
 * 心动投递 - 会话列表 API
 * 
 * GET: 获取当前用户的所有会话列表
 */

import { NextRequest } from 'next/server'

import { supabase } from '@/lib/supabase'

import { getCurrentUser, successResponse, errorResponse, unauthorizedResponse } from '@/app/api/utils'


export async function GET(request: NextRequest) {
  try {
    // 获取当前用户
    const userId = await getCurrentUser(request)
    if (!userId) {
      return unauthorizedResponse()
    }

    // 获取用户的所有会话
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select(`
        *,
        match:matches(
          *,
          user1:users!user1_id(id, nickname, avatar),
          user2:users!user2_id(id, nickname, avatar)
        )
      `)
      .contains('participant_ids', [userId])
      .order('last_message_at', { ascending: false })

    if (conversationsError) {
      console.error('获取会话失败:', conversationsError)
      return errorResponse('获取会话列表失败', 500)
    }

    // 获取未读消息数
    const { data: unreadData } = await supabase
      .rpc('get_unread_count', { user_id: userId })

    const unreadMap = new Map()
    if (unreadData) {
      unreadData.forEach((item: any) => {
        unreadMap.set(item.conversation_id, item.unread_count)
      })
    }

    // 格式化会话数据
    const formattedConversations = conversations?.map((conv: any) => {
      // 确定对方用户
      const match = conv.match
      const otherUser = match.user1_id === userId ? match.user2 : match.user1

      return {
        id: conv.id,
        matchId: conv.match_id,
        otherUser: {
          id: otherUser.id,
          nickname: otherUser.nickname,
          avatar: otherUser.avatar,
        },
        lastMessage: conv.last_message,
        lastMessageAt: conv.last_message_at,
        unreadCount: unreadMap.get(conv.id) || 0,
        matchScore: match.score,
        createdAt: conv.created_at,
      }
    }) || []

    return successResponse({ conversations: formattedConversations })
  } catch (error) {
    console.error('会话列表API错误:', error)
    return errorResponse('服务器错误', 500)
  }
}
