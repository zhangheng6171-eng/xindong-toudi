/**
 * 聊天辅助功能单元测试
 * 
 * 严格匹配 src/lib/chat-helpers.ts 的接口定义
 */

import {
  generateOpeningLines,
  generateTopicSuggestions,
  detectSilence,
  analyzeSentiment,
  getTruthQuestions,
  getCompatibilityQuestions,
  calculateCompatibility,
} from '@/lib/chat-helpers'

describe('Chat Helpers', () => {
  // 完整的测试数据，严格匹配源代码接口
  const mockUserProfile = {
    id: 'user1',
    name: '测试用户',
    age: 28,
    city: '北京',
    interests: ['旅行', '美食', '音乐'],
    values: ['family', 'growth'],
    lifestyle: { morningPerson: true },
    personality: { openness: 80 },
  }

  const mockMatchContext = {
    matchScore: 92,
    commonInterests: ['旅行', '美食'],
    sharedValues: ['family', 'growth'],
    lifestyleMatch: ['morningPerson'],
    personalityMatch: 'high',
    matchReasons: ['价值观契合', '性格互补'],
  }

  const mockChatMessage = {
    id: 'msg1',
    senderId: 'user1',
    content: '你好！',
    timestamp: new Date(),
    type: 'text' as const,
  }

  describe('generateOpeningLines', () => {
    it('should generate opening lines with valid profiles', () => {
      const userA = { ...mockUserProfile, id: 'userA' }
      const userB = { ...mockUserProfile, id: 'userB' }
      
      const lines = generateOpeningLines(userA, userB, mockMatchContext)
      
      expect(Array.isArray(lines)).toBe(true)
    })

    it('should return OpeningLine objects with correct properties', () => {
      const userA = { ...mockUserProfile, id: 'userA' }
      const userB = { ...mockUserProfile, id: 'userB' }
      
      const lines = generateOpeningLines(userA, userB, mockMatchContext)
      
      if (lines.length > 0) {
        expect(lines[0]).toHaveProperty('text')
        expect(lines[0]).toHaveProperty('type')
        expect(lines[0]).toHaveProperty('confidence')
        expect(lines[0]).toHaveProperty('reason')
      }
    })
  })

  describe('generateTopicSuggestions', () => {
    it('should generate topic suggestions', () => {
      const context = {
        messages: [],
        userA: mockUserProfile,
        userB: { ...mockUserProfile, id: 'user2' },
        matchContext: mockMatchContext,
        startTime: new Date(),
      }

      const topics = generateTopicSuggestions(context)
      
      expect(Array.isArray(topics)).toBe(true)
    })

    it('should return limited number of topics', () => {
      const context = {
        messages: [],
        userA: mockUserProfile,
        userB: { ...mockUserProfile, id: 'user2' },
        matchContext: mockMatchContext,
        startTime: new Date(),
      }

      const topics = generateTopicSuggestions(context, 3)
      
      expect(topics.length).toBeLessThanOrEqual(3)
    })
  })

  describe('detectSilence', () => {
    it('should detect silence with no messages', () => {
      const context = {
        messages: [],
        userA: mockUserProfile,
        userB: mockUserProfile,
        matchContext: mockMatchContext,
        startTime: new Date(),
      }

      const result = detectSilence(context)
      
      expect(result).toHaveProperty('isSilent')
      expect(result).toHaveProperty('silenceLevel')
      expect(result).toHaveProperty('duration')
      expect(result).toHaveProperty('suggestedAction')
    })

    it('should detect silence after long gap', () => {
      const oldMessage = {
        ...mockChatMessage,
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15分钟前
      }
      
      const context = {
        messages: [oldMessage],
        userA: mockUserProfile,
        userB: mockUserProfile,
        matchContext: mockMatchContext,
        startTime: new Date(Date.now() - 30 * 60 * 1000),
      }

      const result = detectSilence(context)
      
      expect(result.duration).toBeGreaterThan(10)
    })

    it('should not detect silence for recent messages', () => {
      const recentMessage = {
        ...mockChatMessage,
        timestamp: new Date(Date.now() - 1 * 60 * 1000), // 1分钟前
      }
      
      const context = {
        messages: [recentMessage],
        userA: mockUserProfile,
        userB: mockUserProfile,
        matchContext: mockMatchContext,
        startTime: new Date(Date.now() - 5 * 60 * 1000),
      }

      const result = detectSilence(context)
      
      expect(result.duration).toBeLessThan(10)
    })
  })

  describe('analyzeSentiment', () => {
    it('should analyze sentiment of messages', () => {
      const messages = [
        {
          ...mockChatMessage,
          content: '太棒了！哈哈，好开心！',
        },
      ]

      const sentiment = analyzeSentiment(messages)
      
      expect(sentiment).toHaveProperty('tone')
      expect(sentiment).toHaveProperty('emotions')
      expect(sentiment).toHaveProperty('suggestions')
      expect(['positive', 'neutral', 'negative']).toContain(sentiment.tone)
    })

    it('should return neutral sentiment for empty messages', () => {
      const sentiment = analyzeSentiment([])
      
      expect(sentiment.tone).toBe('neutral')
    })

    it('should detect positive sentiment', () => {
      const messages = [
        {
          ...mockChatMessage,
          content: '哈哈太棒了！好开心！喜欢！',
        },
      ]

      const sentiment = analyzeSentiment(messages)
      
      expect(sentiment.tone).toBe('positive')
    })
  })

  describe('getTruthQuestions', () => {
    it('should generate truth questions', () => {
      const questions = getTruthQuestions(3)
      
      expect(Array.isArray(questions)).toBe(true)
      expect(questions.length).toBeLessThanOrEqual(3)
    })

    it('should return questions with required properties', () => {
      const questions = getTruthQuestions(2)
      
      questions.forEach(q => {
        expect(q).toHaveProperty('id')
        expect(q).toHaveProperty('question')
        expect(q).toHaveProperty('category')
      })
    })
  })

  describe('getCompatibilityQuestions', () => {
    it('should generate compatibility quiz', () => {
      const quiz = getCompatibilityQuestions(3)
      
      expect(Array.isArray(quiz)).toBe(true)
      expect(quiz.length).toBe(3)
    })

    it('should return questions with options', () => {
      const quiz = getCompatibilityQuestions(2)
      
      quiz.forEach(q => {
        expect(q).toHaveProperty('id')
        expect(q).toHaveProperty('question')
        expect(q).toHaveProperty('options')
        expect(Array.isArray(q.options)).toBe(true)
      })
    })
  })

  describe('calculateCompatibility', () => {
    it('should calculate compatibility score', () => {
      const answers1 = { q1: 'a', q2: 'b' }
      const answers2 = { q1: 'a', q2: 'b' }
      
      const result = calculateCompatibility(answers1, answers2)
      
      expect(result).toHaveProperty('score')
      expect(result).toHaveProperty('matches')
      expect(result).toHaveProperty('differences')
      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(100)
    })

    it('should return 100 for identical answers', () => {
      const answers = { q1: 'a', q2: 'b', q3: 'c' }
      
      const result = calculateCompatibility(answers, answers)
      
      expect(result.score).toBe(100)
    })

    it('should return lower score for different answers', () => {
      const answers1 = { q1: 'a', q2: 'b', q3: 'c' }
      const answers2 = { q1: 'x', q2: 'y', q3: 'z' }
      
      const result = calculateCompatibility(answers1, answers2)
      
      expect(result.score).toBeLessThan(50)
    })
  })
})
