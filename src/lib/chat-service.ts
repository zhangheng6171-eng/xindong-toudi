/**
 * 心动投递 - 聊天服务
 * 
 * 实时消息服务，支持WebSocket连接
 */

// ============================================
// 类型定义
// ============================================

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  receiverId: string
  content: string
  type: 'text' | 'image' | 'voice' | 'system'
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
  createdAt: Date
  readAt?: Date
  metadata?: Record<string, any>
}

export interface Conversation {
  id: string
  participants: string[]
  matchId: string
  matchScore: number
  lastMessage?: ChatMessage
  unreadCount: number
  createdAt: Date
  updatedAt: Date
}

export interface TypingIndicator {
  conversationId: string
  userId: string
  isTyping: boolean
}

export interface OnlineStatus {
  userId: string
  isOnline: boolean
  lastSeen?: Date
}

export interface ChatEvent {
  type: 'new_message' | 'message_read' | 'typing' | 'online_status'
  payload: any
}

// ============================================
// 聊天服务类
// ============================================

export class ChatService {
  private ws: WebSocket | null = null
  private userId: string
  private onMessageCallback?: (message: ChatMessage) => void
  private onTypingCallback?: (indicator: TypingIndicator) => void
  private onOnlineStatusCallback?: (status: OnlineStatus) => void
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  constructor(userId: string) {
    this.userId = userId
  }

  /**
   * 连接WebSocket
   */
  connect(url: string = 'wss://api.xindongtoudi.com/ws'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url)

