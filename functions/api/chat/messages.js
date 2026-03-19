/**
 * 获取消息 API - 使用 Supabase REST API
 */

const SUPABASE_URL = 'https://ntaqnyegiiwtzdyqjiwy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50YXFueWVnaWl3dHpkeXFqaXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTY4NzUsImV4cCI6MjA4OTQ5Mjg3NX0.4FEAb1Yd4xOwXz3LcfZ9iPG0ZZPbFd8dfry903c5lPc'

export async function onRequestGet(context) {
  const { request } = context
  
  try {
    const url = new URL(request.url)
    const userId1 = url.searchParams.get('userId1')
    const userId2 = url.searchParams.get('userId2')
    
    if (!userId1 || !userId2) {
      return new Response(JSON.stringify({ error: 'Missing user IDs' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // 使用 REST API 查询发送的消息
    const sentResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/messages?sender_id=eq.${userId1}&receiver_id=eq.${userId2}&select=*&order=created_at.asc`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    )
    
    const sentMessages = await sentResponse.json()
    
    // 查询接收的消息
    const receivedResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/messages?sender_id=eq.${userId2}&receiver_id=eq.${userId1}&select=*&order=created_at.asc`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    )
    
    const receivedMessages = await receivedResponse.json()
    
    // 合并并排序
    const allMessages = [
      ...(Array.isArray(sentMessages) ? sentMessages : []),
      ...(Array.isArray(receivedMessages) ? receivedMessages : [])
    ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    
    const messages = allMessages.map(m => ({
      id: m.id,
      senderId: m.sender_id,
      receiverId: m.receiver_id,
      text: m.content,
      type: m.type,
      timestamp: m.created_at,
      status: m.status
    }))
    
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
    
  } catch (error) {
    console.error('Get messages error:', error)
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
