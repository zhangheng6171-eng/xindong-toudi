'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Heart, MessageCircle, Star, Search, RefreshCw } from 'lucide-react'
import { AnimatedBackground, GlassCard, FadeIn } from '@/components/animated-background'
import { useAuth } from '@/hooks/useAuth'
import { useUnreadMessages } from '@/hooks/useUnreadMessages'

// 会话数据类型
interface Conversation {
  id: string
  matchId: string
  otherUser: {
    id: string
    nickname: string
    avatar: string | null
    isOnline?: boolean
  }
  lastMessage: string | null
  lastMessageAt: string | null
  unreadCount: number
  matchScore: number
  createdAt: string
}

// 模拟在线用户列表（实际应用中应该从服务器获取）
const onlineUsers = new Set<string>()

export default function ChatListPage() {
  const { currentUser, isLoading: authLoading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showOnlineOnly, setShowOnlineOnly] = useState(false)
  
  // 未读消息管理
  const { unreadInfo, markAllAsRead } = useUnreadMessages(currentUser?.id || null)

  // Supabase 配置
  const SUPABASE_URL = 'https://ntaqnyegiiwtzdyqjiwy.supabase.co'
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50YXFueWVnaWl3dHpkeXFqaXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTY4NzUsImV4cCI6MjA4OTQ5Mjg3NX0.4FEAb1Yd4xOwXz3LcfZ9iPG0ZZPbFd8dfry903c5lPc'

  // 获取会话列表
  const fetchConversations = useCallback(async () => {
    if (!currentUser) {
      console.log('[ChatList] No current user, skipping fetch')
      return
    }

    setIsLoading(true)
    setError(null)

    console.log('[ChatList] Fetching conversations for user:', currentUser.id)

    try {
      // 直接从 Supabase 获取消息记录
      const messagesResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/messages?or=(sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id})&select=id,sender_id,receiver_id,content,created_at&order=created_at.desc&limit=100`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        }
      )

      if (messagesResponse.ok) {
        const messages = await messagesResponse.json()
        console.log('[ChatList] Raw messages:', messages?.length || 0)

        if (Array.isArray(messages) && messages.length > 0) {
          // 按对话分组，找到所有与当前用户有消息往来的人
          const conversationMap = new Map()
          
          for (const msg of messages) {
            const otherUserId = msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id
            
            if (!conversationMap.has(otherUserId)) {
              conversationMap.set(otherUserId, {
                id: `conv_${otherUserId}`,
                matchId: otherUserId,
                otherUser: {
                  id: otherUserId,
                  nickname: '心动对象',
                  avatar: null,
                  isOnline: false
                },
                lastMessage: msg.content,
                lastMessageAt: msg.created_at,
                unreadCount: 0,
                matchScore: 92,
                createdAt: msg.created_at
              })
            }
          }

          // 获取所有其他用户的信息
          const otherUserIds = Array.from(conversationMap.keys())
          console.log('[ChatList] Other user IDs:', otherUserIds)

          if (otherUserIds.length > 0) {
            // 构建正确的 in 查询 URL
            const idsParam = otherUserIds.map(id => encodeURIComponent(id)).join(',')
            const usersResponse = await fetch(
              `${SUPABASE_URL}/rest/v1/users?id=in.(${idsParam})&select=id,nickname,avatar`,
              {
                headers: {
                  'apikey': SUPABASE_ANON_KEY,
                  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
              }
            )

            if (usersResponse.ok) {
              const users = await usersResponse.json()
              if (Array.isArray(users)) {
                for (const user of users) {
                  const conv = conversationMap.get(user.id)
                  if (conv) {
                    conv.otherUser.nickname = user.nickname || '心动对象'
                    conv.otherUser.avatar = user.avatar || null
                  }
                }
              }
            }
          }

          const conversations = Array.from(conversationMap.values())
          console.log('[ChatList] Final conversations:', conversations.length)
          setConversations(conversations)
          setIsLoading(false)
          return
        }
      }
      
      console.log('[ChatList] No messages found or API failed')
      setConversations([])
    } catch (err) {
      console.error('[ChatList] 获取会话失败:', err)
      setConversations([])
    } finally {
      setIsLoading(false)
    }
  }, [currentUser])

  // 从 localStorage 获取本地会话（后备方案）
  const getLocalConversations = (userId: string): Conversation[] => {
    const usersJson = localStorage.getItem('xindong_users')
    const likesJson = localStorage.getItem(`xindong_likes_${userId}`)
    
    if (!usersJson) return []
    
    const users = JSON.parse(usersJson)
    const likes = likesJson ? JSON.parse(likesJson) : []
    const conversations: Conversation[] = []

    // 1. 先检查所有聊天记录，找出有消息的用户
    const chatKeys = Object.keys(localStorage).filter(key => key.startsWith('xindong_chat_'))
    
    chatKeys.forEach(chatKey => {
      // 使用更智能的方式解析用户ID
      // key格式: xindong_chat_{sorted_id1}_{sorted_id2}
      // 用户ID格式: user_数字
      // 所以需要找到两个 user_ 开头的部分
      const keyPart = chatKey.replace('xindong_chat_', '')
      
      // 使用正则提取两个用户ID
      const userIdPattern = /user_\d+/g
      const matches = keyPart.match(userIdPattern)
      
      if (!matches || matches.length !== 2) {
        console.warn('Invalid chat key format:', chatKey)
        return
      }
      
      const [id1, id2] = matches
      const otherUserId = id1 === userId ? id2 : id1
      
      // 确保不是当前用户
      if (otherUserId === userId) return
      
      const chatJson = localStorage.getItem(chatKey)
      if (!chatJson) return
      
      const chatMessages = JSON.parse(chatJson)
      if (chatMessages.length === 0) return
      
      // 获取对方用户信息
      const otherUser = users.find((u: any) => u.id === otherUserId)
      const profileJson = localStorage.getItem(`xindong_profile_${otherUserId}`)
      const profile = profileJson ? JSON.parse(profileJson) : {}
      const avatar = localStorage.getItem(`xindong_avatar_${otherUserId}`)
      
      // 获取最后一条消息
      const lastMessage = chatMessages[chatMessages.length - 1]
      
      // 计算未读消息数
      const lastReadKey = `xindong_last_read_${userId}_${otherUserId}`
      const lastReadTime = localStorage.getItem(lastReadKey)
      const unreadCount = lastReadTime 
        ? chatMessages.filter((m: any) => 
            m.senderId !== userId && 
            new Date(m.timestamp).getTime() > new Date(lastReadTime).getTime()
          ).length 
        : chatMessages.filter((m: any) => m.senderId !== userId).length

      conversations.push({
        id: chatKey,
        matchId: otherUserId,
        otherUser: {
          id: otherUserId,
          nickname: profile.nickname || otherUser?.nickname || '心动对象',
          avatar: avatar,
          isOnline: true,
        },
        lastMessage: lastMessage?.text || '开始聊天吧～',
        lastMessageAt: lastMessage?.timestamp || null,
        unreadCount,
        matchScore: profile.matchScore || 92,
        createdAt: new Date().toISOString(),
      })
    })

    // 2. 检查互相喜欢但没有消息的用户
    likes.forEach((likedUserId: string) => {
      // 检查是否已经有会话
      if (conversations.find(c => c.matchId === likedUserId)) return
      
      const theirLikesJson = localStorage.getItem(`xindong_likes_${likedUserId}`)
      const theirLikes = theirLikesJson ? JSON.parse(theirLikesJson) : []

      // 检查是否互相喜欢
      if (theirLikes.includes(userId)) {
        const otherUser = users.find((u: any) => u.id === likedUserId)
        if (otherUser) {
          const profileJson = localStorage.getItem(`xindong_profile_${likedUserId}`)
          const profile = profileJson ? JSON.parse(profileJson) : {}
          const avatar = localStorage.getItem(`xindong_avatar_${likedUserId}`)

          conversations.push({
            id: `conv_${likedUserId}`,
            matchId: likedUserId,
            otherUser: {
              id: likedUserId,
              nickname: profile.nickname || otherUser.nickname,
              avatar: avatar,
              isOnline: true,
            },
            lastMessage: '开始聊天吧～',
            lastMessageAt: null,
            unreadCount: 0,
            matchScore: profile.matchScore || 92,
            createdAt: new Date().toISOString(),
          })
        }
      }
    })

    // 按最后消息时间排序
    return conversations.sort((a, b) => {
      if (!a.lastMessageAt) return 1
      if (!b.lastMessageAt) return -1
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    })
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && currentUser) {
      fetchConversations()
      // 查看聊天页面时，标记所有消息为已读
      markAllAsRead()
    }
  }, [mounted, currentUser, fetchConversations, markAllAsRead])

  if (authLoading || !mounted) {
    return (
      <AnimatedBackground variant="romance" showFloatingHearts={false}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-rose-500">加载中...</div>
        </div>
      </AnimatedBackground>
    )
  }

  // 如果未登录，跳转到登录页
  if (!currentUser) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    return null
  }

  // 过滤会话
  const filteredConversations = conversations.filter(conv => {
    // 搜索过滤
    const matchesSearch = conv.otherUser.nickname.toLowerCase().includes(searchQuery.toLowerCase())
    // 在线状态过滤
    const matchesOnline = !showOnlineOnly || conv.otherUser.isOnline
    return matchesSearch && matchesOnline
  })

  // 计算总未读数
  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)
  
  // 计算在线人数
  const onlineCount = conversations.filter(conv => conv.otherUser.isOnline).length

  return (
    <AnimatedBackground variant="romance" showFloatingHearts={false}>
      <div className="min-h-screen pb-20">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/50">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900 text-center flex-1">
                消息
                {totalUnread > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-rose-500 text-white text-xs rounded-full">
                    {totalUnread}
                  </span>
                )}
              </h1>
              <button
                onClick={fetchConversations}
                disabled={isLoading}
                className="p-2 text-gray-500 hover:text-rose-500 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* 搜索框 */}
          <FadeIn delay={0}>
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索聊天..."
                className="w-full pl-12 pr-4 py-3 bg-white/80 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all"
              />
            </div>
          </FadeIn>

          {/* 错误提示 */}
          {error && (
            <FadeIn>
              <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-2xl text-sm">
                {error}
              </div>
            </FadeIn>
          )}

          {/* 在线状态切换 */}
          <FadeIn delay={0.1}>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setShowOnlineOnly(!showOnlineOnly)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  showOnlineOnly 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white/80 text-gray-600 border border-gray-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${showOnlineOnly ? 'bg-white' : 'bg-green-500'} animate-pulse`} />
                在线 {onlineCount} 人
              </button>
              <span className="text-sm text-gray-500">
                共 {conversations.length} 个会话
              </span>
            </div>
          </FadeIn>

          {/* 加载状态 */}
          {isLoading && conversations.length === 0 && (
            <div className="text-center py-12">
              <div className="animate-pulse text-gray-400">加载会话列表...</div>
            </div>
          )}

          {/* 聊天列表 */}
          <div className="space-y-3">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv, index) => (
                <FadeIn key={conv.id} delay={index * 0.1}>
                  <Link href={`/chat/conversation/?userId=${conv.matchId}&nickname=${encodeURIComponent(conv.otherUser.nickname)}&conversationId=${conv.id}`}>
                    <GlassCard className="p-4 hover:shadow-lg transition-all cursor-pointer" hover={true}>
                      <div className="flex items-center gap-4">
                        {/* 头像 */}
                        <div className="relative flex-shrink-0">
                          {conv.otherUser.avatar ? (
                            <img
                              src={conv.otherUser.avatar}
                              alt={conv.otherUser.nickname}
                              className="w-14 h-14 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-xl font-bold">
                              {conv.otherUser.nickname[0]}
                            </div>
                          )}
                          {/* 在线状态 */}
                          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                        </div>

                        {/* 信息 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-gray-900">{conv.otherUser.nickname}</h3>
                            <div className="flex items-center gap-2">
                              <span className="text-xs bg-gradient-to-r from-rose-500 to-pink-500 text-white px-2 py-0.5 rounded-full">
                                {conv.matchScore}%
                              </span>
                              {conv.lastMessageAt && (
                                <span className="text-xs text-gray-400">
                                  {formatTime(conv.lastMessageAt)}
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 truncate">{conv.lastMessage || '开始聊天吧～'}</p>
                        </div>

                        {/* 未读标记 */}
                        {conv.unreadCount > 0 && (
                          <div className="flex-shrink-0 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {conv.unreadCount}
                          </div>
                        )}
                      </div>
                    </GlassCard>
                  </Link>
                </FadeIn>
              ))
            ) : !isLoading && (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">暂无消息</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery ? '没有找到匹配的聊天' : '互相喜欢后就可以开始聊天啦～'}
                </p>
                {!searchQuery && (
                  <Link
                    href="/"
                    className="inline-block px-6 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-medium rounded-full"
                  >
                    去看看首页
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* 提示 */}
          <FadeIn delay={0.3}>
            <div className="mt-8 text-center text-sm text-gray-400">
              <p>💬 互相喜欢后才能发送消息哦</p>
            </div>
          </FadeIn>
        </div>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100/50 px-4 py-3 z-50">
          <div className="max-w-md mx-auto flex justify-around">
            <Link href="/" className="flex flex-col items-center text-gray-400 hover:text-rose-500 transition-colors">
              <Heart className="w-6 h-6" />
              <span className="text-xs mt-1">首页</span>
            </Link>
            <Link href="/match" className="flex flex-col items-center text-gray-400 hover:text-rose-500 transition-colors">
              <Heart className="w-6 h-6" />
              <span className="text-xs mt-1">匹配</span>
            </Link>
            <Link href="/chat" className="flex flex-col items-center text-rose-500">
              <MessageCircle className="w-6 h-6 fill-current" />
              <span className="text-xs mt-1 font-medium">消息</span>
            </Link>
            <Link href="/dashboard" className="flex flex-col items-center text-gray-400 hover:text-rose-500 transition-colors">
              <Star className="w-6 h-6" />
              <span className="text-xs mt-1">我的</span>
            </Link>
          </div>
        </nav>
      </div>
    </AnimatedBackground>
  )
}

// 格式化时间
function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
}
