/**
 * 获取会话列表 API - 使用 Supabase REST API
 */

const SUPABASE_URL = 'https://ntaqnyegiiwtzdyqjiwy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50YXFueWVnaWl3dHpkeXFqaXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTY4NzUsImV4cCI6MjA4OTQ5Mjg3NX0.4FEAb1Yd4xOwXz3LcfZ9iPG0ZZPbFd8dfry903c5lPc'

export async function onRequestGet(context) {
  const { request } = context
  
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing user ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // 查询用户发送的消息
    const sentResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/messages?sender_id=eq.${userId}&select=receiver_id,content,created_at&order=created_at.desc`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    )
    
    const sentMessages = await sentResponse.json()
    
    // 查询用户接收的消息
    const receivedResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/messages?receiver_id=eq.${userId}&select=sender_id,content,created_at&order=created_at.desc`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    )
    
    const receivedMessages = await receivedResponse.json()
    
    // 按对话分组
    const conversationMap = new Map()
    
    // 处理发送的消息
    for (const msg of (Array.isArray(sentMessages) ? sentMessages : [])) {
      if (!conversationMap.has(msg.receiver_id)) {
        conversationMap.set(msg.receiver_id, {
          id: `conv_${msg.receiver_id}`,
          matchId: msg.receiver_id,
          otherUser: {
            id: msg.receiver_id,
            nickname: '心动对象',
            isOnline: true
          },
          lastMessage: msg.content,
          lastMessageAt: msg.created_at,
          unreadCount: 0,
          matchScore: 92
        })
      }
    }
    
    // 处理接收的消息
    for (const msg of (Array.isArray(receivedMessages) ? receivedMessages : [])) {
      if (!conversationMap.has(msg.sender_id)) {
        conversationMap.set(msg.sender_id, {
          id: `conv_${msg.sender_id}`,
          matchId: msg.sender_id,
          otherUser: {
            id: msg.sender_id,
            nickname: '心动对象',
            isOnline: true
          },
          lastMessage: msg.content,
          lastMessageAt: msg.created_at,
          unreadCount: 1,
          matchScore: 92
        })
      } else {
        // 更新最后消息时间
        const conv = conversationMap.get(msg.sender_id)
        if (new Date(msg.created_at) > new Date(conv.lastMessageAt)) {
          conv.lastMessage = msg.content
          conv.lastMessageAt = msg.created_at
          conv.unreadCount = 1
        }
      }
    }
    
    const conversations = Array.from(conversationMap.values())
    
    return new Response(JSON.stringify({ 
      success: true, 
      conversations,
      count: conversations.length
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
    
  } catch (error) {
    console.error('Get conversations error:', error)
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}
