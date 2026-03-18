'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, ArrowRight, Star, Users, Shield, 
  Target, Clock, Check, Sparkles, Zap,
  MessageCircle, HeartCrack, Eye
} from 'lucide-react'
import { AnimatedBackground, GlassCard, GradientButton, GradientText, FadeIn, AnimatedCounter, StarRating, PulseRing, Tag } from '@/components/animated-background'

// 动画变体
const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
}

// 漂浮的心形
function FloatingHeart({ delay, left, size }: { delay: number; left: string; size: number }) {
  return (
    <motion.div
      className="absolute text-rose-300/40"
      style={{ left, fontSize: size }}
      initial={{ y: '110vh', opacity: 0 }}
      animate={{ 
        y: -100,
        opacity: [0, 0.6, 0.6, 0],
        x: [0, 20, -20, 0],
        rotate: [0, 15, -15, 0]
      }}
      transition={{ 
        duration: 15, 
        delay, 
        repeat: Infinity,
        ease: "linear"
      }}
    >
      <Heart fill="currentColor" />
    </motion.div>
  )
}

// 特性卡片组件
function FeatureCard({ icon: Icon, title, description, color, delay }: {
  icon: any
  title: string
  description: string
  color: string
  delay: number
}) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
    >
      <GlassCard className="p-6 h-full">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </GlassCard>
    </motion.div>
  )
}

