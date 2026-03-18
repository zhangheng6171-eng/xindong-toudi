'use client'

import { use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Heart, MessageCircle, Users, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { 
  AnimatedBackground, 
  GlassCard, 
  GradientButton, 
  GradientText,
  FadeIn,
  Tag 
} from '@/components/animated-background'

export default function MatchResultContent({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = use(params)
  // 模拟匹配数据
  const match = {
    id: matchId,
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
    <AnimatedBackground variant="romance" showFloatingHearts={true}>
      <div className="min-h-screen">
        {/* Header */}
        <FadeIn>
          <header className="bg-white/70 backdrop-blur-xl sticky top-0 z-50 border-b border-rose-100/50">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-rose-500 transition-colors">
                <ChevronRight className="w-5 h-5 rotate-180 mr-1" />
                返回
              </Link>
            </div>
          </header>
        </FadeIn>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Hero - 匹配成功 */}
          <FadeIn>
            <div className="text-center mb-12">
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
                你们有 <GradientText className="text-2xl font-bold">{match.score}%</GradientText> 的匹配度
              </p>
            </div>
          </FadeIn>

          {/* 用户卡片 */}
          <FadeIn delay={0.1}>
            <GlassCard className="overflow-hidden mb-8">
              <div className="relative h-48 bg-gradient-to-br from-rose-100/80 via-pink-50/80 to-purple-100/80">
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div 
                    className="w-32 h-32 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-6xl font-bold shadow-2xl shadow-rose-500/30"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                  >
                    {match.nickname[0]}
                  </motion.div>
                </div>
                
                <motion.div 
                  className="absolute top-4 right-4 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">{match.score}%</span>
                </motion.div>
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
                
                <Link href={`/chat/${match.id}`}>
                  <GradientButton className="w-full" size="md">
                    <MessageCircle className="inline-block w-5 h-5 mr-2" />
                    开始聊天
                  </GradientButton>
                </Link>
              </div>
            </GlassCard>
          </FadeIn>

          {/* 匹配分析 */}
          <FadeIn delay={0.2}>
            <GlassCard className="p-6 mb-8">
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
                        <span className="text-sm font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">{reason.score}%</span>
                      </div>
                      <div className="h-2 bg-gray-100/80 rounded-full overflow-hidden backdrop-blur-sm">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${reason.score}%` }}
                          transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{reason.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </FadeIn>

          {/* 性格雷达图 */}
          <FadeIn delay={0.3}>
            <GlassCard className="p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                性格特点
              </h3>
              
              <div className="grid grid-cols-5 gap-4">
                <TraitBar label="开放性" value={match.personality.openness} color="bg-gradient-to-t from-rose-500 to-rose-400" delay={0.4} />
                <TraitBar label="尽责性" value={match.personality.conscientiousness} color="bg-gradient-to-t from-purple-500 to-purple-400" delay={0.5} />
                <TraitBar label="外向性" value={match.personality.extraversion} color="bg-gradient-to-t from-blue-500 to-blue-400" delay={0.6} />
                <TraitBar label="宜人性" value={match.personality.agreeableness} color="bg-gradient-to-t from-green-500 to-green-400" delay={0.7} />
                <TraitBar label="情绪稳定" value={100 - match.personality.neuroticism} color="bg-gradient-to-t from-amber-500 to-amber-400" delay={0.8} />
              </div>
            </GlassCard>
          </FadeIn>

          {/* 共同点 */}
          <FadeIn delay={0.4}>
            <GlassCard className="p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                ✨ 你们有这些共同点
              </h3>
              <div className="flex flex-wrap gap-2">
                {match.sharedTraits.map((trait, index) => (
                  <Tag key={index} color="rose">
                    {trait}
                  </Tag>
                ))}
              </div>
            </GlassCard>
          </FadeIn>

          {/* 互补点 */}
          {match.complementaryTraits.length > 0 && (
            <FadeIn delay={0.5}>
              <GlassCard className="p-6 mb-8 bg-gradient-to-br from-purple-50/80 to-indigo-50/80">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  ⚖️ 性格互补
                </h3>
                <div className="flex flex-wrap gap-2">
                  {match.complementaryTraits.map((trait, index) => (
                    <Tag key={index} color="purple">
                      {trait}
                    </Tag>
                  ))}
                </div>
              </GlassCard>
            </FadeIn>
          )}

          {/* 恋爱观 */}
          <FadeIn delay={0.6}>
            <GlassCard className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                💕 恋爱观
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-rose-50/80 to-pink-50/80 rounded-2xl backdrop-blur-sm border border-rose-100/50">
                  <div className="text-sm text-gray-500 mb-1">恋爱节奏</div>
                  <div className="font-bold text-gray-900">{match.relationshipViews.pace}</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50/80 to-indigo-50/80 rounded-2xl backdrop-blur-sm border border-purple-100/50">
                  <div className="text-sm text-gray-500 mb-1">婚姻期待</div>
                  <div className="font-bold text-gray-900">{match.relationshipViews.marriage}</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-blue-50/80 to-cyan-50/80 rounded-2xl backdrop-blur-sm border border-blue-100/50">
                  <div className="text-sm text-gray-500 mb-1">生育观念</div>
                  <div className="font-bold text-gray-900">{match.relationshipViews.kids}</div>
                </div>
              </div>
            </GlassCard>
          </FadeIn>
        </div>
      </div>
    </AnimatedBackground>
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
      <div className="relative h-32 w-10 mx-auto mb-2 bg-gray-100/80 rounded-full overflow-hidden backdrop-blur-sm">
        <motion.div 
          className={`absolute bottom-0 left-0 right-0 ${color} rounded-full`}
          initial={{ height: 0 }}
          animate={{ height: `${value}%` }}
          transition={{ delay, duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <div className="text-sm font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  )
}
