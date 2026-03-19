/**
 * 心动投递 - API 工具函数
 * 
 * 提供认证和通用工具
 */

import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * 从请求中获取当前用户ID
 * 支持两种方式：
 * 1. Authorization header: Bearer {userId}
 * 2. X-User-Id header
 */
export async function getCurrentUser(request: NextRequest): Promise<string | null> {
  // 方式1: 从 Authorization header 获取
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    // 这里可以验证JWT token
    return token
  }

  // 方式2: 从 X-User-Id header 获取（开发环境）
  const userIdHeader = request.headers.get('x-user-id')
  if (userIdHeader) {
    return userIdHeader
  }

  // 方式3: 从 cookie 获取
  const userCookie = request.cookies.get('xindong_current_user')
  if (userCookie) {
    try {
      const user = JSON.parse(userCookie.value)
      return user.id
    } catch {
      return null
    }
  }

  return null
}

/**
 * 标准成功响应
 */
export function successResponse(data: any, status = 200) {
  return Response.json(data, { status })
}

/**
 * 标准错误响应
 */
export function errorResponse(message: string, status = 400) {
  return Response.json({ error: message }, { status })
}

/**
 * 未认证响应
 */
export function unauthorizedResponse() {
  return Response.json({ error: '未授权，请先登录' }, { status: 401 })
}

/**
 * 获取用户资料（包含用户基本信息）
 */
export async function getUserWithProfile(userId: string) {
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (userError) return { user: null, profile: null, error: userError }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  return { 
    user, 
    profile: profileError ? null : profile, 
    error: null 
  }
}

/**
 * 检查两个用户是否有互相喜欢的匹配
 */
export async function checkMutualMatch(userId1: string, userId2Id: string) {
  const { data: match } = await supabase
    .from('matches')
    .select('*')
    .or(`and(user1_id.eq.${userId1},user2_id.eq.${userId2Id}),and(user1_id.eq.${userId2Id},user2_id.eq.${userId1})`)
    .eq('status', 'mutual')
    .single()

  return match
}

/**
 * 获取或创建会话
 */
export async function getOrCreateConversation(matchId: string, participantIds: string[]) {
  // 先查找现有会话
  const { data: existingConversation } = await supabase
    .from('conversations')
    .select('*')
    .eq('match_id', matchId)
    .single()

  if (existingConversation) {
    return existingConversation
  }

  // 创建新会话
  const { data: newConversation, error } = await supabase
    .from('conversations')
    .insert({
      match_id: matchId,
      participant_ids: participantIds,
    })
    .select()
    .single()

  if (error) throw error
  return newConversation
}
