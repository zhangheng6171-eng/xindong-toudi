'use client'

import { useState, useRef, useEffect, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, Paperclip, Smile, MoreVertical, 
  ArrowLeft, Image, Mic, Phone, Video,
  Heart, ThumbsUp, Sparkles, ChevronDown
} from 'lucide-react'
import Link from 'next/link'

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
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center">
        <Link href="/dashboard" className="p-2 -ml-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        
        <div className="flex-1 flex items-center ml-2">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
              {matchedUser.nickname[0]}
            </div>
            {matchedUser.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>
          
          <div className="ml-3">
            <div className="flex items-center">
              <h1 className="font-bold text-gray-900">{matchedUser.nickname}</h1>
              <span className="ml-2 text-xs text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">
                {matchedUser.score}% 匹配
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {matchedUser.isOnline ? '在线' : matchedUser.lastActive}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Match Info Banner */}
      <div className="bg-gradient-to-r from-rose-50 to-pink-50 px-4 py-3 border-b border-rose-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600">
            <Sparkles className="w-4 h-4 text-rose-500 mr-2" />
            <span>你们有<strong className="text-gray-900">价值观高度契合</strong>的共同点</span>
          </div>
          <button className="text-xs text-rose-500 font-medium">
            查看详情
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} isOwn={message.senderId === 'me'} />
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div className="flex items-start" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-xs mr-2">
              {matchedUser.nickname[0]}
            </div>
            <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-gray-300 rounded-full"
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
            className="px-4 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 border-t border-purple-100"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">💡 话题推荐</span>
              <button onClick={() => setShowSuggestions(false)} className="text-gray-400 hover:text-gray-600">
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {topicSuggestions.map((topic, index) => (
                <button
                  key={index}
                  onClick={() => { setInputText(topic.text); inputRef.current?.focus(); }}
                  className="px-3 py-2 bg-white rounded-full text-sm text-gray-700 hover:bg-purple-100 hover:text-purple-700 transition-colors shadow-sm"
                >
                  {topic.emoji} {topic.text}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Replies */}
      {inputText.length === 0 && messages.length > 4 && (
        <div className="px-4 py-2 border-t border-gray-100">
          <div className="flex space-x-2 overflow-x-auto pb-1">
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => { setInputText(reply); inputRef.current?.focus(); }}
                className="flex-shrink-0 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600 hover:bg-gray-200 transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-gray-100 px-4 py-3">
        <div className="flex items-end space-x-3">
          <div className="flex space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Image className="w-6 h-6" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Mic className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="发送消息..."
              rows={1}
              className="w-full px-4 py-3 bg-gray-100 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-rose-300 focus:bg-white transition-all"
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
            <button className="absolute right-2 bottom-2 p-1 text-gray-400 hover:text-gray-600">
              <Smile className="w-5 h-5" />
            </button>
          </div>

          <motion.button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className="p-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
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

function MessageBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
  const formatTime = (date: Date) => date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

  if (message.type === 'system') {
    return (
      <motion.div className="text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{message.text}</span>
      </motion.div>
    )
  }

  return (
    <motion.div className={`flex items-start ${isOwn ? 'flex-row-reverse' : ''}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className={`max-w-[70%] ${isOwn ? 'ml-2' : 'mr-2'}`}>
        <div className={`px-4 py-3 rounded-2xl ${isOwn ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-br-none' : 'bg-white text-gray-900 shadow-sm rounded-bl-none'}`}>
          <p className="whitespace-pre-wrap">{message.text}</p>
        </div>
        <div className={`flex items-center mt-1 text-xs text-gray-400 ${isOwn ? 'justify-end' : ''}`}>
          <span>{formatTime(message.timestamp)}</span>
          {isOwn && message.status !== 'sending' && (
            <span className="ml-1">{message.status === 'read' ? <span className="text-blue-500">✓✓</span> : '✓'}</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
