'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Eye, EyeOff, Mail, Lock, User, Calendar, ArrowRight, Check, Loader2, Sparkles, Phone } from 'lucide-react'
import Link from 'next/link'
import { AnimatedBackground, GlassCard, GradientButton, GradientText, FadeIn, StepIndicator, Tag } from '@/components/animated-background'

// 步骤组件
function StepContent({ step }: { step: number }) {
  return (
    <AnimatePresence mode="wait">
      {step === 1 && (
        <motion.div
          key="step1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2">创建账号</h2>
          <p className="text-gray-500 mb-6">开始你的心动之旅</p>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">昵称</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="你的昵称"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all hover:bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all hover:bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">密码</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="至少8位字符"
                  className="w-full pl-12 pr-12 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all hover:bg-gray-50"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div
          key="step2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2">完善资料</h2>
          <p className="text-gray-500 mb-6">让我们更好地了解你</p>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">性别</label>
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  type="button"
                  className="py-4 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 bg-gray-50 border-2 border-gray-200 hover:border-rose-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-2xl">👨</span>
                  男生
                </motion.button>
                <motion.button
                  type="button"
                  className="py-4 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 bg-gray-50 border-2 border-gray-200 hover:border-rose-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-2xl">👩</span>
                  女生
                </motion.button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">年龄</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  placeholder="你的年龄"
                  min="18"
                  max="100"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all hover:bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">所在城市</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="例如：北京"
                  className="w-full px-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all hover:bg-gray-50"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div
          key="step3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2">最后一步</h2>
          <p className="text-gray-500 mb-6">完成注册开始匹配</p>

          <div className="space-y-5">
            <label className="flex items-start cursor-pointer p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                className="mt-1 w-5 h-5 text-rose-500 border-gray-300 rounded focus:ring-rose-300"
              />
              <span className="ml-3 text-sm text-gray-600">
                我已阅读并同意
                <a href="#" className="text-rose-500 hover:underline font-medium">用户协议</a>
                和
                <a href="#" className="text-rose-500 hover:underline font-medium">隐私政策</a>
              </span>
            </label>

            <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-purple-50 p-5 rounded-2xl border border-rose-100">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-500" />
                接下来你会体验到：
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center">
                  <div className="w-5 h-5 bg-rose-100 rounded-full flex items-center justify-center mr-2">
                    <Check className="w-3 h-3 text-rose-500" />
                  </div>
                  完成66道灵魂问卷，找到真实的自己
                </li>
                <li className="flex items-center">
                  <div className="w-5 h-5 bg-rose-100 rounded-full flex items-center justify-center mr-2">
                    <Check className="w-3 h-3 text-rose-500" />
                  </div>
                  生成你的专属人格画像
                </li>
                <li className="flex items-center">
                  <div className="w-5 h-5 bg-rose-100 rounded-full flex items-center justify-center mr-2">
                    <Check className="w-3 h-3 text-rose-500" />
                  </div>
                  每周获得精准匹配推荐
                </li>
                <li className="flex items-center">
                  <div className="w-5 h-5 bg-rose-100 rounded-full flex items-center justify-center mr-2">
                    <Check className="w-3 h-3 text-rose-500" />
                  </div>
                  开启心动脱单之旅
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    window.location.href = '/questionnaire'
  }

  return (
    <AnimatedBackground variant="dream">
      <div className="min-h-screen flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <motion.div 
            className="flex items-center justify-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center mr-3 shadow-xl shadow-rose-500/30">
                <Heart className="w-7 h-7 text-white" fill="white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <span className="text-2xl font-bold">
              <GradientText>心动投递</GradientText>
            </span>
          </motion.div>

          {/* 步骤指示器 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <StepIndicator steps={3} currentStep={step} />
          </motion.div>

          {/* 表单卡片 */}
          <GlassCard className="p-8">
            <StepContent step={step} />

            {/* 按钮 */}
            <div className="mt-8">
              {step < 3 ? (
                <GradientButton onClick={handleNext} className="w-full flex items-center justify-center gap-2">
                  下一步
                  <ArrowRight className="w-5 h-5" />
                </GradientButton>
              ) : (
                <motion.button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-rose-500/30 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      注册中...
                    </>
                  ) : (
                    <>
                      开始心动之旅
                      <Sparkles className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </GlassCard>

          {/* 登录链接 */}
          <p className="text-center mt-8 text-gray-600">
            已有账号？
            <Link href="/login" className="text-rose-500 font-semibold hover:text-rose-600 ml-1 transition-colors">
              立即登录
            </Link>
          </p>
        </div>
      </div>
    </AnimatedBackground>
  )
}
