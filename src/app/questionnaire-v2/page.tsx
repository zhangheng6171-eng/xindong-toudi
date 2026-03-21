'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Sparkles, ChevronLeft, ChevronRight, Check, SkipForward, GripVertical, ArrowUp, ArrowDown } from 'lucide-react'
import { questions, Question } from '@/lib/questionnaire-data-v2'
import { AnimatedBackground, GlassCard, GradientButton, GradientText, FadeIn, Tag } from '@/components/animated-background'

// 动画变体
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

interface QuestionnaireProps {
  onComplete?: (answers: Record<string, any>) => void
}

export default function Questionnaire({ onComplete }: QuestionnaireProps) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [isCompleted, setIsCompleted] = useState(false)

  const handleViewResults = useCallback(() => {
    router.push('/dashboard')
  }, [router])

  const currentQuestion = questions[currentIndex]
  
  // 使用 useMemo 缓存进度计算
  const progress = useMemo(() => 
    ((currentIndex + 1) / questions.length) * 100,
    [currentIndex]
  )

  const handleAnswer = useCallback((answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.code]: answer
    }))
  }, [currentQuestion.code])

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      setIsCompleted(true)
      localStorage.setItem('questionnaireAnswers', JSON.stringify(answers))
      onComplete?.(answers)
    }
  }, [currentIndex, answers, onComplete])

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }, [currentIndex])

  const handleSkip = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }, [currentIndex])

  if (isCompleted) {
    return (
      <AnimatedBackground variant="romance" showFloatingHearts>
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <GlassCard className="max-w-md w-full p-8 text-center">
              <motion.div
                className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-rose-400 to-pink-500 rounded-3xl flex items-center justify-center shadow-xl shadow-rose-300/50"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Heart className="w-12 h-12 text-white" fill="white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                问卷已完成！💕
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                感谢你的用心回答。现在让我们开始为你寻找命中注定的那个人～
              </p>
              <GradientButton size="lg" className="w-full" onClick={handleViewResults}>
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  查看匹配结果
                </span>
              </GradientButton>
            </GlassCard>
          </motion.div>
        </div>
      </AnimatedBackground>
    )
  }

  return (
    <AnimatedBackground variant="romance" showFloatingHearts>
      <div className="min-h-screen py-6 sm:py-10 px-4">
        {/* 进度条 */}
        <div className="max-w-2xl mx-auto mb-6">
          <FadeIn className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-300/50">
                <Heart className="w-5 h-5 text-white" fill="white" />
              </div>
              <span className="text-sm text-gray-600">
                问题 <span className="font-bold text-gray-800">{currentIndex + 1}</span> / {questions.length}
              </span>
            </div>
            <span className="text-sm font-bold text-rose-500 bg-rose-50 px-3 py-1 rounded-full">
              {Math.round(progress)}% 完成
            </span>
          </FadeIn>
          
          <div className="h-2 bg-white/50 backdrop-blur-sm rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-rose-400 via-pink-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* 维度标签 */}
        <FadeIn delay={0.1} className="max-w-2xl mx-auto mb-4">
          <Tag color="rose">
            <Sparkles className="w-3 h-3 mr-1" />
            {currentQuestion.dimensionName}
          </Tag>
        </FadeIn>

        {/* 问题卡片 */}
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <GlassCard className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 leading-relaxed">
                  {currentQuestion.questionText}
                </h2>
                
                {currentQuestion.helpText && (
                  <p className="text-gray-500 mb-6 text-sm">{currentQuestion.helpText}</p>
                )}

                {/* 题型渲染 */}
                <QuestionRenderer 
                  question={currentQuestion} 
                  answer={answers[currentQuestion.code]}
                  onAnswer={handleAnswer}
                />

                {/* 操作按钮 */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
                  <motion.button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="flex items-center gap-2 px-5 py-3 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:text-rose-500 transition-colors bg-white/50 backdrop-blur-sm rounded-2xl"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                    上一题
                  </motion.button>

                  <div className="flex gap-3">
                    {!currentQuestion.isRequired && (
                      <motion.button
                        onClick={handleSkip}
                        className="flex items-center gap-2 px-5 py-3 text-gray-400 hover:text-gray-600 transition-colors bg-white/50 backdrop-blur-sm rounded-2xl"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <SkipForward className="w-4 h-4" />
                        跳过
                      </motion.button>
                    )}
                    <GradientButton onClick={handleNext}>
                      <span className="flex items-center gap-2">
                        {currentIndex === questions.length - 1 ? '提交问卷' : '下一题'}
                        {currentIndex === questions.length - 1 
                          ? <Heart className="w-5 h-5" fill="white" />
                          : <ChevronRight className="w-5 h-5" />
                        }
                      </span>
                    </GradientButton>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </AnimatedBackground>
  )
}

