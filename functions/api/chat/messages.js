/**
 * 获取消息 API - 使用 Supabase
 */

import { createClient } from '@supabase/supabase-js'

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
    
    // 创建 Supabase 客户端
    const supabase = createClient(
      'https://ntaqnyegiiwtzdyqjiwy.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50YXFueWVnaWl3dHpkeXFqaXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTY4NzUsImV4cCI6MjA4OTQ5Mjg3NX0.4FEAb1Yd4xOwXz3LcfZ9iPG0ZZPbFd8dfry903c5lPc'
    )
    
    // 查询两个用户之间的所有消息
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('Supabase query error:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    const messages = (data || []).map(m => ({
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
