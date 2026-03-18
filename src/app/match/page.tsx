'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Share2, Eye, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui'
import { getCompatibilityEmoji, getCompatibilityLabel } from '@/lib/utils'

// 模拟匹配数据
const mockMatches = [
  {
    id: '1',
    nickname: '小雨',
    age: 26,
    city: '北京',
    occupation: '产品经理',
    education: '研究生',
    compatibility: 92,
    matchReasons: [
      '你们都重视家庭和真诚',
      '喜欢安静的周末，热爱旅行',
      '价值观高度契合',
      '都是猫奴🐱',
    ],
    sharedValues: ['家庭', '真诚', '成长'],
    sharedInterests: ['旅行', '摄影', '猫'],
    avatar: null,
    liked: false,
  },
  {
    id: '2',
    nickname: '阿杰',
    age: 28,
    city: '上海',
    occupation: '工程师',
    education: '本科',
    compatibility: 85,
    matchReasons: [
      '你们都喜欢户外运动',
      '重视工作和生活的平衡',
      '性格互补，可能产生化学反应',
    ],
    sharedValues: ['健康', '自由'],
    sharedInterests: ['运动', '旅行', '美食'],
    avatar: null,
    liked: false,
  },
  {
    id: '3',
    nickname: '小美',
    age: 25,
    city: '深圳',
    occupation: '设计师',
    education: '本科',
    compatibility: 78,
    matchReasons: [
      '你们都热爱艺术和创意',
      '喜欢探索新事物',
      '对未来有相似的规划',
    ],
    sharedValues: ['创造力', '成长'],
    sharedInterests: ['艺术', '音乐', '咖啡'],
    avatar: null,
    liked: true,
  },
]