        this.ws.onopen = () => {
          console.log('WebSocket connected')
          this.reconnectAttempts = 0
          this.sendAuth()
          resolve()
        }

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data)
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          reject(error)
        }

        this.ws.onclose = () => {
          console.log('WebSocket closed')
          this.handleReconnect()
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 发送认证信息
   */
  private sendAuth() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'auth',
        userId: this.userId,
        timestamp: Date.now()
      }))
    }
  }

  /**
   * 处理重连
   */
  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts)
      
      setTimeout(() => {
        console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`)
        this.connect()
      }, delay)
    }
  }

  /**
   * 处理接收的消息
   */
  private handleMessage(data: string) {
    try {
      const event: ChatEvent = JSON.parse(data)

      switch (event.type) {
        case 'new_message':
          this.onMessageCallback?.(event.payload as ChatMessage)
          break
        case 'typing':
          this.onTypingCallback?.(event.payload as TypingIndicator)
          break
        case 'online_status':
          this.onOnlineStatusCallback?.(event.payload as OnlineStatus)
          break
      }
    } catch (error) {
      console.error('Error parsing message:', error)
    }
  }

  /**
   * 发送消息
   */
  async sendMessage(
    conversationId: string,
    receiverId: string,
    content: string,
    type: 'text' | 'image' | 'voice' = 'text'
  ): Promise<ChatMessage> {
    const message: ChatMessage = {
      id: this.generateId(),
      conversationId,
      senderId: this.userId,
      receiverId,
      content,
      type,
      status: 'sending',
      createdAt: new Date()
    }

    // 通过WebSocket发送
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'send_message',
        payload: message
      }))
    }

    // 同时通过HTTP API发送（确保可靠性）
    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      })
      
      const savedMessage = await response.json()
      return savedMessage
    } catch (error) {
      message.status = 'failed'
      throw error
    }
  }

  /**
   * 标记消息已读
   */
  async markAsRead(conversationId: string, messageIds: string[]): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'mark_read',
        payload: { conversationId, messageIds }
      }))
    }

    await fetch('/api/chat/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, messageIds })
    })
  }

  /**
   * 发送正在输入状态
   */
  sendTypingIndicator(conversationId: string, isTyping: boolean): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'typing',
        payload: {
          conversationId,
          userId: this.userId,
          isTyping
        }
      }))
    }
  }

  /**
   * 获取会话列表
   */
  async getConversations(): Promise<Conversation[]> {
    const response = await fetch('/api/chat/conversations')
    return response.json()
  }

  /**
   * 获取消息历史
   */
  async getMessages(
    conversationId: string,
    options?: {
      limit?: number
      before?: string
    }
  ): Promise<ChatMessage[]> {
    const params = new URLSearchParams()
    if (options?.limit) params.set('limit', options.limit.toString())
    if (options?.before) params.set('before', options.before)

    const response = await fetch(
      `/api/chat/${conversationId}/messages?${params}`
    )
    return response.json()
  }

  /**
   * 获取未读消息数
   */
  async getUnreadCount(): Promise<number> {
    const response = await fetch('/api/chat/unread-count')
    const { count } = await response.json()
    return count
  }

  /**
   * 设置消息回调
   */
  onMessage(callback: (message: ChatMessage) => void): void {
    this.onMessageCallback = callback
  }

  /**
   * 设置输入状态回调
   */
  onTyping(callback: (indicator: TypingIndicator) => void): void {
    this.onTypingCallback = callback
  }

  /**
   * 设置在线状态回调
   */
  onOnlineStatus(callback: (status: OnlineStatus) => void): void {
    this.onOnlineStatusCallback = callback
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 检查连接状态
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

// ============================================
// 聊天辅助功能
// ============================================

/**
 * 开场白生成器
 */
export function generateOpeningLine(matchResult: {
  score: number
  matchReasons: string[]
  sharedInterests: string[]
}): string[] {
  const lines: string[] = []

  // 基于匹配分数
  if (matchResult.score >= 90) {
    lines.push('我们的匹配度好高！感觉我们一定有很多共同话题 💫')
  }

  // 基于匹配原因
  matchResult.matchReasons.forEach(reason => {
    if (reason.includes('价值观')) {
      lines.push('看到我们的价值观很相似，你对人生最重要的是什么？')
    }
    if (reason.includes('性格')) {
      lines.push('感觉我们的性格很合拍，你平时喜欢怎么放松自己？')
    }
    if (reason.includes('兴趣')) {
      lines.push('发现我们有不少共同兴趣，你最近在追什么剧吗？')
    }
  })

  // 基于共同兴趣
  if (matchResult.sharedInterests.length > 0) {
    const interest = matchResult.sharedInterests[0]
    lines.push(`看到你也喜欢${interest}，有什么推荐吗？`)
  }

  // 通用开场白
  lines.push('你好呀！很高兴认识你 😊')
  lines.push('嗨！要不要聊聊天？')

  return Array.from(new Set(lines)) // 去重
}

/**
 * 话题推荐
 */
export function suggestTopics(user1Profile: any, user2Profile: any): {
  topic: string
  reason: string
  emoji: string
}[] {
  const topics: { topic: string; reason: string; emoji: string }[] = []

  // 共同兴趣
  const sharedInterests = findSharedInterests(
    user1Profile.interests,
    user2Profile.interests
  )
  sharedInterests.forEach(interest => {
    topics.push({
      topic: `关于${interest}，你有什么推荐吗？`,
      reason: '共同兴趣',
      emoji: '💡'
    })
  })

  // 价值观相关
  if (user1Profile.values?.includes('travel') && user2Profile.values?.includes('travel')) {
    topics.push({
      topic: '你最想去的旅行目的地是哪里？',
      reason: '都喜欢旅行',
      emoji: '✈️'
    })
  }

  // 音乐
  topics.push({
    topic: '最近单曲循环的歌是什么？',
    reason: '轻松话题',
    emoji: '🎵'
  })

  // 美食
  topics.push({
    topic: '你最喜欢的美食是什么？',
    reason: '美食话题',
    emoji: '🍜'
  })

  // 电影
  topics.push({
    topic: '最近有什么好看的电影推荐吗？',
    reason: '电影话题',
    emoji: '🎬'
  })

  // 书籍
  topics.push({
    topic: '有什么好书推荐吗？',
    reason: '阅读话题',
    emoji: '📚'
  })

  return topics.slice(0, 6) // 返回前6个
}

/**
 * 找到共同兴趣
 */
function findSharedInterests(interests1: string[], interests2: string[]): string[] {
  if (!interests1 || !interests2) return []
  return interests1.filter(i => interests2.includes(i))
}

/**
 * 检测冷场
 */
export function detectSilence(
  messages: ChatMessage[],
  thresholdMinutes: number = 5
): boolean {
  if (messages.length === 0) return true

  const lastMessage = messages[messages.length - 1]
  const timeSinceLastMessage = Date.now() - new Date(lastMessage.createdAt).getTime()
  
  return timeSinceLastMessage > thresholdMinutes * 60 * 1000
}

/**
 * 生成快捷回复建议
 */
export function generateQuickReplies(lastMessage: string): string[] {
  const replies: string[] = []

  // 基于最后一条消息生成回复
  if (lastMessage.includes('?') || lastMessage.includes('？')) {
    // 如果是问题，提供答案模板
    replies.push('是的，我也有同感！')
    replies.push('我觉得是...')
  }

  if (lastMessage.includes('哈哈') || lastMessage.includes('哈哈')) {
    replies.push('你太可爱了 😂')
  }

  // 通用回复
  replies.push('这个很有意思！')
  replies.push('我也是这么想的')
  replies.push('继续说说？')

  return replies.slice(0, 4)
}

/**
 * 消息格式化
 */
export function formatMessage(content: string): string {
  // 处理表情
  content = content.replace(/:\)/g, '😊')
  content = content.replace(/:\(/g, '😔')
  content = content.replace(/:D/g, '😄')
  
  // 处理链接
  content = content.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" class="text-blue-500 underline">$1</a>'
  )
  
  return content
}

/**
 * 敏感词过滤
 */
export function filterSensitiveWords(content: string): {
  filtered: boolean
  content: string
  matchedWords: string[]
} {
  const sensitiveWords = [
    // 这里应该从数据库加载
    '违禁词1',
    '违禁词2'
  ]

  let filteredContent = content
  const matchedWords: string[] = []

  sensitiveWords.forEach(word => {
    if (content.includes(word)) {
      matchedWords.push(word)
      filteredContent = filteredContent.replace(
        new RegExp(word, 'g'),
        '*'.repeat(word.length)
      )
    }
  })

  return {
    filtered: matchedWords.length > 0,
    content: filteredContent,
    matchedWords
  }
}

// ============================================
// 导出单例
// ============================================

let chatServiceInstance: ChatService | null = null

export function getChatService(userId: string): ChatService {
  if (!chatServiceInstance) {
    chatServiceInstance = new ChatService(userId)
  }
  return chatServiceInstance
}

export default ChatService
