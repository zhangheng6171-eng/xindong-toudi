'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Settings, Edit2, Camera, Heart, MessageCircle, Star, MapPin, Briefcase, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui'
import { 
  AnimatedBackground, 
  GlassCard, 
  GradientButton, 
  GradientText, 
  AnimatedCounter,
  FadeIn,
  Tag
} from '@/components/animated-background'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'about' | 'preferences' | 'tags'>('about')

  const profile = {
    nickname: '小恒',
    age: 28,
    city: '北京',
    occupation: '产品经理',
    education: '硕士',
    height: '175cm',
    joinedDays: 92,
    bio: '热爱生活，喜欢旅行和摄影。周末喜欢探店、看书、撸猫。相信爱情，期待遇到三观契合的那个她。',
    tags: ['温柔', '上进', '顾家', '喜欢小孩', '爱运动'],
    questionnaireProgress: 66,
    stats: {
      totalMatches: 12,
      liked: 8,
      mutualLikes: 3,
    },
    photos: [
      null, null, null, // Placeholders
    ],
  }

  return (
    <AnimatedBackground variant="romance" showFloatingHearts={true}>
      <div className="min-h-screen pb-20">
        {/* Header with Gradient */}
        <div className="relative">
          {/* 渐变背景头部 */}
          <div className="bg-gradient-to-br from-rose-500 via-pink-500 to-purple-500 text-white">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-4 py-4">
              <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <Settings className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold">我的主页</h1>
              <Link href="/profile/edit" className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <Edit2 className="w-6 h-6" />
              </Link>
            </div>

            {/* Avatar & Info */}
            <div className="flex flex-col items-center pb-10 pt-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-full blur-xl scale-125" />
                <div className="relative w-28 h-28 bg-white rounded-full flex items-center justify-center text-5xl font-bold bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-2xl">
                  {profile.nickname[0]}
                </div>
                <button className="absolute bottom-0 right-0 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              
              <h2 className="text-2xl font-bold mt-5 drop-shadow-md">{profile.nickname}，{profile.age}岁</h2>
              <p className="text-white/90 mt-1">{profile.city} · {profile.occupation}</p>
              
              {/* Stats with Animation */}
              <div className="flex gap-10 mt-5">
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    <AnimatedCounter end={profile.stats.totalMatches} duration={1.5} />
                  </div>
                  <div className="text-xs text-white/80 mt-1">匹配次数</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    <AnimatedCounter end={profile.stats.liked} duration={1.5} />
                  </div>
                  <div className="text-xs text-white/80 mt-1">喜欢</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    <AnimatedCounter end={profile.stats.mutualLikes} duration={1.5} />
                  </div>
                  <div className="text-xs text-white/80 mt-1">互相喜欢</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative curve */}
          <svg className="absolute bottom-0 left-0 right-0 w-full" viewBox="0 0 1440 60" fill="none" preserveAspectRatio="none">
            <path d="M0 60V30C240 50 480 10 720 30C960 50 1200 10 1440 30V60H0Z" fill="url(#curveGradient)" />
            <defs>
              <linearGradient id="curveGradient" x1="0" y1="0" x2="1440" y2="0">
                <stop offset="0%" stopColor="rgba(251,207,232,0.3)" />
                <stop offset="50%" stopColor="rgba(253,242,248,0.5)" />
                <stop offset="100%" stopColor="rgba(251,207,232,0.3)" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Photo Gallery */}
        <div className="px-4 -mt-2 relative z-10">
          <FadeIn delay={0.1}>
            <GlassCard className="p-4" hover={false}>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-200 hover:border-rose-300 transition-colors cursor-pointer"
                  >
                    {i <= profile.photos.length ? (
                      <span className="text-3xl">📷</span>
                    ) : (
                      <Camera className="w-6 h-6 text-gray-300" />
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
          </FadeIn>
        </div>

        {/* Info Cards */}
        <div className="px-4 py-4 space-y-4">
          {/* Basic Info */}
          <FadeIn delay={0.2}>
            <GlassCard className="p-5" hover={false}>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-rose-500" />
                  </div>
                  <span className="text-sm text-gray-600">{profile.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-pink-500" />
                  </div>
                  <span className="text-sm text-gray-600">{profile.occupation}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-purple-500" />
                  </div>
                  <span className="text-sm text-gray-600">{profile.education}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm">📏</span>
                  </div>
                  <span className="text-sm text-gray-600">{profile.height}</span>
                </div>
              </div>
            </GlassCard>
          </FadeIn>

          {/* Tabs */}
          <FadeIn delay={0.3}>
            <GlassCard className="p-1.5" hover={false}>
              <div className="flex">
                {(['about', 'preferences', 'tags'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 rounded-2xl text-sm font-medium transition-all duration-300 ${
                      activeTab === tab
                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab === 'about' ? '关于我' : tab === 'preferences' ? '期待的TA' : '我的特质'}
                  </button>
                ))}
              </div>
            </GlassCard>
          </FadeIn>

          {/* Tab Content */}
          <FadeIn delay={0.4}>
            <GlassCard className="p-5" hover={false}>
              {activeTab === 'about' && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="text-lg">✨</span>
                    关于我
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {profile.bio}
                  </p>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2.5 border-b border-gray-100/50">
                    <span className="text-gray-500">年龄</span>
                    <span className="text-gray-800 font-medium">24-32岁</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-gray-100/50">
                    <span className="text-gray-500">城市</span>
                    <span className="text-gray-800 font-medium">北京 / 上海</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-gray-100/50">
                    <span className="text-gray-500">学历</span>
                    <span className="text-gray-800 font-medium">本科及以上</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-gray-500">性格</span>
                    <span className="text-gray-800 font-medium">开朗、善良</span>
                  </div>
                </div>
              )}

              {activeTab === 'tags' && (
                <div className="flex flex-wrap gap-2">
                  {profile.tags.map((tag) => (
                    <Tag key={tag} color="rose">
                      {tag}
                    </Tag>
                  ))}
                  <button className="px-4 py-2 border-2 border-dashed border-rose-200 text-rose-400 rounded-full text-sm hover:border-rose-300 hover:text-rose-500 transition-colors">
                    + 添加
                  </button>
                </div>
              )}
            </GlassCard>
          </FadeIn>

          {/* Questionnaire Progress */}
          <FadeIn delay={0.5}>
            <GlassCard className="p-5" hover={false}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-800 flex items-center gap-2">
                  <span className="text-lg">📝</span>
                  问卷完成度
                </span>
                <GradientText className="text-xl font-bold">
                  {profile.questionnaireProgress}/66
                </GradientText>
              </div>
              <div className="w-full bg-gray-100/50 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${profile.questionnaireProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-3">完成更多问题，获得更精准的匹配 ✨</p>
            </GlassCard>
          </FadeIn>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100/50 px-4 py-3 z-50">
          <div className="max-w-md mx-auto flex justify-around">
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
            <Link href="/profile" className="flex flex-col items-center text-rose-500">
              <Star className="w-6 h-6 fill-current" />
              <span className="text-xs mt-1 font-medium">我的</span>
            </Link>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  )
}
