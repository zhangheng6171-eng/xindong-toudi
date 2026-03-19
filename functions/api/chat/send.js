/**
 * 发送消息 API - 本地存储版本
 * 由于 KV 权限限制，使用本地存储 + BroadcastChannel 实现跨标签页同步
 */

export async function onRequestPost(context) {
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
    
    // 生成消息ID
    const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // 创建消息对象
    const message = {
      id: messageId,
      senderId,
      receiverId,
      text,
      type,
      timestamp: new Date().toISOString(),
      status: 'sent'
    }
    
    // 返回成功响应
    // 实际存储由前端处理（localStorage）
    return new Response(JSON.stringify({ 
      success: true, 
      message,
      note: 'Message stored locally'
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
    
  } catch (error) {
    console.error('Send message error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}
