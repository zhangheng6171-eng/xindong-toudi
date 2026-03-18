import Link from 'next/link'
import { Heart, Star, ArrowRight } from 'lucide-react'

export default function StoriesPage() {
  const stories = [
    { name: 'Sarah', location: '北京', role: '研究生', content: '遇到了我的未婚夫！66道问题让我们发现彼此太契合了，现在已经在一起一年了！', date: '2024年12月' },
    { name: 'Mike', location: '上海', role: '工程师', content: '每周只看到一个匹配，反而让我更珍惜。现在和匹配的女生聊得非常好！', date: '2024年11月' },
    { name: 'Lily', location: '深圳', role: '设计师', content: '作为社恐，这个APP让我轻松很多，不用不停滑动，AI筛选真的很棒！', date: '2024年10月' },
    { name: 'David', location: '广州', role: '产品经理', content: '通过AI匹配，认识了一个价值观超级契合的人。我们在一起半年了！', date: '2024年9月' },
    { name: 'Emma', location: '杭州', role: '老师', content: '心动投递的深度问卷让我感觉是认真的在帮我找伴侣，不是简单刷脸。', date: '2024年8月' },
    { name: 'James', location: '成都', role: '医生', content: '工作很忙没时间滑动。每周匹配模式太适合我了，效率和质量都很满意！', date: '2024年7月' },
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
      <section className="px-4 pt-10 pb-6">
        <div className="max-w-lg mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 rounded-full mb-6">
            <Heart className="w-4 h-4 text-rose-500" fill="currentColor" />
            <span className="text-sm text-rose-700 font-medium">真实故事</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            用户故事
          </h1>
          <p className="text-gray-600">真实用户的真实心动</p>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 py-4">
        <div className="max-w-lg mx-auto">
          <div className="grid grid-cols-3 gap-3">
            {stats.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 text-center shadow-sm">
                <div className="text-xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                  {s.value}
                </div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stories */}
      <section className="px-4 py-6">
        <div className="max-w-lg mx-auto space-y-4">
          {stories.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-gray-700 leading-relaxed mb-4">{s.content}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                    {s.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{s.name}</div>
                    <div className="text-xs text-gray-500">{s.location} · {s.role}</div>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {Array(5).fill(0).map((_, j) => (
                    <Star key={j} className="w-3 h-3 text-amber-400" fill="currentColor" />
                  ))}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                {s.date}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-10">
        <div className="max-w-lg mx-auto">
          <div className="bg-gradient-to-br from-rose-500 to-pink-500 rounded-3xl p-8 text-center text-white">
            <Heart className="w-10 h-10 mx-auto mb-4" fill="currentColor" />
            <h2 className="text-2xl font-bold mb-2">下一个故事</h2>
            <p className="text-white/90 mb-6">可能就是你的</p>
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
