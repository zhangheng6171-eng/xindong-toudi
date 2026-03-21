'use client'

import { useState, useRef, useEffect, Suspense, memo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Send, Image, Smile, MoreVertical, Check, X, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AnimatedBackground } from '@/components/animated-background'
import { useAuth } from '@/hooks/useAuth'
import { selectImage, isValidImageType, isValidImageSize, compressImage } from '@/lib/image-utils'

// Supabase 配置
const SUPABASE_URL = 'https://ntaqnyegiiwtzdyqjiwy.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50YXFueWVnaWl3dHpkeXFqaXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTY4NzUsImV4cCI6MjA4OTQ5Mjg3NX0.4FEAb1Yd4xOwXz3LcfZ9iPG0ZZPbFd8dfry903c5lPc'

const api = (url: string) => fetch(`${SUPABASE_URL}${url}`, {
  headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
})

// 获取用户信息
async function getUserInfo(uid: string) {
  try {
    const res = await api(`/rest/v1/users?id=eq.${uid}&select=id,nickname,avatar`)
    const data = await res.json()
    return Array.isArray(data) && data[0] ? data[0] : null
  } catch { return null }
}

// 获取聊天消息
async function getMessages(uid1: string, uid2: string) {
  try {
    const res = await api(`/rest/v1/messages?or=(and(sender_id.eq.${uid1},receiver_id.eq.${uid2}),and(sender_id.eq.${uid2},receiver_id.eq.${uid1}))&select=id,sender_id,content,type,created_at,status&order=created_at.asc&limit=50`)
    const data = await res.json()
    if (!Array.isArray(data)) return []
    return data.map((m: any) => ({
      id: m.id,
      senderId: m.sender_id,
      text: m.content,
      type: m.type || 'text',
      timestamp: new Date(m.created_at),
      status: 'sent'
    }))
  } catch { return [] }
}

// 发送消息
async function sendMessage(from: string, to: string, text: string, type = 'text') {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
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
      text: m.content,
      type: m.type || 'text',
      timestamp: new Date(m.created_at),
      status: 'sent'
    }
  } catch { return null }
}

