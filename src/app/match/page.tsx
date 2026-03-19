'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Eye, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import { getCompatibilityEmoji, getCompatibilityLabel } from '@/lib/utils'
import { 
  AnimatedBackground, 
  GlassCard, 
  GradientButton, 
  GradientText,
  FadeIn 
} from '@/components/animated-background'

// 模拟匹配数据
const mockMatches = [
  {
    id: '1',
    nickname: '小雨',
    age: 26,
    city: '北京',
    occupation: '产品经理',
    education: '研究生',
    compatibility: 92,
    matchReasons: [
      '你们都重视家庭和真诚',
      '喜欢安静的周末，热爱旅行',
      '价值观高度契合',
      '都是猫奴🐱',
    ],
    sharedValues: ['家庭', '真诚', '成长'],
    sharedInterests: ['旅行', '摄影', '猫'],
    avatar: null,
    liked: false,
  },
  {
    id: '2',
    nickname: '阿杰',
    age: 28,
    city: '上海',
    occupation: '工程师',
    education: '本科',
    compatibility: 85,
    matchReasons: [
      '你们都喜欢户外运动',
      '重视工作和生活的平衡',
      '性格互补，可能产生化学反应',
    ],
    sharedValues: ['健康', '自由'],
    sharedInterests: ['运动', '旅行', '美食'],
    avatar: null,
    liked: false,
  },
  {
    id: '3',
    nickname: '小美',
    age: 25,
    city: '深圳',
    occupation: '设计师',
    education: '本科',
    compatibility: 78,
    matchReasons: [
      '你们都热爱艺术和创意',
      '喜欢探索新事物',
      '对未来有相似的规划',
    ],
    sharedValues: ['创造力', '成长'],
    sharedInterests: ['艺术', '音乐', '咖啡'],
    avatar: null,
    liked: true,
  },
]

