'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, MessageCircle, Star, MapPin, Briefcase, GraduationCap, Eye, Sparkles, TrendingUp } from 'lucide-react'
import { AnimatedBackground, GlassCard, GradientText, FadeIn } from '@/components/animated-background'
import { useAuth } from '@/hooks/useAuth'

// 模拟推荐用户数据
const recommendedUsers = [
  {
    id: '1',
    nickname: '小雨',
    age: 26,
    city: '北京',
    occupation: '产品设计师',
    education: '硕士',
    height: 165,
    bio: '热爱生活，喜欢摄影和旅行。周末喜欢探店、看展，期待遇见有趣的灵魂～',
    interests: ['摄影', '旅行', '美食', '艺术'],
    matchScore: 92,
    avatar: null,
  },
  {
    id: '2',
    nickname: '云云',
    age: 27,
    city: '上海',
    occupation: '市场经理',
    education: '本科',
    height: 168,
    bio: '喜欢健身和阅读，相信坚持的力量。希望找到一个一起成长的人。',
    interests: ['健身', '阅读', '投资', '电影'],
    matchScore: 88,
    avatar: null,
  },
  {
    id: '3',
    nickname: '小晴',
    age: 25,
    city: '北京',
    occupation: '教师',
    education: '硕士',
    height: 162,
    bio: '温柔善良，喜欢小孩和宠物。周末喜欢烘焙和追剧～',
    interests: ['烘焙', '宠物', '音乐', '旅行'],
    matchScore: 85,
    avatar: null,
  },
  {
    id: '4',
    nickname: '阿杰',
    age: 29,
    city: '深圳',
    occupation: '软件工程师',
    education: '硕士',
    height: 178,
    bio: '技术宅，但也喜欢户外运动。热爱编程，也热爱生活。',
    interests: ['编程', '跑步', '游戏', '科技'],
    matchScore: 82,
    avatar: null,
  },
]

