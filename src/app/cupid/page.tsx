'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Users, ChevronRight, Check, Sparkles, ArrowRight } from 'lucide-react'
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

export default function CupidPage() {
  const [step, setStep] = useState<'select' | 'input' | 'confirm'>('select')
  const [friendPhone, setFriendPhone] = useState('')
  const [targetPhone, setTargetPhone] = useState('')
  const [reason, setReason] = useState('')

  return (
    <AnimatedBackground variant="purple" showFloatingHearts>
      <div className="min-h-screen pb-24">
        {/* Header */}
        <FadeIn>
          <div className="relative overflow-hidden bg-gradient-to-r from-rose-500 via-pink-500 to-violet-500 text-white py-16 px-4">
            {/* 装饰 */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-300/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
            
            <div className="max-w-lg mx-auto text-center relative">
              <motion.div 
                className="relative inline-block"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-pink-500/30">
                  <span className="text-5xl">💘</span>
                </div>
                <Sparkles className="w-5 h-5 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
              </motion.div>
              
              <h1 className="text-4xl font-bold mb-3">
                爱神模式
              </h1>
              <p className="text-white/90 text-lg">
                成为他人的月老，撮合你身边的朋友
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Content */}
        <div className="max-w-lg mx-auto px-4 py-8">
          {/* How it works */}
          <FadeIn delay={0.1}>
            <GlassCard className="p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-5">
                <GradientText>如何当爱神？</GradientText>
              </h2>
              
              <div className="space-y-5">
                {[
                  { 
                    num: '1', 
                    title: '选择好友', 
                    desc: '输入你想撮合的朋友手机号',
                    color: 'from-rose-400 to-pink-400'
                  },
                  { 
                    num: '2', 
                    title: '推荐对象', 
                    desc: '告诉TA你觉得谁适合TA',
                    color: 'from-pink-400 to-violet-400'
                  },
                  { 
                    num: '3', 
                    title: '等待缘分', 
                    desc: '如果双方都有意向，系统会帮你们牵线',
                    color: 'from-violet-400 to-purple-400'
                  },
                ].map((step, i) => (
                  <motion.div 
                    key={i}
                    className="flex items-start gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0`}>
                      {step.num}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{step.title}</h3>
                      <p className="text-sm text-gray-500">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </FadeIn>

          {/* Form */}
          <FadeIn delay={0.2}>
            <GlassCard className="p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                <GradientText>开始撮合</GradientText>
              </h2>
              
              {/* Friend Phone */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  好友手机号（你想撮合的人）
                </label>
                <input
                  type="tel"
                  value={friendPhone}
                  onChange={(e) => setFriendPhone(e.target.value)}
                  placeholder="请输入手机号"
                  className="w-full px-5 py-4 rounded-2xl bg-white/60 border border-rose-100 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all outline-none"
                />
              </div>

              {/* Target Phone */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  推荐对象的手机号
                </label>
                <input
                  type="tel"
                  value={targetPhone}
                  onChange={(e) => setTargetPhone(e.target.value)}
                  placeholder="请输入手机号"
                  className="w-full px-5 py-4 rounded-2xl bg-white/60 border border-rose-100 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all outline-none"
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
                  className="w-full px-5 py-4 rounded-2xl bg-white/60 border border-rose-100 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all outline-none resize-none"
                />
              </div>

              {/* Submit */}
              <GradientButton className="w-full">
                <span className="flex items-center justify-center gap-2">
                  <Heart className="w-5 h-5" />
                  发送爱神助攻
                </span>
              </GradientButton>

              <p className="text-xs text-gray-400 text-center mt-4">
                爱神助攻是匿名的，对方不会知道是谁推荐的
              </p>
            </GlassCard>
          </FadeIn>

          {/* Recent Matches */}
          <FadeIn delay={0.3}>
            <h2 className="text-xl font-bold text-gray-800 mb-4">你的助攻记录</h2>
            
            <GlassCard className="overflow-hidden">
              <div className="p-8 text-center">
                <motion.div 
                  className="w-20 h-20 bg-gradient-to-br from-rose-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-4"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                >
                  <Users className="w-10 h-10 text-rose-400" />
                </motion.div>
                <p className="text-gray-500 font-medium">还没有助攻记录</p>
                <p className="text-sm text-gray-400 mt-1">撮合成功后会在这里显示</p>
              </div>
            </GlassCard>
          </FadeIn>

          {/* Success Stories */}
          <FadeIn delay={0.4}>
            <GlassCard className="p-6 mt-6 bg-gradient-to-r from-rose-50/80 to-violet-50/80">
              <h3 className="font-bold text-xl text-gray-800 mb-5">
                🎉 <GradientText>成功案例</GradientText>
              </h3>
              
              <div className="space-y-4">
                <motion.div 
                  className="bg-white/80 backdrop-blur rounded-2xl p-5 border border-white/50"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex -space-x-2">
                      <div className="w-9 h-9 bg-gradient-to-br from-rose-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">M</div>
                      <div className="w-9 h-9 bg-gradient-to-br from-violet-400 to-purple-400 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">L</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag color="rose">匹配成功</Tag>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    "谢谢我的爱神朋友，我们在一起三个月了！"
                  </p>
                </motion.div>
                
                <motion.div 
                  className="bg-white/80 backdrop-blur rounded-2xl p-5 border border-white/50"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex -space-x-2">
                      <div className="w-9 h-9 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">J</div>
                      <div className="w-9 h-9 bg-gradient-to-br from-purple-400 to-violet-400 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">K</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag color="purple">即将见面</Tag>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    "爱神推荐的人真的很合适，聊了两个月终于要见面了！"
                  </p>
                </motion.div>
              </div>
            </GlassCard>
          </FadeIn>

          {/* Stats */}
          <FadeIn delay={0.5}>
            <div className="grid grid-cols-3 gap-4 mt-6">
              {[
                { value: 2345, label: '爱神助攻', color: 'from-rose-500 to-pink-500' },
                { value: 678, label: '成功撮合', color: 'from-pink-500 to-violet-500' },
                { value: 95, suffix: '%', label: '满意度', color: 'from-violet-500 to-purple-500' },
              ].map((stat, i) => (
                <GlassCard key={i} className="p-4 text-center">
                  <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                </GlassCard>
              ))}
            </div>
          </FadeIn>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 px-4 py-3 z-50">
          <div className="max-w-md mx-auto flex justify-around">
            <button className="flex flex-col items-center text-gray-400 hover:text-rose-500 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs mt-1">首页</span>
            </button>
            <button className="flex flex-col items-center text-gray-400 hover:text-rose-500 transition-colors">
              <Heart className="w-6 h-6" />
              <span className="text-xs mt-1">匹配</span>
            </button>
            <button className="flex flex-col items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-rose-500/30">
                <Users className="w-5 h-5 text-white" fill="currentColor" />
              </div>
              <span className="text-xs mt-1 font-semibold text-rose-600">爱神</span>
            </button>
            <button className="flex flex-col items-center text-gray-400 hover:text-rose-500 transition-colors">
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
