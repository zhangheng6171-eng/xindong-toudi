'use client'

import { useState, useRef, useEffect, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, Image, Mic, Phone, Video,
  ArrowLeft, Smile, MoreVertical,
  Heart, Sparkles, ChevronDown
} from 'lucide-react'
import Link from 'next/link'
import { 
  AnimatedBackground, 
  GlassCard, 
  GradientText,
  FadeIn 
} from '@/components/animated-background'

interface Message {
  id: string
  senderId: string
  text: string
  timestamp: Date
  status: 'sending' | 'sent' | 'read'
  type: 'text' | 'image' | 'system'
}

export default function ChatContent({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = use(params)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: 'system',
      text: '🎉 你们匹配成功！匹配度92%，打开话题聊聊吧～',
      timestamp: new Date(Date.now() - 3600000),
      status: 'read',
      type: 'system'
    },
    {
      id: '2',
      senderId: 'other',
      text: '你好呀！很高兴认识你 😊',
      timestamp: new Date(Date.now() - 3000000),
      status: 'read',
      type: 'text'
    },
    {
      id: '3',
      senderId: 'me',
      text: '嗨！我也很高兴认识你，看了我们的匹配分析，发现我们价值观真的很像呢！',
      timestamp: new Date(Date.now() - 2400000),
      status: 'read',
      type: 'text'
    },
  ])

  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const matchedUser = {
    id: matchId,
    nickname: '小红',
    age: 26,
    city: '北京',
    score: 92,
    isOnline: true,
    lastActive: '刚刚在线'
  }

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = () => {
    if (!inputText.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      text: inputText,
      timestamp: new Date(),
      status: 'sending',
      type: 'text'
    }

    setMessages(prev => [...prev, newMessage])
    setInputText('')
    setShowSuggestions(false)

    setTimeout(() => {
      setMessages(prev => 
        prev.map(m => m.id === newMessage.id ? { ...m, status: 'sent' } : m)
      )
    }, 500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <AnimatedBackground variant="romance" showFloatingHearts={false} showParticles={true}>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <FadeIn>
          <header className="bg-white/80 backdrop-blur-xl border-b border-rose-100/50 px-4 py-3 flex items-center">
            <Link href="/dashboard" className="p-2 -ml-2 text-gray-600 hover:text-rose-500 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            
            <div className="flex-1 flex items-center ml-2">
              <div className="relative">
                <motion.div 
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-rose-500/30"
                  whileHover={{ scale: 1.05 }}
                >
                  {matchedUser.nickname[0]}
                </motion.div>
                {matchedUser.isOnline && (
                  <motion.div 
                    className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </div>
              
              <div className="ml-3">
                <div className="flex items-center">
                  <h1 className="font-bold text-gray-900">{matchedUser.nickname}</h1>
                  <span className="ml-2 text-xs bg-gradient-to-r from-rose-500 to-pink-500 text-white px-2 py-0.5 rounded-full shadow-sm">
                    {matchedUser.score}% 匹配
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {matchedUser.isOnline ? (
                    <span className="text-green-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      在线
                    </span>
                  ) : matchedUser.lastActive}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <motion.button 
                className="p-2 text-gray-400 hover:text-rose-500 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Phone className="w-5 h-5" />
              </motion.button>
              <motion.button 
                className="p-2 text-gray-400 hover:text-rose-500 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Video className="w-5 h-5" />
              </motion.button>
              <motion.button 
                className="p-2 text-gray-400 hover:text-rose-500 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <MoreVertical className="w-5 h-5" />
              </motion.button>
            </div>
          </header>
        </FadeIn>

        {/* Match Info Banner */}
        <FadeIn delay={0.1}>
          <div className="bg-gradient-to-r from-rose-50/90 to-pink-50/90 backdrop-blur-sm px-4 py-3 border-b border-rose-100/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <Sparkles className="w-4 h-4 text-rose-500 mr-2" />
                <span>你们有<strong className="text-gray-900">价值观高度契合</strong>的共同点</span>
              </div>
              <button className="text-xs font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                查看详情
              </button>
            </div>
          </div>
        </FadeIn>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} isOwn={message.senderId === 'me'} />
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div className="flex items-start" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-xs mr-2 shadow-md shadow-rose-500/20">
                {matchedUser.nickname[0]}
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
          {showSuggestions && messages.length <= 4 && (
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
        {inputText.length === 0 && messages.length > 4 && (
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
          <div className="flex items-end space-x-3">
            <div className="flex space-x-2">
              <motion.button 
                className="p-2 text-gray-400 hover:text-rose-500 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Image className="w-6 h-6" />
              </motion.button>
              <motion.button 
                className="p-2 text-gray-400 hover:text-rose-500 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Mic className="w-6 h-6" />
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
              <button className="absolute right-2 bottom-2 p-1 text-gray-400 hover:text-rose-500 transition-colors">
                <Smile className="w-5 h-5" />
              </button>
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

function MessageBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
  const formatTime = (date: Date) => date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

  if (message.type === 'system') {
    return (
      <motion.div className="text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <span className="text-xs text-gray-500 bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm border border-rose-100/30">{message.text}</span>
      </motion.div>
    )
  }

  return (
    <motion.div className={`flex items-start ${isOwn ? 'flex-row-reverse' : ''}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className={`max-w-[70%] ${isOwn ? 'ml-2' : 'mr-2'}`}>
        <div className={`px-4 py-3 rounded-2xl ${
          isOwn 
            ? 'bg-gradient-to-br from-rose-500 to-pink-500 text-white rounded-br-none shadow-lg shadow-rose-500/20' 
            : 'bg-white/80 backdrop-blur-sm text-gray-900 shadow-sm rounded-bl-none border border-rose-100/30'
        }`}>
          <p className="whitespace-pre-wrap">{message.text}</p>
        </div>
        <div className={`flex items-center mt-1 text-xs text-gray-400 ${isOwn ? 'justify-end' : ''}`}>
          <span>{formatTime(message.timestamp)}</span>
          {isOwn && message.status !== 'sending' && (
            <span className="ml-1">{message.status === 'read' ? <span className="text-rose-500">✓✓</span> : '✓'}</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
