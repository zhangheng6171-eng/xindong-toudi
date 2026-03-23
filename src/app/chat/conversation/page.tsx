'use client'

import { useState, useRef, useEffect, Suspense, memo, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Send, Image, Check, CheckCheck, X, Loader2, Wifi, WifiOff, Smile, Clock, MoreVertical, Phone, Video } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AnimatedBackground } from '@/components/animated-background'
import { useAuth } from '@/hooks/useAuth'
import { selectImage, isValidImageType, isValidImageSize, compressImage } from '@/lib/image-utils'
import { VoiceCallButton, VoiceCallModal, VideoCallButton, VideoCallModal } from '@/components/chat'

// Supabase 配置 - 从环境变量获取
const SUPABASE_URL = 'https://ntaqnyegiiwtzdyqjiwy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50YXFueWVnaWl3dHpkeXFqaXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTY4NzUsImV4cCI6MjA4OTQ5Mjg3NX0.4FEAb1Yd4xOwXz3LcfZ9iPG0ZZPbFd8dfry903c5lPc'

// 缓存
const userCache = new Map<string, { data: any; time: number }>()
const CACHE_TTL = 60000

// 格式化时间
function formatTime(date: Date) {
  const now = new Date()
  const msgDate = new Date(date)
  
  const isToday = now.toDateString() === msgDate.toDateString()
  const isYesterday = new Date(now.getTime() - 86400000).toDateString() === msgDate.toDateString()
  
  const timeStr = msgDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  
  if (isToday) return timeStr
  if (isYesterday) return `昨天 ${timeStr}`
  return msgDate.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }) + ' ' + timeStr
}

// 检查是否需要显示时间分隔
function shouldShowTimeSeparator(currentMsg: any, prevMsg: any, myId: string): boolean {
  if (!prevMsg) return true
  if (currentMsg.senderId !== prevMsg.senderId) return true
  
  const currentTime = new Date(currentMsg.timestamp).getTime()
  const prevTime = new Date(prevMsg.timestamp).getTime()
  
  // 超过5分钟显示时间
  return currentTime - prevTime > 5 * 60 * 1000
}

// 获取用户信息
async function fetchUser(uid: string) {
  const cached = userCache.get(uid)
  if (cached && Date.now() - cached.time < CACHE_TTL) return cached.data
  
  const res = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${uid}&select=id,nickname,avatar`, {
    headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
  })
  const data = await res.json()
  const user = Array.isArray(data) && data[0] ? data[0] : null
  userCache.set(uid, { data: user, time: Date.now() })
  return user
}

// 获取消息列表
async function fetchMessages(uid1: string, uid2: string) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/messages?or=(and(sender_id.eq.${uid1},receiver_id.eq.${uid2}),and(sender_id.eq.${uid2},receiver_id.eq.${uid1}))&select=id,sender_id,receiver_id,content,type,status,created_at&order=created_at.asc&limit=200`,
    { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
  )
  const data = await res.json()
  if (!Array.isArray(data)) return []
  return data.map((m: any) => ({
    id: m.id,
    senderId: m.sender_id,
    receiverId: m.receiver_id,
    text: m.content,
    type: m.type || 'text',
    status: m.status || 'sent',
    timestamp: new Date(m.created_at)
  }))
}

