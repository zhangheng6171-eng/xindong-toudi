/**
 * 标记消息已读 API - 使用 Supabase REST API
 */

const SUPABASE_URL = 'https://ntaqnyegiiwtzdyqjiwy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50YXFueWVnaWl3dHpkeXFqaXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTY4NzUsImV4cCI6MjA4OTQ5Mjg3NX0.4FEAb1Yd4xOwXz3LcfZ9iPG0ZZPbFd8dfry903c5lPc'

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
    
    // 先查询是否已有记录
    const checkResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/read_receipts?user_id=eq.${userId}&other_user_id=eq.${otherUserId}&select=id`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    )
    
    const existingRecords = await checkResponse.json()
    
    if (Array.isArray(existingRecords) && existingRecords.length > 0) {
      // 更新现有记录
      const recordId = existingRecords[0].id
      const updateResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/read_receipts?id=eq.${recordId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            last_read_at: lastReadAt,
            updated_at: new Date().toISOString()
          })
        }
      )
      
      const updated = await updateResponse.json()
      
      return new Response(JSON.stringify({ 
        success: true, 
        action: 'updated',
        receipt: Array.isArray(updated) ? updated[0] : updated
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    } else {
      // 创建新记录
      const insertResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/read_receipts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            user_id: userId,
            other_user_id: otherUserId,
            last_read_at: lastReadAt
          })
        }
      )
      
      if (!insertResponse.ok) {
        const error = await insertResponse.text()
        console.error('Supabase insert error:', error)
        return new Response(JSON.stringify({ error }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      
      const inserted = await insertResponse.json()
      
      return new Response(JSON.stringify({ 
        success: true, 
        action: 'created',
        receipt: Array.isArray(inserted) ? inserted[0] : inserted
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }
    
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
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}
