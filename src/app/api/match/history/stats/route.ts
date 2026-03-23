import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromToken } from '@/lib/jwt'
import { supabaseAdmin } from '@/lib/supabase-server'

// 强制动态渲染，避免静态导出问题

/**
 * GET /api/match/history/stats
 * 获取用户的匹配统计信息
 * 
 * 返回:
 * - totalMatches: 总匹配次数
 * - datedCount: 成功约会次数
 * - successRate: 匹配成功率 (百分比)
 * - avgCompatibility: 平均匹配度
 * - weeklyTrend: 每周趋势数据
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
    
    // 2. 获取基本统计 - 从 match_history 表
    const { data: historyStats, error: historyError } = await supabaseAdmin
      .from('match_history')
      .select('id, outcome, compatibility_score')
      .eq('user_id', userId)
    
    if (historyError) {
      console.error('Error fetching history stats:', historyError)
      return NextResponse.json(
        { success: false, error: '获取统计失败' },
        { status: 500 }
      )
    }
    
    // 3. 计算统计数据
    const totalMatches = historyStats?.length || 0
    const datedCount = historyStats?.filter(r => r.outcome === 'dated').length || 0
    const successRate = totalMatches > 0 ? Math.round((datedCount / totalMatches) * 1000) / 10 : 0
    
    // 计算平均匹配度
    const scores = historyStats?.filter(r => r.compatibility_score !== null).map(r => parseFloat(r.compatibility_score)) || []
    const avgCompatibility = scores.length > 0 
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 
      : 0
    
    // 4. 获取每周趋势数据
    const { data: weeklyData, error: weeklyError } = await supabaseAdmin
      .from('match_history')
      .select('week_number, outcome, compatibility_score, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(50) // 最近50条
    
    if (weeklyError) {
      console.error('Error fetching weekly data:', weeklyError)
    }
    
    // 按周分组统计
    const weeklyMap: Record<string, { matches: number; dated: number; totalScore: number; count: number }> = {}
    
    weeklyData?.forEach(record => {
      const week = record.week_number || 'unknown'
      if (!weeklyMap[week]) {
        weeklyMap[week] = { matches: 0, dated: 0, totalScore: 0, count: 0 }
      }
      weeklyMap[week].matches++
      if (record.outcome === 'dated') {
        weeklyMap[week].dated++
      }
      if (record.compatibility_score) {
        weeklyMap[week].totalScore += parseFloat(record.compatibility_score)
        weeklyMap[week].count++
      }
    })
    
    const weeklyTrend = Object.entries(weeklyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8) // 最近8周
      .map(([week, stats]) => ({
        week,
        matches: stats.matches,
        datedCount: stats.dated,
        successRate: stats.matches > 0 ? Math.round((stats.dated / stats.matches) * 1000) / 10 : 0,
        avgCompatibility: stats.count > 0 ? Math.round((stats.totalScore / stats.count) * 10) / 10 : 0
      }))
    
    // 5. 也从 weekly_matches 表获取补充统计
    const { data: weeklyMatches, error: weeklyMatchesError } = await supabaseAdmin
      .from('weekly_matches')
      .select('id, status, compatibility_score, user1_rating, user2_rating')
      .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
    
    if (!weeklyMatchesError && weeklyMatches && weeklyMatches.length > 0) {
      // 如果 weekly_matches 表有更详细的数据，可以用它覆盖
      const totalWeeklyMatches = weeklyMatches.length
      const acceptedWeekly = weeklyMatches.filter(m => m.status === 'accepted' || m.status === 'dated').length
      
      // 计算平均评分
      const ratings = weeklyMatches
        .filter(m => m.user1_rating || m.user2_rating)
        .flatMap(m => [m.user1_rating, m.user2_rating].filter(Boolean))
        .map(r => parseInt(r as string)) as number[]
      
      const avgRating = ratings.length > 0 
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 
        : null
      
      return NextResponse.json({
        success: true,
        data: {
          totalMatches: Math.max(totalMatches, totalWeeklyMatches),
          datedCount: Math.max(datedCount, acceptedWeekly),
          successRate: totalWeeklyMatches > 0 ? Math.round((acceptedWeekly / totalWeeklyMatches) * 1000) / 10 : successRate,
          avgCompatibility: avgCompatibility,
          avgRating,
          weeklyTrend
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      data: {
        totalMatches,
        datedCount,
        successRate,
        avgCompatibility,
        weeklyTrend
      }
    })
    
  } catch (error) {
    console.error('Error in match stats API:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
