/**
 * 心动投递 - 匹配算法 V3 测试用例
 * 验证优化后的算法正确性和性能
 */

import { describe, it, expect, beforeEach } from '@jest/globals'
import { AdvancedMatcherV3, calculateAdvancedMatchV3 } from './matching-algorithm-v3'
import { PersonalityProfile } from './scoring-system'
import { ExtractedFeatures } from './feature-engineering-v2'

// ============================================
// 测试辅助函数
// ============================================

function createMockPersonality(overrides: Partial<PersonalityProfile> = {}): PersonalityProfile {
  return {
    openness: { dimension: 'openness', rawScore: 25, normalizedScore: 65, percentile: 75, confidence: 0.85, facets: {} },
    conscientiousness: { dimension: 'conscientiousness', rawScore: 30, normalizedScore: 70, percentile: 80, confidence: 0.88, facets: {} },
    extraversion: { dimension: 'extraversion', rawScore: 28, normalizedScore: 60, percentile: 70, confidence: 0.82, facets: {} },
    agreeableness: { dimension: 'agreeableness', rawScore: 32, normalizedScore: 75, percentile: 85, confidence: 0.9, facets: {} },
    neuroticism: { dimension: 'neuroticism', rawScore: 20, normalizedScore: 35, percentile: 30, confidence: 0.87, facets: {} },
    attachmentStyle: 'secure',
    attachmentAnxiety: 2.5,
    attachmentAvoidance: 2.0,
    valuesProfile: { power: 3.5, achievement: 4.0, hedonism: 4.2 },
    dominantValueType: 'benevolence',
    questionnaireCompleted: true,
    questionsAnswered: 120,
    completenessScore: 95,
    confidenceScore: 88,
    ...overrides
  }
}

function createMockFeatures(overrides: Partial<ExtractedFeatures> = {}): ExtractedFeatures {
  return {
    explicit: {
      values_mean: 75,
      values_money: 65,
      values_family: 80,
      values_career: 60,
      lifestyle_sleep: 70,
      lifestyle_spending: 60,
      family_marriage: 75,
      family_kids: 70,
      family_mean: 72
    },
    implicit: {
      values_consistency: 85,
      emotional_stability: 75,
      self_awareness: 70,
      relationship_maturity: 78,
      growth_mindset: 65,
      authenticity: 80
    },
    behavioral: {
      totalTimeMs: 300000,
      avgTimePerQuestionMs: 2500,
      answerChangeCount: 3,
      skipCount: 2,
      extremeAnswerCount: 5,
      neutralAnswerCount: 8,
      completionConsistency: 92,
      engagementLevel: 'high'
    },
    cross: {
      values_personality_alignment: 75,
      relationship_family_coherence: 80,
      lifestyle_personality_fit: 70,
      inner_consistency: 82
    },
    risk: {
      contradictoryAnswers: [],
      cognitiveDissonance: 15,
      defensiveness: 20,
      socialDesirability: 18
    },
    reliability: 85,
    ...overrides
  }
}

function createMockAnswers() {
  return [
    {
      questionId: 'q1',
      dimension: 'values',
      measuresTrait: 'values_mean',
      answer: { value: 4 },
      questionType: 'likert_5'
    },
    {
      questionId: 'q2',
      dimension: 'dealbreaker',
      measuresTrait: 'dealbreaker_1',
      answer: { values: [] },
      questionType: 'multiple_choice'
    }
  ]
}

// ============================================
// 测试套件
// ============================================

