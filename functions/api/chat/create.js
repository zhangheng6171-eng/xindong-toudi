/**
 * 心动投递 - Cloudflare Pages Function
 * 创建/获取会话 API
 */

export async function onRequestPost(context) {
  const { request, env } = context
  
  const userId = request.headers.get('X-User-Id')
  
  if (!userId) {
    return new Response(JSON.stringify({ error: '未授权，请先登录' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const body = await request.json()
    const { targetUserId, matchId } = body

    if (!targetUserId) {
      return new Response(JSON.stringify({ error: '缺少目标用户ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 生成会话ID
    const participantIds = [userId, targetUserId].sort()
    const conversationId = `conv_${participantIds.join('_')}`

    // 检查会话是否已存在
    if (env.XINDONG_KV) {
      const existingConv = await env.XINDONG_KV.get(`conversation_${conversationId}`, 'json')
      if (existingConv) {
        return new Response(JSON.stringify({ 
          conversation: existingConv, 
          isNew: false 
        }), {
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }

    // 创建新会话
    const conversation = {
      id: conversationId,
      matchId: matchId || null,
      participantIds,
      createdAt: new Date().toISOString(),
      lastMessage: null,
      lastMessageAt: null
    }

    // 存储会话
    if (env.XINDONG_KV) {
      await env.XINDONG_KV.put(`conversation_${conversationId}`, JSON.stringify(conversation))
      
      // 更新用户的会话列表
      const userConvKey = `conversations_${userId}`
      const userConvs = await env.XINDONG_KV.get(userConvKey, 'json') || []
      if (!userConvs.includes(conversationId)) {
        userConvs.push(conversationId)
        await env.XINDONG_KV.put(userConvKey, JSON.stringify(userConvs))
      }
      
      // 更新对方的会话列表
      const targetConvKey = `conversations_${targetUserId}`
      const targetConvs = await env.XINDONG_KV.get(targetConvKey, 'json') || []
      if (!targetConvs.includes(conversationId)) {
        targetConvs.push(conversationId)
        await env.XINDONG_KV.put(targetConvKey, JSON.stringify(targetConvs))
      }
    }

    return new Response(JSON.stringify({ 
      conversation, 
      isNew: true 
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('创建会话失败:', error)
    return new Response(JSON.stringify({ error: '创建会话失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
