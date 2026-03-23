'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Calendar, 
  MessageCircle, 
  Heart, 
  Sparkles,
  Clock,
  Star,
  CheckCircle
} from 'lucide-react'
import { AnimatedBackground, GlassCard, Tag, FadeIn } from '@/components/animated-background'
import type { MatchHistoryItem } from '@/components/history/MatchHistoryList'

// 模拟数据（实际应该从 API 获取）
const mockHistoryDetail: MatchHistoryItem = {
  id: '1',
  nickname: '小雨',
  age: 26,
  city: '北京',
  occupation: '产品经理',
  education: '硕士',
  compatibility: 87,
  matchReasons: ['都是互联网从业者', '都喜欢旅行和摄影', '价值观契合度高'],
  avatar: null,
  matchWeek: 12,
  matchDate: '2024-03-15',
  status: 'dated',
  lastContactDate: '2024-03-20',
  feedback: '见面后聊得很开心，对方很有内涵，期待下次见面~',
}

// 匹配度环形图组件
function CompatibilityRing({ percentage }: { percentage: number }) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage)
    }, 300)
    return () => clearTimeout(timer)
  }, [percentage])

  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full transform -rotate-90">
        {/* 背景圆 */}
        <circle
          cx="64"
          cy="64"
          r="45"
          fill="none"
          stroke="#f3f4f6"
          strokeWidth="8"
        />
        {/* 进度圆 */}
        <circle
          cx="64"
          cy="64"
          r="45"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF6B6B" />
            <stop offset="100%" stopColor="#FF8E8E" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gray-800">{animatedPercentage}%</span>
        <span className="text-xs text-gray-400">匹配度</span>
      </div>
    </div>
  )
}

// 时间线组件
function Timeline({ events }: { events: { date: string; title: string; description: string; icon: any }[] }) {
  return (
    <div className="relative">
      {events.map((event, index) => {
        const Icon = event.icon
        const isLast = index === events.length - 1
        
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative flex gap-4 pb-6"
          >
            {/* 圆点和连线 */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center z-10">
                <Icon className="w-5 h-5 text-rose-500" />
              </div>
              {!isLast && (
                <div className="w-0.5 bg-rose-200 flex-1 mt-2" />
              )}
            </div>
            
            {/* 内容 */}
            <div className="flex-1 pt-1">
              <div className="text-sm text-gray-500 mb-1">{event.date}</div>
              <div className="font-medium text-gray-800">{event.title}</div>
              <div className="text-sm text-gray-500 mt-0.5">{event.description}</div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default function HistoryDetailPage() {
  const params = useParams<{ matchId: string }>()
  const router = useRouter()
  const [detail, setDetail] = useState<MatchHistoryItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 模拟API调用
    setTimeout(() => {
      setDetail(mockHistoryDetail)
      setLoading(false)
    }, 500)
  }, [params.matchId])

  if (loading || !detail) {
    return (
      <AnimatedBackground variant="romance" showFloatingHearts={true}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Heart className="w-12 h-12 mx-auto mb-4 text-rose-300 animate-pulse" />
            <p className="text-gray-400">加载中...</p>
          </div>
        </div>
      </AnimatedBackground>
    )
  }

  const statusConfig = {
    pending: { label: '待联系', color: 'orange' as const },
    contacted: { label: '已联系', color: 'blue' as const },
    dated: { label: '已约会', color: 'purple' as const },
    relationship: { label: '建立关系', color: 'rose' as const },
    expired: { label: '已过期', color: 'orange' as const },
  }

  const status = statusConfig[detail.status]

  const timelineEvents = [
    {
      date: detail.matchDate,
      title: '匹配成功',
      description: `第${detail.matchWeek}周AI匹配`,
      icon: Heart,
    },
    ...(detail.status === 'contacted' || detail.status === 'dated' || detail.status === 'relationship'
      ? [{
          date: detail.lastContactDate || '',
          title: '开始联系',
          description: '通过平台交换联系方式',
          icon: MessageCircle,
        }]
      : []),
    ...(detail.status === 'dated' || detail.status === 'relationship'
      ? [{
          date: detail.lastContactDate || '',
          title: '首次约会',
          description: '线下见面交流',
          icon: Calendar,
        }]
      : []),
    ...(detail.status === 'relationship'
      ? [{
          date: detail.lastContactDate || '',
          title: '建立关系',
          description: '确认恋爱关系',
          icon: Sparkles,
        }]
      : []),
  ]

  return (
    <AnimatedBackground variant="romance" showFloatingHearts={true}>
      <div className="min-h-screen pb-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-500/90 via-pink-500/90 to-purple-500/90 backdrop-blur-xl text-white px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>返回</span>
            </button>
            <h1 className="text-2xl font-bold">匹配详情</h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 -mt-4">
          {/* 用户信息卡片 */}
          <GlassCard className="p-6 mb-6">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-rose-100 to-pink-100 flex-shrink-0">
                {detail.avatar ? (
                  <img
                    src={detail.avatar}
                    alt={detail.nickname}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-rose-400">
                    {detail.nickname[0]}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800 mb-1">
                  {detail.nickname}，{detail.age}岁
                </h2>
                <p className="text-gray-500 text-sm mb-2">
                  {detail.city} · {detail.occupation}
                </p>
                <p className="text-gray-400 text-sm">{detail.education}</p>
              </div>

              {/* 状态标签 */}
              <Tag color={status.color}>
                {status.label}
              </Tag>
            </div>
          </GlassCard>

          {/* 匹配度 */}
          <FadeIn delay={0.1}>
            <GlassCard className="p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-6 text-center">AI 匹配度分析</h3>
              <div className="flex justify-center mb-6">
                <CompatibilityRing percentage={detail.compatibility} />
              </div>
              
              {/* 匹配理由 */}
              <div className="bg-gradient-to-br from-rose-50/80 to-purple-50/50 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-rose-500" />
                  <span className="font-medium text-gray-700">匹配理由</span>
                </div>
                <ul className="space-y-2">
                  {detail.matchReasons.map((reason, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="flex items-start gap-2 text-gray-600"
                    >
                      <CheckCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                      {reason}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </GlassCard>
          </FadeIn>

          {/* 时间线 */}
          <FadeIn delay={0.2}>
            <GlassCard className="p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-6">发展历程</h3>
              <Timeline events={timelineEvents} />
            </GlassCard>
          </FadeIn>

          {/* 反馈内容 */}
          {detail.feedback && (
            <FadeIn delay={0.3}>
              <GlassCard className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">我的反馈</h3>
                <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/50 rounded-2xl p-4">
                  <p className="text-gray-600">{detail.feedback}</p>
                </div>
              </GlassCard>
            </FadeIn>
          )}
        </div>
      </div>
    </AnimatedBackground>
  )
}
