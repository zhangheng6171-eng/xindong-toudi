'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import { Heart, MessageCircle, Eye, Sparkles, Brain, Zap } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import { getCompatibilityEmoji, getCompatibilityLabel } from '@/lib/utils'
import { 
  AnimatedBackground, 
  GlassCard, 
  GradientButton, 
  GradientText
} from '@/components/animated-background'
import { useAuth } from '@/hooks/useAuth'
import { 
  calculateMatch, 
  calculateMatches, 
  getLocalUserAnswers, 
  fetchUserAnswers,
  type UserAnswers 
} from '@/lib/match-calculator'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/config'

// 向量匹配导入
import { calculateMatchV2, batchMatchV2, type MatchScoreV2 } from '@/lib/matching-algorithm-v2'
import { vectorizeUserFromQuestionnaire } from '@/lib/user-vectorization'

// Supabase 配置
const SUPABASE = SUPABASE_URL
const KEY = SUPABASE_ANON_KEY

// 匹配数据类型
interface Match {
  id: string
  nickname: string
  age: number
  city: string
  occupation: string
  education: string
  compatibility: number
  matchReasons: string[]
  sharedValues: string[]
  sharedInterests: string[]
  avatar: string | null
  liked: boolean
  
  // V2向量匹配额外信息
  vectorScore?: {
    personalityMatch: number
    valuesMatch: number
    interestsMatch: number
    lifestyleMatch: number
    complementarityBonus: number
    longTermStability: number
  }
}

