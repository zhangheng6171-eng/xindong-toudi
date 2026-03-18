'use client'

/**
 * 心动投递 - 破冰组件
 * 
 * 功能：
 * - 智能开场白推荐
 * - 破冰问题推荐
 * - 开场白模板选择
 * - 一键发送
 */

import { useState, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'
import {
  generateOpeningLines,
  generateIceBreakers,
  type UserProfile,
  type MatchContext,
  type OpeningLine,
} from '@/lib/chat-helpers'

// ============================================
// 类型定义
// ============================================

interface IceBreakersProps {
  userA: UserProfile
  userB: UserProfile
  matchContext: MatchContext
  onSend: (message: string) => void
  onDismiss?: () => void
  isFirstMessage?: boolean
  className?: string
}

// ============================================
// 主组件
// ============================================

export function IceBreakers({
  userA,
  userB,
  matchContext,
  onSend,
  onDismiss,
  isFirstMessage = true,
  className,
}: IceBreakersProps) {
  const [selectedTab, setSelectedTab] = useState<'opening' | 'questions'>('opening')
  const [selectedOpening, setSelectedOpening] = useState<OpeningLine | null>(null)
  const [customText, setCustomText] = useState('')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'deep'>('easy')
  
  // 生成开场白
  const openingLines = useMemo(() => {
    return generateOpeningLines(userA, userB, matchContext)
  }, [userA, userB, matchContext])
  
  // 生成破冰问题
  const iceBreakerQuestions = useMemo(() => {
    return generateIceBreakers(difficulty, matchContext)
  }, [difficulty, matchContext])
  
  // 自动选择第一个开场白
  useEffect(() => {
    if (openingLines.length > 0 && !selectedOpening) {
      setSelectedOpening(openingLines[0])
    }
  }, [openingLines, selectedOpening])
  
  const handleSend = (text: string) => {
    onSend(text)
    onDismiss?.()
  }
  
  return (
    <div
      className={cn(
        "bg-white rounded-3xl shadow-xl overflow-hidden",
        className
      )}
    >
      {/* 头部 */}
      <div className="bg-gradient-to-r from-primary-500 to-romance-500 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              {isFirstMessage ? '开始聊天' : '破冰助手'}
            </h2>
            <p className="text-white/80 text-sm mt-1">
              {isFirstMessage 
                ? `和 ${userB.name} 打招呼吧！` 
                : '让聊天更顺畅'}
            </p>
          </div>
          
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-2 text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {/* 匹配度展示 */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 bg-white/20 rounded-full h-2">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${matchContext.matchScore}%` }}
            />
          </div>
          <span className="text-white font-bold text-sm">
            {matchContext.matchScore}% 匹配
          </span>
        </div>
        
        {/* 共同点标签 */}
        {matchContext.commonInterests.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {matchContext.commonInterests.slice(0, 3).map(interest => (
              <span
                key={interest}
                className="px-2 py-0.5 bg-white/20 text-white text-xs rounded-full"
              >
                {interest}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* Tab 切换 */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setSelectedTab('opening')}
          className={cn(
            "flex-1 py-3 text-sm font-medium transition-colors",
            selectedTab === 'opening'
              ? "text-primary-600 border-b-2 border-primary-500"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          💬 开场白推荐
        </button>
        <button
          onClick={() => setSelectedTab('questions')}
          className={cn(
            "flex-1 py-3 text-sm font-medium transition-colors",
            selectedTab === 'questions'
              ? "text-primary-600 border-b-2 border-primary-500"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          ❓ 破冰问题
        </button>
      </div>
      
      {/* 内容区域 */}
      <div className="p-4">
        {selectedTab === 'opening' ? (
          <OpeningTab
            openingLines={openingLines}
            selectedOpening={selectedOpening}
            onSelect={setSelectedOpening}
            customText={customText}
            onCustomTextChange={setCustomText}
            onSend={handleSend}
          />
        ) : (
          <QuestionsTab
            questions={iceBreakerQuestions}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            onSend={handleSend}
          />
        )}
      </div>
      
      {/* 底部提示 */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">
          💡 选择最适合你的开场方式，真诚最重要
        </p>
      </div>
    </div>
  )
}

// ============================================
// 开场白 Tab
// ============================================

interface OpeningTabProps {
  openingLines: OpeningLine[]
  selectedOpening: OpeningLine | null
  onSelect: (opening: OpeningLine) => void
  customText: string
  onCustomTextChange: (text: string) => void
  onSend: (text: string) => void
}

function OpeningTab({
  openingLines,
  selectedOpening,
  onSelect,
  customText,
  onCustomTextChange,
  onSend,
}: OpeningTabProps) {
  const [showCustomInput, setShowCustomInput] = useState(false)
  
  const getTypeInfo = (type: OpeningLine['type']) => {
    switch (type) {
      case 'interest':
        return { icon: '🎯', label: '共同兴趣', color: 'blue' }
      case 'value':
        return { icon: '💎', label: '价值观共鸣', color: 'purple' }
      case 'photo':
        return { icon: '📸', label: '照片相关', color: 'pink' }
      case 'humor':
        return { icon: '😄', label: '轻松幽默', color: 'yellow' }
      case 'direct':
        return { icon: '💌', label: '真诚直接', color: 'red' }
      default:
        return { icon: '💬', label: '推荐', color: 'gray' }
    }
  }
  
  return (
    <div className="space-y-3">
      {/* 推荐开场白列表 */}
      {openingLines.map((opening, index) => {
        const typeInfo = getTypeInfo(opening.type)
        const isSelected = selectedOpening?.text === opening.text
        
        return (
          <button
            key={index}
            onClick={() => onSelect(opening)}
            className={cn(
              "w-full text-left p-4 rounded-2xl transition-all duration-200",
              "border-2",
              isSelected
                ? "border-primary-500 bg-primary-50"
                : "border-gray-100 hover:border-gray-200 bg-white"
            )}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">{typeInfo.icon}</span>
              
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm leading-relaxed",
                  isSelected ? "text-primary-700 font-medium" : "text-gray-700"
                )}>
                  {opening.text}
                </p>
                
                <div className="flex items-center gap-2 mt-2">
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    isSelected
                      ? "bg-primary-100 text-primary-600"
                      : "bg-gray-100 text-gray-500"
                  )}>
                    {typeInfo.label}
                  </span>
                  
                  {opening.reason && (
                    <span className="text-xs text-gray-400">
                      {opening.reason}
                    </span>
                  )}
                </div>
              </div>
              
              {isSelected && (
                <span className="flex-shrink-0 text-primary-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </div>
          </button>
        )
      })}
      
      {/* 自定义输入 */}
      <div className="pt-2">
        {showCustomInput ? (
          <div className="space-y-3">
            <textarea
              value={customText}
              onChange={(e) => onCustomTextChange(e.target.value)}
              placeholder="写一句真诚的开场白..."
              className={cn(
                "w-full px-4 py-3 rounded-xl border border-gray-200",
                "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                "resize-none text-sm",
                "placeholder:text-gray-400"
              )}
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCustomInput(false)}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                取消
              </button>
              <button
                onClick={() => onSend(customText)}
                disabled={!customText.trim()}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg",
                  "bg-primary-500 text-white",
                  "hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-colors"
                )}
              >
                发送
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowCustomInput(true)}
            className="w-full py-3 text-sm text-gray-500 hover:text-primary-600 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            自己写一句
          </button>
        )}
      </div>
      
      {/* 发送按钮 */}
      {selectedOpening && !showCustomInput && (
        <button
          onClick={() => onSend(selectedOpening.text)}
          className={cn(
            "w-full py-4 rounded-2xl font-medium",
            "bg-gradient-to-r from-primary-500 to-romance-500",
            "text-white shadow-lg shadow-primary-500/30",
            "hover:shadow-xl hover:shadow-primary-500/40",
            "transition-all duration-200",
            "active:scale-[0.98]"
          )}
        >
          发送这个开场白
        </button>
      )}
    </div>
  )
}

// ============================================
// 破冰问题 Tab
// ============================================

interface QuestionsTabProps {
  questions: string[]
  difficulty: 'easy' | 'medium' | 'deep'
  onDifficultyChange: (difficulty: 'easy' | 'medium' | 'deep') => void
  onSend: (text: string) => void
}

function QuestionsTab({
  questions,
  difficulty,
  onDifficultyChange,
  onSend,
}: QuestionsTabProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null)
  
  const difficultyConfig = {
    easy: { label: '轻松', emoji: '😊', color: 'green' },
    medium: { label: '适中', emoji: '🤔', color: 'yellow' },
    deep: { label: '深度', emoji: '💭', color: 'purple' },
  }
  
  return (
    <div className="space-y-4">
      {/* 难度选择 */}
      <div className="flex gap-2">
        {(Object.keys(difficultyConfig) as Array<keyof typeof difficultyConfig>).map(key => {
          const config = difficultyConfig[key]
          const isActive = difficulty === key
          
          return (
            <button
              key={key}
              onClick={() => onDifficultyChange(key)}
              className={cn(
                "flex-1 py-2 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-primary-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              <span className="mr-1">{config.emoji}</span>
              {config.label}
            </button>
          )
        })}
      </div>
      
      {/* 问题列表 */}
      <div className="space-y-2">
        {questions.map((question, index) => {
          const isSelected = selectedQuestion === question
          
          return (
            <button
              key={index}
              onClick={() => setSelectedQuestion(question)}
              className={cn(
                "w-full text-left p-3 rounded-xl transition-all duration-200",
                "border",
                isSelected
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-100 hover:border-gray-200 bg-white"
              )}
            >
              <p className={cn(
                "text-sm leading-relaxed",
                isSelected ? "text-primary-700 font-medium" : "text-gray-700"
              )}>
                {question}
              </p>
            </button>
          )
        })}
      </div>
      
      {/* 发送按钮 */}
      {selectedQuestion && (
        <button
          onClick={() => onSend(selectedQuestion)}
          className={cn(
            "w-full py-4 rounded-2xl font-medium",
            "bg-gradient-to-r from-primary-500 to-romance-500",
            "text-white shadow-lg shadow-primary-500/30",
            "hover:shadow-xl hover:shadow-primary-500/40",
            "transition-all duration-200",
            "active:scale-[0.98]"
          )}
        >
          发送这个问题
        </button>
      )}
    </div>
  )
}

// ============================================
// 迷你破冰按钮
// ============================================

interface MiniIceBreakerButtonProps {
  onClick: () => void
  hasNew?: boolean
}

export function MiniIceBreakerButton({
  onClick,
  hasNew = false,
}: MiniIceBreakerButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2",
        "bg-gradient-to-r from-primary-50 to-romance-50",
        "border border-primary-200 rounded-full",
        "text-primary-600 text-sm font-medium",
        "hover:from-primary-100 hover:to-romance-100",
        "transition-all duration-200",
        hasNew && "animate-pulse"
      )}
    >
      <span className="text-lg">💬</span>
      <span>开场白推荐</span>
      {hasNew && (
        <span className="w-2 h-2 bg-red-500 rounded-full" />
      )}
    </button>
  )
}

// ============================================
// 破冰提醒横幅
// ============================================

interface IceBreakerBannerProps {
  userName: string
  matchScore: number
  onOpen: () => void
  onDismiss: () => void
}

export function IceBreakerBanner({
  userName,
  matchScore,
  onOpen,
  onDismiss,
}: IceBreakerBannerProps) {
  return (
    <div className="bg-gradient-to-r from-primary-500 to-romance-500 rounded-2xl p-4 text-white shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-xl">💌</span>
          </div>
          <div>
            <p className="font-medium">准备好和 {userName} 聊天了吗？</p>
            <p className="text-sm text-white/80">
              你们有 {matchScore}% 的匹配度哦！
            </p>
          </div>
        </div>
        
        <button
          onClick={onDismiss}
          className="text-white/60 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="flex gap-2 mt-4">
        <button
          onClick={onOpen}
          className="flex-1 py-2 bg-white text-primary-600 rounded-xl font-medium hover:bg-white/90 transition-colors"
        >
          看看开场白推荐
        </button>
        <button
          onClick={onDismiss}
          className="px-4 py-2 text-white/80 hover:text-white transition-colors"
        >
          自己写
        </button>
      </div>
    </div>
  )
}

// ============================================
// 开场白成功提示
// ============================================

interface OpeningSentProps {
  message: string
  userName: string
  className?: string
}

export function OpeningSent({
  message,
  userName,
  className,
}: OpeningSentProps) {
  return (
    <div
      className={cn(
        "bg-green-50 border border-green-200 rounded-2xl p-4",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">✅</span>
        <div>
          <p className="font-medium text-green-800">
            开场白已发送！
          </p>
          <p className="text-sm text-green-600 mt-1">
            你对 {userName} 说：
          </p>
          <p className="text-sm text-green-700 mt-1 bg-white rounded-lg p-2 italic">
            "{message}"
          </p>
        </div>
      </div>
    </div>
  )
}

export default IceBreakers
