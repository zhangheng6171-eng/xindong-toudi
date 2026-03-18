'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Sparkles, Heart, Check, GripVertical } from 'lucide-react'
import { AnimatedBackground, GlassCard, GradientButton, GradientText, FadeIn, Tag } from '@/components/animated-background'

// 问卷问题数据
const questions = [
  {
    id: 1,
    group: '基本信息',
    question: '你的性别是？',
    type: 'single_choice',
    options: ['男', '女', '其他'],
  },
  {
    id: 2,
    group: '基本信息',
    question: '你希望匹配对象的性别？',
    type: 'single_choice',
    options: ['男', '女', '都可以'],
  },
  {
    id: 3,
    group: '基本信息',
    question: '你的年龄段是？',
    type: 'single_choice',
    options: ['18-22岁', '23-26岁', '27-30岁', '31-35岁', '35岁以上'],
  },
  {
    id: 4,
    group: '价值观',
    question: '请排序你人生核心价值观的重要性（拖动调整）',
    type: 'ranking',
    options: ['家庭', '事业', '健康', '友情', '爱情', '自由', '财富', '成长'],
  },
  {
    id: 5,
    group: '价值观',
    question: '对孩子，你的态度是？',
    type: 'single_choice',
    options: [
      { value: 'want', label: '是我的人生目标 👶', emoji: '👶' },
      { value: 'maybe', label: '有也可以，没有也行' },
      { value: 'not_important', label: '不太在意' },
      { value: 'no', label: '不想有孩子 🚫' },
    ],
  },
  {
    id: 6,
    group: '生活方式',
    question: '你的作息习惯是？',
    type: 'single_choice',
    options: [
      { value: 'early', label: '早起的鸟儿（6点前）' },
      { value: 'normal', label: '正常作息（7-8点起床）' },
      { value: 'night', label: '夜猫子（晚上最有精神）' },
      { value: 'irregular', label: '作息不规律' },
    ],
  },
  {
    id: 7,
    group: '生活方式',
    question: '理想的周末是？',
    type: 'single_choice',
    options: [
      '在家休息，充电放松',
      '和朋友聚会，热闹一下',
      '户外运动/旅行',
      '学习新技能/看书',
      '看情况，随心所欲',
    ],
  },
  {
    id: 8,
    group: '生活方式',
    question: '大型社交聚会（10人以上）后，你的感受是？',
    type: 'scale',
    min: 1,
    max: 5,
    minLabel: '精力充沛，还想继续',
    maxLabel: '筋疲力尽，需要独处',
  },
  {
    id: 9,
    group: '恋爱观',
    question: '你目前希望从恋爱关系中获得？',
    type: 'single_choice',
    options: [
      '长期稳定的关系/婚姻',
      '认真恋爱，但还不考虑结婚',
      '先交往看看，顺其自然',
      '享受过程，不强求结果',
    ],
  },
  {
    id: 10,
    group: '恋爱观',
    question: '当和伴侣发生冲突时，你通常会？',
    type: 'single_choice',
    options: [
      '直接表达，当场解决',
      '先冷静一下，再沟通',
      '回避冲突，希望能自然过去',
      '寻求妥协，各退一步',
      '坚持自己的立场',
    ],
  },
  {
    id: 11,
    group: '恋爱观',
    question: '你表达/感受爱的方式是？（选择最重要的3个）',
    type: 'multiple_choice',
    maxSelect: 3,
    options: [
      '语言表达（说"我爱你"、夸奖）',
      '精心时刻（高质量相处时间）',
      '接受礼物',
      '服务的行动（帮对方做事）',
      '身体接触',
    ],
  },
  {
    id: 12,
    group: '性格特质',
    question: '在社交场合，你更倾向于？',
    type: 'slider',
    minLabel: '内向（独处充电）',
    maxLabel: '外向（社交充电）',
  },
  {
    id: 13,
    group: '性格特质',
    question: '做重要决定时，你更依赖？',
    type: 'single_choice',
    options: [
      '理性分析，逻辑推理',
      '直觉和感受',
      '听取他人意见',
      '理性和感性结合',
      '随缘，顺其自然',
    ],
  },
  {
    id: 14,
    group: '兴趣爱好',
    question: '你喜欢做的事情？（可多选）',
    type: 'multiple_choice',
    maxSelect: 5,
    options: [
      '阅读', '电影/剧集', '音乐', '运动/健身', '游戏',
      '旅行', '美食/烹饪', '摄影', '艺术/手工', '写作',
    ],
  },
  {
    id: 15,
    group: '开放式问题',
    question: '回想一次你特别喜欢的约会/出门玩，是什么让它如此特别？',
    type: 'open_text',
    placeholder: '请分享你的经历...',
    maxLength: 500,
  },
]

