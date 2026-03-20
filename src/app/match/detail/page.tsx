'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles, Heart, MessageCircle, Users, ChevronRight, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { 
  AnimatedBackground, 
  GlassCard, 
  GradientButton, 
  GradientText,
  FadeIn,
  Tag 
} from '@/components/animated-background'

interface UserData {
  id: string
  nickname: string
  age: number
  city: string
  occupation: string
  education: string
  bio: string
  avatar: string | null
  photos: string[]
  interests: string[]
}

function DetailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const userId = searchParams.get('userId')
  
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 从 API 获取用户数据
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setError('缺少用户ID')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/users/${userId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.user) {
            setUserData(data.user)
          } else {
            setError('用户不存在')
          }
        } else {
          setError('用户不存在')
        }
      } catch (e) {
        console.error('Failed to fetch user data:', e)
        setError('加载失败，请稍后重试')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [userId])

  // 匹配数据
  const match = userData ? {
    id: userData.id,
    nickname: userData.nickname,
    age: userData.age,
    city: userData.city || '未知',
    occupation: userData.occupation || '待完善',
    education: userData.education || '待完善',
    score: Math.floor(Math.random() * 15) + 80,
    bio: userData.bio || '暂无简介',
    avatar: userData.avatar,
    interests: userData.interests || [],
    personality: {
      openness: 75,
      conscientiousness: 70,
      extraversion: 65,
      agreeableness: 80,
      neuroticism: 40
    },
    matchReasons: [
      { type: '价值观', description: '对人生的看法较为一致', score: 85 },
      { type: '性格', description: '性格互补又契合', score: 82 },
      { type: '兴趣', description: '有共同的兴趣爱好', score: 78 },
      { type: '生活方式', description: '生活方式相似', score: 80 }
    ],
    sharedTraits: userData.interests?.slice(0, 4) || ['待了解'],
    complementaryTraits: ['外向带动内向', '感性+理性平衡'],
    relationshipViews: {
      pace: '适中',
      marriage: '希望30岁前结婚',
      kids: '想要两个宝宝'
    }
  } : null

  // 加载状态
  if (loading) {
    return (
      <AnimatedBackground variant="romance" showFloatingHearts={true}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-rose-400 animate-spin" />
            <p className="text-gray-500">加载中...</p>
          </div>
        </div>
      </AnimatedBackground>
    )
  }

  // 错误状态
  if (error || !match) {
    return (
      <AnimatedBackground variant="romance" showFloatingHearts={true}>
        <div className="min-h-screen">
          <header className="bg-white/70 backdrop-blur-xl sticky top-0 z-50 border-b border-rose-100/50">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <button 
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-rose-500 transition-colors"
              >
                <ChevronRight className="w-5 h-5 rotate-180 mr-1" />
                返回
              </button>
            </div>
          </header>
          <div className="max-w-4xl mx-auto px-4 py-20 text-center">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">用户不存在</h2>
            <p className="text-gray-500 mb-6">抱歉，无法找到该用户的资料</p>
            <button 
              onClick={() => router.back()}
              className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full font-medium"
            >
              返回上一页
            </button>
          </div>
        </div>
      </AnimatedBackground>
    )
  }

  return (
    <AnimatedBackground variant="romance" showFloatingHearts={true}>
      <div className="min-h-screen">
        {/* Header */}
        <FadeIn>
          <header className="bg-white/70 backdrop-blur-xl sticky top-0 z-50 border-b border-rose-100/50">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <button 
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-rose-500 transition-colors"
              >
                <ChevronRight className="w-5 h-5 rotate-180 mr-1" />
                返回
              </button>
            </div>
          </header>
        </FadeIn>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Hero */}
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
                🎉 匹配详情
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
                  {match.avatar ? (
                    <motion.img
                      src={match.avatar}
                      alt={match.nickname}
                      className="w-32 h-32 rounded-full object-cover shadow-2xl shadow-rose-500/30"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.2 }}
                    />
                  ) : (
                    <motion.div 
                      className="w-32 h-32 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-6xl font-bold shadow-2xl shadow-rose-500/30"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.2 }}
                    >
                      {match.nickname[0]}
                    </motion.div>
                  )}
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
                    {match.city} · {match.occupation}
                  </p>
                </div>
                
                <p className="text-gray-600 text-center mb-6">{match.bio}</p>
                
                {match.interests && match.interests.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center mb-6">
                    {match.interests.slice(0, 5).map((interest, index) => (
                      <span key={index} className="px-3 py-1 bg-rose-50 text-rose-600 text-sm rounded-full">
                        {interest}
                      </span>
                    ))}
                  </div>
                )}
                
                <GradientButton 
                  className="w-full" 
                  size="md"
                  onClick={() => router.push(`/chat/conversation/?userId=${match.id}&nickname=${encodeURIComponent(match.nickname)}`)}
                >
                  <MessageCircle className="inline-block w-5 h-5 mr-2" />
                  开始聊天
                </GradientButton>
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
                      <div className="h-2 bg-gray-100/80 rounded-full overflow-hidden">
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

          {/* 性格特点 */}
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

          {/* 恋爱观 */}
          <FadeIn delay={0.6}>
            <GlassCard className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                💕 恋爱观
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-rose-50/80 to-pink-50/80 rounded-2xl">
                  <div className="text-sm text-gray-500 mb-1">恋爱节奏</div>
                  <div className="font-bold text-gray-900">{match.relationshipViews.pace}</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50/80 to-indigo-50/80 rounded-2xl">
                  <div className="text-sm text-gray-500 mb-1">婚姻期待</div>
                  <div className="font-bold text-gray-900">{match.relationshipViews.marriage}</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-blue-50/80 to-cyan-50/80 rounded-2xl">
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

function TraitBar({ label, value, color, delay }: { label: string; value: number; color: string; delay: number }) {
  return (
    <div className="text-center">
      <div className="relative h-32 w-10 mx-auto mb-2 bg-gray-100/80 rounded-full overflow-hidden">
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

export default function MatchDetailPage() {
  return (
    <Suspense fallback={
      <AnimatedBackground variant="romance" showFloatingHearts={true}>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-rose-400 animate-spin" />
        </div>
      </AnimatedBackground>
    }>
      <DetailContent />
    </Suspense>
  )
}
