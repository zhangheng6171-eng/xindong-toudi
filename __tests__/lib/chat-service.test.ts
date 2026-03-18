/**
 * 聊天服务单元测试
 */

import {
  ChatService,
  generateOpeningLine,
  suggestTopics,
  detectSilence,
  generateQuickReplies,
  filterSensitiveWords,
  formatMessage,
} from '@/lib/chat-service'

describe('Chat Service', () => {
  const userId = 'test-user-id'

  describe('ChatService', () => {
    let chatService: ChatService

    beforeEach(() => {
      chatService = new ChatService(userId)
    })

    it('should create chat service with user id', () => {
      expect(chatService).toBeDefined()
    })

    it('should check connection status', () => {
      const isConnected = chatService.isConnected()
      expect(typeof isConnected).toBe('boolean')
    })
  })

  describe('generateOpeningLine', () => {
    it('should generate opening lines for high match score', () => {
      const matchResult = {
        score: 95,
        matchReasons: ['价值观高度契合', '性格互补'],
        sharedInterests: ['旅行', '美食'],
      }

      const lines = generateOpeningLine(matchResult)
      
      expect(Array.isArray(lines)).toBe(true)
      expect(lines.length).toBeGreaterThan(0)
    })

    it('should include shared interests in opening lines', () => {
      const matchResult = {
        score: 80,
        matchReasons: ['性格相似'],
        sharedInterests: ['旅行'],
      }

      const lines = generateOpeningLine(matchResult)
      const hasInterestLine = lines.some(line => line.includes('旅行'))
      
      expect(hasInterestLine).toBe(true)
    })

    it('should handle edge case with no shared interests', () => {
      const matchResult = {
        score: 70,
        matchReasons: [],
        sharedInterests: [],
      }

      const lines = generateOpeningLine(matchResult)
      
      expect(Array.isArray(lines)).toBe(true)
    })
  })

  describe('suggestTopics', () => {
    it('should suggest topics based on shared interests', () => {
      const user1Profile = {
        interests: ['旅行', '美食', '音乐'],
        values: ['travel', 'food'],
      }
      const user2Profile = {
        interests: ['旅行', '美食', '电影'],
        values: ['travel', 'food'],
      }

      const topics = suggestTopics(user1Profile, user2Profile)
      
      expect(Array.isArray(topics)).toBe(true)
      expect(topics.length).toBeGreaterThan(0)
    })
  })

  describe('detectSilence', () => {
    it('should detect silence when no messages', () => {
      const messages: any[] = []
      
      const isSilence = detectSilence(messages, 5)
      
      expect(isSilence).toBe(true)
    })

    it('should detect silence after threshold', () => {
      const oldTimestamp = new Date(Date.now() - 10 * 60 * 1000) // 10分钟前
      const messages: any[] = [
        {
          id: '1',
          conversationId: 'conv1',
          senderId: 'user1',
          receiverId: 'user2',
          content: 'Hello',
          type: 'text',
          status: 'read',
          createdAt: oldTimestamp,
        },
      ]
      
      const isSilence = detectSilence(messages, 5) // 5分钟阈值
      
      expect(isSilence).toBe(true)
    })

    it('should not detect silence for recent messages', () => {
      const recentTimestamp = new Date(Date.now() - 1 * 60 * 1000) // 1分钟前
      const messages: any[] = [
        {
          id: '1',
          conversationId: 'conv1',
          senderId: 'user1',
          receiverId: 'user2',
          content: 'Hello',
          type: 'text',
          status: 'read',
          createdAt: recentTimestamp,
        },
      ]
      
      const isSilence = detectSilence(messages, 5)
      
      expect(isSilence).toBe(false)
    })
  })

  describe('generateQuickReplies', () => {
    it('should generate quick replies for questions', () => {
      const lastMessage = '你最喜欢什么电影？'
      
      const replies = generateQuickReplies(lastMessage)
      
      expect(Array.isArray(replies)).toBe(true)
      expect(replies.length).toBeLessThanOrEqual(4)
    })

    it('should return generic replies for unknown message type', () => {
      const lastMessage = '今天天气不错'
      
      const replies = generateQuickReplies(lastMessage)
      
      expect(Array.isArray(replies)).toBe(true)
    })
  })

  describe('filterSensitiveWords', () => {
    it('should filter sensitive words', () => {
      const content = '这个产品真不错'
      
      const result = filterSensitiveWords(content)
      
      expect(result).toHaveProperty('filtered')
      expect(result).toHaveProperty('content')
    })

    it('should not modify clean content', () => {
      const content = '今天天气很好！'
      
      const result = filterSensitiveWords(content)
      
      expect(result.content).toBe(content)
    })
  })

  describe('formatMessage', () => {
    it('should format emoticons', () => {
      const content = '你好:)'
      
      const formatted = formatMessage(content)
      
      expect(formatted).toContain('😊')
    })
  })
})
