'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Heart, MessageCircle, Star, Search, RefreshCw } from 'lucide-react'
import { AnimatedBackground, GlassCard, FadeIn } from '@/components/animated-background'
import { useAuth } from '@/hooks/useAuth'

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

  // 获取会话列表
  const fetchConversations = useCallback(async () => {
    if (!currentUser) return

    setIsLoading(true)
    setError(null)

    try {
      // 先尝试从 Supabase API 获取
      const response = await fetch('/api/chat/conversations', {
        headers: {
          'X-User-Id': currentUser.id,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])
      } else {
        // API 失败，从 localStorage 获取本地数据作为后备
        const localConversations = getLocalConversations(currentUser.id)
        setConversations(localConversations)
      }
    } catch (err) {
      console.error('获取会话失败:', err)
      // 网络错误，使用本地数据
      const localConversations = getLocalConversations(currentUser.id)
      setConversations(localConversations)
    } finally {
      setIsLoading(false)
    }
  }, [currentUser])

  // 从 localStorage 获取本地会话（后备方案）
  const getLocalConversations = (userId: string): Conversation[] => {
    const matchesJson = localStorage.getItem(`xindong_matches_${userId}`)
    const likesJson = localStorage.getItem(`xindong_likes_${userId}`)
    const usersJson = localStorage.getItem('xindong_users')

    if (!matchesJson || !usersJson) return []

    const matches = JSON.parse(matchesJson)
    const likes = likesJson ? JSON.parse(likesJson) : []
    const users = JSON.parse(usersJson)

    // 获取双向喜欢的匹配
    const mutualLikes: Conversation[] = []

    likes.forEach((likedUserId: string) => {
      const theirLikesJson = localStorage.getItem(`xindong_likes_${likedUserId}`)
      const theirLikes = theirLikesJson ? JSON.parse(theirLikesJson) : []

      // 检查是否互相喜欢
      if (theirLikes.includes(userId)) {
        const otherUser = users.find((u: any) => u.id === likedUserId)
        if (otherUser) {
          const profileJson = localStorage.getItem(`xindong_profile_${likedUserId}`)
          const profile = profileJson ? JSON.parse(profileJson) : {}
          const avatar = localStorage.getItem(`xindong_avatar_${likedUserId}`)

          // 获取聊天记录
          const chatKey = `xindong_chat_${[userId, likedUserId].sort().join('_')}`
          const chatJson = localStorage.getItem(chatKey)
          const chatMessages = chatJson ? JSON.parse(chatJson) : []
          const lastMessage = chatMessages.length > 0 ? chatMessages[chatMessages.length - 1] : null

          // 模拟在线状态（实际应用中从服务器获取）
          const isOnline = Math.random() > 0.5

          mutualLikes.push({
            id: chatKey,
            matchId: likedUserId,
            otherUser: {
              id: likedUserId,
              nickname: profile.nickname || otherUser.nickname,
              avatar: avatar,
              isOnline,
            },
            lastMessage: lastMessage?.content || '开始聊天吧～',
            lastMessageAt: lastMessage?.timestamp || null,
            unreadCount: 0,
            matchScore: Math.floor(Math.random() * 20) + 80,
            createdAt: new Date().toISOString(),
          })
        }
      }
    })

    return mutualLikes
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && currentUser) {
      fetchConversations()
    }
  }, [mounted, currentUser, fetchConversations])

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
                  <Link href={`/chat/conversation?userId=${conv.matchId}&conversationId=${conv.id}`}>
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
