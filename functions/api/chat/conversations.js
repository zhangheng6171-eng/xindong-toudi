/**
 * 获取会话列表 API
 * 返回用户的所有会话，包括其他用户发来的消息
 */

export async function onRequestGet(context) {
  const { request, env } = context
  
  try {
    // 从 URL 参数获取用户ID
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing user ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // 获取所有用户数据（从 KV）
    const usersKey = 'xindong_users'
    let users = []
    if (env.XINDONG_KV) {
      const usersData = await env.XINDONG_KV.get(usersKey, { type: 'json' })
      if (usersData) {
        users = usersData
      }
    }
    
    // 获取用户的喜欢列表
    const likesKey = `likes_${userId}`
    let likes = []
    if (env.XINDONG_KV) {
      const likesData = await env.XINDONG_KV.get(likesKey, { type: 'json' })
      if (likesData) {
        likes = likesData
      }
    }
    
    // 获取所有聊天记录
    const conversations = []
    const chatPrefix = 'chat_'
    
    // 扫描所有以 chat_ 开头的 key
    // 注意：KV 的 list 操作有局限性，这里使用另一种方法
    // 我们先尝试获取所有可能和该用户相关的聊天
    
    // 方法1：遍历所有用户，尝试获取和当前用户的聊天记录
    for (const otherUser of users) {
      if (otherUser.id === userId) continue
      
      const chatKey = `chat_${[userId, otherUser.id].sort().join('_')}`
      let messages = []
      
      if (env.XINDONG_KV) {
        const chatData = await env.XINDONG_KV.get(chatKey, { type: 'json' })
        if (chatData && chatData.length > 0) {
          messages = chatData
        }
      }
      
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1]
        
        // 获取对方用户信息
        const otherUserProfile = users.find(u => u.id === otherUser.id)
        
        conversations.push({
          id: chatKey,
          matchId: otherUser.id,
          otherUser: {
            id: otherUser.id,
            nickname: otherUserProfile?.nickname || otherUser.nickname || '心动对象',
            avatar: null,
            isOnline: true
          },
          lastMessage: lastMessage.text,
          lastMessageAt: lastMessage.timestamp,
          unreadCount: 0,
          matchScore: 92,
          createdAt: new Date().toISOString()
        })
      }
    }
    
    // 方法2：也检查互相喜欢的用户（即使没有消息）
    for (const likedUserId of likes) {
      // 检查是否已经有会话
      if (conversations.find(c => c.matchId === likedUserId)) continue
      
      // 检查是否互相喜欢
      const theirLikesKey = `likes_${likedUserId}`
      let theirLikes = []
      if (env.XINDONG_KV) {
        const theirLikesData = await env.XINDONG_KV.get(theirLikesKey, { type: 'json' })
        if (theirLikesData) {
          theirLikes = theirLikesData
        }
      }
      
      if (theirLikes.includes(userId)) {
        const otherUser = users.find(u => u.id === likedUserId)
        conversations.push({
          id: `conv_${likedUserId}`,
          matchId: likedUserId,
          otherUser: {
            id: likedUserId,
            nickname: otherUser?.nickname || '心动对象',
            avatar: null,
            isOnline: true
          },
          lastMessage: '开始聊天吧～',
          lastMessageAt: null,
          unreadCount: 0,
          matchScore: 92,
          createdAt: new Date().toISOString()
        })
      }
    }
    
    // 按最后消息时间排序
    conversations.sort((a, b) => {
      if (!a.lastMessageAt) return 1
      if (!b.lastMessageAt) return -1
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    })
    
    return new Response(JSON.stringify({ 
      success: true, 
      conversations,
      count: conversations.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('Get conversations error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
