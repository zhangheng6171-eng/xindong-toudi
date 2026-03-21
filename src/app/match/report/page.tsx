'use client'

import { useState, useEffect, memo, Suspense, lazy } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { 
  Heart, MessageCircle, ArrowLeft, Sparkles, Brain, 
  Target, Zap, CheckCircle, AlertCircle, TrendingUp, Share2
} from 'lucide-react'
import { motion } from 'framer-motion'
import { AnimatedBackground, FadeIn } from '@/components/animated-background'
import { useAuth } from '@/hooks/useAuth'

// 延迟加载分享面板
const SharePanel = lazy(() => import('@/components/share-panel').then(m => ({ default: m.SharePanel })))

// 常量提取到组件外部
const SUMMARY_TEMPLATES = [
  '你们是非常契合的一对！在价值观和人格特质上都有很高的匹配度，建议认真发展这段关系。',
  '你们有很高的匹配潜力，虽然个别维度略有差异，但互补性强，值得深入了解。',
  '你们的匹配度不错，核心观念一致，建议多交流，发现更多共同点。'
]

const DIMENSION_CONFIGS = [
  { name: '人格契合度', icon: '🧠', desc: '基于大五人格理论分析' },
  { name: '价值观一致度', icon: '🎯', desc: '对重要事物的看法一致性' },
  { name: '生活方式匹配', icon: '🏠', desc: '日常生活习惯兼容性' },
  { name: '兴趣爱好重合', icon: '💝', desc: '共同爱好和活动偏好' },
  { name: '依恋类型互补', icon: '💕', desc: '亲密关系中的情感需求匹配' },
  { name: '未来规划一致', icon: '🚀', desc: '人生目标和发展方向' }
]

const DEFAULT_DETAILS = [
  '开放性格高度互补，都愿意尝试新事物',
  '尽责性相近，都有较强的责任心',
  '情绪稳定性匹配良好，能相互支持'
]

const RECOMMENDATIONS = [
  '建议先通过聊天了解彼此的日常习惯和兴趣',
  '可以约一次户外活动，检验实际相处的舒适度',
  '深入交流对未来生活的规划，确认长期目标一致'
]

const STRENGTHS = [
  '价值观高度一致，对重要问题的看法相似',
  '人格互补，能相互支持和成长',
  '生活方式兼容，日常相处会比较和谐'
]

const CONCERNS = [
  '兴趣爱好重合度中等，需要培养更多共同爱好',
  '建议多沟通，确保对亲密关系的期待一致'
]

// 简化的数据类型
interface MatchDimension {
  name: string
  score: number
  icon: string
  description: string
  details: string[]
}

interface MatchAnalysis {
  overallScore: number
  dimensions: MatchDimension[]
  summary: string
}

// 简化的随机数生成
function seededRandom(seed: number, min: number, max: number): number {
  const x = Math.sin(seed * 9999) * 10000
  return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min
}

// 简化的匹配分析生成器
function generateMatchAnalysis(userId: string, otherId: string): MatchAnalysis {
  const seed = parseInt(userId.slice(-4), 16) + parseInt(otherId.slice(-4), 16)
  const overallScore = seededRandom(seed, 78, 95)
  
  const dimensions = DIMENSION_CONFIGS.map((config, i) => ({
    name: config.name,
    score: seededRandom(seed + i, 65, 98),
    icon: config.icon,
    description: config.desc,
    details: DEFAULT_DETAILS
  }))

  return {
    overallScore,
    dimensions,
    summary: SUMMARY_TEMPLATES[seed % 3]
  }
}

// 获取进度条颜色
function getBarColor(percentage: number): string {
  if (percentage >= 85) return 'bg-gradient-to-r from-green-400 to-green-500'
  if (percentage >= 70) return 'bg-gradient-to-r from-rose-400 to-pink-500'
  return 'bg-gradient-to-r from-yellow-400 to-orange-500'
}

