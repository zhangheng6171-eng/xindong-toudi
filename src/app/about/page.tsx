'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Heart, Target, Shield, MessageCircle, Lightbulb, Rocket, Globe, Users, Sparkles, ArrowRight, Check, Star } from 'lucide-react'
import { AnimatedBackground, GlassCard, GradientText, FadeIn, AnimatedCounter, StarRating } from '@/components/animated-background'

// 特性卡片
function FeatureCard({ icon: Icon, title, desc, color, delay }: {
  icon: any
  title: string
  desc: string
  color: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
    >
      <GlassCard className="p-6 h-full hover:scale-105 transition-transform duration-300">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{desc}</p>
      </GlassCard>
    </motion.div>
  )
}

// 价值观卡片
function ValueCard({ icon: Icon, title, desc, color }: {
  icon: any
  title: string
  desc: string
  color: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
    >
      <GlassCard className="p-8 text-center">
        <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-xl`}>
          <Icon className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{desc}</p>
      </GlassCard>
    </motion.div>
  )
}

// 时间线项
function TimelineItem({ year, title, desc, isLeft }: {
  year: string
  title: string
  desc: string
  isLeft: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className={`flex items-center gap-4 ${isLeft ? 'flex-row-reverse' : ''}`}
    >
      <div className="flex-1">
        <GlassCard className={`p-5 ${isLeft ? 'text-right' : 'text-left'}`}>
          <span className="text-rose-500 font-bold">{year}</span>
          <h4 className="font-bold text-gray-900 mt-1">{title}</h4>
          <p className="text-sm text-gray-600 mt-1">{desc}</p>
        </GlassCard>
      </div>
      <div className="w-4 h-4 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full shadow-lg shadow-rose-500/30 flex-shrink-0" />
      <div className="flex-1" />
    </motion.div>
  )
}

export default function AboutPage() {
  const features = [
    { icon: Target, title: '深度匹配算法', desc: '多维度分析性格、价值观、生活方式，找到真正契合的灵魂', color: 'from-rose-500 to-pink-500' },
    { icon: Shield, title: '隐私安全保障', desc: '严格身份认证，全方位保护个人信息，让你安心寻找真爱', color: 'from-emerald-500 to-teal-500' },
    { icon: MessageCircle, title: '智能聊天引导', desc: 'AI推荐话题，打破沉默，让聊天自然流畅不尴尬', color: 'from-purple-500 to-indigo-500' },
    { icon: Lightbulb, title: '每周精准匹配', desc: '拒绝海量选择的焦虑，每周只推荐一位最适合你的人', color: 'from-orange-500 to-rose-500' },
  ]

  const values = [
    { icon: Lightbulb, title: '真实', desc: '真诚是最好的策略', color: 'from-yellow-400 to-orange-500' },
    { icon: Rocket, title: '高效', desc: '用科学节省时间', color: 'from-blue-400 to-cyan-500' },
    { icon: Globe, title: '温暖', desc: '每次相遇都有温度', color: 'from-rose-400 to-pink-500' },
  ]

  const stats = [
    { value: 128946, label: '注册用户', suffix: '' },
    { value: 89, label: '成功率', suffix: '%' },
    { value: 52341, label: '配对数', suffix: '' },
  ]

  return (
    <AnimatedBackground variant="romance">
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
          <Link href="/register" className="inline-flex" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '10px 20px',
            borderRadius: '9999px',
            fontWeight: 600,
            fontSize: '14px',
            background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
            color: 'white',
            boxShadow: '0 4px 15px rgba(236, 72, 153, 0.3)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}>
            <span className="flex items-center gap-1">
              立即开始
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-4 pt-16 pb-12">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 rounded-full text-rose-700 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              关于我们
            </span>
          </motion.div>
          
          <motion.h1 
            className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            让爱情变得
            <GradientText className="text-5xl sm:text-6xl"> 更简单</GradientText>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            我们相信，每个人都值得拥有一个真正懂自己的人。
            <br />
            用科技的力量，让爱情回归本质。
          </motion.p>
        </div>
      </section>

      {/* 统计数据 */}
      <section className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard className="p-6 text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
                    <AnimatedCounter end={s.value} suffix={s.suffix} />
                  </div>
                  <div className="text-gray-500">{s.label}</div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 使命 */}
      <section className="px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <GlassCard className="p-8 sm:p-12 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-rose-200/50 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-200/50 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-rose-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-xl shadow-rose-500/30">
                  <Heart className="w-10 h-10 text-white" fill="currentColor" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">我们的使命</h2>
                <p className="text-xl text-gray-600 mb-8">用AI连接两颗真正契合的心</p>
                
                <div className="max-w-xl mx-auto text-left space-y-3">
                  {['66道深度问卷，全面了解你', 'AI智能匹配，比你自己更懂你', '每周只匹配一位，珍惜每次相遇'].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-white/50 rounded-xl">
                      <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                        {i + 1}
                      </div>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* 特性 */}
      <section className="px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-3">我们的优势</h2>
            <p className="text-gray-600">科技让爱情更简单</p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* 价值观 */}
      <section className="px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-3">我们的价值观</h2>
            <p className="text-gray-600">这些信念指引我们的每一步</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <ValueCard key={i} {...v} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <GlassCard className="p-8 sm:p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-purple-500/10" />
              
              <div className="relative">
                <Heart className="w-16 h-16 mx-auto mb-6 text-rose-500" fill="currentColor" />
                <h2 className="text-3xl font-bold text-gray-900 mb-3">准备好了吗？</h2>
                <p className="text-gray-600 text-lg mb-8">
                  开启你的心动之旅，下一个故事的主角就是你
                </p>
                <Link href="/register" className="inline-flex" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '20px 40px',
                  borderRadius: '9999px',
                  fontWeight: 600,
                  fontSize: '18px',
                  background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(236, 72, 153, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}>
                  <span className="flex items-center gap-2">
                    立即开始
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </Link>
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
