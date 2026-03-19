'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Heart, Users, Target, Clock, MessageCircle, ArrowRight, Check, Sparkles, Zap, Brain, Shield, HeartHandshake } from 'lucide-react'
import { AnimatedBackground, GlassCard, GradientText, FadeIn, Tag } from '@/components/animated-background'

// 步骤卡片
function StepCard({ number, icon: Icon, title, desc, details, color, delay }: {
  number: string
  icon: any
  title: string
  desc: string
  details: string[]
  color: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="relative"
    >
      {/* 连接线 */}
      <div className="hidden lg:block absolute left-1/2 top-32 -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-transparent via-rose-300 to-transparent" />
      
      <GlassCard className="p-8 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
        {/* 背景装饰 */}
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${color} opacity-10 rounded-bl-full transition-opacity group-hover:opacity-20`} />
        
        <div className="flex flex-col items-center text-center">
          {/* 图标 */}
          <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${color} flex items-center justify-center mb-6 shadow-xl`}>
            <Icon className="w-10 h-10 text-white" />
          </div>
          
          {/* 步骤号 */}
          <span className="text-sm text-gray-400 font-medium mb-2">STEP {number}</span>
          
          {/* 标题 */}
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
          
          {/* 描述 */}
          <p className="text-gray-600 mb-6">{desc}</p>
          
          {/* 详情标签 */}
          <div className="flex flex-wrap justify-center gap-2">
            {details.map((d, i) => (
              <Tag key={i} color={color.includes('rose') ? 'rose' : color.includes('purple') ? 'purple' : color.includes('orange') ? 'orange' : 'blue'}>
                {d}
              </Tag>
            ))}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

// 算法特点卡片
function AlgorithmCard({ icon: Icon, title, desc, color }: {
  icon: any
  title: string
  desc: string
  color: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="flex items-start gap-4"
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
        <p className="text-sm text-gray-600">{desc}</p>
      </div>
    </motion.div>
  )
}

export default function HowItWorksPage() {
  const steps = [
    { 
      number: '01', 
      icon: Users, 
      title: '注册账号', 
      desc: '手机号快速注册，开启心动之旅', 
      details: ['手机验证', '创建资料', '上传照片'], 
      color: 'from-rose-500 to-pink-500' 
    },
    { 
      number: '02', 
      icon: Target, 
      title: '填写问卷', 
      desc: '66道深度问题，让AI了解你', 
      details: ['人格测评', '风格分析', '价值观匹配'], 
      color: 'from-purple-500 to-indigo-500' 
    },
    { 
      number: '03', 
      icon: Clock, 
      title: '等待匹配', 
      desc: '每周二晚，AI为你精准匹配', 
      details: ['智能算法', '多维分析', '性格互补'], 
      color: 'from-orange-500 to-rose-500' 
    },
    { 
      number: '04', 
      icon: MessageCircle, 
      title: '认识新朋友', 
      desc: '查看匹配理由，开启美好故事', 
      details: ['匹配详解', '话题推荐', '破冰引导'], 
      color: 'from-emerald-500 to-teal-500' 
    },
  ]

  const algorithms = [
    { icon: Brain, title: '深度学习', desc: '基于大五人格理论，精准分析性格特质', color: 'from-purple-500 to-indigo-500' },
    { icon: HeartHandshake, title: '价值观匹配', desc: '核心价值观一致性是长久关系的基础', color: 'from-rose-500 to-pink-500' },
    { icon: Zap, title: '行为优化', desc: '根据你的反馈持续优化匹配质量', color: 'from-orange-500 to-amber-500' },
    { icon: Shield, title: '隐私保护', desc: '你的数据只用于匹配，绝不出售', color: 'from-emerald-500 to-teal-500' },
  ]

  return (
    <AnimatedBackground variant="purple">
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
      <section className="px-4 pt-16 pb-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full text-purple-700 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              简单四步
            </span>
          </motion.div>
          
          <motion.h1 
            className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            工作原理
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            四步找到你的缘分，简单高效
          </motion.p>
        </div>
      </section>

      {/* 步骤 */}
      <section className="px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <StepCard key={i} {...step} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* 匹配算法 */}
      <section className="px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-3">AI匹配算法</h2>
            <p className="text-gray-600">基于科学的心理学原理，精准匹配灵魂伴侣</p>
          </motion.div>
          
          <GlassCard className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {algorithms.map((a, i) => (
                <AlgorithmCard key={i} {...a} />
              ))}
            </div>
            
            {/* 问卷说明 */}
            <div className="mt-8 pt-8 border-t border-gray-100">
              <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-purple-50 rounded-2xl p-6">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-rose-500" />
                  66道灵魂问卷
                </h4>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Check className="w-4 h-4 text-green-500" />
                    价值观核心 (30%)
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Check className="w-4 h-4 text-green-500" />
                    恋爱观 (20%)
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Check className="w-4 h-4 text-green-500" />
                    未来规划 (15%)
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Check className="w-4 h-4 text-green-500" />
                    生活方式 (15%)
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Check className="w-4 h-4 text-green-500" />
                    性格特质 (10%)
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Check className="w-4 h-4 text-green-500" />
                    兴趣爱好 (5%)
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* 为什么每周匹配 */}
      <section className="px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-3">为什么是每周匹配？</h2>
            <p className="text-gray-600">告别选择焦虑，珍惜每一次相遇</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: '减少选择焦虑', desc: '面对海量选择，人往往会陷入决策瘫痪。每周一位，让你专注了解一个人。', icon: '🎯' },
              { title: '提高匹配质量', desc: '慢下来，真正了解一个人，而不是快速滑过。', icon: '💎' },
              { title: '珍惜每次相遇', desc: '每周的期待感，让每次匹配都充满仪式感。', icon: '✨' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard className="p-6 text-center h-full">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
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
            <GlassCard className="p-8 sm:p-12 text-center relative overflow-hidden bg-gradient-to-br from-purple-500 to-rose-500 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative">
                <h2 className="text-3xl font-bold mb-3">准备好了吗？</h2>
                <p className="text-white/90 text-lg mb-8">
                  开启心动之旅，遇见对的人
                </p>
                <Link href="/register" className="inline-flex" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 32px',
                  borderRadius: '9999px',
                  fontWeight: 600,
                  fontSize: '16px',
                  background: 'white',
                  color: '#9333ea',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
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
