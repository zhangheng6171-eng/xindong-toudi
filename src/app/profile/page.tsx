'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Settings, Edit2, Heart, MessageCircle, Star, MapPin, Briefcase, GraduationCap, LogOut, Bell } from 'lucide-react'
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
import { useUnreadMessages } from '@/hooks/useUnreadMessages'
import { useNotifications } from '@/hooks/useNotifications'
import { BottomNav } from '@/components/bottom-nav'

export default function ProfilePage() {
  const { currentUser, isLoading, getUserData, setUserData, logout } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [profile, setProfile] = useState<UserProfile>(defaultProfile)
  const [avatar, setAvatar] = useState<string | null>(null)
  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null, null])
  
  // 统计数据状态
  const [stats, setStats] = useState({
    matchCount: 0,      // 匹配次数
    likesCount: 0,     // 喜欢数
    mutualLikesCount: 0 // 互相喜欢数
  })
  const [questionnaireProgress, setQuestionnaireProgress] = useState(0) // 问卷完成度
  
  // 未读消息
  const { unreadInfo } = useUnreadMessages(currentUser?.id || null)
  
  // 应用通知
  const { unreadCount: notificationUnread } = useNotifications(currentUser?.id || null)

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

  // 从数据库获取统计数据
  useEffect(() => {
    if (!currentUser || !mounted) return

    const fetchStats = async () => {
      try {
        // 1. 获取 likes 表中当前用户喜欢的所有人
        const likesResponse = await fetch(
          `${SUPABASE}/rest/v1/likes?from_user_id=eq.${currentUser.id}&select=to_user_id`,
          {
            headers: {
              'apikey': KEY,
              'Authorization': `Bearer ${KEY}`
            }
          }
        )
        
        let myLikes: string[] = []
        if (likesResponse.ok) {
          const likesData = await likesResponse.json()
          myLikes = likesData.map((l: any) => l.to_user_id)
        }

        // 2. 获取喜欢当前用户的所有人
        const likedByResponse = await fetch(
          `${SUPABASE}/rest/v1/likes?to_user_id=eq.${currentUser.id}&select=from_user_id`,
          {
            headers: {
              'apikey': KEY,
              'Authorization': `Bearer ${KEY}`
            }
          }
        )

        let likedBy: string[] = []
        if (likedByResponse.ok) {
          const likedByData = await likedByResponse.json()
          likedBy = likedByData.map((l: any) => l.from_user_id)
        }

        // 3. 计算互相喜欢数（交集）
        const mutualLikes = myLikes.filter(id => likedBy.includes(id))

        setStats({
          likesCount: myLikes.length,
          mutualLikesCount: mutualLikes.length,
          matchCount: mutualLikes.length // 匹配数 = 互相喜欢数
        })

        // 4. 获取问卷完成度（从 localStorage 读取）
        try {
          const answers = localStorage.getItem('questionnaireAnswers')
          if (answers) {
            const parsed = JSON.parse(answers)
            const answeredCount = Object.keys(parsed).length
            const progress = Math.round((answeredCount / 66) * 100)
            setQuestionnaireProgress(progress)
          }
        } catch (e) {
          console.error('Failed to parse questionnaire answers:', e)
        }
      } catch (e) {
        console.error('Failed to fetch stats:', e)
      }
    }

    fetchStats()
  }, [currentUser, mounted])

  // Supabase 配置
  const SUPABASE = 'https://ntaqnyegiiwtzdyqjiwy.supabase.co'
  const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50YXFueWVnaWl3dHpkeXFqaXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTY4NzUsImV4cCI6MjA4OTQ5Mjg3NX0.4FEAb1Yd4xOwXz3LcfZ9iPG0ZZPbFd8dfry903c5lPc'
  
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
      
      // 更新 currentUser 对象中的 avatar
      const updatedUser = { ...currentUser, avatar: url }
      localStorage.setItem('xindong_current_user', JSON.stringify(updatedUser))
      
      // 直接同步到 Supabase
      try {
        const response = await fetch(`${SUPABASE}/rest/v1/users?id=eq.${currentUser.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': KEY,
            'Authorization': `Bearer ${KEY}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ avatar: url })
        })
        
        if (!response.ok) {
          console.error('Failed to sync avatar to Supabase:', await response.text())
        }
      } catch (e) {
        console.error('Failed to sync avatar to Supabase:', e)
      }
    }
  }

  // 保存照片到用户专属存储并同步到云端
  const handlePhotosChange = async (newPhotos: (string | null)[]) => {
    setPhotos(newPhotos)
    if (currentUser) {
      // 保存到 localStorage
      localStorage.setItem(`xindong_photos_${currentUser.id}`, JSON.stringify(newPhotos))
      
      // 直接同步到 Supabase（过滤掉 null 值）
      const validPhotos = newPhotos.filter(p => p !== null) as string[]
      try {
        await fetch(`${SUPABASE}/rest/v1/users?id=eq.${currentUser.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': KEY,
            'Authorization': `Bearer ${KEY}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ photos: validPhotos })
        })
      } catch (e) {
        console.error('Failed to sync photos to Supabase:', e)
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
              <div className="flex items-center gap-1">
                {/* 消息铃铛 - 显示消息+通知总数 */}
                <Link href="/chat" className="p-2 hover:bg-white/20 rounded-full transition-colors relative">
                  <Bell className="w-6 h-6" />
                  {(unreadInfo.total > 0 || notificationUnread > 0) && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-rose-500 rounded-full">
                      {unreadInfo.total + notificationUnread > 99 ? '99+' : unreadInfo.total + notificationUnread}
                    </span>
                  )}
                </Link>
                <Link href="/profile/edit" className="p-2 hover:bg-white/20 rounded-full transition-colors">
                  <Edit2 className="w-6 h-6" />
                </Link>
              </div>
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
                    <AnimatedCounter end={stats.matchCount} duration={1.5} />
                  </div>
                  <div className="text-xs text-white/80 mt-1">匹配次数</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    <AnimatedCounter end={stats.likesCount} duration={1.5} />
                  </div>
                  <div className="text-xs text-white/80 mt-1">喜欢</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    <AnimatedCounter end={stats.mutualLikesCount} duration={1.5} />
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
                  {questionnaireProgress}%
                </GradientText>
              </div>
              <div className="w-full bg-gray-100/50 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${questionnaireProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-3">完成更多问题，获得更精准的匹配 ✨</p>
            </GlassCard>
          </FadeIn>
        </div>

        {/* Bottom Navigation */}
        <BottomNav unreadCount={unreadInfo.total + notificationUnread} />
      </div>
    </AnimatedBackground>
  )
}
