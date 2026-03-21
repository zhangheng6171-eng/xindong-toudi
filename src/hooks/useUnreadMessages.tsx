'use client'

import { useState, useEffect, useCallback } from 'react'

interface UnreadInfo {
  total: number
  conversations: Record<string, number>
}

// 获取未读消息总数
export function useUnreadMessages(currentUserId: string | null) {
  const [unreadInfo, setUnreadInfo] = useState<UnreadInfo>({ total: 0, conversations: {} })
  const [isLoading, setIsLoading] = useState(false)

  // 从 localStorage 和 API 获取未读数
  const fetchUnreadCount = useCallback(async () => {
    if (!currentUserId) return

    setIsLoading(true)
    try {
      // 尝试从 API 获取
      const response = await fetch(`/api/chat/unread-count?userId=${currentUserId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const info: UnreadInfo = {
            total: data.total || 0,
            conversations: data.conversations || {}
          }
          setUnreadInfo(info)
          // 保存到 localStorage
          localStorage.setItem(`xindong_unread_${currentUserId}`, JSON.stringify(info))
          setIsLoading(false)
          return
        }
      }
    } catch (e) {
      console.log('[UnreadMessages] API failed, using localStorage')
    }

    // 后备：从 localStorage 获取
    try {
      const saved = localStorage.getItem(`xindong_unread_${currentUserId}`)
      if (saved) {
        setUnreadInfo(JSON.parse(saved))
      }
    } catch (e) {}
    setIsLoading(false)
  }, [currentUserId])

  // 标记单条消息为已读
  const markAsRead = useCallback((conversationId: string) => {
    if (!currentUserId) return

    const newInfo = { ...unreadInfo }
    const count = newInfo.conversations[conversationId] || 0
    newInfo.total = Math.max(0, newInfo.total - count)
    delete newInfo.conversations[conversationId]
    setUnreadInfo(newInfo)
    localStorage.setItem(`xindong_unread_${currentUserId}`, JSON.stringify(newInfo))
  }, [currentUserId, unreadInfo])

  // 标记所有消息为已读
  const markAllAsRead = useCallback(() => {
    if (!currentUserId) return

    const emptyInfo: UnreadInfo = { total: 0, conversations: {} }
    setUnreadInfo(emptyInfo)
    localStorage.setItem(`xindong_unread_${currentUserId}`, JSON.stringify(emptyInfo))
  }, [currentUserId])

  // 增加未读数（收到新消息时调用）
  const addUnread = useCallback((conversationId: string, count: number = 1) => {
    if (!currentUserId) return

    const newInfo = { ...unreadInfo }
    newInfo.total += count
    newInfo.conversations[conversationId] = (newInfo.conversations[conversationId] || 0) + count
    setUnreadInfo(newInfo)
    localStorage.setItem(`xindong_unread_${currentUserId}`, JSON.stringify(newInfo))
  }, [currentUserId, unreadInfo])

  // 定期刷新未读数
  useEffect(() => {
    if (!currentUserId) return

    fetchUnreadCount()
    
    // 每30秒刷新一次
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [currentUserId, fetchUnreadCount])

  return {
    unreadInfo,
    isLoading,
    refresh: fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    addUnread
  }
}

// 未读消息 Badge 组件
export function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null
  
  return (
    <span className={`absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full shadow-lg ${count > 99 ? 'min-w-[24px]' : ''}`}>
      {count > 99 ? '99+' : count}
    </span>
  )
}