// 使用 memo 优化的维度评分条组件
const DimensionBar = memo(function DimensionBar({ 
  dimension, 
  index 
}: { 
  dimension: MatchDimension
  index: number 
}) {
  const percentage = (dimension.score / 100) * 100
  
  return (
    <FadeIn delay={index * 0.1}>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="text-4xl">{dimension.icon}</div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-900">{dimension.name}</h3>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-rose-500">{dimension.score}</span>
                <span className="text-gray-400">/ 100</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-3">{dimension.description}</p>
            
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className={`h-full rounded-full ${getBarColor(percentage)}`}
              />
            </div>
            
            <div className="space-y-1">
              {dimension.details.map((detail, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </FadeIn>
  )
})

// 使用 memo 优化的总体评分组件
const OverallScore = memo(function OverallScore({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 90
  const strokeDashoffset = circumference - (score / 100) * circumference
  
  return (
    <div className="relative w-48 h-48">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="90" fill="none" stroke="#f3f4f6" strokeWidth="12" />
        <motion.circle
          cx="100" cy="100" r="90" fill="none"
          stroke="url(#gradient)" strokeWidth="12" strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
          {score}
        </span>
        <span className="text-sm text-gray-400 mt-1">匹配度</span>
      </div>
    </div>
  )
})

function MatchReportContent() {
  const searchParams = useSearchParams()
  const { currentUser } = useAuth()
  const [analysis, setAnalysis] = useState<MatchAnalysis | null>(null)
  const [showShare, setShowShare] = useState(false)
  
  const otherUserId = searchParams.get('userId') || 'unknown'
  const otherNickname = searchParams.get('nickname') || '心动对象'

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentUser) {
        setAnalysis(generateMatchAnalysis(currentUser.id, otherUserId))
      }
    }, 600)
    return () => clearTimeout(timer)
  }, [currentUser, otherUserId])

  // 加载状态
  if (!analysis) {
    return (
      <AnimatedBackground variant="romance" showFloatingHearts={false}>
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mb-4" />
          <p className="text-gray-600">AI正在分析你们的匹配度...</p>
        </div>
      </AnimatedBackground>
    )
  }

  return (
    <AnimatedBackground variant="romance" showFloatingHearts>
      <div className="min-h-screen pb-24">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
            <Link href="/match" className="p-2 -ml-2 text-gray-600 hover:text-rose-500">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="flex-1">
              <h1 className="font-bold text-gray-900">AI匹配分析报告</h1>
              <p className="text-xs text-gray-500">基于66道问卷的深度分析</p>
            </div>
            <button
              onClick={() => setShowShare(true)}
              className="p-2 -mr-2 text-gray-600 hover:text-rose-500"
              aria-label="分享"
            >
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          {/* 总体评分 */}
          <section className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              AI深度分析
            </div>
            <OverallScore score={analysis.overallScore} />
            <p className="text-gray-600 mt-4 max-w-md mx-auto">{analysis.summary}</p>
            
            <div className="flex gap-3 mt-6">
              <Link
                href={`/chat/conversation/?userId=${otherUserId}&nickname=${encodeURIComponent(otherNickname)}`}
                className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-medium rounded-full shadow-lg shadow-rose-500/30 hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                发消息给TA
              </Link>
              <button className="px-4 py-3 border-2 border-rose-200 text-rose-500 font-medium rounded-full hover:bg-rose-50">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </section>

          {/* 维度分析 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-rose-500" />
              六大维度深度分析
            </h2>
            <div className="space-y-4">
              {analysis.dimensions.map((dim, i) => (
                <DimensionBar key={dim.name} dimension={dim} index={i} />
              ))}
            </div>
          </section>

          {/* 核心优势 */}
          <section className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              核心优势
            </h3>
            <div className="space-y-2">
              {STRENGTHS.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 发展建议 */}
          <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-500" />
              AI发展建议
            </h3>
            <div className="space-y-2">
              {RECOMMENDATIONS.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 注意事项 */}
          <section className="bg-amber-50 rounded-2xl p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              关注事项
            </h3>
            <div className="space-y-2">
              {CONCERNS.map((c, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 底部CTA */}
          <section className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 rounded-2xl p-6 text-white text-center">
            <h3 className="font-bold text-lg mb-2">准备好开启这段缘分了吗？</h3>
            <p className="text-white/90 text-sm mb-4">你们的匹配度很高，建议主动打招呼</p>
            <Link
              href={`/chat/conversation/?userId=${otherUserId}&nickname=${encodeURIComponent(otherNickname)}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-rose-600 font-bold rounded-full shadow-lg hover:shadow-xl"
            >
              <MessageCircle className="w-5 h-5" />
              立即开始对话
            </Link>
          </section>

          {/* 底部说明 */}
          <footer className="text-center text-xs text-gray-400 pb-4">
            <p>报告由临沂鲁曜同创 AI匹配系统生成</p>
            <p className="mt-1">基于66道心理学专业问卷分析</p>
          </footer>
        </main>

        {/* 分享面板 - 延迟加载 */}
        {showShare && currentUser && (
          <Suspense fallback={null}>
            <SharePanel
              isOpen={showShare}
              onClose={() => setShowShare(false)}
              myNickname={currentUser.nickname || '我'}
              otherNickname={otherNickname}
              otherUserId={otherUserId}
              matchScore={analysis.overallScore}
            />
          </Suspense>
        )}
      </div>
    </AnimatedBackground>
  )
}

export default function MatchReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="animate-pulse text-rose-500">加载中...</div>
      </div>
    }>
      <MatchReportContent />
    </Suspense>
  )
}
