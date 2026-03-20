'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, MessageCircle, Star, MapPin, Briefcase, GraduationCap, Eye, Sparkles, TrendingUp, X, Camera, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AnimatedBackground, GlassCard, GradientText, FadeIn } from '@/components/animated-background'
import { useAuth } from '@/hooks/useAuth'
import { UserCardSkeleton, EmptyState } from '@/components/skeleton'

// 用户数据类型（从 API 返回）
interface ApiUser {
  id: string
  nickname: string
  age: number
  gender: string
  city: string
  occupation: string
  education: string
  height: number
  bio: string
  interests: string[]
  avatar: string | null
  photos: string[]
  createdAt: string
}

// 显示用户类型
interface DisplayUser {
  id: string
  nickname: string
  age: number
  gender: string
  city: string
  occupation: string
  education: string
  height: number
  bio: string
  interests: string[]
  avatar: string | null
  photos: (string | null)[]
  matchScore: number
  isLiked: boolean
  isMutualLike: boolean
}

// 用户卡片组件
function UserCard({ user, index, onViewDetail, onLike, showIncompleteTag }: { 
  user: DisplayUser; 
  index: number; 
  onViewDetail: (user: DisplayUser) => void; 
  onLike: (userId: string) => void;
  showIncompleteTag?: boolean;
}) {
  return (
    <FadeIn delay={index * 0.1}>
      <GlassCard className="p-5 hover:shadow-xl transition-all cursor-pointer group" hover={true}>
        <div className="flex items-start gap-4">
          {/* 头像 */}
          <div className="relative flex-shrink-0">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.nickname}
                className="w-16 h-16 rounded-2xl object-cover shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-rose-500/30">
                {user.nickname[0]}
              </div>
            )}
            {/* 匹配度标签 */}
            <div className="absolute -top-1 -right-1 px-2 py-0.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
              {user.matchScore}%
            </div>
          </div>

          {/* 信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-lg">{user.nickname}</h3>
                {/* 资料待完善标签 */}
                {showIncompleteTag && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-xs font-medium rounded-full">
                    资料待完善
                  </span>
                )}
                <span className="text-sm text-gray-400">·</span>
                <span className="text-sm text-gray-500">{user.age}岁</span>
                <span className="text-sm text-gray-400">·</span>
                <span className={`text-sm font-medium ${user.gender === 'male' ? 'text-blue-500' : 'text-pink-500'}`}>
                  {user.gender === 'male' ? '♂ 男' : '♀ 女'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {user.city}
              </span>
              {user.occupation && (
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" />
                  {user.occupation}
                </span>
              )}
            </div>

            {user.bio && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{user.bio}</p>
            )}

            {/* 兴趣标签 */}
            {user.interests.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {user.interests.slice(0, 3).map((interest) => (
                  <span key={interest} className="px-2 py-0.5 bg-rose-50 text-rose-600 text-xs font-medium rounded-full">
                    {interest}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 悬停操作 */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.preventDefault()
              onViewDetail(user)
            }}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-rose-500 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>查看完整资料</span>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault()
              onLike(user.id)
            }}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
              user.isLiked
                ? 'bg-rose-100 text-rose-600 border-2 border-rose-500'
                : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:shadow-lg'
            }`}
          >
            <Heart className={`w-4 h-4 inline mr-1 ${user.isLiked ? 'fill-current' : ''}`} />
            {user.isLiked ? '已喜欢' : '喜欢'}
          </button>
        </div>
      </GlassCard>
    </FadeIn>
  )
}

// 提示弹窗
function AlertModal({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-rose-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">温馨提示</h3>
        <p className="text-gray-600 mb-6 whitespace-pre-line">{message}</p>
        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-medium rounded-full hover:shadow-lg transition-all"
        >
          我知道了
        </button>
      </motion.div>
    </motion.div>
  )
}

// 用户详情弹窗
function UserDetailModal({ user, onClose, onLike, onSendMessage, isLoading }: {
  user: DisplayUser;
  onClose: () => void;
  onLike: (userId: string) => void;
  onSendMessage: (user: DisplayUser) => void;
  isLoading?: boolean;
}) {
  // 过滤出真实照片
  const realPhotos = (user.photos || []).filter((p: string | null) => p !== null && p !== '')

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
      >
        {/* 头部背景 */}
        <div className="relative h-40 bg-gradient-to-br from-rose-400 via-pink-400 to-purple-400">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute -bottom-12 left-6">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.nickname}
                className="w-24 h-24 rounded-2xl object-cover shadow-xl border-4 border-white"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-4xl font-bold shadow-xl border-4 border-white">
                {user.nickname[0]}
              </div>
            )}
          </div>
        </div>

        {/* 内容 */}
        <div className="pt-16 px-6 pb-6">
          {/* 基本信息 */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{user.nickname}</h2>
              <span className={`text-lg font-medium ${user.gender === 'male' ? 'text-blue-500' : 'text-pink-500'}`}>
                {user.gender === 'male' ? '♂' : '♀'}
              </span>
            </div>
            <p className="text-gray-500">{user.age}岁 · {user.city}</p>
            <div className="flex items-center justify-center gap-4 mt-2 text-sm text-gray-500">
              {user.occupation && (
                <span className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  {user.occupation}
                </span>
              )}
              {user.education && (
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-4 h-4" />
                  {user.education}
                </span>
              )}
              {user.height > 0 && (
                <span>{user.height}cm</span>
              )}
            </div>
          </div>

          {/* 匹配度 */}
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-4 mb-6 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
              {user.matchScore}%
            </div>
            <div className="text-gray-600 text-sm">匹配度</div>
          </div>

          {/* 照片墙 */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Camera className="w-4 h-4" />
              照片墙 {realPhotos.length > 0 && `(${realPhotos.length}张)`}
            </h3>
            {realPhotos.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {realPhotos.map((photo, index) => (
                  <motion.div 
                    key={index} 
                    className="aspect-square rounded-xl overflow-hidden bg-gray-100"
                    whileHover={{ scale: 1.02 }}
                  >
                    {photo && (
                      <img
                        src={photo}
                        alt={`${user.nickname}的照片${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" fill="%239ca3af" font-size="10" dy=".3em"%3E加载失败%3C/text%3E%3C/svg%3E'
                        }}
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <Camera className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-gray-400 text-sm">暂无照片</p>
              </div>
            )}
          </div>

          {/* 个人简介 */}
          {user.bio && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-2">关于我</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{user.bio}</p>
            </div>
          )}

          {/* 兴趣爱好 */}
          {user.interests.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-2">兴趣爱好</h3>
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest) => (
                  <span key={interest} className="px-3 py-1.5 bg-rose-50 text-rose-600 text-sm font-medium rounded-full">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <button
              onClick={() => onLike(user.id)}
              className={`flex-1 py-3 rounded-full font-medium transition-all ${
                user.isLiked
                  ? 'bg-rose-100 text-rose-600 border-2 border-rose-500'
                  : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30 hover:shadow-xl'
              }`}
            >
              <Heart className={`w-5 h-5 inline mr-2 ${user.isLiked ? 'fill-current' : ''}`} />
              {user.isLiked ? '已喜欢' : '喜欢'}
            </button>
            <button
              onClick={() => onSendMessage(user)}
              className={`flex-1 py-3 rounded-full font-medium transition-all ${
                user.isMutualLike
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <MessageCircle className="w-5 h-5 inline mr-2" />
              发消息
            </button>
          </div>

          {user.isMutualLike && (
            <p className="text-center text-sm text-rose-500 mt-3">
              💕 你们互相喜欢，可以发消息了
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// 已登录用户的首页
function LoggedInHome() {
  const { currentUser } = useAuth()
  const router = useRouter()
  const [allUsers, setAllUsers] = useState<DisplayUser[]>([])
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<DisplayUser | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [questionnaireCompleted, setQuestionnaireCompleted] = useState(false)
  const [dailyLikesUsed, setDailyLikesUsed] = useState(0)

  const handleViewDetail = async (user: DisplayUser) => {
    setIsLoadingDetail(true)
    setSelectedUser(user)
    
    try {
      const response = await fetch(`/api/users/${user.id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          const fullUser = data.user
          const photos = Array.isArray(fullUser.photos) ? fullUser.photos : []
          
          setSelectedUser({
            ...user,
            avatar: fullUser.avatar || user.avatar,
            photos: photos,
            bio: fullUser.bio || user.bio || '',
            occupation: fullUser.occupation || user.occupation || '',
            education: fullUser.education || user.education || '',
            height: fullUser.height || user.height || 0,
            interests: fullUser.interests || user.interests || [],
          })
        }
      }
    } catch (e) {
      console.error('Failed to fetch user detail:', e)
    } finally {
      setIsLoadingDetail(false)
    }
  }

  const handleCloseDetail = () => {
    setSelectedUser(null)
    setIsLoadingDetail(false)
  }

  const checkQuestionnaireStatus = useCallback(() => {
    if (typeof window === 'undefined') return false
    try {
      const answers = localStorage.getItem('questionnaireAnswers')
      if (answers) {
        const parsed = JSON.parse(answers)
        const answerCount = Object.keys(parsed).length
        return answerCount >= 66
      }
    } catch (e) {
      console.log('Error checking questionnaire status')
    }
    return false
  }, [])

  const checkDailyLikes = useCallback(() => {
    if (typeof window === 'undefined' || !currentUser) return 0
    try {
      const today = new Date().toDateString()
      const likesData = localStorage.getItem(`xindong_daily_likes_${currentUser.id}`)
      if (likesData) {
        const parsed = JSON.parse(likesData)
        if (parsed.date === today) {
          return parsed.count || 0
        }
      }
    } catch (e) {
      console.log('Error checking daily likes')
    }
    return 0
  }, [currentUser])

  const updateDailyLikes = useCallback(() => {
    if (typeof window === 'undefined' || !currentUser) return
    const today = new Date().toDateString()
    const currentCount = checkDailyLikes()
    localStorage.setItem(`xindong_daily_likes_${currentUser.id}`, JSON.stringify({
      date: today,
      count: currentCount + 1
    }))
    setDailyLikesUsed(currentCount + 1)
  }, [currentUser, checkDailyLikes])

  useEffect(() => {
    setQuestionnaireCompleted(checkQuestionnaireStatus())
    setDailyLikesUsed(checkDailyLikes())
    setMounted(true)

    const loadUsers = async () => {
      setIsLoading(true)
      try {
        let allLikes: {from: string, to: string}[] = []
        try {
          const likesResponse = await fetch('/api/users/likes?action=all')
          if (likesResponse.ok) {
            const likesData = await likesResponse.json()
            if (likesData.likes) {
              allLikes = likesData.likes.map((l: any) => ({
                from: l.from_user_id,
                to: l.to_user_id
              }))
            }
          }
        } catch (e) {
          console.log('Likes API not available, using localStorage')
        }

        const response = await fetch('/api/users/list')

        if (response.ok) {
          const data = await response.json()

          if (data.success && data.users && data.users.length > 0) {
            const likedJson = currentUser ? localStorage.getItem(`xindong_likes_${currentUser.id}`) : '[]'
            const likedUsers: string[] = likedJson ? JSON.parse(likedJson) : []

            const displayUsers: DisplayUser[] = data.users
              .filter((u: ApiUser) => u.id !== currentUser?.id)
              .map((u: ApiUser) => {
                let isMutualLike = false
                if (currentUser && allLikes.length > 0) {
                  const fromOtherToMe = allLikes.some(l => l.from === u.id && l.to === currentUser.id)
                  const fromMeToOther = allLikes.some(l => l.from === currentUser.id && l.to === u.id)
                  isMutualLike = fromOtherToMe && fromMeToOther
                } else {
                  const theirLikesJson = localStorage.getItem(`xindong_likes_${u.id}`)
                  const theirLikes: string[] = theirLikesJson ? JSON.parse(theirLikesJson) : []
                  isMutualLike = likedUsers.includes(u.id) && theirLikes.includes(currentUser?.id || '')
                }

                return {
                  id: u.id,
                  nickname: u.nickname,
                  age: u.age,
                  gender: u.gender || 'male',
                  city: u.city || '未知',
                  occupation: u.occupation || '',
                  education: u.education || '',
                  height: u.height || 0,
                  bio: u.bio || '',
                  interests: u.interests || [],
                  avatar: u.avatar || null,
                  photos: u.photos || [],
                  matchScore: Math.floor(Math.random() * 30) + 70,
                  isLiked: likedUsers.includes(u.id),
                  isMutualLike: isMutualLike,
                }
              })

            setAllUsers(displayUsers)
            return
          }
        }
      } catch (e) {
        console.error('Failed to fetch users from API:', e)
      } finally {
        setIsLoading(false)
      }

      setAllUsers([])
    }

    loadUsers()
  }, [currentUser])

  const handleLike = async (userId: string) => {
    if (!currentUser) return

    const likedKey = `xindong_likes_${currentUser.id}`
    const likedJson = localStorage.getItem(likedKey) || '[]'
    let likedUsers: string[] = JSON.parse(likedJson)

    const isLiked = likedUsers.includes(userId)

    if (isLiked) {
      likedUsers = likedUsers.filter(id => id !== userId)
    } else {
      if (!questionnaireCompleted) {
        const todayCount = checkDailyLikes()
        if (todayCount >= 5) {
          setAlertMessage('📝 抱歉，您还未完成问卷调查\n\n今日喜欢次数已用完（5次）\n\n完成问卷后可无限喜欢~')
          return
        }
        updateDailyLikes()
      }
      likedUsers.push(userId)
    }

    localStorage.setItem(likedKey, JSON.stringify(likedUsers))

    try {
      await fetch('/api/users/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUserId: currentUser.id,
          toUserId: userId,
          action: isLiked ? 'unlike' : 'like'
        })
      })
    } catch (e) {
      console.error('Failed to sync like to cloud:', e)
    }

    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, isLiked: !isLiked }
      }
      return u
    }))

    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser(prev => prev ? { ...prev, isLiked: !isLiked } : null)
    }
  }

  const handleSendMessage = (user: DisplayUser) => {
    if (!questionnaireCompleted) {
      setAlertMessage('📝 您还未完成问卷调查\n\n完成问卷后才能主动发起聊天哦~\n\n点击"我的" → "完善资料"开始答题')
      return
    }
    
    if (!user.isMutualLike) {
      setAlertMessage('只有互相喜欢或系统匹配成功的双方才可以发消息哦～')
      return
    }
    setSelectedUser(null)
    window.location.href = `/chat/conversation/?userId=${user.id}&nickname=${encodeURIComponent(user.nickname)}`
  }

  const displayUsers = allUsers

  return (
    <AnimatedBackground variant="romance" showFloatingHearts={true}>
      <div className="min-h-screen pb-20">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" fill="white" />
              </div>
              <span className="font-bold text-lg">
                <GradientText>心动投递</GradientText>
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              {questionnaireCompleted ? (
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">资料完善</span>
              ) : (
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">资料待完善</span>
              )}
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="max-w-2xl mx-auto px-4 py-6">
          {isLoading ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-6 w-32 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
              <UserCardSkeleton />
              <UserCardSkeleton />
              <UserCardSkeleton />
            </div>
          ) : displayUsers.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                  真实用户推荐
                </h3>
                <span className="text-sm text-gray-500">{displayUsers.length} 位用户</span>
              </div>
              <div className="grid gap-4">
                {displayUsers.map((user, index) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    index={index}
                    onViewDetail={handleViewDetail}
                    onLike={handleLike}
                    showIncompleteTag={!questionnaireCompleted && user.id === currentUser?.id}
                  />
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={Heart}
              title="暂无其他用户"
              description="成为第一个注册的用户，邀请朋友一起使用心动投递~"
            />
          )}
        </div>

        {/* 用户详情弹窗 */}
        <AnimatePresence>
          {selectedUser && (
            <UserDetailModal
              user={selectedUser}
              onClose={handleCloseDetail}
              onLike={handleLike}
              onSendMessage={handleSendMessage}
              isLoading={isLoadingDetail}
            />
          )}
        </AnimatePresence>

        {/* 提示弹窗 */}
        <AnimatePresence>
          {alertMessage && (
            <AlertModal
              message={alertMessage}
              onClose={() => setAlertMessage(null)}
            />
          )}
        </AnimatePresence>

        {/* 底部导航 */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100/50 px-4 py-3 z-50">
          <div className="max-w-md mx-auto flex justify-around">
            <Link href="/" className="flex flex-col items-center text-rose-500">
              <Heart className="w-6 h-6 fill-current" />
              <span className="text-xs mt-1 font-medium">首页</span>
            </Link>
            <Link href="/match" className="flex flex-col items-center text-gray-400 hover:text-rose-500 transition-colors">
              <Heart className="w-6 h-6" />
              <span className="text-xs mt-1">匹配</span>
            </Link>
            <Link href="/chat" className="flex flex-col items-center text-gray-400 hover:text-rose-500 transition-colors">
              <MessageCircle className="w-6 h-6" />
              <span className="text-xs mt-1">消息</span>
            </Link>
            <Link href="/dashboard" className="flex flex-col items-center text-gray-400 hover:text-rose-500 transition-colors">
              <Star className="w-6 h-6" />
              <span className="text-xs mt-1">我的</span>
            </Link>
          </div>
        </nav>
      </div>
    </AnimatedBackground>
  )
}

