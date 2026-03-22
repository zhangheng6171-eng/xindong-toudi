/**
 * 获取会话列表 API - 安全版本
 * 从环境变量读取配置
 */

import { getSupabaseConfig, corsHeaders, errorResponse, successResponse } from '../../lib/config.js'

// 获取用户信息缓存
const userCache = new Map()

async function getUserInfo(userId, config) {
  // 先检查缓存
  if (userCache.has(userId)) {
    return userCache.get(userId)
  }
  
  try {
    const response = await fetch(
      `${config.url}/rest/v1/users?id=eq.${userId}&select=id,nickname,avatar`,
      {
        headers: {
          'apikey': config.anonKey,
          'Authorization': `Bearer ${config.anonKey}`
        }
      }
    )
    
    const users = await response.json()
    
    if (Array.isArray(users) && users.length > 0) {
      const userInfo = users[0]
      userCache.set(userId, userInfo)
      return userInfo
    }
  } catch (e) {
    console.error('Failed to get user info:', e)
  }
  
  return null
}

export async function onRequestGet(context) {
  const { request, env } = context
  const config = getSupabaseConfig(env)
  
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    
    if (!userId) {
      return errorResponse('Missing user ID', 400)
    }
    
    // 查询用户发送的消息
    const sentResponse = await fetch(
      `${config.url}/rest/v1/messages?sender_id=eq.${userId}&select=receiver_id,content,created_at&order=created_at.desc`,
      {
        headers: {
          'apikey': config.anonKey,
          'Authorization': `Bearer ${config.anonKey}`
        }
      }
    )
    
    const sentMessages = await sentResponse.json()
    
    // 查询用户接收的消息
    const receivedResponse = await fetch(
      `${config.url}/rest/v1/messages?receiver_id=eq.${userId}&select=sender_id,content,created_at&order=created_at.desc`,
      {
        headers: {
          'apikey': config.anonKey,
          'Authorization': `Bearer ${config.anonKey}`
        }
      }
    )
    
    const receivedMessages = await receivedResponse.json()
    
    // 按对话分组
    const conversationMap = new Map()
    
    // 处理发送的消息
    for (const msg of (Array.isArray(sentMessages) ? sentMessages : [])) {
      if (!conversationMap.has(msg.receiver_id)) {
        conversationMap.set(msg.receiver_id, {
          id: `conv_${msg.receiver_id}`,
          matchId: msg.receiver_id,
          otherUser: {
            id: msg.receiver_id,
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
    
    // 处理接收的消息
    for (const msg of (Array.isArray(receivedMessages) ? receivedMessages : [])) {
      if (!conversationMap.has(msg.sender_id)) {
        conversationMap.set(msg.sender_id, {
          id: `conv_${msg.sender_id}`,
          matchId: msg.sender_id,
          otherUser: {
            id: msg.sender_id,
            nickname: '心动对象',
            isOnline: true
          },
          lastMessage: msg.content,
          lastMessageAt: msg.created_at,
          unreadCount: 1,
          matchScore: 92
        })
      } else {
        // 更新最后消息时间
        const conv = conversationMap.get(msg.sender_id)
        if (new Date(msg.created_at) > new Date(conv.lastMessageAt)) {
          conv.lastMessage = msg.content
          conv.lastMessageAt = msg.created_at
          conv.unreadCount = 1
        }
      }
    }
    
    // 获取所有其他用户的昵称
    const otherUserIds = Array.from(conversationMap.keys())
    
    for (const otherUserId of otherUserIds) {
      const userInfo = await getUserInfo(otherUserId, config)
      if (userInfo && userInfo.nickname) {
        const conv = conversationMap.get(otherUserId)
        conv.otherUser.nickname = userInfo.nickname
        conv.otherUser.avatar = userInfo.avatar || null
      }
    }
    
    const conversations = Array.from(conversationMap.values())
    
    return successResponse({
      conversations,
      count: conversations.length
    })
    
  } catch (error) {
    console.error('Get conversations error:', error)
    return errorResponse(error.message, 500)
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  })
}
