'use client'

import { useState, useRef, useEffect, Suspense, useMemo, memo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Send, Image, Smile, MoreVertical, Check, X, ChevronDown, Loader2, Circle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AnimatedBackground } from '@/components/animated-background'
import { useAuth } from '@/hooks/useAuth'
import { selectImage, isValidImageType, isValidImageSize, compressImage } from '@/lib/image-utils'

// Supabase 配置
const SUPABASE_URL = 'https://ntaqnyegiiwtzdyqjiwy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50YXFueWVnaWl3dHpkeXFqaXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTY4NzUsImV4cCI6MjA4OTQ5Mjg3NX0.4FEAb1Yd4xOwXz3LcfZ9iPG0ZZPbFd8dfry903c5lPc'

// 在线状态存储
const ONLINE_KEY = 'xindong_online'
const getOnlineMap = () => {
  try {
    return JSON.parse(localStorage.getItem(ONLINE_KEY) || '{}')
  } catch { return {} }
}
const setOnline = (uid: string) => {
  const map = getOnlineMap()
  map[uid] = Date.now()
  localStorage.setItem(ONLINE_KEY, JSON.stringify(map))
}
const isOnline = (uid: string) => {
  const map = getOnlineMap()
  return map[uid] && (Date.now() - map[uid] < 300000) // 5分钟内
}

// API请求缓存
const cache = new Map<string, { data: any; time: number }>()
const CACHE_TTL = 5000 // 5秒缓存

async function cachedFetch(key: string, url: string) {
  const cached = cache.get(key)
  if (cached && (Date.now() - cached.time < CACHE_TTL)) {
    return cached.data
  }
  
  const res = await fetch(url, {
    headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
  })
  
  if (!res.ok) return null
  const data = await res.json()
  cache.set(key, { data, time: Date.now() })
  return data
}

// 获取消息（带缓存）
async function getMessages(uid1: string, uid2: string) {
  const key = `msgs_${[uid1, uid2].sort().join('_')}`
  const url = `${SUPABASE_URL}/rest/v1/messages?or=(and(sender_id.eq.${uid1},receiver_id.eq.${uid2}),and(sender_id.eq.${uid2},receiver_id.eq.${uid1}))&select=id,sender_id,content,type,created_at,status&order=created_at.asc&limit=100`
  
  const data = await cachedFetch(key, url)
  if (!Array.isArray(data)) return []
  
  return data.map(m => ({
    id: m.id,
    senderId: m.sender_id,
    text: m.content,
    type: m.type || 'text',
    timestamp: new Date(m.created_at),
    status: m.status || 'sent'
  }))
}

// 发送消息
async function sendMsg(from: string, to: string, text: string, type = 'text') {
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
  
  // 清除缓存，下次获取最新数据
  const key = `msgs_${[from, to].sort().join('_')}`
  cache.delete(key)
  
  return {
    id: m.id,
    senderId: m.sender_id,
    text: m.content,
    type: m.type || 'text',
    timestamp: new Date(m.created_at),
    status: 'sent'
  }
}

// 获取用户信息（带缓存）
async function getUser(uid: string) {
  const key = `user_${uid}`
  const url = `${SUPABASE_URL}/rest/v1/users?id=eq.${uid}&select=id,nickname,avatar,photos`
  const data = await cachedFetch(key, url)
  return Array.isArray(data) && data[0] ? data[0] : null
}

