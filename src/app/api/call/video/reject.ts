import { NextRequest, NextResponse } from 'next/server'

// 通话会话存储（与 initiate.ts 共享）
const callSessions = new Map<string, any>()

// POST - 拒绝视频呼叫
export async function POST(request: NextRequest) {
  try {
    const { roomId, userId } = await request.json()

    if (!roomId || !userId) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    const session = callSessions.get(roomId)

    if (!session) {
      return NextResponse.json({ error: '通话不存在' }, { status: 404 })
    }

    // 验证权限
    if (session.calleeId !== userId) {
      return NextResponse.json({ error: '无权限拒绝此通话' }, { status: 403 })
    }

    // 更新状态为已拒绝
    session.status = 'rejected'
    callSessions.set(roomId, session)

    return NextResponse.json({
      success: true,
      roomId,
      status: 'rejected',
      message: '已拒绝视频通话'
    })
  } catch (error) {
    console.error('Reject call error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
