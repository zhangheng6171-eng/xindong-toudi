import { NextRequest, NextResponse } from 'next/server'

// 通话会话存储（与 initiate.ts 共享）
const callSessions = new Map<string, any>()

// GET - 获取通话状态
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const roomId = searchParams.get('roomId')

  if (!roomId) {
    return NextResponse.json({ error: '缺少房间ID' }, { status: 400 })
  }

  const session = callSessions.get(roomId)

  if (!session) {
    return NextResponse.json({ error: '通话不存在' }, { status: 404 })
  }

  return NextResponse.json({
    roomId,
    status: session.status,
    callType: session.callType,
    callerId: session.callerId,
    calleeId: session.calleeId,
    createdAt: session.createdAt,
    sdp: session.sdp ? true : false, // 不直接返回 SDP，由 webrtc API 处理
    hasIceCandidates: session.iceCandidates ? session.iceCandidates.length > 0 : false
  })
}
