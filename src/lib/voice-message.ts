/**
 * 心动投递 - 语音消息工具
 */

// 检查浏览器是否支持录音
export function isRecordingSupported(): boolean {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
}

// 录音状态
export type RecordingStatus = 'inactive' | 'recording' | 'paused'

// 录音结果
export interface AudioRecording {
  blob: Blob
  duration: number
  timestamp: Date
}

// 录音器类
export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private startTime: number = 0
  private status: RecordingStatus = 'inactive'

  // 开始录音
  async start(): Promise<void> {
    if (this.status === 'recording') {
      console.warn('已经在录音中')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      this.mediaRecorder = new MediaRecorder(stream)
      this.audioChunks = []

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }

      this.mediaRecorder.start(100) // 每100ms收集一次数据
      this.startTime = Date.now()
      this.status = 'recording'
    } catch (error) {
      console.error('开始录音失败:', error)
      throw error
    }
  }

  // 停止录音
  async stop(): Promise<AudioRecording> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || this.status !== 'recording') {
        reject(new Error('没有正在进行的录音'))
        return
      }

      this.mediaRecorder.onstop = () => {
        const duration = (Date.now() - this.startTime) / 1000
        const blob = new Blob(this.audioChunks, { type: 'audio/webm' })
        
        // 停止所有轨道
        this.mediaRecorder?.stream.getTracks().forEach(track => track.stop())
        
        this.status = 'inactive'
        
        resolve({
          blob,
          duration,
          timestamp: new Date()
        })
      }

      this.mediaRecorder.stop()
    })
  }

  // 取消录音
  cancel(): void {
    if (this.mediaRecorder && this.status === 'recording') {
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop())
      this.audioChunks = []
      this.status = 'inactive'
    }
  }

  // 获取状态
  getStatus(): RecordingStatus {
    return this.status
  }

  // 获取录音时长
  getDuration(): number {
    if (this.status !== 'recording') return 0
    return (Date.now() - this.startTime) / 1000
  }
}

// 音频转Base64
export function audioToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1]) // 去除 data:audio/xxx;base64, 前缀
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// Base64转音频Blob
export function base64ToAudio(base64: string, mimeType: string = 'audio/webm'): Blob {
  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: mimeType })
}

// 播放音频
export function playAudio(audioSrc: string): HTMLAudioElement {
  const audio = new Audio(audioSrc)
  audio.play()
  return audio
}

// 格式化时长
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
