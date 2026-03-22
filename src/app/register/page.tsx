'use client'

import { useState, useCallback, memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Heart, Eye, Mail, Lock, User, Calendar, ArrowRight, Check, Loader2, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { AnimatedBackground, GlassCard, GradientButton, GradientText, StepIndicator } from '@/components/animated-background'
import { checkPasswordStrength, getStrengthColor, getStrengthLabel } from '@/lib/password'

// 问卷选择弹窗组件 - 使用 memo
const QuestionnaireChoiceModal = memo(function QuestionnaireChoiceModal({ 
  isOpen, 
  onAnswerNow, 
  onSkip 
}: { 
  isOpen: boolean
  onAnswerNow: () => void
  onSkip: () => void 
}) {
  if (!isOpen) return null
  
  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-500/30">
            <Heart className="w-8 h-8 text-white" fill="white" />
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 mb-2">🎉 注册成功！</h2>
          <p className="text-gray-600 mb-6">
            完成问卷可以帮助我们更好地为你匹配心仪的对象~
          </p>
          
          <div className="space-y-3">
            <button
              onClick={onAnswerNow}
              className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-bold shadow-lg shadow-rose-500/30 hover:opacity-90 transition-opacity"
            >
              ✨ 现在开始答题
            </button>
            
            <button
              onClick={onSkip}
              className="w-full py-3.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              稍后再说，先去看看
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
})

// 表单数据类型
interface FormData {
  nickname: string
  email: string
  password: string
  gender: 'male' | 'female' | null
  age: string
  city: string
  agreedToTerms: boolean
}

// 城市列表 - 提取为常量，避免每次渲染重新创建
const CITY_OPTIONS = (
  <>
    <option value="">请选择城市</option>
    <optgroup label="直辖市">
      <option value="北京">北京</option>
      <option value="上海">上海</option>
      <option value="天津">天津</option>
      <option value="重庆">重庆</option>
    </optgroup>
    <optgroup label="一线城市">
      <option value="广州">广州</option>
      <option value="深圳">深圳</option>
      <option value="杭州">杭州</option>
      <option value="成都">成都</option>
      <option value="武汉">武汉</option>
      <option value="南京">南京</option>
    </optgroup>
    <optgroup label="省会城市">
      <option value="济南">济南</option>
      <option value="青岛">青岛</option>
      <option value="郑州">郑州</option>
      <option value="西安">西安</option>
      <option value="长沙">长沙</option>
      <option value="合肥">合肥</option>
      <option value="福州">福州</option>
      <option value="厦门">厦门</option>
      <option value="沈阳">沈阳</option>
      <option value="大连">大连</option>
      <option value="哈尔滨">哈尔滨</option>
      <option value="长春">长春</option>
      <option value="石家庄">石家庄</option>
      <option value="太原">太原</option>
      <option value="南昌">南昌</option>
      <option value="昆明">昆明</option>
      <option value="贵阳">贵阳</option>
      <option value="南宁">南宁</option>
      <option value="海口">海口</option>
      <option value="兰州">兰州</option>
      <option value="西宁">西宁</option>
      <option value="乌鲁木齐">乌鲁木齐</option>
      <option value="呼和浩特">呼和浩特</option>
      <option value="银川">银川</option>
      <option value="拉萨">拉萨</option>
    </optgroup>
    <optgroup label="其他城市">
      <option value="苏州">苏州</option>
      <option value="无锡">无锡</option>
      <option value="宁波">宁波</option>
      <option value="东莞">东莞</option>
      <option value="佛山">佛山</option>
      <option value="珠海">珠海</option>
      <option value="温州">温州</option>
      <option value="烟台">烟台</option>
      <option value="临沂">临沂</option>
      <option value="其他">其他</option>
    </optgroup>
  </>
)

// 步骤1组件
const Step1 = memo(function Step1({ 
  formData, 
  onChange 
}: { 
  formData: FormData
  onChange: (field: keyof FormData, value: string) => void 
}) {
  // 计算密码强度
  const passwordStrength = useMemo(() => {
    if (!formData.password || formData.password.length < 6) return null
    return checkPasswordStrength(formData.password)
  }, [formData.password])
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">创建账号</h2>
      <p className="text-gray-500 mb-6">开始你的心动之旅</p>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">昵称</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => onChange('nickname', e.target.value)}
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
              value={formData.email}
              onChange={(e) => onChange('email', e.target.value)}
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
              value={formData.password}
              onChange={(e) => onChange('password', e.target.value)}
              placeholder="至少8位字符"
              className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all hover:bg-gray-50"
            />
          </div>
          
          {/* 密码强度指示器 */}
          {passwordStrength && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-1 flex-1 rounded-full transition-colors"
                    style={{
                      backgroundColor: i <= passwordStrength.score 
                        ? getStrengthColor(passwordStrength.level) 
                        : '#e5e7eb'
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-between items-center">
                <span 
                  className="text-xs font-medium"
                  style={{ color: getStrengthColor(passwordStrength.level) }}
                >
                  {getStrengthLabel(passwordStrength.level)}
                </span>
                {passwordStrength.feedback.length > 0 && passwordStrength.score < 2 && (
                  <span className="text-xs text-gray-500">
                    {passwordStrength.feedback[0]}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

// 步骤2组件
const Step2 = memo(function Step2({ 
  formData, 
  onChange 
}: { 
  formData: FormData
  onChange: (field: keyof FormData, value: string | 'male' | 'female' | null) => void 
}) {
  const ageValue = parseInt(formData.age || '25')
  const ageProgress = ((ageValue - 18) / 42) * 100
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">完善资料</h2>
      <p className="text-gray-500 mb-6">让我们更好地了解你</p>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">性别</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => onChange('gender', 'male')}
              className={`py-4 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 ${
                formData.gender === 'male'
                  ? 'bg-rose-50 border-2 border-rose-500 text-rose-600'
                  : 'bg-gray-50 border-2 border-gray-200 hover:border-rose-300'
              }`}
            >
              <span className="text-2xl">👨</span>
              男生
            </button>
            <button
              type="button"
              onClick={() => onChange('gender', 'female')}
              className={`py-4 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 ${
                formData.gender === 'female'
                  ? 'bg-rose-50 border-2 border-rose-500 text-rose-600'
                  : 'bg-gray-50 border-2 border-gray-200 hover:border-rose-300'
              }`}
            >
              <span className="text-2xl">👩</span>
              女生
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">年龄</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">选择年龄</span>
                <span className="text-2xl font-bold text-rose-500">{formData.age || 25}岁</span>
              </div>
              <input
                type="range"
                value={formData.age || 25}
                onChange={(e) => onChange('age', e.target.value)}
                min="18"
                max="60"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                style={{
                  background: `linear-gradient(to right, #f43f5e 0%, #f43f5e ${ageProgress}%, #e5e7eb ${ageProgress}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>18岁</span>
                <span>60岁</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">所在城市</label>
          <div className="relative">
            <select
              value={formData.city}
              onChange={(e) => onChange('city', e.target.value)}
              className="w-full px-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all hover:bg-gray-50 appearance-none cursor-pointer"
            >
              {CITY_OPTIONS}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

// 步骤3组件
const Step3 = memo(function Step3({ 
  formData, 
  onChange 
}: { 
  formData: FormData
  onChange: (field: keyof FormData, value: boolean) => void 
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">最后一步</h2>
      <p className="text-gray-500 mb-6">完成注册开始匹配</p>

      <div className="space-y-5">
        <label 
          className={`flex items-start cursor-pointer p-4 rounded-2xl transition-colors ${
            formData.agreedToTerms ? 'bg-rose-50 border border-rose-200' : 'bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <input
            type="checkbox"
            checked={formData.agreedToTerms}
            onChange={(e) => onChange('agreedToTerms', e.target.checked)}
            className="mt-1 w-5 h-5 text-rose-500 border-gray-300 rounded focus:ring-rose-300"
          />
          <span className="ml-3 text-sm text-gray-600">
            我已阅读并同意
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault()
                alert('用户协议：\n1. 您同意遵守平台规则\n2. 您保证提供的信息真实有效\n3. 您同意我们的隐私政策')
              }}
              className="text-rose-500 hover:underline font-medium mx-1"
            >
              用户协议
            </button>
            和
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault()
                alert('隐私政策：\n我们重视您的隐私，保护您的个人信息安全。')
              }}
              className="text-rose-500 hover:underline font-medium ml-1"
            >
              隐私政策
            </button>
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
    </div>
  )
})

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [showQuestionnaireChoice, setShowQuestionnaireChoice] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    nickname: '',
    email: '',
    password: '',
    gender: null,
    age: '25',
    city: '',
    agreedToTerms: false
  })

  // 使用 useCallback 优化回调函数
  const handleFieldChange = useCallback((field: keyof FormData, value: string | boolean | 'male' | 'female' | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleAnswerNow = useCallback(() => {
    setShowQuestionnaireChoice(false)
    window.location.href = '/questionnaire'
  }, [])
  
  const handleSkipQuestionnaire = useCallback(() => {
    setShowQuestionnaireChoice(false)
    window.location.href = '/'
  }, [])

  const handleNext = useCallback(async () => {
    // 验证第一步
    if (step === 1) {
      if (!formData.nickname.trim()) {
        alert('请填写昵称')
        return
      }
      if (!formData.email.trim()) {
        alert('请填写邮箱')
        return
      }
      if (!formData.password || formData.password.length < 8) {
        alert('密码至少需要8位字符')
        return
      }
    }
    
    // 验证第二步
    if (step === 2) {
      if (!formData.gender) {
        alert('请选择性别')
        return
      }
      if (!formData.age || parseInt(formData.age) < 18) {
        alert('请填写有效年龄（18岁以上）')
        return
      }
      if (!formData.city.trim()) {
        alert('请填写所在城市')
        return
      }
    }

    if (step < 3) {
      setStep(step + 1)
    }
  }, [step, formData])

  const handleSubmit = useCallback(async () => {
    // 验证第三步
    if (!formData.agreedToTerms) {
      alert('请阅读并同意用户协议和隐私政策')
      return
    }

    setIsLoading(true)
    
    try {
      // 调用注册 API
      const response = await fetch('/api/auth/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          email: formData.email.trim(),
          password: formData.password,
          nickname: formData.nickname.trim(),
          gender: formData.gender,
          age: parseInt(formData.age),
          city: formData.city.trim()
        })
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        // 保存到 localStorage
        localStorage.setItem('xindong_current_user', JSON.stringify(data.user))
        
        // 保存JWT Token（用于API认证）
        if (data.token) {
          localStorage.setItem('xindong_auth_token', data.token)
        }
        
        // 初始化该用户的个人资料
        const userProfile = {
          nickname: data.user.nickname,
          age: data.user.age,
          gender: data.user.gender || 'male',
          city: data.user.city,
          occupation: '',
          education: '',
          height: 175,
          bio: '',
          interests: [],
          lookingFor: {
            minAge: 18,
            maxAge: 35,
            cities: [data.user.city],
            relationship: 'serious'
          }
        }
        localStorage.setItem(`xindong_profile_${data.user.id}`, JSON.stringify(userProfile))
        
        // 显示问卷选择弹窗
        setIsLoading(false)
        setShowQuestionnaireChoice(true)
      } else {
        alert(data.error || '注册失败，请重试')
        setIsLoading(false)
      }
    } catch (e) {
      console.error('Register error:', e)
      alert('网络错误，请检查网络连接')
      setIsLoading(false)
    }
  }, [formData])

  // 使用 useMemo 缓存当前步骤组件
  const currentStepComponent = useMemo(() => {
    switch (step) {
      case 1:
        return <Step1 formData={formData} onChange={handleFieldChange} />
      case 2:
        return <Step2 formData={formData} onChange={handleFieldChange} />
      case 3:
        return <Step3 formData={formData} onChange={handleFieldChange} />
      default:
        return null
    }
  }, [step, formData, handleFieldChange])

  return (
    <AnimatedBackground variant="dream">
      <div className="min-h-screen flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
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
          </div>

          {/* 步骤指示器 */}
          <div className="mb-8">
            <StepIndicator steps={3} currentStep={step} />
          </div>

          {/* 表单卡片 */}
          <GlassCard className="p-8">
            {currentStepComponent}

            {/* 按钮 */}
            <div className="mt-8">
              {step < 3 ? (
                <GradientButton onClick={handleNext} className="w-full flex items-center justify-center gap-2">
                  下一步
                  <ArrowRight className="w-5 h-5" />
                </GradientButton>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-rose-500/30 flex items-center justify-center gap-2 disabled:opacity-70"
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
                </button>
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
      
      {/* 问卷选择弹窗 */}
      <QuestionnaireChoiceModal 
        isOpen={showQuestionnaireChoice}
        onAnswerNow={handleAnswerNow}
        onSkip={handleSkipQuestionnaire}
      />
    </AnimatedBackground>
  )
}