const groups = ['基本信息', '价值观', '生活方式', '恋爱观', '性格特质', '兴趣爱好', '开放式问题']

// 动画变体
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

export default function QuestionnairePage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, any>>({})
  const [sliderValue, setSliderValue] = useState(50)
  const [rankingItems, setRankingItems] = useState(
    questions.find(q => q.type === 'ranking')?.options || []
  )

  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100
  const currentGroup = question.group
  const groupProgress = groups.indexOf(currentGroup) + 1

  const handleAnswer = (answer: any) => {
    setAnswers(prev => ({ ...prev, [question.id]: answer }))
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const moveRankingItem = (fromIndex: number, toIndex: number) => {
    const newItems = [...rankingItems]
    const removed = newItems.splice(fromIndex, 1)[0]
    newItems.splice(toIndex, 0, removed)
    setRankingItems(newItems as any)
    handleAnswer(newItems as any)
  }

  const renderQuestion = () => {
    switch (question.type) {
      case 'single_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => {
              const value = typeof option === 'string' ? option : option.value
              const label = typeof option === 'string' ? option : option.label
              const isSelected = answers[question.id] === value
              
              return (
                <motion.button
                  key={index}
                  onClick={() => handleAnswer(value)}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 ${
                    isSelected
                      ? 'border-rose-400 bg-gradient-to-r from-rose-50 to-pink-50 shadow-lg shadow-rose-200/50'
                      : 'border-white/50 bg-white/50 hover:border-rose-200 hover:bg-white/80'
                  }`}
                  whileHover={{ scale: 1.01, x: 4 }}
                  whileTap={{ scale: 0.99 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected 
                        ? 'border-rose-500 bg-gradient-to-br from-rose-400 to-pink-500 shadow-lg shadow-rose-300/50' 
                        : 'border-gray-300 bg-white'
                    }`}>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500 }}
                        >
                          <Check className="w-4 h-4 text-white" strokeWidth={3} />
                        </motion.div>
                      )}
                    </div>
                    <span className="font-medium text-gray-700">{label}</span>
                  </div>
                </motion.button>
              )
            })}
          </div>
        )

      case 'multiple_choice':
        const selectedAnswers = answers[question.id] || []
        const maxSelect = question.maxSelect || 5
        
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                已选择 <span className="font-bold text-rose-500">{selectedAnswers.length}</span> / {maxSelect} 个
              </p>
              {selectedAnswers.length >= maxSelect && (
                <Tag color="rose">已达上限</Tag>
              )}
            </div>
            {question.options?.map((option, index) => {
              const isSelected = selectedAnswers.includes(option)
              const canSelect = selectedAnswers.length < maxSelect || isSelected
              
              return (
                <motion.button
                  key={index}
                  onClick={() => {
                    if (!canSelect) return
                    const newAnswers = isSelected
                      ? selectedAnswers.filter((a: string) => a !== option)
                      : [...selectedAnswers, option]
                    handleAnswer(newAnswers)
                  }}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 ${
                    isSelected
                      ? 'border-pink-400 bg-gradient-to-r from-pink-50 to-rose-50 shadow-lg shadow-pink-200/50'
                      : canSelect
                        ? 'border-white/50 bg-white/50 hover:border-pink-200 hover:bg-white/80'
                        : 'border-gray-100 bg-gray-50/50 opacity-50 cursor-not-allowed'
                  }`}
                  whileHover={canSelect ? { scale: 1.01, x: 4 } : {}}
                  whileTap={canSelect ? { scale: 0.99 } : {}}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      isSelected 
                        ? 'border-pink-500 bg-gradient-to-br from-pink-400 to-rose-500 shadow-lg shadow-pink-300/50' 
                        : 'border-gray-300 bg-white'
                    }`}>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 500 }}
                        >
                          <Check className="w-4 h-4 text-white" strokeWidth={3} />
                        </motion.div>
                      )}
                    </div>
                    <span className="font-medium text-gray-700">{typeof option === 'string' ? option : option.label}</span>
                  </div>
                </motion.button>
              )
            })}
          </div>
        )

      case 'scale':
        const scaleValue = answers[question.id] || 3
        return (
          <div className="space-y-8 py-4">
            <div className="flex justify-between gap-3">
              {Array.from({ length: (question.max || 5) - (question.min || 1) + 1 }, (_, i) => {
                const num = (question.min || 1) + i
                const isSelected = scaleValue === num
                return (
                  <motion.button
                    key={num}
                    onClick={() => handleAnswer(num)}
                    className={`flex-1 py-5 rounded-2xl font-bold text-lg transition-all ${
                      isSelected
                        ? 'bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-xl shadow-rose-300/50 scale-110'
                        : 'bg-white/80 text-gray-500 hover:bg-white border border-gray-100'
                    }`}
                    whileHover={{ scale: isSelected ? 1.1 : 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {num}
                  </motion.button>
                )
              })}
            </div>
            <div className="flex justify-between text-sm text-gray-500 px-2">
              <span className="text-left max-w-[40%]">{question.minLabel}</span>
              <span className="text-right max-w-[40%]">{question.maxLabel}</span>
            </div>
          </div>
        )

      case 'slider':
        const sliderVal = answers[question.id] || 50
        return (
          <div className="space-y-8 py-8">
            <div className="relative">
              {/* 背景轨道 */}
              <div className="h-3 bg-gradient-to-r from-purple-200 via-rose-200 to-pink-200 rounded-full" />
              
              {/* 填充部分 */}
              <div 
                className="absolute top-0 left-0 h-3 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full transition-all duration-300"
                style={{ width: `${sliderVal}%` }}
              />
              
              {/* 滑块 */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-14 h-14 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full shadow-xl shadow-rose-300/50 flex items-center justify-center cursor-grab active:cursor-grabbing"
                style={{ left: `calc(${sliderVal}% - 28px)` }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Heart className="w-6 h-6 text-white" fill="white" />
              </motion.div>
              
              {/* 隐藏的滑块输入 */}
              <input
                type="range"
                min={0}
                max={100}
                value={sliderVal}
                onChange={(e) => handleAnswer(parseInt(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-300" />
                {question.minLabel}
              </span>
              <span className="flex items-center gap-2">
                {question.maxLabel}
                <span className="w-3 h-3 rounded-full bg-pink-400" />
              </span>
            </div>
          </div>
        )

      case 'ranking':
        return (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
              <GripVertical className="w-4 h-4" />
              拖动调整顺序，最重要的放在最上面
            </p>
            {rankingItems.map((item, index) => (
              <motion.div
                key={typeof item === 'string' ? item : item.value}
                className={`flex items-center gap-3 p-4 bg-white/80 border-2 rounded-2xl cursor-move transition-all ${
                  index === 0 
                    ? 'border-rose-300 shadow-lg shadow-rose-200/50' 
                    : 'border-white/50 hover:border-rose-200'
                }`}
                draggable
                onDragStart={(e) => (e as unknown as React.DragEvent).dataTransfer.setData('index', index.toString())}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const dragEvent = e as unknown as React.DragEvent
                  const fromIndex = parseInt(dragEvent.dataTransfer.getData('index'))
                  moveRankingItem(fromIndex, index)
                }}
                whileHover={{ scale: 1.01, x: 4 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-lg ${
                  index === 0 
                    ? 'bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-rose-300/50' 
                    : index < 3 
                      ? 'bg-gradient-to-br from-purple-400 to-violet-500 text-white shadow-purple-300/50'
                      : 'bg-gray-100 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <span className="font-medium text-gray-700 flex-1">{typeof item === 'string' ? item : item.label}</span>
                <GripVertical className="w-5 h-5 text-gray-400" />
              </motion.div>
            ))}
          </div>
        )

      case 'open_text':
        return (
          <div className="space-y-4">
            <motion.textarea
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder={question.placeholder}
              maxLength={question.maxLength}
              rows={5}
              className="w-full p-5 rounded-2xl border-2 border-white/50 bg-white/60 focus:border-rose-300 focus:bg-white/80 focus:ring-4 focus:ring-rose-100 transition-all resize-none text-gray-700 placeholder-gray-400"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            />
            <div className="flex justify-end">
              <span className="text-sm text-gray-400">
                {(answers[question.id]?.length || 0)} / {question.maxLength}
              </span>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <AnimatedBackground variant="romance" showFloatingHearts>
      <div className="min-h-screen py-6 sm:py-10 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <FadeIn className="flex items-center justify-between mb-6">
            <button
              onClick={handlePrev}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-rose-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all bg-white/50 backdrop-blur-sm rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">上一题</span>
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-300/50">
                <Heart className="w-5 h-5 text-white" fill="white" />
              </div>
              <span className="text-sm font-medium text-gray-600">
                第 {groupProgress} 组 / 共 {groups.length} 组
              </span>
            </div>
            
            <div className="w-20 sm:w-24" /> {/* 占位，保持居中 */}
          </FadeIn>

          {/* Progress Bar */}
          <FadeIn delay={0.1} className="mb-6">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-white/50 backdrop-blur-sm rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-rose-400 via-pink-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <span className="text-sm font-bold text-rose-500 min-w-[60px] text-right">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="flex justify-between mt-3 text-sm">
              <Tag color="rose">
                <Sparkles className="w-3 h-3 mr-1" />
                {currentGroup}
              </Tag>
              <span className="text-gray-500">
                {currentQuestion + 1} / {questions.length}
              </span>
            </div>
          </FadeIn>

          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <GlassCard className="p-6 sm:p-8 mb-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-pink-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-rose-600 font-medium">{currentGroup}</span>
                </div>
                
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-8 leading-relaxed">
                  {question.question}
                </h2>

                {renderQuestion()}
              </GlassCard>
            </motion.div>
          </AnimatePresence>

          {/* Tip */}
          <FadeIn delay={0.2}>
            <GlassCard className="p-4 mb-6 bg-gradient-to-r from-rose-50/80 to-pink-50/80 border-rose-200/50">
              <p className="text-sm text-rose-700 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" fill="currentColor" />
                了解你的{currentGroup.toLowerCase()}，帮助我们匹配更合适的人
              </p>
            </GlassCard>
          </FadeIn>

          {/* Navigation */}
          <FadeIn delay={0.3} className="flex justify-between items-center">
            <motion.button
              onClick={handlePrev}
              disabled={currentQuestion === 0}
              className="px-6 py-3 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:text-rose-500 transition-colors bg-white/50 backdrop-blur-sm rounded-2xl"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              ← 上一题
            </motion.button>
            
            {currentQuestion === questions.length - 1 ? (
              <GradientButton size="lg">
                <span className="flex items-center gap-2">
                  <Heart className="w-5 h-5" fill="white" />
                  完成问卷
                </span>
              </GradientButton>
            ) : (
              <GradientButton size="lg" onClick={handleNext}>
                <span className="flex items-center gap-2">
                  下一题
                  <ChevronRight className="w-5 h-5" />
                </span>
              </GradientButton>
            )}
          </FadeIn>
        </div>
      </div>
    </AnimatedBackground>
  )
}
