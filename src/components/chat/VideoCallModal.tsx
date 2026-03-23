'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Video, VideoOff, Mic, MicOff, PhoneOff, Phone, Maximize2, Minimize2, Settings } from 'lucide-react'

// Supabase 配置
const SUPABASE_URL = 'https://ntaqnyegiiwtzdyqjiwy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50YXFueWVnaWl3dHpkeXFqaXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTY4NzUsImV4cCI6MjA4OTQ5Mjg3NX0.4FEAb1Yd4xOwXz3LcfZ9iPG0ZZPbFd8dfry903c5lPc'

interface VideoCallModalProps {
  isOpen: boolean
  roomId: string
  peerId: string
  peerName: string
  currentUserId: string
  isCaller: boolean
  onClose: () => void
  onCallEnded: () => void
}

type CallStatus = 'connecting' | 'ringing' | 'connected' | 'ended' | 'failed' | 'rejected'

// ICE 服务器配置（使用免费的公共STUN服务器）
const iceServers: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' }
]

export function VideoCallModal({
  isOpen,
  roomId,
  peerId,
  peerName,
  currentUserId,
  isCaller,
  onClose,
  onCallEnded
}: VideoCallModalProps) {
  const [status, setStatus] = useState<CallStatus>('connecting')
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // 格式化通话时长
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // 初始化本地媒体流
  const initLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: true
      })
      setLocalStream(stream)
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
      return stream
    } catch (err) {
      console.error('Failed to get media devices:', err)
      setError('无法访问摄像头或麦克风，请检查权限设置')
      setStatus('failed')
      return null
    }
  }, [])

  // 创建 WebRTC 连接
  const createPeerConnection = useCallback((stream: MediaStream) => {
    const pc = new RTCPeerConnection({ iceServers })

    // 添加本地 tracks
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream)
    })

    // 监听远程流
    pc.ontrack = (event) => {
      const [remoteMediaStream] = event.streams
      setRemoteStream(remoteMediaStream)
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteMediaStream
      }
      setStatus('connected')
    }

    // ICE 连接状态变化
    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', pc.iceConnectionState)
      if (pc.iceConnectionState === 'connected') {
        setStatus('connected')
      } else if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        setStatus('ended')
      }
    }

    peerConnectionRef.current = pc
    return pc
  }, [])

  // 轮询呼叫状态
  const pollCallStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/call/video/status?roomId=${roomId}`)
      const data = await response.json()

      if (data.status === 'accepted') {
        // 对方接受了呼叫，开始建立 WebRTC 连接
        if (isCaller && !peerConnectionRef.current) {
          const stream = localStream || await initLocalStream()
          if (stream) {
            const pc = createPeerConnection(stream)
            
            // 创建 Offer
            const offer = await pc.createOffer()
            await pc.setLocalDescription(offer)

            // 发送 Offer 到服务器
            await fetch('/api/call/video/webrtc', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                roomId,
                type: 'offer',
                sdp: offer
              })
            })
          }
        }
        setStatus('connected')
      } else if (data.status === 'rejected') {
        setStatus('rejected')
        setError('对方拒绝了视频通话')
      } else if (data.status === 'ended') {
        setStatus('ended')
      }
    } catch (err) {
      console.error('Poll status error:', err)
    }
  }, [roomId, isCaller, localStream, initLocalStream, createPeerConnection])

  // 处理呼叫
  useEffect(() => {
    if (!isOpen || !roomId) return

    const setupCall = async () => {
      setStatus(isCaller ? 'connecting' : 'ringing')
      
      if (isCaller) {
        // 发起方：获取本地流并开始轮询
        const stream = await initLocalStream()
        if (stream) {
          createPeerConnection(stream)
        }
        
        // 开始轮询状态
        pollingRef.current = setInterval(pollCallStatus, 2000)
      } else {
        // 接收方：等待用户接受
        setStatus('ringing')
      }
    }

    setupCall()

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [isOpen, roomId, isCaller, initLocalStream, createPeerConnection, pollCallStatus])

  // 计时器
  useEffect(() => {
    if (status === 'connected') {
      timerRef.current = setInterval(() => {
        setDuration(d => d + 1)
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [status])

  // 切换静音
  const toggleMute = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = isMuted
      })
      setIsMuted(!isMuted)
    }
  }, [localStream, isMuted])

  // 切换摄像头
  const toggleVideo = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = isVideoOff
      })
      setIsVideoOff(!isVideoOff)
    }
  }, [localStream, isVideoOff])

  // 结束通话
  const endCall = useCallback(async () => {
    try {
      await fetch('/api/call/video/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId })
      })
    } catch (err) {
      console.error('End call error:', err)
    }

    // 清理资源
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    setStatus('ended')
    onCallEnded()
    onClose()
  }, [roomId, localStream, onCallEnded, onClose])

  // 接受通话（接收方）
  const acceptCall = useCallback(async () => {
    try {
      // 获取本地流
      const stream = await initLocalStream()
      if (!stream) return

      const pc = createPeerConnection(stream)
      
      // 接受呼叫
      await fetch('/api/call/video/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, userId: currentUserId })
      })

      setStatus('connecting')
    } catch (err) {
      console.error('Accept call error:', err)
      setError('接听失败')
      setStatus('failed')
    }
  }, [roomId, currentUserId, initLocalStream, createPeerConnection])

  // 拒绝通话（接收方）
  const rejectCall = useCallback(async () => {
    try {
      await fetch('/api/call/video/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, userId: currentUserId })
      })
    } catch (err) {
      console.error('Reject call error:', err)
    }
    onClose()
  }, [roomId, currentUserId, onClose])

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop())
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
      }
    }
  }, [localStream])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      {/* 主视频区域 */}
      <div className="relative w-full h-full max-w-4xl max-h-[80vh] mx-4">
        
        {/* 远程视频 */}
        <div className="absolute inset-0 bg-gray-900 rounded-2xl overflow-hidden">
          {status === 'connected' && remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : status === 'rejected' ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-white">
                <PhoneOff className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-xl">对方拒绝了视频通话</p>
              </div>
            </div>
          ) : status === 'failed' ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-white">
                <VideoOff className="w-16 h-16 mx-auto mb-4 text-red-500" />
                <p className="text-xl">{error || '通话连接失败'}</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold">{peerName[0]}</span>
                </div>
                <p className="text-xl mb-2">{peerName}</p>
                <p className="text-gray-400">
                  {status === 'connecting' && '正在连接...'}
                  {status === 'ringing' && (isCaller ? '等待对方接听...' : '有人发起视频通话')}
                  {status === 'ended' && '通话已结束'}
                </p>
                {status === 'ringing' && !isCaller && (
                  <div className="mt-4 flex justify-center gap-4">
                    <button
                      onClick={acceptCall}
                      className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center gap-2"
                    >
                      <Phone className="w-5 h-5" />
                      接听
                    </button>
                    <button
                      onClick={rejectCall}
                      className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center gap-2"
                    >
                      <PhoneOff className="w-5 h-5" />
                      拒绝
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 本地视频预览 */}
        <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-xl overflow-hidden shadow-lg border-2 border-gray-700">
          {localStream && !isVideoOff ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-700">
              <VideoOff className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* 顶部状态栏 */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
            <span className="text-white text-sm">
              {status === 'connected' ? formatDuration(duration) : '视频通话'}
            </span>
          </div>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-gray-800/50 hover:bg-gray-800 text-white rounded-full"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>

        {/* 底部控制栏 */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-800/50 hover:bg-gray-800'} text-white`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-gray-800/50 hover:bg-gray-800'} text-white`}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>
          <button
            onClick={endCall}
            className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default VideoCallModal
