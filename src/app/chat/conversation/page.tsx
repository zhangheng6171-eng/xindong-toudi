'use client'

import { useState, useRef, useCallback, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  ArrowLeft, Send, Image, Smile, MoreVertical, Phone, Video,
  ArrowRight, Check, CheckCheck, Copy, RefreshCw, Trash2,
  Download, X, ChevronDown, Sparkles, Loader2, Circle
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
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'recalled'
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
  lastActiveTime: Date | null
}

// 在线状态管理
const ONLINE_THRESHOLD_MS = 30000 // 30秒内活跃视为在线

// 广播频道 - 用于跨标签页通信
const ONLINE_STATUS_CHANNEL = 'xindong_online_status'
const CHAT_CHANNEL = 'xindong_chat_messages'

// 在线状态事件
interface OnlineStatusEvent {
  type: 'online' | 'offline'
  userId: string
  timestamp: number
}

// 消息事件
interface ChatMessageEvent {
  type: 'new_message' | 'message_read'
  chatKey: string
  message?: Message
  messageIds?: string[]
}

// 全局广播频道（单例）
let onlineChannel: BroadcastChannel | null = null
let chatChannel: BroadcastChannel | null = null

function getOnlineChannel(): BroadcastChannel {
  if (!onlineChannel) {
    onlineChannel = new BroadcastChannel(ONLINE_STATUS_CHANNEL)
  }
  return onlineChannel
}

function getChatChannel(): BroadcastChannel {
  if (!chatChannel) {
    chatChannel = new BroadcastChannel(CHAT_CHANNEL)
  }
  return chatChannel
}

// 更新用户在线状态（本地存储 + 广播）
function updateUserOnlineStatus(userId: string) {
  if (typeof window === 'undefined') return
  
  const timestamp = Date.now()
  
  // 本地存储
  localStorage.setItem(`xindong_online_${userId}`, JSON.stringify({
    userId,
    timestamp,
    isOnline: true
  }))
  
  // 广播给其他标签页
  try {
    const channel = getOnlineChannel()
    channel.postMessage({
      type: 'online',
      userId,
      timestamp
    } as OnlineStatusEvent)
  } catch (e) {
    console.error('Failed to broadcast online status:', e)
  }
}

// 获取用户在线状态（从localStorage读取）
function getUserOnlineStatus(userId: string): { isOnline: boolean; lastActiveText: string } {
  if (typeof window === 'undefined') {
    return { isOnline: false, lastActiveText: '离线' }
  }
  
  try {
    const data = localStorage.getItem(`xindong_online_${userId}`)
    if (!data) {
      return { isOnline: false, lastActiveText: '离线' }
    }
    
    const parsed = JSON.parse(data)
    const now = Date.now()
    const diffMs = now - parsed.timestamp
    const diffSecs = Math.floor(diffMs / 1000)
    
    // 30秒内视为在线
    if (diffSecs < 30) {
      return { isOnline: true, lastActiveText: '在线' }
    }
    
    // 生成离线时间描述
    let lastActiveText = '离线'
    if (diffSecs < 60) {
      lastActiveText = `${diffSecs}秒前`
    } else if (diffSecs < 3600) {
      lastActiveText = `${Math.floor(diffSecs / 60)}分钟前`
    } else if (diffSecs < 86400) {
      lastActiveText = `${Math.floor(diffSecs / 3600)}小时前`
    } else {
      lastActiveText = `${Math.floor(diffSecs / 86400)}天前`
    }
    
    return { isOnline: false, lastActiveText }
  } catch (e) {
    return { isOnline: false, lastActiveText: '离线' }
  }
}

// 保存消息到localStorage并广播
function saveAndBroadcastMessage(chatKey: string, message: Message) {
  if (typeof window === 'undefined') return
  
  // 保存到localStorage
  const stored = localStorage.getItem(chatKey)
  let messages: Message[] = []
  
  if (stored) {
    try {
      messages = JSON.parse(stored)
    } catch (e) {
      messages = []
    }
  }
  
  // 检查是否已存在
  if (!messages.find(m => m.id === message.id)) {
    messages.push(message)
    localStorage.setItem(chatKey, JSON.stringify(messages))
    
    // 广播给其他标签页
    try {
      const channel = getChatChannel()
      channel.postMessage({
        type: 'new_message',
        chatKey,
        message
      } as ChatMessageEvent)
    } catch (e) {
      console.error('Failed to broadcast message:', e)
    }
  }
}

