'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Sparkles, ChevronLeft, Check, PartyPopper, Loader2 } from 'lucide-react'
import StarRating from './StarRating'
import { GlassCard, GradientButton, FadeIn } from '@/components/animated-background'

interface MatchInfo {
  id: string
  partnerName: string
  partnerAvatar?: string
  matchedAt?: string
}

interface FeedbackFormProps {
  matchInfo?: MatchInfo
  onSubmit?: (data: FeedbackData) => Promise<void>
  onSuccess?: () => void
}

export interface FeedbackData {
  matchId: string
  overallRating: number
  personalityRating: number
  valuesRating: number
  interestsRating: number
  impressiveMoment: string
  improvementSuggestions: string
  wantSecondDate: boolean | null
  wantToContinue: boolean | null
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

// 成功庆祝动画
function SuccessAnimation({ onComplete }: { onComplete: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-rose-500/95 via-pink-500/95 to-purple-500/95 backdrop-blur-sm"
      onClick={onComplete}
    >
      {/* 彩带效果 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-10%',
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              background: `hsl(${Math.random() * 360}, 80%, 70%)`,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            }}
            animate={{
              y: [0, typeof window !== 'undefined' ? window.innerHeight * 1.2 : 800],
              x: [0, (Math.random() - 0.5) * 200],
              rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
              opacity: [1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              delay: Math.random() * 2,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      {/* 星星效果 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute text-4xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            initial={{ scale: 0, rotate: 0 }}
            animate={{
              scale: [0, 1.5, 0],
              rotate: [0, 180],
            }}
            transition={{
              duration: 2,
              delay: i * 0.1,
              repeat: Infinity,
              repeatDelay: Math.random() * 2,
            }}
          >
            ✨
          </motion.div>
        ))}
      </div>

      {/* 中心内容 */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="text-center text-white z-10 px-8"
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1,
          }}
          className="text-8xl mb-6"
        >
          💕
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-4xl font-bold mb-4"
        >
          反馈已提交！
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-xl text-white/90 mb-8"
        >
          感谢你的真诚反馈 ~
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 bg-white text-rose-600 font-bold rounded-full shadow-xl text-lg"
          onClick={onComplete}
        >
          查看匹配历史 →
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

// 单选按钮组件
function RadioGroup({
  label,
  value,
  onChange,
  options,
  required
}: {
  label: string
  value: boolean | null
  onChange: (value: boolean) => void
  options?: { label: string; value: boolean }[]
  required?: boolean
}) {
  const defaultOptions = [
    { label: '是', value: true },
    { label: '否', value: false }
  ]
  
  const opts = options || defaultOptions

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      <div className="flex gap-4">
        {opts.map((option) => {
          const isSelected = value === option.value
          return (
            <motion.button
              key={String(option.value)}
              type="button"
              onClick={() => onChange(option.value)}
              className={`flex-1 py-3 px-6 rounded-2xl border-2 font-medium transition-all duration-200 ${
                isSelected
                  ? 'border-rose-400 bg-gradient-to-r from-rose-50 to-pink-50 shadow-lg shadow-rose-200/50 text-rose-600'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-rose-200 hover:bg-rose-50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="flex items-center justify-center gap-2">
                {isSelected && <Check className="w-4 h-4" />}
                {option.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

export default function FeedbackForm({ matchInfo, onSubmit, onSuccess }: FeedbackFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  const [formData, setFormData] = useState<FeedbackData>({
    matchId: matchInfo?.id || '',
    overallRating: 0,
    personalityRating: 0,
    valuesRating: 0,
    interestsRating: 0,
    impressiveMoment: '',
    improvementSuggestions: '',
    wantSecondDate: null,
    wantToContinue: null
  })

  const updateField = <K extends keyof FeedbackData>(field: K, value: FeedbackData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    // 验证必填项
    if (formData.overallRating === 0) {
      alert('请给出总体体验评分')
      return
    }

    setIsSubmitting(true)
    
    try {
      if (onSubmit) {
        await onSubmit(formData)
      } else {
        // 默认保存到 localStorage
        const existingFeedback = JSON.parse(localStorage.getItem('feedback_history') || '[]')
        existingFeedback.push({
          ...formData,
          submittedAt: new Date().toISOString()
        })
        localStorage.setItem('feedback_history', JSON.stringify(existingFeedback))
      }
      
      // 显示成功动画
      setShowSuccess(true)
    } catch (error) {
      console.error('Failed to submit feedback:', error)
      alert('提交失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSuccessComplete = () => {
    setShowSuccess(false)
    if (onSuccess) {
      onSuccess()
    } else {
      // 默认跳转到历史页面
      window.location.href = '/match/history'
    }
  }

  return (
    <>
      <div className="space-y-6">
        {/* 匹配对象信息卡片 */}
        {matchInfo && (
          <FadeIn>
            <GlassCard className="p-6 bg-gradient-to-br from-rose-50/80 to-pink-50/80 border-rose-200/50">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-300/50 overflow-hidden">
                  {matchInfo.partnerAvatar ? (
                    <img 
                      src={matchInfo.partnerAvatar} 
                      alt={matchInfo.partnerName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Heart className="w-8 h-8 text-white" fill="white" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{matchInfo.partnerName}</h3>
                  {matchInfo.matchedAt && (
                    <p className="text-sm text-gray-500">
                      匹配于 {new Date(matchInfo.matchedAt).toLocaleDateString('zh-CN')}
                    </p>
                  )}
                </div>
              </div>
            </GlassCard>
          </FadeIn>
        )}

        {/* 总体体验评分 */}
        <FadeIn delay={0.1}>
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-rose-500" />
              <h3 className="text-lg font-semibold text-gray-800">总体体验</h3>
            </div>
            <StarRating
              value={formData.overallRating}
              onChange={(value) => updateField('overallRating', value)}
              size="lg"
              label="这次约会给你留下了怎样的印象？"
              required
            />
          </GlassCard>
        </FadeIn>

        {/* 维度评分 */}
        <FadeIn delay={0.2}>
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Heart className="w-5 h-5 text-rose-500" fill="currentColor" />
              <h3 className="text-lg font-semibold text-gray-800">多维度评分</h3>
            </div>
            
            <div className="space-y-6">
              <StarRating
                value={formData.personalityRating}
                onChange={(value) => updateField('personalityRating', value)}
                size="md"
                label="性格匹配度"
                required
              />
              <StarRating
                value={formData.valuesRating}
                onChange={(value) => updateField('valuesRating', value)}
                size="md"
                label="价值观匹配度"
                required
              />
              <StarRating
                value={formData.interestsRating}
                onChange={(value) => updateField('interestsRating', value)}
                size="md"
                label="兴趣爱好匹配度"
                required
              />
            </div>
          </GlassCard>
        </FadeIn>

        {/* 开放问题 */}
        <FadeIn delay={0.3}>
          <GlassCard className="p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  这次约会让你印象深刻的地方？
                </label>
                <textarea
                  value={formData.impressiveMoment}
                  onChange={(e) => updateField('impressiveMoment', e.target.value)}
                  placeholder="可以分享任何让你感到温暖、心动或有趣的瞬间..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all placeholder:text-gray-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  有什么可以改进的？
                </label>
                <textarea
                  value={formData.improvementSuggestions}
                  onChange={(e) => updateField('improvementSuggestions', e.target.value)}
                  placeholder="你的建议对我们很重要..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all placeholder:text-gray-400"
                />
              </div>
            </div>
          </GlassCard>
        </FadeIn>

        {/* 后续意愿 */}
        <FadeIn delay={0.4}>
          <GlassCard className="p-6">
            <div className="space-y-6">
              <RadioGroup
                label="是否愿意见第二次？"
                value={formData.wantSecondDate}
                onChange={(value) => updateField('wantSecondDate', value)}
                required
              />
              <RadioGroup
                label="是否愿意继续了解？"
                value={formData.wantToContinue}
                onChange={(value) => updateField('wantToContinue', value)}
                required
              />
            </div>
          </GlassCard>
        </FadeIn>

        {/* 提交按钮 */}
        <FadeIn delay={0.5}>
          <GradientButton 
            size="lg" 
            className="w-full"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                提交中...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <PartyPopper className="w-5 h-5" />
                提交反馈
              </span>
            )}
          </GradientButton>
        </FadeIn>
      </div>

      {/* 成功动画 */}
      <AnimatePresence>
        {showSuccess && (
          <SuccessAnimation onComplete={handleSuccessComplete} />
        )}
      </AnimatePresence>
    </>
  )
}
