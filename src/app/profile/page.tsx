'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Settings, Edit2, Heart, MessageCircle, Star, MapPin, Briefcase, GraduationCap, LogOut } from 'lucide-react'
import { 
  AnimatedBackground, 
  GlassCard, 
  GradientText, 
  AnimatedCounter,
  FadeIn,
  Tag
} from '@/components/animated-background'
import { AvatarUploader, PhotoGallery } from '@/components/image-uploader'
import { useAuth, defaultProfile, UserProfile } from '@/hooks/useAuth'

export default function ProfilePage() {
  const { currentUser, isLoading, getUserData, setUserData, logout } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [profile, setProfile] = useState<UserProfile>(defaultProfile)
  const [avatar, setAvatar] = useState<string | null>(null)
  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null, null])

  // 从用户专属存储加载数据
  useEffect(() => {
    setMounted(true)
    
    if (!isLoading && currentUser) {
      // 从 currentUser 获取最新的基本信息（数据库同步）
      const userProfile: UserProfile = {
        nickname: currentUser.nickname || '',
        age: currentUser.age || 25,
        gender: currentUser.gender || 'male',
        city: currentUser.city || '',
        occupation: '',
        education: '',
        height: 175,
        bio: '',
        interests: [],
        lookingFor: {
          minAge: 18,
          maxAge: 35,
          cities: currentUser.city ? [currentUser.city] : [],
          relationship: 'serious'
        }
      }
      
      // 合并 localStorage 中的用户编辑数据
      const savedProfile = getUserData<UserProfile>('profile', defaultProfile)
      if (savedProfile.nickname) {
        // 保留用户编辑的字段
        userProfile.bio = savedProfile.bio || ''
        userProfile.interests = savedProfile.interests || []
        userProfile.occupation = savedProfile.occupation || ''
        userProfile.education = savedProfile.education || ''
        userProfile.height = savedProfile.height || 175
        userProfile.lookingFor = savedProfile.lookingFor || userProfile.lookingFor
      }
      
      // 强制使用数据库的最新昵称、年龄、城市、性别
      setProfile(userProfile)
      
      // 保存到 localStorage
      localStorage.setItem(`xindong_profile_${currentUser.id}`, JSON.stringify(userProfile))
      
      // 加载头像 - 优先使用数据库中的头像
      const savedAvatar = localStorage.getItem(`xindong_avatar_${currentUser.id}`)
      if (currentUser.avatar) {
        // 数据库有头像，优先使用
        setAvatar(currentUser.avatar)
        // 同步到 localStorage
        localStorage.setItem(`xindong_avatar_${currentUser.id}`, currentUser.avatar)
      } else if (savedAvatar) {
        setAvatar(savedAvatar)
      }
      
      // 加载照片
      const savedPhotos = localStorage.getItem(`xindong_photos_${currentUser.id}`)
      if (savedPhotos) {
        try {
          setPhotos(JSON.parse(savedPhotos))
        } catch (e) {
          console.error('Failed to parse photos:', e)
        }
      }
    }
  }, [isLoading, currentUser, getUserData])

  // 保存头像到用户专属存储并同步到云端
  const handleAvatarChange = async (url: string | null) => {
    setAvatar(url)
    if (currentUser) {
      // 保存到 localStorage
      if (url) {
        localStorage.setItem(`xindong_avatar_${currentUser.id}`, url)
      } else {
        localStorage.removeItem(`xindong_avatar_${currentUser.id}`)
      }
      
      // 同步到云端
      try {
        await fetch('/api/users/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            updates: { avatar: url }
          })
        })
      } catch (e) {
        console.error('Failed to sync avatar to cloud:', e)
      }
    }
  }

  // 保存照片到用户专属存储并同步到云端
  const handlePhotosChange = async (newPhotos: (string | null)[]) => {
    setPhotos(newPhotos)
    if (currentUser) {
      // 保存到 localStorage
      localStorage.setItem(`xindong_photos_${currentUser.id}`, JSON.stringify(newPhotos))
      
      // 同步到云端（过滤掉 null 值）
      const validPhotos = newPhotos.filter(p => p !== null) as string[]
      try {
        await fetch('/api/users/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            updates: { photos: validPhotos }
          })
        })
      } catch (e) {
        console.error('Failed to sync photos to cloud:', e)
      }
    }
  }

  // 处理登出
  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      logout()
      window.location.href = '/'
    }
  }

  if (isLoading || !mounted) {
    return (
      <AnimatedBackground variant="romance" showFloatingHearts={true}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-rose-500">加载中...</div>
        </div>
      </AnimatedBackground>
    )
  }

  // 如果未登录，跳转到登录页
  if (!currentUser) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    return null
  }

  return (
    <AnimatedBackground variant="romance" showFloatingHearts={true}>
      <div className="min-h-screen pb-20">
        {/* Header with Gradient */}
        <div className="relative">
          {/* 渐变背景头部 */}
          <div className="bg-gradient-to-br from-rose-500 via-pink-500 to-purple-500 text-white">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-4 py-4">
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                title="退出登录"
              >
                <LogOut className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold">我的主页</h1>
              <Link href="/profile/edit" className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <Edit2 className="w-6 h-6" />
              </Link>
            </div>

            {/* Avatar & Info */}
            <div className="flex flex-col items-center pb-10 pt-4">
              <AvatarUploader
                value={avatar}
                onChange={handleAvatarChange}
                name={profile.nickname}
              />
              
              <h2 className="text-2xl font-bold mt-5 drop-shadow-md">{profile.nickname}，{profile.age}岁</h2>
              <p className="text-white/90 mt-1">{profile.city} · {profile.occupation}</p>
              
              {/* Stats with Animation */}
              <div className="flex gap-10 mt-5">
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    <AnimatedCounter end={12} duration={1.5} />
                  </div>
                  <div className="text-xs text-white/80 mt-1">匹配次数</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    <AnimatedCounter end={8} duration={1.5} />
                  </div>
                  <div className="text-xs text-white/80 mt-1">喜欢</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    <AnimatedCounter end={3} duration={1.5} />
                  </div>
                  <div className="text-xs text-white/80 mt-1">互相喜欢</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative curve */}
          <svg className="absolute bottom-0 left-0 right-0 w-full" viewBox="0 0 1440 60" fill="none" preserveAspectRatio="none">
            <path d="M0 60V30C240 50 480 10 720 30C960 50 1200 10 1440 30V60H0Z" fill="url(#curveGradient)" />
            <defs>
              <linearGradient id="curveGradient" x1="0" y1="0" x2="1440" y2="0">
                <stop offset="0%" stopColor="rgba(251,207,232,0.3)" />
                <stop offset="50%" stopColor="rgba(253,242,248,0.5)" />
                <stop offset="100%" stopColor="rgba(251,207,232,0.3)" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Photo Gallery */}
        <div className="px-4 -mt-2 relative z-10">
          <FadeIn delay={0.1}>
            <GlassCard className="p-4" hover={false}>
              <h3 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
                <span className="text-lg">📷</span>
                照片墙
                <span className="text-xs text-gray-400">
                  ({photos.filter(p => p !== null).length}/6)
                </span>
              </h3>
              <PhotoGallery
                photos={photos}
                onChange={handlePhotosChange}
                maxPhotos={6}
              />
            </GlassCard>
          </FadeIn>
        </div>

        {/* Info Cards */}
        <div className="px-4 py-4 space-y-4">
          {/* Basic Info */}
          <FadeIn delay={0.2}>
            <GlassCard className="p-5" hover={false}>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-rose-500" />
                  </div>
                  <span className="text-sm text-gray-600">{profile.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-pink-500" />
                  </div>
                  <span className="text-sm text-gray-600">{profile.occupation || '未填写'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-purple-500" />
                  </div>
                  <span className="text-sm text-gray-600">{profile.education || '未填写'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm">📏</span>
                  </div>
                  <span className="text-sm text-gray-600">{profile.height}cm</span>
                </div>
              </div>
            </GlassCard>
          </FadeIn>

          {/* Bio Card */}
          <FadeIn delay={0.3}>
            <GlassCard className="p-5" hover={false}>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-lg">✨</span>
                关于我
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {profile.bio || '还没有填写个人简介'}
              </p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {profile.interests.length > 0 ? (
                  profile.interests.map((tag) => (
                    <Tag key={tag} color="rose">
                      {tag}
                    </Tag>
                  ))
                ) : (
                  <span className="text-sm text-gray-400">还没有添加兴趣爱好</span>
                )}
              </div>
            </GlassCard>
          </FadeIn>

          {/* Preferences Card */}
          <FadeIn delay={0.4}>
            <GlassCard className="p-5" hover={false}>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-lg">💝</span>
                期待的TA
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2.5 border-b border-gray-100/50">
                  <span className="text-gray-500">年龄</span>
                  <span className="text-gray-800 font-medium">{profile.lookingFor.minAge}-{profile.lookingFor.maxAge}岁</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-gray-100/50">
                  <span className="text-gray-500">城市</span>
                  <span className="text-gray-800 font-medium">{profile.lookingFor.cities.join(' / ') || '不限'}</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-gray-100/50">
                  <span className="text-gray-500">学历</span>
                  <span className="text-gray-800 font-medium">本科及以上</span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-gray-500">关系类型</span>
                  <span className="text-gray-800 font-medium">
                    {profile.lookingFor.relationship === 'serious' ? '认真恋爱' : 
                     profile.lookingFor.relationship === 'casual' ? '轻松交往' : '随缘'}
                  </span>
                </div>
              </div>
            </GlassCard>
          </FadeIn>

          {/* Questionnaire Progress */}
          <FadeIn delay={0.5}>
            <GlassCard className="p-5" hover={false}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-800 flex items-center gap-2">
                  <span className="text-lg">📝</span>
                  问卷完成度
                </span>
                <GradientText className="text-xl font-bold">
                  0/66
                </GradientText>
              </div>
              <div className="w-full bg-gray-100/50 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: '0%' }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-3">完成更多问题，获得更精准的匹配 ✨</p>
            </GlassCard>
          </FadeIn>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100/50 px-4 py-3 z-50">
          <div className="max-w-md mx-auto flex justify-around">
            <Link href="/" className="flex flex-col items-center text-gray-400 hover:text-rose-500 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs mt-1">首页</span>
            </Link>
            <Link href="/match" className="flex flex-col items-center text-gray-400 hover:text-rose-500 transition-colors">
              <Heart className="w-6 h-6" />
              <span className="text-xs mt-1">匹配</span>
            </Link>
            <Link href="/chat" className="flex flex-col items-center text-gray-400 hover:text-rose-500 transition-colors">
              <MessageCircle className="w-6 h-6" />
              <span className="text-xs mt-1">消息</span>
            </Link>
            <Link href="/profile" className="flex flex-col items-center text-rose-500">
              <Star className="w-6 h-6 fill-current" />
              <span className="text-xs mt-1 font-medium">我的</span>
            </Link>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  )
}
