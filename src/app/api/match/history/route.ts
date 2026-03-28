import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromToken } from '@/lib/jwt'
import { supabaseAdmin } from '@/lib/supabase-server'
import { withSecurityHeaders, withRateLimit } from '@/lib/security'

// 强制动态渲染，避免静态导出问题

/**
 * 添加安全头和速率限制
 */
function applySecurity(request: NextRequest): NextResponse | null {
  // 安全头
  withSecurityHeaders(request)
  
  // Rate limiting
  const rateLimitResponse = withRateLimit(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }
  
  return null
}

/**
 * GET /api/match/history
 * 获取用户的匹配历史列表
 * 
 * Query params:
 * - page: 页码 (默认 1)
 * - pageSize: 每页数量 (默认 10)
 * - outcome: 筛选结果 (可选: viewed, contacted, dated, relationship, no_contact)
 */
export async function GET(request: NextRequest) {
  try {
    // 0. 应用安全措施
    const securityResponse = applySecurity(request)
    if (securityResponse) {
      return securityResponse
    }
    
    // 1. 验证用户身份
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || ''
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }
    
    const userId = getUserIdFromToken(token)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '无效的令牌' },
        { status: 401 }
      )
    }
    
    // 2. 解析查询参数
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const outcome = searchParams.get('outcome') || null
    
    // 验证分页参数
    if (isNaN(page) || page < 1 || page > 1000) {
      return NextResponse.json(
        { success: false, error: '无效的页码' },
        { status: 400 }
      )
    }
    
    if (isNaN(pageSize) || pageSize < 1 || pageSize > 100) {
      return NextResponse.json(
        { success: false, error: '无效的每页数量' },
        { status: 400 }
      )
    }
    
    // 验证 outcome 参数（如果提供）
    const validOutcomes = ['viewed', 'contacted', 'dated', 'relationship', 'no_contact', null]
    if (outcome && !validOutcomes.includes(outcome)) {
      return NextResponse.json(
        { success: false, error: '无效的筛选条件' },
        { status: 400 }
      )
    }
    
    const offset = (page - 1) * pageSize
    
    // 3. 查询匹配历史
    let query = supabaseAdmin
      .from('match_history')
      .select(`
        id,
        week_number,
        compatibility_score,
        match_reasons,
        outcome,
        created_at,
        matched_user_id
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)
    
    // 如果有 outcome 筛选条件
    if (outcome) {
      query = query.eq('outcome', outcome)
    }
    
    const { data: historyRecords, error: historyError } = await query
    
    if (historyError) {
      console.error('Error fetching match history:', historyError)
      return NextResponse.json(
        { success: false, error: '获取匹配历史失败' },
        { status: 500 }
      )
    }
    
    // 4. 获取总数
    let countQuery = supabaseAdmin
      .from('match_history')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
    
    if (outcome) {
      countQuery = countQuery.eq('outcome', outcome)
    }
    
    const { count, error: countError } = await countQuery
    
    if (countError) {
      console.error('Error counting match history:', countError)
    }
    
    // 5. 获取关联的用户信息
    const matchedUserIds = historyRecords?.map(r => r.matched_user_id).filter(Boolean) || []
    
    let matchedUsersMap: Record<string, any> = {}
    
    if (matchedUserIds.length > 0) {
      const { data: matchedUsers, error: usersError } = await supabaseAdmin
        .from('users')
        .select('id, nickname, avatar, avatar_url, age, city')
        .in('id', matchedUserIds)
      
      if (!usersError && matchedUsers) {
        matchedUsersMap = matchedUsers.reduce((acc, user) => {
          acc[user.id] = {
            nickname: user.nickname,
            avatarUrl: user.avatar || user.avatar_url,
            age: user.age,
            city: user.city
          }
          return acc
        }, {} as Record<string, any>)
      }
    }
    
    // 6. 格式化返回数据
    const history = historyRecords?.map(record => ({
      id: record.id,
      matchedUser: matchedUsersMap[record.matched_user_id] || null,
      weekNumber: record.week_number,
      compatibilityScore: record.compatibility_score ? parseFloat(record.compatibility_score) : null,
      matchReasons: record.match_reasons || [],
      outcome: record.outcome,
      createdAt: record.created_at
    })) || []
    
    return NextResponse.json({
      success: true,
      data: {
        history
      },
      meta: {
        page,
        pageSize,
        total: count || 0
      }
    })
    
  } catch (error) {
    console.error('Error in match history API:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
