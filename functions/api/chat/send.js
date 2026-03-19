/**
 * 发送消息 API - 使用 Supabase REST API
 */

const SUPABASE_URL = 'https://ntaqnyegiiwtzdyqjiwy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50YXFueWVnaWl3dHpkeXFqaXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTY4NzUsImV4cCI6MjA4OTQ5Mjg3NX0.4FEAb1Yd4xOwXz3LcfZ9iPG0ZZPbFd8dfry903c5lPc'

export async function onRequestPost(context) {
  const { request } = context
  
  try {
    const body = await request.json()
    const { senderId, receiverId, text, type = 'text' } = body
    
    if (!senderId || !receiverId || !text) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // 使用 REST API 插入消息
    const response = await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        sender_id: senderId,
        receiver_id: receiverId,
        content: text,
        type,
        status: 'sent'
      })
    })
    
    if (!response.ok) {
      const error = await response.text()
      console.error('Supabase insert error:', error)
      return new Response(JSON.stringify({ error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    const data = await response.json()
    const message = Array.isArray(data) ? data[0] : data
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: {
        id: message.id,
        senderId: message.sender_id,
        receiverId: message.receiver_id,
        text: message.content,
        type: message.type,
        timestamp: message.created_at,
        status: message.status
      }
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
    
  } catch (error) {
    console.error('Send message error:', error)
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
