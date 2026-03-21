/**
 * 获取已读状态 API - 使用 Supabase REST API
 * 查询对方发送给我的最新已读消息的时间
 */

const SUPABASE_URL = 'https://ntaqnyegiiwtzdyqjiwy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50YXFueWVnaWl3dHpkeXFqaXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTY4NzUsImV4cCI6MjA4OTQ5Mjg3NX0.4FEAb1Yd4xOwXz3LcfZ9iPG0ZZPbFd8dfry903c5lPc'

export async function onRequestGet(context) {
  const { request } = context
  
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    const otherUserId = url.searchParams.get('otherUserId')
    
    if (!userId || !otherUserId) {
      return new Response(JSON.stringify({ error: 'Missing user IDs' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // 查询对方发送给我的已读消息中，最新的已读消息的创建时间
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/messages?sender_id=eq.${otherUserId}&receiver_id=eq.${userId}&status=eq.read&select=created_at&order=created_at.desc&limit=1`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    )
    
    const messages = await response.json()
    
    let lastReadAt = null
    if (Array.isArray(messages) && messages.length > 0) {
      lastReadAt = messages[0].created_at
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      lastReadAt,
      userId,
      otherUserId
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
    
  } catch (error) {
    console.error('Get read status error:', error)
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
      'Access-Control-Allow-Headers': 'Content-Type, X-User-Id'
    }
  })
}
