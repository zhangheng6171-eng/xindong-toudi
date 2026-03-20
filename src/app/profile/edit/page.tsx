'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  User, Camera, Heart, MapPin, Briefcase, GraduationCap,
  ChevronRight, Sparkles, Save, X
} from 'lucide-react'
import { 
  AnimatedBackground, 
  GlassCard, 
  GradientButton, 
  GradientText,
  FadeIn
} from '@/components/animated-background'
import { AvatarUploader, PhotoGallery } from '@/components/image-uploader'
import { useAuth, defaultProfile, UserProfile } from '@/hooks/useAuth'

export default function EditProfilePage() {
  const router = useRouter()
  const { currentUser, isLoading, getUserData, setUserData } = useAuth()
  const [mounted, setMounted] = useState(false)
  
  const [profile, setProfile] = useState<UserProfile>(defaultProfile)
  const [avatar, setAvatar] = useState<string | null>(null)
  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null, null])
  const [activeSection, setActiveSection] = useState<string | null>(null)

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

  const handleSave = async () => {
    if (!currentUser) return
    
    // 保存用户资料到用户专属存储
    const profileKey = `xindong_profile_${currentUser.id}`
    localStorage.setItem(profileKey, JSON.stringify(profile))
    
    // 保存头像
    if (avatar) {
      localStorage.setItem(`xindong_avatar_${currentUser.id}`, avatar)
    } else {
      localStorage.removeItem(`xindong_avatar_${currentUser.id}`)
    }
    
    // 保存照片
    localStorage.setItem(`xindong_photos_${currentUser.id}`, JSON.stringify(photos))
    
    // 同步到云端
    try {
      const validPhotos = photos.filter(p => p !== null) as string[]
      
      // 更新 currentUser 对象
      const updatedUser = { 
        ...currentUser, 
        nickname: profile.nickname,
        age: profile.age,
        gender: profile.gender,
        city: profile.city,
        avatar: avatar 
      }
      localStorage.setItem('xindong_current_user', JSON.stringify(updatedUser))
      
      await fetch('/api/users/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          updates: {
            nickname: profile.nickname,
            age: profile.age,
            gender: profile.gender,
            city: profile.city,
            occupation: profile.occupation,
            education: profile.education,
            height: profile.height,
            bio: profile.bio,
            interests: profile.interests,
            lookingFor: profile.lookingFor,
            avatar: avatar,
            photos: validPhotos
          }
        })
      })
    } catch (e) {
      console.error('Failed to sync to cloud:', e)
    }
    
    console.log('Saving profile:', { profile, avatar, photos })
    // 保存成功后返回个人主页
    router.push('/profile')
  }

  const interestOptions = [
    '旅行', '美食', '摄影', '电影', '音乐', '阅读',
    '运动', '健身', '瑜伽', '骑行', '游泳', '滑雪',
    '游戏', '动漫', '绘画', '书法', '舞蹈', '烹饪',
    '投资', '创业', '科技', '汽车', '宠物', '园艺'
  ]

  if (isLoading || !mounted) {
    return (
      <AnimatedBackground variant="dream" showFloatingHearts={false}>
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
    <AnimatedBackground variant="dream" showFloatingHearts={false}>
      <div className="min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/50">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <button 
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">编辑资料</h1>
            <button 
              onClick={handleSave}
              className="flex items-center text-rose-500 font-medium hover:text-rose-600 px-3 py-1.5 hover:bg-rose-50 rounded-full transition-colors"
            >
              <Save className="w-4 h-4 mr-1" />
              保存
            </button>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          {/* 头像 */}
          <FadeIn delay={0}>
            <GlassCard className="p-6">
              <div className="flex items-center">
                <AvatarUploader
                  value={avatar}
                  onChange={setAvatar}
                  name={profile.nickname}
                />
                <div className="ml-6 flex-1">
                  <h2 className="text-xl font-bold text-gray-900">{profile.nickname}</h2>
                  <p className="text-gray-500">{profile.age}岁 · {profile.city}</p>
                  <p className="text-sm text-rose-500 mt-1">点击头像更换照片</p>
                </div>
              </div>
            </GlassCard>
          </FadeIn>

          {/* 照片墙 */}
          <FadeIn delay={0.05}>
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-rose-500" />
                  照片墙
                </h3>
                <span className="text-sm text-gray-500">
                  {photos.filter(p => p !== null).length}/6 张
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                上传更多生活照片，让匹配更了解真实的你
              </p>
              <PhotoGallery
                photos={photos}
                onChange={setPhotos}
                maxPhotos={6}
              />
            </GlassCard>
          </FadeIn>

          {/* 基本信息 */}
          <FadeIn delay={0.1}>
            <GlassCard className="overflow-hidden" hover={false}>
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/50 transition-colors"
                onClick={() => setActiveSection(activeSection === 'basic' ? null : 'basic')}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-rose-100 to-pink-100 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-rose-500" />
                  </div>
                  <span className="font-medium text-gray-900 ml-3">基本信息</span>
                </div>
                <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${activeSection === 'basic' ? 'rotate-90' : ''}`} />
              </div>

              {activeSection === 'basic' && (
                <motion.div 
                  className="px-4 pb-4 space-y-4"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-500 mb-1.5">昵称</label>
                      <input 
                        type="text"
                        value={profile.nickname}
                        onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 border border-gray-100 focus:border-rose-300 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1.5">年龄</label>
                      <input 
                        type="number"
                        value={profile.age}
                        onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2.5 bg-gray-50/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 border border-gray-100 focus:border-rose-300 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-500 mb-1.5">性别</label>
                      <select 
                        value={profile.gender}
                        onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 border border-gray-100 focus:border-rose-300 transition-all"
                      >
                        <option value="male">男</option>
                        <option value="female">女</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1.5">城市</label>
                      <div className="flex items-center px-4 py-2.5 bg-gray-50/50 rounded-xl border border-gray-100 focus-within:ring-2 focus-within:ring-rose-300 focus-within:border-rose-300 transition-all">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        <input 
                          type="text"
                          value={profile.city}
                          onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                          className="flex-1 bg-transparent focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-500 mb-1.5">职业</label>
                      <div className="flex items-center px-4 py-2.5 bg-gray-50/50 rounded-xl border border-gray-100 focus-within:ring-2 focus-within:ring-rose-300 focus-within:border-rose-300 transition-all">
                        <Briefcase className="w-4 h-4 text-gray-400 mr-2" />
                        <input 
                          type="text"
                          value={profile.occupation}
                          onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                          className="flex-1 bg-transparent focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1.5">学历</label>
                      <div className="flex items-center px-4 py-2.5 bg-gray-50/50 rounded-xl border border-gray-100 focus-within:ring-2 focus-within:ring-rose-300 focus-within:border-rose-300 transition-all">
                        <GraduationCap className="w-4 h-4 text-gray-400 mr-2" />
                        <input 
                          type="text"
                          value={profile.education}
                          onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                          className="flex-1 bg-transparent focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-500 mb-1.5">身高 (cm)</label>
                    <input 
                      type="number"
                      value={profile.height}
                      onChange={(e) => setProfile({ ...profile, height: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 bg-gray-50/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 border border-gray-100 focus:border-rose-300 transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </GlassCard>
          </FadeIn>

          {/* 个人简介 */}
          <FadeIn delay={0.2}>
            <GlassCard className="overflow-hidden" hover={false}>
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/50 transition-colors"
                onClick={() => setActiveSection(activeSection === 'bio' ? null : 'bio')}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-violet-100 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                  </div>
                  <span className="font-medium text-gray-900 ml-3">个人简介</span>
                </div>
                <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${activeSection === 'bio' ? 'rotate-90' : ''}`} />
              </div>

              {activeSection === 'bio' && (
                <motion.div 
                  className="px-4 pb-4"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <textarea 
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="写点有趣的自我介绍..."
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none border border-gray-100 focus:border-rose-300 transition-all"
                  />
                  <p className="text-xs text-gray-400 mt-2 text-right">
                    {profile.bio.length}/200
                  </p>
                </motion.div>
              )}
            </GlassCard>
          </FadeIn>

          {/* 兴趣爱好 */}
          <FadeIn delay={0.3}>
            <GlassCard className="overflow-hidden" hover={false}>
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/50 transition-colors"
                onClick={() => setActiveSection(activeSection === 'interests' ? null : 'interests')}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl flex items-center justify-center">
                    <Heart className="w-5 h-5 text-pink-500" />
                  </div>
                  <span className="font-medium text-gray-900 ml-3">兴趣爱好</span>
                  <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">已选 {profile.interests.length}/10</span>
                </div>
                <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${activeSection === 'interests' ? 'rotate-90' : ''}`} />
              </div>

              {activeSection === 'interests' && (
                <motion.div 
                  className="px-4 pb-4"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex flex-wrap gap-2">
                    {interestOptions.map((interest) => (
                      <button
                        key={interest}
                        onClick={() => {
                          if (profile.interests.includes(interest)) {
                            setProfile({ 
                              ...profile, 
                              interests: profile.interests.filter(i => i !== interest) 
                            })
                          } else if (profile.interests.length < 10) {
                            setProfile({ 
                              ...profile, 
                              interests: [...profile.interests, interest] 
                            })
                          }
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                          profile.interests.includes(interest)
                            ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30'
                            : 'bg-gray-100/50 text-gray-600 hover:bg-gray-200/50'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </GlassCard>
          </FadeIn>

          {/* 匹配偏好 */}
          <FadeIn delay={0.4}>
            <GlassCard className="overflow-hidden" hover={false}>
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/50 transition-colors"
                onClick={() => setActiveSection(activeSection === 'preferences' ? null : 'preferences')}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-rose-100 to-pink-100 rounded-xl flex items-center justify-center">
                    <Heart className="w-5 h-5 text-rose-500" />
                  </div>
                  <span className="font-medium text-gray-900 ml-3">匹配偏好</span>
                </div>
                <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${activeSection === 'preferences' ? 'rotate-90' : ''}`} />
              </div>

              {activeSection === 'preferences' && (
                <motion.div 
                  className="px-4 pb-4 space-y-4"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div>
                    <label className="block text-sm text-gray-500 mb-2">年龄范围</label>
                    <div className="flex items-center space-x-4">
                      <input 
                        type="number"
                        value={profile.lookingFor.minAge}
                        onChange={(e) => setProfile({ 
                          ...profile, 
                          lookingFor: { ...profile.lookingFor, minAge: parseInt(e.target.value) || 18 } 
                        })}
                        className="w-20 px-3 py-2.5 bg-gray-50/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 text-center border border-gray-100 focus:border-rose-300 transition-all"
                      />
                      <span className="text-gray-400">—</span>
                      <input 
                        type="number"
                        value={profile.lookingFor.maxAge}
                        onChange={(e) => setProfile({ 
                          ...profile, 
                          lookingFor: { ...profile.lookingFor, maxAge: parseInt(e.target.value) || 50 } 
                        })}
                        className="w-20 px-3 py-2.5 bg-gray-50/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 text-center border border-gray-100 focus:border-rose-300 transition-all"
                      />
                      <span className="text-gray-500">岁</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-500 mb-2">期望关系</label>
                    <div className="flex space-x-2">
                      {[
                        { value: 'serious', label: '认真恋爱' },
                        { value: 'casual', label: '轻松交往' },
                        { value: 'not_sure', label: '随缘' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setProfile({ 
                            ...profile, 
                            lookingFor: { ...profile.lookingFor, relationship: option.value } 
                          })}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                            profile.lookingFor.relationship === option.value
                              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30'
                              : 'bg-gray-100/50 text-gray-600 hover:bg-gray-200/50'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </GlassCard>
          </FadeIn>

          {/* 完成按钮 */}
          <FadeIn delay={0.5}>
            <GradientButton size="lg" onClick={handleSave} className="w-full">
              保存修改
            </GradientButton>
          </FadeIn>
        </div>
      </div>
    </AnimatedBackground>
  )
}
