import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getUserIdFromToken } from '@/lib/jwt'
import { supabaseAdmin } from '@/lib/supabase-server'

// API路由配置
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/feedback/[matchId]
 * 获取特定匹配的反馈详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
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
    
    // 2. 获取 matchId 参数
    const { matchId } = await params
    
    if (!matchId) {
      return NextResponse.json(
        { success: false, error: '缺少匹配ID' },
        { status: 400 }
      )
    }
    
    // 3. 验证匹配是否存在且属于该用户
    const { data: match, error: matchError } = await supabaseAdmin
      .from('weekly_matches')
      .select('id, user_id, matched_user_id, total_score, match_reasons, created_at')
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
        { success: false, error: '无权查看此匹配的反馈' },
        { status: 403 }
      )
    }
    
    // 4. 获取反馈详情
    const { data: feedback, error: feedbackError } = await supabaseAdmin
      .from('date_feedback')
      .select('*')
      .eq('match_id', matchId)
      .eq('user_id', userId)
      .single()
    
    if (feedbackError) {
      if (feedbackError.code === 'PGRST116') { // no rows returned
        return NextResponse.json(
          { success: false, error: '该匹配尚未提交反馈' },
          { status: 404 }
        )
      }
      console.error('Error fetching feedback:', feedbackError)
      return NextResponse.json(
        { success: false, error: '获取反馈详情失败' },
        { status: 500 }
      )
    }
    
    // 5. 获取匹配的用户信息
    const { data: matchedUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, nickname, avatar, avatar_url, age, city')
      .eq('id', match.matched_user_id)
      .single()
    
    // 6. 格式化返回数据
    const formattedFeedback = {
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
      match: {
        id: match.id,
        matchedUser: matchedUser ? {
          id: matchedUser.id,
          nickname: matchedUser.nickname,
          avatarUrl: matchedUser.avatar || matchedUser.avatar_url,
          age: matchedUser.age,
          city: matchedUser.city
        } : null,
        compatibilityScore: match.total_score ? parseFloat(match.total_score) : null,
        matchReasons: match.match_reasons || [],
        matchedAt: match.created_at
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        feedback: formattedFeedback
      }
    })
    
  } catch (error) {
    console.error('Error in feedback detail API:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