// 更新消息状态
async function updateMessageStatus(messageId: string, status: string) {
  await fetch(`${SUPABASE_URL}/rest/v1/messages?id=eq.${messageId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ status })
  })
}

// 发送消息
async function postMessage(from: string, to: string, text: string, type = 'text') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ sender_id: from, receiver_id: to, content: text, type, status: 'sent' })
  })
  if (!res.ok) return null
  const data = await res.json()
  const m = Array.isArray(data) ? data[0] : data
  return { 
    id: m.id, 
    senderId: m.sender_id,
    receiverId: m.receiver_id,
    text: m.content, 
    type: m.type || 'text', 
    status: 'sent',
    timestamp: new Date(m.created_at)
  }
}

// 消息气泡组件 - 优化：添加发送失败状态显示
const Bubble = memo(function Bubble({ msg, isOwn, onImg }: { msg: any; isOwn: boolean; onImg?: (url: string) => void }) {
  const StatusIcon = () => {
    if (!isOwn) return null
    if (msg.status === 'sending') {
      return <Loader2 className="w-3 h-3 text-white/70 animate-spin" />
    }
    if (msg.status === 'failed') {
      return <span className="text-xs text-red-300" title="发送失败，点击重试">!</span>
    }
    if (msg.status === 'read') {
      return <CheckCheck className="w-3 h-3 text-blue-200" />
    }
    if (msg.status === 'delivered') {
      return <CheckCheck className="w-3 h-3 text-white/70" />
    }
    return <Check className="w-3 h-3 text-white/70" />
  }
  
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${isOwn ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-br-md' : 'bg-white text-gray-800 rounded-bl-md shadow-sm'} ${msg.status === 'failed' ? 'opacity-60' : ''}`}>
        {msg.type === 'image' ? (
          <img src={msg.text} alt="" className="rounded-lg max-w-full cursor-pointer" onClick={() => onImg?.(msg.text)} />
        ) : (
          <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
        )}
        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className={`text-xs ${isOwn ? 'text-white/70' : 'text-gray-400'}`}>{formatTime(msg.timestamp)}</span>
          {isOwn && <StatusIcon />}
        </div>
      </div>
    </div>
  )
})

// 时间分隔组件
const TimeSeparator = memo(function TimeSeparator({ date }: { date: Date }) {
  const now = new Date()
  const isToday = now.toDateString() === date.toDateString()
  const isYesterday = new Date(now.getTime() - 86400000).toDateString() === date.toDateString()
  
  let label = date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric', weekday: 'short' })
  if (isToday) label = '今天'
  if (isYesterday) label = '昨天'
  
  return (
    <div className="flex justify-center my-4">
      <div className="px-3 py-1 bg-gray-200/80 rounded-full text-xs text-gray-600 flex items-center gap-1">
        <Clock className="w-3 h-3" />
        {label}
      </div>
    </div>
  )
})

