import { NextRequest, NextResponse } from 'next/server'

// 简单的信令消息存储（生产环境应使用 WebSocket）
interface SignalMessage {
  roomId: string
  senderId: string
  type: 'offer' | 'answer' | 'ice-candidate'
  payload: any
  timestamp: number
}

// 信令消息队列
const signalQueues = new Map<string, SignalMessage[]>()

// 清理过期消息（超过30秒）
function cleanupOldMessages(roomId: string) {
  const now = Date.now()
  const messages = signalQueues.get(roomId) || []
  const valid = messages.filter(m => now - m.timestamp < 30000)
  signalQueues.set(roomId, valid)
}

export async function POST(request: NextRequest) {
  try {
    const { roomId, senderId, type, payload } = await request.json()

    if (!roomId || !senderId || !type || !payload) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    // 存储信令消息
    const message: SignalMessage = {
      roomId,
      senderId,
      type,
      payload,
      timestamp: Date.now()
    }

    const messages = signalQueues.get(roomId) || []
    messages.push(message)
    signalQueues.set(roomId, messages)

    // 限制队列长度
    if (messages.length > 100) {
      messages.shift()
    }

    return NextResponse.json({
      success: true,
      message: '信令已接收'
    })
  } catch (error) {
    console.error('Signal error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// 获取信令消息（轮询）
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const roomId = searchParams.get('roomId')
  const lastTimestamp = parseInt(searchParams.get('lastTimestamp') || '0')

  if (!roomId) {
    return NextResponse.json({ error: '缺少房间ID' }, { status: 400 })
  }

  // 清理旧消息
  cleanupOldMessages(roomId)

  const messages = signalQueues.get(roomId) || []
  
  // 返回新的消息
  const newMessages = messages.filter(m => m.timestamp > lastTimestamp)

  return NextResponse.json({
    roomId,
    messages: newMessages,
    timestamp: Date.now()
  })
}
