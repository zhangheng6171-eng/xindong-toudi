'use client'

import { useState } from 'react'
import { Heart, Eye, EyeOff, Send, Lock } from 'lucide-react'
import { Button } from '@/components/ui'

export default function CrushPage() {
  const [crushPhone, setCrushPhone] = useState('')
  const [message, setMessage] = useState('')
  const [hasCrush, setHasCrush] = useState(false)
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-romance-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-romance-500 text-white py-12 px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">💌</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">暗恋告白</h1>
          <p className="text-white/80">
            悄悄告诉TA，如果TA也暗恋你...
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Check Section */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-6 mb-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-romance-100 rounded-full flex items-center justify-center mx-auto mb-3">
              {hasCrush ? (
                <Heart className="w-8 h-8 text-primary-500 fill-current" />
              ) : (
                <Lock className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              {hasCrush ? '有人暗恋你！' : '查看是否有人暗恋你'}
            </h2>
          </div>

          {hasCrush ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-primary-50 to-romance-50 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-2xl">🤫</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">有 1 人暗恋你</p>
                    <p className="text-sm text-gray-500">想知道TA是谁吗？</p>
                  </div>
                </div>
                <Button variant="primary" className="w-full">
                  <Eye className="w-5 h-5 mr-2" />
                  揭晓身份
                </Button>
              </div>
              
              <p className="text-xs text-gray-400 text-center">
                只有在你也暗恋对方时，才会互相揭晓身份
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-500 text-center">
                目前还没有人暗恋你，或者TA还在犹豫中...
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowForm(true)}
              >
                我有暗恋的人
              </Button>
            </div>
          )}
        </div>

        {/* Confession Form */}
        {showForm && (
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">悄悄告白</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TA的手机号
              </label>
              <input
                type="tel"
                value={crushPhone}
                onChange={(e) => setCrushPhone(e.target.value)}
                placeholder="输入你暗恋对象的手机号"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-0 transition-colors"
              />
              <p className="text-xs text-gray-400 mt-1">
                完全保密，只有双向暗恋时才会揭晓
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                想对TA说的话（选填）
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="写下你的心里话..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-0 transition-colors resize-none"
              />
            </div>

            <Button variant="primary" size="lg" className="w-full">
              <Send className="w-5 h-5 mr-2" />
              发送暗恋告白
            </Button>

            <div className="mt-4 flex items-start gap-2 p-3 bg-primary-50 rounded-xl">
              <Lock className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-primary-700">
                <p className="font-medium mb-1">隐私保护</p>
                <ul className="space-y-1 text-primary-600">
                  <li>• 你的告白完全匿名</li>
                  <li>• 只有当对方也暗恋你时，才会互相揭晓身份</li>
                  <li>• 72小时内未匹配，告白自动消失</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* How it works */}
        <div className="bg-gradient-to-r from-primary-50 to-romance-50 rounded-3xl p-6">
          <h3 className="font-bold text-gray-800 mb-4">💡 暗恋告白原理</h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-3">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-sm">
                1
              </div>
              <p className="text-sm text-gray-700">你悄悄填写暗恋对象的手机号</p>
            </div>
            
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-3">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-sm">
                2
              </div>
              <p className="text-sm text-gray-700">系统通知TA"有人暗恋你"</p>
            </div>
            
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-3">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-sm">
                3
              </div>
              <p className="text-sm text-gray-700">如果TA也填写了你的手机号...</p>
            </div>
            
            <div className="flex items-center gap-3 bg-gradient-to-r from-primary-400 to-romance-400 rounded-xl p-3">
              <span className="text-xl">💕</span>
              <p className="text-sm text-white font-medium">双向暗恋匹配成功！</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/30 p-4 text-center">
            <div className="text-2xl font-bold text-primary-600">1,234</div>
            <div className="text-xs text-gray-500 mt-1">暗恋告白</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/30 p-4 text-center">
            <div className="text-2xl font-bold text-romance-600">456</div>
            <div className="text-xs text-gray-500 mt-1">双向匹配</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/30 p-4 text-center">
            <div className="text-2xl font-bold text-accent-500">89%</div>
            <div className="text-xs text-gray-500 mt-1">在一起</div>
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
            <Heart className="w-6 h-6 fill-current" />
            <span className="text-xs mt-1">暗恋</span>
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
