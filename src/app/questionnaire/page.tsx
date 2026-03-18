'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui'
import { ProgressBar } from '@/components/ui'

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
                <button
                  key={index}
                  onClick={() => handleAnswer(value)}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium">{label}</span>
                  </div>
                </button>
              )
            })}
          </div>
        )

      case 'multiple_choice':
        const selectedAnswers = answers[question.id] || []
        const maxSelect = question.maxSelect || 5
        
        return (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-4">
              已选择 {selectedAnswers.length} / {maxSelect} 个
            </p>
            {question.options?.map((option, index) => {
              const isSelected = selectedAnswers.includes(option)
              const canSelect = selectedAnswers.length < maxSelect || isSelected
              
              return (
                <button
                  key={index}
                  onClick={() => {
                    if (!canSelect) return
                    const newAnswers = isSelected
                      ? selectedAnswers.filter((a: string) => a !== option)
                      : [...selectedAnswers, option]
                    handleAnswer(newAnswers)
                  }}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : canSelect
                        ? 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                        : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      isSelected ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium">{typeof option === 'string' ? option : option.label}</span>
                  </div>
                </button>
              )
            })}
          </div>
        )

      case 'scale':
        return (
          <div className="space-y-6">
            <input
              type="range"
              min={question.min || 1}
              max={question.max || 5}
              value={answers[question.id] || 3}
              onChange={(e) => handleAnswer(parseInt(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary-500"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>{question.minLabel}</span>
              <span className="font-bold text-primary-600 text-lg">{answers[question.id] || 3}</span>
              <span>{question.maxLabel}</span>
            </div>
          </div>
        )

      case 'slider':
        return (
          <div className="space-y-6">
            <div className="relative pt-8 pb-4">
              <input
                type="range"
                min={0}
                max={100}
                value={answers[question.id] || 50}
                onChange={(e) => handleAnswer(parseInt(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary-500"
              />
              {/* Custom thumb position indicator */}
              <div 
                className="absolute top-0 w-12 h-12 bg-gradient-to-br from-primary-400 to-romance-400 rounded-full transform -translate-x-1/2 shadow-lg"
                style={{ left: `${answers[question.id] || 50}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>{question.minLabel}</span>
              <span>{question.maxLabel}</span>
            </div>
          </div>
        )

      case 'ranking':
        return (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-4">
              拖动调整顺序，最重要的放在最上面
            </p>
            {rankingItems.map((item, index) => (
              <div
                key={typeof item === 'string' ? item : item.value}
                className="flex items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-2xl hover:border-primary-300 transition-all cursor-move"
                draggable
                onDragStart={(e) => e.dataTransfer.setData('index', index.toString())}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const fromIndex = parseInt(e.dataTransfer.getData('index'))
                  moveRankingItem(fromIndex, index)
                }}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-romance-400 rounded-full flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <span className="font-medium">{typeof item === 'string' ? item : item.label}</span>
                <svg className="w-5 h-5 text-gray-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </div>
            ))}
          </div>
        )

      case 'open_text':
        return (
          <div className="space-y-4">
            <textarea
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder={question.placeholder}
              maxLength={question.maxLength}
              rows={5}
              className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-primary-500 focus:ring-0 transition-colors resize-none"
            />
            <div className="text-right text-sm text-gray-400">
              {(answers[question.id]?.length || 0)} / {question.maxLength}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handlePrev}
            disabled={currentQuestion === 0}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>上一题</span>
          </button>
          
          <div className="text-sm text-gray-500">
            第 {groupProgress} 组 / 共 {groups.length} 组
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar progress={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>{currentGroup}</span>
            <span>{currentQuestion + 1} / {questions.length}</span>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-primary-500" />
            <span className="text-sm text-primary-600 font-medium">{currentGroup}</span>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-8">
            {question.question}
          </h2>

          {renderQuestion()}
        </div>

        {/* Tip */}
        <div className="bg-primary-50 rounded-2xl p-4 mb-8">
          <p className="text-sm text-primary-700">
            💡 了解你的{currentGroup.toLowerCase()}，帮助我们匹配更合适的人
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentQuestion === 0}
          >
            上一题
          </Button>
          
          {currentQuestion === questions.length - 1 ? (
            <Button
              variant="primary"
              size="lg"
            >
              完成问卷
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={handleNext}
            >
              下一题
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
