'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronLeft, Heart, MessageCircle, User } from 'lucide-react'
import { AnimatedBackground, GlassCard, FadeIn } from '@/components/animated-background'
import FeedbackForm from '@/components/feedback/FeedbackForm'

export default function MatchFeedbackPage() {
  const router = useRouter()
  const params = useParams()
  const matchId = params.id as string
  
  const [matchInfo, setMatchInfo] = useState<{
    id: string
    partnerName: string
    partnerAvatar?: string
    matchedAt?: string
  } | null>(null)

  useEffect(() => {
    // 获取指定匹配的详细信息
    try {
      const currentUser = localStorage.getItem('xindong_current_user')
      if (!currentUser) {
        router.push('/login')
        return
      }

      // 从 matches 获取匹配信息
      const matches = JSON.parse(localStorage.getItem('xindong_matches') || '[]')
      const targetMatch = matches.find((m: any) => m.id === matchId)
      
      if (targetMatch) {
        setMatchInfo({
          id: targetMatch.id,
          partnerName: targetMatch.partnerName || targetMatch.matchedUser?.name || '心动对象',
          partnerAvatar: targetMatch.partnerAvatar || targetMatch.matchedUser?.avatar,
          matchedAt: targetMatch.createdAt || targetMatch.matchedAt
        })
      } else {
        // 如果找不到匹配，使用默认信息
        setMatchInfo({
          id: matchId,
          partnerName: '心动对象',
          matchedAt: new Date().toISOString()
        })
      }
    } catch (e) {
      console.error('Failed to load match info:', e)
      setMatchInfo({
        id: matchId,
        partnerName: '心动对象',
        matchedAt: new Date().toISOString()
      })
    }
  }, [matchId, router])

  const handleSubmit = async (data: any) => {
    console.log('Submitting feedback for match:', matchId, data)
    // 保存到 localStorage
    const existingFeedback = JSON.parse(localStorage.getItem('feedback_history') || '[]')
    
    // 检查是否已经对此匹配提交过反馈
    const existingIndex = existingFeedback.findIndex((f: any) => f.matchId === matchId)
    
    const feedbackEntry = {
      ...data,
      submittedAt: new Date().toISOString()
    }
    
    if (existingIndex >= 0) {
      existingFeedback[existingIndex] = feedbackEntry
    } else {
      existingFeedback.push(feedbackEntry)
    }
    
    localStorage.setItem('feedback_history', JSON.stringify(existingFeedback))
  }

  const handleSuccess = () => {
    router.push('/match/history')
  }

  return (
    <AnimatedBackground variant="romance" showFloatingHearts>
      <div className="min-h-screen py-4 sm:py-6 px-3 sm:px-4">
        <div className="max-w-lg mx-auto">
          {/* 顶部导航 */}
          <FadeIn className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-rose-500 transition-all bg-white/50 backdrop-blur-sm rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
              返回
            </button>
            
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-300/50">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-600">约会反馈</span>
            </div>
            
            <div className="w-16" />
          </FadeIn>

          {/* 标题 */}
          <FadeIn delay={0.1} className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              分享你的感受 💕
            </h1>
            <p className="text-gray-500">
              每一次反馈都是珍贵的成长
            </p>
          </FadeIn>

          {/* 反馈表单 */}
          <FeedbackForm
            matchInfo={matchInfo || undefined}
            onSubmit={handleSubmit}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </AnimatedBackground>
  )
}