// 消息气泡组件
const MessageBubble = memo(function MessageBubble({ 
  msg, isOwn, onImgClick 
}: { 
  msg: any; 
  isOwn: boolean; 
  onImgClick?: (url: string) => void 
}) {
  const time = new Date(msg.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
        isOwn 
          ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-br-md' 
          : 'bg-white/90 text-gray-800 rounded-bl-md shadow-sm'
      }`}>
        {msg.type === 'image' 
          ? <img src={msg.text} alt="" className="rounded-lg max-w-full cursor-pointer" onClick={() => onImgClick?.(msg.text)} />
          : <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
        }
        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className={`text-xs ${isOwn ? 'text-white/70' : 'text-gray-400'}`}>{time}</span>
          {isOwn && msg.status === 'sending' && <Loader2 className="w-3 h-3 text-white/70 animate-spin" />}
        </div>
      </div>
    </div>
  )
})

function ChatContent() {
  const params = useSearchParams()
  const { currentUser } = useAuth()
  
  const peerId = params.get('userId') || ''
  const peerName = params.get('nickname') || '用户'
  const myId = currentUser?.id || ''
  
  const [peer, setPeer] = useState<{ id: string; name: string; avatar: string | null } | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [previewImg, setPreviewImg] = useState<string | null>(null)
  
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const loadedRef = useRef(false)
  const lastMsgCountRef = useRef(0)

  const emojis = ['😊', '😍', '🥰', '😘', '❤️', '💕', '💖', '✨', '🌟', '🔥', '💯', '🎉', '😄', '😂', '😎', '🤩']

  // 加载对方信息（只执行一次）
  useEffect(() => {
    if (!peerId || loadedRef.current) return
    loadedRef.current = true
    
    const load = async () => {
      const u = await getUserInfo(peerId)
      setPeer({
        id: peerId,
        name: u?.nickname || peerName,
        avatar: u?.avatar || null
      })
      
      // 加载初始消息
      if (myId) {
        const msgs = await getMessages(myId, peerId)
        setMessages(msgs)
        lastMsgCountRef.current = msgs.length
      }
    }
    load()
  }, [peerId, peerName, myId])

  // 定期刷新消息（10秒间隔，减少请求）
  useEffect(() => {
    if (!peerId || !myId) return
    
    const timer = setInterval(async () => {
      const msgs = await getMessages(myId, peerId)
      if (msgs.length > lastMsgCountRef.current) {
        setMessages(msgs)
        lastMsgCountRef.current = msgs.length
      }
    }, 10000)
    
    return () => clearInterval(timer)
  }, [peerId, myId])

  // 滚动到底部
  useEffect(() => {
    if (messages.length > lastMsgCountRef.current) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length])

  // 发送消息
  const handleSend = async () => {
    if (!input.trim() || sending || !myId || !peerId) return
    
    setSending(true)
    const text = input.trim()
    const tempId = `t${Date.now()}`
    
    setInput('')
    setMessages(prev => [...prev, { id: tempId, senderId: myId, text, type: 'text', timestamp: new Date(), status: 'sending' }])
    
    const sent = await sendMessage(myId, peerId, text)
    if (sent) {
      setMessages(prev => prev.map(m => m.id === tempId ? sent : m))
    }
    
    lastMsgCountRef.current = messages.length + 1
    setSending(false)
  }

  // 发送图片
  const handleSendImage = async () => {
    if (sending || !myId || !peerId) return
    
    try {
      const file = await selectImage()
      if (!file) return
      if (!isValidImageType(file)) { alert('请选择 JPG、PNG 或 GIF'); return }
      if (!isValidImageSize(file, 3)) { alert('图片不能超过 3MB'); return }
      
      const dataUrl = await compressImage(file, 300, 300, 0.5)
      const tempId = `t${Date.now()}`
      
      setMessages(prev => [...prev, { id: tempId, senderId: myId, text: dataUrl, type: 'image', timestamp: new Date(), status: 'sending' }])
      
      const sent = await sendMessage(myId, peerId, dataUrl, 'image')
      if (sent) {
        setMessages(prev => prev.map(m => m.id === tempId ? sent : m))
      }
    } catch (e) {
      console.error(e)
    }
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
        
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100">
          <div className="flex items-center gap-3 px-4 py-3">
            <Link href="/chat" className="p-1.5 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            
            {/* 头像显示 */}
            <div className="relative">
              {peer?.avatar ? (
                <img src={peer.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                  {peer?.name?.[0] || '?'}
                </div>
              )}
            </div>
            
            <div>
              <h1 className="font-bold text-gray-900">{peer?.name || peerName}</h1>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          <div className="flex justify-center">
            <div className="px-4 py-2 bg-gray-100/80 rounded-full text-sm text-gray-500">🎉 开始聊天吧～</div>
          </div>
          
          {messages.map(m => (
            <MessageBubble key={m.id} msg={m} isOwn={m.senderId === myId} onImgClick={setPreviewImg} />
          ))}
          <div ref={endRef} />
        </div>

        {/* Emoji */}
        <AnimatePresence>
          {false && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="bg-white/90 border-t px-4 py-2">
              <div className="flex flex-wrap gap-1">
                {emojis.map((e, i) => (
                  <button key={i} onClick={() => setInput(p => p + e)} className="w-8 h-8 text-lg hover:bg-gray-100 rounded">{e}</button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        <div className="sticky bottom-0 bg-white/90 backdrop-blur-xl border-t px-4 py-3">
          <div className="flex items-end gap-2">
            <button onClick={() => {}} className="p-2 hover:bg-gray-100 rounded-full">
              <Smile className="w-6 h-6 text-gray-500" />
            </button>
            <button onClick={handleSendImage} disabled={sending} className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50">
              <Image className="w-6 h-6 text-gray-500" />
            </button>
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder="输入消息..." rows={1}
              className="flex-1 px-4 py-2.5 bg-gray-100/50 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-rose-300 text-sm"
              style={{ minHeight: '40px', maxHeight: '80px' }} />
            <button onClick={handleSend} disabled={!input.trim() || sending}
              className="p-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full shadow-lg disabled:opacity-50">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview */}
        <AnimatePresence>
          {previewImg && (
            <motion.div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPreviewImg(null)}>
              <button className="absolute top-4 right-4 p-2 bg-white/20 rounded-full text-white">
                <X className="w-6 h-6" />
              </button>
              <img src={previewImg} alt="" className="max-w-full max-h-full object-contain" />
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
        <div className="text-rose-500">加载中...</div>
      </div>
    }>
      <ChatContent />
    </Suspense>
  )
}
