/**
 * 心动投递 - Cloudflare Pages Function
 * 获取消息历史 API
 * 路径: /api/chat/messages?conversationId=xxx
 */

export async function onRequestGet(context) {
  const { request, env } = context
  
  const url = new URL(request.url)
  const conversationId = url.searchParams.get('conversationId')
  const userId = request.headers.get('X-User-Id')
  
  if (!userId) {
    return new Response(JSON.stringify({ error: '未授权，请先登录' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  if (!conversationId) {
    return new Response(JSON.stringify({ error: '缺少会话ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const messages = await getMessages(conversationId, env)
    
    return new Response(JSON.stringify({ messages }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('获取消息失败:', error)
    return new Response(JSON.stringify({ error: '获取消息失败', messages: [] }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

async function getMessages(conversationId, env) {
  if (env.XINDONG_KV) {
    const messages = await env.XINDONG_KV.get(`messages_${conversationId}`, 'json')
    return messages || []
  }
  return []
}
