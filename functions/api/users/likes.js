/**
 * 用户喜欢列表管理 API - 简化版
 * 使用 users 表的 likes 字段（JSONB 数组）存储喜欢关系
 */

const SUPABASE_URL = 'https://ntaqnyegiiwtzdyqjiwy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50YXFueWVnaWl3dHpkeXFqaXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTY4NzUsImV4cCI6MjA4OTQ5Mjg3NX0.4FEAb1Yd4xOwXz3LcfZ9iPG0ZZPbFd8dfry903c5lPc'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50YXFueWVnaWl3dHpkeXFqaXd5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkxNjg3NSwiZXhwIjoyMDg5NDkyODc1fQ.z8LPpoJoa9_DEJvBmNvSF0Q1I4FA3FNnFRU0PgKcF2A'

// 简单的内存存储（临时解决方案，重启后丢失）
const memoryLikes = new Map()

export async function onRequestGet(context) {
  const { request } = context
  
  try {
    const url = new URL(request.url)
    const action = url.searchParams.get('action')
    
    if (action === 'all') {
      // 从 users 表读取所有用户的 likes 字段
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/users?select=id,likes`,
          {
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
          }
        )
        
        if (!response.ok) {
          // 回退到内存存储
          const likes = []
          memoryLikes.forEach((targets, from) => {
            targets.forEach(to => {
              likes.push({ from_user_id: from, to_user_id: to })
            })
          })
          return new Response(JSON.stringify({ 
            success: true,
            likes: likes,
            source: 'memory'
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          })
        }
        
        const users = await response.json()
        const likes = []
        
        users.forEach(user => {
          if (user.likes && Array.isArray(user.likes)) {
            user.likes.forEach(targetId => {
              likes.push({ from_user_id: user.id, to_user_id: targetId })
            })
          }
        })
        
        return new Response(JSON.stringify({ 
          success: true,
          likes: likes,
          source: 'database'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        })
        
      } catch (e) {
        // 回退到内存存储
        const likes = []
        memoryLikes.forEach((targets, from) => {
          targets.forEach(to => {
            likes.push({ from_user_id: from, to_user_id: to })
          })
        })
        return new Response(JSON.stringify({ 
          success: true,
          likes: likes,
          source: 'memory'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        })
      }
    }
    
    // 获取指定用户的喜欢列表
    const userId = url.searchParams.get('userId')
    
    if (!userId) {
      return new Response(JSON.stringify({ error: '缺少参数' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }
    
    // 尝试从数据库读取
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=likes`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        if (data && data[0] && data[0].likes) {
          return new Response(JSON.stringify({ 
            success: true,
            likedUsers: data[0].likes
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          })
        }
      }
    } catch (e) {}
    
    // 回退到内存
    const likes = memoryLikes.get(userId) || []
    return new Response(JSON.stringify({ 
      success: true,
      likedUsers: likes,
      source: 'memory'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
    
  } catch (error) {
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
  const { request } = context
  
  try {
    const body = await request.json()
    const { fromUserId, toUserId, action } = body
    
    if (!fromUserId || !toUserId) {
      return new Response(JSON.stringify({ error: '缺少参数' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }
    
    // 先尝试从数据库读取当前喜欢列表
    let currentLikes = []
    let useMemory = false
    
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/users?id=eq.${fromUserId}&select=likes`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        if (data && data[0] && data[0].likes) {
          currentLikes = data[0].likes
        }
      } else {
        useMemory = true
      }
    } catch (e) {
      useMemory = true
    }
    
    if (useMemory) {
      // 使用内存存储
      currentLikes = memoryLikes.get(fromUserId) || []
      
      if (action === 'like') {
        if (!currentLikes.includes(toUserId)) {
          currentLikes.push(toUserId)
        }
      } else {
        currentLikes = currentLikes.filter(id => id !== toUserId)
      }
      
      memoryLikes.set(fromUserId, currentLikes)
      
      return new Response(JSON.stringify({ 
        success: true,
        message: action === 'like' ? '喜欢成功' : '取消喜欢成功',
        source: 'memory'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }
    
    // 更新数据库
    if (action === 'like') {
      if (!currentLikes.includes(toUserId)) {
        currentLikes.push(toUserId)
      }
    } else {
      currentLikes = currentLikes.filter(id => id !== toUserId)
    }
    
    const updateResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/users?id=eq.${fromUserId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ likes: currentLikes })
      }
    )
    
    if (!updateResponse.ok) {
      // 如果更新失败（可能是 likes 字段不存在），回退到内存
      currentLikes = memoryLikes.get(fromUserId) || []
      
      if (action === 'like') {
        if (!currentLikes.includes(toUserId)) {
          currentLikes.push(toUserId)
        }
      } else {
        currentLikes = currentLikes.filter(id => id !== toUserId)
      }
      
      memoryLikes.set(fromUserId, currentLikes)
      
      return new Response(JSON.stringify({ 
        success: true,
        message: action === 'like' ? '喜欢成功' : '取消喜欢成功',
        source: 'memory'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      message: action === 'like' ? '喜欢成功' : '取消喜欢成功',
      source: 'database'
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
