'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Calendar, Heart, MessageCircle, Sparkles } from 'lucide-react'
import { GlassCard, Tag } from '@/components/animated-background'
import type { FilterType } from './HistoryFilter'

// 匹配历史数据类型
export interface MatchHistoryItem {
  id: string
  nickname: string
  age: number
  city: string
  occupation: string
  education: string
  compatibility: number
  matchReasons: string[]
  avatar: string | null
  matchWeek: number
  matchDate: string
  status: 'pending' | 'contacted' | 'dated' | 'relationship' | 'expired'
  lastContactDate?: string
  feedback?: string
}

interface MatchHistoryListProps {
  items: MatchHistoryItem[]
  filter: FilterType
  onLoadMore?: () => void
  hasMore?: boolean
  loading?: boolean
}

const statusConfig = {
  pending: { label: '待联系', color: 'orange', icon: Heart },
  contacted: { label: '已联系', color: 'blue', icon: MessageCircle },
  dated: { label: '已约会', color: 'purple', icon: Calendar },
  relationship: { label: '建立关系', color: 'rose', icon: Sparkles },
  expired: { label: '已过期', color: 'gray', icon: Heart },
}

export default function MatchHistoryList({
  items,
  filter,
  onLoadMore,
  hasMore = false,
  loading = false,
}: MatchHistoryListProps) {
  const router = useRouter()

  const handleCardClick = (id: string) => {
    router.push(`/history/${id}`)
  }

  const filteredItems = filter === 'all' 
    ? items 
    : items.filter(item => item.status === filter)

  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <Heart className="w-10 h-10 text-gray-300" />
        </div>
        <h3 className="text-lg font-medium text-gray-600 mb-2">暂无记录</h3>
        <p className="text-gray-400 text-sm">
          {filter === 'all' 
            ? '还没有匹配历史，去认识新朋友吧~' 
            : `暂无${statusConfig[filter]?.label || ''}的记录`}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {filteredItems.map((item, index) => {
        const status = statusConfig[item.status]
        const StatusIcon = status.icon

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div 
              className="p-0 overflow-hidden cursor-pointer"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                borderRadius: '24px',
                boxShadow: '0 8px 32px rgba(236, 72, 153, 0.08)',
                transition: 'all 0.3s ease',
              }}
              onClick={() => handleCardClick(item.id)}
            >
              <div className="flex">
                {/* Avatar */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-gradient-to-br from-rose-100 via-pink-50 to-purple-100 flex items-center justify-center">
                  {item.avatar ? (
                    <img
                      src={item.avatar}
                      alt={item.nickname}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center text-2xl font-bold text-gray-400">
                      {item.nickname[0]}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">
                        {item.nickname}，{item.age}岁
                      </h3>
                      <p className="text-sm text-gray-500">
                        {item.city} · {item.occupation}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-rose-500">
                        {item.compatibility}%
                      </div>
                      <div className="text-xs text-gray-400">匹配度</div>
                    </div>
                  </div>

                  {/* Match Reasons */}
                  <div className="mb-3">
                    <div className="text-xs text-gray-400 mb-1">匹配理由</div>
                    <div className="flex flex-wrap gap-1">
                      {item.matchReasons.slice(0, 2).map((reason, i) => (
                        <span 
                          key={i}
                          className="text-xs px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-400">
                      第{item.matchWeek}周匹配 · {item.matchDate}
                    </div>
                    <Tag color={status.color as any}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {status.label}
                    </Tag>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )
      })}

      {/* Load More */}
      {hasMore && (
        <div className="text-center py-6">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-6 py-2 text-sm text-gray-500 hover:text-rose-500 transition-colors disabled:opacity-50"
          >
            {loading ? '加载中...' : '查看更多'}
          </button>
        </div>
      )}
    </div>
  )
}
