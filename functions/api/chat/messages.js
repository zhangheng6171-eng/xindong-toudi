/**
 * 获取消息 API
 * 使用 Cloudflare KV 存储消息，实现跨浏览器同步
 */

export async function onRequestGet(context) {
  const { request, env } = context
  
  try {
    // 从 URL 参数获取用户ID
    const url = new URL(request.url)
    const userId1 = url.searchParams.get('userId1')
    const userId2 = url.searchParams.get('userId2')
    
    if (!userId1 || !userId2) {
      return new Response(JSON.stringify({ error: 'Missing user IDs' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // 使用排序后的用户ID作为key
    const chatKey = `chat_${[userId1, userId2].sort().join('_')}`
    
    // 从 KV 获取消息
    let messages = []
    if (env.XINDONG_KV) {
      const existing = await env.XINDONG_KV.get(chatKey, { type: 'json' })
      if (existing) {
        messages = existing
      }
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      messages,
      count: messages.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('Get messages error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
