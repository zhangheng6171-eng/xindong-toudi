/**
 * 匹配算法 V2 单元测试
 * 
 * 严格匹配 src/lib/matching-algorithm-v2.ts 的接口定义
 */

import {
  calculateAdvancedMatch,
  AdvancedMatcherV2,
} from '@/lib/matching-algorithm-v2'

describe('Matching Algorithm V2', () => {
  // 创建符合 DimensionScore 接口的数据
  const createDimensionScore = (score: number) => ({
    dimension: 'test',
    rawScore: score,
    normalizedScore: score, // T-score
    percentile: score,
  })

  // 创建符合 PersonalityProfile 接口的完整用户数据
  const createMockUserProfile = (id: string) => ({
    personality: {
      // 大五人格 - 使用 DimensionScore
      openness: createDimensionScore(80),
      conscientiousness: createDimensionScore(75),
      extraversion: createDimensionScore(60),
      agreeableness: createDimensionScore(85),
      neuroticism: createDimensionScore(30),
      
      // 依恋风格
      attachmentStyle: 'secure' as const,
      attachmentAnxiety: 25,
      attachmentAvoidance: 20,
      
      // 价值观
      valuesProfile: {
        family: 90,
        career: 85,
        growth: 80,
        health: 75,
      },
      dominantValueType: 'family',
      
      // 元数据
      questionnaireCompleted: true,
      questionsAnswered: 66,
      completenessScore: 100,
    },
    features: {
      explicit: {
        values_mean: 80,
        personality_mean: 75,
        lifestyle_mean: 70,
        interests_mean: 85,
        relationship_mean: 78,
        emotional_mean: 72,
        social_mean: 68,
        career_mean: 82,
        family_mean: 88,
        financial_mean: 70,
        health_mean: 75,
        growth_mean: 80,
        adventure_mean: 65,
        tradition_mean: 60,
        spirituality_mean: 55,
      },
      implicit: {
        cognitive_style: 75,
        emotional_style: 80,
        social_style: 70,
        decision_style: 72,
        conflict_style: 68,
        intimacy_style: 85,
      },
      behavioral: {
        totalTimeMs: 300000,
        avgTimePerQuestionMs: 4500,
        answerChangeCount: 2,
        skipCount: 0,
        extremeAnswerCount: 5,
        neutralAnswerCount: 3,
        completionConsistency: 95,
        engagementLevel: 'high' as const,
      },
      cross: {
        openness_x_adventure: 80,
        conscientiousness_x_career: 85,
        agreeableness_x_family: 90,
      },
      risk: {
        contradictoryAnswers: [],
        cognitiveDissonance: 15,
        defensiveness: 10,
        socialDesirability: 20,
      },
      reliability: 92,
    },
    answers: [
      { questionId: 'q1', dimension: 'values', answer: 'family', measuresTrait: 'family' },
      { questionId: 'q2', dimension: 'dealbreaker', answer: 'no_smoking', measuresTrait: 'dealbreaker' },
    ],
  })

  describe('AdvancedMatcherV2', () => {
    it('should create matcher with default config', () => {
      const matcher = new AdvancedMatcherV2()
      expect(matcher).toBeDefined()
    })

    it('should create matcher with custom config', () => {
      const config = {
        hardFilter: {
          enableDealbreakerFilter: true,
          dealbreakerMatchThreshold: 0.8,
        },
      }
      const matcher = new AdvancedMatcherV2(config)
      expect(matcher).toBeDefined()
    })

    it('should merge custom config with defaults', () => {
      const matcher = new AdvancedMatcherV2({
        hardFilter: {
          enableDealbreakerFilter: false,
          dealbreakerMatchThreshold: 0.7,
        },
      })
      expect(matcher).toBeDefined()
    })
  })

  describe('calculateAdvancedMatch', () => {
    it('should return valid MatchingResult', () => {
      const user1 = createMockUserProfile('user1')
      const user2 = createMockUserProfile('user2')
      
      const result = calculateAdvancedMatch(user1 as any, user2 as any)
      
      expect(result).toBeDefined()
      expect(result).toHaveProperty('userId')
      expect(result).toHaveProperty('matchedUserId')
      expect(result).toHaveProperty('scores')
      expect(result).toHaveProperty('analysis')
      expect(result).toHaveProperty('explanation')
    })

    it('should return score between 0 and 100', () => {
      const user1 = createMockUserProfile('user1')
      const user2 = createMockUserProfile('user2')
      
      const result = calculateAdvancedMatch(user1 as any, user2 as any)
      
      expect(result.scores.totalScore).toBeGreaterThanOrEqual(0)
      expect(result.scores.totalScore).toBeLessThanOrEqual(100)
    })

    it('should have all score components', () => {
      const user1 = createMockUserProfile('user1')
      const user2 = createMockUserProfile('user2')
      
      const result = calculateAdvancedMatch(user1 as any, user2 as any)
      
      expect(result.scores).toHaveProperty('hardFilter')
      expect(result.scores).toHaveProperty('coreMatch')
      expect(result.scores).toHaveProperty('compatibilityMatch')
      expect(result.scores).toHaveProperty('complementarityBonus')
      expect(result.scores).toHaveProperty('longTermPotential')
      expect(result.scores).toHaveProperty('totalScore')
    })

    it('should have analysis data', () => {
      const user1 = createMockUserProfile('user1')
      const user2 = createMockUserProfile('user2')
      
      const result = calculateAdvancedMatch(user1 as any, user2 as any)
      
      expect(result.analysis).toHaveProperty('coreDimensions')
      expect(result.analysis).toHaveProperty('compatibilityDimensions')
      expect(result.analysis).toHaveProperty('complementarity')
      expect(result.analysis).toHaveProperty('longTermPrediction')
    })

    it('should return explanation object with strengths and challenges', () => {
      const user1 = createMockUserProfile('user1')
      const user2 = createMockUserProfile('user2')
      
      const result = calculateAdvancedMatch(user1 as any, user2 as any)
      
      // explanation 是对象，包含 strengths 和 challenges
      expect(result.explanation).toHaveProperty('strengths')
      expect(result.explanation).toHaveProperty('challenges')
      expect(Array.isArray(result.explanation.strengths)).toBe(true)
      expect(Array.isArray(result.explanation.challenges)).toBe(true)
    })

    it('should handle similar profiles with reasonable score', () => {
      const user1 = createMockUserProfile('user1')
      const user2 = createMockUserProfile('user2')
      
      const result = calculateAdvancedMatch(user1 as any, user2 as any)
      
      // 相似用户应该获得合理的匹配分数
      expect(result.scores.totalScore).toBeGreaterThan(40)
    })

    it('should pass hard filter for compatible users', () => {
      const user1 = createMockUserProfile('user1')
      const user2 = createMockUserProfile('user2')
      
      const result = calculateAdvancedMatch(user1 as any, user2 as any)
      
      expect(result.scores.hardFilter).toBe('passed')
    })

    it('should have positive core match score', () => {
      const user1 = createMockUserProfile('user1')
      const user2 = createMockUserProfile('user2')
      
      const result = calculateAdvancedMatch(user1 as any, user2 as any)
      
      expect(result.scores.coreMatch).toBeGreaterThan(0)
    })

    it('should have compatibility match score', () => {
      const user1 = createMockUserProfile('user1')
      const user2 = createMockUserProfile('user2')
      
      const result = calculateAdvancedMatch(user1 as any, user2 as any)
      
      expect(result.scores.compatibilityMatch).toBeGreaterThanOrEqual(0)
    })
  })
})