// 题型渲染组件 - 使用 memo 优化
const QuestionRenderer = memo(function QuestionRenderer({ 
  question, 
  answer, 
  onAnswer 
}: { 
  question: Question
  answer: any
  onAnswer: (answer: any) => void 
}) {
  switch (question.questionType) {
    case 'single_choice':
      return (
        <SingleChoice 
          options={question.options || []} 
          value={answer?.value} 
          onChange={(v) => onAnswer({ value: v })}
        />
      )
    
    case 'multiple_choice':
      return (
        <MultipleChoice 
          options={question.options || []} 
          values={answer?.values || []} 
          onChange={(v) => onAnswer({ values: v })}
        />
      )
    
    case 'likert_5':
    case 'likert_7':
      return (
        <LikertScale 
          question={question}
          value={answer?.value} 
          onChange={(v) => onAnswer({ value: v })}
        />
      )
    
    case 'ranking':
      return (
        <RankingQuestion 
          items={question.rankingItems || []} 
          value={answer?.order || []}
          onChange={(v) => onAnswer({ order: v })}
        />
      )
    
    case 'open_text':
      return (
        <OpenText 
          value={answer?.text || ''} 
          onChange={(v) => onAnswer({ text: v })}
        />
      )
    
    default:
      return <div className="text-gray-400">暂不支持此题型</div>
  }
})

// 单选题 - 使用 memo 优化
const SingleChoice = memo(function SingleChoice({ 
  options, 
  value, 
  onChange 
}: { 
  options: any[] 
  value?: string 
  onChange: (v: string) => void 
}) {
  return (
    <div className="space-y-3">
      {options.map((option, index) => (
        <motion.label
          key={option.value}
          className={`
            flex items-start p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300
            ${value === option.value 
              ? 'border-rose-400 bg-gradient-to-r from-rose-50 to-pink-50 shadow-lg shadow-rose-200/50' 
              : 'border-white/50 bg-white/50 hover:border-rose-200 hover:bg-white/80'
            }
          `}
          whileHover={{ scale: 1.01, x: 4 }}
          whileTap={{ scale: 0.99 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.03 }}
        >
          <input
            type="radio"
            name={option.value}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="sr-only"
          />
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
            value === option.value 
              ? 'border-rose-500 bg-gradient-to-br from-rose-400 to-pink-500 shadow-lg shadow-rose-300/50' 
              : 'border-gray-300 bg-white'
          }`}>
            {value === option.value && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <Check className="w-4 h-4 text-white" strokeWidth={3} />
              </motion.div>
            )}
          </div>
          <span className="ml-4 text-gray-700 font-medium">{option.label}</span>
        </motion.label>
      ))}
    </div>
  )
})

// 多选题 - 使用 memo 优化
const MultipleChoice = memo(function MultipleChoice({ 
  options, 
  values, 
  onChange 
}: { 
  options: any[] 
  values: string[] 
  onChange: (v: string[]) => void 
}) {
  const toggleOption = useCallback((optionValue: string) => {
    if (values.includes(optionValue)) {
      onChange(values.filter(v => v !== optionValue))
    } else {
      onChange([...values, optionValue])
    }
  }, [values, onChange])

  return (
    <div className="space-y-3">
      {options.map((option, index) => (
        <motion.label
          key={option.value}
          className={`
            flex items-start p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300
            ${values.includes(option.value) 
              ? 'border-pink-400 bg-gradient-to-r from-pink-50 to-rose-50 shadow-lg shadow-pink-200/50' 
              : 'border-white/50 bg-white/50 hover:border-pink-200 hover:bg-white/80'
            }
          `}
          whileHover={{ scale: 1.01, x: 4 }}
          whileTap={{ scale: 0.99 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.03 }}
        >
          <input
            type="checkbox"
            checked={values.includes(option.value)}
            onChange={() => toggleOption(option.value)}
            className="sr-only"
          />
          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
            values.includes(option.value) 
              ? 'border-pink-500 bg-gradient-to-br from-pink-400 to-rose-500 shadow-lg shadow-pink-300/50' 
              : 'border-gray-300 bg-white'
          }`}>
            {values.includes(option.value) && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
              >
                <Check className="w-4 h-4 text-white" strokeWidth={3} />
              </motion.div>
            )}
          </div>
          <span className="ml-4 text-gray-700 font-medium">{option.label}</span>
        </motion.label>
      ))}
    </div>
  )
})

