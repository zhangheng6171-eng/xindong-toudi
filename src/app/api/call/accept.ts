import { NextRequest, NextResponse } from 'next/server'

// 通话会话存储（与 initiate.ts 共享）
const callSessions = new Map<string, {
  callerId: string
  calleeId: string
  status: 'pending' | 'accepted' | 'rejected' | 'ended'
  createdAt: number
  roomId?: string
}>()

// Supabase 配置
const SUPABASE_URL = 'https://ntaqnyegiiwtzdyqjiwy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50YXFueWVnaWl3dHpkeXFqaXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTY4NzUsImV4cCI6MjA4OTQ5Mjg3NX0.4FEAb1Yd4xOwXz3LcfZ9iPG0ZZPbFd8dfry903c5lPc'

// 获取用户信息
async function getUser(userId: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=id,nickname,avatar`, {
    headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
  })
  const data = await res.json()
  return Array.isArray(data) && data[0] ? data[0] : null
}

export async function POST(request: NextRequest) {
  try {
    const { roomId, userId, action } = await request.json()

    if (!roomId || !userId) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    const session = callSessions.get(roomId)

    if (!session) {
      return NextResponse.json({ error: '通话不存在' }, { status: 404 })
    }

    // 验证用户是否是通话的参与者
    if (userId !== session.callerId && userId !== session.calleeId) {
      return NextResponse.json({ error: '无权操作此通话' }, { status: 403 })
    }

    if (action === 'accept') {
      // 接受呼叫
      session.status = 'accepted'
      callSessions.set(roomId, session)

      const caller = await getUser(session.callerId)

      return NextResponse.json({
        success: true,
        roomId,
        status: 'accepted',
        caller: {
          id: caller?.id,
          nickname: caller?.nickname || '未知用户',
          avatar: caller?.avatar
        },
        message: '呼叫已接受'
      })
    } else if (action === 'reject') {
      // 拒绝呼叫
      session.status = 'rejected'
      callSessions.set(roomId, session)

      return NextResponse.json({
        success: true,
        roomId,
        status: 'rejected',
        message: '呼叫已拒绝'
      })
    } else if (action === 'end') {
      // 结束通话
      session.status = 'ended'
      callSessions.set(roomId, session)

      return NextResponse.json({
        success: true,
        roomId,
        status: 'ended',
        message: '通话已结束'
      })
    } else {
      return NextResponse.json({ error: '无效操作' }, { status: 400 })
    }
  } catch (error) {
    console.error('Accept call error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// 获取通话状态
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
    callerId: session.callerId,
    calleeId: session.calleeId
  })
}
