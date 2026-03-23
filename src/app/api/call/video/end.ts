import { NextRequest, NextResponse } from 'next/server'

// 通话会话存储（与 initiate.ts 共享）
const callSessions = new Map<string, any>()

// POST - 结束通话
export async function POST(request: NextRequest) {
  try {
    const { roomId, userId } = await request.json()

    if (!roomId) {
      return NextResponse.json({ error: '缺少房间ID' }, { status: 400 })
    }

    const session = callSessions.get(roomId)

    if (!session) {
      return NextResponse.json({ error: '通话不存在' }, { status: 404 })
    }

    // 验证权限（通话双方都可以结束）
    if (userId && session.callerId !== userId && session.calleeId !== userId) {
      return NextResponse.json({ error: '无权限结束此通话' }, { status: 403 })
    }

    // 更新状态为已结束
    session.status = 'ended'
    callSessions.set(roomId, session)

    return NextResponse.json({
      success: true,
      roomId,
      status: 'ended',
      message: '通话已结束'
    })
  } catch (error) {
    console.error('End call error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