// 用户卡片组件
function UserCard({ user, index }: { user: typeof recommendedUsers[0]; index: number }) {
  return (
    <FadeIn delay={index * 0.1}>
      <GlassCard className="p-5 hover:shadow-xl transition-all cursor-pointer group" hover={true}>
        <div className="flex items-start gap-4">
          {/* 头像 */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-rose-500/30">
              {user.nickname[0]}
            </div>
            {/* 匹配度标签 */}
            <div className="absolute -top-1 -right-1 px-2 py-0.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
              {user.matchScore}%
            </div>
          </div>
          
          {/* 信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-gray-900 text-lg">{user.nickname}</h3>
              <span className="text-sm text-gray-500">{user.age}岁</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {user.city}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" />
                {user.occupation}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{user.bio}</p>
            
            {/* 兴趣标签 */}
            <div className="flex flex-wrap gap-1.5">
              {user.interests.slice(0, 3).map((interest) => (
                <span key={interest} className="px-2 py-0.5 bg-rose-50 text-rose-600 text-xs font-medium rounded-full">{interest}</span>
              ))}
            </div>
          </div>
        </div>
        
        {/* 悬停操作 */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Eye className="w-4 h-4" />
            <span>查看完整资料</span>
          </div>
          <button className="px-4 py-1.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-medium rounded-full hover:shadow-lg transition-all">
            <Heart className="w-4 h-4 inline mr-1" />
            喜欢
          </button>
        </div>
      </GlassCard>
    </FadeIn>
  )
}

// 已登录用户的首页
function LoggedInHome() {
  const { currentUser } = useAuth()
  
  return (
    <AnimatedBackground variant="purple" showFloatingHearts={true}>
      <div className="min-h-screen pb-20">
        {/* 顶部导航栏 */}
        <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/50">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" fill="white" />
                </div>
                <span className="font-bold text-lg">
                  <GradientText>心动投递</GradientText>
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <Link href="/match" className="text-sm text-gray-600 hover:text-rose-500 transition-colors">
                  我的匹配
                </Link>
                <Link href="/dashboard" className="text-sm font-medium text-rose-500">
                  我的主页
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* 欢迎横幅 */}
          <FadeIn delay={0}>
            <div className="relative overflow-hidden rounded-3xl mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500" />
              <div className="relative p-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="w-6 h-6" />
                  <h2 className="text-xl font-bold">发现你的心动匹配</h2>
                </div>
                <p className="text-white/90 mb-4">
                  基于 AI 算法，为你推荐最合适的潜在伴侣
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" />
                    <span>已为你推荐 24 人</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4" />
                    <span>3 人互相喜欢</span>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* 推荐用户列表 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">今日推荐</h3>
              <button className="text-sm text-rose-500 font-medium hover:underline">
                查看更多
              </button>
            </div>
            
            <div className="grid gap-4">
              {recommendedUsers.map((user, index) => (
                <UserCard key={user.id} user={user} index={index} />
              ))}
            </div>
          </div>
        </div>

        {/* 底部导航 */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100/50 px-4 py-3 z-50">
          <div className="max-w-md mx-auto flex justify-around">
            <Link href="/" className="flex flex-col items-center text-rose-500">
              <Heart className="w-6 h-6 fill-current" />
              <span className="text-xs mt-1 font-medium">首页</span>
            </Link>
            <Link href="/match" className="flex flex-col items-center text-gray-400 hover:text-rose-500 transition-colors">
              <Heart className="w-6 h-6" />
              <span className="text-xs mt-1">匹配</span>
            </Link>
            <Link href="/chat" className="flex flex-col items-center text-gray-400 hover:text-rose-500 transition-colors">
              <MessageCircle className="w-6 h-6" />
              <span className="text-xs mt-1">消息</span>
            </Link>
            <Link href="/dashboard" className="flex flex-col items-center text-gray-400 hover:text-rose-500 transition-colors">
              <Star className="w-6 h-6" />
              <span className="text-xs mt-1">我的</span>
            </Link>
          </div>
        </nav>
      </div>
    </AnimatedBackground>
  )
}

// 未登录用户的首页（营销页）
function LandingPage() {
  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(180deg, #fff1f2 0%, #ffffff 30%, #fce7f3 70%, #fdf2f8 100%)',
    }}>
      {/* 背景装饰 */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none z-0" style={{
        background: 'radial-gradient(circle, rgba(251, 113, 133, 0.2) 0%, transparent 70%)',
      }} />
      <div className="fixed bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full pointer-events-none z-0" style={{
        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
      }} />

      {/* 导航栏 */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-rose-200/10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/30">
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
              心动投递
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-600 font-medium hover:text-gray-900 transition-colors">
              登录
            </Link>
            <Link 
              href="/register" 
              className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-full shadow-lg shadow-rose-500/30 hover:shadow-xl transition-all"
            >
              立即开始
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero 区域 */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 pt-16 pb-20 text-center">
        {/* 标签 */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 rounded-full shadow-sm mb-6">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-gray-600">已有 10,000+ 用户找到真爱</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          用<span className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 bg-clip-text text-transparent"> AI 算法</span>
          <br />
          找到那个懂你的人
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          基于 66 道灵魂问卷，深度分析你的性格特质
          <br />
          每周为你精准匹配最合适的潜在伴侣
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link 
            href="/register"
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-lg rounded-full shadow-xl shadow-rose-500/40 hover:shadow-2xl hover:scale-105 transition-all"
          >
            开始心动之旅
            <Sparkles className="inline w-5 h-5 ml-2" />
          </Link>
          <Link 
            href="/how-it-works"
            className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 font-medium text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            了解更多
          </Link>
        </div>

        {/* 统计数据 */}
        <div className="flex justify-center gap-8 md:gap-16">
          {[
            { value: '10万+', label: '成功匹配' },
            { value: '92%', label: '满意度' },
            { value: '66', label: '灵魂问题' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 特性区域 */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          为什么选择<span className="bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">心动投递</span>？
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: '🎯',
              title: '科学匹配',
              desc: '基于大五人格理论，深度分析你的性格特质，找到真正契合的另一半',
              gradient: 'from-rose-400 to-pink-500',
            },
            {
              icon: '⏰',
              title: '每周匹配',
              desc: '每周三推送新匹配，给你充足时间了解每一位推荐对象',
              gradient: 'from-orange-400 to-rose-500',
            },
            {
              icon: '🔒',
              title: '隐私安全',
              desc: '端到端加密，你的所有信息都受到严格保护，只有匹配对象可见',
              gradient: 'from-purple-400 to-violet-500',
            },
          ].map((feature, i) => (
            <div key={i} className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-lg`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 流程区域 */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          三步开启心动之旅
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              num: '1',
              title: '填写问卷',
              desc: '完成 66 道灵魂问题',
              tags: ['性格测试', '价值观', '生活习惯'],
            },
            {
              num: '2',
              title: '等待匹配',
              desc: 'AI 算法每周推荐',
              tags: ['精准匹配', '每周更新', '通知提醒'],
            },
            {
              num: '3',
              title: '开始互动',
              desc: '遇见心动的人',
              tags: ['匿名聊天', '互喜解锁', '真实身份'],
            },
          ].map((step, i) => (
            <div key={i} className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  {step.num}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{step.title}</h3>
                  <p className="text-sm text-gray-500">{step.desc}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {step.tags.map((tag, j) => (
                  <span key={j} className="px-3 py-1 bg-rose-50 text-rose-600 text-xs font-medium rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA 区域 */}
      <section className="relative z-10 max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 rounded-3xl p-8 md:p-12 text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            准备好遇见那个对的人了吗？
          </h2>
          <p className="text-white/90 mb-8">
            现在 registration，立即开启你的心动之旅
          </p>
          <Link 
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-rose-600 font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transition-all"
          >
            立即开始
            <Heart className="w-5 h-5" fill="currentColor" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>© 2024 心动投递 · 用 AI 算法，找到那个懂你的人</p>
        </div>
      </footer>
    </div>
  )
}

export default function HomePage() {
  const { currentUser, isLoading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="animate-pulse text-rose-500">加载中...</div>
      </div>
    )
  }

  // 根据登录状态显示不同的首页
  return currentUser ? <LoggedInHome /> : <LandingPage />
}
