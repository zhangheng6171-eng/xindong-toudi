/**
 * 心动投递 - Cloudflare Pages Function
 * 聊天会话列表 API
 */

export async function onRequestGet(context) {
  const { request, env } = context
  
  // 获取用户ID
  const userId = request.headers.get('X-User-Id') || 
                 new URL(request.url).searchParams.get('userId')
  
  if (!userId) {
    return new Response(JSON.stringify({ error: '未授权，请先登录' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    // 从 KV 或 D1 获取会话列表
    // 这里使用模拟数据，实际部署时需要配置 D1 数据库
    const conversations = await getConversations(userId, env)
    
    return new Response(JSON.stringify({ conversations }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('获取会话失败:', error)
    return new Response(JSON.stringify({ error: '获取会话列表失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// 获取会话列表（支持KV存储）
async function getConversations(userId, env) {
  // 如果有KV绑定，从KV获取
  if (env.XINDONG_KV) {
    const data = await env.XINDONG_KV.get(`conversations_${userId}`, 'json')
    return data || []
  }
  
  // 否则返回空数组，前端会使用localStorage
  return []
}
