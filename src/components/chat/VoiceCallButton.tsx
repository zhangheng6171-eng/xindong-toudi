'use client'

import { Phone } from 'lucide-react'
import { useState } from 'react'

interface VoiceCallButtonProps {
  peerId: string
  peerName: string
  currentUserId: string
  onCallStart?: (roomId: string) => void
}

export function VoiceCallButton({ peerId, peerName, currentUserId, onCallStart }: VoiceCallButtonProps) {
  const [loading, setLoading] = useState(false)

  const initiateCall = async () => {
    if (loading) return
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/call/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerId: currentUserId,
          calleeId: peerId
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        onCallStart?.(data.roomId)
      } else {
        console.error('Failed to initiate call:', data.error)
        alert(data.error || '发起呼叫失败')
      }
    } catch (error) {
      console.error('Call initiation error:', error)
      alert('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={initiateCall}
      disabled={loading}
      className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50 transition-colors"
      title="语音通话"
    >
      <Phone className="w-5 h-5 text-gray-600" />
    </button>
  )
}
