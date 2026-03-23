import { NextRequest, NextResponse } from 'next/server'

// 模拟通话会话存储（生产环境应使用数据库或 Redis）
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

// 生成房间ID
function generateRoomId(): string {
  return `call_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

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
    const { callerId, calleeId } = await request.json()

    if (!callerId || !calleeId) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    // 检查是否已有进行中的通话
    const existingCall = Array.from(callSessions.values()).find(
      session => (session.callerId === callerId && session.calleeId === calleeId) ||
                 (session.callerId === calleeId && session.calleeId === callerId)
    )

    if (existingCall && existingCall.status === 'pending') {
      return NextResponse.json({ error: '已有进行中的呼叫' }, { status: 409 })
    }

    // 创建新的通话会话
    const roomId = generateRoomId()
    const session = {
      callerId,
      calleeId,
      status: 'pending' as const,
      createdAt: Date.now(),
      roomId
    }

    callSessions.set(roomId, session)

    // 获取被呼叫用户信息
    const callee = await getUser(calleeId)

    return NextResponse.json({
      success: true,
      roomId,
      callee: {
        id: callee?.id,
        nickname: callee?.nickname || '未知用户',
        avatar: callee?.avatar
      },
      message: '呼叫已发起'
    })
  } catch (error) {
    console.error('Initiate call error:', error)
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