// 量表题 - 使用 memo 优化
const LikertScale = memo(function LikertScale({ 
  question,
  value, 
  onChange 
}: { 
  question: Question
  value?: number 
  onChange: (v: number) => void 
}) {
  const config = question.scaleConfig
  if (!config) return null

  const max = config.max
  const labels = useMemo(() => {
    const arr = []
    for (let i = config.min; i <= max; i++) {
      arr.push(i)
    }
    return arr
  }, [config.min, max])

  return (
    <div className="space-y-6 py-4">
      <div className="flex justify-between gap-2 sm:gap-3">
        {labels.map((num, index) => (
          <motion.button
            key={num}
            onClick={() => onChange(num)}
            className={`flex-1 py-4 sm:py-5 rounded-2xl font-bold text-base sm:text-lg transition-all ${
              value === num
                ? 'bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-xl shadow-rose-300/50'
                : 'bg-white/80 text-gray-500 hover:bg-white border border-gray-100'
            }`}
            whileHover={{ scale: value === num ? 1.05 : 1.02 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            {num}
          </motion.button>
        ))}
      </div>
      <div className="flex justify-between text-sm text-gray-500 px-1">
        <span className="max-w-[40%] text-left">{config.minLabel}</span>
        <span className="max-w-[40%] text-right">{config.maxLabel}</span>
      </div>
    </div>
  )
})

// 排序题 - 使用 memo 优化
const RankingQuestion = memo(function RankingQuestion({ 
  items, 
  value, 
  onChange 
}: { 
  items: string[] 
  value: string[] 
  onChange: (v: string[]) => void 
}) {
  const [currentOrder, setCurrentOrder] = useState<string[]>(
    value.length > 0 ? value : [...items]
  )

  const moveItem = useCallback((fromIndex: number, direction: 'up' | 'down') => {
    const newOrder = [...currentOrder]
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1
    
    if (toIndex < 0 || toIndex >= newOrder.length) return
    
    const temp = newOrder[fromIndex]
    newOrder[fromIndex] = newOrder[toIndex]
    newOrder[toIndex] = temp
    
    setCurrentOrder(newOrder)
    onChange(newOrder)
  }, [currentOrder, onChange])

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
        <GripVertical className="w-4 h-4" />
        点击箭头调整顺序，最上面的为最重要的
      </p>
      
      {currentOrder.map((item, index) => (
        <motion.div
          key={item}
          className={`
            flex items-center p-4 rounded-2xl border-2 transition-all
            ${index === 0 
              ? 'border-rose-300 bg-gradient-to-r from-rose-50 to-pink-50 shadow-lg shadow-rose-200/50' 
              : 'border-white/50 bg-white/60 hover:border-rose-200'
            }
          `}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.03 }}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm mr-4 shadow-lg ${
            index === 0 
              ? 'bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-rose-300/50' 
              : index < 3 
                ? 'bg-gradient-to-br from-purple-400 to-violet-500 text-white shadow-purple-300/50'
                : 'bg-gray-100 text-gray-600'
          }`}>
            {index + 1}
          </div>
          
          <span className="flex-1 font-medium text-gray-700">{item}</span>
          
          <div className="flex gap-1">
            <motion.button
              onClick={() => moveItem(index, 'up')}
              disabled={index === 0}
              className="p-2 text-gray-400 disabled:opacity-30 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowUp className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={() => moveItem(index, 'down')}
              disabled={index === currentOrder.length - 1}
              className="p-2 text-gray-400 disabled:opacity-30 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowDown className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      ))}
    </div>
  )
})

// 开放文本题 - 使用 memo 优化
const OpenText = memo(function OpenText({ 
  value, 
  onChange 
}: { 
  value: string 
  onChange: (v: string) => void 
}) {
  return (
    <motion.textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="在这里写下你的回答..."
      className="w-full h-36 p-5 border-2 border-white/50 bg-white/60 rounded-2xl focus:border-rose-300 focus:bg-white/80 focus:ring-4 focus:ring-rose-100 focus:outline-none resize-none text-gray-700 placeholder-gray-400 transition-all"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    />
  )
})
