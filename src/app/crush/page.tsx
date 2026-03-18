'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Eye, Send, Lock, Sparkles } from 'lucide-react'
import { 
  AnimatedBackground, GlassCard, GradientButton, GradientText, 
  FadeIn, AnimatedCounter, Tag 
} from '@/components/animated-background'

// 动画变体
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

export default function CrushPage() {
  const [crushPhone, setCrushPhone] = useState('')
  const [message, setMessage] = useState('')
  const [hasCrush, setHasCrush] = useState(false)
  const [showForm, setShowForm] = useState(false)

  return (
    <AnimatedBackground variant="romance" showFloatingHearts>
      <div className="min-h-screen pb-24">
        {/* Header */}
        <FadeIn>
          <div className="relative overflow-hidden bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 text-white py-16 px-4">
            {/* 装饰 */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-300/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
            
            <div className="max-w-lg mx-auto text-center relative">
              <motion.div 
                className="relative inline-block"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-purple-500/30">
                  <span className="text-5xl">💌</span>
                </div>
                <Sparkles className="w-5 h-5 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
              </motion.div>
              
              <h1 className="text-4xl font-bold mb-3">
                暗恋告白
              </h1>
              <p className="text-white/90 text-lg">
                悄悄告诉TA，如果TA也暗恋你...
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Content */}
        <div className="max-w-lg mx-auto px-4 py-8">
          {/* Check Section */}
          <FadeIn delay={0.1}>
            <GlassCard className="p-6 mb-6">
              <div className="text-center mb-6">
                <motion.div 
                  className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{
                    background: hasCrush 
                      ? 'linear-gradient(135deg, #ec4899, #f43f5e)' 
                      : 'linear-gradient(135deg, #e2e8f0, #f1f5f9)'
                  }}
                  animate={hasCrush ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  {hasCrush ? (
                    <Heart className="w-10 h-10 text-white" fill="currentColor" />
                  ) : (
                    <Lock className="w-10 h-10 text-gray-400" />
                  )}
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {hasCrush ? (
                    <GradientText>有人暗恋你！</GradientText>
                  ) : (
                    '查看是否有人暗恋你'
                  )}
                </h2>
              </div>

              <AnimatePresence mode="wait">
                {hasCrush ? (
                  <motion.div
                    key="has-crush"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    <div className="bg-gradient-to-r from-violet-50 to-pink-50 rounded-2xl p-5 border border-violet-100">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md">
                          <span className="text-3xl">🤫</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">有 1 人暗恋你</p>
                          <p className="text-sm text-gray-500">想知道TA是谁吗？</p>
                        </div>
                      </div>
                      <GradientButton className="w-full">
                        <span className="flex items-center justify-center gap-2">
                          <Eye className="w-5 h-5" />
                          揭晓身份
                        </span>
                      </GradientButton>
                    </div>
                    
                    <p className="text-xs text-gray-400 text-center">
                      只有在你也暗恋对方时，才会互相揭晓身份
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="no-crush"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    <p className="text-gray-500 text-center">
                      目前还没有人暗恋你，或者TA还在犹豫中...
                    </p>
                    <button 
                      className="w-full py-4 px-6 bg-gradient-to-r from-violet-50 to-pink-50 text-violet-600 font-semibold rounded-2xl border-2 border-violet-200 hover:border-violet-300 hover:bg-violet-100 transition-all"
                      onClick={() => setShowForm(true)}
                    >
                      我有暗恋的人
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          </FadeIn>

          {/* Confession Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: 30, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -30, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <GlassCard className="p-6 mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    <GradientText>悄悄告白</GradientText>
                  </h2>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      TA的手机号
                    </label>
                    <input
                      type="tel"
                      value={crushPhone}
                      onChange={(e) => setCrushPhone(e.target.value)}
                      placeholder="输入你暗恋对象的手机号"
                      className="w-full px-5 py-4 rounded-2xl bg-white/60 border border-violet-100 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all outline-none"
                    />
                    <p className="text-xs text-gray-400 mt-2">
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
                      className="w-full px-5 py-4 rounded-2xl bg-white/60 border border-violet-100 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all outline-none resize-none"
                    />
                  </div>

                  <GradientButton className="w-full">
                    <span className="flex items-center justify-center gap-2">
                      <Send className="w-5 h-5" />
                      发送暗恋告白
                    </span>
                  </GradientButton>

                  <div className="mt-5 flex items-start gap-3 p-4 bg-gradient-to-r from-violet-50 to-pink-50 rounded-2xl border border-violet-100">
                    <Lock className="w-5 h-5 text-violet-500 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-violet-700">
                      <p className="font-semibold mb-1">隐私保护</p>
                      <ul className="space-y-1 text-violet-600">
                        <li>• 你的告白完全匿名</li>
                        <li>• 只有当对方也暗恋你时，才会互相揭晓身份</li>
                        <li>• 72小时内未匹配，告白自动消失</li>
                      </ul>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* How it works */}
          <FadeIn delay={0.2}>
            <GlassCard className="p-6 mb-6">
              <h3 className="font-bold text-xl text-gray-800 mb-5">
                💡 <GradientText>暗恋告白原理</GradientText>
              </h3>
              
              <div className="space-y-4">
                {[
                  { num: '1', text: '你悄悄填写暗恋对象的手机号', color: 'from-violet-400 to-purple-400' },
                  { num: '2', text: '系统通知TA"有人暗恋你"', color: 'from-purple-400 to-pink-400' },
                  { num: '3', text: '如果TA也填写了你的手机号...', color: 'from-pink-400 to-rose-400' },
                ].map((step, i) => (
                  <motion.div 
                    key={i}
                    className="flex items-center gap-4 bg-gradient-to-r from-violet-50/50 to-pink-50/50 rounded-2xl p-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className={`w-10 h-10 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center text-white font-bold shadow-lg`}>
                      {step.num}
                    </div>
                    <p className="text-gray-700">{step.text}</p>
                  </motion.div>
                ))}
                
                <motion.div 
                  className="flex items-center gap-4 bg-gradient-to-r from-violet-500 to-pink-500 rounded-2xl p-4 shadow-lg shadow-violet-500/20"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="text-2xl">💕</span>
                  <p className="text-white font-semibold">双向暗恋匹配成功！</p>
                </motion.div>
              </div>
            </GlassCard>
          </FadeIn>

          {/* Stats */}
          <FadeIn delay={0.3}>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: 1234, label: '暗恋告白', color: 'from-violet-500 to-purple-500' },
                { value: 456, label: '双向匹配', color: 'from-pink-500 to-rose-500' },
                { value: 89, suffix: '%', label: '在一起', color: 'from-rose-500 to-orange-500' },
              ].map((stat, i) => (
                <GlassCard key={i} className="p-5 text-center">
                  <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                </GlassCard>
              ))}
            </div>
          </FadeIn>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 px-4 py-3 z-50">
          <div className="max-w-md mx-auto flex justify-around">
            <button className="flex flex-col items-center text-gray-400 hover:text-violet-500 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs mt-1">首页</span>
            </button>
            <button className="flex flex-col items-center text-gray-400 hover:text-violet-500 transition-colors">
              <Heart className="w-6 h-6" />
              <span className="text-xs mt-1">匹配</span>
            </button>
            <button className="flex flex-col items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Heart className="w-5 h-5 text-white" fill="currentColor" />
              </div>
              <span className="text-xs mt-1 font-semibold text-violet-600">暗恋</span>
            </button>
            <button className="flex flex-col items-center text-gray-400 hover:text-violet-500 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs mt-1">我的</span>
            </button>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  )
}