// 骨架屏加载
function MessagesSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[60%] px-4 py-3 rounded-2xl ${i % 2 === 0 ? 'bg-gray-200' : 'bg-gray-100'} animate-pulse`}>
            <div className="h-4 w-32 bg-gray-300/50 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

// 聊天内容组件
function ChatContent({ peerId, peerName }: { peerId: string; peerName: string }) {
  const { currentUser, isLoading } = useAuth()
  const myId = currentUser?.id || ''
  
  const [peer, setPeer] = useState<{ name: string; avatar: string | null } | null>(null)
  const [msgs, setMsgs] = useState<any[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [img, setImg] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [peerTyping, setPeerTyping] = useState(false)
  
  // 语音通话状态
  const [callModalVisible, setCallModalVisible] = useState(false)
  const [callMode, setCallMode] = useState<'incoming' | 'outgoing' | 'connected'>('outgoing')
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null)
  
  // 视频通话状态
  const [videoCallModalVisible, setVideoCallModalVisible] = useState(false)
  const [videoCallRoomId, setVideoCallRoomId] = useState<string | null>(null)
  const [videoCallIsCaller, setVideoCallIsCaller] = useState(true)
  
  const endRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const callPollingRef = useRef<NodeJS.Timeout | null>(null)

  // 网络状态监听
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    setIsOnline(navigator.onLine)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // 标题显示未读数（如果有）
  useEffect(() => {
    const unreadCount = msgs.filter(m => m.senderId !== myId && m.status !== 'read').length
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) 心动投递 - 聊天`
    } else {
      document.title = '心动投递 - 聊天'
    }
  }, [msgs, myId])

  // 轮询检查是否有来电呼叫
  useEffect(() => {
    if (!myId || !peerId) return
    
    const checkForIncomingCall = async () => {
      try {
        // 查询是否有来自该用户的呼叫
        const res = await fetch(`${SUPABASE_URL}/rest/v1/call_notifications?receiver_id=eq.${myId}&sender_id=eq.${peerId}&status=eq.pending&order=created_at.desc&limit=1`, {
          headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
        })
        const data = await res.json()
        
        if (Array.isArray(data) && data.length > 0 && !callModalVisible) {
          const call = data[0]
          setCurrentRoomId(call.room_id)
          setCallMode('incoming')
          setCallModalVisible(true)
        }
      } catch (error) {
        console.error('Check incoming call error:', error)
      }
    }
    
    callPollingRef.current = setInterval(checkForIncomingCall, 3000)
    
    return () => {
      if (callPollingRef.current) clearInterval(callPollingRef.current)
    }
  }, [myId, peerId, callModalVisible])

  // 发起语音通话
  const handleInitiateCall = async (roomId: string) => {
    setCurrentRoomId(roomId)
    setCallMode('outgoing')
    setCallModalVisible(true)
  }

  // 处理通话结束
  const handleCallEnd = () => {
    setCallModalVisible(false)
    setCallMode('outgoing')
    setCurrentRoomId(null)
  }

  // 处理通话接受
  const handleCallAccept = () => {
    setCallMode('connected')
  }

  // 处理通话拒绝/关闭
  const handleCallClose = () => {
    setCallModalVisible(false)
    setCallMode('outgoing')
    setCurrentRoomId(null)
  }

  // 初始化加载 - 优化：更智能的消息合并和去重
  useEffect(() => {
    if (!peerId || !myId || initialized) return
    
    fetchUser(peerId).then(user => {
      setPeer({ name: user?.nickname || peerName, avatar: user?.avatar || null })
    })
    
    fetchMessages(myId, peerId).then(messages => {
      // 优化：按时间排序并标记已读
      const sortedMsgs = messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      setMsgs(sortedMsgs)
      setInitialized(true)
      
      // 批量标记未读消息为已读
      const unreadMsgs = sortedMsgs.filter(m => m.senderId !== myId && m.status !== 'read')
      if (unreadMsgs.length > 0) {
        unreadMsgs.forEach(m => {
          updateMessageStatus(m.id, 'read')
        })
      }
      
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'auto' }), 100)
    })
  }, [peerId, peerName, myId, initialized])

  // 轮询刷新 - 优化为10秒间隔，添加已读同步
  useEffect(() => {
    if (!peerId || !myId || !initialized) return
    
    const pollAndSync = async () => {
      const serverMsgs = await fetchMessages(myId, peerId)
      
      setMsgs(prev => {
        const tempMsgs = prev.filter(m => String(m.id).startsWith('t'))
        const serverIds = new Set(serverMsgs.map(m => String(m.id)))
        const remainingTempMsgs = tempMsgs.filter(m => !serverIds.has(m.id))
        
        const merged = [...serverMsgs, ...remainingTempMsgs]
        merged.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        
        // 优化：批量标记已读，减少API调用
        const unreadMsgs = serverMsgs.filter(m => m.senderId !== myId && m.status !== 'read')
        if (unreadMsgs.length > 0) {
          unreadMsgs.forEach(m => {
            updateMessageStatus(m.id, 'read')
          })
        }
        
        return merged
      })
    }
    
    pollingRef.current = setInterval(pollAndSync, 10000)
    
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [peerId, myId, initialized])

  // 发送消息 - 优化：添加发送中状态和错误处理
  const send = useCallback(async () => {
    if (!text.trim() || sending || !myId || !peerId) return
    
    setSending(true)
    const content = text.trim()
    const tempId = `t${Date.now()}`
    setText('')
    
    const tempMsg = { 
      id: tempId, 
      senderId: myId,
      receiverId: peerId,
      text: content, 
      type: 'text', 
      status: 'sending',  // 发送中状态
      timestamp: new Date() 
    }
    
    setMsgs(prev => {
      const newList = [...prev, tempMsg]
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      return newList
    })
    
    try {
      const sent = await postMessage(myId, peerId, content)
      if (sent) {
        // 优化：先显示发送成功，再1秒后显示已送达
        setMsgs(prev => prev.map(m => m.id === tempId ? { ...sent, status: 'sent' } : m))
        setTimeout(() => {
          setMsgs(prev => prev.map(m => m.id === sent.id ? { ...m, status: 'delivered' } : m))
        }, 1000)
      } else {
        // 发送失败，显示错误状态
        setMsgs(prev => prev.map(m => m.id === tempId ? { ...m, status: 'failed' } : m))
      }
    } catch (e) {
      console.error('Send error:', e)
      setMsgs(prev => prev.map(m => m.id === tempId ? { ...m, status: 'failed' } : m))
    }
    
    setSending(false)
    textareaRef.current?.focus()
  }, [text, sending, myId, peerId])

  // 发送图片
  const sendImg = useCallback(async () => {
    if (sending || !myId || !peerId) return
    
    try {
      const file = await selectImage()
      if (!file) return
      if (!isValidImageType(file)) { alert('请选择 JPG、PNG 或 GIF'); return }
      if (!isValidImageSize(file, 3)) { alert('图片不能超过 3MB'); return }
      
      setSending(true)
      const dataUrl = await compressImage(file, 300, 300, 0.5)
      const tempId = `t${Date.now()}`
      
      const tempMsg = { 
        id: tempId, 
        senderId: myId,
        receiverId: peerId,
        text: dataUrl, 
        type: 'image', 
        status: 'sending',
        timestamp: new Date() 
      }
      
      setMsgs(prev => [...prev, tempMsg])
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      
      const sent = await postMessage(myId, peerId, dataUrl, 'image')
      if (sent) {
        setMsgs(prev => prev.map(m => m.id === tempId ? { ...sent, status: 'delivered' } : m))
      } else {
        setMsgs(prev => prev.filter(m => m.id !== tempId))
      }
    } catch (e) {
      console.error('Send image error:', e)
    }
    
    setSending(false)
  }, [sending, myId, peerId])

  // 渲染消息列表
  const renderMessages = () => {
    const elements: React.ReactNode[] = []
    let lastDate = ''
    
    msgs.forEach((m, i) => {
      const msgDate = new Date(m.timestamp).toDateString()
      
      // 显示日期分隔
      if (msgDate !== lastDate) {
        elements.push(<TimeSeparator key={`sep-${m.id}`} date={new Date(m.timestamp)} />)
        lastDate = msgDate
      }
      
      // 显示时间分隔（5分钟以上）
      const prevMsg = msgs[i - 1]
      if (shouldShowTimeSeparator(m, prevMsg, myId)) {
        // 时间变化时自然分隔，不需要额外UI
      }
      
      elements.push(
        <Bubble key={m.id} msg={m} isOwn={m.senderId === myId} onImg={setImg} />
      )
    })
    
    return elements
  }

  if (!peerId) {
    return (
      <AnimatedBackground variant="romance">
        <div className="min-h-screen flex flex-col items-center justify-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-xl font-bold">未找到用户</h1>
          <Link href="/chat" className="mt-4 px-4 py-2 bg-rose-500 text-white rounded-full">返回</Link>
        </div>
      </AnimatedBackground>
    )
  }

  return (
    <AnimatedBackground variant="romance">
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-rose-50 via-pink-50 to-purple-50">
        {/* 头部 */}
        <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100">
          <div className="flex items-center gap-3 px-4 py-3">
            <Link href="/chat" className="p-1.5 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            {peer?.avatar ? (
              <img src={peer.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                {peer?.name?.[0] || peerName[0] || '?'}
              </div>
            )}
            <div className="flex-1">
              <h1 className="font-bold text-gray-900">{peer?.name || peerName}</h1>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                {peerTyping ? (
                  <span className="text-rose-500">正在输入...</span>
                ) : isOnline ? (
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span>在线</span>
                ) : (
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-gray-400 rounded-full"></span>离线</span>
                )}
              </div>
            </div>
            {/* 语音通话按钮 */}
            {myId && (
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/call/initiate', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        callerId: myId,
                        calleeId: peerId
                      })
                    })
                    const data = await response.json()
                    if (data.success) {
                      handleInitiateCall(data.roomId)
                    } else {
                      alert(data.error || '发起呼叫失败')
                    }
                  } catch (error) {
                    console.error('Call error:', error)
                    alert('网络错误，请稍后重试')
                  }
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="语音通话"
              >
                <Phone className="w-5 h-5 text-gray-600" />
              </button>
            )}
            {/* 视频通话按钮 */}
            {myId && (
              <VideoCallButton
                peerId={peerId}
                peerName={peer?.name || peerName}
                currentUserId={myId}
                onCallInitiated={(roomId) => {
                  setVideoCallRoomId(roomId)
                  setVideoCallIsCaller(true)
                  setVideoCallModalVisible(true)
                }}
                onError={(error) => {
                  alert(error)
                }}
              />
            )}
          </div>
        </div>

        {/* 消息区域 */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {!initialized ? (
            <MessagesSkeleton />
          ) : msgs.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="text-4xl mb-2">💕</div>
                <div className="text-gray-500">开始你们的聊天吧～</div>
              </div>
            </div>
          ) : (
            renderMessages()
          )}
          <div ref={endRef} />
        </div>

        {/* 输入区域 */}
        <div className="sticky bottom-0 bg-white/90 backdrop-blur-xl border-t px-4 py-3">
          {!isOnline && (
            <div className="mb-2 px-3 py-1.5 bg-red-100 text-red-600 rounded-lg flex items-center gap-2 text-sm">
              <WifiOff className="w-4 h-4" />
              网络连接已断开，消息可能发送失败
            </div>
          )}
          <div className="flex items-end gap-2">
            <button onClick={sendImg} disabled={sending || !isOnline} className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50">
              <Image className="w-6 h-6 text-gray-500" />
            </button>
            <textarea 
              ref={textareaRef} 
              value={text} 
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="发送消息..." 
              rows={1}
              className="flex-1 px-4 py-2.5 bg-gray-100/50 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-rose-300 text-sm"
              style={{ minHeight: '40px', maxHeight: '80px' }}
            />
            <button 
              onClick={send} 
              disabled={!text.trim() || sending || !isOnline}
              className="p-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full shadow-lg disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 图片预览 */}
        <AnimatePresence>
          {img && (
            <motion.div 
              className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setImg(null)}
            >
              <button className="absolute top-4 right-4 p-2 bg-white/20 rounded-full text-white">
                <X className="w-6 h-6" />
              </button>
              <img src={img} alt="" className="max-w-full max-h-full object-contain" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 语音通话弹窗 */}
        {currentRoomId && (
          <VoiceCallModal
            visible={callModalVisible}
            mode={callMode}
            roomId={currentRoomId}
            peerName={peer?.name || peerName}
            peerAvatar={peer?.avatar}
            currentUserId={myId}
            onAccept={handleCallAccept}
            onEnd={handleCallEnd}
            onClose={handleCallClose}
          />
        )}

        {/* 视频通话弹窗 */}
        {videoCallRoomId && (
          <VideoCallModal
            isOpen={videoCallModalVisible}
            roomId={videoCallRoomId}
            peerId={peerId}
            peerName={peer?.name || peerName}
            currentUserId={myId}
            isCaller={videoCallIsCaller}
            onClose={() => setVideoCallModalVisible(false)}
            onCallEnded={() => {
              setVideoCallRoomId(null)
              setVideoCallModalVisible(false)
            }}
          />
        )}
      </div>
    </AnimatedBackground>
  )
}

// 主页面组件
function ChatPageContent() {
  const searchParams = useSearchParams()
  const { currentUser, isLoading } = useAuth()
  
  const peerId = searchParams?.get('userId') || ''
  const peerName = searchParams?.get('nickname') || '用户'
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="text-rose-500 flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          正在加载...
        </div>
      </div>
    )
  }
  
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="text-center">
          <div className="text-rose-500 mb-4">请先登录</div>
          <Link href="/login" className="text-rose-500 underline">去登录</Link>
        </div>
      </div>
    )
  }
  
  if (!peerId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="text-center">
          <div className="text-rose-500 mb-4">无效的聊天对象</div>
          <Link href="/" className="text-rose-500 underline">返回首页</Link>
        </div>
      </div>
    )
  }
  
  return <ChatContent peerId={peerId} peerName={peerName} />
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="text-rose-500">加载中...</div>
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  )
}
