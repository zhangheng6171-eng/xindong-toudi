'use client'

import { useState, useEffect, useCallback, memo, Suspense, lazy } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, MessageCircle, Star, MapPin, Briefcase, GraduationCap, Eye, Sparkles, AlertCircle, X } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { AnimatedBackground, GlassCard, GradientText, FadeIn } from '@/components/animated-background'
import { useAuth } from '@/hooks/useAuth'
import { UserCardSkeleton, EmptyState } from '@/components/skeleton'

// Supabase 配置 - 从环境变量获取
const SUPABASE_URL = 'https://ntaqnyegiiwtzdyqjiwy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50YXFueWVnaWl3dHpkeXFqaXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTY4NzUsImV4cCI6MjA4OTQ5Mjg3NX0.4FEAb1Yd4xOwXz3LcfZ9iPG0ZZPbFd8dfry903c5lPc'

// 计算匹配度
function calculateMatchScore(currentUser: any, targetUser: any): number {
  let score = 70 // 基础分
  
  // 1. 同城市加分
  if (currentUser.city && targetUser.city && currentUser.city === targetUser.city) {
    score += 8
  }
  
  // 2. 年龄匹配度
  if (currentUser.age && targetUser.age) {
    const ageDiff = Math.abs(currentUser.age - targetUser.age)
    if (ageDiff <= 2) score += 7
    else if (ageDiff <= 5) score += 4
    else if (ageDiff <= 10) score += 2
  }
  
  // 3. 兴趣爱好匹配
  if (currentUser.interests && targetUser.interests) {
    const myInterests = new Set(currentUser.interests)
    const commonInterests = targetUser.interests.filter((i: string) => myInterests.has(i))
    score += Math.min(10, commonInterests.length * 2)
  }
  
  // 4. 完成问卷的用户加分
  if (targetUser.questionnaire_completed) {
    score += 5
  }
  
  // 5. 有头像加分
  if (targetUser.avatar) {
    score += 2
  }
  
  // 6. 有个人简介加分
  if (targetUser.bio && targetUser.bio.length > 20) {
    score += 3
  }
  
  // 限制在70-99之间
  return Math.min(99, Math.max(70, score))
}

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
  questionnaire_completed?: boolean
  questionnaire_answers?: Record<string, any>
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
  isSystemMatch: boolean
}