// 增强的匹配卡片组件
const MatchCard = memo(function MatchCard({ 
  match, 
  onLike, 
  onViewDetail,
  onAIReport,
  useVectorMatch 
}: { 
  match: Match
  onLike: (id: string) => void
  onViewDetail: (id: string) => void
  onAIReport: (id: string, nickname: string) => void
  useVectorMatch: boolean
}) {
  // 显示匹配分数详情
  const showVectorDetails = useVectorMatch && match.vectorScore
  
  return (
    <GlassCard className="overflow-hidden">
      {/* Avatar Area */}
      <div className="relative h-48 bg-gradient-to-br from-rose-100/80 via-pink-50/80 to-purple-100/80">
        <div className="absolute inset-0 flex items-center justify-center">
          {match.avatar ? (
            <img
              src={match.avatar}
              alt={match.nickname}
              className="w-32 h-32 rounded-full object-cover shadow-xl shadow-rose-500/30"
            />
          ) : match.liked ? (
            <div className="w-32 h-32 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-xl shadow-rose-500/30">
              {match.nickname[0]}
            </div>
          ) : (
            <div className="w-32 h-32 bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400">
              <Eye className="w-12 h-12" />
            </div>
          )}
        </div>
        
        {/* Compatibility Badge - 增强显示 */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
          {useVectorMatch ? (
            <>
              <Brain className="w-4 h-4 text-purple-500" />
              <div>
                <div className="text-xs text-gray-500">AI匹配度</div>
                <div className="text-xl font-bold bg-gradient-to-r from-purple-500 to-rose-500 bg-clip-text text-transparent">{match.compatibility}%</div>
              </div>
            </>
          ) : (
            <>
              <span className="text-2xl">{getCompatibilityEmoji(match.compatibility)}</span>
              <div>
                <div className="text-xs text-gray-500">匹配度</div>
                <div className="text-xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">{match.compatibility}%</div>
              </div>
            </>
          )}
        </div>

        {/* Like Status */}
        {match.liked && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full px-4 py-1.5 text-sm font-medium flex items-center gap-1 shadow-lg shadow-rose-500/30">
            <Heart className="w-4 h-4 fill-current" />
            已喜欢
          </div>
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

        {/* 向量匹配详情展示 */}
        {showVectorDetails && (
          <div className="bg-gradient-to-br from-purple-50/80 to-rose-50/50 rounded-2xl p-4 mb-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-purple-700">多维度分析</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between bg-white/60 rounded-lg px-2 py-1">
                <span className="text-gray-500">性格匹配</span>
                <span className="font-medium text-purple-600">{match.vectorScore!.personalityMatch}%</span>
              </div>
              <div className="flex justify-between bg-white/60 rounded-lg px-2 py-1">
                <span className="text-gray-500">价值观</span>
                <span className="font-medium text-purple-600">{match.vectorScore!.valuesMatch}%</span>
              </div>
              <div className="flex justify-between bg-white/60 rounded-lg px-2 py-1">
                <span className="text-gray-500">兴趣爱好</span>
                <span className="font-medium text-purple-600">{match.vectorScore!.interestsMatch}%</span>
              </div>
              <div className="flex justify-between bg-white/60 rounded-lg px-2 py-1">
                <span className="text-gray-500">生活方式</span>
                <span className="font-medium text-purple-600">{match.vectorScore!.lifestyleMatch}%</span>
              </div>
            </div>
            {match.vectorScore!.complementarityBonus > 0 && (
              <div className="mt-2 text-xs text-rose-600 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                互补性加分 +{match.vectorScore!.complementarityBonus}%
              </div>
            )}
            {match.vectorScore!.longTermStability > 0 && (
              <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
                <Heart className="w-3 h-3" />
                长期稳定度 {match.vectorScore!.longTermStability}%
              </div>
            )}
          </div>
        )}

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
          <Link
            href={`/match/report?userId=${match.id}&nickname=${encodeURIComponent(match.nickname)}`}
            className="flex-1"
          >
            <Button
              variant="outline"
              className="w-full border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300"
            >
              <Sparkles className="w-4 h-4 mr-1" />
              AI报告
            </Button>
          </Link>
          <Button
            variant="outline"
            className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50"
            onClick={() => onViewDetail(match.id)}
          >
            查看详情
          </Button>
          <GradientButton
            size="sm"
            variant={match.liked ? "secondary" : "primary"}
            className="flex-1"
            onClick={() => onLike(match.id)}
          >
            <Heart className={`w-5 h-5 mr-2 ${match.liked ? 'fill-current text-rose-500' : ''}`} />
            {match.liked ? '已喜欢' : '喜欢'}
          </GradientButton>
        </div>
      </div>
    </GlassCard>
  )
})

export default function MatchPage() {
  const router = useRouter()
  const { currentUser } = useAuth()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [useVectorMatch, setUseVectorMatch] = useState(false) // 是否使用向量匹配

  const handleLike = useCallback((matchId: string) => {
    setMatches(prev => prev.map(m => 
      m.id === matchId ? { ...m, liked: !m.liked } : m
    ))
  }, [])

  const handleViewDetail = useCallback((matchId: string) => {
    router.push(`/match/detail?userId=${matchId}`)
  }, [router])

  // 加载匹配数据 - 使用真正的AI匹配算法（支持向量匹配）
  useEffect(() => {
    let cancelled = false
    
    const loadMatches = async () => {
      try {
        // 获取当前用户的问卷答案
        let currentUserAnswers: UserAnswers | null = null
        
        // 首先尝试从 localStorage 获取
        currentUserAnswers = getLocalUserAnswers()
        
        // 如果当前用户已登录，尝试从 Supabase 获取最新答案
        if (!currentUserAnswers && currentUser?.id) {
          currentUserAnswers = await fetchUserAnswers(currentUser.id)
        }
        
        // 从 Supabase 获取所有已完成问卷的用户
        const response = await fetch(
          `${SUPABASE}/rest/v1/users?select=id,nickname,age,city,occupation,education,interests,avatar,questionnaire_answers,questionnaire_completed&questionnaire_completed=eq.true&order=createdAt.desc&limit=50`,
          { headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}` } }
        )
        
        if (cancelled) return
        
        if (response.ok) {
          const data = await response.json()
          const allUsers = Array.isArray(data) ? data : data.users || []
          
          // 过滤掉当前用户
          const otherUsers = allUsers.filter((u: any) => u.id !== currentUser?.id)
          
          if (otherUsers.length > 0 && currentUserAnswers) {
            // 尝试使用向量匹配 V2
            let useVector = false
            let vectorMatches: any[] = []
            
            try {
              // 使用向量匹配算法
              const candidates = otherUsers
                .filter((u: any) => u.questionnaire_answers)
                .map((u: any) => ({
                  userId: u.id,
                  answers: u.questionnaire_answers
                }))
              
              if (candidates.length > 0 && currentUser) {
                const v2Results = batchMatchV2(
                  currentUserAnswers,
                  currentUser.id,
                  candidates
                )
                
                if (v2Results && v2Results.length > 0) {
                  vectorMatches = v2Results
                  useVector = true
                  setUseVectorMatch(true)
                }
              }
            } catch (vectorError) {
              console.warn('Vector matching failed, falling back to legacy:', vectorError)
            }
            
            if (useVector && vectorMatches.length > 0) {
              // 使用向量匹配结果
              const formattedMatches = vectorMatches.slice(0, 10).map((result: MatchScoreV2) => {
                const user = otherUsers.find((u: any) => u.id === result.matchedUserId)
                if (!user) return null
                
                return {
                  id: user.id,
                  nickname: user.nickname || '匿名用户',
                  age: user.age || 25,
                  city: user.city || '未知',
                  occupation: user.occupation || '待完善',
                  education: user.education || '待完善',
                  compatibility: result.totalScore,
                  matchReasons: result.matchReasons.length > 0 
                    ? result.matchReasons 
                    : ['资料完整，值得了解'],
                  sharedValues: result.sharedTraits.length > 0 
                    ? result.sharedTraits 
                    : ['真诚', '成长'],
                  sharedInterests: [],
                  avatar: user.avatar,
                  liked: false,
                  vectorScore: {
                    personalityMatch: result.personalityMatch,
                    valuesMatch: result.valuesMatch,
                    interestsMatch: result.interestsMatch,
                    lifestyleMatch: result.lifestyleMatch,
                    complementarityBonus: result.complementarityBonus,
                    longTermStability: result.longTermStability
                  }
                }
              }).filter(Boolean) as Match[]
              
              formattedMatches.sort((a, b) => b.compatibility - a.compatibility)
              setMatches(formattedMatches)
            } else {
              // 回退到旧的匹配算法
              const matchResults = await calculateMatches(currentUserAnswers, otherUsers)
              
              // 将匹配结果与用户信息结合
              const formattedMatches = matchResults.slice(0, 5).map((result, index) => {
                const user = otherUsers.find((u: any) => u.id === result.userId)
                if (!user) return null
                
                return {
                  id: user.id,
                  nickname: user.nickname || '匿名用户',
                  age: user.age || 25,
                  city: user.city || '未知',
                  occupation: user.occupation || '待完善',
                  education: user.education || '待完善',
                  compatibility: result.compatibility,
                  matchReasons: result.matchReasons.length > 0 
                    ? result.matchReasons 
                    : ['资料完整，值得了解'],
                  sharedValues: result.sharedValues,
                  sharedInterests: result.sharedInterests.length > 0 
                    ? result.sharedInterests 
                    : ['待了解'],
                  avatar: user.avatar,
                  liked: false,
                }
              }).filter(Boolean) as Match[]
              
              // 按匹配度排序
              formattedMatches.sort((a, b) => b.compatibility - a.compatibility)
              
              setMatches(formattedMatches)
            }
          } else if (otherUsers.length > 0) {
            // 如果当前用户没有问卷答案，使用基础匹配
            const basicMatches = otherUsers.slice(0, 5).map((u: any) => ({
              id: u.id,
              nickname: u.nickname || '匿名用户',
              age: u.age || 25,
              city: u.city || '未知',
              occupation: u.occupation || '待完善',
              education: u.education || '待完善',
              compatibility: 65 + Math.floor(Math.random() * 20), // 65-85 基础分
              matchReasons: u.questionnaire_completed 
                ? ['已完成问卷调查'] 
                : ['资料完整，值得了解'],
              sharedValues: ['真诚', '成长'],
              sharedInterests: u.interests?.slice(0, 2) || ['待了解'],
              avatar: u.avatar,
              liked: false,
            }))
            
            setMatches(basicMatches)
          }
        }
      } catch (e) {
        console.error('Failed to load matches:', e)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    
    loadMatches()
    return () => { cancelled = true }
  }, [currentUser])

  // 加载中状态 - 简化
  if (loading) {
    return (
      <AnimatedBackground variant="romance" showFloatingHearts={true}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Heart className="w-12 h-12 mx-auto mb-4 text-rose-300 animate-pulse" />
            <p className="text-gray-400">正在加载匹配...</p>
          </div>
        </div>
      </AnimatedBackground>
    )
  }

  return (
    <AnimatedBackground variant="romance" showFloatingHearts={true}>
      <div className="min-h-screen pb-20">
        {/* Header - 简化动画 */}
        <div className="bg-gradient-to-r from-rose-500/90 via-pink-500/90 to-purple-500/90 backdrop-blur-xl text-white py-8 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4">
              {useVectorMatch ? (
                <>
                  <Brain className="w-4 h-4" />
                  <span className="text-sm font-medium">AI 向量匹配</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium">AI 智能匹配</span>
                </>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
              本周匹配
              <Sparkles className="w-5 h-5" />
            </h1>
            <p className="text-white/90">
              {matches.length > 0 
                ? useVectorMatch 
                  ? `为你精准匹配了 ${matches.length} 位对象（110维向量分析）` 
                  : `为你精选了 ${matches.length} 位匹配对象` 
                : '暂无匹配对象'}
            </p>
          </div>
        </div>

        {/* 匹配列表或空状态 - 使用 memo 组件 */}
        {matches.length > 0 ? (
          <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
            {matches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onLike={handleLike}
                onViewDetail={handleViewDetail}
                onAIReport={(id, nickname) => router.push(`/match/report?userId=${id}&nickname=${encodeURIComponent(nickname)}`)}
                useVectorMatch={useVectorMatch}
              />
            ))}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto px-4 py-16 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-200" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">暂无匹配结果</h3>
            <p className="text-gray-400 mb-6">完成问卷后等待系统为你匹配~</p>
            <Link href="/questionnaire" className="inline-block px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full font-medium">
              立即去答题
            </Link>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-rose-100/50 px-4 py-3">
          <div className="max-w-md mx-auto flex justify-around">
            <Link href="/" className="flex flex-col items-center text-gray-400 hover:text-rose-500 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs mt-1">首页</span>
            </Link>
            <Link href="/match" className="flex flex-col items-center text-rose-500">
              <Heart className="w-6 h-6 fill-current" />
              <span className="text-xs mt-1">匹配</span>
            </Link>
            <Link href="/chat" className="flex flex-col items-center text-gray-400 hover:text-rose-500 transition-colors">
              <MessageCircle className="w-6 h-6" />
              <span className="text-xs mt-1">消息</span>
            </Link>
            <Link href="/dashboard" className="flex flex-col items-center text-gray-400 hover:text-rose-500 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs mt-1">我的</span>
            </Link>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  )
}
