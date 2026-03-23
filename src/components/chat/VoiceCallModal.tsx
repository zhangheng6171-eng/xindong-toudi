'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Phone, PhoneOff, Mic, MicOff, PhoneCall } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// WebRTC 配置
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' }
]

interface VoiceCallModalProps {
  visible: boolean
  mode: 'incoming' | 'outgoing' | 'connected'
  roomId?: string
  peerName: string
  peerAvatar?: string | null
  currentUserId: string
  onAccept?: () => void
  onReject?: () => void
  onEnd?: () => void
  onClose?: () => void
}

export function VoiceCallModal({
  visible,
  mode,
  roomId,
  peerName,
  peerAvatar,
  currentUserId,
  onAccept,
  onReject,
  onEnd,
  onClose
}: VoiceCallModalProps) {
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  // 格式化通话时长
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // 初始化本地音频流
  const initLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      localStreamRef.current = stream
      return stream
    } catch (error) {
      console.error('Failed to get user media:', error)
      return null
    }
  }, [])

  // 创建 WebRTC 连接
  const createPeerConnection = useCallback(async () => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })
    
    pc.onicecandidate = (event) => {
      if (event.candidate && roomId) {
        // 发送 ICE candidate
        fetch('/api/call/signal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId,
            senderId: currentUserId,
            type: 'ice-candidate',
            payload: event.candidate
          })
        })
      }
    }

    pc.ontrack = (event) => {
      // 播放远程音频
      const audio = new Audio()
      audio.srcObject = event.streams[0]
      audio.play()
    }

    pc.onconnectionstatechange = () => {
      switch (pc.connectionState) {
        case 'connected':
          setConnectionStatus('connected')
          break
        case 'disconnected':
        case 'failed':
          setConnectionStatus('disconnected')
          break
      }
    }

    // 添加本地音频轨道
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!)
      })
    }

    peerConnectionRef.current = pc
    return pc
  }, [roomId, currentUserId])

  // 轮询信令服务器
  const startPolling = useCallback(() => {
    if (!roomId) return

    let lastTimestamp = Date.now()

    pollingRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/call/signal?roomId=${roomId}&lastTimestamp=${lastTimestamp}`)
        const data = await response.json()
        
        if (data.messages && data.messages.length > 0) {
          lastTimestamp = data.timestamp

          for (const msg of data.messages) {
            if (msg.senderId === currentUserId) continue

            const pc = peerConnectionRef.current
            if (!pc) continue

            if (msg.type === 'offer') {
              await pc.setRemoteDescription(new RTCSessionDescription(msg.payload))
              const answer = await pc.createAnswer()
              await pc.setLocalDescription(answer)
              
              await fetch('/api/call/signal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  roomId,
                  senderId: currentUserId,
                  type: 'answer',
                  payload: answer
                })
              })
            } else if (msg.type === 'answer') {
              await pc.setRemoteDescription(new RTCSessionDescription(msg.payload))
            } else if (msg.type === 'ice-candidate') {
              await pc.addIceCandidate(new RTCIceCandidate(msg.payload))
            }
          }
        }

        // 检查通话状态
        const statusRes = await fetch(`/api/call/accept?roomId=${roomId}`)
        const statusData = await statusRes.json()
        
        if (statusData.status === 'rejected' || statusData.status === 'ended') {
          handleEnd()
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 2000)
  }, [roomId, currentUserId])

  // 停止轮询
  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }

  // 处理结束通话
  const handleEnd = async () => {
    stopPolling()
    
    // 关闭 WebRTC 连接
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }

    // 停止本地音频
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
      localStreamRef.current = null
    }

    // 通知服务器
    if (roomId) {
      await fetch('/api/call/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          userId: currentUserId,
          action: 'end'
        })
      })
    }

    setDuration(0)
    setConnectionStatus('disconnected')
    onEnd?.()
  }

  // 处理接受呼叫
  const handleAccept = async () => {
    await initLocalStream()
    const pc = await createPeerConnection()
    
    // 创建 offer
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)

    // 发送 offer
    await fetch('/api/call/signal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId,
        senderId: currentUserId,
        type: 'offer',
        payload: offer
      })
    })

    // 通知服务器接受
    await fetch('/api/call/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId,
        userId: currentUserId,
        action: 'accept'
      })
    })

    startPolling()
    onAccept?.()
  }

  // 处理拒绝呼叫
  const handleReject = async () => {
    if (roomId) {
      await fetch('/api/call/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          userId: currentUserId,
          action: 'reject'
        })
      })
    }
    onReject?.()
  }

  // 切换静音
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!audioTrack.enabled)
      }
    }
  }

  // 计时器
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (mode === 'connected') {
      interval = setInterval(() => {
        setDuration(prev => prev + 1)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [mode])

  // 初始化（ outgoing 模式）
  useEffect(() => {
    if (mode === 'outgoing' && visible) {
      initLocalStream().then(() => {
        createPeerConnection().then(pc => {
          // 创建 offer
          pc.createOffer().then(offer => {
            pc.setLocalDescription(offer)
            
            // 发送 offer
            fetch('/api/call/signal', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                roomId,
                senderId: currentUserId,
                type: 'offer',
                payload: offer
              })
            })
          })

          // 启动轮询等待 answer
          startPolling()
        })
      })

      // 定期检查是否被接受
      const checkInterval = setInterval(async () => {
        if (!roomId) return
        
        const response = await fetch(`/api/call/accept?roomId=${roomId}`)
        const data = await response.json()
        
        if (data.status === 'accepted') {
          clearInterval(checkInterval)
        } else if (data.status === 'rejected') {
          clearInterval(checkInterval)
          handleEnd()
          alert('对方拒绝接听')
        }
      }, 2000)

      return () => {
        clearInterval(checkInterval)
        stopPolling()
      }
    }
  }, [mode, visible, roomId, currentUserId, initLocalStream, createPeerConnection, startPolling])

  // incoming 模式初始化
  useEffect(() => {
    if (mode === 'incoming' && visible) {
      // 等待用户操作
    }
  }, [mode, visible])

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      stopPolling()
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  if (!visible) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-3xl p-8 w-80 text-center shadow-2xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
        >
          {/* 头像 */}
          <div className="mb-6">
            {peerAvatar ? (
              <img
                src={peerAvatar}
                alt={peerName}
                className="w-24 h-24 rounded-full mx-auto object-cover ring-4 ring-rose-100"
              />
            ) : (
              <div className="w-24 h-24 rounded-full mx-auto bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-4xl font-bold ring-4 ring-rose-100">
                {peerName[0] || '?'}
              </div>
            )}
          </div>

          {/* 名称 */}
          <h2 className="text-xl font-bold text-gray-900 mb-2">{peerName}</h2>

          {/* 状态 */}
          <div className="text-gray-500 mb-6">
            {mode === 'incoming' && (
              <div className="flex items-center justify-center gap-2">
                <PhoneCall className="w-5 h-5 text-rose-500 animate-pulse" />
                <span>来电呼叫</span>
              </div>
            )}
            {mode === 'outgoing' && (
              <div className="flex items-center justify-center gap-2">
                <Phone className="w-5 h-5 text-rose-500 animate-pulse" />
                <span>呼叫中...</span>
              </div>
            )}
            {mode === 'connected' && (
              <div className="text-2xl font-mono text-rose-500">
                {formatDuration(duration)}
              </div>
            )}
          </div>

          {/* 按钮 */}
          <div className="flex justify-center gap-4">
            {mode === 'incoming' && (
              <>
                {/* 拒绝 */}
                <button
                  onClick={handleReject}
                  className="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
                {/* 接听 */}
                <button
                  onClick={handleAccept}
                  className="w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors shadow-lg"
                >
                  <Phone className="w-6 h-6" />
                </button>
              </>
            )}

            {mode === 'outgoing' && (
              <button
                onClick={handleEnd}
                className="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            )}

            {mode === 'connected' && (
              <>
                {/* 静音 */}
                <button
                  onClick={toggleMute}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-lg ${
                    isMuted ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                {/* 结束 */}
                <button
                  onClick={handleEnd}
                  className="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* 关闭按钮 (仅在非通话中显示) */}
          {mode !== 'connected' && (
            <button
              onClick={onClose}
              className="mt-6 text-gray-400 hover:text-gray-600 text-sm"
            >
              关闭
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
