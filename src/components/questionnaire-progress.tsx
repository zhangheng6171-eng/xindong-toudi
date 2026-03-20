'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Circle } from 'lucide-react'

interface QuestionnaireProgressProps {
  currentQuestion: number
  totalQuestions: number
  currentGroup: string
}

const groupInfo: Record<string, { name: string; icon: string; color: string }> = {
  '人格特质': { name: '人格特质', icon: '🧠', color: 'from-blue-400 to-indigo-500' },
  '依恋类型': { name: '依恋类型', icon: '💝', color: 'from-pink-400 to-rose-500' },
  '爱情三元论': { name: '爱情三元论', icon: '❤️', color: 'from-red-400 to-pink-500' },
  '核心价值观': { name: '核心价值观', icon: '🎯', color: 'from-purple-400 to-violet-500' },
  '生活方式': { name: '生活方式', icon: '🏠', color: 'from-green-400 to-emerald-500' },
  '沟通风格': { name: '沟通风格', icon: '💬', color: 'from-cyan-400 to-teal-500' },
  '情境题': { name: '情境题', icon: '🎭', color: 'from-orange-400 to-amber-500' },
  '兴趣爱好': { name: '兴趣爱好', icon: '🎨', color: 'from-yellow-400 to-orange-500' },
  '自我描述': { name: '自我描述', icon: '✨', color: 'from-rose-400 to-pink-500' },
}

const groups = [
  { name: '人格特质', questions: 15, description: '了解你的性格特质' },
  { name: '依恋类型', questions: 6, description: '探索你的亲密关系模式' },
  { name: '爱情三元论', questions: 6, description: '理解你的爱情观' },
  { name: '核心价值观', questions: 10, description: '发现你的核心信念' },
  { name: '生活方式', questions: 8, description: '了解你的生活习惯' },
  { name: '沟通风格', questions: 6, description: '分析你的沟通方式' },
  { name: '情境题', questions: 6, description: '应对真实场景' },
  { name: '兴趣爱好', questions: 8, description: '分享你的兴趣' },
  { name: '自我描述', questions: 1, description: '展示真实的你' },
]

export function QuestionnaireProgress({ currentQuestion, totalQuestions, currentGroup }: QuestionnaireProgressProps) {
  const progress = (currentQuestion / totalQuestions) * 100
  const currentGroupIndex = groups.findIndex(g => currentGroup.includes(g.name))
  const info = groupInfo[currentGroup] || { name: currentGroup, icon: '📝', color: 'from-gray-400 to-gray-500' }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
      {/* 当前分组信息 */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${info.color} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
          {info.icon}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900">{info.name}</h3>
          <p className="text-sm text-gray-500">
            {groups[currentGroupIndex]?.description || '正在分析...'}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-rose-500">{currentQuestion}</div>
          <div className="text-xs text-gray-400">/ {totalQuestions}</div>
        </div>
      </div>

      {/* 进度条 */}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
          className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full"
        />
      </div>

      {/* 分组进度 */}
      <div className="grid grid-cols-9 gap-1">
        {groups.map((group, index) => {
          const isCompleted = index < currentGroupIndex
          const isCurrent = index === currentGroupIndex
          const groupProgress = groupInfo[group.name] || { icon: '📝', color: 'from-gray-400 to-gray-500' }
          
          return (
            <motion.div
              key={group.name}
              className={`
                aspect-square rounded-lg flex items-center justify-center text-xs
                ${isCompleted ? 'bg-gradient-to-br ' + groupProgress.color + ' text-white' : ''}
                ${isCurrent ? 'bg-gradient-to-br ' + groupProgress.color + ' text-white ring-2 ring-offset-2 ring-rose-300' : ''}
                ${!isCompleted && !isCurrent ? 'bg-gray-100 text-gray-400' : ''}
              `}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              title={group.name}
            >
              {isCompleted ? (
                <CheckCircle className="w-3 h-3" />
              ) : (
                <span>{groupProgress.icon}</span>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// 问卷完成展示组件
export function QuestionnaireComplete({ onStartChat }: { onStartChat?: () => void }) {
  return (
    <div className="bg-gradient-to-br from-rose-500 via-pink-500 to-purple-500 rounded-3xl p-8 text-white text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <CheckCircle className="w-10 h-10" />
      </motion.div>
      
      <h2 className="text-2xl font-bold mb-2">问卷完成！</h2>
      <p className="text-white/90 mb-6">
        AI已分析你的66道回答，正在为你寻找最佳匹配...
      </p>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white/10 rounded-xl p-3">
          <div className="text-2xl font-bold">9</div>
          <div className="text-xs text-white/70">维度分析</div>
        </div>
        <div className="bg-white/10 rounded-xl p-3">
          <div className="text-2xl font-bold">66</div>
          <div className="text-xs text-white/70">问题完成</div>
        </div>
        <div className="bg-white/10 rounded-xl p-3">
          <div className="text-2xl font-bold">AI</div>
          <div className="text-xs text-white/70">智能匹配</div>
        </div>
      </div>
      
      <button
        onClick={onStartChat}
        className="w-full py-3 bg-white text-rose-600 font-bold rounded-full shadow-lg hover:shadow-xl transition-all"
      >
        查看匹配结果
      </button>
    </div>
  )
}
