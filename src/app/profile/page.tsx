'use client'

import { useState } from 'react'
import { Settings, Edit2, Camera, Heart, MessageCircle, Star, MapPin, Briefcase, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'about' | 'preferences' | 'tags'>('about')

  const profile = {
    nickname: '小恒',
    age: 28,
    city: '北京',
    occupation: '产品经理',
    education: '硕士',
    height: '175cm',
    joinedDays: 92,
    bio: '热爱生活，喜欢旅行和摄影。周末喜欢探店、看书、撸猫。相信爱情，期待遇到三观契合的那个她。',
    tags: ['温柔', '上进', '顾家', '喜欢小孩', '爱运动'],
    questionnaireProgress: 66,
    stats: {
      totalMatches: 12,
      liked: 8,
      mutualLikes: 3,
    },
    photos: [
      null, null, null, // Placeholders
    ],
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-romance-500 text-white">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-4">
          <button className="p-2">
            <Settings className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">我的主页</h1>
          <button className="p-2">
            <Edit2 className="w-6 h-6" />
          </button>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center pb-8">
          <div className="relative">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl font-bold text-primary-500">
              {profile.nickname[0]}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Camera className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          
          <h2 className="text-2xl font-bold mt-4">{profile.nickname}，{profile.age}岁</h2>
          <p className="text-white/80">{profile.city} · {profile.occupation}</p>
          
          {/* Stats */}
          <div className="flex gap-8 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{profile.stats.totalMatches}</div>
              <div className="text-xs text-white/70">匹配次数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{profile.stats.liked}</div>
              <div className="text-xs text-white/70">喜欢</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{profile.stats.mutualLikes}</div>
              <div className="text-xs text-white/70">互相喜欢</div>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Gallery */}
      <div className="px-4 -mt-6">
        <div className="flex gap-3 overflow-x-auto pb-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center"
            >
              {i <= profile.photos.length ? (
                <span className="text-3xl">📷</span>
              ) : (
                <Camera className="w-8 h-8 text-gray-300" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Info Cards */}
      <div className="px-4 py-4 space-y-4">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{profile.city}</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{profile.occupation}</span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{profile.education}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">身高</span>
              <span className="text-sm text-gray-600">{profile.height}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-2xl p-1 shadow-sm">
          {(['about', 'preferences', 'tags'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-500'
              }`}
            >
              {tab === 'about' ? '关于我' : tab === 'preferences' ? '期待的TA' : '我的特质'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          {activeTab === 'about' && (
            <div>
              <h3 className="font-medium text-gray-800 mb-2">关于我</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {profile.bio}
              </p>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">年龄</span>
                <span className="text-gray-800 font-medium">24-32岁</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">城市</span>
                <span className="text-gray-800 font-medium">北京 / 上海</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">学历</span>
                <span className="text-gray-800 font-medium">本科及以上</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500">性格</span>
                <span className="text-gray-800 font-medium">开朗、善良</span>
              </div>
            </div>
          )}

          {activeTab === 'tags' && (
            <div className="flex flex-wrap gap-2">
              {profile.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 bg-gradient-to-r from-primary-50 to-romance-50 text-primary-700 rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
              <button className="px-4 py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-full text-sm">
                + 添加
              </button>
            </div>
          )}
        </div>

        {/* Questionnaire Progress */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-800">问卷完成度</span>
            <span className="text-primary-600 font-bold">{profile.questionnaireProgress}/66</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary-500 to-romance-500 h-2 rounded-full"
              style={{ width: `${profile.questionnaireProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">完成更多问题，获得更精准的匹配</p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3">
        <div className="max-w-md mx-auto flex justify-around">
          <button className="flex flex-col items-center text-gray-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-1">首页</span>
          </button>
          <button className="flex flex-col items-center text-gray-400">
            <Heart className="w-6 h-6" />
            <span className="text-xs mt-1">匹配</span>
          </button>
          <button className="flex flex-col items-center text-gray-400">
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs mt-1">消息</span>
          </button>
          <button className="flex flex-col items-center text-primary-500">
            <Star className="w-6 h-6 fill-current" />
            <span className="text-xs mt-1">我的</span>
          </button>
        </div>
      </div>
    </div>
  )
}
