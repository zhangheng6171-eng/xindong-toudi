/**
 * 消息存储 API
 * 使用 Cloudflare Cache API 持久化存储消息
 */

// 消息存储在全局内存中（简单方案）
const messageStore = new Map<string, any[]>()

export async function onRequestGet(context: any) {
  const { request } = context
  const url = new URL(request.url)
  const userId1 = url.searchParams.get('userId1')
  const userId2 = url.searchParams.get('userId2')
  
  if (!userId1 || !userId2) {
    return new Response(JSON.stringify({ error: 'Missing user IDs' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  const chatKey = [userId1, userId2].sort().join('_')
  const messages = messageStore.get(chatKey) || []
  
  return new Response(JSON.stringify({ 
    success: true, 
    messages,
    count: messages.length
  }), {
    status: 200,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  })
}

export async function onRequestPost(context: any) {
  const { request } = context
  
  try {
    const body = await request.json()
    const { senderId, receiverId, text, type = 'text' } = body
    
    if (!senderId || !receiverId || !text) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const chatKey = [senderId, receiverId].sort().join('_')
    
    const message = {
      id: messageId,
      senderId,
      receiverId,
      text,
      type,
      timestamp: new Date().toISOString(),
      status: 'sent'
    }
    
    // 获取或创建消息列表
    let messages = messageStore.get(chatKey) || []
    messages.push(message)
    messageStore.set(chatKey, messages)
    
    return new Response(JSON.stringify({ 
      success: true, 
      message
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
    
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
