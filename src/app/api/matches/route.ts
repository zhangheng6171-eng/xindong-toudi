/**
 * 心动投递 - 匹配列表 API
 * 
 * GET: 获取当前用户的匹配列表
 * POST: 创建新匹配（仅用于测试/管理）
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

    // 获取查询参数
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || undefined
    const week = searchParams.get('week') ? parseInt(searchParams.get('week')!) : undefined

    // 构建查询
    let query = supabase
      .from('matches')
      .select(`
        *,
        user1:users!user1_id(id, nickname, avatar, age, city, gender),
        user2:users!user2_id(id, nickname, avatar, age, city, gender),
        conversation:conversations(id)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (week) {
      query = query.eq('week_number', week)
    }

    const { data: matches, error: matchesError } = await query

    if (matchesError) {
      console.error('获取匹配失败:', matchesError)
      return errorResponse('获取匹配列表失败', 500)
    }

    // 检查用户是否喜欢了对方
    const { data: likes } = await supabase
      .from('user_likes')
      .select('target_user_id, match_id')
      .eq('user_id', userId)

    const likedMap = new Map<string, boolean>()
    likes?.forEach((like: any) => {
      likedMap.set(`${like.match_id}-${like.target_user_id}`, true)
    })

    // 格式化响应
    const formattedMatches = matches?.map((match: any) => {
      const isUser1 = match.user1_id === userId
      const otherUser = isUser1 ? match.user2 : match.user1
      const liked = likedMap.get(`${match.id}-${otherUser.id}`) || false

      return {
        id: match.id,
        otherUser: {
          id: otherUser.id,
          nickname: otherUser.nickname,
          avatar: otherUser.avatar,
          age: otherUser.age,
          city: otherUser.city,
          gender: otherUser.gender,
        },
        score: match.score,
        status: match.status,
        liked,
        hasConversation: !!match.conversation,
        matchReasons: match.match_reasons || [],
        sharedValues: match.shared_values || [],
        sharedInterests: match.shared_interests || [],
        weekNumber: match.week_number,
        createdAt: match.created_at,
      }
    }) || []

    return successResponse({ matches: formattedMatches })
  } catch (error) {
    console.error('匹配列表API错误:', error)
    return errorResponse('服务器错误', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    // 获取当前用户（需要管理员权限）
    const userId = await getCurrentUser(request)
    if (!userId) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const { user1Id, user2Id, score, matchReasons, sharedValues, sharedInterests, weekNumber } = body

    // 创建匹配
    const { data: match, error } = await supabase
      .from('matches')
      .insert({
        user1_id: user1Id,
        user2_id: user2Id,
        score,
        match_reasons: matchReasons || [],
        shared_values: sharedValues || [],
        shared_interests: sharedInterests || [],
        week_number: weekNumber,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('创建匹配失败:', error)
      return errorResponse('创建匹配失败', 500)
    }

    return successResponse({ match })
  } catch (error) {
    console.error('创建匹配API错误:', error)
    return errorResponse('服务器错误', 500)
  }
}
