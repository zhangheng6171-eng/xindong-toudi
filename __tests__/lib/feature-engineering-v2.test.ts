/**
 * 特征工程 V2 单元测试
 * 
 * 严格匹配 src/lib/feature-engineering-v2.ts 的接口定义
 */

import {
  AdvancedFeatureExtractor,
  extractAdvancedFeatures,
} from '@/lib/feature-engineering-v2'

describe('Feature Engineering V2', () => {
  // 创建符合接口要求的测试数据
  const createMockAnswers = () => [
    {
      questionId: 'q1',
      questionType: 'single',
      dimension: 'values',
      measuresTrait: 'family_orientation',
      answer: 'high',
      scoringMethod: 'direct',
      options: [],
    },
    {
      questionId: 'q2',
      questionType: 'single',
      dimension: 'big_five_openness',
      measuresTrait: 'openness',
      answer: 80,
      scoringMethod: 'direct',
      options: [],
    },
    {
      questionId: 'q3',
      questionType: 'single',
      dimension: 'big_five_conscientiousness',
      measuresTrait: 'conscientiousness',
      answer: 75,
      scoringMethod: 'direct',
      options: [],
    },
    {
      questionId: 'q4',
      questionType: 'single',
      dimension: 'big_five_extraversion',
      measuresTrait: 'extraversion',
      answer: 60,
      scoringMethod: 'direct',
      options: [],
    },
    {
      questionId: 'q5',
      questionType: 'single',
      dimension: 'big_five_agreeableness',
      measuresTrait: 'agreeableness',
      answer: 85,
      scoringMethod: 'direct',
      options: [],
    },
    {
      questionId: 'q6',
      questionType: 'single',
      dimension: 'big_five_neuroticism',
      measuresTrait: 'neuroticism',
      answer: 30,
      scoringMethod: 'direct',
      options: [],
    },
    {
      questionId: 'q7',
      questionType: 'single',
      dimension: 'attachment',
      measuresTrait: 'attachment_style',
      answer: 'secure',
      scoringMethod: 'factor_based',
      options: [],
    },
    {
      questionId: 'q8',
      questionType: 'single',
      dimension: 'lifestyle',
      measuresTrait: 'morning_person',
      answer: true,
      scoringMethod: 'direct',
      options: [],
    },
  ]

  const createMockBehavioralData = () => ({
    startTime: Date.now() - 5 * 60 * 1000, // 5分钟前
    endTime: Date.now(),
    answerChanges: {
      'q1': { old: 'low', new: 'high' },
    },
    skipHistory: [],
  })

  describe('AdvancedFeatureExtractor', () => {
    it('should create feature extractor with valid data', () => {
      const answers = createMockAnswers()
      const behavioralData = createMockBehavioralData()
      
      const extractor = new AdvancedFeatureExtractor(answers as any, behavioralData)
      expect(extractor).toBeDefined()
    })

    it('should extract all features', () => {
      const answers = createMockAnswers()
      const behavioralData = createMockBehavioralData()
      
      const extractor = new AdvancedFeatureExtractor(answers as any, behavioralData)
      const features = extractor.extractAll()
      
      expect(features).toHaveProperty('explicit')
      expect(features).toHaveProperty('implicit')
      expect(features).toHaveProperty('behavioral')
      expect(features).toHaveProperty('cross')
      expect(features).toHaveProperty('risk')
      expect(features).toHaveProperty('reliability')
    })

    it('should calculate reliability between 0 and 100', () => {
      const answers = createMockAnswers()
      const behavioralData = createMockBehavioralData()
      
      const extractor = new AdvancedFeatureExtractor(answers as any, behavioralData)
      const features = extractor.extractAll()
      
      expect(features.reliability).toBeGreaterThanOrEqual(0)
      expect(features.reliability).toBeLessThanOrEqual(100)
    })
  })

  describe('extractAdvancedFeatures', () => {
    it('should return ExtractedFeatures with all components', () => {
      const answers = createMockAnswers()
      const behavioralData = createMockBehavioralData()
      
      const features = extractAdvancedFeatures(answers as any, behavioralData)
      
      expect(features).toBeDefined()
      expect(typeof features.explicit).toBe('object')
      expect(typeof features.implicit).toBe('object')
      expect(typeof features.behavioral).toBe('object')
      expect(typeof features.cross).toBe('object')
      expect(typeof features.risk).toBe('object')
      expect(typeof features.reliability).toBe('number')
    })

    it('should extract big five personality features', () => {
      const answers = createMockAnswers()
      const behavioralData = createMockBehavioralData()
      
      const features = extractAdvancedFeatures(answers as any, behavioralData)
      
      // Big Five 特征应该在 explicit 中
      expect(features.explicit).toBeDefined()
    })

    it('should calculate behavioral features', () => {
      const answers = createMockAnswers()
      const behavioralData = createMockBehavioralData()
      
      const features = extractAdvancedFeatures(answers as any, behavioralData)
      
      // 验证正确的属性名
      expect(features.behavioral).toHaveProperty('totalTimeMs')
      expect(features.behavioral).toHaveProperty('avgTimePerQuestionMs')
      expect(features.behavioral).toHaveProperty('answerChangeCount')
      expect(features.behavioral).toHaveProperty('skipCount')
      expect(features.behavioral).toHaveProperty('engagementLevel')
    })

    it('should handle empty skip history', () => {
      const answers = createMockAnswers()
      const behavioralData = {
        ...createMockBehavioralData(),
        skipHistory: [],
      }
      
      const features = extractAdvancedFeatures(answers as any, behavioralData)
      
      expect(features).toBeDefined()
      expect(features.behavioral.skipCount).toBe(0)
    })

    it('should detect answer changes', () => {
      const answers = createMockAnswers()
      const behavioralData = {
        ...createMockBehavioralData(),
        answerChanges: {
          'q1': { old: 'low', new: 'high' },
          'q2': { old: 50, new: 80 },
        },
      }
      
      const features = extractAdvancedFeatures(answers as any, behavioralData)
      
      expect(features).toBeDefined()
      expect(features.behavioral.answerChangeCount).toBeGreaterThan(0)
    })

    it('should handle multiple answers', () => {
      const answers = createMockAnswers()
      const behavioralData = createMockBehavioralData()
      
      const features = extractAdvancedFeatures(answers as any, behavioralData)
      
      expect(features).toBeDefined()
    })

    it('should have risk features', () => {
      const answers = createMockAnswers()
      const behavioralData = createMockBehavioralData()
      
      const features = extractAdvancedFeatures(answers as any, behavioralData)
      
      expect(features.risk).toHaveProperty('contradictoryAnswers')
      expect(features.risk).toHaveProperty('cognitiveDissonance')
      expect(features.risk).toHaveProperty('defensiveness')
      expect(features.risk).toHaveProperty('socialDesirability')
    })

    it('should have engagement level', () => {
      const answers = createMockAnswers()
      const behavioralData = createMockBehavioralData()
      
      const features = extractAdvancedFeatures(answers as any, behavioralData)
      
      expect(['high', 'medium', 'low']).toContain(features.behavioral.engagementLevel)
    })
  })
})
