import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getUserIdFromToken } from '@/lib/jwt'
import { supabaseAdmin } from '@/lib/supabase-server'

// API路由配置
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/feedback
 * 获取当前用户的所有反馈列表
 */
export async function GET(request: NextRequest) {
  try {
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
    
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      return NextResponse.json(
        { success: false, error: '无效的分页参数' },
        { status: 400 }
      )
    }
    
    const offset = (page - 1) * pageSize
    
    // 3. 查询用户的反馈列表
    const { data: feedbacks, error: feedbackError } = await supabaseAdmin
      .from('date_feedback')
      .select(`
        *,
        match:weekly_matches!inner(
          id,
          matched_user_id,
          total_score,
          match_reasons,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)
    
    if (feedbackError) {
      console.error('Error fetching feedbacks:', feedbackError)
      return NextResponse.json(
        { success: false, error: '获取反馈列表失败' },
        { status: 500 }
      )
    }
    
    // 4. 获取总数
    const { count, error: countError } = await supabaseAdmin
      .from('date_feedback')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
    
    if (countError) {
      console.error('Error counting feedbacks:', countError)
    }
    
    // 5. 获取关联的用户信息
    const matchedUserIds = feedbacks?.map(f => f.match?.matched_user_id).filter(Boolean) || []
    
    let matchedUsersMap: Record<string, any> = {}
    
    if (matchedUserIds.length > 0) {
      const { data: matchedUsers, error: usersError } = await supabaseAdmin
        .from('users')
        .select('id, nickname, avatar, avatar_url, age, city')
        .in('id', matchedUserIds)
      
      if (!usersError && matchedUsers) {
        matchedUsersMap = matchedUsers.reduce((acc, user) => {
          acc[user.id] = {
            id: user.id,
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
    const formattedFeedbacks = feedbacks?.map(feedback => ({
      id: feedback.id,
      matchId: feedback.match_id,
      overallRating: feedback.overall_rating,
      wouldMeetAgain: feedback.would_meet_again,
      whatWentWell: feedback.what_went_well,
      whatCouldImprove: feedback.what_could_improve,
      personalityMatchRating: feedback.personality_match_rating,
      valuesMatchRating: feedback.values_match_rating,
      interestsMatchRating: feedback.interests_match_rating,
      wantToContinue: feedback.want_to_continue,
      createdAt: feedback.created_at,
      match: feedback.match ? {
        id: feedback.match.id,
        matchedUser: matchedUsersMap[feedback.match.matched_user_id] || null,
        compatibilityScore: feedback.match.total_score ? parseFloat(feedback.match.total_score) : null,
        matchReasons: feedback.match.match_reasons || [],
        matchedAt: feedback.match.created_at
      } : null
    })) || []
    
    return NextResponse.json({
      success: true,
      data: {
        feedbacks: formattedFeedbacks
      },
      meta: {
        page,
        pageSize,
        total: count || 0
      }
    })
    
  } catch (error) {
    console.error('Error in feedback list API:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/feedback
 * 提交新反馈
 * 
 * Request body:
 * {
 *   matchId: string,
 *   overallRating: number (1-5),
 *   wouldMeetAgain: boolean,
 *   whatWentWell: string (optional),
 *   whatCouldImprove: string (optional),
 *   personalityMatchRating: number (1-5, optional),
 *   valuesMatchRating: number (1-5, optional),
 *   interestsMatchRating: number (1-5, optional),
 *   wantToContinue: boolean
 * }
 */
export async function POST(request: NextRequest) {
  try {
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
    
    // 2. 解析请求体
    const body = await request.json()
    const {
      matchId,
      overallRating,
      wouldMeetAgain,
      whatWentWell,
      whatCouldImprove,
      personalityMatchRating,
      valuesMatchRating,
      interestsMatchRating,
      wantToContinue
    } = body
    
    // 3. 验证必填字段
    if (!matchId) {
      return NextResponse.json(
        { success: false, error: '缺少匹配ID' },
        { status: 400 }
      )
    }
    
    if (overallRating === undefined || overallRating === null) {
      return NextResponse.json(
        { success: false, error: '缺少总体评分' },
        { status: 400 }
      )
    }
    
    if (overallRating < 1 || overallRating > 5) {
      return NextResponse.json(
        { success: false, error: '总体评分必须在1-5之间' },
        { status: 400 }
      )
    }
    
    if (wantToContinue === undefined || wantToContinue === null) {
      return NextResponse.json(
        { success: false, error: '缺少是否继续选项' },
        { status: 400 }
      )
    }
    
    // 4. 验证匹配是否存在且属于该用户
    const { data: match, error: matchError } = await supabaseAdmin
      .from('weekly_matches')
      .select('id, user_id, matched_user_id, status')
      .eq('id', matchId)
      .single()
    
    if (matchError || !match) {
      console.error('Error fetching match:', matchError)
      return NextResponse.json(
        { success: false, error: '匹配记录不存在' },
        { status: 404 }
      )
    }
    
    // 验证匹配是否属于当前用户
    if (match.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: '无权对此匹配提交反馈' },
        { status: 403 }
      )
    }
    
    // 5. 检查是否已存在反馈（防止重复提交）
    const { data: existingFeedback, error: checkError } = await supabaseAdmin
      .from('date_feedback')
      .select('id')
      .eq('match_id', matchId)
      .eq('user_id', userId)
      .single()
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking existing feedback:', checkError)
    }
    
    if (existingFeedback) {
      return NextResponse.json(
        { success: false, error: '已对此匹配提交过反馈' },
        { status: 409 }
      )
    }
    
    // 6. 插入反馈记录
    const { data: feedback, error: insertError } = await supabaseAdmin
      .from('date_feedback')
      .insert({
        match_id: matchId,
        user_id: userId,
        overall_rating: overallRating,
        would_meet_again: wouldMeetAgain || null,
        what_went_well: whatWentWell || null,
        what_could_improve: whatCouldImprove || null,
        personality_match_rating: personalityMatchRating || null,
        values_match_rating: valuesMatchRating || null,
        interests_match_rating: interestsMatchRating || null,
        want_to_continue: wantToContinue
      })
      .select()
      .single()
    
    if (insertError) {
      console.error('Error inserting feedback:', insertError)
      return NextResponse.json(
        { success: false, error: '提交反馈失败' },
        { status: 500 }
      )
    }
    
    // 7. 更新匹配的 status 为 'completed'
    const { error: updateError } = await supabaseAdmin
      .from('weekly_matches')
      .update({ status: 'completed' })
      .eq('id', matchId)
    
    if (updateError) {
      console.error('Error updating match status:', updateError)
      // 反馈已成功提交，状态更新失败不影响返回
    }
    
    // 8. 返回成功响应
    return NextResponse.json({
      success: true,
      data: {
        feedback: {
          id: feedback.id,
          matchId: feedback.match_id,
          overallRating: feedback.overall_rating,
          wouldMeetAgain: feedback.would_meet_again,
          whatWentWell: feedback.what_went_well,
          whatCouldImprove: feedback.what_could_improve,
          personalityMatchRating: feedback.personality_match_rating,
          valuesMatchRating: feedback.values_match_rating,
          interestsMatchRating: feedback.interests_match_rating,
          wantToContinue: feedback.want_to_continue,
          createdAt: feedback.created_at
        }
      },
      message: '反馈提交成功'
    })
    
  } catch (error) {
    console.error('Error in submit feedback API:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
