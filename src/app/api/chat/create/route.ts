/**
 * 心动投递 - 创建/获取会话 API
 *
 * POST: 创建或获取与特定用户的会话
 */

import { NextRequest, NextResponse } from 'next/server'

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
    const { targetUserId, matchId } = body

    if (!targetUserId) {
      return errorResponse('缺少目标用户ID')
    }

    // 检查是否已存在会话
    const { data: existingConversations, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .contains('participant_ids', [userId, targetUserId])

    if (convError) {
      console.error('查询会话失败:', convError)
    }

    // 如果已存在会话，直接返回
    if (existingConversations && existingConversations.length > 0) {
      const conversation = existingConversations[0]
      return successResponse({
        conversation: {
          id: conversation.id,
          matchId: conversation.match_id,
          participants: conversation.participant_ids,
          createdAt: conversation.created_at,
        },
        isNew: false,
      })
    }

    // 如果没有 matchId，尝试查找或创建匹配记录
    let actualMatchId = matchId
    if (!actualMatchId) {
      // 查找现有的匹配记录
      const { data: existingMatch } = await supabase
        .from('matches')
        .select('*')
        .or(`and(user1_id.eq.${userId},user2_id.eq.${targetUserId}),and(user1_id.eq.${targetUserId},user2_id.eq.${userId})`)
        .single()

      if (existingMatch) {
        actualMatchId = existingMatch.id
      } else {
        // 创建新的匹配记录
        const { data: newMatch, error: matchError } = await supabase
          .from('matches')
          .insert({
            user1_id: userId,
            user2_id: targetUserId,
            status: 'matched',
            matched_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (matchError) {
          console.error('创建匹配失败:', matchError)
          return errorResponse('创建匹配失败', 500)
        }
        actualMatchId = newMatch.id
      }
    }

    // 创建新会话
    const { data: conversation, error: createError } = await supabase
      .from('conversations')
      .insert({
        match_id: actualMatchId,
        participant_ids: [userId, targetUserId],
        is_active: true,
      })
      .select()
      .single()

    if (createError) {
      console.error('创建会话失败:', createError)
      return errorResponse('创建会话失败', 500)
    }

    return successResponse({
      conversation: {
        id: conversation.id,
        matchId: conversation.match_id,
        participants: conversation.participant_ids,
        createdAt: conversation.created_at,
      },
      isNew: true,
    })
  } catch (error) {
    console.error('创建会话API错误:', error)
    return errorResponse('服务器错误', 500)
  }
}