export default function MatchPage() {
  const [matches, setMatches] = useState(mockMatches)
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  const handleLike = (matchId: string) => {
    setMatches(prev => prev.map(m => 
      m.id === matchId ? { ...m, liked: !m.liked } : m
    ))
  }

  const currentMatch = matches.find(m => m.id === selectedMatch)

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-romance-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-romance-500 text-white py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm">2024年3月18日 - 3月24日</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            💌 本周为你匹配了 {matches.length} 位心动对象
          </h1>
          <p className="text-white/80">
            点击查看详情，让缘分开始
          </p>
        </div>
      </div>

      {/* Matches List */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {matches.map((match, index) => (
          <div
            key={match.id}
            className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden card-hover"
          >
            {/* Avatar Area */}
            <div className="relative h-48 bg-gradient-to-br from-primary-100 to-romance-100">
              <div className="absolute inset-0 flex items-center justify-center">
                {match.liked ? (
                  <div className="w-32 h-32 bg-gradient-to-br from-primary-400 to-romance-400 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                    {match.nickname[0]}
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-gray-200 rounded-full blur-sm flex items-center justify-center text-gray-400">
                    <Eye className="w-12 h-12" />
                  </div>
                )}
              </div>
              
              {/* Compatibility Badge */}
              <div className="absolute top-4 right-4 bg-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
                <span className="text-2xl">{getCompatibilityEmoji(match.compatibility)}</span>
                <div>
                  <div className="text-xs text-gray-500">匹配度</div>
                  <div className="text-xl font-bold text-primary-600">{match.compatibility}%</div>
                </div>
              </div>

              {/* Like Status */}
              {match.liked && (
                <div className="absolute top-4 left-4 bg-primary-500 text-white rounded-full px-4 py-1.5 text-sm font-medium flex items-center gap-1">
                  <Heart className="w-4 h-4 fill-current" />
                  已喜欢
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {match.nickname}，{match.age}岁
                  </h3>
                  <p className="text-gray-500">{match.city} · {match.occupation}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">{match.education}</div>
                </div>
              </div>

              {/* Compatibility Label */}
              <div className="mb-4">
                <span className="inline-block bg-gradient-to-r from-primary-500 to-romance-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  {getCompatibilityLabel(match.compatibility)}
                </span>
              </div>

              {/* Match Reasons */}
              <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                <div className="text-sm text-gray-500 mb-2">💡 匹配理由</div>
                <ul className="space-y-1">
                  {match.matchReasons.slice(0, 2).map((reason, i) => (
                    <li key={i} className="text-gray-700 flex items-start gap-2">
                      <span className="text-primary-500 mt-0.5">✓</span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Shared Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {match.sharedValues.map(v => (
                  <span key={v} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
                    {v}
                  </span>
                ))}
                {match.sharedInterests.slice(0, 2).map(i => (
                  <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                    {i}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSelectedMatch(match.id)
                    setShowDetail(true)
                  }}
                >
                  查看详情
                </Button>
                <Button
                  variant={match.liked ? "secondary" : "primary"}
                  className="flex-1"
                  onClick={() => handleLike(match.id)}
                >
                  <Heart className={`w-5 h-5 mr-2 ${match.liked ? 'fill-current' : ''}`} />
                  {match.liked ? '已喜欢' : '喜欢'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {showDetail && currentMatch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="relative h-40 bg-gradient-to-br from-primary-400 to-romance-400">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-3xl font-bold text-primary-600">
                  {currentMatch.nickname[0]}
                </div>
              </div>
              <button
                onClick={() => setShowDetail(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">{currentMatch.nickname}</h3>
                <p className="text-gray-500">{currentMatch.age}岁 · {currentMatch.city}</p>
                <p className="text-gray-500">{currentMatch.occupation} · {currentMatch.education}</p>
              </div>

              {/* Compatibility */}
              <div className="bg-gradient-to-r from-primary-50 to-romance-50 rounded-2xl p-4 mb-6 text-center">
                <div className="text-4xl mb-2">{getCompatibilityEmoji(currentMatch.compatibility)}</div>
                <div className="text-3xl font-bold text-primary-600 mb-1">{currentMatch.compatibility}%</div>
                <div className="text-gray-600">{getCompatibilityLabel(currentMatch.compatibility)}</div>
              </div>

              {/* Match Reasons */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-800 mb-3">为什么你们很配？</h4>
                <ul className="space-y-2">
                  {currentMatch.matchReasons.map((reason, i) => (
                    <li key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="text-primary-500 text-lg">✓</span>
                      <span className="text-gray-700">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Shared Values */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-800 mb-3">共同的价值观</h4>
                <div className="flex flex-wrap gap-2">
                  {currentMatch.sharedValues.map(v => (
                    <span key={v} className="px-4 py-2 bg-primary-50 text-primary-700 rounded-full font-medium">
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              {/* Shared Interests */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-800 mb-3">共同的兴趣</h4>
                <div className="flex flex-wrap gap-2">
                  {currentMatch.sharedInterests.map(i => (
                    <span key={i} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full">
                      {i}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant={currentMatch.liked ? "secondary" : "primary"}
                  size="lg"
                  className="flex-1"
                  onClick={() => {
                    handleLike(currentMatch.id)
                    setShowDetail(false)
                  }}
                >
                  <Heart className={`w-5 h-5 mr-2 ${currentMatch.liked ? 'fill-current' : ''}`} />
                  {currentMatch.liked ? '已喜欢' : '心动了！'}
                </Button>
                <Button variant="outline" size="lg" className="flex-1">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  发消息
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3">
        <div className="max-w-md mx-auto flex justify-around">
          <button className="flex flex-col items-center text-gray-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-1">首页</span>
          </button>
          <button className="flex flex-col items-center text-primary-500">
            <Heart className="w-6 h-6 fill-current" />
            <span className="text-xs mt-1">匹配</span>
          </button>
          <button className="flex flex-col items-center text-gray-400">
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs mt-1">消息</span>
          </button>
          <button className="flex flex-col items-center text-gray-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs mt-1">我的</span>
          </button>
        </div>
      </div>
    </div>
  )
}
