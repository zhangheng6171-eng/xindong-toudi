'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Eye, EyeOff, Mail, Lock, ArrowRight, ArrowLeft, Check, Loader2, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { GlassCard, GradientText } from '@/components/animated-background'

type Step = 'email' | 'verify' | 'reset' | 'success'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [countdown, setCountdown] = useState(0)
  
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  })

  // 发送验证码
  const handleSendCode = async () => {
    if (!formData.email.trim()) {
      setError('请输入邮箱地址')
      return
    }

    // 简单邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email.trim())) {
      setError('请输入有效的邮箱地址')
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email.trim() })
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        // 开发环境显示验证码
        if (data.devCode) {
          console.log('验证码:', data.devCode) // 实际应该发送到邮箱
          alert(`开发环境验证码: ${data.devCode}`)
        }
        setStep('verify')
        // 开始倒计时
        setCountdown(60)
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        setError(data.error || '发送失败，请重试')
      }
    } catch (e) {
      console.error('Send code error:', e)
      setError('网络错误，请检查网络连接')
    } finally {
      setIsLoading(false)
    }
  }

  // 验证验证码（前端验证，进入下一步）
  // 真正的验证码验证会在重置密码时由后端完成
  const handleVerifyCode = () => {
    if (!formData.code.trim()) {
      setError('请输入验证码')
      return
    }

    if (formData.code.length !== 6) {
      setError('验证码为6位数字')
      return
    }

    // 前端格式验证通过，进入设置新密码步骤
    // 验证码的实际验证会在提交新密码时由后端完成
    setError(null)
    setStep('reset')
  }

  // 密码强度验证
  const validatePassword = (password: string): string | null => {
    if (!password) {
      return '请输入新密码'
    }
    if (password.length < 8) {
      return '密码长度至少8位'
    }
    // 检查大小写字母和数字
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    if (!(hasUpperCase && hasLowerCase && hasNumber)) {
      return '密码必须包含大小写字母和数字'
    }
    return null
  }

  // 重置密码
  const handleResetPassword = async () => {
    // 验证密码强度
    const passwordError = validatePassword(formData.newPassword)
    if (passwordError) {
      setError(passwordError)
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email.trim(),
          code: formData.code.trim(),
          newPassword: formData.newPassword
        })
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        setStep('success')
      } else {
        setError(data.error || '重置密码失败，请重试')
      }
    } catch (e) {
      console.error('Reset password error:', e)
      setError('网络错误，请检查网络连接')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* 左侧装饰区域 */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600">
        {/* 动态背景 */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute top-20 left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.3, 1], 
              x: [0, 30, 0],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
            animate={{ 
              scale: [1.2, 1, 1.2], 
              y: [0, -30, 0],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        {/* 内容 */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full text-white p-12">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
          >
            <div className="w-28 h-28 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-white/20 border border-white/30">
              <ShieldCheck className="w-14 h-14" />
            </div>
          </motion.div>
          
          <motion.h1 
            className="text-5xl font-bold mb-4 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            找回密码
          </motion.h1>
          
          <motion.p 
            className="text-xl text-white/90 text-center max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            只需几个简单步骤，即可重新获得账号访问权限
          </motion.p>

          {/* 步骤提示 */}
          <motion.div 
            className="mt-12 space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {[
              { num: 1, text: '输入注册邮箱', active: step === 'email' },
              { num: 2, text: '输入验证码', active: step === 'verify' },
              { num: 3, text: '设置新密码', active: step === 'reset' || step === 'success' },
            ].map((item, i) => (
              <div 
                key={i} 
                className={`flex items-center gap-3 ${item.active ? 'text-white' : 'text-white/50'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  item.active ? 'bg-white/30' : 'bg-white/10'
                }`}>
                  {item.active ? <Check className="w-5 h-5" /> : item.num}
                </div>
                <span className="text-lg">{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* 右侧表单区域 */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-gradient-to-br from-rose-50/50 via-white to-pink-50/30 relative">
        {/* 背景装饰 */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="w-full max-w-md relative">
          {/* 移动端 Logo */}
          <motion.div 
            className="lg:hidden flex items-center justify-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-rose-500/30">
              <Heart className="w-6 h-6 text-white" fill="white" />
            </div>
            <span className="text-2xl font-bold">
              <GradientText>心动投递</GradientText>
            </span>
          </motion.div>

          <GlassCard className="p-8 sm:p-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {/* 步骤1：输入邮箱 */}
              {step === 'email' && (
                <>
                  <div className="text-center mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                      找回密码 🔐
                    </h2>
                    <p className="text-gray-500">输入您注册时使用的邮箱地址</p>
                  </div>

                  <div className="space-y-6">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
                      >
                        {error}
                      </motion.div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        邮箱地址
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="your@email.com"
                          className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all hover:bg-gray-50"
                        />
                      </div>
                    </div>

                    <motion.button
                      onClick={handleSendCode}
                      disabled={isLoading}
                      className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          发送中...
                        </>
                      ) : (
                        <>
                          发送验证码
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </>
              )}

              {/* 步骤2：输入验证码 */}
              {step === 'verify' && (
                <>
                  <div className="text-center mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                      输入验证码 📝
                    </h2>
                    <p className="text-gray-500">
                      已发送验证码到 <span className="text-rose-500 font-medium">{formData.email}</span>
                    </p>
                  </div>

                  <div className="space-y-6">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
                      >
                        {error}
                      </motion.div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        验证码
                      </label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                        placeholder="请输入6位验证码"
                        maxLength={6}
                        className="w-full px-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all hover:bg-gray-50 text-center text-2xl tracking-[0.5em] font-mono"
                      />
                    </div>

                    <div className="flex gap-3">
                      <motion.button
                        onClick={() => setStep('email')}
                        className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                        whileTap={{ scale: 0.98 }}
                      >
                        <ArrowLeft className="w-5 h-5" />
                        返回
                      </motion.button>
                      <motion.button
                        onClick={handleVerifyCode}
                        disabled={isLoading}
                        className="flex-1 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-bold shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            验证
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </motion.button>
                    </div>

                    {/* 重新发送 */}
                    {countdown > 0 ? (
                      <p className="text-center text-gray-500 text-sm">
                        {countdown} 秒后可重新发送验证码
                      </p>
                    ) : (
                      <button
                        onClick={handleSendCode}
                        className="w-full text-center text-rose-500 font-medium hover:text-rose-600 transition-colors"
                      >
                        没收到验证码？重新发送
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* 步骤3：设置新密码 */}
              {step === 'reset' && (
                <>
                  <div className="text-center mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                      设置新密码 🔑
                    </h2>
                    <p className="text-gray-500">请输入您的新密码</p>
                  </div>

                  <div className="space-y-6">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
                      >
                        {error}
                      </motion.div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        新密码
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.newPassword}
                          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                          placeholder="至少8位，含大小写字母和数字"
                          className="w-full pl-12 pr-12 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all hover:bg-gray-50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {/* 密码强度提示 */}
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center ${formData.newPassword.length >= 8 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                            {formData.newPassword.length >= 8 ? <Check className="w-3 h-3" /> : ''}
                          </span>
                          <span className={formData.newPassword.length >= 8 ? 'text-green-600' : 'text-gray-500'}>至少8个字符</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center ${/[A-Z]/.test(formData.newPassword) && /[a-z]/.test(formData.newPassword) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                            {/[A-Z]/.test(formData.newPassword) && /[a-z]/.test(formData.newPassword) ? <Check className="w-3 h-3" /> : ''}
                          </span>
                          <span className={/[A-Z]/.test(formData.newPassword) && /[a-z]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-500'}>包含大小写字母</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center ${/[0-9]/.test(formData.newPassword) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                            {/[0-9]/.test(formData.newPassword) ? <Check className="w-3 h-3" /> : ''}
                          </span>
                          <span className={/[0-9]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-500'}>包含数字</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        确认新密码
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          placeholder="再次输入新密码"
                          className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all hover:bg-gray-50"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <motion.button
                        onClick={() => setStep('verify')}
                        className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                        whileTap={{ scale: 0.98 }}
                      >
                        <ArrowLeft className="w-5 h-5" />
                        返回
                      </motion.button>
                      <motion.button
                        onClick={handleResetPassword}
                        disabled={isLoading}
                        className="flex-1 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-bold shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            重置中...
                          </>
                        ) : (
                          <>
                            确认重置
                            <ShieldCheck className="w-5 h-5" />
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </>
              )}

              {/* 步骤4：成功 */}
              {step === 'success' && (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <Check className="w-10 h-10 text-green-500" />
                  </motion.div>
                  
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    密码重置成功！🎉
                  </h2>
                  <p className="text-gray-500 mb-8">
                    您可以使用新密码登录了
                  </p>

                  <Link href="/login">
                    <motion.button
                      className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      立即登录
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </Link>
                </div>
              )}

              {/* 登录链接 */}
              {step !== 'success' && (
                <p className="text-center mt-8 text-gray-600">
                  想起密码了？
                  <Link href="/login" className="text-rose-500 font-semibold hover:text-rose-600 ml-1 transition-colors">
                    立即登录
                  </Link>
                </p>
              )}
            </motion.div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