// 消息气泡组件（memo优化）
const MsgBubble = memo(function MsgBubble({ msg, isOwn, onImgClick }: { 
  msg: { id: string; senderId: string; text: string; type: string; timestamp: Date; status: string }
  isOwn: boolean
  onImgClick?: (url: string) => void
}) {
  const time = new Date(msg.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
        isOwn 
          ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-br-md' 
          : 'bg-white/90 text-gray-800 rounded-bl-md shadow-sm'
      }`}>
        {msg.type === 'image' 
          ? <img src={msg.text} alt="" className="rounded-lg max-w-[200px] cursor-pointer" onClick={() => onImgClick?.(msg.text)} />
          : <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
        }
        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className={`text-xs ${isOwn ? 'text-white/70' : 'text-gray-400'}`}>{time}</span>
          {isOwn && msg.status === 'sending' && <Loader2 className="w-3.5 h-3.5 text-white/70 animate-spin" />}
          {isOwn && msg.status === 'sent' && <Check className="w-3.5 h-3.5 text-white/70" />}
        </div>
      </div>
    </div>
  )
})

function ChatContent() {
  const params = useSearchParams()
  const { currentUser } = useAuth()
  
  const peerId = params.get('userId')
  const peerName = params.get('nickname')
  const myId = currentUser?.id || ''
  
  const [peer, setPeer] = useState<{ id: string; name: string; avatar: string | null; online: boolean } | null>(null)
  const [msgs, setMsgs] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [bg, setBg] = useState('romance')
  const [showMenu, setShowMenu] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const [previewImg, setPreviewImg] = useState<string | null>(null)
  
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const loadedRef = useRef(false)

  const emojis = useMemo(() => ['😊', '😍', '🥰', '😘', '❤️', '💕', '💖', '✨', '🌟', '🔥', '💯', '🎉', '😄', '😂', '🤣', '😁', '🤭', '😎', '🤩'], [])

  // 标记在线
  useEffect(() => {
    if (!myId) return
    setOnline(myId)
    const t = setInterval(() => setOnline(myId), 30000)
    return () => clearInterval(t)
  }, [myId])

  // 加载对方信息
  useEffect(() => {
    if (!peerId || loadedRef.current) return
    
    const loadPeer = async () => {
      loadedRef.current = true
      const u = await getUser(peerId)
      setPeer({
        id: peerId,
        name: u?.nickname || peerName || '用户',
        avatar: u?.avatar || u?.photos?.[0] || null,
        online: isOnline(peerId)
      })
      
      // 同时加载消息
      const m = await getMessages(myId, peerId)
      setMsgs(m)
    }
    loadPeer()
  }, [peerId, peerName, myId])

  // 刷新消息和状态
  useEffect(() => {
    if (!peerId || !myId) return
    
    const t = setInterval(async () => {
      const m = await getMessages(myId, peerId)
      setMsgs(prev => {
        const ids = new Set(prev.map(x => x.id))
        const newOnes = m.filter(x => !ids.has(x.id))
        return newOnes.length ? [...prev, ...newOnes] : prev
      })
      
      const online = isOnline(peerId)
      setPeer(p => p && p.online !== online ? { ...p, online } : p)
    }, 5000) // 5秒刷新
    
    return () => clearInterval(t)
  }, [peerId, myId])

  // 滚动
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs.length])

  // 发送
  const send = async () => {
    if (!input.trim() || sending || !myId || !peerId) return
    
    setSending(true)
    const tempId = `t${Date.now()}`
    const text = input.trim()
    setInput('')
    
    setMsgs(prev => [...prev, { id: tempId, senderId: myId, text, type: 'text', timestamp: new Date(), status: 'sending' }])
    
    const sent = await sendMsg(myId, peerId, text)
    if (sent) {
      setMsgs(prev => prev.map(m => m.id === tempId ? sent : m))
    } else {
      setMsgs(prev => prev.map(m => m.id === tempId ? { ...m, status: 'sent' } : m))
    }
    
    setSending(false)
  }

  // 发送图片
  const sendImg = async () => {
    if (sending || !myId || !peerId) return
    
    try {
      const file = await selectImage()
      if (!file) return
      
      if (!isValidImageType(file)) { alert('请选择 JPG、PNG 或 GIF 格式'); return }
      if (!isValidImageSize(file, 3)) { alert('图片不能超过 3MB'); return }
      
      const dataUrl = await compressImage(file, 300, 300, 0.5)
      const tempId = `t${Date.now()}`
      
      setMsgs(prev => [...prev, { id: tempId, senderId: myId, text: dataUrl, type: 'image', timestamp: new Date(), status: 'sending' }])
      
      const sent = await sendMsg(myId, peerId, dataUrl, 'image')
      if (sent) {
        setMsgs(prev => prev.map(m => m.id === tempId ? sent : m))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const backgrounds = {
    romance: 'from-rose-100/50 via-pink-100/50 to-purple-100/50',
    ocean: 'from-blue-100/50 via-cyan-100/50 to-teal-100/50',
    sunset: 'from-orange-100/50 via-rose-100/50 to-pink-100/50',
  }

  if (!peerId) {
    return (
      <AnimatedBackground variant="romance">
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">未找到用户</h1>
          <Link href="/chat" className="px-4 py-2 bg-rose-500 text-white rounded-full">返回</Link>
        </div>
      </AnimatedBackground>
    )
  }

  if (!peer) {
    return (
      <AnimatedBackground variant="romance">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-rose-500">加载中...</div>
        </div>
      </AnimatedBackground>
    )
  }

  return (
    <AnimatedBackground variant="romance">
      <div className="min-h-screen flex flex-col" style={{ backgroundImage: `linear-gradient(to bottom, ${backgrounds[bg as keyof typeof backgrounds]})` }}>
        
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100/50">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Link href="/chat" className="p-1.5 -ml-1.5 hover:bg-gray-100 rounded-full">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div className="relative">
                {peer.avatar 
                  ? <img src={peer.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                  : <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">{peer.name[0]}</div>
                }
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${peer.online ? 'bg-green-500' : 'bg-gray-400'}`} />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">{peer.name}</h1>
                <div className="flex items-center gap-1">
                  <Circle className={`w-2 h-2 ${peer.online ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'}`} />
                  <p className={`text-xs ${peer.online ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                    {peer.online ? '在线' : '离线'}
                  </p>
                </div>
              </div>
            </div>
            <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-gray-100 rounded-full">
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <AnimatePresence>
            {showMenu && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="absolute right-4 top-16 bg-white rounded-xl shadow-xl border py-2 z-50">
                <p className="px-4 py-1 text-xs text-gray-400">聊天背景</p>
                {Object.keys(backgrounds).map(k => (
                  <button key={k} onClick={() => { setBg(k); setShowMenu(false) }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${bg === k ? 'text-rose-500 font-medium' : 'text-gray-700'}`}>
                    {k === 'romance' && '💕 浪漫'} {k === 'ocean' && '🌊 海洋'} {k === 'sunset' && '🌅 日落'}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          <div className="flex justify-center">
            <div className="px-4 py-2 bg-gray-100/80 rounded-full text-sm text-gray-500">🎉 开始聊天吧～</div>
          </div>
          
          {msgs.map(m => (
            <MsgBubble key={m.id} msg={m} isOwn={m.senderId === myId} onImgClick={setPreviewImg} />
          ))}
          <div ref={endRef} />
        </div>

        {/* Emoji */}
        <AnimatePresence>
          {showEmoji && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="bg-white/80 border-t px-4 py-2">
              <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                {emojis.map((e, i) => (
                  <button key={i} onClick={() => { setInput(p => p + e); inputRef.current?.focus() }} 
                    className="w-8 h-8 text-lg hover:bg-gray-100 rounded">{e}</button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        <div className="sticky bottom-0 bg-white/90 backdrop-blur-xl border-t px-4 py-3">
          <div className="flex items-end gap-2">
            <button onClick={() => setShowEmoji(!showEmoji)} className="p-2 hover:bg-gray-100 rounded-full">
              <Smile className={`w-6 h-6 ${showEmoji ? 'text-rose-500' : 'text-gray-500'}`} />
            </button>
            <button onClick={sendImg} disabled={sending} className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50">
              <Image className="w-6 h-6 text-gray-500" />
            </button>
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="输入消息..." rows={1}
              className="flex-1 px-4 py-2.5 bg-gray-100/50 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-rose-300 text-sm"
              style={{ minHeight: '40px', maxHeight: '80px' }} />
            <button onClick={send} disabled={!input.trim() || sending}
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
