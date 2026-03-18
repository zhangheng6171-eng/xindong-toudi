'use client'

import { useState } from 'react'
import { questions, Question } from '@/lib/questionnaire-data-v2'

interface QuestionnaireProps {
  onComplete?: (answers: Record<string, any>) => void
}

export default function Questionnaire() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [isCompleted, setIsCompleted] = useState(false)
  
  const onComplete = (answers: Record<string, any>) => {
    console.log('Questionnaire completed:', answers)
  }

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100

  const handleAnswer = (answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.code]: answer
    }))
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      setIsCompleted(true)
      onComplete?.(answers)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const handleSkip = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-5xl">💕</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            问卷已完成！
          </h2>
          <p className="text-gray-600 mb-6">
            感谢你的用心回答。现在让我们开始为你寻找命中注定的那个人～
          </p>
          <button className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold rounded-2xl hover:from-rose-600 hover:to-pink-600 transition-all">
            查看匹配结果
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 py-4 px-4">
      {/* 进度条 */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">
            问题 {currentIndex + 1} / {questions.length}
          </span>
          <span className="text-sm font-medium text-rose-500">
            {Math.round(progress)}% 完成
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-rose-400 to-pink-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 维度标签 */}
      <div className="max-w-2xl mx-auto mb-4">
        <span className="inline-block px-4 py-1 bg-rose-100 text-rose-600 rounded-full text-sm font-medium">
          {currentQuestion.dimensionName}
        </span>
      </div>

      {/* 问题卡片 */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
            {currentQuestion.questionText}
          </h2>
          
          {currentQuestion.helpText && (
            <p className="text-gray-500 mb-6">{currentQuestion.helpText}</p>
          )}

          {/* 题型渲染 */}
          <QuestionRenderer 
            question={currentQuestion} 
            answer={answers[currentQuestion.code]}
            onAnswer={handleAnswer}
          />

          {/* 操作按钮 */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-6 py-3 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:text-gray-700 transition-colors"
            >
              ← 上一题
            </button>

            <div className="flex gap-3">
              {!currentQuestion.isRequired && (
                <button
                  onClick={handleSkip}
                  className="px-6 py-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  跳过
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold rounded-2xl hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg shadow-rose-200"
              >
                {currentIndex === questions.length - 1 ? '提交问卷' : '下一题 →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 题型渲染组件
function QuestionRenderer({ 
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
}

// 单选题
function SingleChoice({ 
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
        <label
          key={option.value}
          className={`
            flex items-start p-4 rounded-2xl border-2 cursor-pointer transition-all
            ${value === option.value 
              ? 'border-rose-500 bg-rose-50' 
              : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
            }
          `}
        >
          <input
            type="radio"
            name={option.value}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="sr-only"
          />
          <span className={`
            w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center flex-shrink-0 mt-0.5
            ${value === option.value 
              ? 'border-rose-500 bg-rose-500' 
              : 'border-gray-300'
            }
          `}>
            {value === option.value && (
              <span className="w-2 h-2 bg-white rounded-full" />
            )}
          </span>
          <span className="text-gray-700">{option.label}</span>
        </label>
      ))}
    </div>
  )
}

// 多选题
function MultipleChoice({ 
  options, 
  values, 
  onChange 
}: { 
  options: any[] 
  values: string[] 
  onChange: (v: string[]) => void 
}) {
  const toggleOption = (optionValue: string) => {
    if (values.includes(optionValue)) {
      onChange(values.filter(v => v !== optionValue))
    } else {
      onChange([...values, optionValue])
    }
  }

  return (
    <div className="space-y-3">
      {options.map((option) => (
        <label
          key={option.value}
          className={`
            flex items-start p-4 rounded-2xl border-2 cursor-pointer transition-all
            ${values.includes(option.value) 
              ? 'border-pink-500 bg-pink-50' 
              : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
            }
          `}
        >
          <input
            type="checkbox"
            checked={values.includes(option.value)}
            onChange={() => toggleOption(option.value)}
            className="sr-only"
          />
          <span className={`
            w-6 h-6 rounded-lg border-2 mr-4 flex items-center justify-center flex-shrink-0 mt-0.5
            ${values.includes(option.value) 
              ? 'border-pink-500 bg-pink-500' 
              : 'border-gray-300'
            }
          `}>
            {values.includes(option.value) && (
              <span className="text-white text-lg">✓</span>
            )}
          </span>
          <span className="text-gray-700">{option.label}</span>
        </label>
      ))}
    </div>
  )
}

// 量表题
function LikertScale({ 
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
  const labels = []
  for (let i = config.min; i <= max; i++) {
    labels.push(i)
  }

  return (
    <div className="space-y-4">
      {/* 量表 */}
      <div className="flex justify-between gap-2">
        {labels.map((num) => (
          <button
            key={num}
            onClick={() => onChange(num)}
            className={`
              flex-1 py-4 rounded-xl font-bold transition-all
              ${value === num 
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' 
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }
            `}
          >
            {num}
          </button>
        ))}
      </div>
      
      {/* 标签 */}
      <div className="flex justify-between text-sm text-gray-500 px-1">
        <span>{config.minLabel}</span>
        <span>{config.maxLabel}</span>
      </div>
    </div>
  )
}

// 排序题
function RankingQuestion({ 
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

  const moveItem = (fromIndex: number, direction: 'up' | 'down') => {
    const newOrder = [...currentOrder]
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1
    
    if (toIndex < 0 || toIndex >= newOrder.length) return
    
    // 交换
    const temp = newOrder[fromIndex]
    newOrder[fromIndex] = newOrder[toIndex]
    newOrder[toIndex] = temp
    
    setCurrentOrder(newOrder)
    onChange(newOrder)
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-500 mb-4">拖动或点击箭头调整顺序，最上面的为最重要的</p>
      
      {currentOrder.map((item, index) => (
        <div
          key={item}
          className={`
            flex items-center p-4 rounded-xl border-2
            ${index === 0 ? 'border-rose-300 bg-rose-50' : 'border-gray-100'}
          `}
        >
          <span className={`
            w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-4
            ${index === 0 ? 'bg-rose-500 text-white' : 'bg-gray-200 text-gray-600'}
          `}>
            {index + 1}
          </span>
          
          <span className="flex-1 font-medium text-gray-700">{item}</span>
          
          <div className="flex gap-1">
            <button
              onClick={() => moveItem(index, 'up')}
              disabled={index === 0}
              className="p-2 text-gray-400 disabled:opacity-30 hover:text-rose-500 transition-colors"
            >
              ↑
            </button>
            <button
              onClick={() => moveItem(index, 'down')}
              disabled={index === currentOrder.length - 1}
              className="p-2 text-gray-400 disabled:opacity-30 hover:text-rose-500 transition-colors"
            >
              ↓
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// 开放文本题
function OpenText({ 
  value, 
  onChange 
}: { 
  value: string 
  onChange: (v: string) => void 
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="在这里写下你的回答..."
      className="w-full h-32 p-4 border-2 border-gray-100 rounded-2xl focus:border-rose-300 focus:outline-none resize-none text-gray-700 placeholder-gray-400"
    />
  )
}
