'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Heart, ArrowRight, Star, Users, Shield, 
  Target, Clock, Check
} from 'lucide-react'

function Counter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    let current = 0
    const timer = setInterval(() => {
      current += Math.ceil(end / 40)
      if (current >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(current)
      }
    }, 50)
    return () => clearInterval(timer)
  }, [end])
  
  return <span>{count.toLocaleString()}{suffix}</span>
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-pink-50">
      {/* 顶部导航 - 移动端优化 */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-rose-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center shadow-sm">
              <Heart className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">心动投递</span>
          </Link>
          <Link 
            href="/register" 
            className="px-5 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-semibold rounded-full shadow-sm"
          >
            立即开始
          </Link>
        </div>
      </nav>

      {/* Hero - 移动端核心区域 */}
      <section className="px-4 pt-12 pb-8">
        <div className="max-w-lg mx-auto text-center">
          {/* 状态标签 */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-100 to-pink-100 rounded-full mb-6">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-rose-700 font-medium">
              已有 <span className="font-bold">128,946</span> 人找到爱情
            </span>
          </div>

          {/* 主标题 - 大字清晰 */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            找到让你
            <br />
            <span className="bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
              心动的那个TA
            </span>
          </h1>

          {/* 副标题 */}
          <p className="text-base text-gray-600 mb-8 leading-relaxed">
            不是缘分，是科学。每周只推荐一位真正适合你的人
          </p>

          {/* 主按钮 - 大触摸区域 */}
          <Link 
            href="/register"
            className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-lg font-semibold rounded-2xl shadow-lg shadow-rose-500/25 active:scale-95 transition-transform"
          >
            立即开始
            <ArrowRight className="w-5 h-5" />
          </Link>

          {/* 次要操作 */}
          <Link 
            href="/login"
            className="block mt-4 py-3 text-rose-600 font-medium"
          >
            已有账号？立即登录
          </Link>

          {/* 统计 - 三列网格 */}
          <div className="grid grid-cols-3 gap-3 mt-10">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-50">
              <Heart className="w-6 h-6 text-rose-500 mx-auto mb-2" fill="currentColor" />
              <div className="text-xl font-bold text-gray-900">
                <Counter end={85} suffix="%" />
              </div>
              <div className="text-xs text-gray-500">成功率</div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-50">
              <Target className="w-6 h-6 text-rose-500 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-900">66</div>
              <div className="text-xs text-gray-500">道问题</div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-50">
              <Clock className="w-6 h-6 text-rose-500 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-900">每周</div>
              <div className="text-xs text-gray-500">一匹配</div>
            </div>
          </div>
        </div>
      </section>

      {/* 特点 - 卡片式 */}
      <section className="px-4 py-10 bg-white">
        <div className="max-w-lg mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            为什么选择我们
          </h2>
          
          <div className="space-y-4">
            {[
              { icon: Target, title: '深度匹配', desc: '66道精心设计的问题，AI比你更懂你', color: 'from-rose-500 to-pink-500' },
              { icon: Clock, title: '慢节奏社交', desc: '每周只匹配一位，珍惜每次相遇', color: 'from-orange-500 to-rose-500' },
              { icon: Shield, title: '真实认证', desc: '严格身份认证，保护你的隐私', color: 'from-emerald-500 to-teal-500' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-5 bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl">
                <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 工作原理 - 步骤式 */}
      <section className="px-4 py-10">
        <div className="max-w-lg mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            简单四步
          </h2>
          
          <div className="relative pl-8 border-l-2 border-rose-200 space-y-6">
            {[
              { step: '01', title: '注册账号', desc: '手机号快速注册' },
              { step: '02', title: '填写问卷', desc: '66道深度问题' },
              { step: '03', title: '等待匹配', desc: '每周二晚更新' },
              { step: '04', title: '认识新朋友', desc: '开启美好故事' },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-10 w-6 h-6 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {i + 1}
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h3 className="font-bold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 用户评价 */}
      <section className="px-4 py-10 bg-gradient-to-b from-white to-rose-50">
        <div className="max-w-lg mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            真实故事
          </h2>
          
          <div className="space-y-4">
            {[
              { name: 'Sarah', location: '北京', content: '遇到了我的未婚夫！66道问题让我们发现彼此太契合了！', rating: 5 },
              { name: 'Mike', location: '上海', content: '每周只看到一个匹配，反而让我更珍惜。现在聊得非常好！', rating: 5 },
              { name: 'Lily', location: '深圳', content: '作为社恐，这个APP让我轻松很多，AI筛选真的很棒！', rating: 5 },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-rose-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{t.name}</div>
                    <div className="text-sm text-gray-500">{t.location}</div>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {Array(t.rating).fill(0).map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-amber-400" fill="currentColor" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed">{t.content}</p>
              </div>
            ))}
          </div>
          
          <Link 
            href="/stories" 
            className="block mt-6 text-center text-rose-600 font-medium"
          >
            查看更多故事 →
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-12">
        <div className="max-w-lg mx-auto">
          <div className="bg-gradient-to-br from-rose-500 to-pink-500 rounded-3xl p-8 text-center text-white shadow-xl">
            <Heart className="w-12 h-12 mx-auto mb-4" fill="currentColor" />
            <h2 className="text-2xl font-bold mb-3">
              开始心动之旅
            </h2>
            <p className="text-white/90 mb-6">
              下一个转角，遇见对的人
            </p>
            <Link 
              href="/register"
              className="block w-full py-4 bg-white text-rose-600 font-bold text-lg rounded-2xl shadow-lg active:scale-95 transition-transform"
            >
              立即注册
            </Link>
            <div className="flex justify-center gap-6 mt-6 text-sm text-white/80">
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4" /> 免费注册
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4" /> 隐私保护
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 bg-gray-900 text-gray-400">
        <div className="max-w-lg mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" fill="currentColor" />
            </div>
            <span className="text-lg font-bold text-white">心动投递</span>
          </div>
          <div className="flex justify-center gap-6 mb-4 text-sm">
            <Link href="/about" className="hover:text-white">关于</Link>
            <Link href="/how-it-works" className="hover:text-white">原理</Link>
            <Link href="/stories" className="hover:text-white">故事</Link>
          </div>
          <p className="text-xs text-gray-600">© 2024 心动投递</p>
        </div>
      </footer>
    </div>
  )
}
