'use client'

import { useState } from 'react'
import { Heart, Users, ChevronRight, Check, X } from 'lucide-react'
import { Button } from '@/components/ui'

export default function CupidPage() {
  const [step, setStep] = useState<'select' | 'input' | 'confirm'>('select')
  const [friendPhone, setFriendPhone] = useState('')
  const [targetPhone, setTargetPhone] = useState('')
  const [reason, setReason] = useState('')

  return (
    <div className="min-h-screen bg-gradient-to-b from-romance-50 via-white to-primary-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-romance-500 to-primary-500 text-white py-12 px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">💘</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">爱神模式</h1>
          <p className="text-white/80">
            成为他人的月老，撮合你身边的朋友
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* How it works */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">如何当爱神？</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-romance-400 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-medium text-gray-800">选择好友</h3>
                <p className="text-sm text-gray-500">输入你想撮合的朋友手机号</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-romance-400 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-medium text-gray-800">推荐对象</h3>
                <p className="text-sm text-gray-500">告诉TA你觉得谁适合TA</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-romance-400 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-medium text-gray-800">等待缘分</h3>
                <p className="text-sm text-gray-500">如果双方都有意向，系统会帮你们牵线</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">开始撮合</h2>
          
          {/* Friend Phone */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              好友手机号（你想撮合的人）
            </label>
            <input
              type="tel"
              value={friendPhone}
              onChange={(e) => setFriendPhone(e.target.value)}
              placeholder="请输入手机号"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-0 transition-colors"
            />
          </div>

          {/* Target Phone */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              推荐对象的手机号
            </label>
            <input
              type="tel"
              value={targetPhone}
              onChange={(e) => setTargetPhone(e.target.value)}
              placeholder="请输入手机号"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-0 transition-colors"
            />
          </div>

          {/* Reason */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              为什么觉得他们合适？（选填）
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="说说你的想法..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-0 transition-colors resize-none"
            />
          </div>

          {/* Submit */}
          <Button variant="primary" size="lg" className="w-full">
            <Heart className="w-5 h-5 mr-2" />
            发送爱神助攻
          </Button>

          <p className="text-xs text-gray-400 text-center mt-4">
            爱神助攻是匿名的，对方不会知道是谁推荐的
          </p>
        </div>

        {/* Recent Matches */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">你的助攻记录</h2>
          
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden">
            <div className="p-6 text-center text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p>还没有助攻记录</p>
              <p className="text-sm">撮合成功后会在这里显示</p>
            </div>
          </div>
        </div>

        {/* Success Stories */}
        <div className="mt-8 bg-gradient-to-r from-primary-50 to-romance-50 rounded-3xl p-6">
          <h3 className="font-bold text-gray-800 mb-4">🎉 成功案例</h3>
          
          <div className="space-y-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 bg-primary-400 rounded-full flex items-center justify-center text-white text-sm font-bold">M</div>
                  <div className="w-8 h-8 bg-romance-400 rounded-full flex items-center justify-center text-white text-sm font-bold">L</div>
                </div>
                <span className="text-sm text-gray-500">匹配成功</span>
              </div>
              <p className="text-gray-700 text-sm">
                "谢谢我的爱神朋友，我们在一起三个月了！"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3">
        <div className="max-w-md mx-auto flex justify-around">
          <button className="flex flex-col items-center text-gray-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-1">首页</span>
          </button>
          <button className="flex flex-col items-center text-gray-400">
            <Heart className="w-6 h-6" />
            <span className="text-xs mt-1">匹配</span>
          </button>
          <button className="flex flex-col items-center text-primary-500">
            <Users className="w-6 h-6 fill-current" />
            <span className="text-xs mt-1">爱神</span>
          </button>
          <button className="flex flex-col items-center text-gray-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs mt-1">我的</span>
          </button>
        </div>
      </div>
    </div>
  )
}
