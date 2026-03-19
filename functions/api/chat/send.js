/**
 * 心动投递 - Cloudflare Pages Function
 * 发送消息 API
 */

export async function onRequestPost(context) {
  const { request, env } = context
  
  // 获取用户ID
  const userId = request.headers.get('X-User-Id')
  
  if (!userId) {
    return new Response(JSON.stringify({ error: '未授权，请先登录' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const body = await request.json()
    const { conversationId, content, type = 'text' } = body

    if (!conversationId || !content) {
      return new Response(JSON.stringify({ error: '缺少必要参数' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 创建消息
    const message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      senderId: userId,
      content: content.trim(),
      type,
      status: 'sent',
      createdAt: new Date().toISOString()
    }

    // 存储消息
    if (env.XINDONG_KV) {
      // 获取现有消息
      const messagesKey = `messages_${conversationId}`
      const existingMessages = await env.XINDONG_KV.get(messagesKey, 'json') || []
      existingMessages.push(message)
      await env.XINDONG_KV.put(messagesKey, JSON.stringify(existingMessages))
    }

    return new Response(JSON.stringify({ message }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('发送消息失败:', error)
    return new Response(JSON.stringify({ error: '发送消息失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
