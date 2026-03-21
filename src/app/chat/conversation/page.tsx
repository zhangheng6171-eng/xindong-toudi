'use client'

import { useState, useRef, useCallback, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  ArrowLeft, Send, Image, Smile, MoreVertical,
  Check, CheckCheck, X, ChevronDown, Loader2, Circle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AnimatedBackground, FadeIn } from '@/components/animated-background'
import { useAuth } from '@/hooks/useAuth'
import { selectImage, isValidImageType, isValidImageSize, compressImage } from '@/lib/image-utils'
import { sendMessageFeedback, errorFeedback } from '@/lib/haptics'

// Supabase 配置
const SUPABASE_URL = 'https://ntaqnyegiiwtzdyqjiwy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50YXFueWVnaWl3dHpkeXFqaXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTY4NzUsImV4cCI6MjA4OTQ5Mjg3NX0.4FEAb1Yd4xOwXz3LcfZ9iPG0ZZPbFd8dfry903c5lPc'

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

// 从Supabase获取消息
async function fetchMessagesFromAPI(userId1: string, userId2: string): Promise<Message[]> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/messages?or=(and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1}))&select=*&order=created_at.asc`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    )
    
    if (!response.ok) {
      console.error('Failed to fetch messages:', await response.text())
      return []
    }
    
    const data = await response.json()
    if (!Array.isArray(data)) return []
    
    return data.map((m: any) => ({
      id: m.id,
      senderId: m.sender_id,
      text: m.content,
      type: m.type || 'text',
      timestamp: new Date(m.created_at),
      status: m.status || 'sent'
    }))
  } catch (error) {
    console.error('Error fetching messages:', error)
    return []
  }
}

// 发送消息到Supabase
async function sendMessageToAPI(senderId: string, receiverId: string, text: string, type: string = 'text'): Promise<Message | null> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        sender_id: senderId,
        receiver_id: receiverId,
        content: text,
        type,
        status: 'sent'
      })
    })
    
    if (!response.ok) {
      console.error('Failed to send message:', await response.text())
      return null
    }
    
    const data = await response.json()
    const message = Array.isArray(data) ? data[0] : data
    
    return {
      id: message.id,
      senderId: message.sender_id,
      text: message.content,
      type: message.type || 'text',
      timestamp: new Date(message.created_at),
      status: message.status || 'sent'
    }
  } catch (error) {
    console.error('Error sending message:', error)
    return null
  }
}

// 获取用户信息（包括头像）
async function fetchUserInfo(userId: string): Promise<any> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    )
    
    if (!response.ok) return null
    const data = await response.json()
    return Array.isArray(data) && data.length > 0 ? data[0] : null
  } catch (error) {
    console.error('Error fetching user info:', error)
    return null
  }
}

// 更新用户在线状态到Supabase
async function updateOnlineStatus(userId: string, isOnline: boolean) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        last_active: new Date().toISOString(),
        is_online: isOnline
      })
    })
  } catch (error) {
    console.error('Error updating online status:', error)
  }
}

// 获取用户在线状态
async function getUserOnlineStatus(userId: string): Promise<{ isOnline: boolean; lastActiveText: string }> {
  try {
    const user = await fetchUserInfo(userId)
    if (!user || !user.last_active) {
      return { isOnline: false, lastActiveText: '离线' }
    }
    
    const lastActive = new Date(user.last_active)
    const now = new Date()
    const diffMs = now.getTime() - lastActive.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    
    if (diffSecs < 60) {
      return { isOnline: true, lastActiveText: '在线' }
    }
    
    let lastActiveText = '离线'
    if (diffSecs < 3600) {
      lastActiveText = `${Math.floor(diffSecs / 60)}分钟前`
    } else if (diffSecs < 86400) {
      lastActiveText = `${Math.floor(diffSecs / 3600)}小时前`
    } else {
      lastActiveText = `${Math.floor(diffSecs / 86400)}天前`
    }
    
    return { isOnline: false, lastActiveText }
  } catch (error) {
    return { isOnline: false, lastActiveText: '离线' }
  }
}

function ConversationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { currentUser } = useAuth()
  
  const userId = searchParams.get('userId')
  const currentUserId = currentUser?.id || 'local_user'
  
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [background, setBackground] = useState('romance')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  
  // 使用 ref 追踪状态，避免不必要的重渲染
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const prevMessagesLengthRef = useRef(0)
  const isInitialLoadRef = useRef(true)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const commonEmojis = ['😀', '😊', '😍', '🥰', '😘', '❤️', '💕', '💖', '💗', '💓', '💞', '💌', '💘', '💝', '✨', '🌟', '💫', '⭐', '🔥', '💯', '🎉', '🎊', '🥳', '😄', '😂', '🤣', '😁', '🤭', '😳', '🥺', '🤗', '😎', '🤩', '😻', '💑', '👫']

  const addEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji)
    inputRef.current?.focus()
  }

  // 获取对方用户信息
  useEffect(() => {
    if (!userId) return

    const loadUserInfo = async () => {
      const urlNickname = searchParams.get('nickname')
      const userData = await fetchUserInfo(userId)
      
      const basicUser: OtherUser = {
        id: userId,
        nickname: userData?.nickname || urlNickname || '心动对象',
        age: userData?.age || 26,
        city: userData?.city || '北京',
        score: userData?.score || 92,
        isOnline: false,
        avatar: userData?.avatar || userData?.photos?.[0] || null,
        lastActive: '离线',
        lastActiveTime: null
      }
      
      const { isOnline, lastActiveText } = await getUserOnlineStatus(userId)
      basicUser.isOnline = isOnline
      basicUser.lastActive = lastActiveText
      
      setOtherUser(basicUser)
    }
    
    loadUserInfo()
  }, [userId, searchParams])

  // 更新当前用户在线状态
  useEffect(() => {
    if (!currentUserId || currentUserId === 'local_user') return
    
    updateOnlineStatus(currentUserId, true)
    
    const interval = setInterval(() => {
      updateOnlineStatus(currentUserId, true)
    }, 30000)
    
    const handleBeforeUnload = () => {
      updateOnlineStatus(currentUserId, false)
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      updateOnlineStatus(currentUserId, false)
    }
  }, [currentUserId])

  // 加载消息（静默加载，不显示loading）
  const loadMessages = useCallback(async (isRefresh: boolean = false) => {
    if (!currentUserId || !userId || currentUserId === 'local_user') return
    
    const msgs = await fetchMessagesFromAPI(currentUserId, userId)
    
    setMessages(prev => {
      if (isRefresh) {
        // 刷新模式：只添加新消息
        const prevIds = new Set(prev.map(m => m.id))
        const newMessages = msgs.filter(m => !prevIds.has(m.id))
        if (newMessages.length > 0) {
          return [...prev, ...newMessages]
        }
        return prev
      } else {
        // 初次加载：替换全部
        return msgs
      }
    })
  }, [currentUserId, userId])

  // 初始加载消息
  useEffect(() => {
    if (otherUser && currentUserId && currentUserId !== 'local_user') {
      loadMessages(false)
      isInitialLoadRef.current = false
    }
  }, [otherUser, currentUserId, loadMessages])

  // 定期刷新消息和在线状态（静默刷新）
  useEffect(() => {
    if (!otherUser || !currentUserId || currentUserId === 'local_user') return
    
    const interval = setInterval(async () => {
      // 静默刷新消息
      loadMessages(true)
      
      // 静默刷新在线状态
      const { isOnline, lastActiveText } = await getUserOnlineStatus(userId!)
      setOtherUser(prev => {
        if (prev && (prev.isOnline !== isOnline || prev.lastActive !== lastActiveText)) {
          return { ...prev, isOnline, lastActive: lastActiveText }
        }
        return prev
      })
    }, 3000)
    
    return () => clearInterval(interval)
  }, [otherUser, currentUserId, userId, loadMessages])

  // 只在消息数量变化时滚动到底部
  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    prevMessagesLengthRef.current = messages.length
  }, [messages.length])

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputText.trim() || !otherUser || isSending || !currentUserId || currentUserId === 'local_user') {
      if (!currentUserId || currentUserId === 'local_user') {
        alert('请先登录后再发送消息')
      }
      return
    }
    
    sendMessageFeedback()
    setIsSending(true)
    
    const tempId = `temp-${Date.now()}`
    const newMessage: Message = {
      id: tempId,
      senderId: currentUserId,
      text: inputText.trim(),
      timestamp: new Date(),
      status: 'sending',
      type: 'text'
    }

    setInputText('')
    setMessages(prev => [...prev, newMessage])

    const sentMessage = await sendMessageToAPI(currentUserId, userId!, inputText.trim(), 'text')
    
    if (sentMessage) {
      setMessages(prev => prev.map(m => 
        m.id === tempId ? sentMessage : m
      ))
    } else {
      setMessages(prev => prev.map(m => 
        m.id === tempId ? { ...m, status: 'sent' as const } : m
      ))
    }
    
    setIsSending(false)
  }

  // 发送图片
  const handleSendImage = async () => {
    if (!otherUser || isSending || !currentUserId || currentUserId === 'local_user') return

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
      
      const tempId = `temp-${Date.now()}`
      const newMessage: Message = {
        id: tempId,
        senderId: currentUserId,
        text: dataUrl,
        timestamp: new Date(),
        status: 'sending',
        type: 'image'
      }

      setMessages(prev => [...prev, newMessage])

      const sentMessage = await sendMessageToAPI(currentUserId, userId!, dataUrl, 'image')
      
      if (sentMessage) {
        setMessages(prev => prev.map(m => 
          m.id === tempId ? sentMessage : m
        ))
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
  const MessageBubble = ({ message, isOwn }: {
    message: Message
    isOwn: boolean
  }) => {
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

    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
        <div className="relative max-w-[75%]">
          <div
            className={`
              relative px-4 py-2.5 rounded-2xl
              ${isOwn 
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-br-md' 
                : 'bg-white/90 backdrop-blur-sm text-gray-800 rounded-bl-md shadow-sm border border-gray-100/50'
              }
            `}
          >
            {message.type === 'image' ? (
              <img src={message.text} alt="图片" className="rounded-lg max-w-[200px]" onClick={() => setSelectedImage(message.text)} />
            ) : (
              <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
            )}
            
            <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <span className={`text-xs ${isOwn ? 'text-white/70' : 'text-gray-400'}`}>
                {new Date(message.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </span>
              {isOwn && statusIcon()}
            </div>
          </div>

          {isOwn && message.status === 'read' && (
            <p className="text-xs text-blue-500 mt-1 text-right">已读</p>
          )}
        </div>
      </div>
    )
  }

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
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${otherUser.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
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
            <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </button>
          </div>

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
          {messages.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="text-gray-400 text-sm">暂无消息，开始聊天吧～</div>
            </div>
          ) : (
            <>
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
                />
              ))}
            </>
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
