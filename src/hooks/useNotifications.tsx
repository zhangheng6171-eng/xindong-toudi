'use client'

import { useState, useEffect, useCallback } from 'react'

// 通知类型
export interface AppNotification {
  id: string
  type: 'message' | 'match' | 'like' | 'system' | 'reminder'
  title: string
  content: string
  time: string
  read: boolean
  action?: {
    label: string
    href: string
  }
  metadata?: Record<string, any>
}

// 获取下次匹配时间
function getNextMatchDate(): { date: Date; daysLeft: number } {
  const now = new Date()
  const currentDay = now.getDay() // 0 = 周日
  const daysUntilWednesday = (3 - currentDay + 7) % 7 || 7 // 周三
  
  const nextMatch = new Date(now)
  nextMatch.setDate(now.getDate() + daysUntilWednesday)
  nextMatch.setHours(20, 0, 0, 0)
  
  return {
    date: nextMatch,
    daysLeft: daysUntilWednesday
  }
}

// 生成默认提醒
function generateDefaultNotifications(): AppNotification[] {
  const { date, daysLeft } = getNextMatchDate()
  const dateStr = `${date.getMonth() + 1}月${date.getDate()}日`
  
  return [
    {
      id: 'match_reminder',
      type: 'match',
      title: '🎯 匹配提醒',
      content: `距离下次匹配还有 ${daysLeft} 天（${dateStr} 周三晚8点）`,
      time: '即将到来',
      read: false,
      action: {
        label: '查看匹配',
        href: '/match'
      },
      metadata: {
        matchDate: date.toISOString(),
        daysLeft
      }
    },
    {
      id: 'profile_reminder',
      type: 'reminder',
      title: '📝 完善资料',
      content: '完善个人资料和问卷，提高匹配精准度！',
      time: '长期有效',
      read: false,
      action: {
        label: '去完善',
        href: '/questionnaire'
      }
    },
    {
      id: 'welcome',
      type: 'system',
      title: '👋 欢迎使用心动投递',
      content: '找到你的命中注定~',
      time: '刚刚',
      read: true
    }
  ]
}

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // 加载通知
  const loadNotifications = useCallback(async () => {
    if (!userId) return

    setIsLoading(true)
    try {
      // 尝试从 localStorage 加载
      const saved = localStorage.getItem(`xindong_notifications_${userId}`)
      if (saved) {
        const parsed = JSON.parse(saved) as AppNotification[]
        setNotifications(parsed)
        setUnreadCount(parsed.filter(n => !n.read).length)
      } else {
        // 首次使用，生成默认通知
        const defaults = generateDefaultNotifications()
        setNotifications(defaults)
        setUnreadCount(defaults.filter(n => !n.read).length)
        localStorage.setItem(`xindong_notifications_${userId}`, JSON.stringify(defaults))
      }
    } catch (e) {
      console.error('[Notifications] Load failed:', e)
      const defaults = generateDefaultNotifications()
      setNotifications(defaults)
      setUnreadCount(defaults.filter(n => !n.read).length)
    }
    setIsLoading(false)
  }, [userId])

  // 添加新通知
  const addNotification = useCallback((notification: Omit<AppNotification, 'id' | 'time' | 'read'>) => {
    if (!userId) return

    const newNotification: AppNotification = {
      ...notification,
      id: `notif_${Date.now()}`,
      time: '刚刚',
      read: false
    }

    const updated = [newNotification, ...notifications]
    setNotifications(updated)
    setUnreadCount(prev => prev + 1)
    localStorage.setItem(`xindong_notifications_${userId}`, JSON.stringify(updated))
  }, [userId, notifications])

  // 标记为已读
  const markAsRead = useCallback((id: string) => {
    if (!userId) return

    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    )
    setNotifications(updated)
    setUnreadCount(prev => Math.max(0, prev - 1))
    localStorage.setItem(`xindong_notifications_${userId}`, JSON.stringify(updated))
  }, [userId, notifications])

  // 全部标记为已读
  const markAllAsRead = useCallback(() => {
    if (!userId) return

    const updated = notifications.map(n => ({ ...n, read: true }))
    setNotifications(updated)
    setUnreadCount(0)
    localStorage.setItem(`xindong_notifications_${userId}`, JSON.stringify(updated))
  }, [userId, notifications])

  // 删除通知
  const removeNotification = useCallback((id: string) => {
    if (!userId) return

    const notification = notifications.find(n => n.id === id)
    const updated = notifications.filter(n => n.id !== id)
    setNotifications(updated)
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
    localStorage.setItem(`xindong_notifications_${userId}`, JSON.stringify(updated))
  }, [userId, notifications])

  // 定期刷新
  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  return {
    notifications,
    unreadCount,
    isLoading,
    refresh: loadNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification
  }
}

// 通知图标组件
export function NotificationBadge({ count }: { count: number }) {
  if (count <= 0) return null
  
  return (
    <span className={`absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full shadow-lg ${count > 99 ? 'min-w-[20px]' : ''}`}>
      {count > 99 ? '99+' : count}
    </span>
  )
}
