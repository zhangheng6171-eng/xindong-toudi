'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { AnimatedBackground, GlassCard } from '@/components/animated-background'
import StatsCards from '@/components/history/StatsCards'
import HistoryFilter, { type FilterType } from '@/components/history/HistoryFilter'
import MatchHistoryList, { type MatchHistoryItem } from '@/components/history/MatchHistoryList'

// 模拟数据（实际应该从 API 获取）
const mockHistoryData: MatchHistoryItem[] = [
  {
    id: '1',
    nickname: '小雨',
    age: 26,
    city: '北京',
    occupation: '产品经理',
    education: '硕士',
    compatibility: 87,
    matchReasons: ['都是互联网从业者', '都喜欢旅行和摄影'],
    avatar: null,
    matchWeek: 12,
    matchDate: '2024-03-15',
    status: 'dated',
    lastContactDate: '2024-03-20',
    feedback: '见面后聊得很开心，期待下次~',
  },
  {
    id: '2',
    nickname: '晓晓',
    age: 24,
    city: '北京',
    occupation: '设计师',
    education: '本科',
    compatibility: 82,
    matchReasons: ['审美契合', '都喜欢艺术展'],
    avatar: null,
    matchWeek: 11,
    matchDate: '2024-03-08',
    status: 'contacted',
    lastContactDate: '2024-03-10',
  },
  {
    id: '3',
    nickname: '小雅',
    age: 27,
    city: '上海',
    occupation: '律师',
    education: '硕士',
    compatibility: 91,
    matchReasons: ['价值观高度契合', '都是理性派', '都喜欢阅读'],
    avatar: null,
    matchWeek: 10,
    matchDate: '2024-03-01',
    status: 'relationship',
    lastContactDate: '2024-03-18',
    feedback: '很幸运遇到她！',
  },
  {
    id: '4',
    nickname: 'Linda',
    age: 25,
    city: '北京',
    occupation: '市场专员',
    education: '本科',
    compatibility: 75,
    matchReasons: ['性格互补', '都喜欢运动'],
    avatar: null,
    matchWeek: 9,
    matchDate: '2024-02-23',
    status: 'pending',
  },
  {
    id: '5',
    nickname: 'Coco',
    age: 28,
    city: '深圳',
    occupation: '前端工程师',
    education: '本科',
    compatibility: 68,
    matchReasons: ['同行有共同话题'],
    avatar: null,
    matchWeek: 8,
    matchDate: '2024-02-16',
    status: 'expired',
  },
  {
    id: '6',
    nickname: 'Amy',
    age: 26,
    city: '北京',
    occupation: '运营',
    education: '硕士',
    compatibility: 79,
    matchReasons: ['都很重视家庭', '都喜欢美食'],
    avatar: null,
    matchWeek: 7,
    matchDate: '2024-02-09',
    status: 'dated',
    lastContactDate: '2024-02-15',
  },
]

export default function HistoryPage() {
  const [filter, setFilter] = useState<FilterType>('all')
  const [historyData, setHistoryData] = useState<MatchHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // 计算统计数据
  const stats = {
    totalMatches: historyData.length,
    successfulDates: historyData.filter(i => i.status === 'dated' || i.status === 'relationship').length,
    matchRate: Math.round((historyData.filter(i => i.status !== 'pending' && i.status !== 'expired').length / historyData.length) * 100) || 0,
    avgCompatibility: Math.round(
      historyData.reduce((acc, i) => acc + i.compatibility, 0) / historyData.length
    ) || 0,
  }

  // 加载数据
  useEffect(() => {
    // 模拟API调用
    setTimeout(() => {
      setHistoryData(mockHistoryData)
      setLoading(false)
    }, 500)
  }, [])

  // 处理筛选变化
  const handleFilterChange = useCallback((newFilter: FilterType) => {
    setFilter(newFilter)
    setPage(1)
  }, [])

  // 加载更多
  const handleLoadMore = useCallback(() => {
    // 模拟加载更多
    setPage(prev => prev + 1)
  }, [])

  // 加载状态
  if (loading) {
    return (
      <AnimatedBackground variant="romance" showFloatingHearts={true}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 mx-auto mb-4 border-4 border-rose-200 border-t-rose-500 rounded-full"
            />
            <p className="text-gray-400">加载中...</p>
          </div>
        </div>
      </AnimatedBackground>
    )
  }

  return (
    <AnimatedBackground variant="romance" showFloatingHearts={true}>
      <div className="min-h-screen pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-500/90 via-pink-500/90 to-purple-500/90 backdrop-blur-xl text-white py-8 px-4">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-6"
            >
              <h1 className="text-3xl font-bold mb-2">匹配历史</h1>
              <p className="text-white/90 text-sm">
                记录每一次心动的瞬间
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 -mt-2">
          {/* 统计卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <StatsCards
              totalMatches={stats.totalMatches}
              successfulDates={stats.successfulDates}
              matchRate={stats.matchRate}
              avgCompatibility={stats.avgCompatibility}
            />
          </motion.div>

          {/* 筛选器 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <HistoryFilter
              activeFilter={filter}
              onFilterChange={handleFilterChange}
            />
          </motion.div>

          {/* 历史列表 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <MatchHistoryList
              items={historyData}
              filter={filter}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
              loading={false}
            />
          </motion.div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-rose-100/50 px-4 py-3 z-50">
          <div className="max-w-md mx-auto flex justify-around">
            <Link href="/" className="flex flex-col items-center text-gray-400 hover:text-rose-500 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs mt-1">首页</span>
            </Link>
            <Link href="/match" className="flex flex-col items-center text-gray-400 hover:text-rose-500 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-xs mt-1">匹配</span>
            </Link>
            <Link href="/history" className="flex flex-col items-center text-rose-500">
              <MessageCircle className="w-6 h-6" />
              <span className="text-xs mt-1">历史</span>
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
