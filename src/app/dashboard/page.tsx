'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Settings, Heart, MessageCircle, User, Bell, ChevronRight,
  TrendingUp, Calendar, Sparkles, Target, Users, BookOpen,
  Camera, Edit2, Award, Zap, BarChart3, LogOut
} from 'lucide-react'
import { 
  AnimatedBackground, 
  GlassCard, 
  GradientText,
  AnimatedCounter,
  FadeIn,
  Tag
} from '@/components/animated-background'
import { useAuth, defaultProfile, UserProfile } from '@/hooks/useAuth'

// 根据时间获取问候语
function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 6) {
    return '夜深了'
  } else if (hour < 12) {
    return '早安'
  } else if (hour < 14) {
    return '午安'
  } else if (hour < 18) {
    return '下午好'
  } else if (hour < 22) {
    return '晚上好'
  } else {
    return '夜深了'
  }
}

// 大五人格雷达图组件
function PersonalityRadar({ scores }: { scores: Record<string, number> }) {
  const dimensions = [
    { key: 'openness', label: '开放性', icon: '🌟' },
    { key: 'conscientiousness', label: '尽责性', icon: '🎯' },
    { key: 'extraversion', label: '外向性', icon: '🎭' },
    { key: 'agreeableness', label: '宜人性', icon: '💚' },
    { key: 'neuroticism', label: '情绪稳定性', icon: '🌊' },
  ]

  const centerX = 150
  const centerY = 150
  const maxRadius = 100

  const points = dimensions.map((dim, i) => {
    const angle = (Math.PI * 2 * i) / dimensions.length - Math.PI / 2
    const value = scores[dim.key] || 50
    const radius = (value / 100) * maxRadius
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      label: dim.label,
      icon: dim.icon,
      value,
    }
  })

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'

  return (
    <div className="relative">
      <svg viewBox="0 0 300 300" className="w-full max-w-xs mx-auto">
        {[20, 40, 60, 80, 100].map((level) => {
          const radius = (level / 100) * maxRadius
          return (
            <circle
              key={level}
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="none"
              stroke="url(#gridGradient)"
              strokeWidth="1"
              opacity={0.3 + (level / 100) * 0.3}
            />
          )
        })}

        {dimensions.map((dim, i) => {
          const angle = (Math.PI * 2 * i) / dimensions.length - Math.PI / 2
          const endX = centerX + maxRadius * Math.cos(angle)
          const endY = centerY + maxRadius * Math.sin(angle)
          return (
            <line
              key={dim.key}
              x1={centerX}
              y1={centerY}
              x2={endX}
              y2={endY}
              stroke="url(#axisGradient)"
              strokeWidth="1"
              opacity={0.4}
            />
          )
        })}

        <path
          d={pathD}
          fill="url(#radarGradient)"
          stroke="url(#radarStroke)"
          strokeWidth="3"
        />

        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="8"
            fill="url(#pointGradient)"
            stroke="white"
            strokeWidth="3"
            className="drop-shadow-lg"
          />
        ))}

        <defs>
          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(244, 63, 94, 0.4)" />
            <stop offset="50%" stopColor="rgba(236, 72, 153, 0.3)" />
            <stop offset="100%" stopColor="rgba(168, 85, 247, 0.4)" />
          </linearGradient>
          <linearGradient id="radarStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F43F5E" />
            <stop offset="50%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
          <linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FECDD3" />
            <stop offset="100%" stopColor="#E9D5FF" />
          </linearGradient>
          <linearGradient id="axisGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDA4AF" />
            <stop offset="100%" stopColor="#D8B4FE" />
          </linearGradient>
          <radialGradient id="pointGradient">
            <stop offset="0%" stopColor="#FB7185" />
            <stop offset="100%" stopColor="#EC4899" />
          </radialGradient>
        </defs>
      </svg>

      <div className="absolute inset-0 pointer-events-none">
        {points.map((p, i) => (
          <div
            key={i}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${(p.x / 300) * 100}%`,
              top: `${(p.y / 300) * 100}%`,
            }}
          >
            <div className="bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-xl shadow-lg border border-gray-100/50 text-xs">
              <span className="mr-1">{dimensions[i].icon}</span>
              <span className="font-semibold bg-gradient-to-r from-rose-500 to-purple-500 bg-clip-text text-transparent">{p.value}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 匹配历史卡片
function MatchHistoryCard({ match }: { match: any }) {
  return (
    <GlassCard className="p-4" hover={true}>
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-rose-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-rose-500/30">
          {match.name[0]}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-gray-800">{match.name}</h4>
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${
              match.status === 'mutual' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700' :
              match.status === 'liked' ? 'bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700' :
              'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-600'
            }`}>
              {match.status === 'mutual' ? '💕 互喜' : match.status === 'liked' ? '已喜欢' : '匹配'}
            </span>
          </div>
          <p className="text-sm text-gray-500">{match.date}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl">{match.emoji}</span>
            <GradientText className="text-lg font-bold">{match.score}%</GradientText>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}

export default function DashboardPage() {
  const { currentUser, isLoading, getUserData, logout } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [profile, setProfile] = useState<UserProfile>(defaultProfile)
  const [avatar, setAvatar] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<'overview' | 'personality' | 'history' | 'settings'>('overview')
  const [questionnaireCompleted, setQuestionnaireCompleted] = useState(false)

  // 检查问卷完成状态
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const answers = localStorage.getItem('questionnaireAnswers')
        if (answers) {
          const parsed = JSON.parse(answers)
          const answerCount = Object.keys(parsed).length
          setQuestionnaireCompleted(answerCount >= 66)
        }
      } catch (e) {
        console.log('Error checking questionnaire status')
      }
    }
  }, [])

  // 从用户专属存储加载数据
  useEffect(() => {
    setMounted(true)
    
    if (!isLoading && currentUser) {
      // 从 currentUser 获取最新的基本信息（数据库同步）
      const userProfile: UserProfile = {
        nickname: currentUser.nickname || '',
        age: currentUser.age || 25,
        gender: currentUser.gender || 'male',
        city: currentUser.city || '',
        occupation: '',
        education: '',
        height: 175,
        bio: '',
        interests: [],
        lookingFor: {
          minAge: 18,
          maxAge: 35,
          cities: currentUser.city ? [currentUser.city] : [],
          relationship: 'serious'
        }
      }
      
      // 合并 localStorage 中的用户编辑数据
      const savedProfile = getUserData<UserProfile>('profile', defaultProfile)
      if (savedProfile.nickname) {
        // 保留用户编辑的字段
        userProfile.bio = savedProfile.bio || ''
        userProfile.interests = savedProfile.interests || []
        userProfile.occupation = savedProfile.occupation || ''
        userProfile.education = savedProfile.education || ''
        userProfile.height = savedProfile.height || 175
        userProfile.lookingFor = savedProfile.lookingFor || userProfile.lookingFor
      }
      
      // 强制使用数据库的最新昵称、年龄、城市、性别
      setProfile(userProfile)
      
      // 保存到 localStorage
      localStorage.setItem(`xindong_profile_${currentUser.id}`, JSON.stringify(userProfile))
      
      // 加载头像 - 优先使用数据库中的头像
      const savedAvatar = localStorage.getItem(`xindong_avatar_${currentUser.id}`)
      if (currentUser.avatar) {
        // 数据库有头像，优先使用
        setAvatar(currentUser.avatar)
        // 同步到 localStorage
        localStorage.setItem(`xindong_avatar_${currentUser.id}`, currentUser.avatar)
      } else if (savedAvatar) {
        setAvatar(savedAvatar)
      }
    }
  }, [isLoading, currentUser, getUserData])

  // 处理登出
  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      logout()
      window.location.href = '/'
    }
  }

  const greeting = getGreeting()

  // 大五人格分数
  const personalityScores = {
    openness: 78,
    conscientiousness: 65,
    extraversion: 52,
    agreeableness: 85,
    neuroticism: 35,
  }

  // 匹配历史
  const matchHistory = [
    { name: '小雨', date: '3月18日', score: 92, emoji: '💕', status: 'mutual' },
    { name: '阿杰', date: '3月11日', score: 85, emoji: '😊', status: 'liked' },
    { name: '小美', date: '3月4日', score: 78, emoji: '🙂', status: 'matched' },
    { name: '云云', date: '2月25日', score: 72, emoji: '🙂', status: 'matched' },
  ]

  const personalityInsights = [
    { title: '创意先锋', desc: '你对新事物充满好奇，富有想象力和创造力', icon: '🌟', gradient: 'from-amber-400 to-orange-500' },
    { title: '可靠伙伴', desc: '做事认真负责，值得信赖的好朋友', icon: '🎯', gradient: 'from-blue-400 to-cyan-500' },
    { title: '温柔善良', desc: '待人友善，善解人意，给身边人带来温暖', icon: '💚', gradient: 'from-emerald-400 to-green-500' },
    { title: '情绪稳定', desc: '内心平和，能够很好地应对压力', icon: '🌊', gradient: 'from-teal-400 to-cyan-500' },
  ]

  if (isLoading || !mounted) {
    return (
      <AnimatedBackground variant="purple" showFloatingHearts={true}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-rose-500">加载中...</div>
        </div>
      </AnimatedBackground>
    )
  }

  // 如果未登录，跳转到登录页
  if (!currentUser) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    return null
  }

  return (
    <AnimatedBackground variant="purple" showFloatingHearts={true}>
      <div className="min-h-screen pb-20">
        {/* 顶部导航栏 */}
        <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-rose-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-rose-500/30 overflow-hidden">
                  {avatar ? (
                    <img src={avatar} alt="头像" className="w-full h-full object-cover" />
                  ) : (
                    (profile.nickname || currentUser?.nickname || currentUser?.email?.split('@')[0] || '?')[0]
                  )}
                </div>
                <div>
                  <h1 className="font-bold text-gray-800">{profile.nickname || currentUser?.nickname || currentUser?.email?.split('@')[0] || '我的'}的主页</h1>
                  <p className="text-xs text-gray-500">下次匹配：<GradientText className="font-medium">3月26日</GradientText></p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleLogout}
                  className="p-2.5 hover:bg-gray-100/50 rounded-full transition-colors"
                  title="退出登录"
                >
                  <LogOut className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2.5 hover:bg-gray-100/50 rounded-full transition-colors relative">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
                </button>
                <Link href="/profile/edit" className="p-2.5 hover:bg-gray-100/50 rounded-full transition-colors">
                  <Settings className="w-5 h-5 text-gray-600" />
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* 欢迎区域 */}
          <FadeIn delay={0}>
            <div className="relative overflow-hidden rounded-3xl mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 animate-gradient bg-[length:200%_100%]" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdi0yMEgtMTB6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] opacity-50" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
              
              <div className="relative z-10 p-6 md:p-8 text-white">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-2 drop-shadow-md">
                      {greeting}，{profile.nickname || currentUser?.nickname || currentUser?.email?.split('@')[0] || '新用户'}！✨
                    </h2>
                    <p className="text-white/90">
                      还有 <span className="font-bold text-xl drop-shadow-md">7天</span> 就能见到你的新匹配啦~
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Link 
                      href="/questionnaire"
                      className="px-6 py-3 bg-white text-rose-600 font-semibold rounded-full hover:shadow-xl transition-all hover:scale-105"
                    >
                      继续问卷
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* 问卷完成提示 */}
          {!questionnaireCompleted && (
            <FadeIn delay={0.05}>
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">完善资料解锁全部功能</p>
                    <p className="text-sm text-gray-500">完成问卷后可参与匹配、无限喜欢、主动发起聊天</p>
                  </div>
                </div>
                <Link 
                  href="/questionnaire"
                  className="px-4 py-2 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors"
                >
                  去完成
                </Link>
              </div>
            </FadeIn>
          )}

          {/* 统计卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <FadeIn delay={0.1}>
              <GlassCard className="p-5" hover={true}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-pink-100 rounded-xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      <AnimatedCounter end={12} duration={1.5} />
                    </p>
                    <p className="text-sm text-gray-500">匹配次数</p>
                  </div>
                </div>
              </GlassCard>
            </FadeIn>
            <FadeIn delay={0.15}>
              <GlassCard className="p-5" hover={true}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-pink-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      <AnimatedCounter end={3} duration={1.5} />
                    </p>
                    <p className="text-sm text-gray-500">互相喜欢</p>
                  </div>
                </div>
              </GlassCard>
            </FadeIn>
            <FadeIn delay={0.2}>
              <GlassCard className="p-5" hover={true}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      <AnimatedCounter end={0} suffix="%" duration={1.5} />
                    </p>
                    <p className="text-sm text-gray-500">问卷完成</p>
                  </div>
                </div>
              </GlassCard>
            </FadeIn>
            <FadeIn delay={0.25}>
              <GlassCard className="p-5" hover={true}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      <AnimatedCounter end={85} suffix="%" duration={1.5} />
                    </p>
                    <p className="text-sm text-gray-500">平均匹配度</p>
                  </div>
                </div>
              </GlassCard>
            </FadeIn>
          </div>

          {/* 主要内容区域 */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* 左侧：人格分析 */}
            <div className="md:col-span-2 space-y-8">
              {/* 大五人格雷达图 */}
              <FadeIn delay={0.3}>
                <GlassCard className="p-6" hover={false}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-rose-500" />
                        人格画像分析
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">完成问卷后生成你的性格分析</p>
                    </div>
                  </div>

                  <PersonalityRadar scores={personalityScores} />

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {personalityInsights.map((insight, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100/50">
                        <div className={`w-10 h-10 bg-gradient-to-br ${insight.gradient} rounded-lg flex items-center justify-center text-xl shadow-lg`}>
                          {insight.icon}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{insight.title}</p>
                          <p className="text-xs text-gray-500">{insight.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </FadeIn>

              {/* 匹配历史 */}
              <FadeIn delay={0.4}>
                <GlassCard className="p-6" hover={false}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-rose-500" />
                      匹配历史
                    </h3>
                    <Link href="/match" className="text-rose-500 text-sm font-medium hover:underline flex items-center gap-1">
                      查看全部 <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {matchHistory.map((match, i) => (
                      <MatchHistoryCard key={i} match={match} />
                    ))}
                  </div>
                </GlassCard>
              </FadeIn>
            </div>

            {/* 右侧：快捷操作 */}
            <div className="space-y-6">
              {/* 快捷入口 */}
              <FadeIn delay={0.35}>
                <GlassCard className="p-6" hover={false}>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">快捷入口</h3>
                  <div className="space-y-3">
                    <Link href="/profile/edit" className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:from-rose-50 hover:to-pink-50 transition-all group border border-gray-100/50">
                      <div className="w-10 h-10 bg-gradient-to-br from-rose-100 to-pink-100 rounded-lg flex items-center justify-center group-hover:from-rose-200 group-hover:to-pink-200 transition-all">
                        <Edit2 className="w-5 h-5 text-rose-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">编辑资料</p>
                        <p className="text-xs text-gray-500">完善个人信息</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </Link>

                    <Link href="/questionnaire" className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:from-pink-50 hover:to-purple-50 transition-all group border border-gray-100/50">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center group-hover:from-pink-200 group-hover:to-purple-200 transition-all">
                        <BookOpen className="w-5 h-5 text-pink-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">开始问卷</p>
                        <p className="text-xs text-gray-500">完成66道灵魂问题</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </Link>

                    <Link href="/profile" className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:from-amber-50 hover:to-orange-50 transition-all group border border-gray-100/50">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center group-hover:from-amber-200 group-hover:to-orange-200 transition-all">
                        <Camera className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">上传照片</p>
                        <p className="text-xs text-gray-500">展示真实的你</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </Link>

                    <Link href="/profile/edit" className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:from-green-50 hover:to-emerald-50 transition-all group border border-gray-100/50">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center group-hover:from-green-200 group-hover:to-emerald-200 transition-all">
                        <Target className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">匹配偏好</p>
                        <p className="text-xs text-gray-500">设置你的择偶标准</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </Link>
                  </div>
                </GlassCard>
              </FadeIn>

              {/* 提升匹配 */}
              <FadeIn delay={0.45}>
                <div className="relative overflow-hidden rounded-3xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-500 via-pink-500 to-purple-500" />
                  <div className="relative p-6 text-white">
                    <div className="flex items-center gap-2 mb-4">
                      <Zap className="w-5 h-5" />
                      <h3 className="font-bold">提升匹配质量</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold backdrop-blur-sm">
                          1
                        </div>
                        <span className="text-sm">完成全部66道问题</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold backdrop-blur-sm">
                          2
                        </div>
                        <span className="text-sm">上传3-5张生活照片</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold backdrop-blur-sm">
                          3
                        </div>
                        <span className="text-sm">完善个人简介</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <div className="flex items-center justify-between text-sm">
                        <span>完成度</span>
                        <span className="font-bold">0%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2 mt-2 overflow-hidden">
                        <div className="bg-white rounded-full h-2 transition-all duration-1000" style={{ width: '0%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>

              {/* 成就徽章 */}
              <FadeIn delay={0.5}>
                <GlassCard className="p-6" hover={false}>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    我的成就
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl opacity-40" title="待解锁">
                      🔒
                    </div>
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl opacity-40" title="待解锁">
                      🔒
                    </div>
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl opacity-40" title="待解锁">
                      🔒
                    </div>
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl opacity-40" title="待解锁">
                      🔒
                    </div>
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl opacity-40" title="待解锁">
                      🔒
                    </div>
                  </div>
                </GlassCard>
              </FadeIn>
            </div>
          </div>
        </div>

        {/* 底部导航 */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-white/50 z-50">
          <div className="max-w-md mx-auto flex justify-around py-3">
            <Link href="/" className="flex flex-col items-center text-gray-400 hover:text-rose-500 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs mt-1">首页</span>
            </Link>
            <Link href="/match" className="flex flex-col items-center text-gray-400 hover:text-rose-500 transition-colors">
              <Heart className="w-6 h-6" />
              <span className="text-xs mt-1">匹配</span>
            </Link>
            <Link href="/chat" className="flex flex-col items-center text-gray-400 hover:text-rose-500 transition-colors">
              <MessageCircle className="w-6 h-6" />
              <span className="text-xs mt-1">消息</span>
            </Link>
            <Link href="/dashboard" className="flex flex-col items-center text-rose-500">
              <User className="w-6 h-6 fill-current" />
              <span className="text-xs mt-1 font-medium">我的</span>
            </Link>
          </div>
        </nav>
      </div>
    </AnimatedBackground>
  )
}