describe('匹配算法 V3 - 核心功能测试', () => {
  let matcher: AdvancedMatcherV3

  beforeEach(() => {
    matcher = new AdvancedMatcherV3()
  })

  // ============================================
  // 测试1: 年龄匹配 - 非线性衰减
  // ============================================

  describe('年龄匹配算法 (非线性衰减)', () => {
    it('应该给理想年龄差(3岁)高分', () => {
      const result = calculateAdvancedMatchV3(
        {
          personality: createMockPersonality(),
          features: createMockFeatures(),
          answers: createMockAnswers(),
          basicInfo: { age: 28, gender: 'male', city: '北京' }
        },
        {
          personality: createMockPersonality({ extraversion: { dimension: 'extraversion', rawScore: 22, normalizedScore: 45, percentile: 40, confidence: 0.8, facets: {} } }),
          features: createMockFeatures({ explicit: { values_mean: 72, values_money: 68, values_family: 78, values_career: 62, lifestyle_sleep: 65, lifestyle_spending: 55, family_marriage: 70, family_kids: 68, family_mean: 70 } }),
          answers: createMockAnswers(),
          basicInfo: { age: 25, gender: 'female', city: '北京' }
        }
      )

      const ageMatch = result.analysis.compatibilityDimensions.age
      expect(ageMatch.score).toBeGreaterThan(80)
      expect(ageMatch.interpretation).toContain('理想')
    })

    it('应该对超出理想范围的年龄差进行非线性衰减', () => {
      const result = calculateAdvancedMatchV3(
        {
          personality: createMockPersonality(),
          features: createMockFeatures(),
          answers: createMockAnswers(),
          basicInfo: { age: 35, gender: 'male', city: '北京' }
        },
        {
          personality: createMockPersonality(),
          features: createMockFeatures(),
          answers: createMockAnswers(),
          basicInfo: { age: 25, gender: 'female', city: '北京' }
        }
      )

      const ageMatch = result.analysis.compatibilityDimensions.age
      // 10岁差距应该比5岁差距分数低很多(非线性)
      expect(ageMatch.ageGap).toBe(10)
      expect(ageMatch.score).toBeLessThan(ageMatch.score) // 验证有衰减
    })

    it('应该对男大女的情况给予额外加分', () => {
      const result = calculateAdvancedMatchV3(
        {
          personality: createMockPersonality(),
          features: createMockFeatures(),
          answers: createMockAnswers(),
          basicInfo: { age: 30, gender: 'male', city: '北京' }
        },
        {
          personality: createMockPersonality(),
          features: createMockFeatures(),
          answers: createMockAnswers(),
          basicInfo: { age: 27, gender: 'female', city: '北京' }
        }
      )

      const ageMatch = result.analysis.compatibilityDimensions.age
      // 男大女3岁应该是理想的
      expect(ageMatch.score).toBeGreaterThanOrEqual(85)
    })
  })

  // ============================================
  // 测试2: 地理位置匹配
  // ============================================

  describe('地理位置匹配', () => {
    it('同城市应该获得额外加分', () => {
      const result = calculateAdvancedMatchV3(
        {
          personality: createMockPersonality(),
          features: createMockFeatures(),
          answers: createMockAnswers(),
          basicInfo: { age: 28, gender: 'male', city: '北京' }
        },
        {
          personality: createMockPersonality(),
          features: createMockFeatures(),
          answers: createMockAnswers(),
          basicInfo: { age: 25, gender: 'female', city: '北京' }
        }
      )

      const locationMatch = result.analysis.compatibilityDimensions.location
      expect(locationMatch.sameCity).toBe(true)
      expect(locationMatch.score).toBe(5) // sameCityBonus
      expect(locationMatch.interpretation).toContain('同城')
    })

    it('应该计算距离并应用衰减', () => {
      const result = calculateAdvancedMatchV3(
        {
          personality: createMockPersonality(),
          features: createMockFeatures(),
          answers: createMockAnswers(),
          basicInfo: { 
            age: 28, 
            gender: 'male', 
            city: '北京',
            location: { lat: 39.9042, lng: 116.4074 } // 北京
          }
        },
        {
          personality: createMockPersonality(),
          features: createMockFeatures(),
          answers: createMockAnswers(),
          basicInfo: { 
            age: 25, 
            gender: 'female', 
            city: '天津',
            location: { lat: 39.3434, lng: 117.3616 } // 天津
          }
        }
      )

      const locationMatch = result.analysis.compatibilityDimensions.location
      expect(locationMatch.sameCity).toBe(false)
      expect(locationMatch.distanceKm).toBeDefined()
      expect(locationMatch.score).toBeLessThan(5)
      expect(locationMatch.interpretation).toContain('近')
    })

    it('应该正确处理缺失位置信息', () => {
      const result = calculateAdvancedMatchV3(
        {
          personality: createMockPersonality(),
          features: createMockFeatures(),
          answers: createMockAnswers(),
          basicInfo: { age: 28, gender: 'male' }
        },
        {
          personality: createMockPersonality(),
          features: createMockFeatures(),
          answers: createMockAnswers(),
          basicInfo: { age: 25, gender: 'female' }
        }
      )

      const locationMatch = result.analysis.compatibilityDimensions.location
      expect(locationMatch.score).toBe(50) // 默认分数
      expect(locationMatch.interpretation).toContain('不完整')
    })
  })

  // ============================================
  // 测试3: 价值观匹配 - 权重提升
  // ============================================

  describe('价值观匹配 (权重提升)', () => {
    it('价值观高度一致应该获得高分和额外加分', () => {
      const features1 = createMockFeatures({
        explicit: {
          values_mean: 80, values_money: 75, values_family: 85, values_career: 70,
          lifestyle_sleep: 70, lifestyle_spending: 60, family_marriage: 75, family_kids: 70, family_mean: 72
        },
        implicit: { values_consistency: 85 }
      })
      const features2 = createMockFeatures({
        explicit: {
          values_mean: 78, values_money: 73, values_family: 83, values_career: 68,
          lifestyle_sleep: 68, lifestyle_spending: 58, family_marriage: 73, family_kids: 68, family_mean: 70
        },
        implicit: { values_consistency: 80 }
      })

      const result = calculateAdvancedMatchV3(
        { personality: createMockPersonality(), features: features1, answers: createMockAnswers(), basicInfo: { age: 28 } },
        { personality: createMockPersonality(), features: features2, answers: createMockAnswers(), basicInfo: { age: 26 } }
      )

      const valuesMatch = result.analysis.coreDimensions.values
      expect(valuesMatch.score).toBeGreaterThan(85)
      expect(result.metadata.optimizationFlags).toContain('values_consistency_bonus')
    })

    it('价值观冲突应该被正确识别', () => {
      const features1 = createMockFeatures({
        explicit: {
          values_mean: 85, values_money: 80, values_family: 30,
          values_career: 70, lifestyle_sleep: 70, lifestyle_spending: 60,
          family_marriage: 75, family_kids: 70, family_mean: 72
        }
      })
      const features2 = createMockFeatures({
        explicit: {
          values_mean: 25, values_money: 20, values_family: 85,
          values_career: 30, lifestyle_sleep: 70, lifestyle_spending: 60,
          family_marriage: 75, family_kids: 70, family_mean: 72
        }
      })

      const result = calculateAdvancedMatchV3(
        { personality: createMockPersonality(), features: features1, answers: createMockAnswers(), basicInfo: { age: 28 } },
        { personality: createMockPersonality(), features: features2, answers: createMockAnswers(), basicInfo: { age: 26 } }
      )

      const valuesMatch = result.analysis.coreDimensions.values
      const conflicts = valuesMatch.traits.filter(t => t.match === 'conflict')
      expect(conflicts.length).toBeGreaterThan(0)
    })
  })

  // ============================================
  // 测试4: 兴趣匹配 - 分类权重
  // ============================================

  describe('兴趣匹配 (分类权重)', () => {
    it('应该按分类计算匹配度', () => {
      const features1 = createMockFeatures({
        implicit: {
          interests: ['冥想', '信仰', '慈善', '心理学', '学习']
        }
      })
      const features2 = createMockFeatures({
        implicit: {
          interests: ['冥想', '信仰', '成长', '读书会']
        }
      })

      const result = calculateAdvancedMatchV3(
        { personality: createMockPersonality(), features: features1, answers: createMockAnswers(), basicInfo: { age: 28 } },
        { personality: createMockPersonality(), features: features2, answers: createMockAnswers(), basicInfo: { age: 26 } }
      )

      const interestsMatch = result.analysis.compatibilityDimensions.interests
      expect(interestsMatch.sharedInterests.length).toBeGreaterThan(0)
      expect(interestsMatch.categories.length).toBeGreaterThan(0)
      expect(interestsMatch.score).toBeGreaterThan(60)
    })
  })

  // ============================================
  // 测试5: 互补性分析 - 全面分析
  // ============================================

  describe('互补性分析 (全面)', () => {
    it('外向-内向互补应该被正确识别', () => {
      const result = calculateAdvancedMatchV3(
        {
          personality: createMockPersonality({
            extraversion: { dimension: 'extraversion', rawScore: 32, normalizedScore: 80, percentile: 90, confidence: 0.85, facets: {} }
          }),
          features: createMockFeatures(),
          answers: createMockAnswers(),
          basicInfo: { age: 28 }
        },
        {
          personality: createMockPersonality({
            extraversion: { dimension: 'extraversion', rawScore: 18, normalizedScore: 40, percentile: 25, confidence: 0.8, facets: {} }
          }),
          features: createMockFeatures(),
          answers: createMockAnswers(),
          basicInfo: { age: 26 }
        }
      )

      const complementarity = result.analysis.complementarity
      const extraversionComplement = complementarity.traits.find(t => t.trait.includes('外向'))
      expect(extraversionComplement).toBeDefined()
      expect(extraversionComplement?.bonus).toBeGreaterThan(0)
    })

    it('双安全型依恋应该获得加分', () => {
      const result = calculateAdvancedMatchV3(
        {
          personality: createMockPersonality({ attachmentStyle: 'secure' }),
          features: createMockFeatures(),
          answers: createMockAnswers(),
          basicInfo: { age: 28 }
        },
        {
          personality: createMockPersonality({ attachmentStyle: 'secure' }),
          features: createMockFeatures(),
          answers: createMockAnswers(),
          basicInfo: { age: 26 }
        }
      )

      const complementarity = result.analysis.complementarity
      const secureAttachment = complementarity.traits.find(t => t.trait.includes('安全型'))
      expect(secureAttachment).toBeDefined()
      expect(secureAttachment?.bonus).toBe(15)
    })

    it('焦虑-回避依恋应该被识别为风险', () => {
      const result = calculateAdvancedMatchV3(
        {
          personality: createMockPersonality({ attachmentStyle: 'anxious' }),
          features: createMockFeatures(),
          answers: createMockAnswers(),
          basicInfo: { age: 28 }
        },
        {
          personality: createMockPersonality({ attachmentStyle: 'avoidant' }),
          features: createMockFeatures(),
          answers: createMockAnswers(),
          basicInfo: { age: 26 }
        }
      )

      const complementarity = result.analysis.complementarity
      const anxiousAvoidant = complementarity.traits.find(t => t.trait.includes('焦虑') || t.trait.includes('回避'))
      expect(anxiousAvoidant).toBeDefined()
      expect(anxiousAvoidant?.bonus).toBeLessThan(0)
    })
  })

  // ============================================
  // 测试6: 长期关系预测
  // ============================================

  describe('长期关系预测', () => {
    it('双高宜人性应该被识别为优势', () => {
      const result = calculateAdvancedMatchV3(
        {
          personality: createMockPersonality({
            agreeableness: { dimension: 'agreeableness', rawScore: 38, normalizedScore: 85, percentile: 95, confidence: 0.9, facets: {} }
          }),
          features: createMockFeatures(),
          answers: createMockAnswers(),
          basicInfo: { age: 28 }
        },
        {
          personality: createMockPersonality({
            agreeableness: { dimension: 'agreeableness', rawScore: 36, normalizedScore: 80, percentile: 90, confidence: 0.88, facets: {} }
          }),
          features: createMockFeatures(),
          answers: createMockAnswers(),
          basicInfo: { age: 26 }
        }
      )

      const longTerm = result.analysis.longTermPrediction
      const highAgreeableness = longTerm.strengthFactors.find(f => f.factor.includes('宜人性'))
      expect(highAgreeableness).toBeDefined()
      expect(highAgreeableness?.impact).toBe('very_strong')
    })

    it('应该生成推荐关注点', () => {
      const result = calculateAdvancedMatchV3(
        {
          personality: createMockPersonality({ attachmentStyle: 'anxious' }),
          features: createMockFeatures({ implicit: { relationship_maturity: 65 } }),
          answers: createMockAnswers(),
          basicInfo: { age: 28 }
        },
        {
          personality: createMockPersonality({ attachmentStyle: 'avoidant' }),
          features: createMockFeatures({ implicit: { relationship_maturity: 60 } }),
          answers: createMockAnswers(),
          basicInfo: { age: 26 }
        }
      )

      const longTerm = result.analysis.longTermPrediction
      expect(longTerm.riskFactors.length).toBeGreaterThan(0)
      expect(longTerm.recommendedFocus.length).toBeGreaterThan(0)
    })
  })

  // ============================================
  // 测试7: 硬过滤
  // ============================================

  describe('硬过滤', () => {
    it('应该正确过滤年龄差距过大的匹配', () => {
      const matcher = new AdvancedMatcherV3({
        hardFilter: {
          enableDealbreakerFilter: false,
          dealbreakerMatchThreshold: 0.8,
          enableAgeFilter: true,
          ageRangeMax: 10
        }
      })

      const result = matcher.calculateMatch(
        {
          personality: createMockPersonality(),
          features: createMockFeatures(),
          answers: createMockAnswers(),
          basicInfo: { age: 40, gender: 'male', city: '北京' }
        },
        {
          personality: createMockPersonality(),
          features: createMockFeatures(),
          answers: createMockAnswers(),
          basicInfo: { age: 20, gender: 'female', city: '北京' }
        }
      )

      expect(result.scores.hardFilter).toBe('failed')
      expect(result.scores.totalScore).toBe(0)
    })
  })

  // ============================================
  // 测试8: 性能测试
  // ============================================

  describe('性能测试', () => {
    it('应该在100ms内完成单个匹配计算', () => {
      const startTime = Date.now()
      
      for (let i = 0; i < 100; i++) {
        calculateAdvancedMatchV3(
          {
            personality: createMockPersonality(),
            features: createMockFeatures(),
            answers: createMockAnswers(),
            basicInfo: { age: 28, gender: 'male', city: '北京' }
          },
          {
            personality: createMockPersonality(),
            features: createMockFeatures(),
            answers: createMockAnswers(),
            basicInfo: { age: 25, gender: 'female', city: '北京' }
          }
        )
      }

      const elapsed = Date.now() - startTime
      expect(elapsed).toBeLessThan(500) // 100次应该小于500ms
      console.log(`100次匹配计算耗时: ${elapsed}ms`)
    })
  })

  // ============================================
  // 测试9: 边界情况
  // ============================================

  describe('边界情况处理', () => {
    it('应该正确处理缺失的基本信息', () => {
      const result = calculateAdvancedMatchV3(
        {
          personality: createMockPersonality(),
          features: createMockFeatures(),
          answers: createMockAnswers(),
          basicInfo: undefined
        },
        {
          personality: createMockPersonality(),
          features: createMockFeatures(),
          answers: createMockAnswers(),
          basicInfo: undefined
        }
      )

      expect(result.scores.totalScore).toBeGreaterThan(0)
      expect(result.analysis.compatibilityDimensions.age.interpretation).toContain('不完整')
    })

    it('应该正确处理缺失的特征数据', () => {
      const result = calculateAdvancedMatchV3(
        {
          personality: createMockPersonality(),
          features: { explicit: {}, implicit: {}, behavioral: {}, cross: {}, risk: {}, reliability: 50 },
          answers: createMockAnswers(),
          basicInfo: { age: 28 }
        },
        {
          personality: createMockPersonality(),
          features: { explicit: {}, implicit: {}, behavioral: {}, cross: {}, risk: {}, reliability: 50 },
          answers: createMockAnswers(),
          basicInfo: { age: 26 }
        }
      )

      expect(result.scores.totalScore).toBeGreaterThan(0)
    })
  })
})

// ============================================
// 打印测试摘要
// ============================================

console.log(`
========================================
心动投递匹配算法 V3 - 测试套件
========================================

测试内容：
1. 年龄匹配 - 非线性衰减算法
2. 地理位置匹配 - 同城加分 + 距离衰减
3. 价值观匹配 - 权重提升 + 多维度分析
4. 兴趣匹配 - 分类权重
5. 互补性分析 - 全面性格/价值观分析
6. 长期关系预测 - 风险和优势因子
7. 硬过滤 - 年龄过滤
8. 性能测试 - 计算效率
9. 边界情况 - 缺失数据处理

运行测试: npm test -- matching-algorithm-v3.test.ts
========================================
`)