// 用户卡片组件 - 使用 memo 优化
const UserCard = memo(function UserCard({ 
  user, 
  index, 
  onViewDetail, 
  onLike, 
  showIncompleteTag 
}: { 
  user: DisplayUser; 
  index: number; 
  onViewDetail: (user: DisplayUser) => void; 
  onLike: (userId: string) => void;
  showIncompleteTag?: boolean;
}) {
  return (
    <FadeIn delay={index * 0.05}>
      <GlassCard className="p-5 hover:shadow-xl transition-shadow cursor-pointer group" hover={true}>
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            {user.avatar ? (
              <img src={user.avatar} alt={user.nickname} className="w-16 h-16 rounded-2xl object-cover shadow-lg" loading="lazy" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-rose-500/30">
                {user.nickname[0]}
              </div>
            )}
            <div className="absolute -top-1 -right-1 px-2 py-0.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
              {user.matchScore}%
            </div>
            {user.isMutualLike && (
              <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full shadow-lg">
                💕互喜
              </div>
            )}
            {user.isSystemMatch && !user.isMutualLike && (
              <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold rounded-full shadow-lg">
                匹配
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-lg">{user.nickname}</h3>
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

            {user.bio && <p className="text-sm text-gray-600 line-clamp-2 mb-3">{user.bio}</p>}

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

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.preventDefault(); onViewDetail(user); }}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-rose-500 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>查看完整资料</span>
          </button>
          <button
            onClick={(e) => { e.preventDefault(); onLike(user.id); }}
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
})

UserCard.displayName = 'UserCard'

// 简化弹窗 - 减少动画
function AlertModal({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center"
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
      </div>
    </div>
  )
}

const AlertModalMemo = memo(AlertModal)

// 用户详情弹窗 - 使用 memo 优化
const UserDetailModal = memo(function UserDetailModal({
  user,
  onClose,
  onLike,
  onSendMessage,
  isLoading
}: {
  user: DisplayUser;
  onClose: () => void;
  onLike: (userId: string) => void;
  onSendMessage: (user: DisplayUser) => void;
  isLoading?: boolean;
}) {
  const realPhotos = (user.photos || []).filter((p: string | null) => p !== null && p !== '')

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative h-40 bg-gradient-to-br from-rose-400 via-pink-400 to-purple-400">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="absolute -bottom-12 left-6">
            {user.avatar ? (
              <img src={user.avatar} alt={user.nickname} className="w-24 h-24 rounded-2xl object-cover shadow-xl border-4 border-white" />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-4xl font-bold shadow-xl border-4 border-white">
                {user.nickname[0]}
              </div>
            )}
          </div>
          {user.isMutualLike && (
            <div className="absolute top-4 left-4 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium rounded-full shadow-lg flex items-center gap-1">
              💕 互相喜欢
            </div>
          )}
        </div>

        <div className="pt-16 px-6 pb-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{user.nickname}</h2>
              <span className={`text-lg font-medium ${user.gender === 'male' ? 'text-blue-500' : 'text-pink-500'}`}>
                {user.gender === 'male' ? '♂' : '♀'}
              </span>
            </div>
            <p className="text-gray-500">{user.age}岁 · {user.city}</p>
            <div className="flex items-center justify-center gap-4 mt-2 text-sm text-gray-500">
              {user.occupation && <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" />{user.occupation}</span>}
              {user.education && <span className="flex items-center gap-1"><GraduationCap className="w-4 h-4" />{user.education}</span>}
              {user.height > 0 && <span>{user.height}cm</span>}
            </div>
          </div>

          <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-4 mb-6 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">{user.matchScore}%</div>
            <div className="text-gray-600 text-sm">匹配度</div>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              照片墙 {realPhotos.length > 0 && `(${realPhotos.length}张)`}
            </h3>
            {realPhotos.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {realPhotos.map((photo, index) => (
                  <div key={index} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                    {photo && <img src={photo} alt={`${user.nickname}的照片${index + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform" loading="lazy" />}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <p className="text-gray-400 text-sm">暂无照片</p>
              </div>
            )}
          </div>

          {user.bio && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-2">关于我</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{user.bio}</p>
            </div>
          )}

          {user.interests.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-2">兴趣爱好</h3>
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest) => (
                  <span key={interest} className="px-3 py-1.5 bg-rose-50 text-rose-600 text-sm font-medium rounded-full">{interest}</span>
                ))}
              </div>
            </div>
          )}

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
                user.isMutualLike || user.isSystemMatch
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <MessageCircle className="w-5 h-5 inline mr-2" />
              发消息
            </button>
          </div>

          {(user.isMutualLike || user.isSystemMatch) && (
            <p className="text-center text-sm text-rose-500 mt-3">
              {user.isMutualLike ? '💕 你们互相喜欢，可以发消息了' : '🔮 系统匹配用户，可以直接聊天'}
            </p>
          )}
          {!user.isMutualLike && !user.isSystemMatch && user.isLiked && (
            <p className="text-center text-sm text-gray-400 mt-3">等待对方也喜欢你后即可发消息</p>
          )}
        </div>
      </div>
    </div>
  )
})

UserDetailModal.displayName = 'UserDetailModal'

// 底部导航 - 使用 memo
const BottomNav = memo(function BottomNav() {
  return (
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
  )
})

BottomNav.displayName = 'BottomNav'

// 主页面组件
function LoggedInHome() {
  const { currentUser } = useAuth()
  const [allUsers, setAllUsers] = useState<DisplayUser[]>([])
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<DisplayUser | null>(null)
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [questionnaireCompleted, setQuestionnaireCompleted] = useState(false)
  const [dailyLikesUsed, setDailyLikesUsed] = useState(0)

  // 使用 useCallback 缓存函数
  const checkQuestionnaireStatus = useCallback(() => {
    if (typeof window === 'undefined') return false
    try {
      const answers = localStorage.getItem('questionnaireAnswers')
      if (answers) {
        const parsed = JSON.parse(answers)
        return Object.keys(parsed).length >= 66
      }
    } catch (e) {}
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
    } catch (e) {}
    return 0
  }, [currentUser])

  // 获取用户列表 - 直接从 Supabase 获取
  const fetchUsers = useCallback(async () => {
    if (!currentUser) return
    
    try {
      // 直接从 Supabase 获取用户列表，包含问卷完成状态
      const usersResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/users?select=id,nickname,age,gender,city,occupation,education,height,bio,interests,avatar,photos,questionnaire_completed,questionnaire_answers&order=createdAt.desc&limit=20`,
        { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
      )
      
      const mutualLikesMap = new Map<string, boolean>()
      
      // 尝试获取 likes（可能为空）
      try {
        const likesResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/likes?select=from_user_id,to_user_id`,
          { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
        )
        if (likesResponse.ok) {
          const likesData = await likesResponse.json()
          if (Array.isArray(likesData)) {
            const myLikes = new Set(likesData.filter((l: any) => l.from_user_id === currentUser.id).map((l: any) => l.to_user_id))
            const likesMe = new Set(likesData.filter((l: any) => l.to_user_id === currentUser.id).map((l: any) => l.from_user_id))
            
            myLikes.forEach(userId => {
              if (likesMe.has(userId)) {
                mutualLikesMap.set(userId, true)
              }
            })
          }
        }
      } catch (e) {
        // likes 表可能不存在或为空
        console.log('Likes data not available')
      }
      
      if (usersResponse.ok) {
        const users = await usersResponse.json()
        if (Array.isArray(users) && users.length > 0) {
          const likedJson = localStorage.getItem(`xindong_likes_${currentUser.id}`) || '[]'
          const likedUsers: string[] = JSON.parse(likedJson)

          const displayUsers: DisplayUser[] = users
            .filter((u: ApiUser) => u.id !== currentUser.id)
            .map((u: ApiUser) => ({
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
              photos: Array.isArray(u.photos) ? u.photos : [],
              // 基于用户画像数据计算匹配度
              matchScore: calculateMatchScore(currentUser, u),
              isLiked: likedUsers.includes(u.id),
              isMutualLike: mutualLikesMap.has(u.id),
              // 只有完成问卷的用户才显示为系统匹配
              isSystemMatch: u.questionnaire_completed === true,
            }))
            // 按匹配度排序
            .sort((a: DisplayUser, b: DisplayUser) => b.matchScore - a.matchScore)

          setAllUsers(displayUsers)
          return
        }
      }
    } catch (e) {
      console.error('Failed to fetch users:', e)
    }
    
    setAllUsers([])
  }, [currentUser])

  useEffect(() => {
    setQuestionnaireCompleted(checkQuestionnaireStatus())
    setDailyLikesUsed(checkDailyLikes())
    setMounted(true)

    // 页面加载时获取用户列表
    loadUsers()
  }, [])

  // 当用户登录状态变化时，重新加载用户列表
  useEffect(() => {
    if (mounted && currentUser) {
      loadUsers()
    }
  }, [currentUser])

  // 分离用户加载逻辑
  const loadUsers = async () => {
    setIsLoading(true)
    await fetchUsers()
    setIsLoading(false)
  }

  const handleViewDetail = async (user: DisplayUser) => {
    setSelectedUser(user)
    
    // 延迟加载完整信息 - 直接从 Supabase 获取
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/users?id=eq.${user.id}&select=id,nickname,age,gender,city,occupation,education,height,bio,interests,avatar,photos`,
        { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
      )
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data) && data[0]) {
          const fullUser = data[0]
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
    }
  }

  const handleCloseDetail = () => {
    setSelectedUser(null)
  }

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

  // 获取互相喜欢状态 - 直接从 Supabase 获取
  const fetchMutualLikes = useCallback(async (): Promise<Map<string, boolean>> => {
    const mutualLikesMap = new Map<string, boolean>()
    
    if (!currentUser) return mutualLikesMap
    
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/likes?select=from_user_id,to_user_id`,
        { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
      )
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          const myLikes = new Set(data.filter((l: any) => l.from_user_id === currentUser.id).map((l: any) => l.to_user_id))
          const likesMe = new Set(data.filter((l: any) => l.to_user_id === currentUser.id).map((l: any) => l.from_user_id))
          
          myLikes.forEach(userId => {
            if (likesMe.has(userId)) {
              mutualLikesMap.set(userId, true)
            }
          })
        }
      }
    } catch (e) {
      console.error('Failed to fetch mutual likes:', e)
    }
    
    return mutualLikesMap
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

    // 尝试同步到 Supabase（likes 表可能不存在）
    try {
      if (!isLiked) {
        // 添加喜欢
        await fetch(`${SUPABASE_URL}/rest/v1/likes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            from_user_id: currentUser.id,
            to_user_id: userId
          })
        })
      } else {
        // 取消喜欢
        await fetch(`${SUPABASE_URL}/rest/v1/likes?from_user_id=eq.${currentUser.id}&to_user_id=eq.${userId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer': 'return=minimal'
          }
        })
      }
    } catch (e) {
      console.log('Like sync to cloud skipped (table may not exist)')
    }

    // 重新获取互相喜欢状态
    const mutualLikesMap = await fetchMutualLikes()

    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, isLiked: !isLiked, isMutualLike: mutualLikesMap.has(userId) }
      }
      return { ...u, isMutualLike: mutualLikesMap.has(u.id) }
    }))

    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser(prev => prev ? { ...prev, isLiked: !isLiked, isMutualLike: mutualLikesMap.has(userId) } : null)
    }
  }

  const handleSendMessage = (user: DisplayUser) => {
    if (!questionnaireCompleted) {
      setAlertMessage('📝 您还未完成问卷调查\n\n完成问卷后才能主动发起聊天哦~\n\n点击"我的" → "完善资料"开始答题')
      return
    }
    
    if (!user.isMutualLike && !user.isSystemMatch) {
      setAlertMessage('只有互相喜欢或系统匹配成功的双方才可以发消息哦～\n\n💡 提示：对方也喜欢你后就可以发消息了！')
      return
    }
    setSelectedUser(null)
    window.location.href = `/chat/conversation/?userId=${user.id}&nickname=${encodeURIComponent(user.nickname)}`
  }

  // 骨架屏
  if (isLoading) {
    return (
      <AnimatedBackground variant="romance" showFloatingHearts={true}>
        <div className="min-h-screen pb-20">
          <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
            <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" fill="white" />
                </div>
                <span className="font-bold text-lg"><GradientText>心动投递</GradientText></span>
              </div>
            </div>
          </div>
          <div className="max-w-2xl mx-auto px-4 py-6">
            <div className="space-y-4">
              <UserCardSkeleton />
              <UserCardSkeleton />
              <UserCardSkeleton />
            </div>
          </div>
          <BottomNav />
        </div>
      </AnimatedBackground>
    )
  }

  return (
    <AnimatedBackground variant="romance" showFloatingHearts={true}>
      <div className="min-h-screen pb-20">
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" fill="white" />
              </div>
              <span className="font-bold text-lg"><GradientText>心动投递</GradientText></span>
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

        <div className="max-w-2xl mx-auto px-4 py-6">
          {allUsers.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">真实用户推荐</h3>
                <span className="text-sm text-gray-500">{allUsers.length} 位用户</span>
              </div>
              <div className="grid gap-4">
                {allUsers.map((user, index) => (
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
            <EmptyState icon={Heart} title="暂无其他用户" description="成为第一个注册的用户，邀请朋友一起使用心动投递~" />
          )}
        </div>

        <AnimatePresence>
          {selectedUser && (
            <UserDetailModal 
              user={selectedUser} 
              onClose={handleCloseDetail} 
              onLike={handleLike} 
              onSendMessage={handleSendMessage} 
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {alertMessage && <AlertModalMemo message={alertMessage} onClose={() => setAlertMessage(null)} />}
        </AnimatePresence>

        <BottomNav />
      </div>
    </AnimatedBackground>
  )
}

// Landing page component
function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #fff1f2 0%, #ffffff 30%, #fce7f3 70%, #fdf2f8 100%)' }}>
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-rose-200/10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/30">
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">心动投递</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-600 font-medium hover:text-gray-900 transition-colors">登录</Link>
            <Link href="/register" className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-full shadow-lg shadow-rose-500/30 hover:shadow-xl transition-all">立即开始</Link>
          </div>
        </div>
      </nav>
      <section className="relative z-10 max-w-5xl mx-auto px-4 pt-16 pb-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          先了解<span className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">真正的你</span>
          <br />再遇见<span className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">对的人</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          <span className="font-semibold text-rose-600">66道灵魂问卷</span>深度解析你的性格、价值观与生活方式
          <br /><span className="font-semibold text-rose-600">AI大模型</span>为你精准匹配，让每一次相遇都更有意义
        </p>
        <Link href="/register" className="px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-lg rounded-full shadow-xl shadow-rose-500/40 hover:shadow-2xl hover:scale-105 transition-all">
          开始答题，免费匹配 <Sparkles className="inline w-5 h-5 ml-2" />
        </Link>
      </section>
      <footer className="relative z-10 border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>© 2024 心动投递 · 临沂鲁曜同创 版权所有</p>
        </div>
      </footer>
    </div>
  )
}

export default function HomePage() {
  const { currentUser, isLoading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="animate-pulse text-rose-500">加载中...</div>
      </div>
    )
  }

  return currentUser ? <LoggedInHome /> : <LandingPage />
}
