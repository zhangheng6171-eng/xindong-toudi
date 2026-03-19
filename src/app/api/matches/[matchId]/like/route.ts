/**
 * 心动投递 - 喜欢/取消喜欢 API
 * 
 * POST: 对匹配进行喜欢/不喜欢操作
 * 如果双方都互相喜欢，则创建会话
 */

import { NextRequest } from 'next/server'

import { supabase } from '@/lib/supabase'

import { getCurrentUser, successResponse, errorResponse, unauthorizedResponse } from '@/app/api/utils'


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    // 获取当前用户
    const userId = await getCurrentUser(request)
    if (!userId) {
      return unauthorizedResponse()
    }

    const { matchId } = await params
    const body = await request.json()
    const { action } = body // 'like' | 'pass' | 'super_like'

    if (!['like', 'pass', 'super_like'].includes(action)) {
      return errorResponse('无效的操作')
    }

    // 获取匹配信息
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single()

    if (matchError || !match) {
      return errorResponse('匹配不存在')
    }

    // 验证用户是匹配的参与者
    if (match.user1_id !== userId && match.user2_id !== userId) {
      return errorResponse('无权操作此匹配', 403)
    }

    // 确定对方用户
    const targetUserId = match.user1_id === userId ? match.user2_id : match.user1_id
    const isUser1 = match.user1_id === userId

    // 更新匹配状态
    let newStatus = match.status
    let conversationCreated = false
    let conversationId = null

    if (action === 'like') {
      // 记录喜欢
      await supabase.from('user_likes').upsert({
        user_id: userId,
        target_user_id: targetUserId,
        match_id: matchId,
      }, { onConflict: 'user_id,target_user_id' })

      // 更新匹配状态
      if (isUser1) {
        newStatus = match.user2_action === 'like' ? 'mutual' : 'liked_by_user1'
        await supabase
          .from('matches')
          .update({ 
            user1_action: 'like',
            status: newStatus,
            matched_at: newStatus === 'mutual' ? new Date().toISOString() : null,
          })
          .eq('id', matchId)
      } else {
        newStatus = match.user1_action === 'like' ? 'mutual' : 'liked_by_user2'
        await supabase
          .from('matches')
          .update({ 
            user2_action: 'like',
            status: newStatus,
            matched_at: newStatus === 'mutual' ? new Date().toISOString() : null,
          })
          .eq('id', matchId)
      }

      // 如果互相喜欢，创建会话
      if (newStatus === 'mutual') {
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .insert({
            match_id: matchId,
            participant_ids: [match.user1_id, match.user2_id],
          })
          .select()
          .single()

        if (!convError && conversation) {
          conversationCreated = true
          conversationId = conversation.id
        }
      }
    } else if (action === 'pass') {
      // 不喜欢
      if (isUser1) {
        newStatus = 'rejected'
        await supabase
          .from('matches')
          .update({ user1_action: 'pass', status: 'rejected' })
          .eq('id', matchId)
      } else {
        newStatus = 'rejected'
        await supabase
          .from('matches')
          .update({ user2_action: 'pass', status: 'rejected' })
          .eq('id', matchId)
      }
    }

    return successResponse({
      matchId,
      action,
      newStatus,
      conversationCreated,
      conversationId,
    })
  } catch (error) {
    console.error('喜欢操作API错误:', error)
    return errorResponse('服务器错误', 500)
  }
}
