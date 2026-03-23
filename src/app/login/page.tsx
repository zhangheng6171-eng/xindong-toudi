'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Heart, Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles, Check, Loader2, Phone } from 'lucide-react'
import Link from 'next/link'
import { GlassCard, GradientText } from '@/components/animated-background'

// 用户数据类型
interface UserData {
  id: string
  email: string
  nickname: string
  password: string
  gender: 'male' | 'female' | null
  age: number
  city: string
  createdAt: string
}

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loginMethod, setLoginMethod] = useState<'email' | 'sms'>('email')
  const [countdown, setCountdown] = useState(0)
  
  // 邮箱登录表单
  const [emailForm, setEmailForm] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  
  // 手机号登录表单
  const [phoneForm, setPhoneForm] = useState({
    phone: '',
    code: ''
  })
  
  // 验证码倒计时
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (loginMethod === 'email') {
      // 邮箱登录
      if (!emailForm.email.trim() || !emailForm.password) {
        setError('请输入邮箱和密码')
        return
      }
    } else {
      // 手机号登录 - 这里不阻止提交，让验证码输入
      if (!phoneForm.phone.trim() || !phoneForm.code) {
        setError('请输入手机号和验证码')
        return
      }
    }

    setIsLoading(true)
    
    try {
      let data
      
      if (loginMethod === 'email') {
        // 调用邮箱登录 API
        const response = await fetch('/api/auth/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'login',
            email: emailForm.email.trim(),
            password: emailForm.password
          })
        })
        console.log('[Login] Response status:', response.status)
        data = await response.json()
      } else {
        // 调用手机号验证码登录 API
        const response = await fetch('/api/auth/sms/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: phoneForm.phone.trim(),
            code: phoneForm.code
          })
        })
        console.log('[SMS Login] Response status:', response.status)
        data = await response.json()
      }
      
      console.log('[Login] Response data:', data)
      
      if (response.ok && data.success || (loginMethod === 'sms' && data.success)) {
        // 登录成功，保存当前用户到 localStorage
        console.log('[Login] Success, saving user to localStorage')
        
        const userData = loginMethod === 'email' ? data.user : data.user
        const token = loginMethod === 'email' ? data.token : data.token
        
        if (userData) {
          localStorage.setItem('xindong_current_user', JSON.stringify(userData))
        }
        
        // 保存JWT Token（用于API认证）
        if (token) {
          localStorage.setItem('xindong_auth_token', token)
        }
        
        // 初始化用户 profile 数据
        const userId = userData.id
        const userProfile = {
          nickname: userData.nickname || '',
          age: userData.age || 25,
          gender: userData.gender || 'male',
          city: userData.city || '',
          occupation: '',
          education: '',
          height: 175,
          bio: '',
          interests: [],
          lookingFor: {
            minAge: 18,
            maxAge: 35,
            cities: userData.city ? [userData.city] : [],
            relationship: 'serious'
          }
        }
        
        // 合并现有 profile
        const existingProfileJson = localStorage.getItem(`xindong_profile_${userId}`)
        if (existingProfileJson) {
          try {
            const existingProfile = JSON.parse(existingProfileJson)
            userProfile.bio = existingProfile.bio || ''
            userProfile.interests = existingProfile.interests || []
            userProfile.occupation = existingProfile.occupation || ''
            userProfile.education = existingProfile.education || ''
            userProfile.height = existingProfile.height || 175
            userProfile.lookingFor = existingProfile.lookingFor || userProfile.lookingFor
          } catch (e) {
            console.error('Failed to parse existing profile:', e)
          }
        }
        
        localStorage.setItem(`xindong_profile_${userId}`, JSON.stringify(userProfile))
        
        // 跳转到仪表盘
        window.location.href = '/dashboard'
      } else {
        setIsLoading(false)
        console.error('[Login] Failed:', data.error)
        setError(data.error || '登录失败，请重试')
      }
    } catch (e) {
      console.error('[Login] Error:', e)
      setIsLoading(false)
      setError('网络错误，请检查网络连接')
    }
  }

  // 发送验证码
  const handleSendCode = async () => {
    if (!phoneForm.phone.trim()) {
      setError('请输入手机号')
      return
    }
    
    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(phoneForm.phone.trim())) {
      setError('请输入正确的手机号')
      return
    }
    
    setError(null)
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneForm.phone.trim() })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setCountdown(60)
        console.log('[SMS] 验证码已发送:', data.debugCode)
      } else {
        setError(data.error || '发送失败，请重试')
      }
    } catch (e) {
      console.error('[SMS] Error:', e)
      setError('网络错误，请检查网络连接')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = () => {
    // 忘记密码功能 - 跳转到忘记密码页面
    router.push('/forgot-password')
  }

  const handleGoogleLogin = () => {
    // Google 登录功能 - 提示用户
    alert('Google 登录功能即将上线，敬请期待！\n\n目前可使用手机号登录。')
  }

  // 微信登录
  const handleWechatLogin = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // 1. 获取微信授权URL
      const response = await fetch('/api/auth/wechat/login', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const data = await response.json()
      
      if (!data.success) {
        setError(data.error || '微信登录初始化失败')
        setIsLoading(false)
        return
      }

      // 2. 跳转到微信授权页面
      // 保存state到sessionStorage用于回调验证
      sessionStorage.setItem('wechat_state', data.state)
      
      // 跳转到微信授权页
      window.location.href = data.authUrl
    } catch (e) {
      console.error('[Wechat Login] Error:', e)
      setError('网络错误，请重试')
      setIsLoading(false)
    }
  }

  // 处理微信登录回调（页面加载时检查URL）
  useEffect(() => {
    const handleWechatCallback = async () => {
      const url = new URL(window.location.href)
      
      // 检查是否是微信登录回调
      if (url.searchParams.get('wechat_login') === 'success') {
        setIsLoading(true)
        
        try {
          // 从URL获取token和用户信息
          const hash = url.hash
          const params = new URLSearchParams(hash.substring(1)) // 去掉#号
          
          const token = params.get('wechat_token')
          const userStr = params.get('user')
          
          if (token && userStr) {
            const user = JSON.parse(decodeURIComponent(userStr))
            
            // 保存到localStorage
            localStorage.setItem('xindong_auth_token', token)
            localStorage.setItem('xindong_current_user', JSON.stringify(user))
            
            // 初始化用户 profile 数据
            const userProfile = {
              nickname: user.nickname || '',
              age: user.age || 25,
              gender: user.gender || 'male',
              city: user.city || '',
              occupation: '',
              education: '',
              height: 175,
              bio: '',
              interests: [],
              lookingFor: {
                minAge: 18,
                maxAge: 35,
                cities: user.city ? [user.city] : [],
                relationship: 'serious'
              }
            }
            
            localStorage.setItem(`xindong_profile_${user.id}`, JSON.stringify(userProfile))
            
            // 清除URL参数
            window.history.replaceState({}, '', '/dashboard')
            
            // 跳转到仪表盘
            window.location.href = '/dashboard'
            return
          }
        } catch (e) {
          console.error('[Wechat Callback] Parse error:', e)
        }
        
        setError('微信登录失败，请重试')
        setIsLoading(false)
      } else if (url.searchParams.get('error')) {
        // 处理错误情况
        const errorType = url.searchParams.get('error')
        let errorMsg = '微信登录失败'
        
        switch (errorType) {
          case 'wechat_denied':
            errorMsg = '您取消了微信授权'
            break
          case 'wechat_no_code':
            errorMsg = '授权码获取失败'
            break
          case 'wechat_state_expired':
            errorMsg = '授权已过期，请重试'
            break
          case 'wechat_token_failed':
            errorMsg = '微信授权失败'
            break
          case 'wechat_userinfo_failed':
            errorMsg = '获取用户信息失败'
            break
          default:
            errorMsg = '微信登录失败'
        }
        
        setError(errorMsg)
        // 清除URL参数
        window.history.replaceState({}, '', '/login')
      }
    }

    handleWechatCallback()
  }, [])

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
          <motion.div 
            className="absolute top-1/2 left-1/3 w-64 h-64 bg-white/5 rounded-full blur-2xl"
            animate={{ 
              x: [0, 50, 0],
              y: [0, -20, 0]
            }}
            transition={{ duration: 12, repeat: Infinity }}
          />
        </div>

        {/* 装饰性文字 */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 right-20 text-white/5 text-[200px] font-bold select-none"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 0.3, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            AI
          </motion.div>
          <motion.div
            className="absolute bottom-20 left-20 text-white/5 text-[150px] font-bold select-none"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 0.3, x: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            Love
          </motion.div>
        </div>

        {/* 内容 */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full text-white p-12">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
          >
            <div className="w-28 h-28 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-white/20 border border-white/30">
              <Heart className="w-14 h-14" fill="white" />
            </div>
          </motion.div>
          
          <motion.h1 
            className="text-5xl font-bold mb-4 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            心动投递
          </motion.h1>
          
          <motion.p 
            className="text-xl text-white/90 text-center max-w-md mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            用科学的方式，找到那个懂你的人
          </motion.p>

          {/* 统计数据 */}
          <motion.div 
            className="flex space-x-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {[
              { value: '10万+', label: '成功匹配' },
              { value: '92%', label: '满意度' },
              { value: '66', label: '灵魂问题' },
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                className="text-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6 + i * 0.1 }}
              >
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-white/70 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* 特性列表 */}
          <motion.div
            className="mt-16 space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {[
              'AI智能匹配算法',
              '每周精准推荐',
              '隐私安全保障'
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-white/80">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* 右侧登录表单 */}
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
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  欢迎回来 ✨
                </h2>
                <p className="text-gray-500">登录账号，继续寻找你的缘分</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 错误提示 */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {/* 登录方式切换 */}
                <div className="flex bg-gray-100 rounded-2xl p-1">
                  <button
                    type="button"
                    onClick={() => { setLoginMethod('email'); setError(null); }}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                      loginMethod === 'email' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    邮箱登录
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLoginMethod('sms'); setError(null); }}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                      loginMethod === 'sms' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    手机号登录
                  </button>
                </div>

                {/* 邮箱登录表单 */}
                {loginMethod === 'email' && (
                  <>
                    {/* 邮箱 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        邮箱地址
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={emailForm.email}
                          onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                          placeholder="your@email.com"
                          className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all hover:bg-gray-50"
                          required
                        />
                      </div>
                    </div>

                    {/* 密码 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        密码
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={emailForm.password}
                          onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                          placeholder="请输入密码"
                          className="w-full pl-12 pr-12 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all hover:bg-gray-50"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* 记住我 & 忘记密码 */}
                    <div className="flex items-center justify-between">
                      <label className="flex items-center cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={emailForm.rememberMe}
                          onChange={(e) => setEmailForm({ ...emailForm, rememberMe: e.target.checked })}
                          className="w-4 h-4 text-rose-500 border-gray-300 rounded focus:ring-rose-300"
                        />
                        <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-800 transition-colors">记住我</span>
                      </label>
                      <button 
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-sm text-rose-500 hover:text-rose-600 font-medium transition-colors"
                      >
                        忘记密码？
                      </button>
                    </div>
                  </>
                )}

                {/* 手机号登录表单 */}
                {loginMethod === 'sms' && (
                  <>
                    {/* 手机号 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        手机号
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={phoneForm.phone}
                          onChange={(e) => setPhoneForm({ ...phoneForm, phone: e.target.value })}
                          placeholder="请输入手机号"
                          className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all hover:bg-gray-50"
                          required
                        />
                      </div>
                    </div>

                    {/* 验证码 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        验证码
                      </label>
                      <div className="flex gap-3">
                        <div className="relative flex-1">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={phoneForm.code}
                            onChange={(e) => setPhoneForm({ ...phoneForm, code: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                            placeholder="请输入验证码"
                            className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all hover:bg-gray-50"
                            required
                            maxLength={6}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleSendCode}
                          disabled={countdown > 0 || isLoading}
                          className="px-6 py-4 bg-gray-100 text-gray-700 rounded-2xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                          {countdown > 0 ? `${countdown}秒后重发` : '获取验证码'}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* 提交按钮 */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      登录中...
                    </>
                  ) : (
                    <>
                      登录
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* 分隔线 */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">或使用以下方式登录</span>
                </div>
              </div>

              {/* 社交登录 */}
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="py-3 bg-white border border-gray-200 rounded-2xl font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </motion.button>
                <motion.button
                  type="button"
                  onClick={handleWechatLogin}
                  className="py-3 bg-[#07C160] text-white rounded-2xl font-medium hover:bg-[#06AD56] transition-colors flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.046c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.269-.03-.406-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
                  </svg>
                  微信
                </motion.button>
              </div>

              {/* 注册链接 */}
              <p className="text-center mt-8 text-gray-600">
                还没有账号？
                <Link href="/register" className="text-rose-500 font-semibold hover:text-rose-600 ml-1 transition-colors">
                  立即注册
                </Link>
              </p>
            </motion.div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
