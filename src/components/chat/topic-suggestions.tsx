'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDown, ChevronUp, Sparkles, 
  Heart, Coffee, BookOpen, Music, 
  Plane, Utensils, Film, Gamepad2 
} from 'lucide-react'

interface Topic {
  id: string
  emoji: string
  text: string
  category: string
  reason: string
  score: number // 推荐分数
}

interface TopicSuggestionsProps {
  matchId: string
  onSelect: (topic: string) => void
  onClose?: () => void
  compact?: boolean
}

export default function TopicSuggestions({ 
  matchId, 
  onSelect, 
  onClose,
  compact = false 
}: TopicSuggestionsProps) {
  const [isExpanded, setIsExpanded] = useState(!compact)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // 模拟话题数据
  const topics: Topic[] = [
    { id: '1', emoji: '🎬', text: '最近有什么好看的电影推荐吗？', category: '娱乐', reason: '共同兴趣', score: 95 },
    { id: '2', emoji: '✈️', text: '你最想去的旅行目的地是哪里？', category: '旅行', reason: '都喜欢探索', score: 92 },
    { id: '3', emoji: '🍜', text: '你最喜欢吃什么类型的美食？', category: '美食', reason: '美食话题', score: 88 },
    { id: '4', emoji: '📚', text: '最近在读什么书？有什么推荐吗？', category: '阅读', reason: '知识交流', score: 85 },
    { id: '5', emoji: '🎵', text: '最近单曲循环的歌是什么？', category: '音乐', reason: '音乐共鸣', score: 82 },
    { id: '6', emoji: '☕', text: '你喜欢喝咖啡吗？有没有推荐的咖啡店？', category: '生活', reason: '生活方式', score: 80 },
    { id: '7', emoji: '🎮', text: '你玩什么游戏？我们可以一起！', category: '游戏', reason: '共同爱好', score: 78 },
    { id: '8', emoji: '🏃', text: '平时有运动习惯吗？喜欢什么运动？', category: '运动', reason: '健康生活', score: 75 },
  ]

  const categories = ['全部', '娱乐', '旅行', '美食', '阅读', '音乐', '生活', '游戏', '运动']

  const filteredTopics = selectedCategory && selectedCategory !== '全部'
    ? topics.filter(t => t.category === selectedCategory)
    : topics

  const topTopics = topics.slice(0, 3)

  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-purple-100/50 transition-colors"
      >
        <div className="flex items-center">
          <Sparkles className="w-4 h-4 text-purple-500 mr-2" />
          <span className="text-sm font-medium text-gray-700">
            💡 话题推荐
            {!isExpanded && topTopics.length > 0 && (
              <span className="text-xs text-gray-500 ml-2">
                · {topTopics[0].text.slice(0, 15)}...
              </span>
            )}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Category Tabs */}
            <div className="px-4 pb-2 overflow-x-auto">
              <div className="flex space-x-2">
                {categories.slice(0, 6).map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(
                      category === selectedCategory ? null : 
                      category === '全部' ? null : category
                    )}
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === category || (category === '全部' && !selectedCategory)
                        ? 'bg-purple-500 text-white'
                        : 'bg-white text-gray-600 hover:bg-purple-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Topics */}
            <div className="px-4 pb-4 space-y-2">
              {filteredTopics.slice(0, 6).map((topic) => (
                <motion.button
                  key={topic.id}
                  onClick={() => onSelect(topic.text)}
                  className="w-full px-4 py-3 bg-white rounded-xl text-left hover:bg-purple-50 transition-colors shadow-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start">
                    <span className="text-lg mr-3">{topic.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{topic.text}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {topic.reason} · 匹配度 {topic.score}%
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 pb-3">
              <button
                onClick={() => setIsExpanded(false)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                收起推荐
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// 开场白生成器组件
export function IceBreakers({ matchId, onSelect }: { 
  matchId: string
  onSelect: (text: string) => void 
}) {
  // 模拟匹配信息
  const matchInfo = {
    score: 92,
    sharedInterests: ['旅行', '美食'],
    matchReason: '价值观高度契合'
  }

  const openers = [
    {
      type: 'score',
      text: '我们的匹配度好高！感觉我们一定有很多共同话题 💫',
      icon: <Heart className="w-4 h-4 text-rose-500" />
    },
    {
      type: 'interest',
      text: '看到你也喜欢旅行，你去过最难忘的地方是哪里？',
      icon: <Plane className="w-4 h-4 text-blue-500" />
    },
    {
      type: 'food',
      text: '发现我们都爱美食！有什么推荐的餐厅吗？',
      icon: <Utensils className="w-4 h-4 text-orange-500" />
    },
    {
      type: 'casual',
      text: '你好呀！很高兴认识你 😊',
      icon: <Coffee className="w-4 h-4 text-amber-500" />
    }
  ]

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4">
      <div className="flex items-center mb-4">
        <Sparkles className="w-5 h-5 text-rose-500 mr-2" />
        <span className="font-medium text-gray-900">破冰开场白</span>
      </div>

      <div className="space-y-2">
        {openers.map((opener, index) => (
          <motion.button
            key={index}
            onClick={() => onSelect(opener.text)}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl text-left hover:bg-rose-50 transition-colors flex items-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="mr-3">{opener.icon}</span>
            <span className="text-sm text-gray-700">{opener.text}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
