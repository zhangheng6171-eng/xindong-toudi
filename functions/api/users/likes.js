/**
 * 用户喜欢列表管理 API - 使用 Cloudflare KV 存储
 */

const SUPABASE_URL = 'https://ntaqnyegiiwtzdyqjiwy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50YXFueWVnaWl3dHpkeXFqaXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTY4NzUsImV4cCI6MjA4OTQ5Mjg3NX0.4FEAb1Yd4xOwXz3LcfZ9iPG0ZZPbFd8dfry903c5lPc'

// KV 存储键名
const LIKES_KV_KEY = 'xindong_likes'

// 获取 KV 中的喜欢数据
async function getLikesFromKV(env) {
  try {
    if (env && env.XINDONG_LIKES) {
      const data = await env.XINDONG_LIKES.get('likes')
      return data ? JSON.parse(data) : []
    }
  } catch (e) {
    console.log('KV not available:', e.message)
  }
  return null
}

// 保存喜欢数据到 KV
async function saveLikesToKV(env, likes) {
  try {
    if (env && env.XINDONG_LIKES) {
      await env.XINDONG_LIKES.put('likes', JSON.stringify(likes))
      return true
    }
  } catch (e) {
    console.log('KV write failed:', e.message)
  }
  return false
}

// 从 KV 获取所有喜欢关系
async function getAllLikes(env) {
  const kvLikes = await getLikesFromKV(env)
  if (kvLikes !== null) {
    return kvLikes
  }
  // 如果 KV 不可用，返回空数组
  return []
}

export async function onRequestGet(context) {
  const { request, env } = context
  
  try {
    const url = new URL(request.url)
    const action = url.searchParams.get('action')
    
    if (action === 'all') {
      // 获取所有喜欢关系
      const likes = await getAllLikes(env)
      
      return new Response(JSON.stringify({ 
        success: true,
        likes: likes
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }
    
    // 获取指定用户的喜欢列表
    const userId = url.searchParams.get('userId')
    
    if (!userId) {
      return new Response(JSON.stringify({ error: '缺少参数' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }
    
    const likes = await getAllLikes(env)
    const userLikes = likes
      .filter(l => l.from_user_id === userId)
      .map(l => l.to_user_id)
    
    return new Response(JSON.stringify({ 
      success: true,
      likedUsers: userLikes
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
    
  } catch (error) {
    console.error('Get likes error:', error)
    return new Response(JSON.stringify({ 
      success: true,
      likes: [],
      error: error.message 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
}

export async function onRequestPost(context) {
  const { request, env } = context
  
  try {
    const body = await request.json()
    const { fromUserId, toUserId, action } = body
    
    if (!fromUserId || !toUserId) {
      return new Response(JSON.stringify({ error: '缺少参数' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }
    
    // 获取当前喜欢列表
    let likes = await getAllLikes(env)
    
    // 移除该用户对该目标的所有喜欢记录
    likes = likes.filter(l => !(l.from_user_id === fromUserId && l.to_user_id === toUserId))
    
    // 如果是喜欢操作，添加记录
    if (action === 'like') {
      likes.push({
        from_user_id: fromUserId,
        to_user_id: toUserId,
        created_at: new Date().toISOString()
      })
    }
    
    // 保存到 KV
    await saveLikesToKV(env, likes)
    
    return new Response(JSON.stringify({ 
      success: true,
      message: action === 'like' ? '喜欢成功' : '取消喜欢成功'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
    
  } catch (error) {
    console.error('Update like error:', error)
    return new Response(JSON.stringify({ 
      success: true,
      error: error.message 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}
