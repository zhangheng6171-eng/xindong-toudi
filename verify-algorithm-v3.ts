/**
 * 心动投递 - 匹配算法 V3 快速验证脚本
 */

import { AdvancedMatcherV3, calculateAdvancedMatchV3 } from './src/lib/matching-algorithm-v3'

// 测试数据
const mockPersonality = {
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
  confidenceScore: 88
}

const mockFeatures = {
  explicit: {
    values_mean: 75, values_money: 65, values_family: 80, values_career: 60,
    lifestyle_sleep: 70, lifestyle_spending: 60, family_marriage: 75, family_kids: 70, family_mean: 72
  },
  implicit: {
    values_consistency: 85, emotional_stability: 75, self_awareness: 70,
    relationship_maturity: 78, growth_mindset: 65, authenticity: 80,
    interests: ['冥想', '信仰', '慈善', '心理学', '学习']
  },
  behavioral: {
    totalTimeMs: 300000, avgTimePerQuestionMs: 2500, answerChangeCount: 3,
    skipCount: 2, extremeAnswerCount: 5, neutralAnswerCount: 8,
    completionConsistency: 92, engagementLevel: 'high'
  },
  cross: {},
  risk: { contradictoryAnswers: [], cognitiveDissonance: 15, defensiveness: 20, socialDesirability: 18 },
  reliability: 85
}

const mockAnswers = [
  { questionId: 'q1', dimension: 'values', measuresTrait: 'values_mean', answer: { value: 4 }, questionType: 'likert_5' }
]

