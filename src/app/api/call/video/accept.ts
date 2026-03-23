import { NextRequest, NextResponse } from 'next/server'

// 共享的通话会话存储（与 initiate.ts 共享）
// 在生产环境中应该使用数据库或 Redis
const callSessions = new Map<string, {
  callerId: string
  calleeId: string
  callType: 'video' | 'voice'
  status: 'pending' | 'accepted' | 'rejected' | 'ended'
  createdAt: number
  roomId: string
  sdp?: RTCSessionDescriptionInit
  iceCandidates?: RTCIceCandidateInit[]
}>()

// POST - 接受视频呼叫
export async function POST(request: NextRequest) {
  try {
    const { roomId, userId } = await request.json()

    if (!roomId || !userId) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    const session = callSessions.get(roomId)

    if (!session) {
      return NextResponse.json({ error: '通话不存在或已结束' }, { status: 404 })
    }

    // 验证用户是否是通话的接收方
    if (session.calleeId !== userId) {
      return NextResponse.json({ error: '无权限接听此通话' }, { status: 403 })
    }

    if (session.status !== 'pending') {
      return NextResponse.json({ error: '通话状态已改变' }, { status: 409 })
    }

    // 更新通话状态为已接受
    session.status = 'accepted'
    callSessions.set(roomId, session)

    return NextResponse.json({
      success: true,
      roomId,
      status: 'accepted',
      message: '已接受视频通话'
    })
  } catch (error) {
    console.error('Accept call error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
