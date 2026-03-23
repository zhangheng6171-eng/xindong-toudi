'use client'

import { Video, Phone } from 'lucide-react'
import { useState, useCallback } from 'react'

// Supabase 配置
const SUPABASE_URL = 'https://ntaqnyegiiwtzdyqjiwy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50YXFueWVnaWl3dHpkeXFqaXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTY4NzUsImV4cCI6MjA4OTQ5Mjg3NX0.4FEAb1Yd4xOwXz3LcfZ9iPG0ZZPbFd8dfry903c5lPc'

interface VideoCallButtonProps {
  peerId: string
  peerName: string
  currentUserId: string
  onCallInitiated?: (roomId: string) => void
  onError?: (error: string) => void
}

export function VideoCallButton({ 
  peerId, 
  peerName, 
  currentUserId, 
  onCallInitiated,
  onError 
}: VideoCallButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isCalling, setIsCalling] = useState(false)

  const initiateVideoCall = useCallback(async () => {
    if (!currentUserId || !peerId || isLoading || isCalling) return

    setIsLoading(true)
    setIsCalling(true)

    try {
      const response = await fetch('/api/call/video/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          callerId: currentUserId,
          calleeId: peerId,
          callType: 'video'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '发起视频通话失败')
      }

      // 存储房间ID到本地存储，用于后续轮询状态
      localStorage.setItem(`video_call_${data.roomId}`, JSON.stringify({
        peerId,
        peerName,
        isCaller: true,
        startTime: Date.now()
      }))

      onCallInitiated?.(data.roomId)
    } catch (error) {
      console.error('Video call error:', error)
      const message = error instanceof Error ? error.message : '发起视频通话失败'
      onError?.(message)
    } finally {
      setIsLoading(false)
    }
  }, [currentUserId, peerId, peerName, isLoading, isCalling, onCallInitiated, onError])

  return (
    <button
      onClick={initiateVideoCall}
      disabled={isLoading || isCalling}
      className="p-2 hover:bg-rose-100 rounded-full transition-colors disabled:opacity-50"
      title="视频通话"
    >
      {isLoading ? (
        <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      ) : (
        <Video className="w-6 h-6 text-rose-500" />
      )}
    </button>
  )
}

export default VideoCallButton
