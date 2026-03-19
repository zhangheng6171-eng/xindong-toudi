/**
 * 获取会话列表 API - 使用 Supabase
 */

import { createClient } from '@supabase/supabase-js'

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
    
    // 创建 Supabase 客户端
    const supabase = createClient(
      'https://ntaqnyegiiwtzdyqjiwy.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50YXFueWVnaWl3dHpkeXFqaXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTY4NzUsImV4cCI6MjA4OTQ5Mjg3NX0.4FEAb1Yd4xOwXz3LcfZ9iPG0ZZPbFd8dfry903c5lPc'
    )
    
    // 查询用户发送或接收的所有消息
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Supabase query error:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // 按对话分组，找出所有对话用户
    const conversationMap = new Map()
    
    for (const msg of data || []) {
      const otherUserId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id
      
      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          id: `conv_${otherUserId}`,
          matchId: otherUserId,
          otherUser: {
            id: otherUserId,
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
