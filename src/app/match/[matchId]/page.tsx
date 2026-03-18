'use client'

import { use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Heart, MessageCircle, Users, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function MatchResultPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = use(params)
  // 模拟匹配数据
  const match = {
    id: '1',
    nickname: '小红',
    age: 26,
    city: '北京',
    score: 92,
    bio: '热爱生活，喜欢探索新事物～',
    avatar: null,
    
    // 大五人格
    personality: {
      openness: 82,
      conscientiousness: 75,
      extraversion: 68,
      agreeableness: 88,
      neuroticism: 35
    },
    
    // 匹配原因
    matchReasons: [
      { type: '价值观', description: '对人生的看法高度一致', score: 95 },
      { type: '性格', description: '性格互补又契合', score: 90 },
      { type: '兴趣', description: '都有旅行和美食的爱好', score: 85 },
      { type: '生活方式', description: '作息规律相似', score: 88 }
    ],
    
    // 共同点
    sharedTraits: ['热爱旅行', '喜欢美食', '重视家庭', '理性务实'],
    
    // 互补点
    complementaryTraits: ['外向带动内向', '感性+理性平衡'],
    
    // 恋爱观
    relationshipViews: {
      pace: '适中',
      marriage: '希望30岁前结婚',
      kids: '想要两个宝宝'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-rose-500">
            <ChevronRight className="w-5 h-5 rotate-180 mr-1" />
            返回
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero - 匹配成功 */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div 
            className="inline-flex items-center justify-center mb-4"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="relative">
              <Sparkles className="w-16 h-16 text-rose-500" />
              <motion.div 
                className="absolute inset-0"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Heart className="w-16 h-16 text-pink-500" fill="currentColor" />
              </motion.div>
            </div>
          </motion.div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎉 匹配成功！
          </h1>
          <p className="text-gray-600">
            你们有 <span className="text-rose-500 font-bold">{match.score}%</span> 的匹配度
          </p>
        </motion.div>

        {/* 用户卡片 */}
        <motion.div 
          className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative h-48 bg-gradient-to-br from-rose-100 via-pink-50 to-purple-100">
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div 
                className="w-32 h-32 rounded-full bg-white shadow-2xl flex items-center justify-center text-6xl font-bold text-rose-400"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
              >
                {match.nickname[0]}
              </motion.div>
            </div>
            
            <div className="absolute top-4 right-4 px-4 py-2 bg-white/90 backdrop-blur rounded-full shadow-lg">
              <span className="text-2xl font-bold text-rose-500">{match.score}%</span>
            </div>
          </div>
          
          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {match.nickname}，{match.age}岁
              </h2>
              <p className="text-gray-500 flex items-center justify-center mt-1">
                <Users className="w-4 h-4 mr-1" />
                {match.city}
              </p>
            </div>
            
            <p className="text-gray-600 text-center mb-6">{match.bio}</p>
            
            <Link 
              href={`/chat/${match.id}`}
              className="block w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-center rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-rose-200 transition-all"
            >
              <MessageCircle className="inline-block w-5 h-5 mr-2" />
              开始聊天
            </Link>
          </div>
        </motion.div>

        {/* 匹配分析 */}
        <motion.div 
          className="bg-white rounded-3xl shadow-lg p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Sparkles className="w-5 h-5 text-rose-500 mr-2" />
            匹配分析
          </h3>
          
          <div className="space-y-4">
            {match.matchReasons.map((reason, index) => (
              <div key={index} className="flex items-center">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{reason.type}</span>
                    <span className="text-sm text-rose-500 font-bold">{reason.score}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${reason.score}%` }}
                      transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 性格雷达图 */}
        <motion.div 
          className="bg-white rounded-3xl shadow-lg p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            性格特点
          </h3>
          
          <div className="grid grid-cols-5 gap-4">
            <TraitBar label="开放性" value={match.personality.openness} color="bg-rose-500" delay={0.4} />
            <TraitBar label="尽责性" value={match.personality.conscientiousness} color="bg-purple-500" delay={0.5} />
            <TraitBar label="外向性" value={match.personality.extraversion} color="bg-blue-500" delay={0.6} />
            <TraitBar label="宜人性" value={match.personality.agreeableness} color="bg-green-500" delay={0.7} />
            <TraitBar label="情绪稳定" value={100 - match.personality.neuroticism} color="bg-amber-500" delay={0.8} />
          </div>
        </motion.div>

        {/* 共同点 */}
        <motion.div 
          className="bg-white rounded-3xl shadow-lg p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            ✨ 你们有这些共同点
          </h3>
          <div className="flex flex-wrap gap-2">
            {match.sharedTraits.map((trait, index) => (
              <span 
                key={index}
                className="px-4 py-2 bg-rose-50 text-rose-700 rounded-full text-sm font-medium"
              >
                {trait}
              </span>
            ))}
          </div>
        </motion.div>

        {/* 互补点 */}
        {match.complementaryTraits.length > 0 && (
          <motion.div 
            className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-3xl shadow-lg p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              ⚖️ 性格互补
            </h3>
            <div className="flex flex-wrap gap-2">
              {match.complementaryTraits.map((trait, index) => (
                <span 
                  key={index}
                  className="px-4 py-2 bg-white text-purple-700 rounded-full text-sm font-medium shadow-sm"
                >
                  {trait}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* 恋爱观 */}
        <motion.div 
          className="bg-white rounded-3xl shadow-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            💕 恋爱观
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-2xl">
              <div className="text-sm text-gray-500 mb-1">恋爱节奏</div>
              <div className="font-bold text-gray-900">{match.relationshipViews.pace}</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-2xl">
              <div className="text-sm text-gray-500 mb-1">婚姻期待</div>
              <div className="font-bold text-gray-900">{match.relationshipViews.marriage}</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-2xl">
              <div className="text-sm text-gray-500 mb-1">生育观念</div>
              <div className="font-bold text-gray-900">{match.relationshipViews.kids}</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// Trait Bar Component
function TraitBar({ 
  label, 
  value, 
  color,
  delay 
}: { 
  label: string
  value: number
  color: string
  delay: number
}) {
  return (
    <div className="text-center">
      <div className="relative h-32 w-10 mx-auto mb-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div 
          className={`absolute bottom-0 left-0 right-0 ${color} rounded-full`}
          initial={{ height: 0 }}
          animate={{ height: `${value}%` }}
          transition={{ delay, duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <div className="text-sm font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  )
}