// 步骤组件
function StepCard({ number, title, description, details, color }: {
  number: string
  title: string
  description: string
  details: string[]
  color: string
}) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      className="relative"
    >
      {/* 连接线 */}
      <div className="hidden md:block absolute left-1/2 top-20 -translate-x-1/2 w-0.5 h-16 bg-gradient-to-b from-rose-300 to-transparent" />
      
      <GlassCard className="p-6 relative overflow-hidden">
        {/* 装饰 */}
        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${color} opacity-10 rounded-bl-full`} />
        
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
            <span className="text-white font-bold text-lg">{number}</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
            <p className="text-gray-600 text-sm mb-3">{description}</p>
            <div className="flex flex-wrap gap-2">
              {details.map((detail, i) => (
                <Tag key={i} color="rose">{detail}</Tag>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

// 用户评价卡片
function TestimonialCard({ name, location, content, rating, avatarColor }: {
  name: string
  location: string
  content: string
  rating: number
  avatarColor: string
}) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
    >
      <GlassCard className="p-6 h-full">
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
            {name[0]}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-900">{name}</h4>
            <p className="text-sm text-gray-500">{location}</p>
            <div className="mt-1">
              <StarRating rating={rating} />
            </div>
          </div>
        </div>
        <p className="text-gray-600 leading-relaxed">"{content}"</p>
      </GlassCard>
    </motion.div>
  )
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <AnimatedBackground variant="dream" showFloatingHearts>
      {/* 顶部导航 */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/30">
                <Heart className="w-5 h-5 text-white" fill="currentColor" />
              </div>
              <Sparkles className="w-3 h-3 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <span className="text-xl font-bold">
              <GradientText>心动投递</GradientText>
            </span>
          </Link>
          
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:block px-4 py-2 text-gray-600 hover:text-rose-500 font-medium transition-colors">
              登录
            </Link>
            <Link 
              href="/register" 
              className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-full shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 hover:scale-105 transition-all duration-300"
            >
              立即开始
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero 区域 */}
      <section className="relative px-4 pt-12 pb-16 sm:pt-20 sm:pb-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="text-center"
          >
            {/* 状态标签 */}
            <motion.div variants={fadeInUp} className="mb-6">
              <PulseRing>
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur rounded-full shadow-lg border border-rose-100">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-gray-700">
                    已有 <AnimatedCounter end={128946} /> 人找到爱情
                  </span>
                </div>
              </PulseRing>
            </motion.div>

            {/* 主标题 */}
            <motion.div variants={fadeInUp}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                找到那个让你
                <br />
                <GradientText className="text-5xl sm:text-6xl md:text-7xl">
                  心动的TA
                </GradientText>
              </h1>
            </motion.div>

            {/* 副标题 */}
            <motion.div variants={fadeInUp}>
              <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                不是随意的滑动，而是 <GradientText>深度灵魂</GradientText> 的契合。
                <br />
                用科学的方式，遇见真正对的人
              </p>
            </motion.div>

            {/* CTA 按钮 */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <GradientButton size="lg" className="w-full sm:w-auto">
                <span className="flex items-center gap-2">
                  开始心动之旅
                  <ArrowRight className="w-5 h-5" />
                </span>
              </GradientButton>
              <Link 
                href="/how-it-works"
                className="px-8 py-4 text-gray-600 hover:text-rose-500 font-medium transition-colors flex items-center gap-2"
              >
                <Eye className="w-5 h-5" />
                了解更多
              </Link>
            </motion.div>

            {/* 统计卡片 */}
            <motion.div variants={fadeInUp}>
              <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto">
                <GlassCard className="p-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" fill="currentColor" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                    <AnimatedCounter end={85} suffix="%" />
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500">成功率</div>
                </GlassCard>
                <GlassCard className="p-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">66</div>
                  <div className="text-xs sm:text-sm text-gray-500">道问题</div>
                </GlassCard>
                <GlassCard className="p-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-orange-400 to-rose-500 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">每周</div>
                  <div className="text-xs sm:text-sm text-gray-500">一匹配</div>
                </GlassCard>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 特性区域 */}
      <section className="px-4 py-16 sm:py-24 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              为什么选择 <GradientText>心动投递</GradientText>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              我们相信，真正的缘分来自深度了解，而非表面印象
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Target}
              title="深度匹配"
              description="66道精心设计的问题，从价值观到生活细节，AI全面分析你们契合度"
              color="from-rose-500 to-pink-500"
              delay={0}
            />
            <FeatureCard
              icon={Clock}
              title="慢节奏社交"
              description="每周只匹配一位，没有选择焦虑，珍惜每一次相遇的可能性"
              color="from-orange-500 to-rose-500"
              delay={1}
            />
            <FeatureCard
              icon={Shield}
              title="真实认证"
              description="严格身份验证系统，保护你的隐私，让你安心寻找真爱"
              color="from-emerald-500 to-teal-500"
              delay={2}
            />
            <FeatureCard
              icon={MessageCircle}
              title="AI聊天助手"
              description="智能推荐聊天话题，帮助你打破沉默，让对话自然流畅"
              color="from-purple-500 to-indigo-500"
              delay={3}
            />
            <FeatureCard
              icon={Heart}
              title="爱神模式"
              description="成为月老，撮合身边的朋友，成人之美，收获祝福"
              color="from-pink-500 to-rose-500"
              delay={4}
            />
            <FeatureCard
              icon={Eye}
              title="暗恋告白"
              description="如果有人暗恋你，系统会自动通知，双向暗恋自动匹配"
              color="from-violet-500 to-purple-500"
              delay={5}
            />
          </div>
        </div>
      </section>

      {/* 工作原理 */}
      <section className="px-4 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              简单四步，遇见缘分
            </h2>
            <p className="text-gray-600 text-lg">
              告别繁琐，拥抱简单的相遇方式
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            <StepCard
              number="01"
              title="注册账号"
              description="手机号快速注册，开启心动之旅"
              details={['手机验证', '创建资料', '上传照片']}
              color="from-rose-500 to-pink-500"
            />
            <StepCard
              number="02"
              title="填写问卷"
              description="66道深度问题，让AI真正了解你"
              details={['人格测评', '风格分析', '价值观匹配']}
              color="from-purple-500 to-indigo-500"
            />
            <StepCard
              number="03"
              title="等待匹配"
              description="每周二晚，AI为你精准匹配"
              details={['智能算法', '多维分析', '性格互补']}
              color="from-orange-500 to-rose-500"
            />
            <StepCard
              number="04"
              title="认识新朋友"
              description="查看匹配理由，开启美好故事"
              details={['匹配详解', '话题推荐', '破冰引导']}
              color="from-emerald-500 to-teal-500"
            />
          </div>
        </div>
      </section>

      {/* 用户评价 */}
      <section className="px-4 py-16 sm:py-24 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              真实用户的 <GradientText>心动故事</GradientText>
            </h2>
            <p className="text-gray-600 text-lg">
              已有 thousands 人找到属于他们的幸福
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <TestimonialCard
              name="Sarah"
              location="北京 · 研究生"
              content="遇到了我的未婚夫！66道问题让我们发现彼此太契合了，现在已经在一起一年多了！"
              rating={5}
              avatarColor="from-rose-400 to-pink-400"
            />
            <TestimonialCard
              name="Mike"
              location="上海 · 工程师"
              content="每周只看到一个匹配，反而让我更珍惜。现在和匹配的女生聊得非常好，准备见面了！"
              rating={5}
              avatarColor="from-blue-400 to-cyan-400"
            />
            <TestimonialCard
              name="Lily"
              location="深圳 · 设计师"
              content="作为社恐，这个APP让我轻松很多。不用不停滑动，AI筛选真的很棒！"
              rating={5}
              avatarColor="from-purple-400 to-violet-400"
            />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Link 
              href="/stories" 
              className="inline-flex items-center gap-2 text-rose-500 font-semibold hover:gap-3 transition-all"
            >
              查看更多故事
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA 区域 */}
      <section className="px-4 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto">
          <GlassCard className="p-8 sm:p-12 text-center relative overflow-hidden">
            {/* 装饰 */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-rose-200/50 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-200/50 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-rose-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-xl shadow-rose-500/30">
                <Heart className="w-10 h-10 text-white" fill="currentColor" />
              </div>
              
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                开始你的 <GradientText>心动之旅</GradientText>
              </h2>
              
              <p className="text-gray-600 text-lg mb-8 max-w-lg mx-auto">
                下一个转角，遇见对的人
                <br />
                <span className="text-sm">用一杯咖啡的时间，换取一生的幸福</span>
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <GradientButton size="lg">
                  <span className="flex items-center gap-2">
                    立即注册
                    <Zap className="w-5 h-5" />
                  </span>
                </GradientButton>
              </div>
              
              <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" /> 免费注册
                </span>
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" /> 隐私保护
                </span>
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" /> 真诚相交
                </span>
              </div>
            </motion.div>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-12 bg-gradient-to-b from-white to-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" fill="currentColor" />
              </div>
              <span className="text-xl font-bold text-gray-900">心动投递</span>
            </div>
            
            <div className="flex items-center gap-6 text-gray-600">
              <Link href="/about" className="hover:text-rose-500 transition-colors">关于我们</Link>
              <Link href="/how-it-works" className="hover:text-rose-500 transition-colors">匹配原理</Link>
              <Link href="/stories" className="hover:text-rose-500 transition-colors">用户故事</Link>
              <Link href="/login" className="hover:text-rose-500 transition-colors">登录</Link>
            </div>
            
            <p className="text-sm text-gray-400">© 2024 心动投递 · 让心动有回响</p>
          </div>
        </div>
      </footer>
    </AnimatedBackground>
  )
}
