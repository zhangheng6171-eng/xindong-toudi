'use client'

import { useState, useRef, useEffect, Suspense, memo, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Send, Image, Check, X, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AnimatedBackground } from '@/components/animated-background'
import { useAuth } from '@/hooks/useAuth'
import { selectImage, isValidImageType, isValidImageSize, compressImage } from '@/lib/image-utils'

// Supabase 配置
const SUPABASE = 'https://ntaqnyegiiwtzdyqjiwy.supabase.co'
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50YXFueWVnaWl3dHpkeXFqaXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTY4NzUsImV4cCI6MjA4OTQ5Mjg3NX0.4FEAb1Yd4xOwXz3LcfZ9iPG0ZZPbFd8dfry903c5lPc'

// 缓存用户信息
const userCache = new Map<string, { data: any; time: number }>()
const CACHE_TTL = 60000 // 1分钟缓存

async function fetchUser(uid: string) {
  const cached = userCache.get(uid)
  if (cached && Date.now() - cached.time < CACHE_TTL) return cached.data
  
  const res = await fetch(`${SUPABASE}/rest/v1/users?id=eq.${uid}&select=id,nickname,avatar`, {
    headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}` }
  })
  const data = await res.json()
  const user = Array.isArray(data) && data[0] ? data[0] : null
  userCache.set(uid, { data: user, time: Date.now() })
  return user
}

async function fetchMessages(uid1: string, uid2: string) {
  const res = await fetch(
    `${SUPABASE}/rest/v1/messages?or=(and(sender_id.eq.${uid1},receiver_id.eq.${uid2}),and(sender_id.eq.${uid2},receiver_id.eq.${uid1}))&select=id,sender_id,content,type,created_at&order=created_at.asc&limit=50`,
    { headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}` } }
  )
  const data = await res.json()
  if (!Array.isArray(data)) return []
  return data.map((m: any) => ({
    id: m.id,
    senderId: m.sender_id,
    text: m.content,
    type: m.type || 'text',
    timestamp: new Date(m.created_at)
  }))
}

async function postMessage(from: string, to: string, text: string, type = 'text') {
  const res = await fetch(`${SUPABASE}/rest/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': KEY,
      'Authorization': `Bearer ${KEY}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ sender_id: from, receiver_id: to, content: text, type, status: 'sent' })
  })
  if (!res.ok) return null
  const data = await res.json()
  const m = Array.isArray(data) ? data[0] : data
  return { id: m.id, senderId: m.sender_id, text: m.content, type: m.type || 'text', timestamp: new Date(m.created_at), status: 'sent' }
}

