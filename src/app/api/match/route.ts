import { NextRequest, NextResponse } from 'next/server'
import { generateWeeklyMatches, User, MatchResult } from '@/lib/matching-algorithm'

// 模拟数据库
// 实际应用中应该连接真实的数据库
const mockUsers: User[] = []

/**
 * GET /api/match/weekly
 * 获取本周匹配结果
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      )
    }

    // 从数据库获取用户信息和匹配结果
    // 这里使用模拟数据
    const matches: MatchResult[] = [
      {
        userId: userId,
        matchedUserId: 'user_001',
        compatibilityScore: 92.5,
        matchReasons: [
          '你们都重视家庭和真诚',
          '喜欢安静的周末，热爱旅行',
          '价值观高度契合',
          '都是猫奴🐱',
        ],
        sharedValues: ['家庭', '真诚', '成长'],
        sharedInterests: ['旅行', '摄影', '猫'],
        details: {
          valuesScore: 95,
          relationshipScore: 88,
          futureScore: 90,
          lifestyleScore: 85,
          personalityScore: 80,
          interestsScore: 75,
          familyScore: 92,
          politicalScore: 60,
          dealbreakerScore: 100,
        }
      },
      {
        userId: userId,
        matchedUserId: 'user_002',
        compatibilityScore: 85.2,
        matchReasons: [
          '你们都喜欢户外运动',
          '重视工作和生活的平衡',
          '性格互补，可能产生化学反应',
        ],
        sharedValues: ['健康', '自由'],
        sharedInterests: ['运动', '旅行', '美食'],
        details: {
          valuesScore: 82,
          relationshipScore: 85,
          futureScore: 80,
          lifestyleScore: 90,
          personalityScore: 88,
          interestsScore: 85,
          familyScore: 75,
          politicalScore: 70,
          dealbreakerScore: 100,
        }
      },
      {
        userId: userId,
        matchedUserId: 'user_003',
        compatibilityScore: 78.6,
        matchReasons: [
          '你们都热爱艺术和创意',
          '喜欢探索新事物',
          '对未来有相似的规划',
        ],
        sharedValues: ['创造力', '成长'],
        sharedInterests: ['艺术', '音乐', '咖啡'],
        details: {
          valuesScore: 75,
          relationshipScore: 80,
          futureScore: 85,
          lifestyleScore: 78,
          personalityScore: 82,
          interestsScore: 90,
          familyScore: 70,
          politicalScore: 65,
          dealbreakerScore: 100,
        }
      }
    ]

    return NextResponse.json({
      success: true,
      data: {
        week: '2024-W12',
        matches,
        nextMatchDate: '2024-03-25T20:00:00Z',
      }
    })
  } catch (error) {
    console.error('获取匹配失败:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/match/feedback
 * 提交约会反馈
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { matchId, rating, wouldMeetAgain, feedback } = body

    if (!matchId || rating === undefined) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 验证评分范围
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: '评分必须在1-5之间' },
        { status: 400 }
      )
    }

    // 保存反馈到数据库
    // 实际应用中这里会写入数据库
    
    return NextResponse.json({
      success: true,
      message: '反馈已提交，我们会用它来优化未来的匹配'
    })
  } catch (error) {
    console.error('提交反馈失败:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
