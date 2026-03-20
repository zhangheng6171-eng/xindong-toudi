'use client'

import { useState, useRef, useCallback, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  ArrowLeft, Send, Image, Smile, MoreVertical, Phone, Video,
  ArrowRight, Check, CheckCheck, Copy, RefreshCw, Trash2,
  Download, X, ChevronDown, Sparkles, Loader2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AnimatedBackground, GlassCard, GradientButton, GradientText, FadeIn } from '@/components/animated-background'
import { useAuth } from '@/hooks/useAuth'
import { selectImage, isValidImageType, isValidImageSize, compressImage } from '@/lib/image-utils'
import { sendMessageFeedback, errorFeedback } from '@/lib/haptics'

// 消息类型
interface Message {
  id: string
  senderId: string
  text: string
  timestamp: Date
  status: 'sending' | 'sent' | 'read' | 'recalled'
  type: 'text' | 'image' | 'system'
}

// 对方用户信息
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const { currentUser, isLoading: authLoading } = useAuth()
  
  const userId = searchParams.get('userId')
  const currentUserId = currentUser?.id || 'local_user'
  
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isOtherTyping, setIsOtherTyping] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const [initialized, setInitialized] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [background, setBackground] = useState('romance')
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const backgrounds = {
    romance: 'from-rose-100/50 via-pink-100/50 to-purple-100/50',
    ocean: 'from-blue-100/50 via-cyan-100/50 to-teal-100/50',
    sunset: 'from-orange-100/50 via-rose-100/50 to-pink-100/50',
    mint: 'from-emerald-100/50 via-teal-100/50 to-cyan-100/50',
    lavender: 'from-purple-100/50 via-violet-100/50 to-indigo-100/50',
  }

  // 常用表情
  const commonEmojis = ['😀', '😊', '😍', '🥰', '😘', '❤️', '💕', '💖', '💗', '💓', '💞', '💌', '💘', '💝', '✨', '🌟', '💫', '⭐', '🔥', '💯', '🎉', '🎊', '🥳', '😄', '😂', '🤣', '😁', '🤭', '😳', '🥺', '😘', '🤗', '😎', '🥰', '🤩', '😻', '💑', '👫', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💔', '❤️🔥', '❤️🩹']

  const addEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji)
    inputRef.current?.focus()
  }

  // 获取对方用户信息
  useEffect(() => {
    if (!userId || initialized) return

    const fetchUserInfo = async () => {
      const urlNickname = searchParams.get('nickname')
      
      const basicUser: OtherUser = {
        id: userId,
        nickname: urlNickname || '心动对象',
        age: 26,
        city: '北京',
        score: 92,
        isOnline: true,
        avatar: null,
        lastActive: '在线'
      }
      
      try {
        const response = await fetch(`/api/users/${userId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.user) {
            basicUser.nickname = data.user.nickname || urlNickname || '心动对象'
            basicUser.age = data.user.age || 26
            basicUser.city = data.user.city || '北京'
            basicUser.avatar = data.user.avatar || null
          }
        }
      } catch (e) {
        console.error('Failed to fetch user info:', e)
      }
      
      setOtherUser(basicUser)
      setInitialized(true)
    }
    
    fetchUserInfo()
  }, [userId, searchParams, initialized])

  // 获取消息
  const fetchMessages = useCallback(async () => {
    if (!otherUser) return

    const sortedIds = [currentUserId, otherUser.id].sort()
    const chatKey = `xindong_chat_${sortedIds.join('_')}`
    
    const stored = localStorage.getItem(chatKey)
    let localMessages: Message[] = []
    
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
    
    try {
      const response = await fetch(`/api/chat/messages?userId1=${currentUserId}&userId2=${otherUser.id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.messages) {
          const cloudMessages = data.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
          
          setMessages(prev => {
            const currentMap = new Map<string, Message>()
            prev.forEach(m => currentMap.set(m.id, m))
            
            cloudMessages.forEach((cloudMsg: Message) => {
              if (!currentMap.has(cloudMsg.id)) {
                const isDuplicate = Array.from(currentMap.values()).some(existing => 
                  existing.senderId === cloudMsg.senderId &&
                  existing.text === cloudMsg.text &&
                  Math.abs(new Date(existing.timestamp).getTime() - new Date(cloudMsg.timestamp).getTime()) < 5000
                )
                if (!isDuplicate) {
                  currentMap.set(cloudMsg.id, cloudMsg)
                }
              }
            })
            
            const allMessages = Array.from(currentMap.values())
            allMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
            localStorage.setItem(chatKey, JSON.stringify(allMessages))
            return allMessages
          })
          return
        }
      }
    } catch (e) {
      console.error('Failed to fetch from API:', e)
    }
    
    setMessages(localMessages)
  }, [currentUserId, otherUser])

  // 发送消息
  const handleSendMessage = async () => {
    if (isSending || !inputText.trim() || !otherUser) return
    
    setIsSending(true)

    const newMessage: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      senderId: currentUserId,
      text: inputText,
      timestamp: new Date(),
      status: 'sending',
      type: 'text'
    }

    const messageText = inputText
    setInputText('')
    setShowSuggestions(false)
    sendMessageFeedback()

    const sortedIds = [currentUserId, otherUser.id].sort()
    const chatKey = `xindong_chat_${sortedIds.join('_')}`
    
    setMessages(prev => {
      if (prev.find(m => m.id === newMessage.id)) return prev
      const updated = [...prev, newMessage]
      localStorage.setItem(chatKey, JSON.stringify(updated))
      return updated
    })
    
    try {
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

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.message) {
          setMessages(prev => {
            const updated = prev.map(m => 
              m.id === newMessage.id 
                ? { ...m, id: data.message.id, status: 'sent' as const } 
                : m
            )
            localStorage.setItem(chatKey, JSON.stringify(updated))
            return updated
          })
        }
      } else {
        setMessages(prev => {
          const updated = prev.map(m => 
            m.id === newMessage.id ? { ...m, status: 'sent' as const } : m
          )
          localStorage.setItem(chatKey, JSON.stringify(updated))
          return updated
        })
      }
    } catch (e) {
      console.error('[SendMessage] Failed:', e)
      setMessages(prev => {
        const updated = prev.map(m => 
          m.id === newMessage.id ? { ...m, status: 'sent' as const } : m
        )
        localStorage.setItem(chatKey, JSON.stringify(updated))
        return updated
      })
    }
    
    const convKey = `xindong_conversations_${currentUserId}`
    const stored = localStorage.getItem(convKey)
    const conversations = stored ? JSON.parse(stored) : []
    const existingIndex = conversations.findIndex((c: any) => c.matchId === otherUser.id)
    const updatedConv = {
      id: chatKey,
      matchId: otherUser.id,
      otherUser: { id: otherUser.id, nickname: otherUser.nickname, avatar: otherUser.avatar },
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
    
    setTimeout(() => setIsSending(false), 300)
  }

  // 发送图片
  const handleSendImage = async () => {
    if (isSending || !otherUser) return

    try {
      setIsSending(true)
      
      const file = await selectImage()
      if (!file) { setIsSending(false); return }

      if (!isValidImageType(file)) {
        alert('请选择 JPG、PNG 或 WebP 格式的图片')
        setIsSending(false)
        return
      }

      if (!isValidImageSize(file, 3 * 1024 * 1024)) {
        alert('图片大小不能超过 3MB')
        setIsSending(false)
        return
      }

      const dataUrl = await compressImage(file, 300, 300, 0.5)
      
      const base64Length = dataUrl.length - 'data:image/jpeg;base64,'.length
      const sizeInMB = (base64Length * 0.75) / (1024 * 1024)
      
      if (sizeInMB > 1) {
        alert('图片过大，请选择更小的图片')
        setIsSending(false)
        return
      }
      
      const newMessage: Message = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        senderId: currentUserId,
        text: dataUrl,
        timestamp: new Date(),
        status: 'sending',
        type: 'image'
      }

      const sortedIds = [currentUserId, otherUser.id].sort()
      const chatKey = `xindong_chat_${sortedIds.join('_')}`

      setMessages(prev => {
        if (prev.find(m => m.id === newMessage.id)) return prev
        const updated = [...prev, newMessage]
        try { localStorage.setItem(chatKey, JSON.stringify(updated)) } catch {}
        return updated
      })

      try {
        const response = await fetch('/api/chat/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderId: currentUserId,
            receiverId: otherUser.id,
            text: dataUrl,
            type: 'image'
          })
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.message) {
            setMessages(prev => {
              const updated = prev.map(m => 
                m.id === newMessage.id 
                  ? { ...m, id: data.message.id, status: 'sent' as const } 
                  : m
              )
              localStorage.setItem(chatKey, JSON.stringify(updated))
              return updated
            })
          }
        } else {
          setMessages(prev => {
            const updated = prev.map(m => 
              m.id === newMessage.id ? { ...m, status: 'sent' as const } : m
            )
            localStorage.setItem(chatKey, JSON.stringify(updated))
            return updated
          })
        }
      } catch (e) {
        setMessages(prev => {
          const updated = prev.map(m => 
            m.id === newMessage.id ? { ...m, status: 'sent' as const } : m
          )
          localStorage.setItem(chatKey, JSON.stringify(updated))
          return updated
        })
      }

    } catch (error) {
      console.error('Failed to send image:', error)
      alert('图片发送失败，请重试')
    } finally {
      setTimeout(() => setIsSending(false), 300)
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
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, status: 'recalled' as const, text: '消息已撤回' } : m
    ))
  }

  // 话题推荐
  const topicSuggestions = [
    { text: '你好，很高兴认识你！', icon: '👋' },
    { text: '你平时喜欢做什么呢？', icon: '😊' },
    { text: '最近有什么有趣的事吗？', icon: '✨' },
    { text: '你喜欢什么类型的电影？', icon: '🎬' },
  ]

  // 初始化
  useEffect(() => {
    if (initialized && otherUser) {
      fetchMessages()
    }
  }, [initialized, otherUser, fetchMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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

  const formatTime = (date: Date) => date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className={`h-screen flex flex-col bg-gradient-to-br ${backgrounds[background as keyof typeof backgrounds]}`}>
      {/* 图片预览 */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={() => setSelectedImage(null)}
          >
            <button className="absolute top-4 right-4 p-2 text-white/80 hover:text-white">
              <X className="w-8 h-8" />
            </button>
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={selectedImage}
              alt="预览"
              className="max-w-[90vw] max-h-[90vh] object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-4 py-3 flex items-center">
        <Link href="/chat" className="p-2 -ml-2 text-gray-600 hover:text-rose-500 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        
        <div className="flex-1 flex items-center gap-3 ml-2">
          <div className="relative">
            {otherUser.avatar ? (
              <img src={otherUser.avatar} alt={otherUser.nickname} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                {otherUser.nickname[0]}
              </div>
            )}
            {otherUser.isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>
          
          <div>
            <h3 className="font-bold text-gray-900">{otherUser.nickname}</h3>
            <p className="text-xs text-gray-500">{otherUser.isOnline ? '在线' : otherUser.lastActive}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button className="p-2 text-gray-400 hover:text-rose-500 transition-colors">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-rose-500 transition-colors">
            <Video className="w-5 h-5" />
          </button>
          <button onClick={() => setShowMenu(!showMenu)} className="p-2 text-gray-400 hover:text-rose-500 transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 菜单 */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 right-4 bg-white rounded-xl shadow-xl py-2 z-20 min-w-[160px]"
          >
            {Object.entries(backgrounds).map(([key, _]) => (
              <button
                key={key}
                onClick={() => { setBackground(key); setShowMenu(false); }}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${background === key ? 'text-rose-500 font-medium' : 'text-gray-700'}`}
              >
                {key === 'romance' && '💕 浪漫'}
                {key === 'ocean' && '🌊 海洋'}
                {key === 'sunset' && '🌅 日落'}
                {key === 'mint' && '🌿 薄荷'}
                {key === 'lavender' && '💜 薰衣草'}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

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

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.senderId === currentUserId}
            onRetry={handleRetry}
            onRecall={handleRecallMessage}
            onImageClick={message.type === 'image' ? () => setSelectedImage(message.text) : undefined}
          />
        ))}

        {isOtherTyping && (
          <div className="flex items-center text-gray-400 text-sm">
            <motion.div className="flex space-x-1 mr-2" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}>
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
              <button onClick={() => setShowSuggestions(false)} className="text-gray-400 hover:text-gray-600">
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {topicSuggestions.map((topic, index) => (
                <motion.button
                  key={index}
                  onClick={() => { setInputText(topic.text); inputRef.current?.focus(); }}
                  className="px-3 py-2 bg-white/80 rounded-full text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors shadow-sm border border-gray-200/50"
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
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 px-4 py-2"
          >
            <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto">
              {commonEmojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => addEmoji(emoji)}
                  className="w-8 h-8 text-lg hover:bg-gray-100 rounded transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 text-red-600 text-sm text-center">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">关闭</button>
        </div>
      )}

      {/* Input */}
      <div className="bg-white/80 backdrop-blur-xl border-t border-gray-200/50 px-4 py-3">
        <div className="flex items-end space-x-3">
          <div className="flex space-x-2">
            <motion.button
              onClick={handleSendImage}
              disabled={isSending}
              className="p-2 text-gray-400 hover:text-rose-500 transition-colors disabled:opacity-50"
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
              className="w-full px-4 py-3 bg-gray-100/80 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-rose-300 focus:bg-white transition-all border border-transparent focus:border-rose-200"
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>

          <motion.button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isSending}
            className="p-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-500/30"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </motion.button>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message, isOwn, onRetry, onRecall, onImageClick }: { 
  message: Message; 
  isOwn: boolean; 
  onRetry?: (id: string) => void;
  onRecall?: (id: string) => void;
  onImageClick?: () => void;
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
          <motion.div 
            whileTap={{ scale: 0.95 }}
            className="cursor-pointer"
            onClick={onImageClick}
          >
            <img 
              src={message.text} 
              alt="图片消息" 
              className="rounded-2xl shadow-lg max-w-full hover:opacity-90 transition-opacity"
              style={{ maxHeight: '300px' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" fill="%239ca3af" font-size="12"%3E图片加载失败%3C/text%3E%3C/svg%3E'
              }}
            />
          </motion.div>
          <div className="flex items-center mt-1">
            <span className="text-xs text-gray-400">{formatTime(message.timestamp)}</span>
            {isOwn && (
              <span className="text-xs text-gray-400 ml-1">
                {message.status === 'sending' && '发送中...'}
                {message.status === 'sent' && <CheckCheck className="w-3 h-3" />}
                {message.status === 'read' && <CheckCheck className="w-3 h-3 text-blue-500" />}
              </span>
            )}
          </div>
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

          {message.status === 'recalled' ? (
            <span className="text-gray-400 text-sm italic">{message.text}</span>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
          )}
        </div>

        <div className={`flex items-center mt-1 space-x-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-gray-400">{formatTime(message.timestamp)}</span>
          {isOwn && (
            <span className="text-xs text-gray-400">
              {message.status === 'sending' && '发送中...'}
              {message.status === 'sent' && <CheckCheck className="w-3 h-3" />}
              {message.status === 'read' && <CheckCheck className="w-3 h-3 text-blue-500" />}
            </span>
          )}
        </div>

        <AnimatePresence>
          {showActions && message.status !== 'recalled' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`absolute ${isOwn ? 'right-0' : 'left-0'} top-full mt-2 bg-white rounded-lg shadow-xl py-1 min-w-[120px] z-10`}
            >
              <button onClick={(e) => { e.stopPropagation(); handleCopy(); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-gray-700">
                {copied ? '✓ 已复制' : '复制'}
              </button>
              {isOwn && message.status !== 'sending' && (
                <button onClick={(e) => { e.stopPropagation(); onRecall?.(message.id); setShowActions(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-gray-700">
                  撤回
                </button>
              )}
              {message.status === 'sending' && (
                <button onClick={(e) => { e.stopPropagation(); onRetry?.(message.id); setShowActions(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-gray-700">
                  重试
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
