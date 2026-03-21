'use client'

import { useState, useRef, useEffect, use, useCallback } from 'react'
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

export default function ChatContent({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = use(params)
  const searchParams = useSearchParams()
  const urlConversationId = searchParams.get('conversationId')
  const { currentUser } = useAuth()

  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(urlConversationId)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isOtherTyping, setIsOtherTyping] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  
  // 常用表情
  const commonEmojis = ['😀', '😊', '😍', '🥰', '😘', '❤️', '💕', '💖', '💗', '💓', '💞', '💌', '💘', '💝', '✨', '🌟', '💫', '⭐', '🔥', '💯', '🎉', '🎊', '🥳', '😄', '😂', '🤣', '😁', '🤭', '😳', '🥺', '😘', '🤗', '😎', '🥰', '🤩', '😻', '💑', '👫', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💔', '❤️‍🔥', '❤️‍🩹']

  // 添加表情到输入框
  const addEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji)
    inputRef.current?.focus()
  }
  
  // 导出聊天记录
  const handleExportChat = () => {
    if (!currentUser || !otherUser || messages.length === 0) {
      alert('暂无聊天记录可导出')
      return
    }
    
    const exportMessages = messages
      .filter(m => m.type !== 'system')
      .map(m => ({
        timestamp: m.timestamp.toISOString(),
        sender: m.senderId === currentUser.id ? '我' : otherUser.nickname,
        content: m.text,
      }))
    
    const { exportChat } = require('@/lib/chat-export')
    exportChat(currentUser.nickname || '我', otherUser.nickname, exportMessages, 'txt')
  }
  
  // 清空聊天记录
  const clearChatHistory = () => {
    if (!currentUser || !matchId) return
    const chatKey = `xindong_chat_${[currentUser.id, matchId].sort().join('_')}`
    localStorage.removeItem(chatKey)
    setMessages([])
  }
  
  // 撤回消息（2分钟内）
  const handleRecallMessage = (messageId: string) => {
    const message = messages.find(m => m.id === messageId)
    if (!message || !currentUser) return
    
    // 只能撤回自己发的消息
    if (message.senderId !== currentUser.id) return
    
    // 检查是否在2分钟内
    const now = Date.now()
    const messageTime = message.timestamp.getTime()
    if (now - messageTime > 2 * 60 * 1000) {
      setError('超过2分钟无法撤回')
      setTimeout(() => setError(null), 2000)
      return
    }
    
    // 更新消息状态为已撤回
    const updatedMessages = messages.map(m => {
      if (m.id === messageId) {
        return { ...m, text: '消息已撤回', status: 'recalled' as const }
      }
      return m
    })
    
    setMessages(updatedMessages)
    
    // 保存到本地
    if (!currentUser || !matchId) return
    const chatKey = `xindong_chat_${[currentUser.id, matchId].sort().join('_')}`
    localStorage.setItem(chatKey, JSON.stringify(
      updatedMessages.map(m => ({ ...m, timestamp: m.timestamp.toISOString() }))
    ))
  }
  
  // 发送图片
  const handleSendImage = async () => {
    if (!currentUser || !otherUser) return
    
    try {
      const file = await selectImage()
      
      if (!isValidImageType(file)) {
        setError('不支持的图片格式')
        return
      }
      
      if (!isValidImageSize(file, 5)) {
        setError('图片大小不能超过5MB')
        return
      }
      
      // 压缩图片
      const compressedImage = await compressImage(file)
      
      const newMessage: Message = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        senderId: currentUser.id,
        text: compressedImage,
        timestamp: new Date(),
        status: 'sending',
        type: 'image'
      }
      
      setMessages(prev => [...prev, newMessage])
      saveMessageToLocal(newMessage)
      
      // 更新状态
      setTimeout(() => {
        setMessages(prev =>
          prev.map(m => m.id === newMessage.id ? { ...m, status: 'sent' as const } : m)
        )
      }, 500)
      
    } catch (err) {
      console.error('发送图片失败:', err)
      setError('发送图片失败')
    }
  }

  // 创建或获取会话
  const ensureConversation = useCallback(async () => {
    if (!currentUser || !matchId || conversationId) return conversationId

    try {
      const response = await fetch('/api/chat/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id,
        },
        body: JSON.stringify({
          targetUserId: matchId,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setConversationId(data.conversation.id)
        return data.conversation.id
      }
    } catch (err) {
      console.error('创建会话失败:', err)
    }
    return null
  }, [currentUser, matchId, conversationId])

  // 获取对方用户信息
  const fetchOtherUser = useCallback(async () => {
    if (!currentUser) return

    try {
      // 从 localStorage 获取用户信息
      const usersJson = localStorage.getItem('xindong_users')
      if (usersJson) {
        const users = JSON.parse(usersJson)
        const user = users.find((u: any) => u.id === matchId)
        if (user) {
          const profileJson = localStorage.getItem(`xindong_profile_${matchId}`)
          const profile = profileJson ? JSON.parse(profileJson) : {}
          const avatar = localStorage.getItem(`xindong_avatar_${matchId}`)

          setOtherUser({
            id: matchId,
            nickname: profile.nickname || user.nickname || '用户',
            age: profile.age || user.age || 25,
            city: profile.city || user.city || '未知',
            score: Math.floor(Math.random() * 20) + 80,
            isOnline: Math.random() > 0.5,
            avatar: avatar,
            lastActive: '刚刚在线'
          })
        }
      }
    } catch (err) {
      console.error('获取用户信息失败:', err)
    }
  }, [matchId, currentUser])

  // 获取消息列表
  const fetchMessages = useCallback(async () => {
    if (!currentUser || !matchId) return

    setIsLoading(true)

    try {
      // 使用 matchId 作为对方用户 ID（这是更可靠的方式）
      const otherUserId = otherUser?.id || matchId
      
      // 尝试从 API 获取 - 使用 userId1 和 userId2 参数
      const response = await fetch(`/api/chat/messages?userId1=${currentUser.id}&userId2=${otherUserId}`, {
        headers: {
          'X-User-Id': currentUser.id,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const apiMessages = (data.messages || []).map((m: any) => ({
          id: m.id,
          senderId: m.senderId || m.sender_id,
          text: m.text || m.content,
          timestamp: new Date(m.timestamp || m.created_at || m.createdAt),
          status: (m.status as 'sending' | 'sent' | 'read') || 'sent',
          type: (m.type as 'text' | 'image' | 'system') || 'text',
        }))
        setMessages(apiMessages)
        setIsLoading(false)
        return
      }

      // 从 localStorage 获取（后备方案）- 使用 matchId
      const chatKey = `xindong_chat_${[currentUser.id, matchId].sort().join('_')}`
      const chatJson = localStorage.getItem(chatKey)
      if (chatJson) {
        const localMessages = JSON.parse(chatJson)
        setMessages(localMessages.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        })))
      }
    } catch (err) {
      console.error('获取消息失败:', err)
    } finally {
      setIsLoading(false)
    }
  }, [currentUser, matchId, otherUser])

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputText.trim() || !currentUser || !matchId) return

    // 使用 matchId 作为接收者 ID（这是更可靠的方式）
    const receiverId = otherUser?.id || matchId

    const newMessage: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      senderId: currentUser.id,
      text: inputText,
      timestamp: new Date(),
      status: 'sending',
      type: 'text'
    }

    // 立即显示消息
    setMessages(prev => [...prev, newMessage])
    setInputText('')
    setShowSuggestions(false)
    
    // 触觉反馈
    sendMessageFeedback()

    // 清除错误
    setError(null)

    try {
      // 尝试通过 API 发送
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id,
        },
        body: JSON.stringify({
          senderId: currentUser.id,
          receiverId: receiverId,
          text: newMessage.text,
          type: 'text',
        }),
      })

      if (response.ok) {
        // 更新本地存储
        saveMessageToLocal(newMessage)
        setMessages(prev =>
          prev.map(m => m.id === newMessage.id ? { ...m, status: 'sent' as const } : m)
        )
        return
      }

      // 保存到 localStorage（后备方案）
      saveMessageToLocal(newMessage)

      // 更新状态
      setMessages(prev =>
        prev.map(m => m.id === newMessage.id ? { ...m, status: 'sent' as const } : m)
      )
    } catch (err) {
      console.error('发送消息失败:', err)
      // 离线模式：仍然保存消息
      saveMessageToLocal(newMessage)
      setMessages(prev =>
        prev.map(m => m.id === newMessage.id ? { ...m, status: 'sent' as const } : m)
      )
    }
  }

  // 保存消息到本地存储
  const saveMessageToLocal = (message: Message) => {
    if (!currentUser || !matchId) return
    // 使用 matchId 作为对方用户 ID（与发送消息保持一致）
    const chatKey = `xindong_chat_${[currentUser.id, matchId].sort().join('_')}`
    const chatJson = localStorage.getItem(chatKey)
    const chatMessages = chatJson ? JSON.parse(chatJson) : []
    chatMessages.push({
      ...message,
      timestamp: message.timestamp.toISOString(),
    })
    localStorage.setItem(chatKey, JSON.stringify(chatMessages))
  }

  // 重发失败的消息
  const handleRetry = (messageId: string) => {
    const message = messages.find(m => m.id === messageId)
    if (message && message.status === 'sending') {
      setInputText(message.text)
      setMessages(prev => prev.filter(m => m.id !== messageId))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }
  
  // 输入状态变化
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value)
    
    // 广播输入状态
    broadcastTypingStatus(true)
    
    // 清除之前的定时器
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }
    
    // 3秒后停止显示输入状态
    const timeout = setTimeout(() => {
      broadcastTypingStatus(false)
    }, 3000)
    setTypingTimeout(timeout)
  }
  
  // 广播输入状态
  const broadcastTypingStatus = (isTyping: boolean) => {
    if (!currentUser || !matchId) return
    localStorage.setItem(`xindong_typing_${currentUser.id}_${matchId}`, JSON.stringify({
      isTyping,
      timestamp: Date.now()
    }))
  }
  
  // 监听对方输入状态
  useEffect(() => {
    if (!matchId || !currentUser) return
    
    const checkTyping = () => {
      const typingJson = localStorage.getItem(`xindong_typing_${matchId}_${currentUser.id}`)
      if (typingJson) {
        const typing = JSON.parse(typingJson)
        // 只有5秒内的输入状态才有效
        if (typing.isTyping && Date.now() - typing.timestamp < 5000) {
          setIsOtherTyping(true)
        } else {
          setIsOtherTyping(false)
        }
      } else {
        setIsOtherTyping(false)
      }
    }
    
    const interval = setInterval(checkTyping, 1000)
    return () => clearInterval(interval)
  }, [matchId, currentUser])

  // 请求通知权限
  useEffect(() => {
    requestNotificationPermission()
  }, [])

  // 初始化会话
  useEffect(() => {
    ensureConversation()
  }, [])

  // 初始化
  useEffect(() => {
    fetchOtherUser()
    if (conversationId) {
      fetchMessages()
    }
  }, [conversationId, fetchOtherUser, fetchMessages])

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 定时刷新消息（简单轮询）
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages()
      // 检查消息已读状态
      checkReadStatus()
    }, 3000) // 每3秒刷新
    return () => clearInterval(interval)
  }, [fetchMessages])
  
  // 检查消息已读状态（从 Supabase 获取）
  const checkReadStatus = async () => {
    if (!currentUser || !matchId) return
    
    try {
      // 从 API 获取已读状态
      const response = await fetch(`/api/chat/read-status?userId=${matchId}&otherUserId=${currentUser.id}`, {
        headers: {
          'X-User-Id': currentUser.id,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.lastReadAt) {
          const lastReadTime = new Date(data.lastReadAt).getTime()
          
          // 更新消息状态为已读
          setMessages(prev => 
            prev.map(m => {
              if (m.senderId === currentUser.id && m.timestamp.getTime() <= lastReadTime && m.status !== 'read') {
                return { ...m, status: 'read' as const }
              }
              return m
            })
          )
        }
      }
    } catch (err) {
      console.error('检查已读状态失败:', err)
    }
  }
  
  // 标记消息为已读（当打开聊天时）
  const markMessagesAsRead = async () => {
    if (!currentUser || !matchId) return
    const now = new Date().toISOString()
    
    // 存储到本地（后备）
    localStorage.setItem(`xindong_last_read_${currentUser.id}_${matchId}`, now)
    localStorage.setItem(`xindong_read_${matchId}_${currentUser.id}`, now)
    
    // 同步到 Supabase（主要方式）
    try {
      await fetch('/api/chat/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id,
        },
        body: JSON.stringify({
          userId: currentUser.id,
          otherUserId: matchId,
          lastReadAt: now,
        }),
      })
    } catch (err) {
      console.error('标记已读失败:', err)
    }
  }
  
  // 进入聊天时标记已读
  useEffect(() => {
    markMessagesAsRead()
    // 离开时清除标记
    return () => {
      markMessagesAsRead()
    }
  }, [currentUser, matchId])

  // 定期检查对方是否已读我们的消息（从 Supabase 获取）
  useEffect(() => {
    if (!currentUser || !matchId) return

    const checkReadReceipt = async () => {
      try {
        // 从 API 获取对方已读状态
        const otherUserId = otherUser?.id || matchId
        const response = await fetch(`/api/chat/read-status?userId=${currentUser.id}&otherUserId=${otherUserId}`, {
          headers: {
            'X-User-Id': currentUser.id,
          },
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.lastReadAt) {
            const readTime = new Date(data.lastReadAt).getTime()
            setMessages(prev => 
              prev.map(m => {
                // 只更新我发送的消息，且时间早于对方已读时间
                if (m.senderId === currentUser.id && m.timestamp.getTime() <= readTime && m.status !== 'read') {
                  return { ...m, status: 'read' as const }
                }
                return m
              })
            )
          }
        }
      } catch (err) {
        console.error('检查已读回执失败:', err)
      }
    }

    // 立即检查一次
    checkReadReceipt()
    
    // 每3秒检查一次
    const interval = setInterval(checkReadReceipt, 3000)
    return () => clearInterval(interval)
  }, [currentUser, matchId, otherUser])

  // 话题建议
  const topicSuggestions = [
    { emoji: '🎬', text: '最近有什么好看的电影推荐吗？' },
    { emoji: '✈️', text: '你最想去的旅行目的地是哪里？' },
    { emoji: '🍜', text: '最喜欢吃什么类型的美食？' },
    { emoji: '📚', text: '平时喜欢看什么类型的书？' }
  ]

  const quickReplies = [
    '哈哈，我也觉得！',
    '这个话题很有意思！',
    '原来你也喜欢这个！',
    '那我们下次可以一起去！'
  ]

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
    <AnimatedBackground variant="romance" showFloatingHearts={false} showParticles={true}>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <FadeIn>
          <header className="bg-white/80 backdrop-blur-xl border-b border-rose-100/50 px-4 py-3 flex items-center">
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

              {/* 更多菜单 */}
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute top-16 right-4 bg-white rounded-xl shadow-xl py-2 min-w-[150px] z-50"
                  >
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
                        // 清空聊天记录
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
        </FadeIn>

        {/* Match Info Banner */}
        <FadeIn delay={0.1}>
          <div className="bg-gradient-to-r from-rose-50/90 to-pink-50/90 backdrop-blur-sm px-4 py-3 border-b border-rose-100/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <Sparkles className="w-4 h-4 text-rose-500 mr-2" />
                <span>你们已互相喜欢，尽情聊天吧！</span>
              </div>
            </div>
          </div>
        </FadeIn>

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

          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderId === currentUser?.id}
                onRetry={handleRetry}
                onRecall={handleRecallMessage}
              />
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div className="flex items-start" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-xs mr-2 shadow-md shadow-rose-500/20 overflow-hidden">
                {otherUser.avatar ? (
                  <img src={otherUser.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  otherUser.nickname[0]
                )}
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-rose-100/30">
                <div className="flex space-x-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-rose-300 rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Topic Suggestions */}
        <AnimatePresence>
          {showSuggestions && messages.length <= 1 && (
            <motion.div
              className="px-4 py-3 bg-gradient-to-r from-purple-50/90 to-indigo-50/90 backdrop-blur-sm border-t border-purple-100/50"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
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
                    className="px-3 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm text-gray-700 hover:bg-purple-100 hover:text-purple-700 transition-all shadow-sm border border-purple-100/50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {topic.emoji} {topic.text}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Replies */}
        {inputText.length === 0 && messages.length > 1 && (
          <motion.div
            className="px-4 py-2 border-t border-rose-100/50 bg-white/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex space-x-2 overflow-x-auto pb-1">
              {quickReplies.map((reply, index) => (
                <motion.button
                  key={index}
                  onClick={() => { setInputText(reply); inputRef.current?.focus(); }}
                  className="flex-shrink-0 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition-all shadow-sm border border-rose-100/50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {reply}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Input Area */}
        <div className="bg-white/80 backdrop-blur-xl border-t border-rose-100/50 px-4 py-3">
          {/* Emoji Picker */}
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 overflow-hidden"
              >
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg border border-rose-100/30">
                  <div className="grid grid-cols-10 gap-1.5">
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
                className={`p-2 transition-colors ${showEmojiPicker ? 'text-rose-500' : 'text-gray-400 hover:text-rose-500'}`}
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
                onChange={handleInputChange}
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
    </AnimatedBackground>
  )
}

function MessageBubble({ message, isOwn, onRetry, onRecall }: { message: Message; isOwn: boolean; onRetry?: (id: string) => void; onRecall?: (id: string) => void }) {
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
      <motion.div className="text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <span className="text-xs text-gray-500 bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm border border-rose-100/30">{message.text}</span>
      </motion.div>
    )
  }

  return (
    <motion.div
      className={`flex items-start ${isOwn ? 'flex-row-reverse' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={`max-w-[70%] relative ${isOwn ? 'ml-2' : 'mr-2'}`}
        onClick={() => setShowActions(!showActions)}
      >
        <div className={`px-4 py-3 rounded-2xl ${isOwn
            ? 'bg-gradient-to-br from-rose-500 to-pink-500 text-white rounded-br-none shadow-lg shadow-rose-500/20'
            : 'bg-white/80 backdrop-blur-sm text-gray-900 shadow-sm rounded-bl-none border border-rose-100/30'
          } ${message.status === 'sending' ? 'opacity-70' : ''}`}>

          {/* 发送中状态 */}
          {message.status === 'sending' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl z-10">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* 图片消息 */}
          {message.type === 'image' ? (
            <img 
              src={message.text} 
              alt="发送的图片" 
              className="max-w-full rounded-lg cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                window.open(message.text, '_blank')
              }}
            />
          ) : (
            <p className="whitespace-pre-wrap">{message.text}</p>
          )}
        </div>

        {/* 操作菜单 */}
        {showActions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`absolute bg-white rounded-lg shadow-lg py-1 z-10 ${isOwn ? 'right-0' : 'left-0'}`}
          >
            <button
              onClick={handleCopy}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
            >
              {copied ? '✅ 已复制' : '📋 复制'}
            </button>
            {message.status === 'sending' && onRetry && (
              <button
                onClick={() => onRetry(message.id)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
              >
                🔄 重试
              </button>
            )}
          </motion.div>
        )}

        <div className={`flex items-center mt-1 text-xs ${isOwn ? 'justify-end' : ''}`}>
          <span className="text-gray-400">{formatTime(message.timestamp)}</span>
          {isOwn && message.status !== 'sending' && (
            <span className="ml-1 flex items-center gap-0.5">
              {message.status === 'read' ? (
                <span className="text-blue-400 flex items-center" title="对方已读">
                  <span>✓</span><span>✓</span>
                </span>
              ) : (
                <span className="text-gray-400" title="已送达">✓</span>
              )}
            </span>
          )}
          {message.status === 'sending' && (
            <span className="ml-1 text-gray-400">发送中...</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
