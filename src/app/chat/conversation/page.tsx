'use client'

import { useState, useRef, useEffect, useCallback, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Image, Mic, ArrowLeft, Smile, MoreVertical,
  Heart, Sparkles, ChevronDown, Phone, Video, RefreshCw, Paperclip
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  AnimatedBackground,
  FadeIn
} from '@/components/animated-background'
import { useAuth } from '@/hooks/useAuth'
import { requestNotificationPermission, notifyNewMessage } from '@/lib/notifications'
import { compressImage, selectImage, isValidImageType, isValidImageSize } from '@/lib/image-utils'
import { sendMessageFeedback, receiveMessageFeedback, errorFeedback } from '@/lib/haptics'

interface Message {
  id: string
  senderId: string
  text: string
  timestamp: Date
  status: 'sending' | 'sent' | 'read' | 'recalled'
  type: 'text' | 'image' | 'system'
}

interface OtherUser {
  id: string
  nickname: string
  age: number
  city: string
  score: number
  isOnline: boolean
  avatar: string | null
  lastActive: string
}

function ConversationContent() {
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')
  const { currentUser, isLoading: authLoading } = useAuth()

  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isOtherTyping, setIsOtherTyping] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const [initialized, setInitialized] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  
  // 获取当前用户ID（如果未登录则使用临时ID）
  const currentUserId = currentUser?.id || 'guest_user'
  
  const commonEmojis = ['😀', '😊', '😍', '🥰', '😘', '❤️', '💕', '💖', '💗', '💓', '💞', '💌', '💘', '💝', '✨', '🌟', '💫', '⭐', '🔥', '💯', '🎉', '🎊', '🥳', '😄', '😂', '🤣', '😁', '🤭', '😳', '🥺', '😘', '🤗', '😎', '🥰', '🤩', '😻', '💑', '👫', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💔', '❤️🔥', '❤️🩹']

  const addEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji)
    inputRef.current?.focus()
  }
  
  const [background, setBackground] = useState<string>('romance')

  const backgrounds = {
    romance: 'from-rose-100/50 via-pink-100/50 to-purple-100/50',
    ocean: 'from-blue-100/50 via-cyan-100/50 to-teal-100/50',
    sunset: 'from-orange-100/50 via-rose-100/50 to-pink-100/50',
    mint: 'from-emerald-100/50 via-teal-100/50 to-cyan-100/50',
    lavender: 'from-purple-100/50 via-violet-100/50 to-indigo-100/50',
  }

  // 获取对方用户信息 - 只在初始化时调用一次
  useEffect(() => {
    if (!userId || initialized) return

    // 从localStorage获取用户信息
    const usersJson = localStorage.getItem('xindong_users')
    const users = usersJson ? JSON.parse(usersJson) : []
    const userProfile = users.find((u: any) => u.id === userId)
    
    // 从URL参数获取昵称
    const urlNickname = searchParams.get('nickname')
    
    const user: OtherUser = {
      id: userId,
      nickname: urlNickname || userProfile?.nickname || '心动对象',
      age: userProfile?.age || 26,
      city: userProfile?.city || '北京',
      score: userProfile?.matchScore || 92,
      isOnline: true,
      avatar: userProfile?.avatar || null,
      lastActive: '在线'
    }
    
    setOtherUser(user)
    setInitialized(true)
  }, [userId, searchParams, initialized])

  // 获取消息
  const fetchMessages = useCallback(async () => {
    if (!otherUser) return

    // 使用固定的key格式确保消息互通
    const sortedIds = [currentUserId, otherUser.id].sort()
    const chatKey = `xindong_chat_${sortedIds.join('_')}`
    
    // 先从 localStorage 获取本地消息
    const stored = localStorage.getItem(chatKey)
    let localMessages = []
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        localMessages = parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }))
      } catch (e) {
        console.error('Failed to parse messages:', e)
      }
    }
    
    // 尝试从 API 获取云端消息
    try {
      const response = await fetch(`/api/chat/messages?userId1=${currentUserId}&userId2=${otherUser.id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.messages) {
          // 合并本地和云端消息
          const cloudMessages = data.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
          
          // 去重合并
          const allMessages = [...localMessages]
          cloudMessages.forEach((cm: Message) => {
            if (!allMessages.find(lm => lm.id === cm.id)) {
              allMessages.push(cm)
            }
          })
          
          // 按时间排序
          allMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
          
          setMessages(allMessages)
          
          // 更新 localStorage
          localStorage.setItem(chatKey, JSON.stringify(allMessages))
          return
        }
      }
    } catch (e) {
      console.error('Failed to fetch from API:', e)
    }
    
    // API 失败，使用本地消息
    setMessages(localMessages)
  }, [currentUserId, otherUser])

  // 确保会话存在
  const ensureConversation = useCallback(async () => {
    if (!otherUser) return

    const convKey = `xindong_conversations_${currentUserId}`
    const stored = localStorage.getItem(convKey)
    const conversations = stored ? JSON.parse(stored) : []
    
    const existingConv = conversations.find((c: any) => c.matchId === otherUser.id)
    
    if (!existingConv) {
      const newConv = {
        id: `conv_${Date.now()}`,
        matchId: otherUser.id,
        otherUser: {
          id: otherUser.id,
          nickname: otherUser.nickname,
          avatar: otherUser.avatar
        },
        lastMessage: null,
        lastMessageAt: null,
        unreadCount: 0,
        matchScore: otherUser.score,
        createdAt: new Date().toISOString()
      }
      conversations.unshift(newConv)
      localStorage.setItem(convKey, JSON.stringify(conversations))
    }
    
    setConversationId(existingConv?.id || `conv_${Date.now()}`)
  }, [currentUserId, otherUser])

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputText.trim() || !otherUser) return

    const newMessage: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      senderId: currentUserId,
      text: inputText,
      timestamp: new Date(),
      status: 'sending',
      type: 'text'
    }

    // 添加到UI
    setMessages(prev => [...prev, newMessage])
    const messageText = inputText
    setInputText('')
    setShowSuggestions(false)
    
    sendMessageFeedback()

    // 使用固定的key格式确保消息互通
    const sortedIds = [currentUserId, otherUser.id].sort()
    const chatKey = `xindong_chat_${sortedIds.join('_')}`
    
    // 先保存到 localStorage（本地备份）
    const localMessages = [...messages, newMessage]
    localStorage.setItem(chatKey, JSON.stringify(localMessages))
    
    // 尝试发送到 API（云端同步）
    try {
      console.log('[SendMessage] Sending to API:', {
        senderId: currentUserId,
        receiverId: otherUser.id,
        text: messageText
      })
      
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUserId,
          receiverId: otherUser.id,
          text: messageText,
          type: 'text'
        })
      })
      
      console.log('[SendMessage] API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('[SendMessage] API response data:', data)
        // API 发送成功，更新消息状态
        setMessages(prev => {
          const updated = prev.map(m => 
            m.id === newMessage.id ? { ...m, status: 'sent' as const } : m
          )
          localStorage.setItem(chatKey, JSON.stringify(updated))
          return updated
        })
      } else {
        const errorText = await response.text()
        console.error('[SendMessage] API failed:', errorText)
        // API 失败，仍然标记为已发送（本地存储可用）
        setMessages(prev => {
          const updated = prev.map(m => 
            m.id === newMessage.id ? { ...m, status: 'sent' as const } : m
          )
          localStorage.setItem(chatKey, JSON.stringify(updated))
          return updated
        })
      }
    } catch (e) {
      console.error('[SendMessage] Failed to send via API:', e)
      // 网络错误，仍然标记为已发送（本地存储可用）
      setMessages(prev => {
        const updated = prev.map(m => 
          m.id === newMessage.id ? { ...m, status: 'sent' as const } : m
        )
        localStorage.setItem(chatKey, JSON.stringify(updated))
        return updated
      })
    }
    
    // 更新会话列表
    const convKey = `xindong_conversations_${currentUserId}`
    const stored = localStorage.getItem(convKey)
    const conversations = stored ? JSON.parse(stored) : []
    
    const existingIndex = conversations.findIndex((c: any) => c.matchId === otherUser.id)
    const updatedConv = {
      id: chatKey,
      matchId: otherUser.id,
      otherUser: {
        id: otherUser.id,
        nickname: otherUser.nickname,
        avatar: otherUser.avatar
      },
      lastMessage: messageText,
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
      matchScore: otherUser.score,
      createdAt: new Date().toISOString(),
    }
    
    if (existingIndex >= 0) {
      conversations[existingIndex] = updatedConv
    } else {
      conversations.unshift(updatedConv)
    }
    localStorage.setItem(convKey, JSON.stringify(conversations))
  }

  // 发送图片
  const handleSendImage = async () => {
    if (!otherUser) return

    try {
      const file = await selectImage()
      if (!file) return

      if (!isValidImageType(file)) {
        alert('请选择 JPG、PNG 或 WebP 格式的图片')
        return
      }

      if (!isValidImageSize(file, 5 * 1024 * 1024)) {
        alert('图片大小不能超过 5MB')
        return
      }

      const dataUrl = await compressImage(file, 800, 0.8)
      
      const newMessage: Message = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        senderId: currentUserId,
        text: dataUrl,
        timestamp: new Date(),
        status: 'sent',
        type: 'image'
      }

      setMessages(prev => [...prev, newMessage])
      
      // 使用固定的key格式
      const sortedIds = [currentUserId, otherUser.id].sort()
      const chatKey = `xindong_chat_${sortedIds.join('_')}`
      const updatedMessages = [...messages, newMessage]
      localStorage.setItem(chatKey, JSON.stringify(updatedMessages))
    } catch (error) {
      console.error('Failed to send image:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleRetry = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId)
    if (!message) return

    errorFeedback()
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, status: 'sending' } : m
    ))

    setTimeout(() => {
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, status: 'sent' } : m
      ))
    }, 1000)
  }

  const handleRecallMessage = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId)
    if (!message) return

    const now = Date.now()
    const messageTime = new Date(message.timestamp).getTime()
    if (now - messageTime > 2 * 60 * 1000) {
      alert('消息超过2分钟，无法撤回')
      return
    }

    setMessages(prev => {
      const updated = prev.map(m => 
        m.id === messageId ? { ...m, status: 'recalled' as const, text: '你撤回了一条消息' } : m
      )
      
      if (otherUser) {
        const sortedIds = [currentUserId, otherUser.id].sort()
        const chatKey = `xindong_chat_${sortedIds.join('_')}`
        localStorage.setItem(chatKey, JSON.stringify(updated))
      }
      return updated
    })
  }

  const clearChatHistory = () => {
    if (!otherUser) return

    const sortedIds = [currentUserId, otherUser.id].sort()
    const chatKey = `xindong_chat_${sortedIds.join('_')}`
    localStorage.removeItem(chatKey)
    setMessages([])
  }

  const handleExportChat = () => {
    if (!otherUser || messages.length === 0) {
      alert('暂无聊天记录可导出')
      return
    }
    
    const exportContent = messages
      .filter(m => m.type !== 'system')
      .map(m => `[${new Date(m.timestamp).toLocaleString('zh-CN')}] ${m.senderId === currentUserId ? '我' : otherUser.nickname}: ${m.text}`)
      .join('\n')

    const blob = new Blob([exportContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `聊天记录_${otherUser.nickname}_${new Date().toLocaleDateString('zh-CN')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // 话题推荐
  const topicSuggestions = [
    { text: '你好，很高兴认识你！', icon: '👋' },
    { text: '你平时喜欢做什么呢？', icon: '😊' },
    { text: '最近有什么有趣的事吗？', icon: '✨' },
    { text: '你喜欢什么类型的电影？', icon: '🎬' },
  ]

  // 请求通知权限
  useEffect(() => {
    requestNotificationPermission()
  }, [])

  // 初始化会话和消息
  useEffect(() => {
    if (initialized && otherUser) {
      ensureConversation()
      fetchMessages()
    }
  }, [initialized, otherUser, ensureConversation, fetchMessages])

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 定时刷新消息（每10秒）
  useEffect(() => {
    if (!otherUser) return
    const interval = setInterval(fetchMessages, 10000)
    return () => clearInterval(interval)
  }, [otherUser, fetchMessages])

  if (!userId) {
    return (
      <AnimatedBackground variant="romance" showFloatingHearts={false}>
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">未找到用户</h1>
          <p className="text-gray-500 mb-4">请从会话列表或用户详情页进入聊天</p>
          <Link href="/chat" className="px-4 py-2 bg-rose-500 text-white rounded-full">
            返回会话列表
          </Link>
        </div>
      </AnimatedBackground>
    )
  }

  if (!otherUser) {
    return (
      <AnimatedBackground variant="romance" showFloatingHearts={false}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-rose-500">加载中...</div>
        </div>
      </AnimatedBackground>
    )
  }

  return (
    <div className={`h-screen flex flex-col bg-gradient-to-br ${backgrounds[background as keyof typeof backgrounds]}`}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-4 py-3 flex items-center">
        <Link href="/chat" className="p-2 -ml-2 text-gray-600 hover:text-rose-500 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>

        <div className="flex-1 flex items-center ml-2">
          <div className="relative">
            <motion.div
              className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-rose-500/30 overflow-hidden"
              whileHover={{ scale: 1.05 }}
            >
              {otherUser.avatar ? (
                <img src={otherUser.avatar} alt={otherUser.nickname} className="w-full h-full object-cover" />
              ) : (
                otherUser.nickname[0]
              )}
            </motion.div>
            {otherUser.isOnline && (
              <motion.div
                className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>

          <div className="ml-3">
            <div className="flex items-center">
              <h1 className="font-bold text-gray-900">{otherUser.nickname}</h1>
              <span className="ml-2 text-xs bg-gradient-to-r from-rose-500 to-pink-500 text-white px-2 py-0.5 rounded-full shadow-sm">
                {otherUser.score}% 匹配
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {otherUser.isOnline ? (
                <span className="text-green-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  在线
                </span>
              ) : otherUser.lastActive}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchMessages}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-rose-500 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-gray-400 hover:text-rose-500 transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute top-16 right-4 bg-white rounded-xl shadow-xl py-2 min-w-[150px] z-50"
              >
                <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                  聊天背景
                </div>
                <div className="flex px-2 py-2 gap-2">
                  {Object.keys(backgrounds).map((bg) => (
                    <button
                      key={bg}
                      onClick={() => setBackground(bg)}
                      className={`w-6 h-6 rounded-full bg-gradient-to-br ${backgrounds[bg as keyof typeof backgrounds]} ${
                        background === bg ? 'ring-2 ring-rose-500 ring-offset-2' : ''
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => {
                    handleExportChat()
                    setShowMenu(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-rose-50 text-gray-700"
                >
                  📥 导出聊天记录
                </button>
                <button
                  onClick={() => {
                    if (confirm('确定要清空聊天记录吗？此操作不可恢复。')) {
                      clearChatHistory()
                    }
                    setShowMenu(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600"
                >
                  🗑️ 清空聊天记录
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Match Info Banner */}
      <div className="bg-gradient-to-r from-rose-50/90 to-pink-50/90 backdrop-blur-sm px-4 py-3 border-b border-rose-100/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600">
            <Sparkles className="w-4 h-4 text-rose-500 mr-2" />
            <span>你们已互相喜欢，尽情聊天吧！</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 text-red-600 text-sm text-center">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">关闭</button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* 系统消息 */}
        <MessageBubble
          message={{
            id: 'system-1',
            senderId: 'system',
            text: '🎉 你们匹配成功！开始聊天吧～',
            timestamp: new Date(Date.now() - 3600000),
            status: 'read',
            type: 'system'
          }}
          isOwn={false}
        />

        {/* 消息列表 */}
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.senderId === currentUserId}
            onRetry={handleRetry}
            onRecall={handleRecallMessage}
          />
        ))}

        {/* 对方正在输入 */}
        {isOtherTyping && (
          <div className="flex items-center text-gray-400 text-sm">
            <motion.div
              className="flex space-x-1 mr-2"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div className="w-2 h-2 bg-gray-400 rounded-full" />
              <div className="w-2 h-2 bg-gray-400 rounded-full" />
              <div className="w-2 h-2 bg-gray-400 rounded-full" />
            </motion.div>
            <span>正在输入...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 话题推荐 */}
      <AnimatePresence>
        {showSuggestions && messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-4 py-3 bg-white/80 backdrop-blur-sm border-t border-gray-200/50"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">💡 话题推荐</span>
              <button onClick={() => setShowSuggestions(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {topicSuggestions.map((topic, index) => (
                <motion.button
                  key={index}
                  onClick={() => { setInputText(topic.text); inputRef.current?.focus(); }}
                  className="px-3 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors shadow-sm border border-gray-200/50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {topic.icon} {topic.text}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 表情选择器 */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-4 py-3 bg-white/80 backdrop-blur-sm border-t border-gray-200/50"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">😊 常用表情</span>
              <button onClick={() => setShowEmojiPicker(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-10 gap-1">
              {commonEmojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => addEmoji(emoji)}
                  className="w-8 h-8 text-xl hover:bg-rose-50 rounded-lg transition-colors flex items-center justify-center"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="bg-white/80 backdrop-blur-xl border-t border-gray-200/50 px-4 py-3">
        <div className="flex items-end space-x-3">
          <div className="flex space-x-2">
            <motion.button
              onClick={handleSendImage}
              className="p-2 text-gray-400 hover:text-rose-500 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title="发送图片"
            >
              <Image className="w-6 h-6" />
            </motion.button>
            <motion.button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-gray-400 hover:text-rose-500 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Smile className="w-6 h-6" />
            </motion.button>
          </div>

          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="发送消息..."
              rows={1}
              className="w-full px-4 py-3 bg-gray-100/80 backdrop-blur-sm rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-rose-300 focus:bg-white transition-all border border-transparent focus:border-rose-200"
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>

          <motion.button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className="p-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-500/30"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message, isOwn, onRetry, onRecall }: { 
  message: Message; 
  isOwn: boolean; 
  onRetry?: (id: string) => void;
  onRecall?: (id: string) => void;
}) {
  const [showActions, setShowActions] = useState(false)
  const [copied, setCopied] = useState(false)

  const formatTime = (date: Date) => date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  if (message.type === 'system') {
    return (
      <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <span className="inline-block px-4 py-2 bg-gray-100/80 backdrop-blur-sm rounded-full text-sm text-gray-500">
          {message.text}
        </span>
      </motion.div>
    )
  }

  if (message.type === 'image') {
    return (
      <motion.div
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
          <img 
            src={message.text} 
            alt="图片消息" 
            className="rounded-2xl shadow-lg max-w-full"
            style={{ maxHeight: '300px' }}
          />
          <p className={`text-xs text-gray-400 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
            {formatTime(message.timestamp)}
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div
        className={`max-w-[70%] relative ${isOwn ? 'ml-2' : 'mr-2'}`}
        onClick={() => setShowActions(!showActions)}
      >
        <div className={`px-4 py-3 rounded-2xl ${isOwn
            ? 'bg-gradient-to-br from-rose-500 to-pink-500 text-white rounded-br-none shadow-lg shadow-rose-500/20'
            : 'bg-white/80 backdrop-blur-sm text-gray-900 shadow-sm rounded-bl-none border border-rose-100/30'
          } ${message.status === 'sending' ? 'opacity-70' : ''}`}>

          {/* 撤回消息显示 */}
          {message.status === 'recalled' ? (
            <span className="text-gray-400 text-sm italic">{message.text}</span>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
          )}
        </div>

        {/* 时间和状态 */}
        <div className={`flex items-center mt-1 space-x-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-gray-400">{formatTime(message.timestamp)}</span>
          {isOwn && message.status === 'sending' && (
            <span className="text-xs text-gray-400">发送中...</span>
          )}
          {isOwn && message.status === 'sent' && (
            <span className="text-xs text-green-500">✓</span>
          )}
          {isOwn && message.status === 'read' && (
            <span className="text-xs text-blue-500">✓✓</span>
          )}
        </div>

        {/* 操作菜单 */}
        <AnimatePresence>
          {showActions && message.status !== 'recalled' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`absolute ${isOwn ? 'right-0' : 'left-0'} top-full mt-2 bg-white rounded-lg shadow-xl py-1 min-w-[120px] z-10`}
            >
              <button
                onClick={(e) => { e.stopPropagation(); handleCopy(); }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-gray-700"
              >
                {copied ? '✓ 已复制' : '复制'}
              </button>
              {isOwn && message.status === 'sending' && onRetry && (
                <button
                  onClick={(e) => { e.stopPropagation(); onRetry(message.id); setShowActions(false); }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-gray-700"
                >
                  重新发送
                </button>
              )}
              {isOwn && message.status !== 'sending' && onRecall && (
                <button
                  onClick={(e) => { e.stopPropagation(); onRecall(message.id); setShowActions(false); }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600"
                >
                  撤回消息
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default function ConversationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-100/50 via-pink-100/50 to-purple-100/50">
        <div className="animate-pulse text-rose-500">加载中...</div>
      </div>
    }>
      <ConversationContent />
    </Suspense>
  )
}
