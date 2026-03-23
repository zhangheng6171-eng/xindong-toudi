'use client'

import { motion } from 'framer-motion'
import { Heart, Calendar, TrendingUp, Target } from 'lucide-react'
import { AnimatedCounter } from '@/components/animated-background'

interface StatsCardsProps {
  totalMatches: number
  successfulDates: number
  matchRate: number
  avgCompatibility: number
}

const cardData = [
  {
    label: '总匹配次数',
    key: 'totalMatches',
    icon: Heart,
    color: '#FF6B6B',
    bgGradient: 'from-rose-400/20 to-pink-400/10',
  },
  {
    label: '成功约会',
    key: 'successfulDates',
    icon: Calendar,
    color: '#2C3E50',
    bgGradient: 'from-slate-400/20 to-blue-400/10',
  },
  {
    label: '匹配成功率',
    key: 'matchRate',
    icon: TrendingUp,
    color: '#10B981',
    bgGradient: 'from-emerald-400/20 to-green-400/10',
  },
  {
    label: '平均匹配度',
    key: 'avgCompatibility',
    icon: Target,
    color: '#8B5CF6',
    bgGradient: 'from-violet-400/20 to-purple-400/10',
    suffix: '%',
  },
]

export default function StatsCards({
  totalMatches,
  successfulDates,
  matchRate,
  avgCompatibility,
}: StatsCardsProps) {
  const values = {
    totalMatches,
    successfulDates,
    matchRate,
    avgCompatibility,
  }

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      {cardData.map((card, index) => {
        const Icon = card.icon
        const value = values[card.key as keyof typeof values]
        
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br ${card.bgGradient} backdrop-blur-sm border border-white/50 shadow-lg`}
          >
            <div className="flex items-start justify-between mb-2">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${card.color}20` }}
              >
                <Icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {card.key === 'avgCompatibility' ? (
                <AnimatedCounter end={value} suffix={card.suffix || ''} />
              ) : card.key === 'matchRate' ? (
                <AnimatedCounter end={value} suffix="%" />
              ) : (
                <AnimatedCounter end={value} />
              )}
            </div>
            <div className="text-sm text-gray-500 mt-1">{card.label}</div>
          </motion.div>
        )
      })}
    </div>
  )
}