// 消息气泡
const Bubble = memo(function Bubble({ msg, isOwn, onImg }: { msg: any; isOwn: boolean; onImg?: (url: string) => void }) {
  const time = new Date(msg.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${isOwn ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-br-md' : 'bg-white text-gray-800 rounded-bl-md shadow-sm'}`}>
        {msg.type === 'image' ? (
          <img src={msg.text} alt="" className="rounded-lg max-w-full" onClick={() => onImg?.(msg.text)} />
        ) : (
          <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
        )}
        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className={`text-xs ${isOwn ? 'text-white/70' : 'text-gray-400'}`}>{time}</span>
          {isOwn && msg.status === 'sending' && <Loader2 className="w-3 h-3 text-white/70 animate-spin" />}
        </div>
      </div>
    </div>
  )
})

function Chat() {
  const params = useSearchParams()
  const { currentUser } = useAuth()
  
  const peerId = params.get('userId') || ''
  const peerName = params.get('nickname') || '用户'
  const myId = currentUser?.id || ''
  
  const [peer, setPeer] = useState<{ name: string; avatar: string | null } | null>(null)
  const [msgs, setMsgs] = useState<any[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [img, setImg] = useState<string | null>(null)
  
  const endRef = useRef<HTMLDivElement>(null)
  const initRef = useRef(false)
  const lastCount = useRef(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 初始化加载 - 当 myId 可用时立即加载
  useEffect(() => {
    console.log('[Chat] Init effect:', { peerId, myId, initRef: initRef.current })
    if (!peerId || initRef.current || !myId) return
    initRef.current = true
    
    Promise.all([
      fetchUser(peerId),
      fetchMessages(myId, peerId)
    ]).then(([user, messages]) => {
      setPeer({ name: user?.nickname || peerName, avatar: user?.avatar || null })
      setMsgs(messages)
      lastCount.current = messages.length
      // 初始滚动到底部
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'auto' }), 100)
    })
  }, [peerId, peerName, myId])

  // 轮询刷新（15秒间隔，减少服务器压力）
  useEffect(() => {
    if (!peerId || !myId) return
    
    console.log('[Chat] Starting poll for:', { peerId, myId })
    
    const poll = setInterval(async () => {
      const newMsgs = await fetchMessages(myId, peerId)
      if (newMsgs.length > lastCount.current) {
        setMsgs(newMsgs)
        lastCount.current = newMsgs.length
        // 新消息时滚动到底部
        endRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
    }, 15000)
    
    return () => clearInterval(poll)
  }, [peerId, myId])

  // 发送
  const send = useCallback(async () => {
    console.log('[Chat] Send attempt:', { text: text.trim(), sending, myId, peerId })
    if (!text.trim() || sending || !myId || !peerId) {
      console.log('[Chat] Send blocked:', { noText: !text.trim(), sending, noMyId: !myId, noPeerId: !peerId })
      return
    }
    
    setSending(true)
    const content = text.trim()
    const tempId = `t${Date.now()}`
    
    setText('')
    setMsgs(prev => [...prev, { id: tempId, senderId: myId, text: content, type: 'text', timestamp: new Date(), status: 'sending' }])
    
    // 滚动到底部
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    
    console.log('[Chat] Calling postMessage:', { myId, peerId, content })
    const sent = await postMessage(myId, peerId, content)
    console.log('[Chat] postMessage result:', sent)
    if (sent) {
      setMsgs(prev => prev.map(m => m.id === tempId ? sent : m))
      lastCount.current++
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
      
      const dataUrl = await compressImage(file, 300, 300, 0.5)
      const tempId = `t${Date.now()}`
      
      setMsgs(prev => [...prev, { id: tempId, senderId: myId, text: dataUrl, type: 'image', timestamp: new Date(), status: 'sending' }])
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      
      const sent = await postMessage(myId, peerId, dataUrl, 'image')
      if (sent) {
        setMsgs(prev => prev.map(m => m.id === tempId ? sent : m))
        lastCount.current++
      }
    } catch (e) {
      console.error(e)
    }
  }, [sending, myId, peerId])

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
            
            {peer?.avatar ? (
              <img src={peer.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                {peer?.name?.[0] || peerName[0] || '?'}
              </div>
            )}
            
            <h1 className="font-bold text-gray-900">{peer?.name || peerName}</h1>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          <div className="flex justify-center">
            <div className="px-4 py-2 bg-gray-100/80 rounded-full text-sm text-gray-500">🎉 开始聊天吧～</div>
          </div>
          
          {msgs.map(m => (
            <Bubble key={m.id} msg={m} isOwn={m.senderId === myId} onImg={setImg} />
          ))}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="sticky bottom-0 bg-white/90 backdrop-blur-xl border-t px-4 py-3">
          <div className="flex items-end gap-2">
            <button onClick={sendImg} disabled={sending} className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50">
              <Image className="w-6 h-6 text-gray-500" />
            </button>
            <textarea ref={textareaRef} value={text} onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="输入消息..." rows={1}
              className="flex-1 px-4 py-2.5 bg-gray-100/50 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-rose-300 text-sm"
              style={{ minHeight: '40px', maxHeight: '80px' }} />
            <button onClick={send} disabled={!text.trim() || sending}
              className="p-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full shadow-lg disabled:opacity-50">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview */}
        <AnimatePresence>
          {img && (
            <motion.div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setImg(null)}>
              <button className="absolute top-4 right-4 p-2 bg-white/20 rounded-full text-white">
                <X className="w-6 h-6" />
              </button>
              <img src={img} alt="" className="max-w-full max-h-full object-contain" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatedBackground>
  )
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="text-rose-500">加载中...</div>
      </div>
    }>
      <Chat />
    </Suspense>
  )
}
