'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { 
  Settings, Heart, MessageCircle, User, Bell, ChevronRight,
  TrendingUp, Calendar, Sparkles, Target, Users, BookOpen,
  Camera, Edit2, Award, Zap, BarChart3, LogOut, AlertCircle,
  X, CheckCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AnimatedBackground, GlassCard, GradientText, AnimatedCounter, FadeIn } from '@/components/animated-background'
import { useAuth, defaultProfile, UserProfile } from '@/hooks/useAuth'
import { useUnreadMessages } from '@/hooks/useUnreadMessages'
import { useNotifications, AppNotification } from '@/hooks/useNotifications'
import { BottomNav } from '@/components/bottom-nav'

// 互相喜欢用户类型
interface MutualLikeUser {
  id: string
  nickname: string
  age: number
  city: string
  avatar: string | null
  matchedAt: string
}

// 通知类型
interface Notification {
  id: string
  type: 'match' | 'like' | 'message' | 'system'
  title: string
  content: string
  time: string
  read: boolean
}

// 互相喜欢弹窗
function MutualLikesModal({ users, onClose, onChat }: { users: MutualLikeUser[]; onClose: () => void; onChat: (userId: string, nickname: string) => void }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-3xl max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 fill-current" />
              <h2 className="text-xl font-bold">互相喜欢</h2>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-white/80 text-sm mt-2">这些人和你互相喜欢，可以开始聊天了！</p>
        </div>
        
        <div className="p-4 max-h-[50vh] overflow-y-auto">
          {users.length > 0 ? (
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl hover:bg-rose-50 transition-colors">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.nickname} className="w-full h-full object-cover" />
                    ) : (
                      user.nickname[0]
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{user.nickname}</h3>
                    <p className="text-sm text-gray-500">{user.age}岁 · {user.city}</p>
                    <p className="text-xs text-gray-400">{user.matchedAt}</p>
                  </div>
                  <button
                    onClick={() => onChat(user.id, user.nickname)}
                    className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-medium rounded-full hover:shadow-lg transition-all"
                  >
                    聊天
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 mx-auto mb-3 text-gray-200" />
              <p className="text-gray-400">暂无互相喜欢的用户</p>
              <p className="text-sm text-gray-300 mt-1">去首页看看有没有心动的人吧~</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// 通知面板 - 整合消息和系统通知
function NotificationPanel({ 
  notifications, 
  onClose, 
  onMarkRead, 
  onMarkAllRead,
  onChatClick
}: { 
  notifications: AppNotification[]; 
  onClose: () => void; 
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onChatClick: () => void;
}) {
  const unreadCount = notifications.filter(n => !n.read).length
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'match': return '🎯'
      case 'like': return '❤️'
      case 'message': return '💬'
      case 'reminder': return '📝'
      case 'system': return '👋'
      default: return '🔔'
    }
  }

  const getGradient = (type: string) => {
    switch (type) {
      case 'match': return 'from-rose-500 to-pink-500'
      case 'like': return 'from-red-500 to-orange-500'
      case 'message': return 'from-blue-500 to-indigo-500'
      case 'reminder': return 'from-amber-500 to-orange-500'
      case 'system': return 'from-purple-500 to-pink-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const handleClick = (notif: AppNotification) => {
    onMarkRead(notif.id)
    if (notif.action) {
      window.location.href = notif.action.href
    }
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-end md:items-center justify-center p-0 md:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-md max-h-[85vh] overflow-hidden shadow-2xl"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 p-4 md:p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-6 h-6" />
              <h2 className="text-xl font-bold">通知中心</h2>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-sm">{unreadCount}条未读</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button 
                  onClick={onMarkAllRead}
                  className="text-xs bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition-colors"
                >
                  全部已读
                </button>
              )}
              <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* 快捷操作 */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
            <button 
              onClick={onChatClick}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 rounded-full text-sm whitespace-nowrap hover:bg-white/30 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              查看消息
            </button>
            <Link 
              href="/match"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 rounded-full text-sm whitespace-nowrap hover:bg-white/30 transition-colors"
            >
              <Heart className="w-4 h-4" />
              查看匹配
            </Link>
          </div>
        </div>
        
        {/* 通知列表 */}
        <div className="p-3 md:p-4 max-h-[50vh] md:max-h-[60vh] overflow-y-auto">
          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3 p-3 rounded-2xl transition-all cursor-pointer hover:scale-[1.02] ${
                    notif.read ? 'bg-gray-50' : 'bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100'
                  }`}
                  onClick={() => handleClick(notif)}
                >
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getGradient(notif.type)} flex items-center justify-center text-lg flex-shrink-0`}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 text-sm">{notif.title}</h3>
                      {!notif.read && <span className="w-2 h-2 bg-rose-500 rounded-full flex-shrink-0" />}
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">{notif.content}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="text-xs text-gray-400">{notif.time}</p>
                      {notif.action && (
                        <span className="text-xs text-rose-500 font-medium flex items-center gap-0.5">
                          {notif.action.label} <ChevronRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 mx-auto mb-3 text-gray-200" />
              <p className="text-gray-400">暂无通知</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// 通知弹窗
function NotificationModal({ notifications, onClose, onMarkRead }: { notifications: Notification[]; onClose: () => void; onMarkRead: (id: string) => void }) {
  const unreadCount = notifications.filter(n => !n.read).length
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'match': return '💕'
      case 'like': return '❤️'
      case 'message': return '💬'
      default: return '🔔'
    }
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-3xl max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-6 h-6" />
              <h2 className="text-xl font-bold">消息通知</h2>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-sm">{unreadCount}条未读</span>
              )}
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-4 max-h-[50vh] overflow-y-auto">
          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3 p-3 rounded-2xl transition-colors cursor-pointer ${
                    notif.read ? 'bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'
                  }`}
                  onClick={() => onMarkRead(notif.id)}
                >
                  <div className="text-2xl">{getIcon(notif.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{notif.title}</h3>
                      {!notif.read && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notif.content}</p>
                    <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 mx-auto mb-3 text-gray-200" />
              <p className="text-gray-400">暂无通知</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// 大五人格雷达图组件
function PersonalityRadar({ scores }: { scores: Record<string, number> }) {
  const dimensions = [
    { key: 'openness', label: '开放性', icon: '🌟' },
    { key: 'conscientiousness', label: '尽责性', icon: '🎯' },
    { key: 'extraversion', label: '外向性', icon: '🎭' },
    { key: 'agreeableness', label: '宜人性', icon: '💚' },
    { key: 'neuroticism', label: '情绪稳定性', icon: '🌊' },
  ]

  const centerX = 150
  const centerY = 150
  const maxRadius = 100

  const points = dimensions.map((dim, i) => {
    const angle = (Math.PI * 2 * i) / dimensions.length - Math.PI / 2
    const value = scores[dim.key] || 50
    const radius = (value / 100) * maxRadius
    return { x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle), label: dim.label, icon: dim.icon, value }
  })

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'

  return (
    <div className="relative">
      <svg viewBox="0 0 300 300" className="w-full max-w-xs mx-auto">
        {[20, 40, 60, 80, 100].map((level) => {
          const radius = (level / 100) * maxRadius
          return <circle key={level} cx={centerX} cy={centerY} r={radius} fill="none" stroke="url(#gridGradient)" strokeWidth="1" opacity={0.3 + (level / 100) * 0.3} />
        })}
        {dimensions.map((dim, i) => {
          const angle = (Math.PI * 2 * i) / dimensions.length - Math.PI / 2
          const endX = centerX + maxRadius * Math.cos(angle)
          const endY = centerY + maxRadius * Math.sin(angle)
          return <line key={dim.key} x1={centerX} y1={centerY} x2={endX} y2={endY} stroke="url(#axisGradient)" strokeWidth="1" opacity={0.4} />
        })}
        <path d={pathD} fill="url(#radarGradient)" stroke="url(#radarStroke)" strokeWidth="3" />
        {points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="8" fill="url(#pointGradient)" stroke="white" strokeWidth="3" className="drop-shadow-lg" />)}
        <defs>
          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(244, 63, 94, 0.4)" />
            <stop offset="50%" stopColor="rgba(236, 72, 153, 0.3)" />
            <stop offset="100%" stopColor="rgba(168, 85, 247, 0.4)" />
          </linearGradient>
          <linearGradient id="radarStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F43F5E" />
            <stop offset="50%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
          <linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FECDD3" />
            <stop offset="100%" stopColor="#E9D5FF" />
          </linearGradient>
          <linearGradient id="axisGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDA4AF" />
            <stop offset="100%" stopColor="#D8B4FE" />
          </linearGradient>
          <radialGradient id="pointGradient">
            <stop offset="0%" stopColor="#FB7185" />
            <stop offset="100%" stopColor="#EC4899" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  else if (hour < 12) return '早安'
  else if (hour < 14) return '午安'
  else if (hour < 18) return '下午好'
  else if (hour < 22) return '晚上好'
  else return '夜深了'
}

export default function DashboardPage() {
  const { currentUser, isLoading, getUserData, logout } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [profile, setProfile] = useState<UserProfile>(defaultProfile)
  const [avatar, setAvatar] = useState<string | null>(null)
  const [questionnaireCompleted, setQuestionnaireCompleted] = useState(false)
  const [photoCount, setPhotoCount] = useState(0)
  const [bioCompleted, setBioCompleted] = useState(false)
  const [showMutualLikes, setShowMutualLikes] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [mutualLikeUsers, setMutualLikeUsers] = useState<MutualLikeUser[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  
  // 未读消息
  const { unreadInfo, refresh: refreshUnread } = useUnreadMessages(currentUser?.id || null)
  
  // 应用通知
  const { 
    notifications: appNotifications, 
    unreadCount: notificationUnread,
    markAsRead: markNotificationRead,
    markAllAsRead: markAllNotificationsRead 
  } = useNotifications(currentUser?.id || null)

  // 计算完成度
  const calculateProgress = useCallback(() => {
    let progress = 0
    if (questionnaireCompleted) progress += 50 // 问卷50%
    if (photoCount >= 1) progress += 20 // 至少1张照片20%
    if (photoCount >= 3) progress += 10 // 3张以上额外10%
    if (bioCompleted) progress += 20 // 个人简介20%
    return Math.min(progress, 100)
  }, [questionnaireCompleted, photoCount, bioCompleted])

  // 获取互相喜欢列表
  const fetchMutualLikes = useCallback(async () => {
    if (!currentUser) return
    
    try {
      const response = await fetch('/api/users/likes?action=all')
      if (response.ok) {
        const data = await response.json()
        if (data.likes && Array.isArray(data.likes)) {
          const myLikes = new Set(data.likes.filter((l: any) => l.from_user_id === currentUser.id).map((l: any) => l.to_user_id))
          const likesMe = new Set(data.likes.filter((l: any) => l.to_user_id === currentUser.id).map((l: any) => l.from_user_id))
          
          const mutualIds: string[] = []
          myLikes.forEach(userId => {
            if (likesMe.has(userId as string)) mutualIds.push(userId as string)
          })
          
          // 获取这些用户的详细信息
          if (mutualIds.length > 0) {
            const usersResponse = await fetch('/api/users/list')
            if (usersResponse.ok) {
              const usersData = await usersResponse.json()
              if (usersData.users) {
                const mutualUsers = usersData.users
                  .filter((u: any) => mutualIds.includes(u.id))
                  .map((u: any) => ({
                    id: u.id,
                    nickname: u.nickname,
                    age: u.age || 25,
                    city: u.city || '未知',
                    avatar: u.avatar,
                    matchedAt: '最近互相喜欢'
                  }))
                setMutualLikeUsers(mutualUsers)
              }
            }
          }
        }
      }
    } catch (e) {
      console.error('Failed to fetch mutual likes:', e)
    }
  }, [currentUser])

  // 加载通知
  const loadNotifications = useCallback(() => {
    // 模拟通知数据（实际应从API获取）
    const mockNotifications: Notification[] = [
      { id: '1', type: 'system', title: '欢迎使用心动投递', content: '完成问卷后即可开始匹配，找到那个懂你的人', time: '刚刚', read: false },
      { id: '2', type: 'match', title: '匹配提醒', content: '本周三晚8点将揭晓新的匹配对象，敬请期待！', time: '1小时前', read: true },
    ]
    setNotifications(mockNotifications)
  }, [])

  useEffect(() => {
    setMounted(true)
    
    if (!isLoading && currentUser) {
      const userProfile: UserProfile = {
        nickname: currentUser.nickname || '',
        age: currentUser.age || 25,
        gender: currentUser.gender || 'male',
        city: currentUser.city || '',
        occupation: '', education: '', height: 175, bio: '', interests: [],
        lookingFor: { minAge: 18, maxAge: 35, cities: currentUser.city ? [currentUser.city] : [], relationship: 'serious' }
      }
      
      const savedProfile = getUserData<UserProfile>('profile', defaultProfile)
      if (savedProfile.nickname) {
        userProfile.bio = savedProfile.bio || ''
        userProfile.interests = savedProfile.interests || []
        userProfile.occupation = savedProfile.occupation || ''
        userProfile.education = savedProfile.education || ''
        userProfile.height = savedProfile.height || 175
        userProfile.lookingFor = savedProfile.lookingFor || userProfile.lookingFor
      }
      
      setProfile(userProfile)
      localStorage.setItem(`xindong_profile_${currentUser.id}`, JSON.stringify(userProfile))
      
      if (currentUser.avatar) {
        setAvatar(currentUser.avatar)
        localStorage.setItem(`xindong_avatar_${currentUser.id}`, currentUser.avatar)
      } else {
        const savedAvatar = localStorage.getItem(`xindong_avatar_${currentUser.id}`)
        if (savedAvatar) setAvatar(savedAvatar)
      }

      // 检查问卷完成状态
      try {
        const answers = localStorage.getItem('questionnaireAnswers')
        if (answers) {
          const parsed = JSON.parse(answers)
          setQuestionnaireCompleted(Object.keys(parsed).length >= 66)
        }
      } catch (e) {}

      // 检查照片数量
      try {
        const photos = localStorage.getItem(`xindong_photos_${currentUser.id}`)
        if (photos) {
          const parsed = JSON.parse(photos)
          setPhotoCount(Array.isArray(parsed) ? parsed.filter((p: string) => p).length : 0)
        }
      } catch (e) {}

      // 检查个人简介
      setBioCompleted(!!userProfile.bio && userProfile.bio.length > 10)

      // 获取互相喜欢列表
      fetchMutualLikes()
      
      // 加载通知
      loadNotifications()
    }
  }, [isLoading, currentUser, getUserData, fetchMutualLikes, loadNotifications])

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      logout()
      window.location.href = '/'
    }
  }

  const handleChat = (userId: string, nickname: string) => {
    setShowMutualLikes(false)
    window.location.href = `/chat/conversation/?userId=${userId}&nickname=${encodeURIComponent(nickname)}`
  }

  const handleMarkRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const greeting = getGreeting()
  const progress = calculateProgress()
  const personalityScores = { openness: 78, conscientiousness: 65, extraversion: 52, agreeableness: 85, neuroticism: 35 }
  const personalityInsights = [
    { title: '创意先锋', desc: '你对新事物充满好奇', icon: '🌟', gradient: 'from-amber-400 to-orange-500' },
    { title: '可靠伙伴', desc: '做事认真负责', icon: '🎯', gradient: 'from-blue-400 to-cyan-500' },
    { title: '温柔善良', desc: '待人友善，善解人意', icon: '💚', gradient: 'from-emerald-400 to-green-500' },
    { title: '情绪稳定', desc: '内心平和，应对压力', icon: '🌊', gradient: 'from-teal-400 to-cyan-500' },
  ]

  if (isLoading || !mounted) {
    return (
      <AnimatedBackground variant="purple" showFloatingHearts={true}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-rose-500">加载中...</div>
        </div>
      </AnimatedBackground>
    )
  }

  if (!currentUser) {
    if (typeof window !== 'undefined') window.location.href = '/login'
    return null
  }

  return (
    <AnimatedBackground variant="purple" showFloatingHearts={true}>
      <div className="min-h-screen pb-20">
        <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-rose-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-rose-500/30 overflow-hidden">
                  {avatar ? <img src={avatar} alt="头像" className="w-full h-full object-cover" /> : (profile.nickname || currentUser?.nickname || '?')[0]}
                </div>
                <div>
                  <h1 className="font-bold text-gray-800">{profile.nickname || currentUser?.nickname || '我的'}的主页</h1>
                  <p className="text-xs text-gray-500">下次匹配：<GradientText className="font-medium">3月26日</GradientText></p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleLogout} className="p-2.5 hover:bg-gray-100/50 rounded-full transition-colors" title="退出登录">
                  <LogOut className="w-5 h-5 text-gray-600" />
                </button>
                {/* 通知铃铛 - 点击显示通知面板 */}
                <button 
                  onClick={() => setShowNotifications(true)} 
                  className="p-2.5 hover:bg-gray-100/50 rounded-full transition-colors relative"
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  {(unreadInfo.total > 0 || notificationUnread > 0) && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-rose-500 rounded-full">
                      {unreadInfo.total + notificationUnread > 99 ? '99+' : unreadInfo.total + notificationUnread}
                    </span>
                  )}
                </button>
                <Link href="/profile/edit" className="p-2.5 hover:bg-gray-100/50 rounded-full transition-colors">
                  <Settings className="w-5 h-5 text-gray-600" />
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* 欢迎区域 */}
          <FadeIn delay={0}>
            <div className="relative overflow-hidden rounded-3xl mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500" />
              <div className="relative z-10 p-6 md:p-8 text-white">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">{greeting}，{profile.nickname || currentUser?.nickname || '新用户'}！✨</h2>
                <p className="text-white/90">还有 <span className="font-bold text-xl">7天</span> 就能见到你的新匹配啦~</p>
              </div>
            </div>
          </FadeIn>

          {/* 问卷提示 */}
          {!questionnaireCompleted && (
            <FadeIn delay={0.05}>
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">完善资料解锁全部功能</p>
                    <p className="text-sm text-gray-500">完成问卷后可参与匹配、无限喜欢、主动发起聊天</p>
                  </div>
                </div>
                <Link href="/questionnaire" className="px-4 py-2 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors">去完成</Link>
              </div>
            </FadeIn>
          )}

          {/* 统计卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <FadeIn delay={0.1}>
              <GlassCard className="p-5" hover={true}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-pink-100 rounded-xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800"><AnimatedCounter end={12} duration={1.5} /></p>
                    <p className="text-sm text-gray-500">匹配次数</p>
                  </div>
                </div>
              </GlassCard>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="cursor-pointer" onClick={() => setShowMutualLikes(true)}>
                <GlassCard className="p-5 hover:ring-2 hover:ring-rose-300" hover={true}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-pink-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800"><AnimatedCounter end={mutualLikeUsers.length} duration={1.5} /></p>
                    <p className="text-sm text-gray-500">互相喜欢</p>
                  </div>
                </div>
                <p className="text-xs text-rose-500 mt-2">点击查看 →</p>
                </GlassCard>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <GlassCard className="p-5" hover={true}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800"><AnimatedCounter end={questionnaireCompleted ? 100 : 0} suffix="%" duration={1.5} /></p>
                    <p className="text-sm text-gray-500">问卷完成</p>
                  </div>
                </div>
              </GlassCard>
            </FadeIn>
            <FadeIn delay={0.25}>
              <GlassCard className="p-5" hover={true}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800"><AnimatedCounter end={85} suffix="%" duration={1.5} /></p>
                    <p className="text-sm text-gray-500">平均匹配度</p>
                  </div>
                </div>
              </GlassCard>
            </FadeIn>
          </div>

          {/* 主要内容区域 */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <FadeIn delay={0.3}>
                <GlassCard className="p-6" hover={false}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-rose-500" />
                        人格画像分析
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">完成问卷后生成你的性格分析</p>
                    </div>
                  </div>
                  <PersonalityRadar scores={personalityScores} />
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {personalityInsights.map((insight, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100/50">
                        <div className={`w-10 h-10 bg-gradient-to-br ${insight.gradient} rounded-lg flex items-center justify-center text-xl shadow-lg`}>{insight.icon}</div>
                        <div>
                          <p className="font-semibold text-gray-800">{insight.title}</p>
                          <p className="text-xs text-gray-500">{insight.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </FadeIn>

              <FadeIn delay={0.4}>
                <GlassCard className="p-6" hover={false}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-rose-500" />
                      匹配历史
                    </h3>
                    <Link href="/match" className="text-rose-500 text-sm font-medium hover:underline flex items-center gap-1">
                      查看全部 <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                    <p className="text-gray-400 mb-2">暂无匹配记录</p>
                    <p className="text-sm text-gray-300">完成问卷后等待系统匹配~</p>
                  </div>
                </GlassCard>
              </FadeIn>
            </div>

            <div className="space-y-6">
              <FadeIn delay={0.35}>
                <GlassCard className="p-6" hover={false}>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">快捷入口</h3>
                  <div className="space-y-3">
                    <Link href="/profile/edit" className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:from-rose-50 hover:to-pink-50 transition-all group border border-gray-100/50">
                      <div className="w-10 h-10 bg-gradient-to-br from-rose-100 to-pink-100 rounded-lg flex items-center justify-center group-hover:from-rose-200 group-hover:to-pink-200 transition-all">
                        <Edit2 className="w-5 h-5 text-rose-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">编辑资料</p>
                        <p className="text-xs text-gray-500">完善个人信息</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </Link>
                    <Link href="/questionnaire" className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:from-pink-50 hover:to-purple-50 transition-all group border border-gray-100/50">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center group-hover:from-pink-200 group-hover:to-purple-200 transition-all">
                        <BookOpen className="w-5 h-5 text-pink-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">开始问卷</p>
                        <p className="text-xs text-gray-500">完成66道灵魂问题</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </Link>
                    <Link href="/profile" className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:from-amber-50 hover:to-orange-50 transition-all group border border-gray-100/50">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center group-hover:from-amber-200 group-hover:to-orange-200 transition-all">
                        <Camera className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">上传照片</p>
                        <p className="text-xs text-gray-500">展示真实的你</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </Link>
                  </div>
                </GlassCard>
              </FadeIn>

              {/* 提升匹配质量 - 修复进度显示 */}
              <FadeIn delay={0.45}>
                <div className="relative overflow-hidden rounded-3xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-500 via-pink-500 to-purple-500" />
                  <div className="relative p-6 text-white">
                    <div className="flex items-center gap-2 mb-4">
                      <Zap className="w-5 h-5" />
                      <h3 className="font-bold">提升匹配质量</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold backdrop-blur-sm ${questionnaireCompleted ? 'bg-white text-rose-500' : 'bg-white/20'}`}>
                          {questionnaireCompleted ? <CheckCircle className="w-5 h-5" /> : '1'}
                        </div>
                        <span className="text-sm">完成全部66道问题</span>
                        {questionnaireCompleted && <CheckCircle className="w-4 h-4 ml-auto" />}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold backdrop-blur-sm ${photoCount >= 3 ? 'bg-white text-rose-500' : 'bg-white/20'}`}>
                          {photoCount >= 3 ? <CheckCircle className="w-5 h-5" /> : '2'}
                        </div>
                        <span className="text-sm">上传3-5张生活照片 ({photoCount}/3)</span>
                        {photoCount >= 3 && <CheckCircle className="w-4 h-4 ml-auto" />}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold backdrop-blur-sm ${bioCompleted ? 'bg-white text-rose-500' : 'bg-white/20'}`}>
                          {bioCompleted ? <CheckCircle className="w-5 h-5" /> : '3'}
                        </div>
                        <span className="text-sm">完善个人简介</span>
                        {bioCompleted && <CheckCircle className="w-4 h-4 ml-auto" />}
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <div className="flex items-center justify-between text-sm">
                        <span>完成度</span>
                        <span className="font-bold">{progress}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2 mt-2 overflow-hidden">
                        <motion.div 
                          className="bg-white rounded-full h-2" 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={0.5}>
                <GlassCard className="p-6" hover={false}>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    我的成就
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl opacity-40" title="待解锁">🔒</div>
                    ))}
                  </div>
                </GlassCard>
              </FadeIn>
            </div>
          </div>
        </div>

        {/* 底部导航 */}
        <BottomNav unreadCount={unreadInfo.total} />
      </div>

      {/* 互相喜欢弹窗 */}
      <AnimatePresence>
        {showMutualLikes && (
          <MutualLikesModal 
            users={mutualLikeUsers} 
            onClose={() => setShowMutualLikes(false)} 
            onChat={handleChat}
          />
        )}
      </AnimatePresence>

      {/* 通知弹窗 */}
      <AnimatePresence>
        {showNotifications && (
          <NotificationPanel
            notifications={appNotifications}
            onClose={() => setShowNotifications(false)}
            onMarkRead={markNotificationRead}
            onMarkAllRead={markAllNotificationsRead}
            onChatClick={() => {
              setShowNotifications(false)
              window.location.href = '/chat'
            }}
          />
        )}
      </AnimatePresence>
    </AnimatedBackground>
  )
}