// 未登录用户的首页（营销页）- 优化版，突出66题+AI匹配核心优势
function LandingPage() {
  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(180deg, #fff1f2 0%, #ffffff 30%, #fce7f3 70%, #fdf2f8 100%)',
    }}>
      {/* 背景装饰 */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none z-0" style={{
        background: 'radial-gradient(circle, rgba(251, 113, 133, 0.2) 0%, transparent 70%)',
      }} />
      <div className="fixed bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full pointer-events-none z-0" style={{
        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
      }} />

      {/* 导航栏 */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-rose-200/10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/30">
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
              心动投递
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-600 font-medium hover:text-gray-900 transition-colors">
              登录
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-full shadow-lg shadow-rose-500/30 hover:shadow-xl transition-all"
            >
              立即开始
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero 区域 */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-100 to-pink-100 rounded-full shadow-sm mb-6">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-rose-700">临沂鲁曜同创 · AI驱动的智能匹配平台</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          先了解<span className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">真正的你</span>
          <br />
          再遇见<span className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">对的人</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          <span className="font-semibold text-rose-600">66道灵魂问卷</span>深度解析你的性格、价值观与生活方式
          <br />
          <span className="font-semibold text-rose-600">AI大模型</span>为你精准匹配，让每一次相遇都更有意义
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link
            href="/questionnaire"
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-lg rounded-full shadow-xl shadow-rose-500/40 hover:shadow-2xl hover:scale-105 transition-all"
          >
            开始答题，免费匹配
            <Sparkles className="inline w-5 h-5 ml-2" />
          </Link>
          <Link
            href="/how-it-works"
            className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 font-medium text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            了解匹配原理
          </Link>
        </div>

        {/* 核心数据展示 */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-12">
          {[
            { value: '66', label: '道灵魂问卷', sublabel: '深度了解真实的自己' },
            { value: '9', label: '大维度分析', sublabel: '人格/价值观/生活方式' },
            { value: '10万+', label: '成功匹配', sublabel: '真实用户好评' },
            { value: '92%', label: '匹配满意度', sublabel: '高于传统相亲平台' },
          ].map((stat, i) => (
            <div key={i} className="text-center px-4">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-gray-700 mt-1">{stat.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{stat.sublabel}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 66道问卷优势区域 - 重点突出 */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            为什么传统相亲平台<span className="text-gray-400">效率低</span>？
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            只看照片和基本条件，根本不了解对方的性格、价值观是否契合
          </p>
        </div>

        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 rounded-3xl p-8 md:p-12 text-white mb-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              心动投递的独特优势
            </h3>
            <p className="text-white/90">
              基于心理学理论与大数据分析的66道深度问卷
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '🧠',
                title: '大五人格分析',
                desc: '开放性、尽责性、外向性、宜人性、神经质五大维度',
              },
              {
                icon: '💝',
                title: '依恋类型测评',
                desc: '安全型/焦虑型/回避型，了解你的亲密关系模式',
              },
              {
                icon: '❤️',
                title: '爱情三元论',
                desc: '激情、亲密、承诺，找到与你爱情观一致的人',
              },
              {
                icon: '🎯',
                title: '核心价值观匹配',
                desc: '生育观、财务观、家庭观等10个核心维度',
              },
              {
                icon: '🏠',
                title: '生活方式分析',
                desc: '作息、社交、饮食、旅行偏好等生活习惯',
              },
              {
                icon: '🤖',
                title: 'AI智能匹配',
                desc: '大模型算法分析，计算你们的契合度',
              },
            ].map((item, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 hover:bg-white/20 transition-all">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h4 className="font-bold text-lg mb-2">{item.title}</h4>
                <p className="text-white/80 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 匹配流程展示 */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          三步找到你的<span className="bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">灵魂伴侣</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: '完成66道问卷',
              desc: '只需10-15分钟，基于心理学专业设计，深度解析你的性格与价值观',
              icon: '📝',
            },
            {
              step: '02',
              title: 'AI智能匹配',
              desc: '系统分析数百万种组合，为你筛选出契合度最高的潜在伴侣',
              icon: '🤖',
            },
            {
              step: '03',
              title: '遇见对的人',
              desc: '查看详细的匹配分析报告，了解你们为什么合适，开始心动对话',
              icon: '💕',
            },
          ].map((item, i) => (
            <div key={i} className="relative">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all h-full">
                <div className="text-5xl mb-4">{item.icon}</div>
                <div className="text-sm font-bold text-rose-500 mb-2">Step {item.step}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
              {i < 2 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center text-white">
                    →
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 成功案例 - 扩展版 */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
          他们的故事
        </h2>
        <p className="text-center text-gray-500 mb-8">
          已有 <span className="font-bold text-rose-500">10万+</span> 人在心动投递找到真爱
        </p>

        {/* 筛选标签 */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {[
            { label: '全部', value: 'all', emoji: '💕' },
            { label: '在一起', value: 'dating', emoji: '💑' },
            { label: '订婚', value: 'engaged', emoji: '💍' },
            { label: '结婚', value: 'married', emoji: '👰' },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => {
                const container = document.getElementById('stories-container')
                if (!container) return
                const cards = container.querySelectorAll('.story-card')
                cards.forEach((card) => {
                  const cardEl = card as HTMLElement
                  if (filter.value === 'all' || cardEl.dataset.status === filter.value) {
                    cardEl.style.display = 'block'
                  } else {
                    cardEl.style.display = 'none'
                  }
                })
              }}
              className="px-5 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-gray-600 hover:bg-rose-500 hover:text-white transition-all shadow-md hover:shadow-lg"
            >
              {filter.emoji} {filter.label}
            </button>
          ))}
        </div>

        {/* 成功案例轮播 */}
        <div id="stories-container" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              quote: "一开始觉得66道题太多了，但做完后看到AI给我匹配的人选，真的太准了！我们价值观高度一致，现在在一起快一年了，每次聊天都有说不完的话。",
              name: "小林 & 阿杰",
              matchScore: "95%",
              time: "2024年3月匹配 → 2024年6月确定关系",
              status: "dating",
              timeline: "问卷完成 → 第3天收到推荐 → 第1次约会 → 确定关系",
              highlights: ["价值观高度一致", "性格互补", "生活习惯相似"],
            },
            {
              quote: "之前用过很多相亲软件，都是看脸。心动投递不一样，它真的了解我的性格。匹配的男生和我一样喜欢旅行、喜欢小动物，我们第一次见面就聊了5个小时！",
              name: "小美 & 大伟",
              matchScore: "91%",
              time: "2024年1月匹配 → 2024年3月确定关系",
              status: "dating",
              timeline: "AI匹配分析报告 → 互相喜欢 → 线下见面 → 在一起",
              highlights: ["共同兴趣爱好", "生活方式契合", "互相欣赏"],
            },
            {
              quote: "我是一个内向的人，之前相亲总是不知道说什么。66道题帮我找到了同样内向但又互补的他。我们都很珍惜这份来之不易的缘分，现在已经订婚了！",
              name: "晓晓 & 子涵",
              matchScore: "88%",
              time: "2023年11月匹配 → 2024年2月确定关系 → 2024年10月订婚",
              status: "engaged",
              timeline: "深度问卷 → 性格分析 → 匹配度92% → 订婚",
              highlights: ["内向者的完美匹配", "互相理解", "彼此珍惜"],
            },
            {
              quote: "我是单亲妈妈，一个人带孩子真的很辛苦。也很担心找不到能接受我的人。心动投递的AI匹配系统帮我找到了现在的老公，他对我的孩子视如己出。",
              name: "芳芳 & 建军",
              matchScore: "94%",
              time: "2023年8月匹配 → 2023年12月确定关系 → 2024年5月结婚",
              status: "married",
              timeline: "真实填写个人情况 → AI精准匹配 → 幸福婚姻",
              highlights: ["接受真实的我", "爱屋及乌", "组建幸福家庭"],
            },
            {
              quote: "我们都是工程师，平时工作很忙，根本没时间社交。66道题帮我们快速筛选出最匹配的人，现在我们一起创业、一起生活，每天都充满甜蜜！",
              name: "浩然 & 思远",
              matchScore: "93%",
              time: "2024年2月匹配 → 2024年5月确定关系 → 计划2025年结婚",
              status: "dating",
              timeline: "高效匹配 → 价值观一致 → 共同目标",
              highlights: ["事业伴侣", "志同道合", "高效脱单"],
            },
            {
              quote: "我是虔诚的基督徒，一直想找一个有共同信仰的伴侣。心动投递的问卷里有专门的价值观匹配，帮我找到了现在的妻子。我们每周一起做礼拜，感觉特别幸福。",
              name: "志明 & 雨晴",
              matchScore: "97%",
              time: "2023年9月匹配 → 2023年12月确定关系 → 2024年8月结婚",
              status: "married",
              timeline: "信仰匹配 → 价值观契合 → 神圣婚姻",
              highlights: ["信仰一致", "灵魂伴侣", "共同成长"],
            },
          ].map((story, i) => (
            <div
              key={i}
              data-status={story.status}
              className="story-card bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col"
            >
              {/* 匹配度徽章 */}
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold rounded-full">
                  匹配度 {story.matchScore}
                </span>
                <span className="text-xs text-gray-400">{story.status === 'dating' ? '💑 在一起' : story.status === 'engaged' ? '💍 订婚' : '👰 结婚'}</span>
              </div>

              {/* 用户昵称 */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold">
                  {story.name.split(' & ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-bold text-gray-900">{story.name}</div>
                  <div className="text-xs text-gray-500">{story.time.split(' → ')[0]}</div>
                </div>
              </div>

              {/* 故事引言 */}
              <div className="text-3xl text-rose-300 mb-2">"</div>
              <p className="text-gray-700 mb-4 leading-relaxed flex-grow">{story.quote}</p>

              {/* 时间线 */}
              <div className="mb-4 p-3 bg-rose-50 rounded-xl">
                <div className="text-xs font-medium text-rose-600 mb-1">📍 相识时间线</div>
                <div className="text-xs text-gray-600">{story.timeline}</div>
              </div>

              {/* 亮点标签 */}
              <div className="flex flex-wrap gap-2 mb-4">
                {story.highlights.map((tag, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              {/* 互动按钮 */}
              <button
                onClick={() => {
                  // 滚动到问卷区域
                  window.location.href = '/questionnaire'
                }}
                className="w-full py-3 bg-gradient-to-r from-rose-50 to-pink-50 text-rose-600 font-medium rounded-xl hover:from-rose-500 hover:to-pink-500 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Heart className="w-4 h-4" />
                希望我也能遇到
              </button>
            </div>
          ))}
        </div>

        {/* 查看更多 */}
        <div className="text-center mt-10">
          <Link
            href="/success-stories"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-full shadow-md hover:shadow-lg transition-all"
          >
            查看更多成功案例
            <span className="text-rose-500">→</span>
          </Link>
        </div>
      </section>

      {/* 与传统平台对比 */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          心动投递 vs 传统相亲平台
        </h2>

        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-3 bg-gray-50 p-4 font-bold text-sm">
            <div className="text-gray-600">对比维度</div>
            <div className="text-gray-400">传统平台</div>
            <div className="text-rose-600">心动投递 ✨</div>
          </div>
          {[
            { dim: '匹配依据', traditional: '照片+基本条件', xindong: '66道问卷+AI分析' },
            { dim: '了解深度', traditional: '表面信息', xindong: '性格/价值观/生活方式' },
            { dim: '匹配逻辑', traditional: '人工筛选或随机', xindong: 'AI算法精准计算' },
            { dim: '成功率', traditional: '较低，试错成本高', xindong: '92%用户满意度' },
            { dim: '时间成本', traditional: '需要大量约会试错', xindong: '每周精准匹配1位' },
          ].map((row, i) => (
            <div key={i} className="grid grid-cols-3 p-4 border-t border-gray-100 text-sm">
              <div className="font-medium text-gray-700">{row.dim}</div>
              <div className="text-gray-500">{row.traditional}</div>
              <div className="text-rose-600 font-medium">{row.xindong}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA 区域 */}
      <section className="relative z-10 max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 rounded-3xl p-8 md:p-12 text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            准备好遇见那个懂你的人了吗？
          </h2>
          <p className="text-white/90 mb-2">
            花10-15分钟完成问卷，让AI为你找到真正契合的另一半
          </p>
          <p className="text-white/70 text-sm mb-8">
            完全免费 · 隐私保护 · 科学匹配
          </p>
          <Link
            href="/questionnaire"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-rose-600 font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105"
          >
            开始答题，免费匹配
            <Heart className="w-5 h-5" fill="currentColor" />
          </Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>© 2024 心动投递 · 临沂鲁曜同创 版权所有</p>
          <p className="mt-1">用AI算法，找到真正懂你的人</p>
        </div>
      </footer>
    </div>
  )
}

export default function HomePage() {
  const { currentUser, isLoading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="animate-pulse text-rose-500">加载中...</div>
      </div>
    )
  }

  return currentUser ? <LoggedInHome /> : <LandingPage />
}
