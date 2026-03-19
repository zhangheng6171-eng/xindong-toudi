/**
 * 发送消息 API - 使用 Supabase
 */

import { createClient } from '@supabase/supabase-js'

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
    
    // 创建 Supabase 客户端
    const supabase = createClient(
      'https://ntaqnyegiiwtzdyqjiwy.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50YXFueWVnaWl3dHpkeXFqaXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTY4NzUsImV4cCI6MjA4OTQ5Mjg3NX0.4FEAb1Yd4xOwXz3LcfZ9iPG0ZZPbFd8dfry903c5lPc'
    )
    
    // 保存消息到 Supabase
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content: text,
        type,
        status: 'sent'
      })
      .select()
      .single()
    
    if (error) {
      console.error('Supabase insert error:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: {
        id: data.id,
        senderId: data.sender_id,
        receiverId: data.receiver_id,
        text: data.content,
        type: data.type,
        timestamp: data.created_at,
        status: data.status
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
