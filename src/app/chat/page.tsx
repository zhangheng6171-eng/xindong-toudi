'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, MessageCircle, Star, Search, Send } from 'lucide-react'
import { AnimatedBackground, GlassCard, GradientText, FadeIn } from '@/components/animated-background'
import { useAuth } from '@/hooks/useAuth'

// 模拟聊天数据
const mockChats = [
  {
    id: '1',
    nickname: '小雨',
    avatar: null,
    lastMessage: '周末有空一起去看展吗？',
    time: '刚刚',
    unread: 2,
    online: true,
  },
  {
    id: '2', 
    nickname: '阿杰',
    avatar: null,
    lastMessage: '好的，那我们周三见！',
    time: '10分钟前',
    unread: 0,
    online: false,
  },
  {
    id: '3',
    nickname: '小美',
    avatar: null,
    lastMessage: '你发的那个餐厅看起来很不错～',
    time: '1小时前',
    unread: 1,
    online: true,
  },
]

export default function ChatListPage() {
  const { currentUser, isLoading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  if (isLoading || !mounted) {
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

  return (
    <AnimatedBackground variant="romance" showFloatingHearts={false}>
      <div className="min-h-screen pb-20">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/50">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <h1 className="text-xl font-bold text-gray-900 text-center">消息</h1>
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

          {/* 聊天列表 */}
          <div className="space-y-3">
            {mockChats.length > 0 ? (
              mockChats.map((chat, index) => (
                <FadeIn key={chat.id} delay={index * 0.1}>
                  <Link href={`/chat/${chat.id}`}>
                    <GlassCard className="p-4 hover:shadow-lg transition-all cursor-pointer" hover={true}>
                      <div className="flex items-center gap-4">
                        {/* 头像 */}
                        <div className="relative flex-shrink-0">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-xl font-bold">
                            {chat.nickname[0]}
                          </div>
                          {chat.online && (
                            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                          )}
                        </div>
                        
                        {/* 信息 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-gray-900">{chat.nickname}</h3>
                            <span className="text-xs text-gray-400">{chat.time}</span>
                          </div>
                          <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                        </div>

                        {/* 未读标记 */}
                        {chat.unread > 0 && (
                          <div className="flex-shrink-0 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {chat.unread}
                          </div>
                        )}
                      </div>
                    </GlassCard>
                  </Link>
                </FadeIn>
              ))
            ) : (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">暂无消息</h3>
                <p className="text-gray-500">匹配成功后就可以开始聊天啦～</p>
                <Link 
                  href="/match" 
                  className="inline-block mt-4 px-6 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-medium rounded-full"
                >
                  去看看匹配
                </Link>
              </div>
            )}
          </div>

          {/* 空状态提示 */}
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
