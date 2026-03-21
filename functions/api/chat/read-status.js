/**
 * 获取已读状态 API - 使用 Supabase REST API
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
    
    // 从 read_receipts 表查询已读状态
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/read_receipts?user_id=eq.${userId}&other_user_id=eq.${otherUserId}&select=last_read_at`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    )
    
    const receipts = await response.json()
    
    let lastReadAt = null
    if (Array.isArray(receipts) && receipts.length > 0) {
      lastReadAt = receipts[0].last_read_at
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
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}
