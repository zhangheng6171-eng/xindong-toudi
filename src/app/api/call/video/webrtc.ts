import { NextRequest, NextResponse } from 'next/server'

// 通话会话存储（与 initiate.ts 共享）
const callSessions = new Map<string, any>()

// WebRTC 信令处理
// 这个 API 用于在通话双方之间交换 SDP 和 ICE candidates

// POST - 发送 WebRTC 信令
export async function POST(request: NextRequest) {
  try {
    const { roomId, type, sdp, candidate, userId } = await request.json()

    if (!roomId) {
      return NextResponse.json({ error: '缺少房间ID' }, { status: 400 })
    }

    const session = callSessions.get(roomId)

    if (!session) {
      return NextResponse.json({ error: '通话不存在' }, { status: 404 })
    }

    if (session.status !== 'accepted' && session.status !== 'pending') {
      return NextResponse.json({ error: '通话状态不正确' }, { status: 409 })
    }

    switch (type) {
      case 'offer':
        // 收到呼叫方的 Offer
        if (!sdp) {
          return NextResponse.json({ error: '缺少 SDP' }, { status: 400 })
        }
        session.sdp = sdp
        callSessions.set(roomId, session)
        
        // TODO: 通过 WebSocket 或轮询通知接收方
        return NextResponse.json({
          success: true,
          message: 'Offer 已接收'
        })

      case 'answer':
        // 收到接收方的 Answer
        if (!sdp) {
          return NextResponse.json({ error: '缺少 SDP' }, { status: 400 })
        }
        session.sdp = sdp
        callSessions.set(roomId, session)
        
        return NextResponse.json({
          success: true,
          message: 'Answer 已接收'
        })

      case 'ice-candidate':
        // 收到 ICE candidate
        if (!candidate) {
          return NextResponse.json({ error: '缺少 ICE candidate' }, { status: 400 })
        }
        
        if (!session.iceCandidates) {
          session.iceCandidates = []
        }
        session.iceCandidates.push(candidate)
        callSessions.set(roomId, session)
        
        return NextResponse.json({
          success: true,
          message: 'ICE candidate 已接收'
        })

      default:
        return NextResponse.json({ error: '未知的信令类型' }, { status: 400 })
    }
  } catch (error) {
    console.error('WebRTC signaling error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// GET - 获取 WebRTC 信令
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const roomId = searchParams.get('roomId')
  const userId = searchParams.get('userId')

  if (!roomId) {
    return NextResponse.json({ error: '缺少房间ID' }, { status: 400 })
  }

  const session = callSessions.get(roomId)

  if (!session) {
    return NextResponse.json({ error: '通话不存在' }, { status: 404 })
  }

  // 返回需要的信息
  const response: any = {
    roomId,
    status: session.status,
    callType: session.callType
  }

  // 根据请求者返回不同的信令
  // 如果是呼叫方，返回接收方的 SDP（如果有）
  // 如果是接收方，返回呼叫方的 SDP
  const isCaller = session.callerId === userId
  
  if (session.sdp) {
    response.sdp = session.sdp
  }
  
  if (session.iceCandidates) {
    response.iceCandidates = session.iceCandidates
  }

  return NextResponse.json(response)
}