// 标记消息已读并广播
function markMessagesAsRead(chatKey: string, messageIds: string[]) {
  if (typeof window === 'undefined') return
  
  const stored = localStorage.getItem(chatKey)
  if (!stored) return
  
  try {
    const messages: Message[] = JSON.parse(stored)
    let hasChanges = false
    
    const updatedMessages = messages.map(m => {
      if (messageIds.includes(m.id) && m.status !== 'read' && m.status !== 'recalled') {
        hasChanges = true
        return { ...m, status: 'read' as const }
      }
      return m
    })
    
    if (hasChanges) {
      localStorage.setItem(chatKey, JSON.stringify(updatedMessages))
      
      // 广播给其他标签页
      try {
        const channel = getChatChannel()
        channel.postMessage({
          type: 'message_read',
          chatKey,
          messageIds
        } as ChatMessageEvent)
      } catch (e) {
        console.error('Failed to broadcast read status:', e)
      }
    }
  } catch (e) {
    console.error('Failed to mark messages as read:', e)
  }
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
  const [initialized, setInitialized] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [background, setBackground] = useState('romance')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatKeyRef = useRef<string | null>(null)

  // 常用表情
  const commonEmojis = ['😀', '😊', '😍', '🥰', '😘', '❤️', '💕', '💖', '💗', '💓', '💞', '💌', '💘', '💝', '✨', '🌟', '💫', '⭐', '🔥', '💯', '🎉', '🎊', '🥳', '😄', '😂', '🤣', '😁', '🤭', '😳', '🥺', '🤗', '😎', '🤩', '😻', '💑', '👫', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎']

  const addEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji)
    inputRef.current?.focus()
  }

  // 更新当前用户在线状态
  useEffect(() => {
    if (currentUserId) {
      updateUserOnlineStatus(currentUserId)
      
      // 每10秒更新一次在线状态
      const interval = setInterval(() => {
        updateUserOnlineStatus(currentUserId)
      }, 10000)
      
      // 页面可见性变化时更新
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          updateUserOnlineStatus(currentUserId)
        }
      }
      document.addEventListener('visibilitychange', handleVisibilityChange)
      
      // 页面关闭时标记离线
      const handleBeforeUnload = () => {
        localStorage.setItem(`xindong_online_${currentUserId}`, JSON.stringify({
          userId: currentUserId,
          timestamp: Date.now() - 60000, // 设为1分钟前
          isOnline: false
        }))
      }
      window.addEventListener('beforeunload', handleBeforeUnload)
      
      return () => {
        clearInterval(interval)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
        window.removeEventListener('beforeunload', handleBeforeUnload)
      }
    }
  }, [currentUserId])

  // 监听对方用户在线状态广播
  useEffect(() => {
    if (!otherUser) return
    
    const channel = getOnlineChannel()
    
    const handleOnlineMessage = (event: globalThis.MessageEvent) => {
      const data = event.data as OnlineStatusEvent
      if (data.userId === otherUser.id) {
        const { isOnline, lastActiveText } = getUserOnlineStatus(otherUser.id)
        setOtherUser(prev => prev ? { ...prev, isOnline, lastActive: lastActiveText } : null)
      }
    }
    
    channel.addEventListener('message', handleOnlineMessage)
    return () => channel.removeEventListener('message', handleOnlineMessage)
  }, [otherUser?.id])

  // 监听消息广播
  useEffect(() => {
    if (!otherUser || !chatKeyRef.current) return
    
    const channel = getChatChannel()
    
    const handleChatMessage = (event: globalThis.MessageEvent) => {
      const data = event.data as ChatMessageEvent
      
      if (data.chatKey === chatKeyRef.current) {
        if (data.type === 'new_message' && data.message) {
          setMessages(prev => {
            if (prev.find(m => m.id === data.message!.id)) return prev
            return [...prev, data.message!]
          })
          
          // 如果是对方发的消息，标记为已读
          if (data.message.senderId === otherUser.id) {
            markMessagesAsRead(chatKeyRef.current!, [data.message.id])
          }
        } else if (data.type === 'message_read' && data.messageIds) {
          setMessages(prev => prev.map(m => 
            data.messageIds!.includes(m.id) ? { ...m, status: 'read' } : m
          ))
        }
      }
    }
    
    channel.addEventListener('message', handleChatMessage)
    return () => channel.removeEventListener('message', handleChatMessage)
  }, [otherUser?.id])

  // 定期刷新对方在线状态和消息
  useEffect(() => {
    if (!otherUser) return
    
    const interval = setInterval(() => {
      // 刷新在线状态
      const { isOnline, lastActiveText } = getUserOnlineStatus(otherUser.id)
      setOtherUser(prev => prev ? { ...prev, isOnline, lastActive: lastActiveText } : null)
      
      // 刷新消息
      if (chatKeyRef.current) {
        const stored = localStorage.getItem(chatKeyRef.current)
        if (stored) {
          try {
            const storedMessages: Message[] = JSON.parse(stored)
            setMessages(prev => {
              // 合并新消息
              const prevIds = new Set(prev.map(m => m.id))
              const newMessages = storedMessages.filter(m => !prevIds.has(m.id))
              if (newMessages.length > 0) {
                return [...prev, ...newMessages]
              }
              return prev
            })
          } catch (e) {
            console.error('Failed to refresh messages:', e)
          }
        }
      }
    }, 3000) // 每3秒刷新
    
    return () => clearInterval(interval)
  }, [otherUser])

  // 获取对方用户信息
  useEffect(() => {
    if (!userId || initialized) return

    const fetchUserInfo = async () => {
      const urlNickname = searchParams.get('nickname')
      
      // 获取在线状态
      const { isOnline, lastActiveText } = getUserOnlineStatus(userId)
      
      const basicUser: OtherUser = {
        id: userId,
        nickname: urlNickname || '心动对象',
        age: 26,
        city: '北京',
        score: 92,
        isOnline,
        avatar: null,
        lastActive: lastActiveText,
        lastActiveTime: null
      }
      
      setOtherUser(basicUser)
      setInitialized(true)
      
      // 设置聊天key
      const sortedIds = [currentUserId, userId].sort()
      chatKeyRef.current = `xindong_chat_${sortedIds.join('_')}`
    }
    
    fetchUserInfo()
  }, [userId, searchParams, initialized, currentUserId])

  // 加载消息
  const loadMessages = useCallback(() => {
    if (!chatKeyRef.current) return
    
    const stored = localStorage.getItem(chatKeyRef.current)
    if (stored) {
      try {
        const parsed: Message[] = JSON.parse(stored)
        setMessages(parsed.map(m => ({ ...m, timestamp: new Date(m.timestamp) })))
        
        // 标记对方发的消息为已读
        if (otherUser) {
          const unreadIds = parsed
            .filter(m => m.senderId === otherUser.id && m.status !== 'read' && m.status !== 'recalled')
            .map(m => m.id)
          
          if (unreadIds.length > 0) {
            markMessagesAsRead(chatKeyRef.current!, unreadIds)
          }
        }
      } catch (e) {
        console.error('Failed to load messages:', e)
      }
    }
  }, [otherUser])

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputText.trim() || !otherUser || isSending || !chatKeyRef.current) return
    sendMessageFeedback()
    
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      senderId: currentUserId,
      text: inputText.trim(),
      timestamp: new Date(),
      status: 'sent',
      type: 'text'
    }

    setInputText('')
    setIsSending(true)

    // 保存并广播消息
    saveAndBroadcastMessage(chatKeyRef.current, newMessage)
    
    // 更新本地状态
    setMessages(prev => [...prev, newMessage])
    
    setTimeout(() => setIsSending(false), 300)
  }

  // 发送图片
  const handleSendImage = async () => {
    if (!otherUser || isSending || !chatKeyRef.current) return

    try {
      const file = await selectImage()
      if (!file) return

      if (!isValidImageType(file)) {
        alert('请选择 JPG、PNG 或 GIF 格式的图片')
        return
      }

      if (!isValidImageSize(file, 3)) {
        alert('图片大小不能超过 3MB')
        return
      }

      const dataUrl = await compressImage(file, 300, 300, 0.5)
      
      const newMessage: Message = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        senderId: currentUserId,
        text: dataUrl,
        timestamp: new Date(),
        status: 'sent',
        type: 'image'
      }

      saveAndBroadcastMessage(chatKeyRef.current, newMessage)
      setMessages(prev => [...prev, newMessage])

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
    errorFeedback()
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, status: 'sent' } : m
    ))
  }

  const handleRecallMessage = async (messageId: string) => {
    if (!chatKeyRef.current) return
    
    setMessages(prev => {
      const updated = prev.map(m => 
        m.id === messageId ? { ...m, status: 'recalled' as const, text: '消息已撤回' } : m
      )
      localStorage.setItem(chatKeyRef.current!, JSON.stringify(updated))
      return updated
    })
  }

  const backgrounds = {
    romance: 'from-rose-100/50 via-pink-100/50 to-purple-100/50',
    ocean: 'from-blue-100/50 via-cyan-100/50 to-teal-100/50',
    sunset: 'from-orange-100/50 via-rose-100/50 to-pink-100/50',
    mint: 'from-emerald-100/50 via-teal-100/50 to-cyan-100/50',
    lavender: 'from-purple-100/50 via-violet-100/50 to-indigo-100/50',
  }

  const topicSuggestions = [
    { text: '你好，很高兴认识你！', icon: '👋' },
    { text: '你平时喜欢做什么呢？', icon: '😊' },
    { text: '最近有什么有趣的事吗？', icon: '✨' },
    { text: '你喜欢什么类型的电影？', icon: '🎬' },
  ]

  // 消息气泡组件
  const MessageBubble = ({ message, isOwn, onRetry, onRecall, onImageClick }: {
    message: Message
    isOwn: boolean
    onRetry?: (id: string) => void
    onRecall?: (id: string) => void
    onImageClick?: () => void
  }) => {
    const [showActions, setShowActions] = useState(false)
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
      if (message.type === 'text') {
        navigator.clipboard.writeText(message.text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    }

    const statusIcon = () => {
      if (!isOwn) return null
      switch (message.status) {
        case 'sending': return <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin" />
        case 'sent': return <Check className="w-3.5 h-3.5 text-gray-400" />
        case 'delivered': return <CheckCheck className="w-3.5 h-3.5 text-gray-400" />
        case 'read': return <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
        default: return null
      }
    }

    if (message.type === 'system') {
      return (
        <div className="flex justify-center">
          <div className="px-4 py-2 bg-gray-100/80 rounded-full text-sm text-gray-500">
            {message.text}
          </div>
        </div>
      )
    }

    if (message.status === 'recalled') {
      return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <div className="px-4 py-2 bg-gray-100/80 rounded-2xl text-sm text-gray-400 italic">
            {message.text}
          </div>
        </div>
      )
    }

    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
        <div className="relative max-w-[75%]">
          <motion.div
            className={`
              relative px-4 py-2.5 rounded-2xl cursor-pointer
              ${isOwn 
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-br-md' 
                : 'bg-white/90 backdrop-blur-sm text-gray-800 rounded-bl-md shadow-sm border border-gray-100/50'
              }
            `}
            whileTap={{ scale: 0.98 }}
            onContextMenu={(e) => {
              e.preventDefault()
              setShowActions(!showActions)
            }}
            onClick={() => setShowActions(!showActions)}
          >
            {message.type === 'image' ? (
              <img src={message.text} alt="图片" className="rounded-lg max-w-[200px] cursor-pointer hover:opacity-90 transition-opacity" onClick={(e) => { e.stopPropagation(); onImageClick?.() }} />
            ) : (
              <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
            )}
            
            <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <span className={`text-xs ${isOwn ? 'text-white/70' : 'text-gray-400'}`}>
                {new Date(message.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </span>
              {isOwn && statusIcon()}
            </div>
          </motion.div>

          {isOwn && message.status === 'read' && (
            <p className="text-xs text-blue-500 mt-1 text-right">已读</p>
          )}

          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                className={`absolute ${isOwn ? 'right-0' : 'left-0'} top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-10 min-w-[100px]`}
              >
                <button onClick={(e) => { e.stopPropagation(); handleCopy(); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-gray-700">
                  {copied ? '✓ 已复制' : '复制'}
                </button>
                {isOwn && (
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
      </div>
    )
  }

  // 初始化
  useEffect(() => {
    if (initialized) {
      loadMessages()
    }
  }, [initialized, loadMessages])

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!userId) {
    return (
      <AnimatedBackground variant="romance" showFloatingHearts={false}>
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">未找到用户</h1>
          <p className="text-gray-500 mb-4">请从会话列表或用户详情页进入聊天</p>
          <Link href="/chat" className="px-4 py-2 bg-rose-500 text-white rounded-full">返回会话列表</Link>
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
    <AnimatedBackground variant="romance" showFloatingHearts={false}>
      <div className="min-h-screen flex flex-col" style={{ background: `linear-gradient(180deg, var(--tw-gradient-stops))`, backgroundImage: `linear-gradient(to bottom, ${backgrounds[background as keyof typeof backgrounds]})` }}>
        
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100/50">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Link href="/chat" className="p-1.5 -ml-1.5 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div className="relative">
                {otherUser.avatar ? (
                  <img src={otherUser.avatar} alt={otherUser.nickname} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {otherUser.nickname[0]}
                  </div>
                )}
                {/* 在线状态指示点 */}
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${otherUser.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">{otherUser.nickname}</h1>
                <div className="flex items-center gap-1.5">
                  <Circle className={`w-2 h-2 ${otherUser.isOnline ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'}`} />
                  <p className={`text-xs ${otherUser.isOnline ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                    {otherUser.isOnline ? '在线' : otherUser.lastActive}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Phone className="w-5 h-5 text-gray-500" />
              </button>
              <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Menu */}
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-4 top-16 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
              >
                <p className="px-4 py-1 text-xs text-gray-400">聊天背景</p>
                {Object.keys(backgrounds).map((key) => (
                  <button
                    key={key}
                    onClick={() => { setBackground(key); setShowMenu(false); }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${background === key ? 'text-rose-500 font-medium' : 'text-gray-700'}`}
                  >
                    {key === 'romance' && '💕 浪漫粉'}
                    {key === 'ocean' && '🌊 海洋蓝'}
                    {key === 'sunset' && '🌅 日落橙'}
                    {key === 'mint' && '🌿 薄荷绿'}
                    {key === 'lavender' && '💜 薰衣草'}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
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

        {/* Emoji Picker */}
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
                  <button key={index} onClick={() => addEmoji(emoji)} className="w-8 h-8 text-lg hover:bg-gray-100 rounded transition-colors">
                    {emoji}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        <div className="sticky bottom-0 bg-white/90 backdrop-blur-xl border-t border-gray-100/50 px-4 py-3">
          <div className="flex items-end gap-2">
            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Smile className={`w-6 h-6 ${showEmojiPicker ? 'text-rose-500' : 'text-gray-500'}`} />
            </button>
            <button onClick={handleSendImage} disabled={isSending} className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50">
              <Image className="w-6 h-6 text-gray-500" />
            </button>
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入消息..."
                rows={1}
                className="w-full px-4 py-2.5 bg-gray-100/50 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all text-sm"
                style={{ minHeight: '40px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isSending}
              className="p-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full shadow-lg shadow-rose-500/30 hover:shadow-xl transition-all disabled:opacity-50 disabled:shadow-none"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Preview */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
            >
              <button className="absolute top-4 right-4 p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors">
                <X className="w-6 h-6" />
              </button>
              <img src={selectedImage} alt="预览" className="max-w-full max-h-full object-contain" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatedBackground>
  )
}

export default function ConversationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="animate-pulse text-rose-500">加载中...</div>
      </div>
    }>
      <ConversationContent />
    </Suspense>
  )
}