// 测试用例
function runTests() {
  console.log('========================================')
  console.log('匹配算法 V3 验证测试')
  console.log('========================================\n')

  // 测试1: 同城匹配
  console.log('【测试1】同城匹配')
  const result1 = calculateAdvancedMatchV3(
    { personality: mockPersonality as any, features: mockFeatures as any, answers: mockAnswers, basicInfo: { age: 28, gender: 'male', city: '北京' } },
    { personality: mockPersonality as any, features: mockFeatures as any, answers: mockAnswers, basicInfo: { age: 25, gender: 'female', city: '北京' } }
  )
  console.log(`- 总分: ${result1.scores.totalScore.toFixed(2)}`)
  console.log(`- 地理位置得分: ${result1.analysis.compatibilityDimensions.location.score}`)
  console.log(`- 同城: ${result1.analysis.compatibilityDimensions.location.sameCity}`)
  console.log(`- 优化标志: ${result1.metadata.optimizationFlags.join(', ')}`)
  console.log('')

  // 测试2: 理想年龄差
  console.log('【测试2】理想年龄差 (男大3岁)')
  const result2 = calculateAdvancedMatchV3(
    { personality: mockPersonality as any, features: mockFeatures as any, answers: mockAnswers, basicInfo: { age: 30, gender: 'male', city: '北京' } },
    { personality: mockPersonality as any, features: mockFeatures as any, answers: mockAnswers, basicInfo: { age: 27, gender: 'female', city: '北京' } }
  )
  console.log(`- 总分: ${result2.scores.totalScore.toFixed(2)}`)
  console.log(`- 年龄匹配得分: ${result2.analysis.compatibilityDimensions.age.score}`)
  console.log(`- 年龄差距: ${result2.analysis.compatibilityDimensions.age.ageGap}岁`)
  console.log(`- 解释: ${result2.analysis.compatibilityDimensions.age.interpretation}`)
  console.log('')

  // 测试3: 价值观高度一致加分
  console.log('【测试3】价值观高度一致加分')
  const highValuesFeatures1 = {
    ...mockFeatures,
    explicit: { values_mean: 80, values_money: 75, values_family: 85, values_career: 70, lifestyle_sleep: 70, lifestyle_spending: 60, family_marriage: 75, family_kids: 70, family_mean: 72 },
    implicit: { ...mockFeatures.implicit, values_consistency: 85 }
  }
  const highValuesFeatures2 = {
    ...mockFeatures,
    explicit: { values_mean: 78, values_money: 73, values_family: 83, values_career: 68, lifestyle_sleep: 68, lifestyle_spending: 58, family_marriage: 73, family_kids: 68, family_mean: 70 },
    implicit: { ...mockFeatures.implicit, values_consistency: 80 }
  }
  const result3 = calculateAdvancedMatchV3(
    { personality: mockPersonality as any, features: highValuesFeatures1 as any, answers: mockAnswers, basicInfo: { age: 28 } },
    { personality: mockPersonality as any, features: highValuesFeatures2 as any, answers: mockAnswers, basicInfo: { age: 26 } }
  )
  console.log(`- 总分: ${result3.scores.totalScore.toFixed(2)}`)
  console.log(`- 价值观得分: ${result3.analysis.coreDimensions.values.score.toFixed(2)}`)
  console.log(`- 是否包含价值观一致性加分: ${result3.metadata.optimizationFlags.includes('values_consistency_bonus')}`)
  console.log('')

  // 测试4: 互补性分析
  console.log('【测试4】互补性分析 - 外向-内向')
  const extrovertPersonality = {
    ...mockPersonality,
    extraversion: { dimension: 'extraversion', rawScore: 32, normalizedScore: 80, percentile: 90, confidence: 0.85, facets: {} }
  }
  const introvertPersonality = {
    ...mockPersonality,
    extraversion: { dimension: 'extraversion', rawScore: 18, normalizedScore: 40, percentile: 25, confidence: 0.8, facets: {} }
  }
  const result4 = calculateAdvancedMatchV3(
    { personality: extrovertPersonality as any, features: mockFeatures as any, answers: mockAnswers, basicInfo: { age: 28 } },
    { personality: introvertPersonality as any, features: mockFeatures as any, answers: mockAnswers, basicInfo: { age: 26 } }
  )
  console.log(`- 总分: ${result4.scores.totalScore.toFixed(2)}`)
  console.log(`- 互补性总分: ${result4.analysis.complementarity.totalBonus}`)
  console.log(`- 平衡性得分: ${result4.analysis.complementarity.balanceScore}`)
  console.log(`- 互补特质数: ${result4.analysis.complementarity.traits.length}`)
  if (result4.analysis.complementarity.traits.length > 0) {
    console.log(`- 第一个互补特质: ${result4.analysis.complementarity.traits[0].trait}`)
    console.log(`- 加分: ${result4.analysis.complementarity.traits[0].bonus}`)
  }
  console.log('')

  // 测试5: 安全型依恋加分
  console.log('【测试5】双安全型依恋加分')
  const result5 = calculateAdvancedMatchV3(
    { personality: mockPersonality as any, features: mockFeatures as any, answers: mockAnswers, basicInfo: { age: 28 } },
    { personality: mockPersonality as any, features: mockFeatures as any, answers: mockAnswers, basicInfo: { age: 26 } }
  )
  const secureAttachment = result5.analysis.complementarity.traits.find(t => t.trait.includes('安全型'))
  console.log(`- 总分: ${result5.scores.totalScore.toFixed(2)}`)
  console.log(`- 是否识别安全型: ${secureAttachment ? '是' : '否'}`)
  if (secureAttachment) {
    console.log(`- 加分: ${secureAttachment.bonus}`)
  }
  console.log('')

  // 测试6: 长期关系预测
  console.log('【测试6】长期关系预测')
  const highAgreeableness = {
    ...mockPersonality,
    agreeableness: { dimension: 'agreeableness', rawScore: 38, normalizedScore: 85, percentile: 95, confidence: 0.9, facets: {} }
  }
  const result6 = calculateAdvancedMatchV3(
    { personality: highAgreeableness as any, features: mockFeatures as any, answers: mockAnswers, basicInfo: { age: 28 } },
    { personality: highAgreeableness as any, features: mockFeatures as any, answers: mockAnswers, basicInfo: { age: 26 } }
  )
  console.log(`- 稳定性分数: ${result6.analysis.longTermPrediction.stabilityScore.toFixed(2)}`)
  console.log(`- 预测满意度: ${result6.analysis.longTermPrediction.predictedSatisfaction.toFixed(2)}`)
  console.log(`- 优势因子数: ${result6.analysis.longTermPrediction.strengthFactors.length}`)
  console.log(`- 风险因子数: ${result6.analysis.longTermPrediction.riskFactors.length}`)
  console.log('')

  // 测试7: 性能测试
  console.log('【测试7】性能测试')
  const iterations = 100
  const startTime = Date.now()
  for (let i = 0; i < iterations; i++) {
    calculateAdvancedMatchV3(
      { personality: mockPersonality as any, features: mockFeatures as any, answers: mockAnswers, basicInfo: { age: 28, gender: 'male', city: '北京' } },
      { personality: mockPersonality as any, features: mockFeatures as any, answers: mockAnswers, basicInfo: { age: 25, gender: 'female', city: '北京' } }
    )
  }
  const elapsed = Date.now() - startTime
  const avgTime = elapsed / iterations
  console.log(`- ${iterations}次计算耗时: ${elapsed}ms`)
  console.log(`- 平均耗时: ${avgTime.toFixed(2)}ms/次`)
  console.log('')

  console.log('========================================')
  console.log('所有测试完成!')
  console.log('========================================')
}

runTests()
