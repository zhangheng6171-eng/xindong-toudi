'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Settings, Heart, MessageCircle, User, Bell, ChevronRight,
  TrendingUp, Calendar, Sparkles, Target, Users, BookOpen,
  Camera, Edit2, Award, Zap, Moon, Sun, BarChart3
} from 'lucide-react'

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
        {/* 背景网格 */}
        {[20, 40, 60, 80, 100].map((level) => {
          const radius = (level / 100) * maxRadius
          return (
            <circle
              key={level}
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="none"
              stroke="rgba(255, 107, 157, 0.1)"
              strokeWidth="1"
            />
          )
        })}

        {/* 轴线 */}
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
              stroke="rgba(255, 107, 157, 0.2)"
              strokeWidth="1"
            />
          )
        })}

        {/* 数据区域 */}
        <path
          d={pathD}
          fill="url(#radarGradient)"
          stroke="url(#radarStroke)"
          strokeWidth="2"
          className="animate-pulse-soft"
        />

        {/* 数据点 */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="6"
            fill="#FF6B9D"
            stroke="white"
            strokeWidth="2"
            className="drop-shadow-lg"
          />
        ))}

        {/* 渐变定义 */}
        <defs>
          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 107, 157, 0.3)" />
            <stop offset="100%" stopColor="rgba(183, 148, 246, 0.3)" />
          </linearGradient>
          <linearGradient id="radarStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B9D" />
            <stop offset="100%" stopColor="#B794F6" />
          </linearGradient>
        </defs>
      </svg>

      {/* 标签 */}
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
            <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm text-xs">
              <span className="mr-1">{dimensions[i].icon}</span>
              <span className="font-medium text-gray-700">{p.value}%</span>
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
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-romance-400 rounded-full flex items-center justify-center text-white text-xl font-bold">
          {match.name[0]}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-gray-800">{match.name}</h4>
            <span className={`text-sm px-2 py-0.5 rounded-full ${
              match.status === 'mutual' ? 'bg-green-100 text-green-700' :
              match.status === 'liked' ? 'bg-primary-100 text-primary-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {match.status === 'mutual' ? '💕 互喜' : match.status === 'liked' ? '已喜欢' : '匹配'}
            </span>
          </div>
          <p className="text-sm text-gray-500">{match.date}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl">{match.emoji}</span>
            <span className="text-lg font-bold text-primary-600">{match.score}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState<'overview' | 'personality' | 'history' | 'settings'>('overview')

  // 模拟用户数据
  const user = {
    nickname: '小恒',
    age: 28,
    city: '北京',
    avatar: null,
    questionnaireProgress: 66,
    nextMatchDate: '3月26日',
    daysUntilMatch: 4,
  }

  // 大五人格分数
  const personalityScores = {
    openness: 78,
    conscientiousness: 65,
    extraversion: 52,
    agreeableness: 85,
    neuroticism: 35, // 低神经质 = 高稳定性
  }

  // 匹配历史
  const matchHistory = [
    { name: '小雨', date: '3月18日', score: 92, emoji: '💕', status: 'mutual' },
    { name: '阿杰', date: '3月11日', score: 85, emoji: '😊', status: 'liked' },
    { name: '小美', date: '3月4日', score: 78, emoji: '🙂', status: 'matched' },
    { name: '云云', date: '2月25日', score: 72, emoji: '🙂', status: 'matched' },
  ]

  // 性格解读
  const personalityInsights = [
    { title: '创意先锋', desc: '你对新事物充满好奇，富有想象力和创造力', icon: '🌟', color: 'from-yellow-400 to-orange-400' },
    { title: '可靠伙伴', desc: '做事认真负责，值得信赖的好朋友', icon: '🎯', color: 'from-blue-400 to-cyan-400' },
    { title: '温柔善良', desc: '待人友善，善解人意，给身边人带来温暖', icon: '💚', color: 'from-green-400 to-emerald-400' },
    { title: '情绪稳定', desc: '内心平和，能够很好地应对压力', icon: '🌊', color: 'from-teal-400 to-cyan-400' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-primary-50/30">
      {/* 顶部导航栏 */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-romance-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {user.nickname[0]}
              </div>
              <div>
                <h1 className="font-bold text-gray-800">{user.nickname}的主页</h1>
                <p className="text-xs text-gray-500">下次匹配：{user.nextMatchDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <Link href="/profile/edit" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 欢迎区域 */}
        <div className="bg-gradient-to-r from-primary-500 via-romance-500 to-primary-500 bg-[length:200%_100%] animate-gradient rounded-3xl p-6 md:p-8 text-white mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  早安，{user.nickname}！✨
                </h2>
                <p className="text-white/90">
                  还有 <span className="font-bold text-xl">{user.daysUntilMatch}天</span> 就能见到你的新匹配啦~
                </p>
              </div>
              <div className="flex gap-3">
                <Link 
                  href="/questionnaire"
                  className="px-6 py-3 bg-white text-primary-600 font-semibold rounded-full hover:shadow-lg transition-all hover:scale-105"
                >
                  继续问卷
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">12</p>
                <p className="text-sm text-gray-500">匹配次数</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-romance-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-romance-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">3</p>
                <p className="text-sm text-gray-500">互相喜欢</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-accent-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">66%</p>
                <p className="text-sm text-gray-500">问卷完成</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">85%</p>
                <p className="text-sm text-gray-500">平均匹配度</p>
              </div>
            </div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* 左侧：人格分析 */}
          <div className="md:col-span-2 space-y-8">
            {/* 大五人格雷达图 */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary-500" />
                    人格画像分析
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">基于你的问卷回答生成的性格分析</p>
                </div>
              </div>

              <PersonalityRadar scores={personalityScores} />

              {/* 性格特点标签 */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                {personalityInsights.map((insight, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className={`w-10 h-10 bg-gradient-to-br ${insight.color} rounded-lg flex items-center justify-center text-xl`}>
                      {insight.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{insight.title}</p>
                      <p className="text-xs text-gray-500">{insight.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 匹配历史 */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary-500" />
                  匹配历史
                </h3>
                <Link href="/match" className="text-primary-500 text-sm font-medium hover:underline flex items-center gap-1">
                  查看全部 <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-3">
                {matchHistory.map((match, i) => (
                  <MatchHistoryCard key={i} match={match} />
                ))}
              </div>
            </div>
          </div>

          {/* 右侧：快捷操作 */}
          <div className="space-y-6">
            {/* 快捷入口 */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">快捷入口</h3>
              <div className="space-y-3">
                <Link href="/profile/edit" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-primary-50 transition-colors group">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                    <Edit2 className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">编辑资料</p>
                    <p className="text-xs text-gray-500">完善个人信息</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </Link>

                <Link href="/questionnaire" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-romance-50 transition-colors group">
                  <div className="w-10 h-10 bg-romance-100 rounded-lg flex items-center justify-center group-hover:bg-romance-200 transition-colors">
                    <BookOpen className="w-5 h-5 text-romance-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">继续问卷</p>
                    <p className="text-xs text-gray-500">还剩 22 题</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </Link>

                <Link href="/profile/photos" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-accent-50 transition-colors group">
                  <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center group-hover:bg-accent-200 transition-colors">
                    <Camera className="w-5 h-5 text-accent-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">上传照片</p>
                    <p className="text-xs text-gray-500">展示真实的你</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </Link>

                <Link href="/profile/preferences" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-green-50 transition-colors group">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <Target className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">匹配偏好</p>
                    <p className="text-xs text-gray-500">设置你的择偶标准</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </Link>
              </div>
            </div>

            {/* 提升匹配 */}
            <div className="bg-gradient-to-br from-primary-500 to-romance-500 rounded-3xl p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5" />
                <h3 className="font-bold">提升匹配质量</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <span className="text-sm">完成全部66道问题</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <span className="text-sm">上传3-5张生活照片</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <span className="text-sm">完善个人简介</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="flex items-center justify-between text-sm">
                  <span>完成度</span>
                  <span className="font-bold">66%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                  <div className="bg-white rounded-full h-2" style={{ width: '66%' }}></div>
                </div>
              </div>
            </div>

            {/* 成就徽章 */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-accent-500" />
                我的成就
              </h3>
              <div className="flex flex-wrap gap-2">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center text-2xl" title="真诚填写">
                  ✍️
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-romance-400 rounded-xl flex items-center justify-center text-2xl" title="连续登录">
                  🔥
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center text-2xl" title="积极互动">
                  💬
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl opacity-40" title="待解锁">
                  🔒
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl opacity-40" title="待解锁">
                  🔒
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部导航 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
        <div className="max-w-md mx-auto flex justify-around py-3">
          <Link href="/" className="flex flex-col items-center text-gray-400 hover:text-primary-500 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-1">首页</span>
          </Link>
          <Link href="/match" className="flex flex-col items-center text-gray-400 hover:text-primary-500 transition-colors">
            <Heart className="w-6 h-6" />
            <span className="text-xs mt-1">匹配</span>
          </Link>
          <Link href="/chat" className="flex flex-col items-center text-gray-400 hover:text-primary-500 transition-colors">
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs mt-1">消息</span>
          </Link>
          <Link href="/dashboard" className="flex flex-col items-center text-primary-500">
            <User className="w-6 h-6 fill-current" />
            <span className="text-xs mt-1 font-medium">我的</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
