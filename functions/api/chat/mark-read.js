/**
 * 标记消息已读 API - 使用 Supabase REST API
 * 更新消息表中所有发送给当前用户的消息状态为 'read'
 */

const SUPABASE_URL = 'https://ntaqnyegiiwtzdyqjiwy.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50YXFueWVnaWl3dHpkeXFqaXd5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkxNjg3NSwiZXhwIjoyMDg5NDkyODc1fQ.z8LPpoJoa9_DEJvBmNvSF0Q1I4FA3FNnFRU0PgKcF2A'

export async function onRequestPost(context) {
  const { request } = context
  
  try {
    const body = await request.json()
    const { userId, otherUserId, lastReadAt } = body
    
    if (!userId || !otherUserId || !lastReadAt) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // 更新所有由 otherUserId 发送给 userId 的消息状态为 'read'
    // 使用 Service Role Key 以便有权限更新
    const updateResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/messages?sender_id=eq.${otherUserId}&receiver_id=eq.${userId}&status=eq.sent`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          status: 'read'
        })
      }
    )
    
    if (!updateResponse.ok) {
      const error = await updateResponse.text()
      console.error('Supabase update error:', error)
      // 不返回错误，因为可能没有消息需要更新
    }
    
    const updated = await updateResponse.json()
    
    return new Response(JSON.stringify({ 
      success: true, 
      updatedCount: Array.isArray(updated) ? updated.length : 0,
      lastReadAt
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
    
  } catch (error) {
    console.error('Mark read error:', error)
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-User-Id'
    }
  })
}