export default function MatchPage() {
  const router = useRouter()
  const [matches, setMatches] = useState(mockMatches)
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  const handleLike = (matchId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setMatches(prev => prev.map(m => 
      m.id === matchId ? { ...m, liked: !m.liked } : m
    ))
  }

  const handleViewDetail = (matchId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    router.push(`/match/${matchId}`)
  }

  const handleSendMessage = (matchId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    router.push(`/chat/${matchId}`)
  }

  const currentMatch = matches.find(m => m.id === selectedMatch)

  return (
    <AnimatedBackground variant="romance" showFloatingHearts={true}>
      <div className="min-h-screen pb-20">
        {/* Header */}
        <FadeIn>
          <div className="bg-gradient-to-r from-rose-500/90 via-pink-500/90 to-purple-500/90 backdrop-blur-xl text-white py-8 px-4">
            <div className="max-w-2xl mx-auto text-center">
              <motion.div 
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4"
                whileHover={{ scale: 1.05 }}
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm">2024年3月18日 - 3月24日</span>
              </motion.div>
              <h1 className="text-3xl font-bold mb-2">
                💌 本周为你匹配了 <GradientText className="text-white drop-shadow-lg">{matches.length}</GradientText> 位心动对象
              </h1>
              <p className="text-white/80">
                点击查看详情，让缘分开始
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Matches List */}
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          {matches.map((match, index) => (
            <FadeIn key={match.id} delay={index * 0.1}>
              <GlassCard className="overflow-hidden">
                {/* Avatar Area */}
                <div className="relative h-48 bg-gradient-to-br from-rose-100/80 via-pink-50/80 to-purple-100/80">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {match.liked ? (
                      <motion.div 
                        className="w-32 h-32 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-xl shadow-rose-500/30"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        {match.nickname[0]}
                      </motion.div>
                    ) : (
                      <motion.div 
                        className="w-32 h-32 bg-white/50 backdrop-blur-sm rounded-full blur-[2px] flex items-center justify-center text-gray-400"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Eye className="w-12 h-12" />
                      </motion.div>
                    )}
                  </div>
                  
                  {/* Compatibility Badge */}
                  <motion.div 
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-md rounded-full px-4 py-2 shadow-lg flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="text-2xl">{getCompatibilityEmoji(match.compatibility)}</span>
                    <div>
                      <div className="text-xs text-gray-500">匹配度</div>
                      <div className="text-xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">{match.compatibility}%</div>
                    </div>
                  </motion.div>

                  {/* Like Status */}
                  {match.liked && (
                    <motion.div 
                      className="absolute top-4 left-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full px-4 py-1.5 text-sm font-medium flex items-center gap-1 shadow-lg shadow-rose-500/30"
                      initial={{ scale: 0, x: -20 }}
                      animate={{ scale: 1, x: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                      <Heart className="w-4 h-4 fill-current" />
                      已喜欢
                    </motion.div>
                  )}
                </div>

                {/* Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">
                        {match.nickname}，{match.age}岁
                      </h3>
                      <p className="text-gray-500">{match.city} · {match.occupation}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">{match.education}</div>
                    </div>
                  </div>

                  {/* Compatibility Label */}
                  <div className="mb-4">
                    <span className="inline-block bg-gradient-to-r from-rose-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium shadow-md shadow-rose-500/20">
                      {getCompatibilityLabel(match.compatibility)}
                    </span>
                  </div>

                  {/* Match Reasons */}
                  <div className="bg-gradient-to-br from-gray-50/80 to-rose-50/50 rounded-2xl p-4 mb-4 backdrop-blur-sm">
                    <div className="text-sm text-gray-500 mb-2">💡 匹配理由</div>
                    <ul className="space-y-1">
                      {match.matchReasons.slice(0, 2).map((reason, i) => (
                        <li key={i} className="text-gray-700 flex items-start gap-2">
                          <span className="text-rose-500 mt-0.5">✓</span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Shared Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {match.sharedValues.map(v => (
                      <span key={v} className="px-3 py-1 bg-rose-50/80 text-rose-700 rounded-full text-sm backdrop-blur-sm border border-rose-100">
                        {v}
                      </span>
                    ))}
                    {match.sharedInterests.slice(0, 2).map(i => (
                      <span key={i} className="px-3 py-1 bg-gray-100/80 text-gray-600 rounded-full text-sm backdrop-blur-sm border border-gray-200/50">
                        {i}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300"
                      onClick={(e) => handleViewDetail(match.id, e)}
                    >
                      查看详情
                    </Button>
                    <GradientButton
                      size="sm"
                      variant={match.liked ? "secondary" : "primary"}
                      className="flex-1"
                      onClick={() => handleLike(match.id)}
                    >
                      <Heart className={`w-5 h-5 mr-2 ${match.liked ? 'fill-current text-rose-500' : ''}`} />
                      {match.liked ? '已喜欢' : '喜欢'}
                    </GradientButton>
                  </div>
                </div>
              </GlassCard>
            </FadeIn>
          ))}
        </div>

        {/* Detail Modal */}
        <AnimatePresence>
          {showDetail && currentMatch && (
            <motion.div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetail(false)}
            >
              <motion.div 
                className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl shadow-rose-500/10"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={e => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="relative h-40 bg-gradient-to-br from-rose-400 via-pink-400 to-purple-400">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                      className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-3xl font-bold bg-gradient-to-br from-rose-500 to-pink-500 bg-clip-text text-transparent shadow-xl"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.1 }}
                    >
                      {currentMatch.nickname[0]}
                    </motion.div>
                  </div>
                  <button
                    onClick={() => setShowDetail(false)}
                    className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">{currentMatch.nickname}</h3>
                    <p className="text-gray-500">{currentMatch.age}岁 · {currentMatch.city}</p>
                    <p className="text-gray-500">{currentMatch.occupation} · {currentMatch.education}</p>
                  </div>

                  {/* Compatibility */}
                  <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-4 mb-6 text-center backdrop-blur-sm border border-rose-100/50">
                    <div className="text-4xl mb-2">{getCompatibilityEmoji(currentMatch.compatibility)}</div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent mb-1">{currentMatch.compatibility}%</div>
                    <div className="text-gray-600">{getCompatibilityLabel(currentMatch.compatibility)}</div>
                  </div>

                  {/* Match Reasons */}
                  <div className="mb-6">
                    <h4 className="font-bold text-gray-800 mb-3">为什么你们很配？</h4>
                    <ul className="space-y-2">
                      {currentMatch.matchReasons.map((reason, i) => (
                        <motion.li 
                          key={i} 
                          className="flex items-start gap-3 p-3 bg-gray-50/80 rounded-xl backdrop-blur-sm"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <span className="text-rose-500 text-lg">✓</span>
                          <span className="text-gray-700">{reason}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Shared Values */}
                  <div className="mb-6">
                    <h4 className="font-bold text-gray-800 mb-3">共同的价值观</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentMatch.sharedValues.map(v => (
                        <span key={v} className="px-4 py-2 bg-rose-50/80 text-rose-700 rounded-full font-medium backdrop-blur-sm border border-rose-100">
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Shared Interests */}
                  <div className="mb-6">
                    <h4 className="font-bold text-gray-800 mb-3">共同的兴趣</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentMatch.sharedInterests.map(i => (
                        <span key={i} className="px-4 py-2 bg-gray-100/80 text-gray-700 rounded-full backdrop-blur-sm border border-gray-200/50">
                          {i}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <GradientButton
                      size="md"
                      variant={currentMatch.liked ? "secondary" : "primary"}
                      className="flex-1"
                      onClick={() => {
                        handleLike(currentMatch.id)
                        setShowDetail(false)
                      }}
                    >
                      <Heart className={`w-5 h-5 mr-2 ${currentMatch.liked ? 'fill-current text-rose-500' : ''}`} />
                      {currentMatch.liked ? '已喜欢' : '心动了！'}
                    </GradientButton>
                    <Button 
                      variant="outline" 
                      className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50"
                      onClick={(e) => {
                        setShowDetail(false)
                        handleSendMessage(currentMatch.id, e)
                      }}
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      发消息
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-rose-100/50 px-4 py-3">
          <div className="max-w-md mx-auto flex justify-around">
            <button className="flex flex-col items-center text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs mt-1">首页</span>
            </button>
            <button className="flex flex-col items-center text-rose-500">
              <Heart className="w-6 h-6 fill-current" />
              <span className="text-xs mt-1">匹配</span>
            </button>
            <button className="flex flex-col items-center text-gray-400 hover:text-gray-600 transition-colors">
              <MessageCircle className="w-6 h-6" />
              <span className="text-xs mt-1">消息</span>
            </button>
            <button className="flex flex-col items-center text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs mt-1">我的</span>
            </button>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  )
}
