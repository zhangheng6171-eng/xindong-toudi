'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Heart, Star, ArrowRight, Sparkles, Quote, MapPin, Briefcase } from 'lucide-react'
import { AnimatedBackground, GlassCard, GradientButton, GradientText, FadeIn, AnimatedCounter, StarRating } from '@/components/animated-background'

// 故事卡片
function StoryCard({ name, location, role, content, rating, date, avatarColor, delay }: {
  name: string
  location: string
  role: string
  content: string
  rating: number
  date: string
  avatarColor: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
    >
      <GlassCard className="p-6 h-full hover:scale-[1.02] transition-transform duration-300">
        {/* 引用图标 */}
        <div className="mb-4">
          <Quote className="w-8 h-8 text-rose-300" />
        </div>
        
        {/* 内容 */}
        <p className="text-gray-700 leading-relaxed mb-6 text-lg">
          "{content}"
        </p>
        
        {/* 用户信息 */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
              {name[0]}
            </div>
            <div>
              <div className="font-bold text-gray-900">{name}</div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="w-3.5 h-3.5" />
                {location}
                <span className="mx-1">·</span>
                <Briefcase className="w-3.5 h-3.5" />
                {role}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <StarRating rating={rating} size="sm" />
            <div className="text-xs text-gray-400 mt-1">{date}</div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

// 统计数据卡片
function StatCard({ value, suffix, label, color }: {
  value: number
  suffix: string
  label: string
  color: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
    >
      <GlassCard className="p-6 text-center">
        <div className={`text-4xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent mb-2`}>
          {value.toLocaleString()}{suffix}
        </div>
        <div className="text-gray-600">{label}</div>
      </GlassCard>
    </motion.div>
  )
}

export default function StoriesPage() {
  const stories = [
    { 
      name: 'Sarah', 
      location: '北京', 
      role: '研究生', 
      content: '遇到了我的未婚夫！66道问题让我们发现彼此太契合了，现在已经在一起一年多了！感谢心动投递让我们相遇。', 
      rating: 5,
      date: '2024年12月',
      avatarColor: 'from-rose-400 to-pink-400'
    },
    { 
      name: 'Mike', 
      location: '上海', 
      role: '工程师', 
      content: '每周只看到一个匹配，反而让我更珍惜。现在和匹配的女生聊得非常好，准备年底见家长了！', 
      rating: 5,
      date: '2024年11月',
      avatarColor: 'from-blue-400 to-cyan-400'
    },
    { 
      name: 'Lily', 
      location: '深圳', 
      role: '设计师', 
      content: '作为社恐，这个APP让我轻松很多。不用不停滑动，AI筛选真的很棒！现在有了稳定发展的对象。', 
      rating: 5,
      date: '2024年10月',
      avatarColor: 'from-purple-400 to-violet-400'
    },
    { 
      name: 'David', 
      location: '广州', 
      role: '产品经理', 
      content: '通过AI匹配，认识了一个价值观超级契合的人。我们在一起半年了，准备明年结婚！', 
      rating: 5,
      date: '2024年9月',
      avatarColor: 'from-green-400 to-emerald-400'
    },
    { 
      name: 'Emma', 
      location: '杭州', 
      role: '老师', 
      content: '心动投递的深度问卷让我感觉是认真的在帮我找伴侣，不是简单刷脸。遇到了理想型的他！', 
      rating: 5,
      date: '2024年8月',
      avatarColor: 'from-orange-400 to-amber-400'
    },
    { 
      name: 'James', 
      location: '成都', 
      role: '医生', 
      content: '工作很忙没时间滑动。每周匹配模式太适合我了，效率和质量都很满意！现在已经脱单了。', 
      rating: 5,
      date: '2024年7月',
      avatarColor: 'from-red-400 to-rose-400'
    },
  ]

  const stats = [
    { value: 128946, suffix: '', label: '注册用户' },
    { value: 89, suffix: '%', label: '成功率' },
    { value: 52341, suffix: '', label: '配对数' },
  ]

  return (
    <AnimatedBackground variant="dream" showFloatingHearts>
      {/* 导航 */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/30">
              <Heart className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <span className="text-xl font-bold">
              <GradientText>心动投递</GradientText>
            </span>
          </Link>
          <GradientButton size="sm">
            <span className="flex items-center gap-1">
              立即开始
              <ArrowRight className="w-4 h-4" />
            </span>
          </GradientButton>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-4 pt-16 pb-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 rounded-full text-rose-700 text-sm font-medium mb-6">
              <Heart className="w-4 h-4" fill="currentColor" />
              真实故事
            </span>
          </motion.div>
          
          <motion.h1 
            className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            用户故事
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            真实用户的真实心动，每一个故事都值得被聆听
          </motion.p>
        </div>
      </section>

      {/* 统计数据 */}
      <section className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-4">
            {stats.map((s, i) => (
              <StatCard key={i} {...s} color="from-rose-500 to-pink-500" />
            ))}
          </div>
        </div>
      </section>

      {/* 故事列表 */}
      <section className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((s, i) => (
              <StoryCard key={i} {...s} delay={(i % 3) * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* 更多故事 */}
      <section className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <GlassCard className="p-8 text-center bg-gradient-to-r from-rose-50 to-pink-50">
            <h3 className="text-xl font-bold text-gray-900 mb-3">更多故事正在发生...</h3>
            <p className="text-gray-600 mb-6">
              每天都有新的心动故事在上演，下一个主角可能就是
            </p>
            <GradientButton>
              <span className="flex items-center gap-2">
                加入心动投递
                <Sparkles className="w-5 h-5" />
              </span>
            </GradientButton>
          </GlassCard>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <GlassCard className="p-8 sm:p-12 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-rose-200/50 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-200/50 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative">
                <Heart className="w-16 h-16 mx-auto mb-6 text-rose-500" fill="currentColor" />
                <h2 className="text-3xl font-bold text-gray-900 mb-3">下一个故事</h2>
                <p className="text-gray-600 text-lg mb-8">
                  就是你的故事
                </p>
                <GradientButton size="lg">
                  <span className="flex items-center gap-2">
                    立即开始
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </GradientButton>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 border-t border-gray-100 bg-white/50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" fill="currentColor" />
            <span className="font-bold text-gray-900">心动投递</span>
          </div>
          <p className="text-sm text-gray-500">© 2024 心动投递 · 让心动有回响</p>
        </div>
      </footer>
    </AnimatedBackground>
  )
}
