import Link from 'next/link'
import { Heart, Users, Target, Clock, MessageCircle, ArrowRight, Check } from 'lucide-react'

export default function HowItWorksPage() {
  const steps = [
    { icon: Users, title: '注册账号', desc: '手机号快速注册，开启心动之旅', details: ['手机验证', '创建资料', '上传照片'], color: 'from-rose-500 to-pink-500' },
    { icon: Target, title: '填写问卷', desc: '66道深度问题，让AI了解你', details: ['人格测评', '风格分析', '价值观匹配'], color: 'from-purple-500 to-indigo-500' },
    { icon: Clock, title: '等待匹配', desc: '每周二晚，AI为你匹配', details: ['智能算法', '多维分析', '性格互补'], color: 'from-orange-500 to-rose-500' },
    { icon: MessageCircle, title: '认识新朋友', desc: '查看匹配理由，开启故事', details: ['匹配详解', '话题推荐', '破冰引导'], color: 'from-emerald-500 to-teal-500' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-rose-50">
      {/* 导航 */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-purple-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">心动投递</span>
          </Link>
          <Link href="/register" className="px-5 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-semibold rounded-full">
            立即开始
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-4 pt-10 pb-8">
        <div className="max-w-lg mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-6">
            <span className="text-sm text-purple-700 font-medium">简单四步</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            工作原理
          </h1>
          <p className="text-gray-600">四步找到你的缘分</p>
        </div>
      </section>

      {/* Steps */}
      <section className="px-4 pb-8">
        <div className="max-w-lg mx-auto space-y-4">
          {steps.map((step, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <step.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">0{i + 1}</span>
                    <h2 className="text-lg font-bold text-gray-900">{step.title}</h2>
                  </div>
                  <p className="text-sm text-gray-500">{step.desc}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {step.details.map((d, j) => (
                  <span key={j} className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-10">
        <div className="max-w-lg mx-auto">
          <div className="bg-gradient-to-br from-purple-500 to-rose-500 rounded-3xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-3">准备好了吗？</h2>
            <p className="text-white/90 mb-6">开启心动之旅</p>
            <Link 
              href="/register"
              className="block w-full py-4 bg-white text-purple-600 font-bold rounded-2xl"
            >
              立即开始
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-6 bg-gray-900 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart className="w-4 h-4 text-rose-500" fill="currentColor" />
          <span className="text-white font-semibold">心动投递</span>
        </div>
        <p className="text-xs text-gray-500">© 2024 心动投递</p>
      </footer>
    </div>
  )
}
