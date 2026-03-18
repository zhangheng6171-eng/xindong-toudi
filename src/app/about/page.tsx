import Link from 'next/link'
import { Heart, Target, Shield, MessageCircle, ArrowRight, Lightbulb, Rocket, Globe } from 'lucide-react'

export default function AboutPage() {
  const features = [
    { icon: Target, title: '深度匹配算法', desc: '多维度分析性格、价值观、生活方式', color: 'from-rose-500 to-pink-500' },
    { icon: Shield, title: '隐私安全保障', desc: '严格身份认证，全方位保护信息', color: 'from-emerald-500 to-teal-500' },
    { icon: MessageCircle, title: '智能聊天引导', desc: 'AI推荐话题，让聊天不尴尬', color: 'from-purple-500 to-indigo-500' },
    { icon: Lightbulb, title: '每周精准匹配', desc: '拒绝海量选择，只推荐一位', color: 'from-orange-500 to-rose-500' },
  ]

  const stats = [
    { value: '128,946', label: '注册用户' },
    { value: '89%', label: '成功率' },
    { value: '52,341', label: '配对数' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-pink-50">
      {/* 导航 */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-rose-100">
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 rounded-full mb-6">
            <span className="text-sm text-rose-700 font-medium">关于我们</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            让爱情变得
            <span className="bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">更简单</span>
          </h1>
          <p className="text-gray-600 leading-relaxed">
            我们相信，每个人都值得拥有一个真正懂自己的人。用科技的力量，让爱情回归本质。
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 py-6">
        <div className="max-w-lg mx-auto">
          <div className="grid grid-cols-3 gap-3">
            {stats.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 text-center shadow-sm">
                <div className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                  {s.value}
                </div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="px-4 py-8">
        <div className="max-w-lg mx-auto">
          <div className="bg-gradient-to-br from-rose-100 to-pink-100 rounded-3xl p-8 text-center mb-8">
            <Heart className="w-14 h-14 mx-auto mb-4 text-rose-500" fill="currentColor" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">我们的使命</h2>
            <p className="text-gray-600">用AI连接两颗真正契合的心</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              不是缘分，是科学
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              真正的连接需要深度，需要时间，需要理解。
            </p>
            <div className="space-y-3">
              {['66道深度问卷，全面了解你', 'AI智能匹配，比你自己更懂你', '每周只匹配一位，珍惜相遇'].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-rose-50 rounded-xl">
                  <div className="w-7 h-7 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {i + 1}
                  </div>
                  <span className="text-gray-700 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-8 bg-white">
        <div className="max-w-lg mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">我们的优势</h2>
          <div className="space-y-3">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-rose-50 rounded-2xl">
                <div className={`w-12 h-12 bg-gradient-to-br ${f.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{f.title}</h3>
                  <p className="text-gray-500 text-sm">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="px-4 py-8">
        <div className="max-w-lg mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">我们的价值观</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Lightbulb, title: '真实' },
              { icon: Rocket, title: '高效' },
              { icon: Globe, title: '温暖' },
            ].map((v, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 text-center shadow-sm">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center">
                  <v.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900">{v.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-10">
        <div className="max-w-lg mx-auto">
          <div className="bg-gradient-to-br from-rose-500 to-pink-500 rounded-3xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-3">准备好了吗？</h2>
            <p className="text-white/90 mb-6">开启你的心动之旅</p>
            <Link 
              href="/register"
              className="block w-full py-4 bg-white text-rose-600 font-bold rounded-2xl"
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
