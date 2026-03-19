/**
 * 心动投递 - 未读消息数 API
 * 
 * GET: 获取当前用户的未读消息总数
 */

import { NextRequest } from 'next/server'

import { supabase } from '@/lib/supabase'

import { getCurrentUser, successResponse, unauthorizedResponse, errorResponse } from '@/app/api/utils'


export async function GET(request: NextRequest) {
  try {
    // 获取当前用户
    const userId = await getCurrentUser(request)
    if (!userId) {
      return unauthorizedResponse()
    }

    // 获取未读消息数（按会话分组）
    const { data: unreadData, error } = await supabase
      .rpc('get_unread_count', { user_id: userId })

    if (error) {
      console.error('获取未读数失败:', error)
      return errorResponse('获取未读消息数失败', 500)
    }

    // 计算总数
    const totalUnread = unreadData?.reduce((sum: number, item: any) => sum + (item.unread_count || 0), 0) || 0

    // 转换为对象格式
    const unreadByConversation: Record<string, number> = {}
    unreadData?.forEach((item: any) => {
      unreadByConversation[item.conversation_id] = item.unread_count
    })

    return successResponse({
      totalUnread,
      unreadByConversation,
    })
  } catch (error) {
    console.error('未读数API错误:', error)
    return errorResponse('服务器错误', 500)
  }
}
